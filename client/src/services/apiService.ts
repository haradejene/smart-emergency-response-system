const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface SensorData {
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
  status: 'PENDING' | 'DISPATCHED' | 'RESOLVED' | 'FALSE_ALARM';
  severity: 'low' | 'medium' | 'high';
  latitude: number;
  longitude: number;
  address?: string;
  detected_at: string;
  resolved_at?: string;
}

class ApiService {
  private static instance: ApiService;
  private deviceId: string;

  private constructor() {
    // Generate or retrieve device ID
    this.deviceId = localStorage.getItem('device_id') || 
      `device_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_id', this.deviceId);
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async sendSensorData(acceleration: { x: number; y: number; z: number }, location: { latitude: number; longitude: number }) {
    const payload: SensorData = {
      device_id: this.deviceId,
      x: acceleration.x,
      y: acceleration.y,
      z: acceleration.z,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    try {
      const response = await fetch(`${API_URL}/api/sensor-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      // If incident detected, return it
      if (data.incident) {
        return { incident: data.incident };
      }
      
      return { incident: null };
    } catch (error) {
      console.error('Failed to send sensor data:', error);
      return { incident: null, error };
    }
  }

  async getHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const apiService = ApiService.getInstance();
