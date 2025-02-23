# In your routes/street_view.py
from fastapi import APIRouter, HTTPException
from services.street_view import GoogleStreetViewService
from fastapi.responses import Response
from models.street_view import AddressRequest
import os
from dotenv import load_dotenv
from typing import Optional


load_dotenv()
router = APIRouter(prefix="/streetview", tags=["streetview"])
street_view = GoogleStreetViewService(
    api_key=os.getenv('GOOGLE_API_KEY')
)

@router.get("/by-coordinates/{lat}/{lng}")
async def get_street_view_by_coordinates(
    lat: float,
    lng: float,
    size: str = "640x640",
    heading: Optional[float] = None,
    pitch: Optional[float] = None,
    fov: Optional[float] = None
):
    """Get Street View image using latitude and longitude coordinates"""
    try:
        result = await street_view.get_image_by_location(
            location=(lat, lng),
            size=size,
            heading=heading,
            pitch=pitch,
            fov=fov
        )
        return Response(
            content=result.content,
            media_type=result.content_type,
            status_code=result.status_code
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/by-address")
async def get_street_view_by_address(request: AddressRequest):
    """Get Street View image using a street address"""
    try:
        result = await street_view.get_image_by_location(
            location=request.address,
            size=request.size,
            heading=request.heading,
            pitch=request.pitch,
            fov=request.fov
        )
        return Response(
            content=result.content,
            media_type=result.content_type,
            status_code=result.status_code
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/metadata")
async def get_street_view_metadata(
    address: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None
):
    """Get enhanced metadata about Street View availability for a location"""
    try:
        if address:
            location = address
        elif lat is not None and lng is not None:
            location = (lat, lng)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either address or lat/lng coordinates must be provided"
            )
            
        metadata = await street_view.get_metadata(location=location)
        
        # Format the date string if it exists
        if metadata.date:
            try:
                # Convert YYYY-MM format to "Month YYYY"
                year, month = metadata.date.split('-')
                from datetime import datetime
                date_obj = datetime.strptime(f"{year}-{month}-01", "%Y-%m-%01")
                formatted_date = date_obj.strftime("%B %Y")
                metadata.date = formatted_date
            except Exception as e:
                print(f"Error formatting date: {e}")
                # Keep original date format if parsing fails
                pass
                
        # Add location description if using coordinates
        if isinstance(location, tuple):
            try:
                # Get address from coordinates using the street view service
                location_str = f"{location[0]},{location[1]}"
                static_url = street_view.build_static_url(location=location_str)
                metadata.description = location_str  # Fallback
            except Exception as e:
                print(f"Error getting location description: {e}")
                
        return metadata
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/static-url")
async def get_static_url(
    address: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    size: str = "640x640",
    heading: Optional[float] = None,
    pitch: Optional[float] = None,
    zoom: Optional[float] = None  # Changed from fov to zoom
):
    """
    Get a static URL that can be used in <img> tags
    
    Args:
        zoom: Zoom level (will be converted to FOV using: fov = 180 / 2^zoom)
    """
    try:
        if address:
            location = address
        elif lat is not None and lng is not None:
            location = (lat, lng)
        else:
            raise HTTPException(
                status_code=400,
                detail="Either address or lat/lng coordinates must be provided"
            )
            
        # Calculate fov from zoom if provided
        fov = 180 / (2 ** zoom) if zoom is not None else None
            
        url = street_view.build_static_url(
            location=location,
            size=size,
            heading=heading,
            pitch=pitch,
            fov=fov
        )
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))