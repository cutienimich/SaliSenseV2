from dotenv import load_dotenv
load_dotenv() 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import router
from api.classifier_api import router as classifier_router
from api.translate_api import router as translate_router
from api.question_api import router as question_router
from api.response_api import router as response_router
from api.analytics_api import router as analytics_router
from api.auth_api import router as auth_router
from api.survey_api import router as survey_router
from api.field_api import router as field_router

from fastapi.middleware.cors import CORSMiddleware




import os

hf_token = os.getenv("HF_TOKEN")


app = FastAPI(title="AI Survey System")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
      "http://localhost:5173",
        "https://salisense15.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes
app.include_router(classifier_router)
app.include_router(translate_router)
app.include_router(question_router)
app.include_router(response_router)
app.include_router(analytics_router)
app.include_router(auth_router)
app.include_router(survey_router)
app.include_router(field_router)