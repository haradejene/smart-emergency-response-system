import { useState, useEffect, useRef, useCallback } from 'react';
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
    sendInterval = 500,
  } = options;
  
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied' | 'unsupported'>('pending');
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  
  const lastSendTime = useRef<number>(0);
  const lastLocationRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const deviceId = useRef<string>(localStorage.getItem('device_id') || 
    `device_${Math.random().toString(36).substr(2, 9)}`);
  const motionHandlerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);

  // Save device ID
  useEffect(() => {
    localStorage.setItem('device_id', deviceId.current);
  }, []);

  // Function to request permission manually (for iOS)
  const requestMotionPermission = useCallback(async (): Promise<boolean> => {
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          setPermissionStatus('granted');
          setError(null);
          return true;
        } else {
          setPermissionStatus('denied');
          setError('Motion permission denied. Please enable in settings.');
          return false;
        }
      } catch (err) {
        console.error('Error requesting motion permission:', err);
        setPermissionStatus('denied');
        setError('Failed to request motion permission');
        return false;
      }
    } else {
      // Android/Desktop - permission is automatic
      setPermissionGranted(true);
      setPermissionStatus('granted');
      return true;
    }
  }, []);

  // Start listening to accelerometer
  const startListening = useCallback(() => {
    if (!enabled || !permissionGranted) return;

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
        
        const now = Date.now();
        if (now - lastSendTime.current >= sendInterval && lastLocationRef.current) {
          lastSendTime.current = now;
          sendToBackend(data.acceleration, lastLocationRef.current);
        }
      }
    };

    motionHandlerRef.current = handleMotion;
    window.addEventListener('devicemotion', handleMotion);
    setIsListening(true);
    setError(null);
  }, [enabled, permissionGranted, sendInterval]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (motionHandlerRef.current) {
      window.removeEventListener('devicemotion', motionHandlerRef.current);
      motionHandlerRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Function to send data to backend
  const sendToBackend = async (accel: { x: number; y: number; z: number }, loc: { latitude: number; longitude: number }) => {
    if (!enabled) return;
    
    setIsSending(true);
    
    try {
      const result = await apiService.sendSensorData(accel, loc);
      
      if (result.incident) {
        console.log('🚨 Incident detected by backend:', result.incident);
        onIncidentDetected?.(result.incident);
      }
    } catch (error) {
      console.error('Failed to send sensor data to REST API:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Check if motion sensor is supported
  const isMotionSupported = useCallback((): boolean => {
    return !!window.DeviceMotionEvent;
  }, []);

  // Auto-initialize on Android/Desktop
  useEffect(() => {
    if (!enabled) {
      stopListening();
      return;
    }

    if (!window.DeviceMotionEvent) {
      setPermissionStatus('unsupported');
      setError('DeviceMotion API not supported on this browser');
      return;
    }

    // For Android/Desktop (no permission request needed)
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      setPermissionGranted(true);
      setPermissionStatus('granted');
      startListening();
    } else {
      // For iOS - wait for user gesture
      setPermissionStatus('pending');
      setError('Tap the "Request Motion Permission" button to enable motion detection');
    }

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  const updateLocation = (latitude: number, longitude: number) => {
    lastLocationRef.current = { latitude, longitude };
  };

  return {
    sensorData,
    permissionGranted,
    permissionStatus,
    error,
    isListening,
    isSending,
    isMotionSupported: isMotionSupported(),
    requestMotionPermission,
    updateLocation,
    stopListening,
    startListening,
  };
};