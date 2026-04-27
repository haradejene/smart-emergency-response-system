export interface SensorData {
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type AlertSeverity = 'high' | 'medium' | 'low';
export type AlertStatus = 'pending' | 'acknowledged' | 'dispatched' | 'cancelled';

export interface EmergencyEvent {
  id: string;
  type: 'accident' | 'manual_sos';
  location: LocationData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  location: LocationData;
  timestamp: number;
  status: AlertStatus;
  source: 'manual' | 'auto' | 'remote';
}

export interface AlertPayload {
  message?: string;
  severity?: AlertSeverity;
  location?: LocationData;
  source?: Alert['source'];
}

export interface EmergencyPayload {
  type: EmergencyEvent['type'];
  message: string;
  severity: AlertSeverity;
  location: LocationData;
  timestamp: number;
}

export interface MotionPermissionRequester {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}
