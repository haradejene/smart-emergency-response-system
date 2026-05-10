import { useState } from 'react';

interface PermissionsGateProps {
  motionSupported: boolean;
  motionGranted: boolean;
  motionPermissionStatus?: 'pending' | 'granted' | 'denied' | 'unsupported';
  onRequestMotion: () => Promise<boolean>;
  locationSupported: boolean;
  locationGranted: boolean;
  onRequestLocation: () => Promise<boolean>;
}

export const PermissionsGate = ({
  motionSupported,
  motionGranted,
  motionPermissionStatus = 'pending',
  onRequestMotion,
  locationSupported,
  locationGranted,
  onRequestLocation,
}: PermissionsGateProps) => {
  const [requestingMotion, setRequestingMotion] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [motionError, setMotionError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleRequestMotion = async () => {
    setRequestingMotion(true);
    setMotionError(null);
    try {
      const granted = await onRequestMotion();
      if (!granted) {
        setMotionError('Permission denied. Please check your browser settings.');
      }
    } catch (err) {
      setMotionError('Failed to request motion permission');
    } finally {
      setRequestingMotion(false);
    }
  };

  const handleRequestLocation = async () => {
    setRequestingLocation(true);
    setLocationError(null);
    try {
      const granted = await onRequestLocation();
      if (!granted) {
        setLocationError('Permission denied. Please enable location in your browser.');
      }
    } catch (err) {
      setLocationError('Failed to request location permission');
    } finally {
      setRequestingLocation(false);
    }
  };

  const allGranted = motionGranted && locationGranted;

  if (allGranted) {
    return (
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-green-400">✅</span>
          <span className="text-green-400 font-medium">All permissions granted</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Ready to monitor for emergencies</p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-center text-yellow-400">⚠️ Permissions Required</h3>
      <p className="text-xs text-center text-gray-400">This app needs access to motion and location sensors to detect emergencies.</p>
      
      <div className="space-y-3">
        {/* Motion Sensor Permission */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔄</span>
              <span className="text-sm font-medium">Motion Sensor</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              motionGranted 
                ? 'bg-green-500/20 text-green-400' 
                : motionPermissionStatus === 'unsupported'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {motionGranted 
                ? 'Granted' 
                : motionPermissionStatus === 'unsupported'
                ? 'Not Supported'
                : 'Pending'}
            </span>
          </div>
          
          {!motionGranted && motionSupported && (
            <button
              onClick={handleRequestMotion}
              disabled={requestingMotion}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
            >
              {requestingMotion ? 'Requesting...' : '🔘 Request Motion Permission'}
            </button>
          )}
          
          {!motionSupported && (
            <p className="text-xs text-red-400 mt-2">Your browser doesn't support motion sensors</p>
          )}
          
          {motionError && (
            <p className="text-xs text-red-400 mt-2">{motionError}</p>
          )}
        </div>

        {/* Location Permission */}
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <span className="text-sm font-medium">Location</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              locationGranted 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {locationGranted ? 'Granted' : 'Pending'}
            </span>
          </div>
          
          {!locationGranted && locationSupported && (
            <button
              onClick={handleRequestLocation}
              disabled={requestingLocation}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg text-sm transition"
            >
              {requestingLocation ? 'Requesting...' : '🔘 Request Location Permission'}
            </button>
          )}
          
          {locationError && (
            <p className="text-xs text-red-400 mt-2">{locationError}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        {motionSupported && !motionGranted && "Note: On iOS, you'll need to tap the permission button twice."}
      </p>
    </div>
  );
};