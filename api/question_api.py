from fastapi import APIRouter, Path, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import Optional

from services.question_service import create_question, get_questions_by_survey
from utils.sanitizer import sanitize_text
from utils.dependencies import get_current_user

router = APIRouter()

ALLOWED_QUESTION_TYPES = {"open_ended", "multiple_choice", "rating"}
class QuestionPayload(BaseModel):
    survey_id: int = Field(..., gt=0)
    question_text: str = Field(..., min_length=5, max_length=500)
    emotion_tag: Optional[str] = Field(None, max_length=50)

@router.post("/questions")
async def create_question_endpoint(
    payload: QuestionPayload,
    current_user: dict = Depends(get_current_user)
):
    try:
        clean_text = sanitize_text(payload.question_text)

        if not clean_text:
            raise HTTPException(status_code=422, detail="question_text is empty after sanitization")

        question_id = create_question(
            payload.survey_id,
            clean_text,
            payload.emotion_tag
        )
        return {"message": "Question created successfully", "question_id": question_id}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create question")
    
@router.get("/questions/{survey_id}")
async def get_questions_endpoint(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)  # 🔒 protected
):
    try:
        questions = get_questions_by_survey(survey_id)

        if questions is None:
            raise HTTPException(status_code=404, detail=f"No questions found for survey {survey_id}")

        return {"survey_id": survey_id, "questions": questions}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve questions")
    
    
from services.question_service import create_question, get_questions_by_survey, delete_question

@router.delete("/questions/{question_id}")
async def delete_question_endpoint(
    question_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = delete_question(question_id, current_user["id"])

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete question")