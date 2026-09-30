import axios from 'axios';
import { PlaceResult, RouteInfo, TravelMode, Coordinates } from '../types';

export class OsmService {
  /**
   * Search places using OpenStreetMap Nominatim
   */
  static async searchPlaces(query: string, centerBias?: Coordinates): Promise<PlaceResult[]> {
    if (!query || query.trim().length === 0) return [];

    try {
      let url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(
        query.trim()
      )}`;

      if (centerBias) {
        // Bias search towards user's current area if available
        const viewbox = `${centerBias.lng - 0.5},${centerBias.lat + 0.5},${centerBias.lng + 0.5},${centerBias.lat - 0.5}`;
        url += `&viewbox=${viewbox}`;
      }

      const res = await axios.get(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });

      return (res.data || []).map((item: any) => {
        const address = item.address || {};
        const shortName =
          item.name ||
          address.road ||
          address.suburb ||
          address.city ||
          address.town ||
          address.state ||
          item.display_name.split(',')[0];

        return {
          id: String(item.place_id || item.osm_id),
          name: shortName,
          formattedAddress: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          category: item.type || item.class || 'place',
        };
      });
    } catch (err: any) {
      console.warn('Direct OSM Search failed, falling back to backend API:', err.message);
      try {
        const backendUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/places/search?q=${encodeURIComponent(query.trim())}`;
        const res = await axios.get(backendUrl, { timeout: 5000 });
        return (res.data || []).map((item: any) => ({
          id: item.placeId || String(Date.now()),
          name: item.name || item.formattedAddress?.split(',')[0] || query,
          formattedAddress: item.formattedAddress || item.name,
          lat: item.lat,
          lng: item.lng,
          category: item.category || 'place',
        }));
      } catch (backErr) {
        console.error('Backend search fallback failed:', backErr);
        return [];
      }
    }
  }

  /**
   * Calculate real road route using Open Source Routing Machine (OSRM)
   */
  static async calculateRoute(
    origin: Coordinates,
    destination: Coordinates,
    mode: TravelMode = 'DRIVING',
    originName: string = 'Current Location',
    destName: string = 'Destination'
  ): Promise<RouteInfo> {
    const profile = mode === 'WALKING' ? 'foot' : mode === 'BICYCLING' ? 'bike' : 'driving';
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

    try {
      const res = await axios.get(url, { timeout: 10000 });

      if (res.data.code !== 'Ok' || !res.data.routes?.length) {
        throw new Error('Unable to find a route between these locations.');
      }

      const route = res.data.routes[0];
      const distanceMeters = route.distance;
      const durationSeconds = route.duration;

      const distanceKm = parseFloat((distanceMeters / 1000).toFixed(1));
      const durationMin = Math.max(1, Math.round(durationSeconds / 60));

      const hours = Math.floor(durationMin / 60);
      const mins = durationMin % 60;
      const durationText = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;
      const distanceText = distanceKm < 1 ? `${Math.round(distanceMeters)} m` : `${distanceKm} km`;

      const steps = (route.legs?.[0]?.steps || []).map((s: any) => {
        const type = s.maneuver.type || 'Turn';
        const mod = s.maneuver.modifier ? ` ${s.maneuver.modifier}` : '';
        const road = s.name ? ` onto ${s.name}` : '';
        const instruction = `${type.charAt(0).toUpperCase() + type.slice(1)}${mod}${road}`;
        const stepDistKm = s.distance / 1000;
        const stepDistText = stepDistKm < 1 ? `${Math.round(s.distance)} m` : `${stepDistKm.toFixed(1)} km`;
        const stepDurMin = Math.max(1, Math.round(s.duration / 60));

        return {
          instruction: instruction || 'Continue along the route',
          distance: stepDistText,
          duration: `${stepDurMin} min`,
        };
      });

      // GeoJSON returns [lng, lat], convert to [lat, lng]
      const polylinePoints: [number, number][] = (route.geometry.coordinates || []).map(
        (pt: [number, number]) => [pt[1], pt[0]]
      );

      return {
        distanceKm,
        durationMin,
        distanceText,
        durationText,
        summary: route.legs?.[0]?.summary || undefined,
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
    } catch (err: any) {
      if (err.message && err.message.includes('Unable to find a route')) {
        throw err;
      }
      throw new Error('Unable to find a route between these locations.');
    }
  }

  /**
   * Reverse geocode coordinates to readable address
   */
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
      const res = await axios.get(url, {
        headers: {
          'Accept-Language': 'en',
        },
      });
      return res.data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }
}
