import { useState, useEffect } from 'react';
import type { LocationData } from '../types';

interface UseGeolocationOptions {
  onLocationUpdate?: (latitude: number, longitude: number) => void;
  enabled?: boolean;
}

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const { onLocationUpdate, enabled = true } = options;
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) return;

    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    let watchId: number;

    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(locData);
          setWatching(true);
          setError(null);
          setPermissionDenied(false);
          
          // Notify parent component of location update
          onLocationUpdate?.(locData.latitude, locData.longitude);
        },
        (err) => {
          console.error('Geolocation error:', err);
          if (err.code === 1) {
            setPermissionDenied(true);
            setError('Location permission denied. Please enable GPS.');
          } else if (err.code === 2) {
            setError('Position unavailable. Check your GPS signal.');
          } else if (err.code === 3) {
            setError('Location request timed out.');
          } else {
            setError(err.message);
          }
          setWatching(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );
    };

    startWatching();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [enabled, onLocationUpdate]);

  return {
    location,
    error,
    watching,
    permissionDenied,
  };
};