from fastapi import APIRouter, HTTPException
from app.core.ai_handler import AIHandler
from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()
ai_handler = AIHandler()

@router.post("/", response_model=ChatResponse)
async def create_chat(chat_request: ChatRequest):
    try:
        response = await ai_handler.generate_response(
            question=chat_request.question,
            subject=chat_request.subject,
            difficulty_level=chat_request.difficulty_level
        )
        return ChatResponse(response=response, success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))