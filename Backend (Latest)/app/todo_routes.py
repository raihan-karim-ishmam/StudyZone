# todo_routes.py
# TODO API - kinda rough but works. Took logic from app7
# handles add/update/delete tasks (with IDs and timestamps)

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import os

router = APIRouter()

TODOS_FILE = "todos.json"  # yeah we’re saving this locally for now

# Basic todo schema — nothing fancy, id is UUID, frontend gives timestamp
class Todo(BaseModel):
    id: str
    task: str
    done: bool = False
    created_at: str

# grab everything
@router.get("/todos")
def get_todos():
    return read_todos()

# add a new task (expects full todo obj)
@router.post("/todos")
def add_todo(todo: Todo):
    todos = read_todos()
    todos.append(todo.dict())
    write_todos(todos)
    return {"status": "Todo added."}

# overwrite existing task by ID
@router.put("/todos/{todo_id}")
def update_todo(todo_id: str, updated_todo: Todo):
    todos = read_todos()
    for i, t in enumerate(todos):
        if t["id"] == todo_id:
            todos[i] = updated_todo.dict()
            write_todos(todos)
            return {"status": "Todo updated."}
    raise HTTPException(status_code=404, detail="Todo not found")

# delete by ID (no soft-delete logic, just gone)
@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: str):
    todos = read_todos()
    todos = [t for t in todos if t["id"] != todo_id]
    write_todos(todos)
    return {"status": "Todo deleted."}

# file I/O helpers (same ones from main app, just pulled here)
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
        json.dump(todos, f, indent=2)  # readable JSON because why not
