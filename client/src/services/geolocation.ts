import { Coordinates, GeolocationState } from '../types';

export class GeolocationService {
  /**
   * Request the user's current GPS position using browser Geolocation API
   */
  static getCurrentPosition(): Promise<{ coords: Coordinates; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = 'An unknown geolocation error occurred.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location permission was denied. Please allow location access in your browser to detect your current position, or select an origin manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location information is currently unavailable. Please check your device GPS/network.';
              break;
            case error.TIMEOUT:
              message = 'Request to get user location timed out. Please try again.';
              break;
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  /**
   * Check browser permission status if supported
   */
  static async checkPermission(): Promise<'granted' | 'prompt' | 'denied' | 'unsupported'> {
    if (!('permissions' in navigator)) {
      return 'unsupported';
    }
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return status.state;
    } catch {
      return 'prompt';
    }
  }
}
