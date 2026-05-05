import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

/** Vite/Webpack break Leaflet default marker URLs; merge explicit assets once. */
let fixed = false;

export function ensureLeafletDefaultIcons() {
  if (fixed) return;
  fixed = true;
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
  L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });
}
