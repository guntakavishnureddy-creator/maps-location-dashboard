import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, RouteInfo, MapTheme } from '../types';

interface LeafletMapViewProps {
  userCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  destinationName?: string;
  routeInfo: RouteInfo | null;
  theme: MapTheme;
  onMapClick: (coords: Coordinates) => void;
  mapRefOut?: (instance: { zoomIn: () => void; zoomOut: () => void; panTo: (coords: Coordinates) => void; fitBounds: () => void }) => void;
}

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  userCoords,
  destinationCoords,
  destinationName,
  routeInfo,
  theme,
  onMapClick,
  mapRefOut,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const initialCenter: [number, number] = userCoords
      ? [userCoords.lat, userCoords.lng]
      : [12.9716, 77.5946]; // Default: Bangalore

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false, // We have custom styled controls
    });

    map.on('click', (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    // Export imperative controls
    if (mapRefOut) {
      mapRefOut({
        zoomIn: () => map.zoomIn(),
        zoomOut: () => map.zoomOut(),
        panTo: (coords: Coordinates) => map.flyTo([coords.lat, coords.lng], 15, { animate: true }),
        fitBounds: () => {
          if (routePolylineRef.current) {
            map.fitBounds(routePolylineRef.current.getBounds(), { padding: [60, 60] });
          } else if (userCoords && destinationCoords) {
            const bounds = L.latLngBounds([
              [userCoords.lat, userCoords.lng],
              [destinationCoords.lat, destinationCoords.lng],
            ]);
            map.fitBounds(bounds, { padding: [60, 60] });
          }
        },
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer based on theme
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; OpenStreetMap contributors';

    if (theme === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; OpenStreetMap &copy; CARTO';
    } else if (theme === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri';
    }

    const newLayer = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);
    tileLayerRef.current = newLayer;
  }, [theme]);

  // Update User Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
      userMarkerRef.current = null;
    }

    if (userCoords) {
      const userIcon = L.divIcon({
        className: 'user-marker-container',
        html: `
          <div style="position: relative; width: 24px; height: 24px;">
            <div class="user-pulse-ring"></div>
            <div style="width: 20px; height: 20px; background-color: #2563eb; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.3); position: relative; z-index: 10;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([userCoords.lat, userCoords.lng], { icon: userIcon }).addTo(map);
      marker.bindPopup('<b>Your Location</b><br>Detected via GPS');
      userMarkerRef.current = marker;
    }
  }, [userCoords]);

  // Update Destination Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (destMarkerRef.current) {
      map.removeLayer(destMarkerRef.current);
      destMarkerRef.current = null;
    }

    if (destinationCoords) {
      const destIcon = L.divIcon({
        className: 'dest-marker-container',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="background-color: #e11d48; color: white; padding: 6px; border-radius: 50%; box-shadow: 0 4px 12px rgba(225,29,72,0.4); border: 2px solid white;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style="width: 2px; height: 6px; background-color: #e11d48;"></div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 38],
      });

      const marker = L.marker([destinationCoords.lat, destinationCoords.lng], { icon: destIcon }).addTo(map);
      marker.bindPopup(`<b>${destinationName || 'Destination'}</b>`);
      destMarkerRef.current = marker;

      // If no route active, smoothly center on destination
      if (!routeInfo) {
        map.flyTo([destinationCoords.lat, destinationCoords.lng], 14, { animate: true });
      }
    }
  }, [destinationCoords, destinationName, routeInfo]);

  // Update Route Polyline & Auto-fit Viewport
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeInfo && routeInfo.polylinePoints && routeInfo.polylinePoints.length > 0) {
      const polyline = L.polyline(routeInfo.polylinePoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Automatically fit map viewport so origin, destination, and route are visible (PDF Page 3 Section 7)
      map.fitBounds(polyline.getBounds(), {
        padding: [80, 80],
        maxZoom: 16,
      });
    }
  }, [routeInfo]);

  return <div ref={containerRef} className="w-full h-full relative z-0" />;
};
