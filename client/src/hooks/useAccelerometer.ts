import { useState, useEffect } from 'react';
import type { MotionPermissionRequester, SensorData } from '../types';

interface UseAccelerometerOptions {
  enabled?: boolean;
  mockData?: SensorData | null;
}

const supportsDeviceMotion = typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
const MotionEventWithPermission = DeviceMotionEvent as unknown as MotionPermissionRequester;

export const useAccelerometer = (options: UseAccelerometerOptions = {}) => {
  const { enabled = true, mockData = null } = options;
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(() =>
    supportsDeviceMotion ? null : 'DeviceMotion API not supported on this browser',
  );
  const [isListening, setIsListening] = useState<boolean>(false);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      setIsListening(false);
      return;
    }
    if (!supportsDeviceMotion || !permissionGranted) {
      setIsListening(false);
      return;
    }
    const handleMotion = (event: DeviceMotionEvent) => {
      const acceleration = event.accelerationIncludingGravity;
      if (!acceleration) return;
      setSensorData({
        acceleration: {
          x: acceleration.x || 0,
          y: acceleration.y || 0,
          z: acceleration.z || 0,
        },
        timestamp: Date.now(),
      });
      setIsListening(true);
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      setIsListening(false);
    };
  }, [enabled, permissionGranted]);

  useEffect(() => {
    if (mockData) {
      setSensorData(mockData);
      setPermissionGranted(true);
      setIsListening(true);
      setError(null);
    }
  }, [mockData]);

  const requestPermission = async () => {
    if (!supportsDeviceMotion) return false;
    setPermissionRequested(true);
    try {
      if (typeof MotionEventWithPermission.requestPermission === 'function') {
        const response = await MotionEventWithPermission.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setError(null);
          return true;
        }
        setError('Permission denied for motion sensors');
        return false;
      }
      setPermissionGranted(true);
      setError(null);
      return true;
    } catch {
      setError('Unable to request motion permission');
      return false;
    }
  };

  return {
    sensorData,
    permissionGranted,
    error,
    isListening,
    supportsDeviceMotion,
    permissionRequested,
    requestPermission,
  };
};


