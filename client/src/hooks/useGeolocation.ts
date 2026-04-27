import { useState, useEffect } from 'react';
import type { LocationData } from '../types';

interface UseGeolocationOptions {
  enabled?: boolean;
  mockLocation?: LocationData | null;
}

const supportsGeolocation = typeof navigator !== 'undefined' && 'geolocation' in navigator;

export const useGeolocation = (options: UseGeolocationOptions = {}) => {
  const { enabled = true, mockLocation = null } = options;
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(() =>
    supportsGeolocation ? null : 'Geolocation not supported by this browser',
  );
  const [watching, setWatching] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled || !supportsGeolocation) {
      setWatching(false);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setWatching(true);
          setError(null);
          setPermissionDenied(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          if (err.code === 1) {
            setPermissionDenied(true);
            setError('Location permission denied. Please enable GPS.');
          } else if (err.code === 2) {
            setError('Position unavailable. Check your GPS signal.');
          } else {
            setError(err.message);
          }
          setWatching(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        },
      );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setWatching(false);
    };
  }, [enabled]);

  useEffect(() => {
    if (!mockLocation) return;
    setLocation(mockLocation);
    setWatching(true);
    setPermissionDenied(false);
    setError(null);
  }, [mockLocation]);

  const requestPermission = () =>
    new Promise<boolean>((resolve) => {
      if (!supportsGeolocation) {
        resolve(false);
        return;
      }
      setPermissionRequested(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setPermissionDenied(false);
          setError(null);
          resolve(true);
        },
        (err) => {
          if (err.code === 1) {
            setPermissionDenied(true);
            setError('Location permission denied. Please enable GPS.');
          } else {
            setError(err.message);
          }
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 15000 },
      );
    });

  return {
    location,
    error,
    watching,
    permissionDenied,
    supportsGeolocation,
    permissionRequested,
    requestPermission,
  };
};
