# note_routes.py
# notes API, pulled from app7
# dev-style split out, still uses JSON file like before

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import json
import os

router = APIRouter()

NOTES_FILE = "notes.json"

# Pydantic schema — simple note model with frontend-provided timestamp
class Note(BaseModel):
    title: str
    content: str
    tags: List[str]
    created_at: str

# GET all notes
@router.get("/notes")
def get_notes():
    return read_notes()

# POST a note — frontend gives full object
@router.post("/notes")
def add_note(note: Note):
    notes = read_notes()
    notes.append(note.dict())
    write_notes(notes)
    return {"status": "Note added."}

# update note by list index (frontend handles ordering)
@router.put("/notes/{note_id}")
def update_note(note_id: int, note: Note):
    notes = read_notes()
    if note_id >= len(notes):
        raise HTTPException(status_code=404, detail="Note not found")
    notes[note_id] = note.dict()
    write_notes(notes)
    return {"status": "Note updated."}

# nuke a note
@router.delete("/notes/{note_id}")
def delete_note(note_id: int):
    notes = read_notes()
    if note_id >= len(notes):
        raise HTTPException(status_code=404, detail="Note not found")
    notes.pop(note_id)
    write_notes(notes)
    return {"status": "Note deleted."}

# basic I/O wrappers (still JSON-based for now)
def read_notes():
    if not os.path.exists(NOTES_FILE):
        return []
    with open(NOTES_FILE, "r") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []

def write_notes(notes):
    with open(NOTES_FILE, "w") as f:
        json.dump(notes, f, indent=2)
