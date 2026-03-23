import React, { useEffect, useRef, useState } from 'react';
import { POI } from '../types';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_CENTER_COORDINATE_SYSTEM,
  HOME_MARKER,
  COORDINATE_SYSTEM
} from '../constants';
import { getPoiTheme } from './poiTheme';
import { toAMapLngLat } from '../utils/coords';
import { loadAMap } from '../utils/amap';

const buildMarkerContent = (poi: POI, isSelected: boolean, isVisited: boolean) => {
  const theme = getPoiTheme(poi.poiType, poi.category);
  const isSchoolPOI = Boolean(poi.schoolFeatures || poi.facultyStrength || poi.overallEvaluation);
  const size = isSelected ? 28 : 24;
  const checkSize = Math.round(size * 0.7);
  const background = isVisited ? '#16a34a' : theme.marker;
  const text = isVisited ? '✓' : '';
  const labelText = poi.shortName ?? poi.name;

  if (isSchoolPOI) {
    return `<div style="position:relative;width:0;height:0;overflow:visible;">
      <div style="position:absolute;left:0;top:0;width:${size}px;height:${size}px;border-radius:999px;background:${background};border:2px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${checkSize}px;line-height:1;transform:translate(-50%,-50%);">${text}</div>
      <div style="position:absolute;left:0;top:${Math.round(size / 2) + 4}px;transform:translateX(-50%);color:${background};font-weight:700;font-size:${isSelected ? 12 : 11}px;line-height:1;white-space:nowrap;text-shadow:0 1px 2px rgba(255,255,255,0.96);">${labelText}</div>
    </div>`;
  }

  return `<div style="width:${size}px;height:${size}px;border-radius:999px;background:${background};border:2px solid #fff;box-shadow:0 6px 14px rgba(15,23,42,0.2);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${checkSize}px;line-height:1;transform:translate(-50%,-50%);">${text}</div>`;
};

const buildHomeMarkerContent = () =>
  '<div style="width:36px;height:36px;border-radius:999px;background:#2563eb;border:2px solid #fff;box-shadow:0 8px 20px rgba(37,99,235,0.28);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px;line-height:1;">家</div>';

interface POIMapProps {
  pois: POI[];
  selectedPOI: POI | null;
  visitedIds: Set<string>;
  onSelectPOI: (poi: POI) => void;
}

type LngLatTuple = [number, number];

const getPoiLngLat = (
  poi: POI,
  adjustedCoords: Record<string, LngLatTuple>
): LngLatTuple => {
  const adjusted = adjustedCoords[poi.id];
  if (adjusted) {
    return adjusted;
  }
  return toAMapLngLat(poi.latitude, poi.longitude, poi.coordinateSystem ?? COORDINATE_SYSTEM);
};

