import React, { useState } from 'react';
import { POI } from '../types';
import { MapPin, Info, Copy, Check, CheckCircle2 } from 'lucide-react';
import { getPoiTheme } from './poiTheme';

interface SummaryCardProps {
  poi: POI | null;
  onOpenDetail: () => void;
  isVisited: boolean;
  onToggleVisited: (poiId: string) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ poi, onOpenDetail, isVisited, onToggleVisited }) => {
  const [copied, setCopied] = useState(false);

  if (!poi) return null;

  const theme = getPoiTheme(poi.poiType, poi.category);

  const handleCopyName = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(poi.name);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = poi.name;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleToggleVisited = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleVisited(poi.id);
  };

  return (
    <div className="absolute bottom-6 left-4 right-4 z-[500]">
      <div 
        className="bg-white rounded-2xl shadow-xl p-4 cursor-pointer transform transition-all hover:scale-[1.02] active:scale-[0.98] border border-gray-100"
        onClick={onOpenDetail}
      >
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
            <img src={poi.images?.[0] ?? poi.image} alt={poi.name} className="w-full h-full object-cover" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-1 ${theme.badge}`}>
                    {poi.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 truncate">{poi.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleVisited}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    isVisited ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'
                  } hover:opacity-80 transition`}
                  aria-label={`${isVisited ? '取消' : '标记'}已打卡`}
                >
                  <CheckCircle2 size={14} />
                  {isVisited ? '已打卡' : '打卡'}
                </button>
                <button
                  type="button"
                  onClick={handleCopyName}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.border} ${theme.softBg} ${theme.accent} hover:opacity-80 transition`}
                  aria-label={`复制${poi.name}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
            
            <div className="flex items-center text-gray-500 text-sm mt-1 mb-2">
              <MapPin size={14} className="mr-1" />
              <span className="truncate">{poi.address}</span>
            </div>

            <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
              <span className="font-medium text-amber-600">
                {poi.poiType === 'restaurant' ? '推荐理由：' : '亲子亮点：'}
              </span>
              {poi.brief}
            </p>
          </div>
          
          <div className={`flex flex-col items-center justify-center self-center pl-2 ${theme.accent}`}>
             <Info size={24} />
             <span className="text-[10px] mt-1 font-medium">Details</span>
          </div>
        </div>
      </div>
    </div>
  );
};
