import { useState, useEffect, useCallback } from 'react';
import { SearchHistoryItem, RouteHistoryItem, SavedPlace } from '../types';
import { historyService, savedPlacesService } from '../services/api';

export function useHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [routeHistory, setRouteHistory] = useState<RouteHistoryItem[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [searches, routes, places] = await Promise.all([
        historyService.getSearchHistory(),
        historyService.getRouteHistory(),
        savedPlacesService.getSavedPlaces(),
      ]);
      setSearchHistory(searches);
      setRouteHistory(routes);
      setSavedPlaces(places);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addSearch = async (item: Omit<SearchHistoryItem, 'id' | 'createdAt'>) => {
    const saved = await historyService.addSearchHistory(item);
    setSearchHistory((prev) => [saved, ...prev.filter((i) => i.placeName !== item.placeName)]);
  };

  const clearSearches = async () => {
    await historyService.clearSearchHistory();
    setSearchHistory([]);
  };

  const addRoute = async (item: Omit<RouteHistoryItem, 'id' | 'createdAt'>) => {
    const saved = await historyService.addRouteHistory(item);
    setRouteHistory((prev) => [saved, ...prev]);
  };

  const addSavedPlace = async (place: Omit<SavedPlace, 'id' | 'createdAt'>) => {
    const saved = await savedPlacesService.addSavedPlace(place);
    setSavedPlaces((prev) => [saved, ...prev]);
  };

  const deleteSavedPlace = async (id: string) => {
    await savedPlacesService.deleteSavedPlace(id);
    setSavedPlaces((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    searchHistory,
    routeHistory,
    savedPlaces,
    loading,
    addSearch,
    clearSearches,
    addRoute,
    addSavedPlace,
    deleteSavedPlace,
    refreshHistory: fetchAll,
  };
}
