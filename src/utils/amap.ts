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

export const loadAMap = () => {
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
