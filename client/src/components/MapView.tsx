import React, { useRef } from 'react';
import { Coordinates, RouteInfo, MapEngine, MapTheme } from '../types';
import { LeafletMapView } from './LeafletMapView';
import { GoogleMapView } from './GoogleMapView';

interface MapViewProps {
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;
  hasGoogleKey: boolean;
  userCoords: Coordinates | null;
  destinationCoords: Coordinates | null;
  destinationName?: string;
  routeInfo: RouteInfo | null;
  theme: MapTheme;
  onMapClick: (coords: Coordinates) => void;
  onControlsReady?: (controls: {
    zoomIn: () => void;
    zoomOut: () => void;
    panTo: (coords: Coordinates) => void;
    fitBounds: () => void;
  }) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  mapEngine,
  setMapEngine,
  hasGoogleKey,
  userCoords,
  destinationCoords,
  destinationName,
  routeInfo,
  theme,
  onMapClick,
  onControlsReady,
}) => {
  const activeEngine = mapEngine === 'google' && hasGoogleKey ? 'google' : 'leaflet';

  const handleGoogleError = (err: string) => {
    console.warn('Google Maps encountered error, switching to Leaflet:', err);
    setMapEngine('leaflet');
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {activeEngine === 'google' ? (
        <GoogleMapView
          key="google-map"
          userCoords={userCoords}
          destinationCoords={destinationCoords}
          destinationName={destinationName}
          routeInfo={routeInfo}
          theme={theme}
          onMapClick={onMapClick}
          onGoogleError={handleGoogleError}
          mapRefOut={onControlsReady}
        />
      ) : (
        <LeafletMapView
          key="leaflet-map"
          userCoords={userCoords}
          destinationCoords={destinationCoords}
          destinationName={destinationName}
          routeInfo={routeInfo}
          theme={theme}
          onMapClick={onMapClick}
          mapRefOut={onControlsReady}
        />
      )}
    </div>
  );
};
