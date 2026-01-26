import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { POI } from '../types';
import { ZHUHAI_CENTER } from '../constants';
import { getPoiTheme } from './poiTheme';

// Fix for default Leaflet marker icons in React
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const TILE_SUBDOMAINS = ['a', 'b', 'c'];
const TILE_URL_TEMPLATE = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const markerCache = new Map<string, L.DivIcon>();
const getMarkerIcon = (poiType: POI['poiType'], isSelected: boolean, isVisited: boolean) => {
  const theme = getPoiTheme(poiType);
  const key = `${poiType}-${isSelected ? 'selected' : 'default'}-${isVisited ? 'visited' : 'normal'}`;
  const cached = markerCache.get(key);
  if (cached) return cached;

  const size = isSelected ? 26 : 22;
  const checkSize = Math.round(size * 0.7);
  const html = isVisited
    ? `<div style=\"width:${size}px;height:${size}px;border-radius:999px;background:#16a34a;border:2px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${checkSize}px;line-height:1;\">✓</div>`
    : `<div style=\"width:${size}px;height:${size}px;border-radius:999px;background:${theme.marker};border:2px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,0.2);\"></div>`;
  const icon = L.divIcon({
    html,
    className: 'poi-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
  markerCache.set(key, icon);
  return icon;
};

const latLngToTile = (latitude: number, longitude: number, zoom: number) => {
  const latRad = (latitude * Math.PI) / 180;
  const n = 2 ** zoom;
  const x = Math.floor(((longitude + 180) / 360) * n);
  const y = Math.floor(
    (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n
  );
  return { x, y, n };
};

const buildTileUrl = (z: number, x: number, y: number, index: number) => {
  const s = TILE_SUBDOMAINS[index % TILE_SUBDOMAINS.length];
  return TILE_URL_TEMPLATE
    .replace('{s}', s)
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
};

const preloadTilesAround = (
  latitude: number,
  longitude: number,
  zoom: number,
  radius: number,
  seen: Set<string>
) => {
  const { x: baseX, y: baseY, n } = latLngToTile(latitude, longitude, zoom);
  let index = 0;

  for (let dx = -radius; dx <= radius; dx += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      const x = (baseX + dx + n) % n;
      const y = baseY + dy;

      if (y < 0 || y >= n) {
        continue;
      }

      const url = buildTileUrl(zoom, x, y, index);
      index += 1;

      if (seen.has(url)) {
        continue;
      }

      seen.add(url);
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = url;
    }
  }
};

interface MapControllerProps {
  selectedPOI: POI | null;
}

// Component to handle map movement when selection changes
const MapController: React.FC<MapControllerProps> = ({ selectedPOI }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedPOI) {
      map.flyTo([selectedPOI.latitude, selectedPOI.longitude], 15, {
        duration: 1.5
      });
    } else {
        // Reset view if needed, or keep current
    }
  }, [selectedPOI, map]);

  return null;
};

interface POIMapProps {
  pois: POI[];
  selectedPOI: POI | null;
  visitedIds: Set<string>;
  onSelectPOI: (poi: POI) => void;
}

export const POIMap: React.FC<POIMapProps> = ({ pois, selectedPOI, visitedIds, onSelectPOI }) => {
  const preloadedUrlsRef = useRef(new Set<string>());

  useEffect(() => {
    const seen = preloadedUrlsRef.current;
    const [lat, lng] = ZHUHAI_CENTER;
    // Keep preloading small to avoid hammering the tile server.
    preloadTilesAround(lat, lng, 11, 1, seen);
    preloadTilesAround(lat, lng, 12, 1, seen);
  }, []);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={ZHUHAI_CENTER} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // We will add it manually or disable for cleaner mobile look
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="topright" />
        
        {pois.map((poi) => {
          const isVisited = visitedIds.has(poi.id);
          return (
            <Marker 
              key={poi.id} 
              position={[poi.latitude, poi.longitude]}
              icon={getMarkerIcon(poi.poiType, selectedPOI?.id === poi.id, isVisited)}
              eventHandlers={{
                click: () => onSelectPOI(poi),
              }}
              opacity={selectedPOI?.id === poi.id ? 1 : 0.8}
            />
          );
        })}

        <MapController selectedPOI={selectedPOI} />
      </MapContainer>
      
      {/* Decorative gradient overlay for top bar readability */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-[400]" />
    </div>
  );
};
