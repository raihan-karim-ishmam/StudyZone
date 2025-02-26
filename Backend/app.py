# app.py (FastAPI Version Without Firestore)

import logging
import os
import time
import traceback
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import openai
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s:%(message)s')

load_dotenv()  # Load environment variables from .env

openai.api_key = os.getenv("OPENAI_API_KEY")  # Get key from .env
assistant_id = os.environ.get("OPENAI_ASSISTANT_ID")
# assistant_id = os.environ.get('OPENAI_ASSISTANT_ID', 'asst_n8ShC4NJtlxEmkieCLILhnu5')

# FastAPI app instance
app = FastAPI(default_response_class=JSONResponse)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# Store chat sessions in memory
chat_sessions: Dict[str, Dict[str, Any]] = {}

# Intro message
intro_message = "Hi, how can I help you regarding Speechnet's services?"


class ChatRequest(BaseModel):
    session_id: str
    message: Optional[str] = ""


def load_openai_assistant():
    """Creates a new OpenAI assistant thread."""
    logging.info("Creating a new OpenAI thread.")
    try:
        thread = openai.beta.threads.create()
        logging.info(f"New thread created: {thread.id}")
        return thread
    except Exception as e:
        logging.error(f"Failed to create OpenAI thread: {e}")
        traceback.print_exc()
        return None


def wait_on_run(run, thread):
    """Polls OpenAI API until run is completed."""
    logging.info(f"Waiting on run {run.id} for thread {thread.id}")
    try:
        while run.status in ["queued", "in_progress"]:
            time.sleep(0.5)  # Consider using exponential backoff
            run = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

        logging.info(f"Run {run.id} completed with status {run.status}")
        return run
    except Exception as e:
        logging.error(f"Error while waiting on run: {e}")
        traceback.print_exc()
        return None


def get_user_ip(request: Request) -> str:
    """Retrieves the user's IP address."""
    logging.info("Retrieving user IP address.")
    try:
        if forwarded := request.headers.get("X-Forwarded-For"):
            ip = forwarded.split(",")[0].strip()
        else:
            ip = request.client.host
        logging.info(f"User IP address determined: {ip}")
        return ip
    except Exception as e:
        logging.error(f"Error retrieving user IP: {e}")
        traceback.print_exc()
        return "0.0.0.0"


@app.post("/chat")
async def chat(chat_request: ChatRequest, request: Request):
    try:
        session_id = chat_request.session_id
        user_input = chat_request.message.strip()
        ip_address = get_user_ip(request)

        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")

        # No Firestore retrieval, all stored in-memory
        thread_id = None  
        thread = None

        if session_id in chat_sessions:
            thread = chat_sessions[session_id]["thread"]
        else:
            thread = load_openai_assistant()
            if thread is None:
                raise HTTPException(status_code=500, detail="Failed to create a new conversation thread")

            chat_sessions[session_id] = {"history": [], "thread": thread}

            try:
                openai.beta.threads.messages.create(thread_id=thread.id, role="assistant", content=intro_message)
            except Exception as e:
                logging.error(f"Error sending intro message: {e}")
                traceback.print_exc()

            chat_sessions[session_id]["history"].append({"role": "assistant", "content": intro_message})

        if not user_input:
            return {"conversation": chat_sessions[session_id]["history"], "completed": False}

        assistant_response = get_assistant_response(session_id, user_input)
        return {"message": assistant_response, "completed": False}

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unhandled exception in /chat endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def get_assistant_response(session_id: str, user_input: str) -> str:
    try:
        thread = chat_sessions[session_id]["thread"]
        message = openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=user_input)

        run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)
        run = wait_on_run(run, thread)
        if run is None:
            return "Sorry, something went wrong. Please try again later."

        messages = openai.beta.threads.messages.list(thread_id=thread.id, order="asc", after=message.id)
        assistant_response = next(
            (msg.content[0].text.value for msg in messages.data if msg.role == "assistant"), ""
        )

        chat_sessions[session_id]["history"].extend(
            [{"role": "user", "content": user_input}, {"role": "assistant", "content": assistant_response}]
        )

        return assistant_response
    except Exception as e:
        logging.error(f"Error in get_assistant_response: {e}")
        traceback.print_exc()
        return "Sorry, something went wrong. Please try again later."


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
