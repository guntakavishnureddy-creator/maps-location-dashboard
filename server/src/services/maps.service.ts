import axios from 'axios';

export interface RouteResult {
  provider: 'google' | 'osrm';
  distanceKm: number;
  durationMin: number;
  distanceText: string;
  durationText: string;
  steps: Array<{
    instruction: string;
    distance: string;
    duration: string;
  }>;
  coordinates: [number, number][]; // [lat, lng]
}

export class MapsService {
  private static getGoogleApiKey(): string {
  return process.env.GOOGLE_MAPS_API_KEY || '';
}
  static async calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT' = 'DRIVING'
  ): Promise<RouteResult> {
    // 1. If Google API key is configured, try Google Directions API
    if (this.getGoogleApiKey()) {
      try {
        const googleMode = mode.toLowerCase();
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&mode=${googleMode}&key=${this.getGoogleApiKey()}`;
        const response = await axios.get(url);

        if (response.data.status === 'OK' && response.data.routes?.length) {
          const route = response.data.routes[0];
          const leg = route.legs[0];
          const distanceMeters = leg.distance.value;
          const durationSeconds = leg.duration.value;

          const steps = (leg.steps || []).map((s: any) => ({
            instruction: s.html_instructions.replace(/<[^>]*>?/gm, ''),
            distance: s.distance.text,
            duration: s.duration.text,
          }));

          // Simple polyline decoder or fallback to start/end
          const coordinates: [number, number][] = (leg.steps || []).flatMap((s: any) => [
            [s.start_location.lat, s.start_location.lng],
            [s.end_location.lat, s.end_location.lng],
          ]);

          return {
            provider: 'google',
            distanceKm: parseFloat((distanceMeters / 1000).toFixed(1)),
            durationMin: Math.round(durationSeconds / 60),
            distanceText: leg.distance.text,
            durationText: leg.duration.text,
            steps,
            coordinates,
          };
        }
      } catch (err: any) {
        console.warn('Google Directions API failed, falling back to OSRM:', err.message);
      }
    }

    // 2. Open Source Routing Machine (OSRM) Road Routing Engine
    try {
      const profile = mode === 'WALKING' ? 'foot' : mode === 'BICYCLING' ? 'bike' : 'driving';
      const osrmUrl = `https://router.project-osrm.org/route/v1/${profile}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`;

      const osrmRes = await axios.get(osrmUrl, { timeout: 8000 });

      if (osrmRes.data.code === 'Ok' && osrmRes.data.routes?.length) {
        const route = osrmRes.data.routes[0];
        const distanceKm = parseFloat((route.distance / 1000).toFixed(1));
        const durationMin = Math.max(1, Math.round(route.duration / 60));

        // Format nice texts
        const distanceText = distanceKm < 1 ? `${Math.round(route.distance)} m` : `${distanceKm} km`;
        const hours = Math.floor(durationMin / 60);
        const mins = durationMin % 60;
        const durationText = hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`;

        const steps = (route.legs?.[0]?.steps || []).map((step: any) => {
          const modifier = step.maneuver.modifier ? ` (${step.maneuver.modifier})` : '';
          const name = step.name ? ` onto ${step.name}` : '';
          return {
            instruction: `${step.maneuver.type}${modifier}${name}` || 'Proceed along route',
            distance: step.distance < 1000 ? `${Math.round(step.distance)} m` : `${(step.distance / 1000).toFixed(1)} km`,
            duration: `${Math.max(1, Math.round(step.duration / 60))} min`,
          };
        });

        // OSRM returns coordinates as [lng, lat] in GeoJSON format. We convert to [lat, lng].
        const coordinates: [number, number][] = (route.geometry.coordinates || []).map(
          (pt: [number, number]) => [pt[1], pt[0]]
        );

        return {
          provider: 'osrm',
          distanceKm,
          durationMin,
          distanceText,
          durationText,
          steps,
          coordinates,
        };
      }
    } catch (err: any) {
      console.error('OSRM route calculation error:', err.message);
    }

    throw new Error('Unable to find a route between these locations.');
  }
}
