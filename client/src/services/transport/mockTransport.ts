import type { AlertPayload, EmergencyPayload, LocationData } from '../../types';

type AlertHandler = (data: AlertPayload) => void;

const randomShift = () => (Math.random() - 0.5) * 0.0012;

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
      this.onAlertHandler({
        message: `Responder acknowledged: ${eventPayload.message}`,
        severity: eventPayload.severity,
        location: eventPayload.location,
        source: 'remote',
      });
    }
    return true;
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
    this.onAlertHandler({
      message: 'Auto-detected impact from nearby device',
      severity: 'high',
      location: this.nextLocation(),
      source: 'remote',
    });
  }
}
