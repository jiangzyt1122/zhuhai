import React, { useState } from 'react';
import { POIMap } from './components/POIMap';
import { SummaryCard } from './components/SummaryCard';
import { DetailView } from './components/DetailView';
import { ZHUHAI_POIS } from './constants';
import { POI } from './types';
import { Search } from 'lucide-react';

const App: React.FC = () => {
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  const handlePOISelect = (poi: POI) => {
    setSelectedPOI(poi);
    // On mobile, just showing the summary card is usually enough first interaction
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

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Top Search Bar / Header - Absolute positioned over map */}
      <div className="absolute top-4 left-4 right-4 z-[400] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-2xl p-3 flex items-center gap-3 pointer-events-auto border border-gray-100/50">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-blue-200 shadow-md">
             <span className="font-bold text-lg">Z</span>
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-bold text-gray-900 leading-none">Zhuhai Kids Explore</h1>
            <p className="text-xs text-gray-500 mt-0.5">Perfect trips for 3-year-olds</p>
          </div>
          <button className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Main Map */}
      <POIMap 
        pois={ZHUHAI_POIS} 
        selectedPOI={selectedPOI}
        visitedIds={visitedIds}
        onSelectPOI={handlePOISelect}
      />

      {/* Bottom Summary Card */}
      <SummaryCard 
        poi={selectedPOI} 
        onOpenDetail={handleOpenDetail}
        isVisited={selectedPOI ? visitedIds.has(selectedPOI.id) : false}
        onToggleVisited={handleToggleVisited}
      />

      {/* Full Screen Detail View */}
      {isDetailOpen && selectedPOI && (
        <DetailView 
          poi={selectedPOI} 
          onClose={handleCloseDetail} 
        />
      )}
    </div>
  );
};

export default App;
