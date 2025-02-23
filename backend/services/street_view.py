from typing import Optional, Union, Dict, Any
import httpx
import logging
from urllib.parse import urlencode
from models.street_view import StreetViewResponse, StreetViewMetadata

logger = logging.getLogger(__name__)

class GoogleStreetViewService:
    def __init__(self, api_key: str, signature: Optional[str] = None):
        """
        Initialize the Street View service
        
        Args:
            api_key: Your Google Maps API key
            signature: Optional digital signature for request verification
        """
        self.api_key = api_key
        self.signature = signature
        self.base_url = "https://maps.googleapis.com/maps/api/streetview"
        self.metadata_url = f"{self.base_url}/metadata"
        
    async def _make_request(
        self, 
        url: str, 
        params: Dict[str, Any]
    ) -> httpx.Response:
        """Make HTTP request to Street View API with timeout handling"""
        params["key"] = self.api_key
        if self.signature:
            params["signature"] = self.signature
            
        # Clean up any parameters that might have trailing periods
        for key, value in params.items():
            if isinstance(value, (int, float)):
                params[key] = f"{value:.6f}".rstrip('0').rstrip('.')
            
        async with httpx.AsyncClient(timeout=30.0) as client:  # Increased timeout
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response
            except httpx.TimeoutException:
                logger.error(f"Timeout while requesting Street View image: {url}")
                raise httpx.RequestError("Timeout while fetching Street View image")
            except Exception as e:
                logger.error(f"Error fetching Street View image: {str(e)}")
                raise

    async def get_image_by_location(
        self,
        location: Union[str, tuple[float, float]],
        size: str = "640x640",
        heading: Optional[float] = None,
        pitch: Optional[float] = None,
        fov: Optional[float] = None,
        radius: Optional[int] = None,
        source: Optional[str] = None,
        return_error_code: bool = True
    ) -> StreetViewResponse:
        """
        Get Street View image by location (address or coordinates)
        
        Args:
            location: Address string or (lat, lng) tuple
            size: Image size in pixels (widthxheight)
            heading: Camera heading (0-360)
            pitch: Camera pitch (-90 to 90)
            fov: Field of view (max 120)
            radius: Search radius in meters
            source: Limit search to specific sources ('default' or 'outdoor')
            return_error_code: Return 404 instead of default image when no imagery exists
        """
        params = {"size": size}
        
        # Handle location parameter
        if isinstance(location, tuple):
            params["location"] = f"{location[0]},{location[1]}"
        else:
            params["location"] = location
            
        # Add optional parameters
        if heading is not None:
            params["heading"] = heading
        if pitch is not None:
            params["pitch"] = pitch
        if fov is not None:
            params["fov"] = fov
        if radius is not None:
            params["radius"] = radius
        if source is not None:
            params["source"] = source
        if return_error_code:
            params["return_error_code"] = "true"
            
        response = await self._make_request(self.base_url, params)
        
        return StreetViewResponse(
            content=response.content,
            content_type=response.headers.get("content-type", "image/jpeg"),
            status_code=response.status_code
        )

    async def get_image_by_pano(
        self,
        pano_id: str,
        size: str = "640x640",
        heading: Optional[float] = None,
        pitch: Optional[float] = None,
        fov: Optional[float] = None,
        return_error_code: bool = True
    ) -> StreetViewResponse:
        """
        Get Street View image by panorama ID
        
        Args:
            pano_id: Specific panorama ID
            size: Image size in pixels (widthxheight)
            heading: Camera heading (0-360)
            pitch: Camera pitch (-90 to 90)
            fov: Field of view (max 120)
            return_error_code: Return 404 instead of default image when no imagery exists
        """
        params = {
            "pano": pano_id,
            "size": size
        }
        
        if heading is not None:
            params["heading"] = heading
        if pitch is not None:
            params["pitch"] = pitch
        if fov is not None:
            params["fov"] = fov
        if return_error_code:
            params["return_error_code"] = "true"
            
        response = await self._make_request(self.base_url, params)
        
        return StreetViewResponse(
            content=response.content,
            content_type=response.headers.get("content-type", "image/jpeg"),
            status_code=response.status_code
        )

    async def get_metadata(
        self,
        location: Optional[Union[str, tuple[float, float]]] = None,
        pano_id: Optional[str] = None
    ) -> StreetViewMetadata:
        """
        Get metadata about Street View availability
        
        Args:
            location: Address string or (lat, lng) tuple
            pano_id: Specific panorama ID
        """
        if not location and not pano_id:
            raise ValueError("Either location or pano_id must be provided")
            
        params = {}
        if location:
            if isinstance(location, tuple):
                params["location"] = f"{location[0]},{location[1]}"
            else:
                params["location"] = location
        else:
            params["pano"] = pano_id
            
        response = await self._make_request(self.metadata_url, params)
        return StreetViewMetadata.parse_raw(response.content)

    def build_static_url(
        self,
        location: Optional[Union[str, tuple[float, float]]] = None,
        pano_id: Optional[str] = None,
        size: str = "640x640",
        heading: Optional[float] = None,
        pitch: Optional[float] = None,
        fov: Optional[float] = None
    ) -> str:
        """Build a static Street View URL with clean parameter formatting"""
        params = {"size": size, "key": self.api_key}
        
        if location:
            if isinstance(location, tuple):
                params["location"] = f"{location[0]:.6f},{location[1]:.6f}".rstrip('0').rstrip('.')
            else:
                params["location"] = location
        elif pano_id:
            params["pano"] = pano_id
        else:
            raise ValueError("Either location or pano_id must be provided")
            
        if heading is not None:
            params["heading"] = f"{heading:.6f}".rstrip('0').rstrip('.')
        if pitch is not None:
            params["pitch"] = f"{pitch:.6f}".rstrip('0').rstrip('.')
        if fov is not None:
            params["fov"] = f"{fov:.6f}".rstrip('0').rstrip('.')
        if self.signature:
            params["signature"] = self.signature
            
        return f"{self.base_url}?{urlencode(params)}"