import axios from 'axios';
import { SearchHistoryItem, RouteHistoryItem, SavedPlace } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

// Helper for local storage backup so the app works even offline or before backend is up
const LOCAL_STORAGE_KEYS = {
  SEARCH_HISTORY: 'maps_dashboard_search_history',
  ROUTE_HISTORY: 'maps_dashboard_route_history',
  SAVED_PLACES: 'maps_dashboard_saved_places',
};

export const historyService = {
  async getSearchHistory(): Promise<SearchHistoryItem[]> {
    try {
      const response = await api.get('/history/searches');
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY);
      return local ? JSON.parse(local) : [];
    }
  },

  async addSearchHistory(item: Omit<SearchHistoryItem, 'id' | 'createdAt'>): Promise<SearchHistoryItem> {
    try {
      const response = await api.post('/history/searches', item);
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY);
      const list: SearchHistoryItem[] = local ? JSON.parse(local) : [];
      const newItem: SearchHistoryItem = {
        ...item,
        id: 'local-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      list.unshift(newItem);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(list.slice(0, 50)));
      return newItem;
    }
  },

  async clearSearchHistory(): Promise<void> {
    try {
      await api.delete('/history/searches');
    } catch {
      // fallback
    }
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SEARCH_HISTORY);
  },

  async getRouteHistory(): Promise<RouteHistoryItem[]> {
    try {
      const response = await api.get('/history/routes');
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.ROUTE_HISTORY);
      return local ? JSON.parse(local) : [];
    }
  },

  async addRouteHistory(item: Omit<RouteHistoryItem, 'id' | 'createdAt'>): Promise<RouteHistoryItem> {
    try {
      const response = await api.post('/history/routes', item);
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.ROUTE_HISTORY);
      const list: RouteHistoryItem[] = local ? JSON.parse(local) : [];
      const newItem: RouteHistoryItem = {
        ...item,
        id: 'local-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      list.unshift(newItem);
      localStorage.setItem(LOCAL_STORAGE_KEYS.ROUTE_HISTORY, JSON.stringify(list.slice(0, 50)));
      return newItem;
    }
  },
};

export const savedPlacesService = {
  async getSavedPlaces(): Promise<SavedPlace[]> {
    try {
      const response = await api.get('/saved-places');
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PLACES);
      if (local) return JSON.parse(local);
      // Default initial favorites
      const defaults: SavedPlace[] = [
        {
          id: 'def-1',
          name: 'Bangalore Central',
          label: 'City Center',
          address: 'MG Road, Bengaluru, Karnataka, India',
          latitude: 12.9716,
          longitude: 77.5946,
          icon: 'building',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'def-2',
          name: 'Kempegowda International Airport',
          label: 'Airport',
          address: 'KIAL Rd, Devanahalli, Bengaluru, Karnataka 560300',
          latitude: 13.1986,
          longitude: 77.7066,
          icon: 'plane',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'def-3',
          name: 'SRM University AP',
          label: 'University',
          address: 'Neerukonda, Mangalagiri Mandal, Guntur, Andhra Pradesh 522502',
          latitude: 16.4649,
          longitude: 80.5085,
          icon: 'graduation-cap',
          createdAt: new Date().toISOString(),
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PLACES, JSON.stringify(defaults));
      return defaults;
    }
  },

  async addSavedPlace(place: Omit<SavedPlace, 'id' | 'createdAt'>): Promise<SavedPlace> {
    try {
      const response = await api.post('/saved-places', place);
      return response.data;
    } catch {
      const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PLACES);
      const list: SavedPlace[] = local ? JSON.parse(local) : [];
      const newPlace: SavedPlace = {
        ...place,
        id: 'local-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      list.unshift(newPlace);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PLACES, JSON.stringify(list));
      return newPlace;
    }
  },

  async deleteSavedPlace(id: string): Promise<void> {
    try {
      await api.delete(`/saved-places/${id}`);
    } catch {
      // fallback
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.SAVED_PLACES);
    if (local) {
      const list: SavedPlace[] = JSON.parse(local);
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SAVED_PLACES, JSON.stringify(filtered));
    }
  }
};
