import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorMonitor } from './components/SensorMonitor/SensorMonitor';
import { EmergencyButton } from './components/EmergencyButton/EmergencyButton';
import { LocationMap } from './components/LocationMap/LocationMap';
import { AlertHistory } from './components/AlertHistory/AlertHistory';
import { useWebSocket } from './hooks/useWebSocket';
import { useGeolocation } from './hooks/useGeolocation';
import { useAccelerometer } from './hooks/useAccelerometer';
import { apiService } from './services/apiService';
import type { Alert, AlertSeverity, EmergencyType, LocationData, Incident } from './types';

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  const { location, error: locationError, watching, permissionDenied } = useGeolocation({ 
    enabled: isMonitoring 
  });
  
  const locationData: LocationData | null = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy || 10,
  } : null;
  
  const handleIncidentDetected = useCallback((incident: Incident) => {
    const newAlert: Alert = {
      id: incident.id,
      message: `🚨 ${incident.severity.toUpperCase()} severity incident detected!`,
      severity: incident.severity,
      location: {
        latitude: incident.latitude,
        longitude: incident.longitude,
        accuracy: 10,
      },
      timestamp: new Date(incident.detected_at).getTime(),
      acknowledged: false,
      status: incident.status,
      type: 'auto_detected',
    };
    setAlerts(prev => [newAlert, ...prev]);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGENCY DETECTED!', {
        body: newAlert.message,
        icon: '/icon-192x192.png',
      });
    }
  }, []);
  
  const { 
    sensorData, 
    permissionGranted: motionPermission, 
    error: motionError, 
    isListening,
    updateLocation 
  } = useAccelerometer({
    enabled: isMonitoring && watching,
    onIncidentDetected: handleIncidentDetected,
  });
  
  const WS_URL = import.meta.env.VITE_WS_URL || 'wss://smart-emergency-response-system-2-c6wy.onrender.com';
  
  const handleAlert = useCallback((data: any) => {
    let alertLocation: LocationData;
    
    if (data.location) {
      alertLocation = {
        latitude: data.location.latitude,
        longitude: data.location.longitude,
        accuracy: 10,
      };
    } else if (locationData) {
      alertLocation = locationData;
    } else {
      alertLocation = {
        latitude: 0,
        longitude: 0,
        accuracy: 0,
      };
    }
    
    const newAlert: Alert = {
      id: data.id || Date.now().toString(),
      message: data.message || 'Emergency detected!',
      severity: data.severity,
      location: alertLocation,
      timestamp: data.timestamp || Date.now(),
      acknowledged: false,
      status: data.status,
      type: data.type,
    };
    setAlerts(prev => [newAlert, ...prev]);
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 EMERGENCY ALERT!', {
        body: newAlert.message,
        icon: '/icon-192x192.png',
      });
    }
  }, [locationData]);
  
  const { isConnected, sendMessage } = useWebSocket({
    url: WS_URL,
    autoConnect: isMonitoring,
    enabled: isMonitoring,
    onConnect: () => console.log('WebSocket connected'),
    onDisconnect: () => console.log('WebSocket disconnected'),
    onAlert: handleAlert,
  });

  useEffect(() => {
    if (location) {
      updateLocation(location.latitude, location.longitude);
    }
  }, [location, updateLocation]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const checkHealth = async () => {
      const isHealthy = await apiService.getHealth();
      console.log('Backend health:', isHealthy);
    };
    
    checkHealth();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleStartMonitoring = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
  };

  const handleSOS = () => {
    if (locationData) {
      const emergencyData = {
        type: 'manual_sos' as EmergencyType,
        message: 'Manual SOS triggered by user',
        severity: 'high' as AlertSeverity,
        location: {
          lat: locationData.latitude,
          lng: locationData.longitude,
        },
        device_id: apiService.getDeviceId(),
        timestamp: Date.now(),
      };
      
      const sent = sendMessage('emergency', emergencyData);
      
      if (sent) {
        const newAlert: Alert = {
          id: Date.now().toString(),
          message: '🚨 SOS Emergency triggered!',
          severity: 'high',
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
          },
          timestamp: Date.now(),
          acknowledged: false,
          type: 'manual_sos',
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

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🚑</div>
              <div>
                <h1 className="text-xl font-bold">Smart Emergency Response</h1>
                <p className="text-xs text-gray-400">Real-time accident detection</p>
              </div>
            </div>
            <div className="flex gap-2">
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition"
                >
                  📱 Install App
                </button>
              )}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {!isOnline && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-3 mb-4 text-center text-sm">
            ⚠️ You are offline. Some features may be unavailable.
          </div>
        )}
        
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
                <div className="flex items-center gap-3">
                  <span>✅</span> <span>Works offline (PWA)</span>
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

            <SensorMonitor 
              sensorData={sensorData}
              motionActive={motionPermission && isListening}
              motionError={motionError}
              location={locationData}
              locationError={locationError}
              locationActive={watching}
              locationWatching={watching}
              permissionDenied={permissionDenied}
              onUpdateLocation={updateLocation}
            />
            
            <EmergencyButton onSOS={handleSOS} disabled={!isConnected} />
            
            {locationData && (
              <LocationMap location={locationData} title="Your Current Location" />
            )}
            
            <AlertHistory alerts={alerts} onAcknowledge={handleAcknowledge} />
            
            <div className="text-center pt-4">
              <button 
                className="text-sm text-gray-500 hover:text-gray-400 underline"
                onClick={handleStopMonitoring}
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