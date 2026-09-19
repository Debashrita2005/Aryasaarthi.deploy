import { describe, it, expect } from 'vitest';
import { calculateRepayment, calculatePrincipalFromEmi } from '../lib/financialCalculator';

describe('Financial Repayment Calculator (Reducing Balance)', () => {
  it('computes correct reducing balance monthly installment for standard loan', () => {
    // Example from API_SPEC.md: Principal ₹2,25,000 at 8% p.a. for 84 months
    const res = calculateRepayment({
      principal: 225000,
      annualRate: 8,
      tenureMonths: 84,
      moratoriumMonths: 0,
      frequency: 'MONTHLY'
    });

    // P = 225000, r = 0.08 / 12 = 0.0066667, n = 84
    // Compound factor = (1.0066667)^84 = 1.747377
    // EMI = 225000 * 0.0066667 * 1.747377 / 0.747377 ~= 3506.90
    expect(res.installmentPayment).toBeCloseTo(3506.90, 0);
    expect(res.totalRepayment).toBeCloseTo(294579.60, 0);
    expect(res.totalInterest).toBeCloseTo(69579.60, 0);
    expect(res.amortizationPreview.length).toBeGreaterThan(0);
  });

  it('handles zero interest rate (r = 0) correctly without division by zero', () => {
    const res = calculateRepayment({
      principal: 120000,
      annualRate: 0,
      tenureMonths: 24,
      frequency: 'MONTHLY'
    });

    expect(res.installmentPayment).toBe(5000); // 120000 / 24
    expect(res.totalInterest).toBe(0);
    expect(res.totalRepayment).toBe(120000);
  });

  it('handles moratorium mode NO_INTEREST_DURING_MORATORIUM', () => {
    const res = calculateRepayment({
      principal: 100000,
      annualRate: 4,
      tenureMonths: 36,
      moratoriumMonths: 6,
      moratoriumMode: 'NO_INTEREST_DURING_MORATORIUM'
    });

    // Principal is not inflated during moratorium
    expect(res.principal).toBe(100000);
    expect(res.moratoriumMonths).toBe(6);
    expect(res.moratoriumMode).toBe('NO_INTEREST_DURING_MORATORIUM');
  });

  it('handles moratorium mode INTEREST_ACCRUES by capitalizing interest', () => {
    const res = calculateRepayment({
      principal: 100000,
      annualRate: 6,
      tenureMonths: 36,
      moratoriumMonths: 6,
      moratoriumMode: 'INTEREST_ACCRUES'
    });

    // Simple interest accrued over 6 months at 6% = 100000 * 0.06 * (6/12) = 3000
    // Effective principal = 103000
    // EMI on 103000 at 6% for 36 months should be higher than normal 100000 EMI
    const normal = calculateRepayment({
      principal: 100000,
      annualRate: 6,
      tenureMonths: 36,
      moratoriumMonths: 0
    });

    expect(res.installmentPayment).toBeGreaterThan(normal.installmentPayment);
  });

  it('calculates own contribution and financed percentage correctly', () => {
    const res = calculateRepayment({
      principal: 180000,
      annualRate: 5,
      tenureMonths: 36,
      projectCost: 200000
    });

    expect(res.projectCost).toBe(200000);
    expect(res.marginMoney).toBe(20000); // 2,00,000 - 1,80,000
    expect(res.financedPercentage).toBe(90); // 90%
  });

  it('calculates affordable loan principal from target EMI (reverse EMI calculation)', () => {
    // If EMI is 3507 at 8% for 84 months, principal should reverse to ~225,000
    const principal = calculatePrincipalFromEmi({
      emi: 3507,
      annualRate: 8,
      tenureMonths: 84,
      frequency: 'MONTHLY'
    });
    expect(principal).toBeCloseTo(225000, -2); // Within ₹100 accuracy
  });
});

