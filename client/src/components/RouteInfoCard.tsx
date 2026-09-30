import React from 'react';
import {
  Car,
  Footprints,
  Bike,
  Bus,
  ArrowRight,
  ArrowUpDown,
  Clock,
  Milestone,
  ChevronDown,
  ChevronUp,
  X,
  Bookmark,
  Share2,
  Navigation,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { RouteInfo, TravelMode, Coordinates } from '../types';

interface RouteInfoCardProps {
  originName: string;
  destName: string;
  travelMode: TravelMode;
  setTravelMode: (mode: TravelMode) => void;
  routeInfo: RouteInfo | null;
  isLoading: boolean;
  error: string | null;
  showSteps: boolean;
  setShowSteps: (show: boolean) => void;
  onShowRoute: () => void;
  onClearRoute: () => void;
  onReverseRoute: () => void;
  onSaveFavorite?: () => void;
  isSaved?: boolean;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({
  originName,
  destName,
  travelMode,
  setTravelMode,
  routeInfo,
  isLoading,
  error,
  showSteps,
  setShowSteps,
  onShowRoute,
  onClearRoute,
  onReverseRoute,
  onSaveFavorite,
  isSaved,
}) => {
  const modes: { mode: TravelMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'DRIVING', label: 'Drive', icon: <Car className="w-4 h-4" /> },
    { mode: 'WALKING', label: 'Walk', icon: <Footprints className="w-4 h-4" /> },
    { mode: 'BICYCLING', label: 'Cycle', icon: <Bike className="w-4 h-4" /> },
    { mode: 'TRANSIT', label: 'Transit', icon: <Bus className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-96 z-20 animate-slide-up">
      <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 p-4 transition-all">
        {/* Header & Close */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Trip Details
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {onSaveFavorite && (
              <button
                onClick={onSaveFavorite}
                className={`p-1.5 rounded-lg transition-colors ${
                  isSaved
                    ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={isSaved ? 'Saved to Favorites' : 'Save to Favorites'}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={onClearRoute}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              title="Clear Route and Destination"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Origin & Destination Display */}
        <div className="py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="truncate">{originName || 'My Location'}</span>
            </div>
            <div className="w-0.5 h-3.5 bg-zinc-200 dark:bg-zinc-700 ml-1 my-0.5" />
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span className="truncate">{destName}</span>
            </div>
          </div>

          <button
            onClick={onReverseRoute}
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Travel Mode Pills */}
        <div className="grid grid-cols-4 gap-1.5 my-2">
          {modes.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setTravelMode(mode)}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-[11px] font-medium transition-all ${
                travelMode === mode
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {icon}
              <span className="mt-1">{label}</span>
            </button>
          ))}
        </div>

        {/* Error message state */}
        {error && (
          <div className="my-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Distance & Time Highlight banner */}
        {routeInfo && !error && (
          <div className="my-3 p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-100 dark:border-blue-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-600 text-white">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Estimated Time
                </p>
                <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {routeInfo.durationText}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-blue-200 dark:bg-blue-800" />

            <div className="flex items-center gap-2.5 pr-2">
              <div className="p-2 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                <Milestone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                  Distance
                </p>
                <p className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                  {routeInfo.distanceText}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Show Route or Clear */}
        <div className="mt-3 flex items-center space-x-2">
          {!routeInfo ? (
            <button
              onClick={onShowRoute}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-2xl font-semibold text-xs tracking-wide shadow-md transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating Route...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Show Route
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl font-medium text-xs transition-colors"
              >
                <span>{showSteps ? 'Hide' : 'View'} Directions</span>
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClearRoute}
                className="py-2.5 px-4 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-2xl font-medium text-xs transition-colors"
              >
                Clear
              </button>
            </>
          )}
        </div>

        {/* Turn-by-Turn Directions List */}
        {showSteps && routeInfo && routeInfo.steps.length > 0 && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 max-h-48 overflow-y-auto space-y-2 pr-1">
            <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Maneuvers ({routeInfo.steps.length})
            </p>
            {routeInfo.steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 py-1 border-b border-zinc-50 dark:border-zinc-800/40 last:border-b-0"
              >
                <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="leading-snug">{step.instruction}</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    {step.distance} • {step.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
