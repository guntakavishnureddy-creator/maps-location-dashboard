import React from 'react';
import { AlertTriangle, MapPinOff, RefreshCw, X } from 'lucide-react';

interface LocationPermissionBannerProps {
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  error: string | null;
  onRetry: () => void;
  onDismiss: () => void;
  isDismissed: boolean;
}

export const LocationPermissionBanner: React.FC<LocationPermissionBannerProps> = ({
  permissionStatus,
  error,
  onRetry,
  onDismiss,
  isDismissed,
}) => {
  if (isDismissed || permissionStatus === 'granted' || (!error && permissionStatus === 'prompt')) {
    return null;
  }

  const isDenied = permissionStatus === 'denied' || (error && error.toLowerCase().includes('denied'));
  const isUnsupported = permissionStatus === 'unsupported' || (error && error.toLowerCase().includes('not supported'));

  return (
    <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-20 animate-slide-up">
      <div className="p-3.5 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800 rounded-xl shadow-lg backdrop-blur-md text-amber-900 dark:text-amber-200 flex items-start space-x-3">
        <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          {isDenied ? <MapPinOff className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
        </div>

        <div className="flex-1 text-xs">
          <p className="font-semibold mb-1">
            {isDenied
              ? 'Location Permission Denied'
              : isUnsupported
              ? 'Geolocation Unsupported'
              : 'Location Access Notice'}
          </p>
          <p className="leading-relaxed text-amber-800 dark:text-amber-300/90">
            {isDenied
              ? 'Location access is required to automatically route from your current position. You can still manually search for places or select any origin on the map.'
              : error || 'Browser geolocation is currently unavailable. Using default map center.'}
          </p>

          <div className="mt-2.5 flex items-center space-x-2">
            {!isUnsupported && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-[11px] transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            )}
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md font-medium text-[11px] transition-colors"
            >
              Continue Manually
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 p-0.5"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
