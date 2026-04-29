interface PermissionsGateProps {
  motionSupported: boolean;
  motionGranted: boolean;
  locationSupported: boolean;
  locationGranted: boolean;
  onRequestMotion: () => Promise<boolean>;
  onRequestLocation: () => Promise<boolean>;
}

export const PermissionsGate = ({
  motionSupported,
  motionGranted,
  locationSupported,
  locationGranted,
  onRequestMotion,
  onRequestLocation,
}: PermissionsGateProps) => (
  <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4">
    <h3 className="mb-3 text-lg font-semibold">Permissions</h3>
    <p className="mb-4 text-sm text-gray-300">
      Grant motion and location permissions before starting full monitoring.
    </p>
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-gray-900/70 p-3">
        <div>
          <p className="font-medium">Motion sensors</p>
          <p className="text-xs text-gray-400">{motionSupported ? (motionGranted ? 'Granted' : 'Required') : 'Not supported'}</p>
        </div>
        <button
          type="button"
          disabled={!motionSupported || motionGranted}
          onClick={onRequestMotion}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          Request
        </button>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-gray-900/70 p-3">
        <div>
          <p className="font-medium">Location services</p>
          <p className="text-xs text-gray-400">{locationSupported ? (locationGranted ? 'Granted' : 'Required') : 'Not supported'}</p>
        </div>
        <button
          type="button"
          disabled={!locationSupported || locationGranted}
          onClick={onRequestLocation}
          className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed disabled:bg-gray-600"
        >
          Request
        </button>
      </div>
    </div>
  </div>
);
