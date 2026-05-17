import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import type { AlertPayload, EmergencyPayload, SensorDataPayload } from '../types';

interface WebSocketOptions {
  url: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onAlert?: (data: AlertPayload) => void;
  onIncidentConfirmed?: (data: any) => void;
  enabled?: boolean;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onAlert,
    onIncidentConfirmed,
    enabled = true,
  } = options;
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const mountedRef = useRef<boolean>(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleConnected = useCallback(() => {
    if (!mountedRef.current) return;
    console.log('✅ WebSocket connected to:', url);
    setIsConnected(true);
    setConnectionError(null);
    onConnect?.();
  }, [onConnect, url]);

  const handleDisconnected = useCallback(() => {
    if (!mountedRef.current) return;
    console.log('❌ WebSocket disconnected');
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const handleConnectionError = useCallback((error: Error) => {
    if (!mountedRef.current) return;
    console.error('🔌 WebSocket connection error:', error.message);
    setConnectionError(error.message);
  }, []);

  const handleAlert = useCallback(
    (data: AlertPayload) => {
      console.log('🚨 Alert received from backend:', data);
      onAlert?.(data);
    },
    [onAlert],
  );

  const handleIncidentConfirmed = useCallback(
    (data: any) => {
      console.log('📋 Incident confirmed:', data);
      onIncidentConfirmed?.(data);
    },
    [onIncidentConfirmed],
  );

  // Initialize socket once
  const initSocket = useCallback(() => {
    if (!enabled) return null;
    if (socketRef.current && socketRef.current.connected) return socketRef.current;
    
    console.log('🔌 Initializing WebSocket connection to:', url);
    
    // Use 'polling' first then upgrade to 'websocket' for better compatibility
    const socket = io(url, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      withCredentials: false,
      forceNew: true,
    });

    socket.on('connect', handleConnected);
    socket.on('disconnect', handleDisconnected);
    socket.on('connect_error', handleConnectionError);
    socket.on('alert', handleAlert);
    socket.on('incident:confirmed', handleIncidentConfirmed);

    socketRef.current = socket;
    return socket;
  }, [enabled, url, handleConnected, handleDisconnected, handleConnectionError, handleAlert, handleIncidentConfirmed]);

  // Connect/disconnect based on enabled prop
  useEffect(() => {
    if (!enabled) {
      if (socketRef.current) {
        console.log('Disconnecting WebSocket (disabled)');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Clear any pending reconnect
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Small delay to prevent multiple simultaneous connections
    reconnectTimeoutRef.current = setTimeout(() => {
      const socket = initSocket();
      if (socket && !socket.connected && autoConnect) {
        console.log('Connecting WebSocket...');
        socket.connect();
      }
    }, 100);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [enabled, autoConnect, initSocket]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnected);
        socketRef.current.off('disconnect', handleDisconnected);
        socketRef.current.off('connect_error', handleConnectionError);
        socketRef.current.off('alert', handleAlert);
        socketRef.current.off('incident:confirmed', handleIncidentConfirmed);
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }
    };
  }, [handleAlert, handleConnected, handleConnectionError, handleDisconnected, handleIncidentConfirmed]);

  const sendMessage = useCallback((event: string, data: EmergencyPayload | SensorDataPayload | AlertPayload) => {
    if (socketRef.current?.connected) {
      console.log(`📤 Sending ${event}`);
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn(`⚠️ Cannot send ${event}: WebSocket not connected`);
    return false;
  }, []);

  const sendSensorData = useCallback((acceleration: { x: number; y: number; z: number }, location: { latitude: number; longitude: number }) => {
    const payload: SensorDataPayload = {
      type: 'sensor_data',
      device_id: localStorage.getItem('device_id') || `device_${Math.random().toString(36).substr(2, 9)}`,
      acceleration,
      location,
      timestamp: Date.now(),
    };
    return sendMessage('sensor_data', payload);
  }, [sendMessage]);

  const sendEmergency = useCallback((data: EmergencyPayload) => {
    return sendMessage('emergency', data);
  }, [sendMessage]);

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendSensorData,
    sendEmergency,
  };
};