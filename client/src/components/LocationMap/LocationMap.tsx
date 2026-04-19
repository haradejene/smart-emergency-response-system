import type { LocationData } from '../../types';

interface LocationMapProps {
  location: LocationData | null;
  title?: string;
}

export const LocationMap = ({ location, title = 'Current Location' }: LocationMapProps) => {
  const googleMapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : '#';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
      </div>
      
      <div className="p-4">
        {location ? (
          <>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-48 flex items-center justify-center mb-3">
              <div className="text-center">
                <div className="text-4xl mb-2">📍</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Accuracy: ±{location.accuracy.toFixed(0)}m
                </div>
              </div>
            </div>
            
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
            >
              Open in Google Maps 🗺️
            </a>
          </>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📍</div>
            <p>Waiting for location...</p>
          </div>
        )}
      </div>
    </div>
  );
};
