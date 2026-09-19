import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getGoogleMapsApiKey,
  isGoogleMapsKeyConfigured,
  setStoredGoogleMapsApiKey,
  removeStoredGoogleMapsApiKey,
  loadGoogleMaps,
  getGoogleMapsMarkerIcon,
  GOOGLE_MAPS_ACCESSIBILITY_STYLE,
  STORAGE_KEY_GMAPS_API_KEY
} from '../lib/maps/googleMapsLoader';

describe('Google Maps Loader & Key Management', () => {
  beforeEach(() => {
    removeStoredGoogleMapsApiKey();
  });

  it('reports key as unconfigured when no key is set', () => {
    expect(getGoogleMapsApiKey()).toBe('');
    expect(isGoogleMapsKeyConfigured()).toBe(false);
  });

  it('stores and retrieves custom API key from localStorage', () => {
    const testKey = 'AIzaSyTestApiKeyForNSFDCPlatform2026';
    setStoredGoogleMapsApiKey(testKey);

    expect(getGoogleMapsApiKey()).toBe(testKey);
    expect(isGoogleMapsKeyConfigured()).toBe(true);

    removeStoredGoogleMapsApiKey();
    expect(getGoogleMapsApiKey()).toBe('');
    expect(isGoogleMapsKeyConfigured()).toBe(false);
  });

  it('rejects loadGoogleMaps with human-friendly error when no key is provided', async () => {
    removeStoredGoogleMapsApiKey();
    await expect(loadGoogleMaps()).rejects.toThrow(/Google Maps API Key is not configured/);
  });

  it('provides accessible map styling rules with muted labels and civic contrast', () => {
    expect(GOOGLE_MAPS_ACCESSIBILITY_STYLE.length).toBeGreaterThan(0);
    const poiStyle = GOOGLE_MAPS_ACCESSIBILITY_STYLE.find(s => s.featureType === 'poi');
    expect(poiStyle).toBeDefined();
  });

  it('returns marker icon symbols for all agency types', () => {
    // When google is undefined, returns fallback
    const iconSca = getGoogleMapsMarkerIcon('SCA');
    expect(iconSca).toBeDefined();
  });
});
