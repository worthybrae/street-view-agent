from models.openai import ChatRequest, ScreenshotAnalysis
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import os
from dotenv import load_dotenv
from services.openai import OpenAIService


load_dotenv()

router = APIRouter(prefix="/openai", tags=["openai"])
openai_service = OpenAIService(api_key=os.getenv('OPENAI_API_KEY'))

@router.post("/chat/stream")
async def stream_chat(request: ChatRequest):
    """Stream chat completion responses"""
    return StreamingResponse(
        openai_service.stream_chat_completion(request),
        media_type='text/event-stream'
    )

@router.post("/analyze/screenshot")
async def analyze_screenshot(request: ScreenshotAnalysis):
    """Analyze screenshot with structured output"""
    return await openai_service.analyze_screenshot(request)