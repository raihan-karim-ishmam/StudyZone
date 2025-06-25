# app5.py - FastAPI chatbot (GPT-4o Vision)
# Features:
# - Uses OpenAI Assistants API
# - Supports text + image input via file upload (not base64)
# - Image files uploaded to OpenAI and passed using file_id
# - Maintains thread-based session memory via session_id (in-memory)
# - Swagger & frontend compatible

# TESTED!

import logging
import os
import time
import traceback
from typing import Dict, Any, Optional, List

from dotenv import load_dotenv
import openai
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")

# Load environment variables (API keys etc.)
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("OPENAI_ASSISTANT_ID")

# Initialize FastAPI app
app = FastAPI(default_response_class=JSONResponse)

# Enable CORS for development/testing (adjust origin in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# In-memory chat session store: { session_id: { thread, history } }
chat_sessions: Dict[str, Dict[str, Any]] = {}

# Intro message shown at the start of every new thread
intro_message = "Hi, how can I help you? You can send text or an image for analysis."


@app.post("/chat")
async def chat(
    session_id: str = Form(...),                      # Session identifier for user
    message: Optional[str] = Form(""),               # User's message (optional)
    image: Optional[UploadFile] = File(None),         # Optional image input
):
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")

        # Check if session thread exists or create new
        thread = chat_sessions.get(session_id, {}).get("thread")
        if not thread:
            thread = openai.beta.threads.create()
            chat_sessions[session_id] = {"history": [], "thread": thread}

            # Send assistant's intro message into thread
            openai.beta.threads.messages.create(thread_id=thread.id, role="assistant", content=intro_message)
            chat_sessions[session_id]["history"].append({"role": "assistant", "content": intro_message})

        # If no input provided, just return the session history
        if not message and not image:
            return {"conversation": chat_sessions[session_id]["history"], "completed": False}

        # Upload image to OpenAI if provided
        image_file_ids = []
        if image:
            uploaded_file = await image.read()
            file_tuple = (image.filename, uploaded_file)  # Ensure filename is passed
            openai_file = openai.files.create(
                file=file_tuple,
                purpose="vision"
            )
            image_file_ids.append(openai_file.id)
            logging.info(f"Uploaded image file to OpenAI with file_id: {openai_file.id}")

        # Get assistant's reply
        assistant_response = get_assistant_response(session_id, message, image_file_ids)
        return {"message": assistant_response, "completed": False}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unhandled exception in /chat endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def get_assistant_response(session_id: str, user_input: str, image_file_ids: List[str]) -> str:
    """Builds message content and submits to OpenAI assistant, then retrieves reply."""
    try:
        thread = chat_sessions[session_id]["thread"]
        messages = []

        # Add user text message
        if user_input:
            messages.append({"type": "text", "text": user_input})

        # Add uploaded image file references
        for file_id in image_file_ids:
            messages.append({"type": "image_file", "image_file": {"file_id": file_id, "detail": "high"}})

        # Block empty submissions (should never happen)
        if not messages:
            raise HTTPException(status_code=400, detail="No valid input to send to assistant.")

        # Send message to assistant thread
        message = openai.beta.threads.messages.create(
            thread_id=thread.id, role="user", content=messages
        )

        # Start assistant run
        run = openai.beta.threads.runs.create(
            thread_id=thread.id, assistant_id=assistant_id
        )

        # Wait for completion
        run = wait_on_run(run, thread)
        if run is None:
            return "Sorry, something went wrong. Please try again later."

        # Get response messages after the user input
        messages = openai.beta.threads.messages.list(thread_id=thread.id, order="asc", after=message.id)
        assistant_response = next(
            (msg.content[0].text.value for msg in messages.data if msg.role == "assistant"), ""
        )

        # Log conversation history
        chat_sessions[session_id]["history"].extend([
            {"role": "user", "content": user_input if user_input else "Image sent"},
            {"role": "assistant", "content": assistant_response}
        ])

        return assistant_response

    except Exception as e:
        logging.error(f"Error in get_assistant_response: {e}")
        traceback.print_exc()
        return "Sorry, something went wrong. Please try again later."


def wait_on_run(run, thread):
    """Polls OpenAI until assistant completes processing the run."""
    logging.info(f"Waiting on run {run.id} for thread {thread.id}")
    try:
        while run.status in ["queued", "in_progress"]:
            time.sleep(0.5)
            run = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

        logging.info(f"Run {run.id} completed with status {run.status}")
        return run
    except Exception as e:
        logging.error(f"Error while waiting on run: {e}")
        traceback.print_exc()
        return None


# Run the FastAPI server (dev only)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)

# uvicorn app:app --host 0.0.0.0 --port 5001