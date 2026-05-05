import { useMemo } from 'react';
import type { Alert, AlertStatus } from '../../types';
import { LeafletMapView } from '../LeafletMapView/LeafletMapView';

interface ResponderDashboardProps {
  alerts: Alert[];
  onStatusChange: (id: string, status: AlertStatus) => void;
}

export const ResponderDashboard = ({ alerts, onStatusChange }: ResponderDashboardProps) => {
  const sorted = useMemo(() => [...alerts].sort((a, b) => b.timestamp - a.timestamp), [alerts]);

  const mapMarkers = useMemo(
    () =>
      sorted
        .filter((a) => Number.isFinite(a.location.latitude) && Number.isFinite(a.location.longitude))
        .map((a) => ({
          id: a.id,
          lat: a.location.latitude,
          lng: a.location.longitude,
          label: `${a.message} · ${new Date(a.timestamp).toLocaleString()} · ${a.status}`,
        })),
    [sorted],
  );

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
                  <button
                    type="button"
                    className="rounded bg-blue-600 px-2 py-1"
                    onClick={() => onStatusChange(alert.id, 'acknowledged')}
                  >
                    Acknowledge
                  </button>
                  <button
                    type="button"
                    className="rounded bg-green-600 px-2 py-1"
                    onClick={() => onStatusChange(alert.id, 'dispatched')}
                  >
                    Dispatch
                  </button>
                  <button
                    type="button"
                    className="rounded bg-gray-600 px-2 py-1"
                    onClick={() => onStatusChange(alert.id, 'cancelled')}
                  >
                    Cancel
                  </button>
                  <span className="rounded border border-gray-600 px-2 py-1">{alert.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="rounded-xl bg-gray-900/70 p-4">
        <h3 className="mb-3 text-lg font-semibold">Live map</h3>
        {mapMarkers.length > 0 ? (
          <>
            <LeafletMapView markers={mapMarkers} heightClass="h-[340px]" className="border border-gray-700" />
            <p className="mt-2 text-xs text-gray-500">Pins show alert locations (popup for details).</p>
          </>
        ) : (
          <p className="text-sm text-gray-400">Map appears when at least one alert has coordinates.</p>
        )}
      </div>
    </section>
  );
};
