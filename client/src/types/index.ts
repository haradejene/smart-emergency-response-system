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
  severity: 'high' | 'medium' | 'low';
  location: LocationData;
  timestamp: number;
  acknowledged: boolean;
}
