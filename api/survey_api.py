from fastapi import APIRouter, HTTPException, Depends, Path
from pydantic import BaseModel, Field

from services.survey_service import create_survey, get_survey_by_token, get_surveys_by_creator
from utils.dependencies import get_current_user

router = APIRouter()


class SurveyPayload(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(None, max_length=1000)


@router.post("/surveys")
async def create_survey_endpoint(
    payload: SurveyPayload,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = create_survey(
            payload.title,
            payload.description,
            current_user["id"]
        )
        return result
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create survey")


@router.get("/surveys")
async def get_my_surveys(current_user: dict = Depends(get_current_user)):
    try:
        return get_surveys_by_creator(current_user["id"])
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve surveys")


@router.get("/survey/{token}")
async def get_survey(
    token: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        survey = get_survey_by_token(token)

        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")

        if not survey["is_active"]:
            raise HTTPException(status_code=403, detail="Survey is no longer active")

        return survey
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve survey")
    

from services.survey_service import create_survey, get_survey_by_token, get_surveys_by_creator, toggle_survey_status

@router.patch("/surveys/{survey_id}/toggle")
async def toggle_survey(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = toggle_survey_status(survey_id, current_user["id"])

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to toggle survey status")
    
    
from services.survey_service import create_survey, get_survey_by_token, get_surveys_by_creator, toggle_survey_status, update_survey
from pydantic import BaseModel, Field

class UpdateSurveyPayload(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(None, max_length=1000)

@router.put("/surveys/{survey_id}")
async def update_survey_endpoint(
    survey_id: int = Path(..., gt=0),
    payload: UpdateSurveyPayload = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = update_survey(survey_id, payload.title, payload.description, current_user["id"])

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to update survey")
    

from services.survey_service import create_survey, get_survey_by_token, get_surveys_by_creator, toggle_survey_status, update_survey, delete_survey

@router.delete("/surveys/{survey_id}")
async def delete_survey_endpoint(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        result = delete_survey(survey_id, current_user["id"])

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to delete survey")