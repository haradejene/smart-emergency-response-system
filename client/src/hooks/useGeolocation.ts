import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const watchIdRef = useRef<number | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(locData);
          setPermissionStatus('granted');
          setPermissionDenied(false);
          setError(null);
          onLocationUpdate?.(locData.latitude, locData.longitude);
          resolve(true);
        },
        (err) => {
          console.error('Geolocation error:', err);
          if (err.code === 1) {
            setPermissionStatus('denied');
            setPermissionDenied(true);
            setError('Location permission denied. Please enable GPS.');
          } else if (err.code === 2) {
            setError('Position unavailable. Check your GPS signal.');
          } else if (err.code === 3) {
            setError('Location request timed out.');
          } else {
            setError(err.message);
          }
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
        }
      );
    });
  }, [onLocationUpdate]);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) return;
    if (watchIdRef.current) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
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
        setPermissionStatus('granted');
        onLocationUpdate?.(locData.latitude, locData.longitude);
      },
      (err) => {
        console.error('Geolocation watch error:', err);
        if (err.code === 1) {
          setPermissionDenied(true);
          setPermissionStatus('denied');
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
  }, [onLocationUpdate]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setWatching(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopWatching();
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    return () => {
      stopWatching();
    };
  }, [enabled, stopWatching]);

  return {
    location,
    error,
    watching,
    permissionDenied,
    permissionStatus,
    requestLocationPermission,
    startWatching,
    stopWatching,
    isSupported: !!navigator.geolocation,
  };
};