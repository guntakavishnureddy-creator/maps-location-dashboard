import axios from 'axios';

export interface GeocodeResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  category?: string;
}

export class GeocodingService {
 private static getGoogleApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || '';
}
  static async searchPlaces(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const cleanQuery = query.trim();

    // 1. Try Google Geocoding if API key is provided
    if (this.getGoogleApiKey()) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQuery)}&key=${this.getGoogleApiKey()}`;
        const res = await axios.get(url);
        if (res.data.status === 'OK' && res.data.results?.length) {
          return res.data.results.map((r: any) => ({
            placeId: r.place_id,
            name: r.address_components?.[0]?.long_name || r.formatted_address,
            formattedAddress: r.formatted_address,
            lat: r.geometry.location.lat,
            lng: r.geometry.location.lng,
            category: r.types?.[0] || 'place',
          }));
        }
      } catch (err: any) {
        console.warn('Google Geocoding failed, falling back to OSM:', err.message);
      }
    }

    // 2. OpenStreetMap Nominatim fallback
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(cleanQuery)}&limit=10`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'MapsDashboard-InternshipApp/1.0',
        },
      });

      return (res.data || []).map((item: any) => ({
        placeId: String(item.place_id || item.osm_id),
        name: item.name || item.display_name.split(',')[0],
        formattedAddress: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        category: item.type || item.class || 'location',
      }));
    } catch (err: any) {
      console.error('OSM Nominatim error:', err.message);
      return [];
    }
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    if (this.getGoogleApiKey()) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.getGoogleApiKey()}`;
        const res = await axios.get(url);
        if (res.data.status === 'OK' && res.data.results?.[0]) {
          return res.data.results[0].formatted_address;
        }
      } catch (err: any) {
        console.warn('Google Reverse Geocoding failed, falling back to OSM:', err.message);
      }
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'MapsDashboard-InternshipApp/1.0',
        },
      });
      return res.data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}
