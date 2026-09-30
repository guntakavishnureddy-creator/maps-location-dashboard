import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  X,
  Loader2,
  Navigation,
  ArrowRight,
  Plane,
  Building,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { PlaceResult, MapEngine, Coordinates } from '../types';
import { GoogleMapsService } from '../services/googleMaps';
import { OsmService } from '../services/osmService';

interface SearchBarProps {
  mapEngine: MapEngine;
  userCoords: Coordinates | null;
  onSelectDestination: (place: PlaceResult) => void;
  onSelectOrigin?: (place: PlaceResult) => void;
  isRoutingActive: boolean;
  selectedDestinationName?: string;
  onUseCurrentLocationAsOrigin?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  mapEngine,
  userCoords,
  onSelectDestination,
  onSelectOrigin,
  isRoutingActive,
  selectedDestinationName,
  onUseCurrentLocationAsOrigin,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<'destination' | 'origin'>('destination');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      let places: PlaceResult[] = [];
      if (mapEngine === 'google' && GoogleMapsService.getApiKey()) {
        places = await GoogleMapsService.searchPlaces(searchTerm, userCoords || undefined);
        if (places.length === 0) {
          places = await OsmService.searchPlaces(searchTerm, userCoords || undefined);
        }
      } else {
        places = await OsmService.searchPlaces(searchTerm, userCoords || undefined);
      }
      setResults(places);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (val.trim().length > 1) {
      debounceRef.current = setTimeout(() => {
        performSearch(val);
      }, 350);
    } else {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleSelect(results[0]);
      } else if (query.trim()) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSearch(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setIsOpen(false);
    if (searchTarget === 'origin' && onSelectOrigin) {
      onSelectOrigin(place);
    } else {
      onSelectDestination(place);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setHasSearched(false);
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return <MapPin className="w-4 h-4 text-zinc-400" />;
    const cat = category.toLowerCase();
    if (cat.includes('airport') || cat.includes('aeroway'))
      return <Plane className="w-4 h-4 text-sky-500" />;
    if (cat.includes('univ') || cat.includes('school') || cat.includes('college'))
      return <GraduationCap className="w-4 h-4 text-indigo-500" />;
    if (cat.includes('city') || cat.includes('adm') || cat.includes('bound'))
      return <Building className="w-4 h-4 text-amber-500" />;
    return <MapPin className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input Box */}
      <div className="relative flex items-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-floating dark:shadow-floating-dark border border-zinc-200/80 dark:border-zinc-800 transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Origin/Destination switch button */}
        <button
          type="button"
          onClick={() => setSearchTarget(searchTarget === 'destination' ? 'origin' : 'destination')}
          className={`flex items-center gap-1 pl-3 pr-2 py-3 text-xs font-semibold rounded-l-2xl transition-colors ${
            searchTarget === 'destination'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}
          title="Click to toggle searching Origin vs Destination"
        >
          <span className="w-2.5 h-2.5 rounded-full border-2 border-current" />
          <span className="capitalize">{searchTarget}</span>
        </button>

        <span className="text-zinc-300 dark:text-zinc-700">|</span>

        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={
            searchTarget === 'destination'
              ? 'Where to? (e.g. Bangalore, SRM, Airport)'
              : 'Search starting point or city'
          }
          className="flex-1 px-3 py-3 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
        />

        {/* Action icons in input */}
        <div className="flex items-center pr-3 space-x-1">
          {isLoading && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}

          {query && !isLoading && (
            <button
              onClick={handleClear}
              className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {!query && (
            <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>
      </div>

      {/* Dropdown Suggestions */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden z-40 max-h-80 overflow-y-auto animate-fade-in">
          {/* Quick Option: Use current location if searching origin */}
          {searchTarget === 'origin' && onUseCurrentLocationAsOrigin && (
            <button
              onClick={() => {
                onUseCurrentLocationAsOrigin();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-950/40 border-b border-zinc-100 dark:border-zinc-800 transition-colors"
            >
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Use My Current Location
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : 'Detect with GPS'}
                </p>
              </div>
            </button>
          )}

          {/* Search Result Items */}
          {results.length > 0 ? (
            results.map((place) => (
              <button
                key={place.id}
                onClick={() => handleSelect(place)}
                className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800/40 last:border-b-0 transition-colors group"
              >
                <div className="p-2 mt-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {getCategoryIcon(place.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {place.name}
                  </p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                    {place.formattedAddress}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all mt-2" />
              </button>
            ))
          ) : hasSearched && !isLoading ? (
            <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300">No locations found</p>
              <p className="text-[11px] mt-1">Try searching for a different city, landmark, or street.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
