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
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  const handleConnected = useCallback(() => {
    console.log('✅ WebSocket connected to:', url);
    setIsConnected(true);
    setConnectionError(null);
    setReconnectAttempts(0);
    onConnect?.();
  }, [onConnect, url]);

  const handleDisconnected = useCallback(() => {
    console.log('❌ WebSocket disconnected');
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const handleConnectionError = useCallback((error: Error) => {
    console.error('🔌 WebSocket connection error:', error.message);
    setConnectionError(error.message);
    setReconnectAttempts((prev) => prev + 1);
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

  const createSocket = useCallback(() => {
    try {
      console.log('🔌 Creating WebSocket connection to:', url);
      return io(url, {
        autoConnect: false,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        withCredentials: false,
      });
    } catch (error) {
      console.error('Failed to create socket:', error);
      setConnectionError('Failed to connect to server');
      return null;
    }
  }, [url]);

  const connect = useCallback(() => {
    if (!enabled) {
      console.log('WebSocket disabled, skipping connection');
      return;
    }
    
    if (socketRef.current?.connected) {
      console.log('WebSocket already connected');
      return;
    }
    
    if (!socketRef.current) {
      console.log('Creating new WebSocket connection...');
      const socket = createSocket();
      if (!socket) return;
      
      socketRef.current = socket;
      socket.on('connect', handleConnected);
      socket.on('disconnect', handleDisconnected);
      socket.on('connect_error', handleConnectionError);
      socket.on('alert', handleAlert);
      socket.on('incident:confirmed', handleIncidentConfirmed);
    }
    
    console.log('Connecting WebSocket...');
    socketRef.current.connect();
  }, [createSocket, enabled, handleAlert, handleConnected, handleConnectionError, handleDisconnected, handleIncidentConfirmed]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket...');
      socketRef.current.off('connect', handleConnected);
      socketRef.current.off('disconnect', handleDisconnected);
      socketRef.current.off('connect_error', handleConnectionError);
      socketRef.current.off('alert', handleAlert);
      socketRef.current.off('incident:confirmed', handleIncidentConfirmed);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, [handleAlert, handleConnected, handleConnectionError, handleDisconnected, handleIncidentConfirmed]);

  const sendMessage = useCallback((event: string, data: EmergencyPayload | SensorDataPayload | AlertPayload) => {
    if (socketRef.current && isConnected) {
      console.log(`📤 Sending ${event}:`, data);
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn(`⚠️ Cannot send ${event}: WebSocket not connected`);
    return false;
  }, [isConnected]);

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

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect, enabled]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    sendSensorData,
    sendEmergency,
    connect,
    disconnect,
  };
};