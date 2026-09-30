import React from 'react';
import {
  Navigation,
  Compass,
  Bookmark,
  History,
  Moon,
  Sun,
  Settings,
  Layers,
  MapPin,
} from 'lucide-react';
import { MapEngine, MapTheme } from '../types';

interface NavbarProps {
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;
  hasGoogleKey: boolean;
  theme: MapTheme;
  setTheme: (theme: MapTheme) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onOpenHistory: () => void;
  onOpenSavedPlaces: () => void;
  onOpenSettings: () => void;
  savedPlacesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  mapEngine,
  setMapEngine,
  hasGoogleKey,
  theme,
  setTheme,
  isDarkMode,
  toggleDarkMode,
  onOpenHistory,
  onOpenSavedPlaces,
  onOpenSettings,
  savedPlacesCount,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm">
      {/* Brand / Logo */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black shadow-md">
          <Navigation className="w-5 h-5 -rotate-45" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
            NaviPulse
            <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              Maps Dashboard
            </span>
          </h1>
          <p className="hidden md:block text-[11px] text-zinc-500 dark:text-zinc-400">
            Maps API • Geolocation • Routing • Places
          </p>
        </div>
      </div>

      {/* Center Engine Indicator */}
      <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-medium">
        <button
          onClick={() => setMapEngine('google')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mapEngine === 'google'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
          title={hasGoogleKey ? 'Google Maps Platform Active' : 'Enter API Key in Settings to activate Google Maps'}
        >
          <span className={`w-2 h-2 rounded-full ${hasGoogleKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
          Google Maps
          {!hasGoogleKey && <span className="text-[10px] text-amber-500 font-normal">(Needs Key)</span>}
        </button>

        <button
          onClick={() => setMapEngine('leaflet')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            mapEngine === 'leaflet'
              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm font-semibold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          OpenStreetMap / OSRM
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Saved Places */}
        <button
          onClick={onOpenSavedPlaces}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="Saved Places"
        >
          <Bookmark className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Saved</span>
          {savedPlacesCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-500 rounded-full">
              {savedPlacesCount}
            </span>
          )}
        </button>

        {/* History */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="Search & Route History"
        >
          <History className="w-4 h-4 text-blue-500" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1.5 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors"
          title="API Keys & Map Settings"
        >
          <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
        </button>
      </div>
    </header>
  );
};
