import React, { useEffect, useRef, useState } from 'react';
import { Coordinates, RouteInfo, MapTheme } from '../types';
import { GoogleMapsService, darkMapStyle } from '../services/googleMaps';
import { AlertTriangle, Key } from 'lucide-react';

interface GoogleMapViewProps {
  userCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  destinationName?: string;
  routeInfo: RouteInfo | null;
  theme: MapTheme;
  onMapClick: (coords: Coordinates) => void;
  onGoogleError?: (errorMsg: string) => void;
  mapRefOut?: (instance: { zoomIn: () => void; zoomOut: () => void; panTo: (coords: Coordinates) => void; fitBounds: () => void }) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  userCoords,
  destinationCoords,
  destinationName,
  routeInfo,
  theme,
  onMapClick,
  onGoogleError,
  mapRefOut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const destMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize Google Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const google = await GoogleMapsService.loadGoogleMaps();
        if (!containerRef.current || !isMounted) return;

        const initialCenter = userCoords
          ? { lat: userCoords.lat, lng: userCoords.lng }
          : { lat: 12.9716, lng: 77.5946 }; // Default: Bangalore

        const map = new google.maps.Map(containerRef.current, {
          center: initialCenter,
          zoom: 13,
          disableDefaultUI: true,
          styles: theme === 'dark' ? darkMapStyle : undefined,
          mapTypeId: theme === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.ROADMAP,
        });

        // Initialize DirectionsRenderer
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#2563eb',
            strokeWeight: 5,
            strokeOpacity: 0.9,
          },
        });
        directionsRendererRef.current = directionsRenderer;

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
          }
        });

        mapInstanceRef.current = map;

        if (mapRefOut) {
          mapRefOut({
            zoomIn: () => map.setZoom((map.getZoom() || 13) + 1),
            zoomOut: () => map.setZoom((map.getZoom() || 13) - 1),
            panTo: (coords: Coordinates) => map.panTo({ lat: coords.lat, lng: coords.lng }),
            fitBounds: () => {
              if (userCoords && destinationCoords) {
                const bounds = new google.maps.LatLngBounds();
                bounds.extend({ lat: userCoords.lat, lng: userCoords.lng });
                bounds.extend({ lat: destinationCoords.lat, lng: destinationCoords.lng });
                map.fitBounds(bounds, 80);
              }
            },
          });
        }
      } catch (err: any) {
        if (!isMounted) return;
        const msg = err.message || 'Failed to initialize Google Maps.';
        setLoadError(msg);
        if (onGoogleError) {
          onGoogleError(msg);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Theme & MapType
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    if (theme === 'dark') {
      map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: darkMapStyle });
    } else if (theme === 'satellite') {
      map.setMapTypeId(google.maps.MapTypeId.HYBRID);
      map.setOptions({ styles: [] });
    } else {
      map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: [] });
    }
  }, [theme]);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userMarker = new google.maps.Marker({
        position: { lat: userCoords.lat, lng: userCoords.lng },
        map,
        title: 'Your Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      });
      userMarkerRef.current = userMarker;
    }
  }, [userCoords]);

  // Update Destination Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    if (destMarkerRef.current) {
      destMarkerRef.current.setMap(null);
      destMarkerRef.current = null;
    }

    if (destinationCoords) {
      const destMarker = new google.maps.Marker({
        position: { lat: destinationCoords.lat, lng: destinationCoords.lng },
        map,
        title: destinationName || 'Destination',
      });
      destMarkerRef.current = destMarker;

      if (!routeInfo) {
        map.panTo({ lat: destinationCoords.lat, lng: destinationCoords.lng });
      }
    }
  }, [destinationCoords, destinationName, routeInfo]);

  // Update Route / Directions
  useEffect(() => {
    const map = mapInstanceRef.current;
    const renderer = directionsRendererRef.current;
    if (!map || !renderer || !window.google) return;

    if (routeInfo && userCoords && destinationCoords) {
      const directionsService = new google.maps.DirectionsService();

      let travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING;
      if (routeInfo.travelMode === 'WALKING') travelMode = google.maps.TravelMode.WALKING;
      if (routeInfo.travelMode === 'BICYCLING') travelMode = google.maps.TravelMode.BICYCLING;
      if (routeInfo.travelMode === 'TRANSIT') travelMode = google.maps.TravelMode.TRANSIT;

      directionsService.route(
        {
          origin: new google.maps.LatLng(userCoords.lat, userCoords.lng),
          destination: new google.maps.LatLng(destinationCoords.lat, destinationCoords.lng),
          travelMode,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            renderer.setDirections(result);
          }
        }
      );
    } else {
      renderer.setDirections({ routes: [] } as any);
    }
  }, [routeInfo, userCoords, destinationCoords]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 p-6">
        <div className="max-w-md p-6 bg-white dark:bg-zinc-800 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-700 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Google Maps API Key Required
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">
            {loadError}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-4">
            Switch to OpenStreetMap / OSRM engine in the top bar to test the dashboard immediately without an API key, or add your Google Maps key in Settings.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full relative z-0" />;
};
