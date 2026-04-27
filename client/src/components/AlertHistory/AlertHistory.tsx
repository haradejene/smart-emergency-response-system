import type { Alert } from '../../types';

interface AlertHistoryProps {
  alerts: Alert[];
  onAcknowledge?: (id: string) => void;
}

export const AlertHistory = ({ alerts, onAcknowledge }: AlertHistoryProps) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Alerts Yet</h3>
        <p className="text-sm text-gray-500">When emergencies are detected, they'll appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-800 dark:text-white">📋 Alert History ({alerts.length})</h4>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                </span>
                <span className="font-medium text-gray-800 dark:text-white">{alert.message}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {new Date(alert.timestamp).toLocaleString()}
            </div>
            
            {alert.location && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-mono">
                📍 {alert.location.latitude.toFixed(4)}°, {alert.location.longitude.toFixed(4)}°
              </div>
            )}
            
            {alert.status === 'pending' && onAcknowledge && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
              >
                Acknowledge
              </button>
            )}
            
            {alert.status !== 'pending' && (
              <span className="text-xs text-green-600 dark:text-green-400">Status: {alert.status}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
