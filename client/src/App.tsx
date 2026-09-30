import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MapView } from './components/MapView';
import { SearchBar } from './components/SearchBar';
import { QuickSearchChips } from './components/QuickSearchChips';
import { RouteInfoCard } from './components/RouteInfoCard';
import { MapControls } from './components/MapControls';
import { LocationPermissionBanner } from './components/LocationPermissionBanner';
import { HistoryDrawer } from './components/HistoryDrawer';
import { SavedPlacesDrawer } from './components/SavedPlacesDrawer';
import { SettingsModal } from './components/SettingsModal';
import { useGeolocation } from './hooks/useGeolocation';
import { useMapRouting } from './hooks/useMapRouting';
import { useHistory } from './hooks/useHistory';
import { PlaceResult, MapEngine, MapTheme, Coordinates, SearchHistoryItem, RouteHistoryItem } from './types';
import { GoogleMapsService } from './services/googleMaps';
import { OsmService } from './services/osmService';

export const App: React.FC = () => {
  // Map Engine & API Key
  const [googleKey, setGoogleKey] = useState<string>(() => GoogleMapsService.getApiKey());
  const [mapEngine, setMapEngine] = useState<MapEngine>(() => {
    const key = GoogleMapsService.getApiKey();
    return key ? 'google' : 'leaflet';
  });

  // Dark Mode & Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [theme, setTheme] = useState<MapTheme>(() => (isDarkMode ? 'dark' : 'light'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      setTheme(next ? 'dark' : 'light');
      return next;
    });
  };

  // UI Drawers & Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedPlacesOpen, setIsSavedPlacesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPermissionBannerDismissed, setIsPermissionBannerDismissed] = useState(false);

  // Map Controls Ref
  const mapControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    panTo: (coords: Coordinates) => void;
    fitBounds: () => void;
  } | null>(null);

  // Custom Hooks
  const {
    coords: userCoords,
    error: geoError,
    loading: geoLoading,
    permissionStatus,
    requestLocation,
  } = useGeolocation(true);

  const {
    searchHistory,
    routeHistory,
    savedPlaces,
    addSearch,
    clearSearches,
    addRoute,
    addSavedPlace,
    deleteSavedPlace,
  } = useHistory();

  const handleRouteCalculated = useCallback(
    (calculatedRoute: any) => {
      if (calculatedRoute) {
        addRoute({
          originName: calculatedRoute.origin.name || 'Origin',
          originLat: calculatedRoute.origin.lat,
          originLng: calculatedRoute.origin.lng,
          destName: calculatedRoute.destination.name || 'Destination',
          destLat: calculatedRoute.destination.lat,
          destLng: calculatedRoute.destination.lng,
          distanceKm: calculatedRoute.distanceKm,
          durationMin: calculatedRoute.durationMin,
          travelMode: calculatedRoute.travelMode,
        });
      }
    },
    [addRoute]
  );

  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    travelMode,
    setTravelMode,
    routeInfo,
    isLoading: isRoutingLoading,
    error: routingError,
    showSteps,
    setShowSteps,
    calculateRoute,
    clearRoute,
    reverseRoute,
  } = useMapRouting(handleRouteCalculated);

  // Sync user location as default origin
  useEffect(() => {
    if (userCoords && !origin) {
      setOrigin({
        coords: userCoords,
        name: 'My Current Location',
      });
    }
  }, [userCoords, origin, setOrigin]);

  // Handle selecting a destination from Search, Preset Chips, or History
  const handleSelectDestination = (place: PlaceResult) => {
    const coords: Coordinates = { lat: place.lat, lng: place.lng };
    setDestination({
      coords,
      name: place.name,
    });

    // Save to search history
    addSearch({
      query: place.name,
      placeName: place.name,
      address: place.formattedAddress,
      latitude: place.lat,
      longitude: place.lng,
      category: place.category,
    });

    // Recenter map to destination
    if (mapControlsRef.current) {
      mapControlsRef.current.panTo(coords);
    }
  };

  // Handle selecting a custom origin (PDF Bonus: route between arbitrary origin & destination)
  const handleSelectOrigin = (place: PlaceResult) => {
    const coords: Coordinates = { lat: place.lat, lng: place.lng };
    setOrigin({
      coords,
      name: place.name,
    });
    if (mapControlsRef.current) {
      mapControlsRef.current.panTo(coords);
    }
  };

  // Map Click Handler: click on map to set destination
  const handleMapClick = async (clickedCoords: Coordinates) => {
    try {
      const address = await OsmService.reverseGeocode(clickedCoords.lat, clickedCoords.lng);
      setDestination({
        coords: clickedCoords,
        name: address.split(',')[0] || `Point (${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)})`,
      });
    } catch {
      setDestination({
        coords: clickedCoords,
        name: `Location (${clickedCoords.lat.toFixed(4)}, ${clickedCoords.lng.toFixed(4)})`,
      });
    }
  };

  // "My Location" button handler
  const handleRecenterLocation = async () => {
    let target = userCoords;
    if (!target) {
      target = await requestLocation();
    }
    if (target && mapControlsRef.current) {
      mapControlsRef.current.panTo(target);
      if (!origin) {
        setOrigin({ coords: target, name: 'My Current Location' });
      }
    }
  };

  // Show Route Action (PDF Requirement Section 4 Step 5 & Section 7)
  const handleShowRoute = () => {
    calculateRoute(mapEngine);
  };

  // Replay a route from history
  const handleReplayRoute = (histRoute: RouteHistoryItem) => {
    setOrigin({
      coords: { lat: histRoute.originLat, lng: histRoute.originLng },
      name: histRoute.originName,
    });
    setDestination({
      coords: { lat: histRoute.destLat, lng: histRoute.destLng },
      name: histRoute.destName,
    });
    setTravelMode(histRoute.travelMode as any);
    calculateRoute(mapEngine, {
      coords: { lat: histRoute.originLat, lng: histRoute.originLng },
      name: histRoute.originName,
    }, {
      coords: { lat: histRoute.destLat, lng: histRoute.destLng },
      name: histRoute.destName,
    }, histRoute.travelMode as any);
  };

  const handleKeySaved = (newKey: string) => {
    setGoogleKey(newKey);
    if (newKey) {
      setMapEngine('google');
    }
  };

  const isCurrentDestinationSaved = Boolean(
    destination && savedPlaces.some((p) => p.name === destination.name)
  );

  const handleSaveFavoriteDestination = () => {
    if (destination) {
      addSavedPlace({
        name: destination.name,
        label: 'Favorite',
        address: destination.name,
        latitude: destination.coords.lat,
        longitude: destination.coords.lng,
      });
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 select-none">
      {/* Top Navbar */}
      <Navbar
        mapEngine={mapEngine}
        setMapEngine={setMapEngine}
        hasGoogleKey={Boolean(googleKey)}
        theme={theme}
        setTheme={setTheme}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSavedPlaces={() => setIsSavedPlacesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedPlacesCount={savedPlaces.length}
      />

      {/* Fullscreen Interactive Map */}
      <main className="w-full h-full pt-14">
        <MapView
          mapEngine={mapEngine}
          setMapEngine={setMapEngine}
          hasGoogleKey={Boolean(googleKey)}
          userCoords={userCoords}
          destinationCoords={destination ? destination.coords : null}
          destinationName={destination ? destination.name : undefined}
          routeInfo={routeInfo}
          theme={theme}
          onMapClick={handleMapClick}
          onControlsReady={(controls) => {
            mapControlsRef.current = controls;
          }}
        />
      </main>

      {/* Floating Top Search Area */}
      <div className="absolute top-18 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-20 flex flex-col space-y-2 pointer-events-none">
        <div className="pointer-events-auto">
          <SearchBar
            mapEngine={mapEngine}
            userCoords={userCoords}
            onSelectDestination={handleSelectDestination}
            onSelectOrigin={handleSelectOrigin}
            isRoutingActive={Boolean(routeInfo)}
            selectedDestinationName={destination?.name}
            onUseCurrentLocationAsOrigin={handleRecenterLocation}
          />
        </div>

        <div className="pointer-events-auto">
          <QuickSearchChips onSelectPlace={handleSelectDestination} />
        </div>
      </div>

      {/* Location Permission & Error Banner */}
      <LocationPermissionBanner
        permissionStatus={permissionStatus}
        error={geoError}
        onRetry={requestLocation}
        onDismiss={() => setIsPermissionBannerDismissed(true)}
        isDismissed={isPermissionBannerDismissed}
      />

      {/* Floating Bottom Route Info Card (Visible when destination is selected or route is calculated) */}
      {destination && (
        <RouteInfoCard
          originName={origin?.name || 'My Location'}
          destName={destination.name}
          travelMode={travelMode}
          setTravelMode={(mode) => {
            setTravelMode(mode);
            if (routeInfo) {
              calculateRoute(mapEngine, undefined, undefined, mode);
            }
          }}
          routeInfo={routeInfo}
          isLoading={isRoutingLoading}
          error={routingError}
          showSteps={showSteps}
          setShowSteps={setShowSteps}
          onShowRoute={handleShowRoute}
          onClearRoute={() => {
            clearRoute();
            setDestination(null);
          }}
          onReverseRoute={reverseRoute}
          onSaveFavorite={handleSaveFavoriteDestination}
          isSaved={isCurrentDestinationSaved}
        />
      )}

      {/* Map Control Buttons (Recenter, Zoom, Theme, Fit) */}
      <MapControls
        onRecenterLocation={handleRecenterLocation}
        isLocationLoading={geoLoading}
        onZoomIn={() => mapControlsRef.current?.zoomIn()}
        onZoomOut={() => mapControlsRef.current?.zoomOut()}
        theme={theme}
        setTheme={setTheme}
        onFitRoute={() => mapControlsRef.current?.fitBounds()}
        hasActiveRoute={Boolean(routeInfo)}
      />

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        searchHistory={searchHistory}
        routeHistory={routeHistory}
        onSelectSearchItem={(item) =>
          handleSelectDestination({
            id: item.id,
            name: item.placeName,
            formattedAddress: item.address || item.placeName,
            lat: item.latitude,
            lng: item.longitude,
            category: item.category,
          })
        }
        onReplayRoute={handleReplayRoute}
        onClearHistory={clearSearches}
      />

      {/* Saved Places Slide-over Drawer */}
      <SavedPlacesDrawer
        isOpen={isSavedPlacesOpen}
        onClose={() => setIsSavedPlacesOpen(false)}
        savedPlaces={savedPlaces}
        onSelectPlace={handleSelectDestination}
        onAddPlace={addSavedPlace}
        onDeletePlace={deleteSavedPlace}
        currentDestination={destination}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        mapEngine={mapEngine}
        setMapEngine={setMapEngine}
        onKeySaved={handleKeySaved}
      />
    </div>
  );
};

export default App;
