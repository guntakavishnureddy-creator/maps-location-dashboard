/// <reference types="@types/google.maps" />
import { Loader } from '@googlemaps/js-api-loader';
import { Coordinates, PlaceResult, RouteInfo, TravelMode } from '../types';

let loaderInstance: Loader | null = null;
let googleMapsPromise: Promise<any> | null = null;

export const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#263c3f' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6b9a76' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#38414e' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#212a37' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9ca5b3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#746855' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1f2835' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f3d19c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#2f3948' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#d59563' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#17263c' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#515c6d' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#17263c' }],
  },
];

export class GoogleMapsService {
  private static apiKey: string = '';

  static setApiKey(key: string) {
    if (this.apiKey !== key) {
      this.apiKey = key;
      loaderInstance = null;
      googleMapsPromise = null;
    }
  }

  static getApiKey(): string {
    return (
      this.apiKey ||
      localStorage.getItem('GOOGLE_MAPS_API_KEY') ||
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
      ''
    );
  }

  static async loadGoogleMaps(): Promise<any> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error('Google Maps API Key is missing. Please provide a valid key.');
    }

    const win = window as any;
    if (win.google && win.google.maps) {
      return win.google;
    }

    if (!googleMapsPromise) {
      loaderInstance = new Loader({
        apiKey: key,
        version: 'weekly',
        libraries: ['places', 'geometry', 'routes', 'marker'],
      });
      googleMapsPromise = loaderInstance.load();
    }

    return googleMapsPromise;
  }

  /**
   * Calculate route using Google DirectionsService
   */
  static async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'DRIVING',
    originName: string = 'Current Location',
    destName: string = 'Destination'
  ): Promise<{ routeInfo: RouteInfo; directionsResult: google.maps.DirectionsResult }> {
    const google = await this.loadGoogleMaps();
    const directionsService = new google.maps.DirectionsService();

    let travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
    if (mode === 'WALKING') travelMode = google.maps.TravelMode.WALKING;
    if (mode === 'BICYCLING') travelMode = google.maps.TravelMode.BICYCLING;
    if (mode === 'TRANSIT') travelMode = google.maps.TravelMode.TRANSIT;

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode,
          provideRouteAlternatives: false,
        },
        (result: any, status: any) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            const route = result.routes[0];
            const leg = route.legs[0];

            const distanceKm = parseFloat(((leg.distance?.value || 0) / 1000).toFixed(1));
            const durationMin = Math.round((leg.duration?.value || 0) / 60);

            const steps = (leg.steps || []).map((s: any) => ({
              instruction: s.instructions.replace(/<[^>]*>?/gm, ''),
              distance: s.distance?.text || '',
              duration: s.duration?.text || '',
            }));

            // Decode polyline points for state representation
            const path = route.overview_path || [];
            const polylinePoints: [number, number][] = path.map((latLng: any) => [
              latLng.lat(),
              latLng.lng(),
            ]);

            const routeInfo: RouteInfo = {
              distanceKm,
              durationMin,
              distanceText: leg.distance?.text || `${distanceKm} km`,
              durationText: leg.duration?.text || `${durationMin} min`,
              summary: route.summary,
              steps,
              polylinePoints,
              origin: {
                lat: origin.lat,
                lng: origin.lng,
                name: originName,
              },
              destination: {
                lat: destination.lat,
                lng: destination.lng,
                name: destName,
              },
              travelMode: mode,
            };

            resolve({ routeInfo, directionsResult: result });
          } else if (status === google.maps.DirectionsStatus.ZERO_RESULTS) {
            reject(new Error('Unable to find a route between these locations.'));
          } else {
            reject(new Error(`Directions request failed: ${status}`));
          }
        }
      );
    });
  }

  /**
   * Search places using Google Places AutocompleteService
   */
  static async searchPlaces(query: string, centerBias?: Coordinates): Promise<PlaceResult[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      const google = await this.loadGoogleMaps();
      const autocompleteService = new google.maps.places.AutocompleteService();

      const request: google.maps.places.AutocompletionRequest = {
        input: query,
      };

      if (centerBias) {
        request.locationBias = new google.maps.Circle({
          center: new google.maps.LatLng(centerBias.lat, centerBias.lng),
          radius: 50000, // 50km
        });
      }

      return new Promise((resolve) => {
        autocompleteService.getPlacePredictions(request, async (predictions: any, status: any) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
            resolve([]);
            return;
          }

          // Use Geocoder to resolve predictions to coordinates
          const geocoder = new google.maps.Geocoder();
          const results: PlaceResult[] = [];

          // Resolve top 5 predictions
          const topPredictions = predictions.slice(0, 5);

          for (const pred of topPredictions) {
            try {
              const geoRes = await geocoder.geocode({ placeId: pred.place_id });
              if (geoRes.results?.[0]) {
                const loc = geoRes.results[0].geometry.location;
                results.push({
                  id: pred.place_id,
                  name: pred.structured_formatting?.main_text || pred.description.split(',')[0],
                  formattedAddress: pred.description,
                  lat: loc.lat(),
                  lng: loc.lng(),
                  category: pred.types?.[0] || 'place',
                });
              }
            } catch {
              // Ignore single geocode failure
            }
          }

          resolve(results);
        });
      });
    } catch (err) {
      console.error('Google Places Autocomplete failed:', err);
      return [];
    }
  }

  /**
   * Reverse geocode coordinates using Google Geocoder
   */
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const google = await this.loadGoogleMaps();
      const geocoder = new google.maps.Geocoder();
      const res = await geocoder.geocode({ location: { lat, lng } });
      if (res.results?.[0]) {
        return res.results[0].formatted_address;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}
