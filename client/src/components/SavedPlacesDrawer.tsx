import React, { useState } from 'react';
import {
  X,
  Bookmark,
  Plus,
  Trash2,
  Navigation,
  Building,
  GraduationCap,
  Plane,
  Briefcase,
  MapPin,
} from 'lucide-react';
import { SavedPlace, PlaceResult, Coordinates } from '../types';

interface SavedPlacesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlaces: SavedPlace[];
  onSelectPlace: (place: PlaceResult) => void;
  onAddPlace: (place: Omit<SavedPlace, 'id' | 'createdAt'>) => void;
  onDeletePlace: (id: string) => void;
  currentDestination?: { coords: Coordinates; name: string } | null;
}

export const SavedPlacesDrawer: React.FC<SavedPlacesDrawerProps> = ({
  isOpen,
  onClose,
  savedPlaces,
  onSelectPlace,
  onAddPlace,
  onDeletePlace,
  currentDestination,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('Favorite');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');

  if (!isOpen) return null;

  const handleUseCurrentDestination = () => {
    if (currentDestination) {
      setName(currentDestination.name);
      setAddress(currentDestination.name);
      setLat(String(currentDestination.coords.lat));
      setLng(String(currentDestination.coords.lng));
      setShowAddForm(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lat || !lng) return;

    onAddPlace({
      name,
      label,
      address: address || name,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      icon: label.toLowerCase(),
    });

    setName('');
    setAddress('');
    setLat('');
    setLng('');
    setShowAddForm(false);
  };

  const getLabelIcon = (placeLabel: string) => {
    const l = placeLabel.toLowerCase();
    if (l.includes('airport')) return <Plane className="w-4 h-4 text-sky-500" />;
    if (l.includes('university') || l.includes('campus'))
      return <GraduationCap className="w-4 h-4 text-indigo-500" />;
    if (l.includes('tech') || l.includes('work') || l.includes('office'))
      return <Briefcase className="w-4 h-4 text-emerald-500" />;
    if (l.includes('city')) return <Building className="w-4 h-4 text-amber-500" />;
    return <MapPin className="w-4 h-4 text-rose-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Bookmark className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Saved Favorites ({savedPlaces.length})
              </h2>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Place
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Add from Current Destination button */}
          {currentDestination && !showAddForm && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate pr-2">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate text-zinc-700 dark:text-zinc-300">
                  Save current: <strong className="text-zinc-900 dark:text-white">{currentDestination.name}</strong>
                </span>
              </div>
              <button
                onClick={handleUseCurrentDestination}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
              >
                Save
              </button>
            </div>
          )}

          {/* Add Place Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Add New Favorite Location
              </h3>
              <div>
                <label className="block text-[11px] font-medium text-zinc-500 mb-1">Place Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. My Office or Campus"
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Category Label</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="University">University</option>
                    <option value="Airport">Airport</option>
                    <option value="Favorite">Favorite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Address / Landmark</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 100 Feet Rd"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="12.9716"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="77.5946"
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                >
                  Save Place
                </button>
              </div>
            </form>
          )}

          {/* Places List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {savedPlaces.map((place) => (
              <div
                key={place.id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 transition-all flex items-start justify-between group"
              >
                <div
                  onClick={() => {
                    onSelectPlace({
                      id: place.id,
                      name: place.name,
                      formattedAddress: place.address,
                      lat: place.latitude,
                      lng: place.longitude,
                    });
                    onClose();
                  }}
                  className="flex-1 cursor-pointer pr-3"
                >
                  <div className="flex items-center gap-2">
                    {getLabelIcon(place.label)}
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {place.name}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium">
                      {place.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-6 line-clamp-1">
                    {place.address}
                  </p>
                  <div className="mt-2 pl-6 flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Set as Destination</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePlace(place.id);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 opacity-60 group-hover:opacity-100 transition-opacity"
                  title="Delete Favorite"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
