export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PlaceResult {
  id: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  category?: string;
  rating?: number;
  userRatingsTotal?: number;
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface RouteInfo {
  distanceKm: number;
  durationMin: number;
  distanceText: string;
  durationText: string;
  summary?: string;
  steps: RouteStep[];
  polylinePoints?: [number, number][];
  origin: {
    lat: number;
    lng: number;
    name?: string;
  };
  destination: {
    lat: number;
    lng: number;
    name?: string;
  };
  travelMode: TravelMode;
}

export type TravelMode = 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';

export type MapEngine = 'google' | 'leaflet';

export type MapTheme = 'light' | 'dark' | 'satellite';

export interface SavedPlace {
  id: string;
  name: string;
  label: 'Home' | 'Work' | 'University' | 'Favorite' | string;
  address: string;
  latitude: number;
  longitude: number;
  icon?: string;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  placeName: string;
  address?: string;
  latitude: number;
  longitude: number;
  category?: string;
  createdAt: string;
}

export interface RouteHistoryItem {
  id: string;
  originName: string;
  originLat: number;
  originLng: number;
  destName: string;
  destLat: number;
  destLng: number;
  distanceKm: number;
  durationMin: number;
  travelMode: string;
  createdAt: string;
}

export interface GeolocationState {
  coords: Coordinates | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
}
