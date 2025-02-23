import { type Libraries } from '@react-google-maps/api';

export interface MapLocation {
  lat: number;
  lng: number;
}

export interface MapState {
  center: MapLocation;
  zoom: number;
  bounds?: google.maps.LatLngBounds;
}

export interface StreetViewState {
  position?: MapLocation;
  pov?: {
    heading: number;
    pitch: number;
  };
}

export class GoogleMapsService {
    private static instance: GoogleMapsService;
    private constructor() {}

    static getInstance(): GoogleMapsService {
        if (!GoogleMapsService.instance) {
        GoogleMapsService.instance = new GoogleMapsService();
        }
        return GoogleMapsService.instance;
    }

    readonly defaultCenter: MapLocation = {
        lat: 42.460355,
        lng: -71.146672
    };

    readonly defaultZoom = 18; // Increased zoom level for better street view transition

    readonly libraries: Libraries = ['places', 'geometry'];

    isValidLatLng(lat: number, lng: number): boolean {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

  async getAddressFromLatLng(location: MapLocation): Promise<string | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location });
      
      if (result.results[0]) {
        return result.results[0].formatted_address;
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async getLatLngFromAddress(address: string): Promise<MapLocation | null> {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address });
      
      if (result.results[0]?.geometry?.location) {
        const location = result.results[0].geometry.location;
        return {
          lat: location.lat(),
          lng: location.lng()
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  calculateBounds(locations: MapLocation[]): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    locations.forEach(location => {
      bounds.extend(new google.maps.LatLng(location.lat, location.lng));
    });
    return bounds;
  }
}