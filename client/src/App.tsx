import { useEffect, useMemo, useRef, useState } from 'react';
import { SensorMonitor } from './components/SensorMonitor/SensorMonitor';
import { EmergencyButton } from './components/EmergencyButton/EmergencyButton';
import { LocationMap } from './components/LocationMap/LocationMap';
import { AlertHistory } from './components/AlertHistory/AlertHistory';
import { PermissionsGate } from './components/PermissionsGate/PermissionsGate';
import { Toast } from './components/Toast/Toast';
import { ResponderDashboard } from './components/ResponderDashboard/ResponderDashboard';
import { useWebSocket } from './hooks/useWebSocket';
import { useGeolocation } from './hooks/useGeolocation';
import { useAccelerometer } from './hooks/useAccelerometer';
import { MockTransport } from './services/transport/mockTransport';
import type { Alert, AlertPayload, AlertStatus, EmergencyPayload, LocationData, SensorData } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const now = () => Date.now();

function App() {
  const [view, setView] = useState<'user' | 'responder'>('user');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem('sers-alert-history');
    if (!saved) return [];
    try {
      return JSON.parse(saved) as Alert[];
    } catch {
      return [];
    }
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [mockLocation, setMockLocation] = useState<LocationData | null>(null);
  const [mockSensorData, setMockSensorData] = useState<SensorData | null>(null);
  const mockTransport = useRef<MockTransport>(new MockTransport());

  const geolocation = useGeolocation({ enabled: isMonitoring && !demoMode, mockLocation: demoMode ? mockLocation : null });
  const accelerometer = useAccelerometer({ enabled: isMonitoring && !demoMode, mockData: demoMode ? mockSensorData : null });

  const location = geolocation.location;
  const sensorData = accelerometer.sensorData;

  const addAlert = (payload: AlertPayload, fallbackMessage: string) => {
    const alert: Alert = {
      id: makeId(),
      message: payload.message || fallbackMessage,
      severity: payload.severity || 'high',
      location: payload.location || location || { latitude: 0, longitude: 0, accuracy: 0 },
      timestamp: now(),
      status: 'pending',
      source: payload.source || 'remote',
    };
    setAlerts((prev) => [alert, ...prev]);
  };

  useEffect(() => {
    localStorage.setItem('sers-alert-history', JSON.stringify(alerts.slice(0, 100)));
  }, [alerts]);

  const { isConnected, connectionError, sendMessage } = useWebSocket({
    url: API_URL,
    autoConnect: true,
    enabled: !demoMode,
    onAlert: (data) => {
      addAlert(data, 'Emergency detected!');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 EMERGENCY ALERT!', {
          body: data.message || 'Emergency detected!',
          icon: '/emergency-icon.png',
        });
      }
    },
  });

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!demoMode) return;
    mockTransport.current.connect();
    const tick = window.setInterval(() => {
      const nextLocation = mockTransport.current.nextLocation();
      setMockLocation(nextLocation);
      setMockSensorData({
        acceleration: {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8,
          z: (Math.random() - 0.5) * 8,
        },
        timestamp: now(),
      });
      if (Math.random() > 0.92) {
        mockTransport.current.simulateIncomingAlert();
      }
    }, 3000);
    mockTransport.current.onAlert((payload) => addAlert(payload, 'Mock alert received'));
    return () => {
      window.clearInterval(tick);
      mockTransport.current.disconnect();
    };
  }, [demoMode]);

  useEffect(() => {
    if (!isMonitoring || !sensorData || !location) return;
    const totalG = Math.sqrt(
      sensorData.acceleration.x ** 2 + sensorData.acceleration.y ** 2 + sensorData.acceleration.z ** 2,
    );
    if (totalG < 16) return;
    addAlert(
      {
        message: `Potential accident detected (${totalG.toFixed(1)}g)`,
        severity: 'high',
        location,
        source: 'auto',
      },
      'Potential accident detected',
    );
  }, [isMonitoring, location, sensorData]);

  const statusLabel = useMemo(() => {
    if (demoMode) return 'Mocked';
    if (isConnected) return 'Connected';
    if (connectionError) return 'Error';
    return 'Connecting...';
  }, [connectionError, demoMode, isConnected]);

  const handleStartMonitoring = async () => {
    if (!demoMode) {
      await accelerometer.requestPermission();
      await geolocation.requestPermission();
    }
    setIsMonitoring(true);
  };

  const handleSOS = () => {
    if (!location) {
      setToast({ message: 'Cannot send alert: location not available.', type: 'error' });
      return;
    }
    const emergencyData: EmergencyPayload = {
        type: 'manual_sos',
        message: 'Manual SOS triggered by user',
        severity: 'high',
        location,
        timestamp: now(),
      };

    const sent = demoMode
      ? mockTransport.current.emit('emergency', emergencyData)
      : sendMessage('emergency', emergencyData);

    if (!sent) {
      setToast({ message: 'Cannot send alert: server not connected.', type: 'error' });
      return;
    }
    addAlert({ message: 'SOS emergency triggered!', severity: 'high', location, source: 'manual' }, 'SOS emergency triggered!');
    setToast({ message: 'Emergency alert sent successfully.', type: 'success' });
  };

  const updateAlertStatus = (id: string, status: AlertStatus) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status } : alert)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🚑</div>
              <div>
                <h1 className="text-xl font-bold">Smart Emergency Response</h1>
                <p className="text-xs text-gray-400">Real-time accident detection</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              (demoMode || isConnected)
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${(demoMode || isConnected) ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{statusLabel}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <button className="rounded bg-gray-700 px-2 py-1" onClick={() => setDemoMode((prev) => !prev)}>
              Mode: {demoMode ? 'Demo' : 'Live'}
            </button>
            <button className="rounded bg-gray-700 px-2 py-1" onClick={() => setView((prev) => (prev === 'user' ? 'responder' : 'user'))}>
              View: {view === 'user' ? 'User' : 'Responder'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {view === 'responder' ? (
          <ResponderDashboard alerts={alerts} onStatusChange={updateAlertStatus} />
        ) : !isMonitoring ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="text-8xl mb-6">🚨</div>
              <h2 className="text-3xl font-bold mb-4">Ready for Emergencies</h2>
              <p className="text-gray-400 mb-8">
                This app monitors your phone's sensors to detect accidents and alert responders instantly.
              </p>
              <div className="bg-gray-800/50 rounded-xl p-4 mb-8 text-left space-y-2 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <span>✅</span> <span>Automatic accident detection</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✅</span> <span>Real-time GPS tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✅</span> <span>One-tap SOS button</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✅</span> <span>Instant responder alerts</span>
                </div>
              </div>
              <div className="mb-6">
                <PermissionsGate
                  motionSupported={accelerometer.supportsDeviceMotion}
                  motionGranted={accelerometer.permissionGranted || demoMode}
                  locationSupported={geolocation.supportsGeolocation}
                  locationGranted={!!location || demoMode}
                  onRequestMotion={accelerometer.requestPermission}
                  onRequestLocation={geolocation.requestPermission}
                />
              </div>
              <button 
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                onClick={handleStartMonitoring}
              >
                Start Monitoring 🚀
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 font-medium">System is actively monitoring</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Your phone sensors are being analyzed for emergency patterns
              </p>
            </div>

            <SensorMonitor
              sensorData={sensorData}
              motionActive={accelerometer.permissionGranted || demoMode}
              motionError={accelerometer.error}
              location={location}
              locationWatching={geolocation.watching || demoMode}
              locationError={geolocation.error}
              permissionDenied={geolocation.permissionDenied}
            />
            <EmergencyButton onSOS={handleSOS} disabled={!location || (!demoMode && !isConnected)} />
            <LocationMap location={location} title="Your Current Location" />
            <AlertHistory alerts={alerts} onAcknowledge={(id) => updateAlertStatus(id, 'acknowledged')} />
            
            <div className="text-center pt-4">
              <button 
                className="text-sm text-gray-500 hover:text-gray-400 underline"
                onClick={() => setIsMonitoring(false)}
              >
                Stop Monitoring
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-xs text-gray-500">
          <p>Smart Emergency Response System | Real-time accident detection</p>
          <p className="mt-1">In case of emergency, press the SOS button or shake your phone violently</p>
        </div>
      </footer>
      {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    </div>
  );
}

export default App;
