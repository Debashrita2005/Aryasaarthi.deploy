import { describe, it, expect } from 'vitest';
import {
  getLocalizedScheme,
  getLocalizedCategory,
  getLocalizedCardLabels,
  getLocalizedHomeFeatured,
  getLocalizedQuickActions,
  formatLocalizedLakh,
} from '../lib/i18n/localizationHelper';
import { SCHEMES } from '../lib/schemeData';

describe('Multi-Language Native Localization Helper', () => {
  const mfs = SCHEMES.find((s) => s.code === 'MFS')!;
  const termLoan = SCHEMES.find((s) => s.code === 'TERM_LOAN')!;

  it('translates scheme titles and taglines into Bengali (bn)', () => {
    const bnMfs = getLocalizedScheme(mfs, 'bn');
    expect(bnMfs.name).toBe('লঘু অর্থায়ন প্রকল্প (MFS)');
    expect(bnMfs.tagline).toContain('ছোট গ্রাম্য দোকান');

    const bnTerm = getLocalizedScheme(termLoan, 'bn');
    expect(bnTerm.name).toBe('মেয়াদী ঋণ প্রকল্প (TLS)');
    expect(bnTerm.tagline).toContain('বাণিজ্যিক');
  });

  it('translates scheme titles into Tamil, Telugu, and Marathi', () => {
    const taMfs = getLocalizedScheme(mfs, 'ta');
    expect(taMfs.name).toBe('குறு நிதித் திட்டம் (MFS)');

    const teMfs = getLocalizedScheme(mfs, 'te');
    expect(teMfs.name).toBe('మైక్రో ఫైనాన్స్ పథకం (MFS)');

    const mrMfs = getLocalizedScheme(mfs, 'mr');
    expect(mrMfs.name).toBe('सूक्ष्म वित्त योजना (MFS)');
  });

  it('translates category badges across languages without falling back to English', () => {
    const bnCat = getLocalizedCategory('MICRO_FINANCE', 'bn');
    expect(bnCat.label).toBe('ক্ষুদ্র ঋণ');

    const mrCat = getLocalizedCategory('TERM_LOAN', 'mr');
    expect(mrCat.label).toBe('मुदत कर्ज');

    const taCat = getLocalizedCategory('EDUCATION', 'ta');
    expect(taCat.label).toBe('உயர்கல்வி');
  });

  it('translates card metric labels into Bengali and other native languages', () => {
    const bnLabels = getLocalizedCardLabels('bn');
    expect(bnLabels.projectCostLimit).toBe('প্রকল্প ব্যয়ের সর্বোচ্চ সীমা');
    expect(bnLabels.interestRate).toBe('সুদের হার');
    expect(bnLabels.tenure).toBe('ঋণের মেয়াদ');
    expect(bnLabels.moratorium).toBe('গ্রেস পিরিয়ড');
    expect(bnLabels.years).toBe('বছর পর্যন্ত');
    expect(bnLabels.months).toBe('মাস');
    expect(bnLabels.calculate).toBe('কিস্তি বের করুন');

    const mrLabels = getLocalizedCardLabels('mr');
    expect(mrLabels.projectCostLimit).toBe('प्रकल्प खर्च मर्यादा');
    expect(mrLabels.calculate).toBe('हप्ता काढा');
  });

  it('translates the Featured Schemes section header into Bengali and other languages', () => {
    const bnFeatured = getLocalizedHomeFeatured('bn');
    expect(bnFeatured.title).toBe('বিশেষ সরকারি প্রকল্পসমূহ');
    expect(bnFeatured.subtitle).toContain('ন্যাশনাল শিডিউল্ড কাস্টস ফাইন্যান্স অ্যান্ড ডেভেলপমেন্ট কর্পোরেশন');
    expect(bnFeatured.viewAll).toBe('সমস্ত ৫টি প্রকল্প দেখুন');

    const mrFeatured = getLocalizedHomeFeatured('mr');
    expect(mrFeatured.title).toBe('प्रमुख अधिकृत योजना');
    expect(mrFeatured.viewAll).toBe('सर्व ५ योजना पहा');
  });

  it('formats amounts in native Lakh notation', () => {
    expect(formatLocalizedLakh(140000, 'bn')).toBe('₹1.4 লাখ');
    expect(formatLocalizedLakh(5000000, 'bn')).toBe('₹50 লাখ');
    expect(formatLocalizedLakh(140000, 'hi')).toBe('₹1.4 लाख');
    expect(formatLocalizedLakh(140000, 'en')).toBe('₹1.4 Lakh');
  });

  it('translates quick action buttons into native languages', () => {
    const bnActions = getLocalizedQuickActions('bn');
    expect(bnActions.explore).toBe('প্রকল্প দেখুন');
    expect(bnActions.educationLoan).toBe('শিক্ষা ঋণ');
    expect(bnActions.calculate).toBe('হিসাব করুন');
    expect(bnActions.locate).toBe('কেন্দ্র খুঁজুন');
  });
});
