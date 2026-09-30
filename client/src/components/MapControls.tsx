import React from 'react';
import {
  Crosshair,
  Plus,
  Minus,
  Layers,
  Maximize2,
  Navigation,
  Loader2,
} from 'lucide-react';
import { MapTheme } from '../types';

interface MapControlsProps {
  onRecenterLocation: () => void;
  isLocationLoading: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  theme: MapTheme;
  setTheme: (theme: MapTheme) => void;
  onFitRoute?: () => void;
  hasActiveRoute: boolean;
}

export const MapControls: React.FC<MapControlsProps> = ({
  onRecenterLocation,
  isLocationLoading,
  onZoomIn,
  onZoomOut,
  theme,
  setTheme,
  onFitRoute,
  hasActiveRoute,
}) => {
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('satellite');
    else setTheme('light');
  };

  return (
    <div className="absolute right-4 bottom-24 sm:bottom-8 z-20 flex flex-col space-y-2.5">
      {/* Fit Route Bounds Button */}
      {hasActiveRoute && onFitRoute && (
        <button
          onClick={onFitRoute}
          className="p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95"
          title="Fit Route to Viewport"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      )}

      {/* Map Layer / Theme Switcher */}
      <button
        onClick={cycleTheme}
        className="p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95"
        title={`Current Map: ${theme.toUpperCase()} (Click to toggle style)`}
      >
        <Layers className="w-5 h-5" />
      </button>

      {/* "My Location" Button */}
      <button
        onClick={onRecenterLocation}
        disabled={isLocationLoading}
        className="p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-blue-600 dark:text-blue-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 transition-all hover:scale-105 active:scale-95 group"
        title="My Location (Recenter map & update marker)"
      >
        {isLocationLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Crosshair className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        )}
      </button>

      {/* Zoom In & Zoom Out Stack */}
      <div className="flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800/80 transition-colors"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          className="p-3 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
