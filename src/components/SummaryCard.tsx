import React, { useEffect, useState } from 'react';
import { POI } from '../types';
import { MapPin, Info, Copy, Check, CheckCircle2 } from 'lucide-react';
import { getPoiTheme } from './poiTheme';
import { HOME_MARKER } from '../constants';
import { loadAMap } from '../utils/amap';
import { toAMapLngLat } from '../utils/coords';

type CommuteInfo = {
  distanceText: string;
  walkingText: string;
  drivingText: string;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceMeters = (fromLat: number, fromLng: number, toLat: number, toLng: number) => {
  const earthRadius = 6371000;
  const dLat = toRadians(toLat - fromLat);
  const dLng = toRadians(toLng - fromLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};

const formatDistance = (meters: number) => {
  if (meters >= 1000) {
    const kilometers = meters / 1000;
    return `${kilometers >= 10 ? kilometers.toFixed(0) : kilometers.toFixed(1)} 公里`;
  }
  return `${Math.round(meters)} 米`;
};

const formatDuration = (seconds: number) => {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
  }
  return `${minutes}分钟`;
};

const createFallbackCommuteInfo = (poi: POI): CommuteInfo => {
  const distanceMeters = getDistanceMeters(
    HOME_MARKER.latitude,
    HOME_MARKER.longitude,
    poi.latitude,
    poi.longitude
  );
  const walkingSeconds = (distanceMeters * 1.25) / 1.2;
  const drivingSeconds = (distanceMeters * 1.35) / 8.33;
  return {
    distanceText: formatDistance(distanceMeters),
    walkingText: `约 ${formatDuration(walkingSeconds)}`,
    drivingText: `约 ${formatDuration(drivingSeconds)}`
  };
};

interface SummaryCardProps {
  poi: POI | null;
  onOpenDetail: () => void;
  isVisited: boolean;
  onToggleVisited: (poiId: string) => void;
  preference: {
    canAttend: '' | '是' | '否';
    note: string;
  };
  onUpdatePreference: (
    poiId: string,
    nextPreference: {
      canAttend?: '' | '是' | '否';
      note?: string;
    }
  ) => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  poi,
  onOpenDetail,
  isVisited,
  onToggleVisited,
  preference,
  onUpdatePreference
}) => {
  const [copied, setCopied] = useState(false);
  const [commuteInfo, setCommuteInfo] = useState<CommuteInfo | null>(null);
  const theme = poi ? getPoiTheme(poi.poiType, poi.category) : null;
  const isSchoolPOI = Boolean(poi?.schoolFeatures || poi?.facultyStrength || poi?.overallEvaluation);
  const summaryText = poi ? poi.overallEvaluation || poi.commend || poi.brief : '';

  useEffect(() => {
    if (!poi || !isSchoolPOI) {
      setCommuteInfo(null);
      return;
    }

    const fallbackInfo = createFallbackCommuteInfo(poi);
    setCommuteInfo(fallbackInfo);

    let isCancelled = false;

    loadAMap()
      .then((AMap) => {
        if (isCancelled) {
          return;
        }

        const origin = toAMapLngLat(
          HOME_MARKER.latitude,
          HOME_MARKER.longitude,
          HOME_MARKER.coordinateSystem
        );
        const destination = toAMapLngLat(
          poi.latitude,
          poi.longitude,
          poi.coordinateSystem ?? HOME_MARKER.coordinateSystem
        );

        const createRouteSearch = (
          serviceName: 'AMap.Walking' | 'AMap.Driving',
          factory: () => any
        ) =>
          new Promise<{ distance?: number; time?: number }>((resolve) => {
            AMap.plugin(serviceName, () => {
              if (isCancelled) {
                resolve({});
                return;
              }

              const service = factory();
              service.search(origin, destination, (status: string, result: any) => {
                if (status !== 'complete') {
                  resolve({});
                  return;
                }
                const route = result?.routes?.[0];
                resolve({
                  distance: route?.distance,
                  time: route?.time
                });
              });
            });
          });

        Promise.all([
          createRouteSearch('AMap.Walking', () => new AMap.Walking({ hideMarkers: true })),
          createRouteSearch(
            'AMap.Driving',
            () =>
              new AMap.Driving({
                hideMarkers: true,
                policy: AMap.DrivingPolicy?.LEAST_TIME
              })
          )
        ])
          .then(([walking, driving]) => {
            if (isCancelled) {
              return;
            }

            setCommuteInfo({
              distanceText: formatDistance(walking.distance ?? driving.distance ?? getDistanceMeters(
                HOME_MARKER.latitude,
                HOME_MARKER.longitude,
                poi.latitude,
                poi.longitude
              )),
              walkingText: walking.time ? `约 ${formatDuration(walking.time)}` : fallbackInfo.walkingText,
              drivingText: driving.time ? `约 ${formatDuration(driving.time)}` : fallbackInfo.drivingText
            });
          })
          .catch(() => {
            if (!isCancelled) {
              setCommuteInfo(fallbackInfo);
            }
          });
      })
      .catch(() => {
        if (!isCancelled) {
          setCommuteInfo(fallbackInfo);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isSchoolPOI, poi]);

  if (!poi || !theme) return null;

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

  const handleCanAttendChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    event.stopPropagation();
    onUpdatePreference(poi.id, {
      canAttend: event.target.value as '' | '是' | '否'
    });
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onUpdatePreference(poi.id, {
      note: event.target.value
    });
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

            {(poi.phone || poi.contactPerson) && (
              <div className="text-xs text-gray-500 mb-2">
                联系人：{poi.contactPerson ?? '—'} · 电话：{poi.phone ?? '—'}
              </div>
            )}

            {isSchoolPOI && commuteInfo && (
              <div className="mb-2 rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-900 border border-purple-100">
                离家距离：{commuteInfo.distanceText} · 步行：{commuteInfo.walkingText} · 驾车：{commuteInfo.drivingText}
              </div>
            )}

            <p className="text-sm text-gray-600 line-clamp-2 leading-snug">
              <span className="font-medium text-amber-600">
                {isSchoolPOI ? '综合评价：' : poi.poiType === 'restaurant' ? '推荐理由：' : '亲子亮点：'}
              </span>
              {summaryText}
            </p>
          </div>
          
          <div className={`flex flex-col items-center justify-center self-center pl-2 ${theme.accent}`}>
             <Info size={24} />
            <span className="text-[10px] mt-1 font-medium">Details</span>
          </div>
        </div>

        <div
          className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 gap-3"
          onClick={(event) => event.stopPropagation()}
        >
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-medium">是否能上</span>
            <select
              name="是否能上"
              value={preference.canAttend}
              onChange={handleCanAttendChange}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="">未选择</option>
              <option value="是">是</option>
              <option value="否">否</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            <span className="font-medium">备注</span>
            <input
              name="备注"
              type="text"
              value={preference.note}
              onChange={handleNoteChange}
              placeholder="输入备注"
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
