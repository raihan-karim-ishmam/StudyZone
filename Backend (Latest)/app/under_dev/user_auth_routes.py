# user_auth_routes.py
# user login + signup logic (in-memory/db ready)
# not live - under dev

from fastapi import APIRouter, HTTPException, Form
from pydantic import BaseModel
from typing import Optional
import json
import os
import hashlib
import uuid

router = APIRouter()

USERS_FILE = "users.json"

# basic user schema (passwords stored as hash only)
class User(BaseModel):
    username: str
    password: str  # plain password on input only (hashed in storage)

# read from file

def read_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return {}

# write to file
def write_users(data):
    with open(USERS_FILE, "w") as f:
        json.dump(data, f, indent=2)

# hash password
def hash_password(pw: str):
    return hashlib.sha256(pw.encode()).hexdigest()

# signup
@router.post("/signup")
def signup(username: str = Form(...), password: str = Form(...)):
    users = read_users()
    if username in users:
        raise HTTPException(status_code=400, detail="Username already exists")

    users[username] = {
        "id": str(uuid.uuid4()),
        "password": hash_password(password)
    }
    write_users(users)
    return {"status": "Signup successful"}

# login
@router.post("/login")
def login(username: str = Form(...), password: str = Form(...)):
    users = read_users()
    hashed = hash_password(password)
    user = users.get(username)
    if not user or user["password"] != hashed:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"status": "Login successful", "user_id": user["id"]}  # basic return only
