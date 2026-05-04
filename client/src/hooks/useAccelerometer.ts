import { useState, useEffect, useRef } from 'react';
import type { SensorData, Incident } from '../types';
import { apiService } from '../services/apiService';

interface UseAccelerometerOptions {
  onIncidentDetected?: (incident: Incident) => void;
  enabled?: boolean;
  sendInterval?: number;
}

export const useAccelerometer = (options: UseAccelerometerOptions = {}) => {
  const {
    onIncidentDetected,
    enabled = true,
    sendInterval = 500, // Send data every 500ms
  } = options;
  
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  const lastSendTime = useRef<number>(0);
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const deviceId = useRef<string>(localStorage.getItem('device_id') || 
    `device_${Math.random().toString(36).substr(2, 9)}`);

  // Save device ID
  useEffect(() => {
    localStorage.setItem('device_id', deviceId.current);
  }, []);

  // Function to send data to backend
  const sendToBackend = async (accel: { x: number; y: number; z: number }, loc: { latitude: number; longitude: number }) => {
    if (!enabled) return;
    
    setIsSending(true);
    
    try {
      // Send via REST API (for incident detection)
      const result = await apiService.sendSensorData(accel, loc);
      
      if (result.incident) {
        // Incident detected by backend!
        console.log('🚨 Incident detected by backend:', result.incident);
        onIncidentDetected?.(result.incident);
      }
    } catch (error) {
      console.error('Failed to send sensor data to REST API:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Start listening to accelerometer
  useEffect(() => {
    if (!enabled) return;

    if (!window.DeviceMotionEvent) {
      setError('DeviceMotion API not supported on this browser');
      return;
    }

    const startListening = () => {
      const handleMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
          const data: SensorData = {
            acceleration: {
              x: acceleration.x || 0,
              y: acceleration.y || 0,
              z: acceleration.z || 0,
            },
            timestamp: Date.now(),
          };
          setSensorData(data);
          
          // Send to backend at specified interval
          const now = Date.now();
          if (now - lastSendTime.current >= sendInterval && lastLocationRef.current) {
            lastSendTime.current = now;
            sendToBackend(data.acceleration, lastLocationRef.current);
          }
        }
      };

      window.addEventListener('devicemotion', handleMotion);
      setIsListening(true);
      setError(null);
      
      return () => window.removeEventListener('devicemotion', handleMotion);
    };

    const requestPermission = async () => {
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        // iOS requires user interaction
        try {
          const response = await (DeviceMotionEvent as any).requestPermission();
          if (response === 'granted') {
            setPermissionGranted(true);
            startListening();
          } else {
            setError('Permission denied for motion sensors');
          }
        } catch (err) {
          setError('Failed to request motion permission');
        }
      } else {
        // Android and other browsers
        setPermissionGranted(true);
        startListening();
      }
    };

    // For iOS, we need user gesture
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
  }, [enabled, sendInterval, onIncidentDetected]);

  // Function to update location from parent component
  const updateLocation = (latitude: number, longitude: number) => {
    lastLocationRef.current = { latitude, longitude };
  };

  return {
    sensorData,
    permissionGranted,
    error,
    isListening,
    isSending,
    updateLocation,
  };
};