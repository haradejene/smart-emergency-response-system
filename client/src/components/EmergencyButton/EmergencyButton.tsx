import { useState, useEffect } from 'react';

interface EmergencyButtonProps {
  onSOS: () => void;
  disabled?: boolean;
}

export const EmergencyButton = ({ onSOS, disabled = false }: EmergencyButtonProps) => {
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (confirming && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setConfirming(false);
            // Use setTimeout to avoid state update during render
            setTimeout(() => onSOS(), 0);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [confirming, countdown, onSOS]);

  const handlePress = () => {
    if (disabled) return;
    setConfirming(true);
    setCountdown(5);
  };

  const handleCancel = () => {
    setConfirming(false);
    setCountdown(5);
  };

  if (confirming) {
    return (
      <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-in fade-in duration-300">
        <div className="text-center px-6">
          <div className="text-8xl mb-6 animate-pulse">🚨</div>
          <h2 className="text-4xl font-bold text-red-500 mb-4">EMERGENCY!</h2>
          <p className="text-xl text-white mb-2">Confirm alert in</p>
          <div className="text-7xl font-bold text-white mb-8">{countdown}</div>
          <p className="text-sm text-gray-400 mb-6">seconds</p>
          <button 
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 active:scale-95 w-full max-w-xs mx-auto block"
            onClick={handleCancel}
          >
            ❌ CANCEL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <button 
        className={`w-full py-8 text-3xl font-bold text-white border-none rounded-2xl shadow-2xl transition-all transform active:scale-95 ${
          disabled 
            ? 'bg-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 animate-pulse'
        }`}
        onClick={handlePress}
        disabled={disabled}
      >
        🚨 SOS EMERGENCY 🚨
      </button>
      <p className="text-center text-xs text-gray-500 mt-3">
        Press and confirm within 5 seconds
      </p>
    </div>
  );
};