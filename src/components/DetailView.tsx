import React, { useEffect, useRef, useState } from 'react';
import { POI } from '../types';
import { COORDINATE_SYSTEM } from '../constants';
import { toAMapLngLat } from '../utils/coords';
import { X, MapPin, Star, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPoiTheme } from './poiTheme';

interface DetailViewProps {
  poi: POI;
  onClose: () => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ poi, onClose }) => {
  const theme = getPoiTheme(poi.poiType, poi.category);

  const renderList = (title: string, items?: string[]) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
        <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderParagraph = (title: string, content?: string) => {
    if (!content) return null;
    return (
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{content}</p>
      </div>
    );
  };

  const renderLinks = (title: string, links?: string[]) => {
    if (!links || links.length === 0) return null;
    return (
      <div className="mb-5">
        <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
        <ul className="space-y-1 text-sm text-blue-600 underline break-all">
          {links.map((link, index) => {
            let label = link;
            try {
              const url = new URL(link);
              label = `${url.host}${url.pathname}`;
            } catch (error) {
              // Keep raw link text if URL parsing fails.
            }
            return (
              <li key={`${title}-link-${index}`}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const primaryStat = (() => {
    if (poi.playTimeHours) {
      return { label: '游玩时长', value: `约 ${poi.playTimeHours} 小时` };
    }
    if (poi.openTime && poi.closeTime) {
      return { label: '开放时间', value: `${poi.openTime} - ${poi.closeTime}` };
    }
    if (poi.recommendedDishes && poi.recommendedDishes.length > 0) {
      return { label: '推荐菜', value: `${poi.recommendedDishes.length} 道` };
    }
    return { label: '亲子友好', value: '高' };
  })();

  const gallery = poi.images && poi.images.length > 0 ? poi.images : [poi.image];
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [displayLng, displayLat] = toAMapLngLat(
    poi.latitude,
    poi.longitude,
    poi.coordinateSystem ?? COORDINATE_SYSTEM
  );

  useEffect(() => {
    if (!isGalleryOpen || !galleryRef.current) return;
    const container = galleryRef.current;
    const width = container.clientWidth;
    container.scrollTo({ left: width * galleryIndex, behavior: 'auto' });
  }, [isGalleryOpen, galleryIndex]);

  const handleOpenGallery = (index: number) => {
    setGalleryIndex(index);
    setIsGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
  };

  const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setGalleryIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setGalleryIndex((prev) => (prev + 1) % gallery.length);
  };

  const handleGalleryScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const width = target.clientWidth || 1;
    const nextIndex = Math.round(target.scrollLeft / width);
    if (nextIndex !== galleryIndex) {
      setGalleryIndex(nextIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white overflow-y-auto animate-in slide-in-from-bottom-full duration-300">
      {/* Hero Image */}
      <div className="relative h-64 w-full">
        <div
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
          style={{ touchAction: 'pan-x' }}
        >
          {gallery.map((src, index) => (
            <button
              key={`${poi.id}-hero-${index}`}
              type="button"
              className="h-full w-full flex-shrink-0 snap-center"
              onClick={() => handleOpenGallery(index)}
              aria-label={`查看${poi.name}图片 ${index + 1}`}
            >
              <img
                src={src}
                alt={`${poi.name}-${index + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        >
          <X size={24} className="text-gray-800" />
        </button>
      </div>

      <div className="px-6 py-6 -mt-6 relative bg-white rounded-t-3xl min-h-screen">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${theme.badge}`}>
              {poi.category}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{poi.name}</h1>
          <div className="flex items-center text-gray-500 font-medium">
             <MapPin size={18} className="mr-2 text-gray-400" />
             {poi.address}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                    <Star size={18} className="fill-amber-500 text-amber-500" />
                    {primaryStat.label}
                </div>
                <div className="text-2xl font-black text-gray-800">{primaryStat.value}</div>
                <div className="text-xs text-gray-500">亲子行程参考</div>
            </div>
             <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 text-green-800 font-bold mb-1">
                    <Navigation size={18} />
                    Location
                </div>
                <div className="text-sm text-gray-700">
                    {displayLat.toFixed(3)}, {displayLng.toFixed(3)}
                </div>
            </div>
        </div>

        {/* Why for Kids Section */}
        <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                亲子要点
            </h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {poi.commend || poi.brief}
            </p>
        </div>

        {renderLinks('参考链接', poi.noteLinks)}

        <div className="mb-8">
          {renderParagraph('背景介绍', poi.backgroundIntro)}
          {renderParagraph('背景信息', poi.backgroundInfo)}
          {(poi.openTime || poi.closeTime) && (
            <div className="mb-5">
              <h3 className="text-sm font-bold text-gray-900 mb-2">开放时间</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {poi.openTime ?? '—'} - {poi.closeTime ?? '—'}
              </p>
            </div>
          )}
          {renderList('什么值得玩', poi.whatToPlay)}
          {renderList('必打卡', poi.mustNotMiss)}
          {renderList('准备清单', poi.whatToPrepare)}
          {renderList('餐厅特点', poi.restaurantFeatures)}
          {renderList('推荐菜', poi.recommendedDishes)}
          {renderList('适合亲子', poi.whyGoodForFamily)}
          {renderList('推荐活动', poi.recommendedActivities)}
          {renderList('参观方式', poi.recommendedVisitWay)}
          {renderList('家长提示', poi.notesForParents)}
        </div>

        {/* AI Travel Tips removed per request */}
      </div>

      {isGalleryOpen && (
        <div
          className="fixed inset-0 z-[1200] bg-black/80 backdrop-blur-sm"
          onClick={handleCloseGallery}
        >
          <div className="absolute top-4 right-4 z-10">
            <button
              type="button"
              className="p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
              onClick={handleCloseGallery}
              aria-label="关闭图片"
            >
              <X size={20} className="text-gray-800" />
            </button>
          </div>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                onClick={handlePrev}
                aria-label="上一张"
              >
                <ChevronLeft size={22} className="text-gray-800" />
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
                onClick={handleNext}
                aria-label="下一张"
              >
                <ChevronRight size={22} className="text-gray-800" />
              </button>
            </>
          )}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm"
          >
            {galleryIndex + 1} / {gallery.length}
          </div>
          <div
            className="h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar"
            ref={galleryRef}
            onClick={(event) => event.stopPropagation()}
            onScroll={handleGalleryScroll}
            style={{ touchAction: 'pan-x' }}
          >
            <div className="flex h-full w-full">
              {gallery.map((src, index) => (
                <div
                  key={`${poi.id}-modal-${index}`}
                  className="h-full w-full flex-shrink-0 snap-center flex items-center justify-center"
                >
                  <img
                    src={src}
                    alt={`${poi.name}-full-${index + 1}`}
                    className="max-h-full max-w-full object-contain"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
