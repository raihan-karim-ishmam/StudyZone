from fastapi import APIRouter
from app.api.v1.endpoints import chat, notes, todos, users

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(notes.router, prefix="/notes", tags=["notes"])
api_router.include_router(todos.router, prefix="/todos", tags=["todos"])