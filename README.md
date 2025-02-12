# StudyZone

StudyZone is an AI-powered educational platform designed specifically for high school students in the Netherlands. Instead of providing direct answers, StudyZone guides students through the learning process using interactive conversations and study tools.

## 🎯 Project Overview

StudyZone combines an AI-powered chat interface with study management tools to create a comprehensive learning environment:

- **Guided Learning**: AI chatbot that helps students understand concepts instead of giving direct answers
- **Smart Notes**: Save and organize important conversations and learning materials
- **Task Management**: Built-in todo list for tracking assignments and study goals

## 🛠️ Technical Stack

- **Backend**: Python with FastAPI
- **Database**: PostgreSQL with SQLAlchemy
- **AI Integration**: LLM API integration (customizable)
- **Frontend**: React (separate repository)

## 📁 Project Structure

```
studyzone/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI application setup
│   │   ├── config.py         # Configuration management
│   │   ├── dependencies.py   # Shared dependencies
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── api/            # API endpoints
│   │   └── core/           # Core functionality
│   ├── tests/              # Test directory
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
└── frontend/              # Frontend code (separate repo)
```

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- PostgreSQL
- Virtual environment tool

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/studyzone.git
cd studyzone
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create .env file and add:
DATABASE_URL=postgresql://user:password@localhost/studyzone
LLM_API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

## 🔗 API Endpoints

### Chat Endpoints
- `POST /api/v1/chat/`: Create a new chat session
  ```json
  {
    "question": "How do I solve quadratic equations?",
    "subject": "mathematics",
    "difficulty_level": "medium"
  }
  ```

### Notes Endpoints
- `GET /api/v1/notes/`: Get all notes
- `POST /api/v1/notes/`: Create a new note
- `PUT /api/v1/notes/{note_id}`: Update a note
- `DELETE /api/v1/notes/{note_id}`: Delete a note

### Todo Endpoints
- `GET /api/v1/todos/`: Get all todos
- `POST /api/v1/todos/`: Create a new todo
- `PUT /api/v1/todos/{todo_id}/toggle`: Toggle todo completion
- `DELETE /api/v1/todos/{todo_id}`: Delete a todo

## 🔧 Configuration

The project uses environment variables for configuration. Create a `.env` file with the following:

```env
DATABASE_URL=postgresql://user:password@localhost/studyzone
LLM_API_KEY=your-api-key-here
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📦 Database Models

### User Model
```python
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    hashed_password = Column(String)
```

### Note Model
```python
class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True)
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
```

### Todo Model
```python
class Todo(Base):
    __tablename__ = "todos"
    id = Column(Integer, primary_key=True)
    title = Column(String)
    completed = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
```

## 🚧 Development Status

Current development status and next steps:

✅ Completed:
- Basic project structure
- API endpoint setup
- Database models
- Core FastAPI configuration

🔄 In Progress:
- LLM integration
- User authentication
- Frontend development
- Database relationships

⏳ Planned:
- Subject-specific AI agents
- Advanced note organization
- Performance optimization
- User analytics

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details

