# app.py (FastAPI Version Without Firestore)

import os
import logging
import time
import traceback
from typing import Dict, Any, Optional

import openai
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from azure.cosmos import CosmosClient, exceptions
from fastapi.responses import JSONResponse

# Load environment variables
load_dotenv()

# OpenAI API credentials
openai.api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("OPENAI_ASSISTANT_ID")

# Azure CosmosDB configuration
COSMOSDB_URL = os.getenv("COSMOSDB_URL")
COSMOSDB_KEY = os.getenv("COSMOSDB_KEY")
DATABASE_NAME = "studyzone-db"
CONTAINER_NAME = "chat_sessions"

# Initialize CosmosDB client
cosmos_client = CosmosClient(COSMOSDB_URL, COSMOSDB_KEY)
database = cosmos_client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)

# Initialize FastAPI app
app = FastAPI(default_response_class=JSONResponse)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
)

# Intro message for new sessions
intro_message = "Hi, how can I help you regarding Speechnet's services?"


class ChatRequest(BaseModel):
    session_id: str
    message: Optional[str] = ""


def wait_on_run(run, thread):
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


# Error fallback for Render Hosting
@app.get("/")
def home():
    return {"message": "FastAPI backend is running successfully!"}


@app.post("/chat")
async def chat(chat_request: ChatRequest, request: Request):
    try:
        session_id = chat_request.session_id
        user_input = chat_request.message.strip()

        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required")

        try:
            session_data = container.read_item(item=session_id, partition_key=session_id)
        except exceptions.CosmosResourceNotFoundError:
            session_data = {"id": session_id, "session_id": session_id, "history": [], "thread": None}
            container.create_item(session_data)

        conversation_history = session_data["history"]

        if not user_input:
            return {"conversation": conversation_history, "completed": False}

        assistant_response = get_assistant_response(session_id, user_input)

        conversation_history.append({"role": "user", "content": user_input})
        conversation_history.append({"role": "assistant", "content": assistant_response})

        session_data["history"] = conversation_history
        container.replace_item(item=session_id, body=session_data)

        return {"message": assistant_response, "completed": False}

    except Exception as e:
        logging.error(f"Unhandled exception in /chat endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred")


def get_assistant_response(session_id: str, user_input: str) -> str:
    try:
        message = openai.beta.threads.messages.create(
            thread_id=session_id, role="user", content=user_input
        )

        run = openai.beta.threads.runs.create(
            thread_id=session_id, assistant_id=assistant_id
        )

        run = wait_on_run(run, session_id)
        if run is None:
            return "Sorry, something went wrong. Please try again later."

        messages = openai.beta.threads.messages.list(thread_id=session_id, order="asc", after=message.id)
        assistant_response = next(
            (msg.content[0].text.value for msg in messages.data if msg.role == "assistant"), ""
        )

        return assistant_response

    except Exception as e:
        logging.error(f"Error in get_assistant_response: {e}")
        traceback.print_exc()
        return "Sorry, something went wrong. Please try again later."


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=5000)
