export type POICategory = string;

export type POIType = 'attraction' | 'restaurant';

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  poiType: POIType;
  address: string;
  latitude: number;
  longitude: number;
  brief: string;
  commend: string;
  image: string; // Placeholder URL
  images?: string[];
  noteLinks: string[];
  coordinateSystem?: 'wgs84' | 'gcj02';
  autoLocate?: boolean;
  playTimeHours?: number;
  whatToPlay?: string[];
  mustNotMiss?: string[];
  whatToPrepare?: string[];
  notesForParents?: string[];
  restaurantFeatures?: string[];
  recommendedDishes?: string[];
  backgroundIntro?: string;
  whyGoodForFamily?: string[];
  recommendedActivities?: string[];
  backgroundInfo?: string;
  openTime?: string;
  closeTime?: string;
  recommendedVisitWay?: string[];
}

export interface MapViewState {
  center: [number, number];
  zoom: number;
}
