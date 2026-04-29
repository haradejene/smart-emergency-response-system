interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const colorByType = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-blue-600',
};

export const Toast = ({ message, type = 'info', onClose }: ToastProps) => (
  <div className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-lg p-4 text-sm text-white shadow-xl ${colorByType[type]}`}>
    <div className="flex items-start gap-3">
      <p className="flex-1">{message}</p>
      <button type="button" className="text-white/90 hover:text-white" onClick={onClose}>
        x
      </button>
    </div>
  </div>
);
