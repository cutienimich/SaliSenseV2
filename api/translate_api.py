from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.translator_service import translate_tagalog_to_english
from utils.sanitizer import sanitize_text

router = APIRouter()

class TranslatePayload(BaseModel):
    text: str = Field(..., min_length=1, max_length=1000)


@router.post("/translate")
async def translate(payload: TranslatePayload):
    try:
        clean_text = sanitize_text(payload.text)

        if not clean_text:
            raise HTTPException(status_code=422, detail="Text is empty after sanitization")

        translated_text = translate_tagalog_to_english(clean_text)

        return {
            "original_text": clean_text,
            "translated_text": translated_text
        }
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Translation failed")