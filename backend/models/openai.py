# models/openai.py
from pydantic import BaseModel
from typing import Optional, Type, Union, List, Dict, Literal

class ImageContent(BaseModel):
    type: Literal["image_url"]
    image_url: Dict[str, str]

class TextContent(BaseModel):
    type: Literal["text"]
    text: str

class ChatMessage(BaseModel):
    role: str
    content: Union[str, List[Union[TextContent, ImageContent]]]

class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    temperature: Optional[float] = 0.7
    model: Optional[str] = "gpt-4o"
    max_tokens: Optional[int] = 300

class ConnectedPanorama(BaseModel):
    pano: str
    heading: float

class ActionTimeline(BaseModel):
    action: str
    panorama: str
    heading: float
    pitch: float
    zoom: float
    timestamp: str

class ScreenshotAnalysis(BaseModel):
    goal: str
    latitude: float
    longitude: float
    heading: float
    pitch: float
    zoom: float
    images: List[str]
    timeline: List[ActionTimeline]
    important_notes: List[str]
    panoramas: List[ConnectedPanorama]
    temperature: Optional[float] = 0.7
    model: Optional[str] = "gpt-4o"
    max_tokens: Optional[int] = 300

class AnalysisOutput(BaseModel):
    next_action: str
    next_panorama: str
    next_heading: float
    next_pitch: float
    next_zoom: float
    thoughts: str
    important_notes: List[str]
    goal_response: str