import { useMemo } from 'react';
import type { LocationData } from '../../types';
import { LeafletMapView } from '../LeafletMapView/LeafletMapView';

interface LocationMapProps {
  location: LocationData | null;
  title?: string;
}

export const LocationMap = ({ location, title = 'Current Location' }: LocationMapProps) => {
  const googleMapsUrl = location
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : '#';

  const markers = useMemo(
    () =>
      location
        ? [
            {
              id: 'user-location',
              lat: location.latitude,
              lng: location.longitude,
              label: title,
            },
          ]
        : [],
    [location, title],
  );

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <h4 className="font-semibold text-gray-800 dark:text-white">{title}</h4>
      </div>

      <div className="p-4">
        {location ? (
          <>
            <LeafletMapView markers={markers} heightClass="h-52 md:h-56" />

            <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
              <span className="font-mono">
                {location.latitude.toFixed(6)}°, {location.longitude.toFixed(6)}°
              </span>
              <span className="mx-2">·</span>
              <span>±{location.accuracy.toFixed(0)} m</span>
            </div>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-lg bg-blue-500 py-2 text-center text-white transition-colors hover:bg-blue-600"
            >
              Open in Google Maps
            </a>
          </>
        ) : (
          <div className="py-8 text-center text-gray-400">
            <div className="mb-2 text-4xl">📍</div>
            <p>Waiting for location...</p>
          </div>
        )}
      </div>
    </div>
  );
};
