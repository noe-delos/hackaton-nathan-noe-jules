from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from answer_with_gif import gif_answer

router = APIRouter()

class Message(BaseModel):
    content: str
    # You can add more fields if needed (e.g., role)

class ConversationRequest(BaseModel):
    conversation: List[Dict[str, Any]]

@router.post("/gif-answer")
def get_gif_answer(request: ConversationRequest):
    try:
        result = gif_answer(request.conversation)
        return {"gifs": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 