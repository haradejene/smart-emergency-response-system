import type { AlertPayload, AlertSeverity, AlertStatus, EmergencyPayload, EmergencyType, LocationData } from '../../types';

type AlertHandler = (data: AlertPayload) => void;

const randomShift = () => (Math.random() - 0.5) * 0.0012;
const makeId = () => `mock_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export class MockTransport {
  private connected = false;
  private location: LocationData = { latitude: 8.9806, longitude: 38.7578, accuracy: 12 };
  private onAlertHandler: AlertHandler | null = null;

  connect() {
    this.connected = true;
  }

  disconnect() {
    this.connected = false;
  }

  isConnected() {
    return this.connected;
  }

  onAlert(handler: AlertHandler) {
    this.onAlertHandler = handler;
  }

  emit(event: string, payload: EmergencyPayload | AlertPayload) {
    if (!this.connected) return false;
    if (event === 'emergency' && this.onAlertHandler) {
      const eventPayload = payload as EmergencyPayload;
      this.onAlertHandler(this.toAlertPayload({
        type: eventPayload.type,
        message: `Responder received: ${eventPayload.message}`,
        severity: eventPayload.severity,
        status: 'PENDING',
        location: {
          latitude: eventPayload.location.lat,
          longitude: eventPayload.location.lng,
        },
      }));
    }
    return true;
  }

  private toAlertPayload(input: {
    type: EmergencyType;
    message: string;
    severity: AlertSeverity;
    status: AlertStatus;
    location: { latitude: number; longitude: number };
    id?: string;
    timestamp?: number;
  }): AlertPayload {
    return {
      id: input.id ?? makeId(),
      type: input.type,
      message: input.message,
      severity: input.severity,
      location: input.location,
      timestamp: input.timestamp ?? Date.now(),
      status: input.status,
    };
  }

  nextLocation() {
    this.location = {
      latitude: this.location.latitude + randomShift(),
      longitude: this.location.longitude + randomShift(),
      accuracy: 6 + Math.random() * 10,
    };
    return this.location;
  }

  simulateIncomingAlert() {
    if (!this.connected || !this.onAlertHandler) return;
    const loc = this.nextLocation();
    this.onAlertHandler(this.toAlertPayload({
      type: 'auto_detected',
      message: 'Auto-detected impact from nearby device',
      severity: 'high',
      status: 'PENDING',
      location: { latitude: loc.latitude, longitude: loc.longitude },
    }));
  }
}
