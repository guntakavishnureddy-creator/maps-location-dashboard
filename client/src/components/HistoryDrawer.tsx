import React, { useState } from 'react';
import {
  X,
  History,
  Navigation,
  Clock,
  Trash2,
  ArrowRight,
  MapPin,
  Car,
  Footprints,
  Bike,
  Bus,
} from 'lucide-react';
import { SearchHistoryItem, RouteHistoryItem, PlaceResult, Coordinates } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: SearchHistoryItem[];
  routeHistory: RouteHistoryItem[];
  onSelectSearchItem: (item: SearchHistoryItem) => void;
  onReplayRoute: (route: RouteHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  searchHistory,
  routeHistory,
  onSelectSearchItem,
  onReplayRoute,
  onClearHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'searches' | 'routes'>('searches');

  if (!isOpen) return null;

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'WALKING':
        return <Footprints className="w-3.5 h-3.5 text-zinc-500" />;
      case 'BICYCLING':
        return <Bike className="w-3.5 h-3.5 text-zinc-500" />;
      case 'TRANSIT':
        return <Bus className="w-3.5 h-3.5 text-zinc-500" />;
      default:
        return <Car className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <History className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Activity & History
              </h2>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={onClearHistory}
                className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Clear History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex p-2 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('searches')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'searches'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              Recent Searches ({searchHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('routes')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'routes'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              Past Routes ({routeHistory.length})
            </button>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeTab === 'searches' ? (
              searchHistory.length > 0 ? (
                searchHistory.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelectSearchItem(item);
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {item.placeName}
                        </h4>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    {item.address && (
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-6 line-clamp-1">
                        {item.address}
                      </p>
                    )}
                    <div className="mt-2 pl-6 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Query: "{item.query}"</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium group-hover:underline flex items-center gap-0.5">
                        View <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recent searches yet.</p>
                  <p className="text-[11px] mt-1">Places you search will appear here.</p>
                </div>
              )
            ) : routeHistory.length > 0 ? (
              routeHistory.map((route) => (
                <div
                  key={route.id}
                  onClick={() => {
                    onReplayRoute(route);
                    onClose();
                  }}
                  className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 font-medium text-zinc-500">
                      {getModeIcon(route.travelMode)}
                      <span className="capitalize">{route.travelMode.toLowerCase()}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {formatTime(route.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-1 pl-1 border-l-2 border-blue-500 my-1">
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-300 truncate">
                      From: <span className="font-semibold">{route.originName}</span>
                    </p>
                    <p className="text-[11px] text-zinc-900 dark:text-zinc-100 font-bold truncate">
                      To: {route.destName}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {route.distanceKm} km
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400">
                        ~{route.durationMin} min
                      </span>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 font-semibold text-[11px] group-hover:underline flex items-center gap-1">
                      Route <Navigation className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-xs">
                <Navigation className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No route history yet.</p>
                <p className="text-[11px] mt-1">Routes you calculate will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
