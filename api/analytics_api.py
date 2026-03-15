from fastapi import APIRouter, Path, HTTPException, Depends
from utils.dependencies import get_current_user
from services.analytics_service import get_emotion_distribution_by_survey, get_or_generate_summary

router = APIRouter()

@router.get("/analytics/{survey_id}/summary/{question_id}")
async def get_question_summary_endpoint(
    survey_id: int = Path(..., gt=0),
    question_id: int = Path(..., gt=0),
    regenerate: bool = False,
    current_user: dict = Depends(get_current_user)
):
    try:
        summary = get_or_generate_summary(question_id, regenerate=regenerate)
        return {"question_id": question_id, "summary": summary}
    except Exception as e:
        print(f"Summary error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate summary")

@router.get("/analytics/{survey_id}/summary/{question_id}")
async def get_question_summary(
    survey_id: int = Path(..., gt=0),
    question_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)
):
    try:
        from services.analytics_service import get_responses_text_by_question
        responses = get_responses_text_by_question(question_id)
        
        if not responses:
            return {"summary": "Wala pang mga sagot para sa tanong na ito."}
        
        return {"question_id": question_id, "responses": responses}
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to get responses")

@router.get("/analytics/{survey_id}")
async def emotion_analytics(
    survey_id: int = Path(..., gt=0),
    current_user: dict = Depends(get_current_user)  # 🔒 protected
):
    try:
        result = get_emotion_distribution_by_survey(survey_id)

        if result is None:
            raise HTTPException(status_code=404, detail="Survey not found")

        return result
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")