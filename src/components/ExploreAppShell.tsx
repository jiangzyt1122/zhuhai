import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { ZHUHAI_POIS } from '../constants';
import { POI } from '../types';
import { POIMap } from './POIMap';
import { SummaryCard } from './SummaryCard';
import { DetailView } from './DetailView';

type POICardPreference = {
  canAttend: '' | '是' | '否';
  note: string;
};

const DEFAULT_CARD_PREFERENCE: POICardPreference = {
  canAttend: '',
  note: ''
};

interface ExploreAppShellProps {
  onBack: () => void;
}

export const ExploreAppShell: React.FC<ExploreAppShellProps> = ({ onBack }) => {
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const poiIdSet = useMemo(() => new Set(ZHUHAI_POIS.map((poi) => poi.id)), []);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(() => {
    try {
      const raw = window.localStorage.getItem('visitedPoiIds');
      if (!raw) return new Set();
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      const filtered = parsed.filter((id) => typeof id === 'string' && poiIdSet.has(id));
      return new Set(filtered);
    } catch {
      return new Set();
    }
  });
  const [poiCardPreferences, setPoiCardPreferences] = useState<Record<string, POICardPreference>>(() => {
    try {
      const raw = window.localStorage.getItem('poiCardPreferences');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};

      return Object.fromEntries(
        Object.entries(parsed).flatMap(([poiId, value]) => {
          if (!poiIdSet.has(poiId) || !value || typeof value !== 'object') {
            return [];
          }

          const candidate = value as Partial<POICardPreference>;
          const canAttend = candidate.canAttend === '是' || candidate.canAttend === '否' ? candidate.canAttend : '';
          const note = typeof candidate.note === 'string' ? candidate.note : '';
          return [[poiId, { canAttend, note }]];
        })
      );
    } catch {
      return {};
    }
  });

  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi);
  };

  const handleOpenDetail = () => {
    if (selectedPOI) {
      setIsDetailOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
  };

  const handleToggleVisited = (poiId: string) => {
    setVisitedIds((prev) => {
      const next = new Set(prev);
      if (next.has(poiId)) {
        next.delete(poiId);
      } else {
        next.add(poiId);
      }
      return next;
    });
  };

  const handleUpdatePOICardPreference = (
    poiId: string,
    nextPreference: Partial<POICardPreference>
  ) => {
    setPoiCardPreferences((prev) => ({
      ...prev,
      [poiId]: {
        ...(prev[poiId] ?? DEFAULT_CARD_PREFERENCE),
        ...nextPreference
      }
    }));
  };

  useEffect(() => {
    try {
      const payload = Array.from(visitedIds);
      window.localStorage.setItem('visitedPoiIds', JSON.stringify(payload));
    } catch {
      // ignore write errors
    }
  }, [visitedIds]);

  useEffect(() => {
    try {
      window.localStorage.setItem('poiCardPreferences', JSON.stringify(poiCardPreferences));
    } catch {
      // ignore write errors
    }
  }, [poiCardPreferences]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-gray-50">
      <div className="absolute left-4 right-4 top-4 z-[400] pointer-events-none">
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100/50 bg-white/90 p-3 shadow-lg backdrop-blur-md pointer-events-auto">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              入口
            </span>
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <span className="text-lg font-bold">Z</span>
          </div>

          <div className="flex-1">
            <h1 className="text-sm font-bold leading-none text-gray-900">Zhuhai Kids Explore</h1>
            <p className="mt-0.5 text-xs text-gray-500">Perfect trips for 3-year-olds</p>
          </div>

          <button
            type="button"
            className="rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      <POIMap
        pois={ZHUHAI_POIS}
        selectedPOI={selectedPOI}
        visitedIds={visitedIds}
        onSelectPOI={handlePOISelect}
      />

      <SummaryCard
        poi={selectedPOI}
        onOpenDetail={handleOpenDetail}
        isVisited={selectedPOI ? visitedIds.has(selectedPOI.id) : false}
        onToggleVisited={handleToggleVisited}
        preference={
          selectedPOI
            ? poiCardPreferences[selectedPOI.id] ?? DEFAULT_CARD_PREFERENCE
            : DEFAULT_CARD_PREFERENCE
        }
        onUpdatePreference={handleUpdatePOICardPreference}
      />

      {isDetailOpen && selectedPOI && <DetailView poi={selectedPOI} onClose={handleCloseDetail} />}
    </div>
  );
};
