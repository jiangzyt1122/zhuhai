import React, { useEffect, useRef, useState } from 'react';
import { POI } from '../types';
import { ZHUHAI_CENTER, COORDINATE_SYSTEM } from '../constants';
import { getPoiTheme } from './poiTheme';
import { toAMapLngLat } from '../utils/coords';

declare global {
  interface Window {
    AMap?: any;
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
  }
}

const AMAP_KEY = 'aa21d1cd86a48cf25f67104cfa9766a7';
const AMAP_SECURITY_CODE = '735f505cc4f123b5d8e38115bb900877';
const AMAP_VERSION = '2.0';
const AMAP_SCRIPT_ID = 'amap-js-api';

let amapLoaderPromise: Promise<any> | null = null;

const loadAMap = () => {
  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (amapLoaderPromise) {
    return amapLoaderPromise;
  }

  amapLoaderPromise = new Promise((resolve, reject) => {
    window._AMapSecurityConfig = {
      securityJsCode: AMAP_SECURITY_CODE
    };

    const existing = document.getElementById(AMAP_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(window.AMap));
      existing.addEventListener('error', () => reject(new Error('AMap script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = AMAP_SCRIPT_ID;
    script.async = true;
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${AMAP_KEY}`;
    script.onload = () => resolve(window.AMap);
    script.onerror = () => reject(new Error('AMap script failed to load'));
    document.head.appendChild(script);
  });

  return amapLoaderPromise;
};

const buildMarkerContent = (
  poiType: POI['poiType'],
  category: string,
  isSelected: boolean,
  isVisited: boolean
) => {
  const theme = getPoiTheme(poiType, category);
  const size = isSelected ? 28 : 24;
  const checkSize = Math.round(size * 0.7);
  const background = isVisited ? '#16a34a' : theme.marker;
  const text = isVisited ? '✓' : '';
  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${background};border:2px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${checkSize}px;line-height:1;">${text}</div>`;
};


interface POIMapProps {
  pois: POI[];
  selectedPOI: POI | null;
  visitedIds: Set<string>;
  onSelectPOI: (poi: POI) => void;
}

export const POIMap: React.FC<POIMapProps> = ({ pois, selectedPOI, visitedIds, onSelectPOI }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    loadAMap()
      .then((AMap) => {
        if (isCancelled || !mapContainerRef.current) {
          return;
        }

        if (!mapRef.current) {
          const [lat, lng] = ZHUHAI_CENTER;
          const [centerLng, centerLat] = toAMapLngLat(lat, lng, COORDINATE_SYSTEM);
          mapRef.current = new AMap.Map(mapContainerRef.current, {
            zoom: 11,
            center: [centerLng, centerLat],
            resizeEnable: true,
            viewMode: '2D'
          });
        }
        if (!isCancelled) {
          setMapReady(true);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isCancelled = true;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current.clear();
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.AMap) {
      return;
    }

    const AMap = window.AMap;
    const markerMap = markersRef.current;
    const poiIds = new Set(pois.map((poi) => poi.id));
    const poiById = new Map(pois.map((poi) => [poi.id, poi]));

    pois.forEach((poi) => {
      const isVisited = visitedIds.has(poi.id);
      const isSelected = selectedPOI?.id === poi.id;
      const content = buildMarkerContent(poi.poiType, poi.category, isSelected, isVisited);
      const size = isSelected ? 28 : 24;
      const offset = new AMap.Pixel(-size / 2, -size / 2);
      const [lng, lat] = toAMapLngLat(
        poi.latitude,
        poi.longitude,
        poi.coordinateSystem ?? COORDINATE_SYSTEM
      );
      const zIndex = isSelected ? 200 : 150;

      const existing = markerMap.get(poi.id);
      if (existing) {
        existing.setContent(content);
        existing.setPosition([lng, lat]);
        existing.setOffset(offset);
        existing.setzIndex(zIndex);
        if (existing.setExtData) {
          existing.setExtData({ id: poi.id });
        }
        if (existing.off) {
          existing.off('click');
        }
        existing.on('click', (event: any) => {
          const id = event?.target?.getExtData?.()?.id ?? poi.id;
          const target = poiById.get(id) ?? poi;
          onSelectPOI(target);
        });
      } else {
        const marker = new AMap.Marker({
          position: [lng, lat],
          content,
          offset,
          zIndex,
          extData: { id: poi.id }
        });
        marker.on('click', (event: any) => {
          const id = event?.target?.getExtData?.()?.id ?? poi.id;
          const target = poiById.get(id) ?? poi;
          onSelectPOI(target);
        });
        marker.setMap(mapRef.current);
        markerMap.set(poi.id, marker);
      }
    });

    Array.from(markerMap.entries()).forEach(([id, marker]) => {
      if (!poiIds.has(id)) {
        marker.setMap(null);
        markerMap.delete(id);
      }
    });
  }, [mapReady, pois, selectedPOI, visitedIds, onSelectPOI]);

  useEffect(() => {
    if (!mapRef.current || !selectedPOI) {
      return;
    }
    const [lng, lat] = toAMapLngLat(
      selectedPOI.latitude,
      selectedPOI.longitude,
      selectedPOI.coordinateSystem ?? COORDINATE_SYSTEM
    );
    mapRef.current.setZoomAndCenter(15, [lng, lat]);
  }, [selectedPOI]);

  return (
    <div className="h-full w-full relative z-0">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Decorative gradient overlay for top bar readability */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-[400]" />
    </div>
  );
};
