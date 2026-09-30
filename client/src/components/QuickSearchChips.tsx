import React from 'react';
import { MapPin, Plane, GraduationCap, Building2, Briefcase } from 'lucide-react';
import { PlaceResult } from '../types';

interface QuickSearchChipsProps {
  onSelectPlace: (place: PlaceResult) => void;
}

const PRESET_PLACES: PlaceResult[] = [
  {
    id: 'preset-bangalore',
    name: 'Bangalore',
    formattedAddress: 'Bengaluru, Karnataka, India',
    lat: 12.9716,
    lng: 77.5946,
    category: 'city',
  },
  {
    id: 'preset-srm-ap',
    name: 'SRM University AP',
    formattedAddress: 'Neerukonda, Mangalagiri Mandal, Guntur, Andhra Pradesh 522502',
    lat: 16.4649,
    lng: 80.5085,
    category: 'university',
  },
  {
    id: 'preset-airport',
    name: 'Bangalore Intl Airport',
    formattedAddress: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
    lat: 13.1986,
    lng: 77.7066,
    category: 'airport',
  },
  {
    id: 'preset-mg-road',
    name: 'MG Road',
    formattedAddress: 'MG Road, Ashok Nagar, Bengaluru, Karnataka 560001',
    lat: 12.9754,
    lng: 77.6067,
    category: 'landmark',
  },
  {
    id: 'preset-ecity',
    name: 'Electronic City',
    formattedAddress: 'Electronic City Phase 1, Bengaluru, Karnataka 560100',
    lat: 12.8452,
    lng: 77.6602,
    category: 'office',
  },
  {
    id: 'preset-hyd',
    name: 'Hyderabad',
    formattedAddress: 'Hyderabad, Telangana, India',
    lat: 17.385,
    lng: 78.4867,
    category: 'city',
  },
];

export const QuickSearchChips: React.FC<QuickSearchChipsProps> = ({ onSelectPlace }) => {
  const getIcon = (category?: string) => {
    switch (category) {
      case 'airport':
        return <Plane className="w-3 h-3 text-sky-500" />;
      case 'university':
        return <GraduationCap className="w-3 h-3 text-indigo-500" />;
      case 'office':
        return <Briefcase className="w-3 h-3 text-emerald-500" />;
      case 'city':
        return <Building2 className="w-3 h-3 text-amber-500" />;
      default:
        return <MapPin className="w-3 h-3 text-rose-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto py-1 px-1 scrollbar-none no-scrollbar">
      <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider pl-1 shrink-0">
        Quick:
      </span>
      {PRESET_PLACES.map((place) => (
        <button
          key={place.id}
          onClick={() => onSelectPlace(place)}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white/95 dark:bg-zinc-800/95 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full border border-zinc-200/80 dark:border-zinc-700 shadow-sm shrink-0 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {getIcon(place.category)}
          <span>{place.name}</span>
        </button>
      ))}
    </div>
  );
};
