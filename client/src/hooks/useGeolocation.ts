import { useState, useEffect, useCallback } from 'react';
import { Coordinates, GeolocationState } from '../types';
import { GeolocationService } from '../services/geolocation';

export function useGeolocation(autoDetect: boolean = true) {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    loading: false,
    permissionStatus: 'prompt',
  });

  const [address, setAddress] = useState<string>('My Location');

  const checkPermission = useCallback(async () => {
    const status = await GeolocationService.checkPermission();
    setState((prev) => ({ ...prev, permissionStatus: status }));
  }, []);

  const requestLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { coords } = await GeolocationService.getCurrentPosition();
      setState({
        coords,
        error: null,
        loading: false,
        permissionStatus: 'granted',
      });
      return coords;
    } catch (err: any) {
      const errorMsg = err.message || 'Unable to retrieve your location.';
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        loading: false,
        permissionStatus: errorMsg.includes('denied') ? 'denied' : prev.permissionStatus,
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    checkPermission();
    if (autoDetect) {
      requestLocation();
    }
  }, [autoDetect, checkPermission, requestLocation]);

  return {
    ...state,
    address,
    setAddress,
    requestLocation,
    checkPermission,
  };
}
