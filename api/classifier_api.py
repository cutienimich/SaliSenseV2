from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel, Field
import re
from slowapi import Limiter
from slowapi.util import get_remote_address

from services.classifier_service import classify_text_and_sentiment

router = APIRouter()


def sanitize_text(text: str) -> str:
    clean = re.sub(r'<.*?>', '', text)
    clean = re.sub(r'[^\w\s.,!?\'"-]', '', clean)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()


class TextPayload(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)
    question: str = Field(default="", description="Optional question context")


limiter = Limiter(key_func=get_remote_address)


@router.post("/classify")
@limiter.limit("10/minute")
async def classify(request: Request, payload: TextPayload):
    clean_text = sanitize_text(payload.text)

    if not clean_text:
        raise HTTPException(status_code=422, detail="Text is empty after sanitization")

    try:
        result = classify_text_and_sentiment(payload.question, clean_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Classification failed")

    return {
        "input": clean_text,
        "emotion": result["emotion"],
        "emotion_score": result["emotion_score"],
        "sentiment": result["sentiment"],
        "sentiment_score": result["sentiment_score"]
    }