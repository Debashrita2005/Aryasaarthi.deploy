export const STORAGE_KEY_GMAPS_API_KEY = 'sahayak_gmaps_api_key';

let memoryApiKey = '';

/**
 * Retrieves the active Google Maps API key from browser localStorage, memory, or environment variable.
 */
export function getGoogleMapsApiKey(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_GMAPS_API_KEY);
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {
      // Ignore localStorage security/sandbox restrictions
    }
  }

  if (memoryApiKey) {
    return memoryApiKey;
  }

  const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (envKey && envKey.trim().length > 0) {
    return envKey.trim();
  }

  return '';
}

/**
 * Checks if a valid non-empty Google Maps API key is configured.
 */
export function isGoogleMapsKeyConfigured(): boolean {
  const key = getGoogleMapsApiKey();
  return typeof key === 'string' && key.trim().length > 5;
}

/**
 * Saves a Google Maps API key to localStorage and memory for instant runtime usage.
 */
export function setStoredGoogleMapsApiKey(key: string): void {
  const trimmed = key ? key.trim() : '';
  memoryApiKey = trimmed;

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      if (trimmed) {
        window.localStorage.setItem(STORAGE_KEY_GMAPS_API_KEY, trimmed);
      } else {
        window.localStorage.removeItem(STORAGE_KEY_GMAPS_API_KEY);
      }
    } catch {
      // Ignore
    }
  }
}

/**
 * Clears any user-entered Google Maps API key from localStorage and memory.
 */
export function removeStoredGoogleMapsApiKey(): void {
  memoryApiKey = '';

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(STORAGE_KEY_GMAPS_API_KEY);
    } catch {
      // Ignore
    }
  }
}

import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isOptionsSet = false;
let loadPromise: Promise<typeof google> | null = null;

/**
 * Dynamically loads the official Google Maps JavaScript API using setOptions & importLibrary.
 */
export function loadGoogleMaps(customKey?: string): Promise<typeof google> {
  const apiKey = customKey || getGoogleMapsApiKey();

  if (!apiKey) {
    return Promise.reject(
      new Error('Google Maps API Key is not configured. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY or configure in UI.')
    );
  }

  // If already loaded on window, return it
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }

  if (!loadPromise || customKey) {
    setOptions({
      key: apiKey,
      v: 'weekly',
    });
    isOptionsSet = true;

    loadPromise = Promise.all([
      importLibrary('maps'),
      importLibrary('places'),
      importLibrary('geometry'),
      importLibrary('marker'),
    ]).then(() => {
      if (typeof window !== 'undefined') {
        return (window as any).google;
      }
      return {} as typeof google;
    });
  }

  return loadPromise;
}

/**
 * Accessible Custom Map Styling tailored for NSFDC Citizen Navigation
 */
export const GOOGLE_MAPS_ACCESSIBILITY_STYLE: google.maps.MapTypeStyle[] = [
  {
    featureType: 'poi',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [{ color: '#cbe6f7' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#0369a1' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f8fafc' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e2e8f0' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fed7aa' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#fdba74' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#94a3b8' }, { weight: 1.5 }],
  },
  {
    featureType: 'administrative.province',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#cbd5e1' }, { weight: 1.2 }],
  },
];

/**
 * Returns SVG Pin Icon configuration for Google Maps markers
 */
export function getGoogleMapsMarkerIcon(
  type: 'SCA' | 'BANK' | 'RRB' | 'USER'
): google.maps.Icon | google.maps.Symbol {
  if (typeof google === 'undefined' || !google.maps) {
    // Fallback object before google object loads
    return {
      url: '',
    };
  }

  switch (type) {
    case 'SCA':
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#15803d', // Emerald Green for State Agencies
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.8,
        anchor: new google.maps.Point(12, 22),
        labelOrigin: new google.maps.Point(12, 9),
      };
    case 'BANK':
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#1d4ed8', // Royal Blue for Commercial / Lead Banks
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.8,
        anchor: new google.maps.Point(12, 22),
        labelOrigin: new google.maps.Point(12, 9),
      };
    case 'RRB':
      return {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#d97706', // Deep Amber for Regional Rural Banks
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 1.8,
        anchor: new google.maps.Point(12, 22),
        labelOrigin: new google.maps.Point(12, 9),
      };
    case 'USER':
      return {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#0284c7',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 8,
      };
  }
}
