import { useState, useEffect } from 'react';
import type { SensorData } from '../types';

export const useAccelerometer = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    if (!window.DeviceMotionEvent) {
      setError('DeviceMotion API not supported on this browser');
      return;
    }

    const startListening = () => {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
          setSensorData({
            acceleration: {
              x: acceleration.x || 0,
              y: acceleration.y || 0,
              z: acceleration.z || 0,
            },
            timestamp: Date.now(),
          });
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      setIsListening(true);
      return () => window.removeEventListener('devicemotion', handleMotion);
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startListening();
        } else {
          setError('Permission denied for motion sensors');
        }
      } else {
        setPermissionGranted(true);
        startListening();
      }
    };

    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      const handleUserGesture = () => {
        requestPermission();
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture);
      window.addEventListener('touchstart', handleUserGesture);
      
      return () => {
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
      };
    } else {
      requestPermission();
    }
  }, []);

  return { sensorData, permissionGranted, error, isListening };
};


