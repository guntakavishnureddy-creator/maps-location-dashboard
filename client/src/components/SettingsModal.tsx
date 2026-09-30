import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Key,
  Database,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Server,
  RefreshCw,
} from 'lucide-react';
import { MapEngine } from '../types';
import { GoogleMapsService } from '../services/googleMaps';
import axios from 'axios';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapEngine: MapEngine;
  setMapEngine: (engine: MapEngine) => void;
  onKeySaved: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  mapEngine,
  setMapEngine,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [backendHealth, setBackendHealth] = useState<{
    status: string;
    database: string;
    googleMapsConfigured: boolean;
  } | null>(null);
  const [checkingBackend, setCheckingBackend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(GoogleMapsService.getApiKey());
      checkHealth();
    }
  }, [isOpen]);

  const checkHealth = async () => {
    setCheckingBackend(true);
    try {
      const res = await axios.get('http://localhost:5000/api/health', { timeout: 3000 });
      setBackendHealth(res.data);
    } catch {
      setBackendHealth(null);
    } finally {
      setCheckingBackend(false);
    }
  };

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    localStorage.setItem('GOOGLE_MAPS_API_KEY', cleanKey);
    GoogleMapsService.setApiKey(cleanKey);
    onKeySaved(cleanKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Dashboard & API Settings
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Google Cloud Platform, Maps engine, and backend configuration
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Active Engine Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Primary Maps Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMapEngine('google')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  mapEngine === 'google'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Google Maps Platform
                  </span>
                  <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Official Google Maps JS API, Places autocomplete, and DirectionsService.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMapEngine('leaflet')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  mapEngine === 'leaflet'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    OpenStreetMap / OSRM
                  </span>
                  <Globe className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[11px] text-zinc-500 leading-snug">
                  Free open mapping, OSRM turn-by-turn routing, no credit card required.
                </p>
              </button>
            </div>
          </div>

          {/* Google Maps API Key Input */}
          <form onSubmit={handleSaveKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Google Maps API Key
              </label>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <div className="relative">
              <Key className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-9 pr-24 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save Key
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Can also be configured in <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">client/.env</code> as <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-[10px]">VITE_GOOGLE_MAPS_API_KEY</code>.
            </p>
          </form>

          {/* Backend & Database Status */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                <Server className="w-4 h-4 text-blue-500" />
                <span>Backend Express Server & Database</span>
              </div>
              <button
                onClick={checkHealth}
                disabled={checkingBackend}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingBackend ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendHealth?.status === 'healthy' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Status: <strong>{backendHealth ? 'Online (Port 5000)' : 'Offline / Fallback'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  DB: <strong>{backendHealth?.database || 'SQLite / Local'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Google Cloud Checklist Guide */}
          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-2">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Google Cloud Setup Guide
            </h4>
            <ul className="text-[11px] text-blue-800 dark:text-blue-300/80 space-y-1 pl-4 list-disc">
              <li>Enable <strong>Maps JavaScript API</strong> in Google Cloud Console</li>
              <li>Enable <strong>Places API</strong> (New or Legacy) for search & autocomplete</li>
              <li>Enable <strong>Directions API</strong> for road route calculations</li>
              <li>Restrict API key to HTTP Referrers (e.g. <code>localhost:5173</code> or your production domain)</li>
            </ul>
          </div>
        </div>

        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
