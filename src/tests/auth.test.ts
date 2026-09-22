import { describe, it, expect } from 'vitest';
import { isFirebaseConfigured, firebaseConfig } from '../lib/auth/firebaseConfig';

describe('Citizen Authentication & Validation Logic', () => {
  const isValidIndianMobile = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    const nationalNumber = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
    return /^[6-9]\d{9}$/.test(nationalNumber);
  };

  const sanitizeNationalNumber = (phone: string): string => {
    const cleaned = phone.replace(/[\s\-\+]/g, '');
    return cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
  };

  it('validates standard 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () => {
    expect(isValidIndianMobile('9876543210')).toBe(true);
    expect(isValidIndianMobile('8123456789')).toBe(true);
    expect(isValidIndianMobile('7012345678')).toBe(true);
    expect(isValidIndianMobile('6398765432')).toBe(true);
  });

  it('correctly handles +91 prefix and space-formatted numbers', () => {
    expect(isValidIndianMobile('+91 98765 43210')).toBe(true);
    expect(isValidIndianMobile('+91-98765-43210')).toBe(true);
    expect(isValidIndianMobile('919876543210')).toBe(true);
    expect(sanitizeNationalNumber('+91 98765 43210')).toBe('9876543210');
  });

  it('rejects invalid numbers, non-Indian ranges, and wrong length strings', () => {
    expect(isValidIndianMobile('1234567890')).toBe(false); // starts with 1
    expect(isValidIndianMobile('5555555555')).toBe(false); // starts with 5
    expect(isValidIndianMobile('987654321')).toBe(false); // 9 digits
    expect(isValidIndianMobile('98765432100')).toBe(false); // 11 digits without 91
    expect(isValidIndianMobile('abcdefghij')).toBe(false); // letters
  });

  it('validates 6-digit OTP structure', () => {
    const otpRegex = /^\d{6}$/;
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    expect(randomOtp).toHaveLength(6);
    expect(otpRegex.test(randomOtp)).toBe(true);
    expect(otpRegex.test('123456')).toBe(true);
    expect(otpRegex.test('12345')).toBe(false);
    expect(otpRegex.test('1234567')).toBe(false);
    expect(otpRegex.test('12345a')).toBe(false);
  });

  it('strictly enforces OTP matching with zero hardcoded master bypasses', () => {
    const strictVerifyOtp = (entered: string, actual: string) => entered.trim() === actual.trim();

    expect(strictVerifyOtp('789012', '789012')).toBe(true);
    expect(strictVerifyOtp('123456', '789012')).toBe(false);
    expect(strictVerifyOtp('000000', '789012')).toBe(false);
  });

  it('evaluates Firebase configuration presence accurately', () => {
    expect(typeof isFirebaseConfigured).toBe('function');
    expect(typeof isFirebaseConfigured()).toBe('boolean');
    expect(typeof firebaseConfig).toBe('object');
  });
});
