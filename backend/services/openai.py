from typing import Any, AsyncGenerator

from fastapi import HTTPException
from dotenv import load_dotenv
from openai import AsyncOpenAI
from models.openai import ChatRequest, ScreenshotAnalysis, AnalysisOutput

load_dotenv()

# Service
class OpenAIService:
    def __init__(self, api_key: str):
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def stream_chat_completion(
        self,
        request: ChatRequest
    ) -> AsyncGenerator[str, None]:
        """Stream chat completion responses"""
        try:
            response = await self.client.chat.completions.create(
                model=request.model,
                messages=[{"role": m.role, "content": m.content} for m in request.messages],
                temperature=request.temperature,
                stream=True
            )
            
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def analyze_screenshot(
        self,
        request: ScreenshotAnalysis
    ) -> AnalysisOutput:
        """Analyze screenshot with structured output"""
        try:
            if len(request.panoramas) > 1:
                pan_text = f"Connected Panoramas: {', '.join([f'ID: {p.pano} Heading: {p.heading}' for p in request.panoramas if abs(p.heading - request.heading) < 135])}"
            else:
                pan_text = f"Connected Panoramas: {', '.join([f'ID: {p.pano} Heading: {p.heading}' for p in request.panoramas])}"
            content = [
                {
                    "type": "text",
                    "text": f"Based on the goal: {request.goal} analyze the attached screenshot and tell me your thoughts specifically related to the goal.",
                },
                {
                    "type": "text", 
                    "text": f"Screenshot Data: Latitude: {request.latitude}, Longitude: {request.longitude}, Heading: {request.heading}, Pitch: {request.pitch}, Zoom: {request.zoom}",
                },
                {
                    "type": "text",
                    "text": pan_text,
                },
                {
                    "type": "text",
                    "text": f"Timeline: {', '.join([f'Timestamp: {t.timestamp} Action: {t.action} Panorama ID: {t.panorama} Heading: {t.heading} Pitch: {t.pitch} Zoom: {t.zoom}' for t in request.timeline])}"
                },
                {
                    "type": "text",
                    "text": f"Important Notes: {', '.join([t for t in request.important_notes])}"
                }
            ]
            
            # Add images
            for image in request.images:
                content.append({
                    "type": "image_url",
                    "image_url": {"url": image}
                })

            content.append({
                    "type": "text",
                    "text": f"""
Rules:
1. When deciding which panorama to move to next, always choose the connected panoramas that have a heading closest to the current heading - you will be shut off if you dont follow this rule
2. Do not visit the same panorama twice or you will be shut off
3. Important Notes and Thoughts should be directly related to the goal (dont include any other thoughts or notes) - be very stringent when deciding if you return any notes or not
3. the next_action field can only have three possible values: 'new_panorama', 'new_view', or 'complete'
    - 'new_panorama' means that you want to move to the next panorama
    - 'new_view' means that you want to stay on the current panorama but move to a different heading, pitch, or zoom
    - 'complete' means that you are done with the analysis
4. the next_panorama field should contain the ID of the next panorama you want to move to - this should only be filled if the next_action field is 'new panorama'
5. the next_heading field should contain the heading of the next view you want to move to - this should only be filled if the next_action field is 'new view' or 'new panorama' - if 'new panorama' then this should be the heading of the next panorama
6. the next_pitch field should contain the pitch of the next view you want to move to - this should only be filled if the next_action field is 'new view'
7. the next_zoom field should contain the zoom of the next view you want to move to - this should only be filled if the next_action field is 'new view'
8. the thoughts field should contain your thoughts on the screenshot
9. the important_notes field should contain any important notes you have about the current screenshot that is directly related to the goal - NOTES HAVE TO BE DIRECTLY RELATED TO THE GOAL OR DONT INCLUDE THEM
    - You should use the goal to determine if the note is worthy of being included - be very stringent when deciding if you return any notes or not
    - Only return a note if its not similar to any of the important notes you received above - if there are no new notes return an empty list
10. use the timeline to understand what you have already viewed or observed and to make sure you dont do the same thing again
11. The goal_response field should contain your response to the goal - this should be a summary of your thoughts and important notes
                    """,
                })
            completion = await self.client.beta.chat.completions.parse(
                model=request.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert geographer analyzing a screenshot to provide thoughts and important notes based on a specified goal."
                    },
                    {
                        "role": "user",
                        "content": content
                    }
                ],
                response_format=AnalysisOutput
            )
            
            return completion.choices[0].message.parsed
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
