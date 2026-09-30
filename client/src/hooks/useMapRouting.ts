import { useState, useCallback } from 'react';
import { Coordinates, RouteInfo, TravelMode, PlaceResult, MapEngine } from '../types';
import { GoogleMapsService } from '../services/googleMaps';
import { OsmService } from '../services/osmService';

export function useMapRouting(onRouteCalculated?: (route: RouteInfo) => void) {
  const [origin, setOrigin] = useState<{ coords: Coordinates; name: string } | null>(null);
  const [destination, setDestination] = useState<{ coords: Coordinates; name: string } | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVING');
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSteps, setShowSteps] = useState<boolean>(false);

  const calculateRoute = useCallback(
    async (
      engine: MapEngine,
      customOrigin?: { coords: Coordinates; name: string } | null,
      customDest?: { coords: Coordinates; name: string } | null,
      customMode?: TravelMode
    ) => {
      const start = customOrigin || origin;
      const end = customDest || destination;
      const mode = customMode || travelMode;

      if (!start) {
        setError('Please set an origin or enable location access.');
        return null;
      }

      if (!end) {
        setError('Please select a destination first.');
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        let result: RouteInfo;

        if (engine === 'google' && GoogleMapsService.getApiKey()) {
          try {
            const googleRes = await GoogleMapsService.calculateRoute(
              start.coords,
              end.coords,
              mode,
              start.name,
              end.name
            );
            result = googleRes.routeInfo;
          } catch (googleErr: any) {
            console.warn('Google routing failed, falling back to OSRM:', googleErr);
            result = await OsmService.calculateRoute(
              start.coords,
              end.coords,
              mode,
              start.name,
              end.name
            );
          }
        } else {
          result = await OsmService.calculateRoute(
            start.coords,
            end.coords,
            mode,
            start.name,
            end.name
          );
        }

        setRouteInfo(result);
        setIsLoading(false);
        if (onRouteCalculated) {
          onRouteCalculated(result);
        }
        return result;
      } catch (err: any) {
        setIsLoading(false);
        const msg = err.message || 'Unable to find a route between these locations.';
        setError(msg);
        setRouteInfo(null);
        return null;
      }
    },
    [origin, destination, travelMode, onRouteCalculated]
  );

  const clearRoute = useCallback(() => {
    setRouteInfo(null);
    setError(null);
    setShowSteps(false);
  }, []);

  const reverseRoute = useCallback(() => {
    if (origin && destination) {
      const prevOrigin = origin;
      setOrigin(destination);
      setDestination(prevOrigin);
      setRouteInfo(null);
      setError(null);
    }
  }, [origin, destination]);

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    travelMode,
    setTravelMode,
    routeInfo,
    setRouteInfo,
    isLoading,
    error,
    setError,
    showSteps,
    setShowSteps,
    calculateRoute,
    clearRoute,
    reverseRoute,
  };
}
