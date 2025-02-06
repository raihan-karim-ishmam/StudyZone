from pydantic import BaseModel
from datetime import datetime

class TodoBase(BaseModel):
    title: str
    completed: bool = False

class TodoCreate(TodoBase):
    pass

class Todo(TodoBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True