import { useState, useEffect } from 'react';
import type { LocationData } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [watching, setWatching] = useState<boolean>(false);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser');
      return;
    }

    let watchId: number;

    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
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
        }
      );
    };

    startWatching();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return { location, error, watching, permissionDenied };
};
