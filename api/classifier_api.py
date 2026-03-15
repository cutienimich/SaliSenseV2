from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
import re
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.classifier_service import classify_text

router = APIRouter()



def sanitize_text(text: str) -> str:
    clean = re.sub(r'<.*?>', '', text)          # strip HTML
    clean = re.sub(r'[^\w\s.,!?\'"-]', '', clean)  # allow only safe chars
    clean = re.sub(r'\s+', ' ', clean)          # normalize whitespace
    return clean.strip()

from pydantic import BaseModel, Field

class TextPayload(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Text must be between 1 and 1000 characters"
    )
    
limiter = Limiter(key_func=get_remote_address)

@router.post("/classify")
@limiter.limit("10/minute")
async def classify(request: Request, payload: TextPayload):
    clean_text = sanitize_text(payload.text)
    
    if not clean_text:
        raise HTTPException(status_code=422, detail="Text is empty after sanitization")
    
    try:
         result = classify_text(clean_text)
    except Exception:
        raise HTTPException(status_code=500, detail="Classification failed")
    return {"input": clean_text, "emotion_result": result}