export const POIMap: React.FC<POIMapProps> = ({ pois, selectedPOI, visitedIds, onSelectPOI }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const homeMarkerRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const geocodeInFlightRef = useRef<Set<string>>(new Set());
  const hasAppliedInitialSchoolViewRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [adjustedCoords, setAdjustedCoords] = useState<Record<string, LngLatTuple>>({});

  useEffect(() => {
    let isCancelled = false;

    loadAMap()
      .then((AMap) => {
        if (isCancelled || !mapContainerRef.current) {
          return;
        }

        if (!mapRef.current) {
          const [lat, lng] = DEFAULT_MAP_CENTER;
          const [centerLng, centerLat] = toAMapLngLat(
            lat,
            lng,
            DEFAULT_MAP_CENTER_COORDINATE_SYSTEM
          );
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
      if (homeMarkerRef.current) {
        homeMarkerRef.current.setMap(null);
        homeMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      hasAppliedInitialSchoolViewRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !window.AMap) {
      return;
    }

    let isCancelled = false;
    const targets = pois.filter((poi) => {
      if (poi.autoLocate) {
        return true;
      }
      return poi.category.includes('夜市') && poi.address.startsWith('广州');
    });
    if (targets.length === 0) {
      return () => {
        isCancelled = true;
      };
    }

    const AMap = window.AMap;
    AMap.plugin('AMap.PlaceSearch', () => {
      if (isCancelled) {
        return;
      }

      targets.forEach((poi) => {
        if (adjustedCoords[poi.id] || geocodeInFlightRef.current.has(poi.id)) {
          return;
        }
        geocodeInFlightRef.current.add(poi.id);

        const placeSearch = new AMap.PlaceSearch({
          city: '广州',
          citylimit: true,
          extensions: 'base'
        });

        const rawKeyword = poi.autoLocateKeyword ?? poi.name;
        const keyword = rawKeyword.replace(/[()（）]/g, ' ').trim();
        placeSearch.search(keyword || poi.name, (status: string, result: any) => {
          geocodeInFlightRef.current.delete(poi.id);
          if (isCancelled || status !== 'complete') {
            return;
          }
          const location = result?.poiList?.pois?.[0]?.location;
          const lng = location?.lng ?? location?.getLng?.();
          const lat = location?.lat ?? location?.getLat?.();
          if (typeof lng !== 'number' || typeof lat !== 'number') {
            return;
          }
          setAdjustedCoords((prev) => (prev[poi.id] ? prev : { ...prev, [poi.id]: [lng, lat] }));
        });
      });
    });

    return () => {
      isCancelled = true;
    };
  }, [mapReady, pois, adjustedCoords]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.AMap) {
      return;
    }

    const AMap = window.AMap;
    const [lng, lat] = toAMapLngLat(
      HOME_MARKER.latitude,
      HOME_MARKER.longitude,
      HOME_MARKER.coordinateSystem
    );
    const offset = new AMap.Pixel(-18, -18);

    if (homeMarkerRef.current) {
      homeMarkerRef.current.setContent(buildHomeMarkerContent());
      homeMarkerRef.current.setPosition([lng, lat]);
      homeMarkerRef.current.setOffset(offset);
      homeMarkerRef.current.setTitle?.(HOME_MARKER.name);
      return;
    }

    homeMarkerRef.current = new AMap.Marker({
      position: [lng, lat],
      content: buildHomeMarkerContent(),
      offset,
      zIndex: 260,
      title: HOME_MARKER.name
    });
    homeMarkerRef.current.setMap(mapRef.current);
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.AMap) {
      return;
    }

    const AMap = window.AMap;
    const markerMap = markersRef.current;
    const poiIds = new Set(pois.map((poi) => poi.id));
    const poiEntries: Array<[string, POI]> = pois.map((poi) => {
      const adjusted = adjustedCoords[poi.id];
      if (!adjusted) {
        return [poi.id, poi];
      }
      return [
        poi.id,
        {
          ...poi,
          longitude: adjusted[0],
          latitude: adjusted[1],
          coordinateSystem: 'gcj02'
        }
      ];
    });
    const poiById = new Map<string, POI>(poiEntries);

    pois.forEach((poi) => {
      const isVisited = visitedIds.has(poi.id);
      const isSelected = selectedPOI?.id === poi.id;
      const content = buildMarkerContent(poi, isSelected, isVisited);
      const offset = new AMap.Pixel(0, 0);
      const [lng, lat] = getPoiLngLat(poi, adjustedCoords);
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

    markerMap.forEach((marker, id) => {
      if (!poiIds.has(id)) {
        marker.setMap(null);
        markerMap.delete(id);
      }
    });
  }, [mapReady, pois, selectedPOI, visitedIds, onSelectPOI, adjustedCoords]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.AMap || hasAppliedInitialSchoolViewRef.current) {
      return;
    }

    const schoolPois = pois.filter((poi) =>
      Boolean(poi.schoolFeatures || poi.facultyStrength || poi.overallEvaluation)
    );

    if (schoolPois.length === 0) {
      return;
    }

    const schoolMarkers = schoolPois
      .map((poi) => markersRef.current.get(poi.id))
      .filter((marker): marker is any => Boolean(marker));

    if (schoolMarkers.length === 0) {
      return;
    }

    mapRef.current.setFitView(schoolMarkers, false, [80, 120, 80, 120]);
    hasAppliedInitialSchoolViewRef.current = true;
  }, [mapReady, pois, adjustedCoords]);

  useEffect(() => {
    if (!mapRef.current || !selectedPOI) {
      return;
    }
    const [lng, lat] = getPoiLngLat(selectedPOI, adjustedCoords);
    mapRef.current.setZoomAndCenter(15, [lng, lat]);
  }, [selectedPOI, adjustedCoords]);

  useEffect(() => {
    if (!selectedPOI) {
      return;
    }
    const adjusted = adjustedCoords[selectedPOI.id];
    if (!adjusted) {
      return;
    }
    if (
      selectedPOI.coordinateSystem === 'gcj02' &&
      selectedPOI.longitude === adjusted[0] &&
      selectedPOI.latitude === adjusted[1]
    ) {
      return;
    }
    onSelectPOI({
      ...selectedPOI,
      longitude: adjusted[0],
      latitude: adjusted[1],
      coordinateSystem: 'gcj02'
    });
  }, [selectedPOI, adjustedCoords, onSelectPOI]);

  return (
    <div className="h-full w-full relative z-0">
      <div ref={mapContainerRef} className="h-full w-full" />
      
      {/* Decorative gradient overlay for top bar readability */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-[400]" />
    </div>
  );
};
