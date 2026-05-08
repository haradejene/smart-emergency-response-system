import { useEffect, useState } from 'react';

interface AutoDetectCountdownProps {
  endsAt: number;
  totalG: number;
  onCancel: () => void;
}

export function AutoDetectCountdown({ endsAt, totalG, onCancel }: AutoDetectCountdownProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 200);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));

  return (
    <div className="fixed inset-0 z-[60] flex animate-in items-center justify-center bg-black/95 duration-300">
      <div className="max-w-md px-6 text-center">
        <div className="mb-4 text-6xl">⚠️</div>
        <h2 className="mb-2 text-2xl font-bold text-amber-400">Possible accident</h2>
        <p className="mb-1 text-sm text-gray-300">
          High acceleration detected (~{totalG.toFixed(1)}g). An alert will be sent unless you cancel.
        </p>
        <p className="mb-6 text-xs text-gray-500">If this is a false alarm (e.g. dropped phone), tap Cancel.</p>
        <div className="mb-8 text-6xl font-bold text-white">{secondsLeft}</div>
        <p className="mb-6 text-sm text-gray-400">seconds remaining</p>
        <button
          type="button"
          className="mx-auto block w-full max-w-xs rounded-xl bg-gray-700 px-8 py-4 text-lg font-semibold text-white transition hover:bg-gray-600 active:scale-95"
          onClick={onCancel}
        >
          Cancel — I&apos;m OK
        </button>
      </div>
    </div>
  );
}
