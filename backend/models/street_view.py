from pydantic import BaseModel
from typing import Optional, Dict

class StreetViewResponse(BaseModel):
    content: bytes
    content_type: str
    status_code: int

class StreetViewMetadata(BaseModel):
    copyright: Optional[str]
    date: Optional[str]
    location: Optional[Dict[str, float]]
    pano_id: Optional[str]
    status: str

class AddressRequest(BaseModel):
    address: str
    size: str = "640x640"
    heading: Optional[float] = None
    pitch: Optional[float] = None
    fov: Optional[float] = None