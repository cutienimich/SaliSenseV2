from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, Field
from typing import List

from services.field_service import (
    create_survey_field, get_fields_by_survey,
    delete_survey_field, save_field_responses,
    get_field_responses_by_survey
)
from utils.dependencies import get_current_user

router = APIRouter()


class FieldPayload(BaseModel):
    survey_id: int = Field(..., gt=0)
    field_label: str = Field(..., min_length=1, max_length=100)
    field_type: str = Field(..., pattern="^(text|number|dropdown)$")
    is_required: bool = True


class FieldAnswer(BaseModel):
    field_id: int
    field_value: str


class FieldResponsePayload(BaseModel):
    survey_id: int
    field_answers: List[FieldAnswer]


@router.post("/survey-fields")
async def create_field_endpoint(
    payload: FieldPayload,
    current_user: dict = Depends(get_current_user)
):
    try:
        field_id = create_survey_field(
            payload.survey_id,
            payload.field_label,
            payload.field_type,
            payload.is_required
        )
        return {"message": "Field created", "field_id": field_id}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create field")


@router.get("/survey-fields/{survey_id}")
async def get_fields_endpoint(
    survey_id: int = Path(..., gt=0)
):
    try:
        fields = get_fields_by_survey(survey_id)
        return {"survey_id": survey_id, "fields": fields}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve fields")


@router.delete("/survey-fields/{field_id}")
async def delete_field_endpoint(
    field_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = delete_survey_field(field_id, current_user["id"])
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete field")


@router.post("/field-responses")
async def save_field_responses_endpoint(
    payload: FieldResponsePayload,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = save_field_responses(
            payload.survey_id,
            current_user["email"],
            [a.dict() for a in payload.field_answers]
        )
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to save field responses")


@router.get("/field-responses/{survey_id}")
async def get_field_responses_endpoint(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = get_field_responses_by_survey(survey_id, current_user["id"])
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return {"survey_id": survey_id, "respondents": result}
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve field responses")