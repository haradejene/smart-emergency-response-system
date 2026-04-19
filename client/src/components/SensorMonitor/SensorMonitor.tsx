import React from 'react';
import { useAccelerometer } from '../../hooks/useAccelerometer';
import { useGeolocation } from '../../hooks/useGeolocation';

export const SensorMonitor: React.FC = () => {
  const { sensorData, permissionGranted, error: motionError, isListening } = useAccelerometer();
  const { location, error: locationError, watching, permissionDenied } = useGeolocation();

  return (
    <div className="p-4 m-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
        <span>📡</span> Sensor Status
        {isListening && watching && (
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
            Monitoring Active
          </span>
        )}
      </h3>
      
      {/* Accelerometer Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">Accelerometer</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            permissionGranted 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {permissionGranted ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {sensorData ? (
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">X</div>
              <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                {sensorData.acceleration.x.toFixed(2)}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Y</div>
              <div className="font-mono text-lg font-bold text-green-600 dark:text-green-400">
                {sensorData.acceleration.y.toFixed(2)}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">Z</div>
              <div className="font-mono text-lg font-bold text-purple-600 dark:text-purple-400">
                {sensorData.acceleration.z.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            {permissionGranted ? 'Waiting for sensor data...' : 'Grant permission to access motion sensor'}
          </div>
        )}
        
        {motionError && (
          <div className="mt-3 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
            ⚠️ {motionError}
          </div>
        )}
      </div>

      {/* GPS Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">GPS Location</span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            watching ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
          }`}>
            {watching ? 'Locked' : 'Searching...'}
          </span>
        </div>
        
        {location ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Latitude</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {location.latitude.toFixed(6)}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">Longitude</div>
                <div className="font-mono font-medium text-gray-800 dark:text-gray-200">
                  {location.longitude.toFixed(6)}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Accuracy: ±{location.accuracy.toFixed(0)} meters
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            {permissionDenied 
              ? '⚠️ Please enable location services in your browser' 
              : '📍 Getting your location...'}
          </div>
        )}
        
        {locationError && (
          <div className="mt-3 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
            ⚠️ {locationError}
          </div>
        )}
      </div>
    </div>
  );
};
