import { useState, useEffect } from 'react';
import { SensorMonitor } from './components/SensorMonitor/SensorMonitor';
import { EmergencyButton } from './components/EmergencyButton/EmergencyButton';
import { LocationMap } from './components/LocationMap/LocationMap';
import { AlertHistory } from './components/AlertHistory/AlertHistory';
import { useWebSocket } from './hooks/useWebSocket';
import { useGeolocation } from './hooks/useGeolocation';
import type { Alert } from './types';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { location } = useGeolocation();
  
  const { isConnected, connectionError, sendMessage } = useWebSocket({
    url: 'http://localhost:5000',
    autoConnect: true,
    onAlert: (data) => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        message: data.message || 'Emergency detected!',
        severity: data.severity || 'high',
        location: data.location || location,
        timestamp: Date.now(),
        acknowledged: false,
      };
      setAlerts(prev => [newAlert, ...prev]);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🚨 EMERGENCY ALERT!', {
          body: newAlert.message,
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

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
  };

  const handleSOS = () => {
    if (location) {
      const emergencyData = {
        type: 'manual_sos',
        message: 'Manual SOS triggered by user',
        severity: 'high',
        location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        timestamp: Date.now(),
      };
      
      const sent = sendMessage('emergency', emergencyData);
      
      if (sent) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          message: '🚨 SOS Emergency triggered!',
          severity: 'high',
          location: location,
          timestamp: Date.now(),
          acknowledged: false,
        };
        setAlerts(prev => [newAlert, ...prev]);
        alert('🚨 EMERGENCY ALERT SENT! Help is on the way.');
      } else {
        alert('❌ Cannot send alert: Server not connected');
      }
    } else {
      alert('❌ Cannot send alert: Location not available');
    }
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
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
              isConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                : 'bg-red-500/20 text-red-400 border border-red-500/50'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isConnected ? 'Connected' : connectionError ? 'Error' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {!isMonitoring ? (
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

            <SensorMonitor />
            <EmergencyButton onSOS={handleSOS} disabled={!isConnected} />
            <LocationMap location={location} title="Your Current Location" />
            <AlertHistory alerts={alerts} onAcknowledge={handleAcknowledge} />
            
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
    </div>
  );
}

export default App;
