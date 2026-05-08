import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletDefaultIcons } from '../../lib/leafletIcons';

ensureLeafletDefaultIcons();

export interface MapMarkerPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
}

function FitBounds({ markers }: { markers: MapMarkerPoint[] }) {
  const map = useMap();
  const boundsKey = markers.map((m) => `${m.id}:${m.lat}:${m.lng}`).join('|');

  useEffect(() => {
    if (markers.length === 0) return;
    const latLngs = markers.map((m) => L.latLng(m.lat, m.lng));
    if (markers.length === 1) {
      map.setView(latLngs[0], 15, { animate: false });
      return;
    }
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16, animate: false });
  }, [map, boundsKey]);

  return null;
}

interface LeafletMapViewProps {
  markers: MapMarkerPoint[];
  /** Tailwind height class, e.g. h-52 */
  heightClass?: string;
  className?: string;
}

export function LeafletMapView({ markers, heightClass = 'h-52', className = '' }: LeafletMapViewProps) {
  if (markers.length === 0) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400 ${heightClass} ${className}`}
      >
        No coordinates to show
      </div>
    );
  }

  const center: [number, number] = [markers[0].lat, markers[0].lng];
  const initialZoom = markers.length === 1 ? 15 : 11;

  return (
    <div className={`relative z-0 w-full overflow-hidden rounded-lg ${heightClass} ${className}`}>
      <MapContainer
        center={center}
        zoom={initialZoom}
        className="z-0 h-full w-full [&_.leaflet-control-attribution]:text-[10px]"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]}>
            {m.label ? <Popup>{m.label}</Popup> : null}
          </Marker>
        ))}
        <FitBounds markers={markers} />
      </MapContainer>
    </div>
  );
}
