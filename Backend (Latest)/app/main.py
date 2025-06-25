# main.py
# Combines chat + vision + notes + todos as in app7
# Modular routers (notes/todos), chat inline — auth later

import os
import time
import traceback
import logging
import json
from typing import Optional, Dict, Any, List

from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
import openai

from .note_routes import router as note_router
from .todo_routes import router as todo_router

# Load .env from root directory
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(dotenv_path=os.path.join(ROOT_DIR, ".env"))

# Set OpenAI credentials
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("OPENAI_ASSISTANT_ID")

# Setup FastAPI
app = FastAPI(default_response_class=JSONResponse)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# In-memory session store
chat_sessions: Dict[str, Dict[str, Any]] = {}
intro_message = "Hi, how can I help you? You can send text or images for analysis."

# ---------------- Chat + Image ----------------
@app.post("/chat", tags=["Chat"])
async def chat(session_id: str = Form(...), message: Optional[str] = Form(""), image: Optional[UploadFile] = File(None)):
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")

        thread = chat_sessions.get(session_id, {}).get("thread")
        if not thread:
            thread = openai.beta.threads.create()
            chat_sessions[session_id] = {"history": [], "thread": thread}
            openai.beta.threads.messages.create(thread_id=thread.id, role="assistant", content=intro_message)
            chat_sessions[session_id]["history"].append({"role": "assistant", "content": intro_message})

        if not message and not image:
            return {"conversation": chat_sessions[session_id]["history"], "completed": False}

        image_file_id = None
        if image and image.filename:
            uploaded_file = await image.read()
            if uploaded_file:
                file_tuple = (image.filename, uploaded_file)
                openai_file = openai.files.create(file=file_tuple, purpose="vision")
                logging.info(f"Uploaded image file to OpenAI with file_id: {openai_file.id}")
                image_file_id = openai_file.id

        content = []
        if message:
            content.append({"type": "text", "text": message})
        if image_file_id:
            content.append({"type": "image_file", "image_file": {"file_id": image_file_id}})

        msg = openai.beta.threads.messages.create(thread_id=thread.id, role="user", content=content)
        run = openai.beta.threads.runs.create(thread_id=thread.id, assistant_id=assistant_id)
        while run.status in ["queued", "in_progress"]:
            time.sleep(0.5)
            run = openai.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

        response = openai.beta.threads.messages.list(thread_id=thread.id, order="asc", after=msg.id)
        assistant_response = next((msg.content[0].text.value for msg in response.data if msg.role == "assistant"), "")

        chat_sessions[session_id]["history"].append({"role": "user", "content": message or "Image sent"})
        chat_sessions[session_id]["history"].append({"role": "assistant", "content": assistant_response})

        return {"message": assistant_response, "completed": False}

    except Exception as e:
        logging.error(f"Chat error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal error")

# Include routers with tags
app.include_router(note_router, tags=["Notes"])
app.include_router(todo_router, tags=["Todos"])

# Run server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
