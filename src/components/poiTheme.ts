import { POIType } from '../types';

const FOOD_CATEGORY_THEMES: Record<string, ReturnType<typeof createTheme>> = {
  燒臘名店: createTheme('bg-red-100 text-red-700', 'text-red-600', 'bg-red-50', 'border-red-100', '#dc2626'),
  茶餐廳與冰室: createTheme('bg-amber-100 text-amber-800', 'text-amber-700', 'bg-amber-50', 'border-amber-100', '#d97706'),
  港式點心與甜點: createTheme('bg-pink-100 text-pink-700', 'text-pink-600', 'bg-pink-50', 'border-pink-100', '#db2777'),
  粉麵名店: createTheme('bg-emerald-100 text-emerald-700', 'text-emerald-600', 'bg-emerald-50', 'border-emerald-100', '#059669'),
  街頭小吃: createTheme('bg-orange-100 text-orange-700', 'text-orange-600', 'bg-orange-50', 'border-orange-100', '#ea580c'),
  大排檔小菜: createTheme('bg-lime-100 text-lime-800', 'text-lime-700', 'bg-lime-50', 'border-lime-100', '#65a30d'),
  煲仔飯小菜: createTheme('bg-stone-100 text-stone-700', 'text-stone-600', 'bg-stone-50', 'border-stone-200', '#57534e'),
  港式西餐: createTheme('bg-indigo-100 text-indigo-700', 'text-indigo-600', 'bg-indigo-50', 'border-indigo-100', '#4f46e5')
};

function createTheme(
  badge: string,
  accent: string,
  softBg: string,
  border: string,
  marker: string
) {
  return {
    badge,
    accent,
    softBg,
    border,
    marker
  };
}

export const getPoiTheme = (poiType: POIType, category?: string) => {
  const foodTheme = category ? FOOD_CATEGORY_THEMES[category] : undefined;
  if (foodTheme) {
    return foodTheme;
  }

  if (category && category.includes('公办')) {
    return {
      badge: 'bg-purple-100 text-purple-700',
      accent: 'text-purple-600',
      softBg: 'bg-purple-50',
      border: 'border-purple-100',
      marker: '#9333ea'
    };
  }

  if (category && category.includes('夜市')) {
    return {
      badge: 'bg-purple-100 text-purple-700',
      accent: 'text-purple-600',
      softBg: 'bg-purple-50',
      border: 'border-purple-100',
      marker: '#a855f7'
    };
  }

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
