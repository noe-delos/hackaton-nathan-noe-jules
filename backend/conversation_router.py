from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from conversation_analysis import search_conversation

class SearchRequest(BaseModel):
    query: str

router = APIRouter()

@router.post("/search-conversation")
async def search_conv(request: SearchRequest):
    try:
        result = await search_conversation(request.query)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 