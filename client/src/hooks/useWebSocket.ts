import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import type { AlertPayload, EmergencyPayload } from '../types';

interface WebSocketOptions {
  url: string;
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onAlert?: (data: AlertPayload) => void;
  enabled?: boolean;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    autoConnect = true,
    onConnect,
    onDisconnect,
    onAlert,
    enabled = true,
  } = options;
  
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const socketRef = useRef<Socket | null>(null);

  const handleConnected = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
    setReconnectAttempts(0);
    onConnect?.();
  }, [onConnect]);

  const handleDisconnected = useCallback(() => {
    setIsConnected(false);
    onDisconnect?.();
  }, [onDisconnect]);

  const handleConnectionError = useCallback((error: Error) => {
    setConnectionError(error.message);
    setReconnectAttempts((prev) => prev + 1);
  }, []);

  const handleAlert = useCallback(
    (data: AlertPayload) => {
      onAlert?.(data);
    },
    [onAlert],
  );

  const createSocket = useCallback(() => {
    try {
      return io(url, {
        autoConnect,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000,
      });
    } catch {
      setConnectionError('Failed to connect to server');
      return null;
    }
  }, [autoConnect, url]);

  const connect = useCallback(() => {
    if (!enabled || socketRef.current?.connected) return;
    if (!socketRef.current) {
      const socket = createSocket();
      if (!socket) return;
      socketRef.current = socket;
      socket.on('connect', handleConnected);
      socket.on('disconnect', handleDisconnected);
      socket.on('connect_error', handleConnectionError);
      socket.on('alert', handleAlert);
    }
    socketRef.current.connect();
  }, [createSocket, enabled, handleAlert, handleConnected, handleConnectionError, handleDisconnected]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.off('connect', handleConnected);
      socketRef.current.off('disconnect', handleDisconnected);
      socketRef.current.off('connect_error', handleConnectionError);
      socketRef.current.off('alert', handleAlert);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, [handleAlert, handleConnected, handleConnectionError, handleDisconnected]);

  const sendMessage = useCallback((event: string, data: EmergencyPayload | AlertPayload) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
      return true;
    }
    return false;
  }, [isConnected]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
      return;
    }
    if (!socketRef.current) {
      const socket = createSocket();
      if (!socket) return;
      socketRef.current = socket;
      socket.on('connect', handleConnected);
      socket.on('disconnect', handleDisconnected);
      socket.on('connect_error', handleConnectionError);
      socket.on('alert', handleAlert);
    }
    if (autoConnect) {
      socketRef.current.connect();
    }
    return disconnect;
  }, [autoConnect, createSocket, disconnect, enabled, handleAlert, handleConnected, handleConnectionError, handleDisconnected]);

  return {
    isConnected,
    connectionError,
    reconnectAttempts,
    sendMessage,
    connect,
    disconnect,
  };
};
