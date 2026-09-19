import { describe, it, expect } from 'vitest';
import { SUPPORTED_LANGUAGES, getLanguageOption, LanguageCode } from '../lib/i18n/languages';
import { getDictionary } from '../lib/i18n/dictionaries';

describe('Multilingual i18n System — All 22 Scheduled Indian Languages + English', () => {
  it('should support exactly 23 languages (English + 22 Eighth Schedule languages)', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(23);
  });

  it('should resolve a valid, dedicated dictionary for every single supported language', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const dict = getDictionary(lang.code);
      expect(dict).toBeDefined();
      expect(dict.nav).toBeDefined();
      expect(dict.home).toBeDefined();
      expect(dict.finder).toBeDefined();
      expect(dict.calculator).toBeDefined();
      expect(dict.partners).toBeDefined();
      expect(dict.common).toBeDefined();
    });
  });

  it('should have complete navigation items across all 23 languages', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const dict = getDictionary(lang.code);
      expect(dict.nav.brand).toBeTruthy();
      expect(dict.nav.home).toBeTruthy();
      expect(dict.nav.findScheme).toBeTruthy();
      expect(dict.nav.schemes).toBeTruthy();
      expect(dict.nav.calculator).toBeTruthy();
      expect(dict.nav.partners).toBeTruthy();
      expect(dict.nav.help).toBeTruthy();
      expect(dict.nav.sources).toBeTruthy();
    });
  });

  it('should have valid cost presets and income presets in finder for all 23 languages', () => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const dict = getDictionary(lang.code);
      expect(Array.isArray(dict.finder.costPresets)).toBe(true);
      expect(dict.finder.costPresets.length).toBeGreaterThanOrEqual(5);
      expect(Array.isArray(dict.finder.incomePresets)).toBe(true);
      expect(dict.finder.incomePresets.length).toBeGreaterThanOrEqual(4);
    });
  });

  it('should correctly configure RTL direction for Urdu and Sindhi', () => {
    const urdu = getLanguageOption('ur');
    expect(urdu.dir).toBe('rtl');

    const sindhi = getLanguageOption('sd');
    expect(sindhi.dir).toBe('rtl');

    const hindi = getLanguageOption('hi');
    expect(hindi.dir).toBeUndefined();

    const english = getLanguageOption('en');
    expect(english.dir).toBeUndefined();
  });

  it('should fallback gracefully to Hindi if an unknown code is requested', () => {
    // @ts-expect-error testing invalid code fallback
    const fallbackDict = getDictionary('unknown_xyz');
    expect(fallbackDict).toBeDefined();
    expect(fallbackDict.nav.home).toBe('मुख्य पृष्ठ');
  });
});
