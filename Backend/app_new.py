# app7.py - Finalized version with Chat + Vision + Notes + ToDo
#  Built from app6.3 with added /todo endpoints
#  Includes safe image handling and structured notes/tasks storage
#  Notes and Todos stored in JSON files; frontend sends timestamps
#  Marked tasks are kept unless deleted manually (frontend decides)

import logging
import os
import time
import traceback
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import uuid4
from pydantic import BaseModel

from dotenv import load_dotenv
import openai
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Load OpenAI credentials from .env
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("OPENAI_ASSISTANT_ID")

# Basic FastAPI + logging setup
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s:%(message)s")
app = FastAPI(default_response_class=JSONResponse)

# Allow frontend (or Swagger/Postman) to test all endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

chat_sessions: Dict[str, Dict[str, Any]] = {}
NOTES_FILE = "notes.json"
TODOS_FILE = "todos.json"
intro_message = "Hi, how can I help you? You can send text or images for analysis."

# -------------------- Chat + Vision --------------------

@app.post("/chat")
async def chat(
    session_id: str = Form(...),
    message: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None)
):
    """Handles chat messages and image uploads using OpenAI Assistants API."""
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

        # Upload image if it's a valid non-empty file
        image_file_id = None
        if image and image.filename:
            uploaded_file = await image.read()
            if uploaded_file:
                file_tuple = (image.filename, uploaded_file)
                openai_file = openai.files.create(file=file_tuple, purpose="vision")
                logging.info(f"Uploaded image file to OpenAI with file_id: {openai_file.id}")
                image_file_id = openai_file.id

        # Format content payload for OpenAI
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

# -------------------- Notes --------------------

class Note(BaseModel):
    title: str
    content: str
    tags: List[str]
    created_at: str  # sent from frontend

@app.get("/notes")
def get_notes():
    """Fetch all notes."""
    return read_notes()

@app.post("/notes")
def add_note(note: Note):
    """Add a new note with metadata."""
    notes = read_notes()
    notes.append(note.dict())
    write_notes(notes)
    return {"status": "Note added."}

@app.put("/notes/{note_id}")
def update_note(note_id: int, note: Note):
    """Update a note by index (frontend tracks index)."""
    notes = read_notes()
    if note_id >= len(notes):
        raise HTTPException(status_code=404, detail="Note not found")
    notes[note_id] = note.dict()
    write_notes(notes)
    return {"status": "Note updated."}

@app.delete("/notes/{note_id}")
def delete_note(note_id: int):
    """Delete a note by index."""
    notes = read_notes()
    if note_id >= len(notes):
        raise HTTPException(status_code=404, detail="Note not found")
    notes.pop(note_id)
    write_notes(notes)
    return {"status": "Note deleted."}

def read_notes():
    if not os.path.exists(NOTES_FILE):
        return []
    with open(NOTES_FILE, "r") as f:
        try:
            return json.load(f) if isinstance(json.load(f), list) else []
        except json.JSONDecodeError:
            return []

def write_notes(notes):
    with open(NOTES_FILE, "w") as f:
        json.dump(notes, f, indent=2)

# -------------------- Todo --------------------

class Todo(BaseModel):
    id: str
    task: str
    done: bool = False
    created_at: str  # provided by frontend

@app.get("/todos")
def get_todos():
    """Get full list of todos."""
    return read_todos()

@app.post("/todos")
def add_todo(todo: Todo):
    """Add a new task."""
    todos = read_todos()
    todos.append(todo.dict())
    write_todos(todos)
    return {"status": "Todo added."}

@app.put("/todos/{todo_id}")
def update_todo(todo_id: str, updated_todo: Todo):
    """Update task by ID."""
    todos = read_todos()
    for i, t in enumerate(todos):
        if t["id"] == todo_id:
            todos[i] = updated_todo.dict()
            write_todos(todos)
            return {"status": "Todo updated."}
    raise HTTPException(status_code=404, detail="Todo not found")

@app.delete("/todos/{todo_id}")
def delete_todo(todo_id: str):
    """Delete a todo by ID."""
    todos = read_todos()
    todos = [t for t in todos if t["id"] != todo_id]
    write_todos(todos)
    return {"status": "Todo deleted."}

def read_todos():
    if not os.path.exists(TODOS_FILE):
        return []
    with open(TODOS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_todos(todos):
    with open(TODOS_FILE, "w") as f:
        json.dump(todos, f, indent=2)

# -------------------- Run --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
