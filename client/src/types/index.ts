//Core Types

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

//Alert Types

export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertStatus = 'PENDING' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
export type EmergencyType = 'accident' | 'manual_sos' | 'auto_detected';

export interface Alert {
  id: string;
  message: string;
  severity: AlertSeverity;
  location: LocationData;
  timestamp: number;
  acknowledged: boolean;
  status?: AlertStatus;
  type?: EmergencyType;
}

//Emergency Event Types

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  location: LocationData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  message?: string;
  severity?: AlertSeverity;
}

//WebSocket Payload Types

export interface SensorDataPayload {
  type: 'sensor_data';
  device_id: string;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

export interface EmergencyPayload {
  type: EmergencyType;
  device_id: string;
  message: string;
  severity: AlertSeverity;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: number;
}

export interface AlertPayload {
  id: string;
  type: EmergencyType;
  message: string;
  severity: AlertSeverity;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
  status: AlertStatus;
}

//API Request/Response Types

export interface SensorDataRequest {
  device_id: string;
  x: number;
  y: number;
  z: number;
  latitude: number;
  longitude: number;
}

export interface Incident {
  id: string;
  device_id: string;
  status: AlertStatus;
  severity: AlertSeverity;
  latitude: number;
  longitude: number;
  address?: string;
  detected_at: string;
  resolved_at?: string;
}

export interface SensorDataResponse {
  incident: Incident | null;
  message?: string;
}

//Component Props Types

export interface SensorMonitorProps {
  onIncidentDetected?: (incident: Incident) => void;
}

export interface EmergencyButtonProps {
  onSOS: () => void;
  disabled?: boolean;
}

export interface LocationMapProps {
  location: LocationData | null;
  title?: string;
}

export interface AlertHistoryProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
}

//Helper Functions

export const isAlertSeverity = (value: string): value is AlertSeverity => {
  return ['low', 'medium', 'high'].includes(value);
};

export const isAlertStatus = (value: string): value is AlertStatus => {
  return ['PENDING', 'DISPATCHED', 'RESOLVED', 'FALSE_ALARM'].includes(value);
};

export const isEmergencyType = (value: string): value is EmergencyType => {
  return ['accident', 'manual_sos', 'auto_detected'].includes(value);
};