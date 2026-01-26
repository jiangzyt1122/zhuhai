import { POIType } from '../types';

export const getPoiTheme = (poiType: POIType) => {
  if (poiType === 'restaurant') {
    return {
      badge: 'bg-rose-100 text-rose-700',
      accent: 'text-rose-600',
      softBg: 'bg-rose-50',
      border: 'border-rose-100',
      marker: '#f43f5e'
    };
  }

  return {
    badge: 'bg-sky-100 text-sky-700',
    accent: 'text-sky-600',
    softBg: 'bg-sky-50',
    border: 'border-sky-100',
    marker: '#0ea5e9'
  };
};
