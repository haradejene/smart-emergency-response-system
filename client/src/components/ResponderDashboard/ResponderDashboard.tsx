import type { Alert, AlertStatus } from '../../types';

interface ResponderDashboardProps {
  alerts: Alert[];
  onStatusChange: (id: string, status: AlertStatus) => void;
}

export const ResponderDashboard = ({ alerts, onStatusChange }: ResponderDashboardProps) => {
  const sorted = [...alerts].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl bg-gray-900/70 p-4">
        <h3 className="mb-3 text-lg font-semibold">Incoming Alerts</h3>
        <div className="max-h-[420px] space-y-3 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="text-sm text-gray-400">No active alerts.</p>
          ) : (
            sorted.map((alert) => (
              <div key={alert.id} className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                <p className="font-medium">{alert.message}</p>
                <p className="text-xs text-gray-400">{new Date(alert.timestamp).toLocaleString()}</p>
                <p className="text-xs text-gray-400">
                  {alert.location.latitude.toFixed(5)}, {alert.location.longitude.toFixed(5)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button className="rounded bg-blue-600 px-2 py-1" onClick={() => onStatusChange(alert.id, 'acknowledged')}>Acknowledge</button>
                  <button className="rounded bg-green-600 px-2 py-1" onClick={() => onStatusChange(alert.id, 'dispatched')}>Dispatch</button>
                  <button className="rounded bg-gray-600 px-2 py-1" onClick={() => onStatusChange(alert.id, 'cancelled')}>Cancel</button>
                  <span className="rounded border border-gray-600 px-2 py-1">{alert.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-xl bg-gray-900/70 p-4">
        <h3 className="mb-3 text-lg font-semibold">Map Preview</h3>
        {sorted[0] ? (
          <div className="rounded-lg bg-gray-800 p-4 text-sm">
            <p className="mb-1">Latest alert position:</p>
            <p className="font-mono">
              {sorted[0].location.latitude.toFixed(6)}, {sorted[0].location.longitude.toFixed(6)}
            </p>
            <a
              className="mt-3 inline-block rounded bg-indigo-600 px-3 py-2 text-xs font-semibold"
              href={`https://www.google.com/maps?q=${sorted[0].location.latitude},${sorted[0].location.longitude}`}
              rel="noreferrer"
              target="_blank"
            >
              Open map
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Map displays when alerts are available.</p>
        )}
      </div>
    </section>
  );
};
