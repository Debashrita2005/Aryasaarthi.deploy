'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { calculateRepayment } from '@/lib/financialCalculator';
import { CalculationResult } from '@/lib/types';
import Link from 'next/link';
import {
  IndianRupee,
  Percent,
  Clock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

function CalculatorContent() {
  const { language, t } = useI18n();
  const searchParams = useSearchParams();

  // Core Calculator Values
  const [projectCost, setProjectCost] = useState<number>(250000);
  const [loanAmount, setLoanAmount] = useState<number>(225000);
  const [annualRate, setAnnualRate] = useState<number>(6.0);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(3);

  // Direct typing strings for natural, unhindered numeric typing
  const [projectCostStr, setProjectCostStr] = useState<string>('250000');
  const [loanAmountStr, setLoanAmountStr] = useState<string>('225000');
  const [annualRateStr, setAnnualRateStr] = useState<string>('6.0');
  const [tenureYearsStr, setTenureYearsStr] = useState<string>('5');
  const [moratoriumMonthsStr, setMoratoriumMonthsStr] = useState<string>('3');

  const [showSchedule, setShowSchedule] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);

  // Sync from URL params if directed from scheme detail / card
  useEffect(() => {
    const amountParam = searchParams.get('amount');
    const rateParam = searchParams.get('rate');
    const tenureParam = searchParams.get('tenure');
    const morParam = searchParams.get('moratorium');

    if (amountParam) {
      const amt = Number(amountParam);
      if (!isNaN(amt) && amt > 0) {
        setLoanAmount(amt);
        setLoanAmountStr(amt.toString());
        const cost = Math.round(amt / 0.9);
        setProjectCost(cost);
        setProjectCostStr(cost.toString());
      }
    }
    if (rateParam) {
      const r = Number(rateParam);
      if (!isNaN(r) && r >= 0) {
        setAnnualRate(r);
        setAnnualRateStr(r.toString());
      }
    }
    if (tenureParam) {
      const tMonths = Number(tenureParam);
      if (!isNaN(tMonths) && tMonths > 0) {
        const yrs = Math.max(0.5, +(tMonths / 12).toFixed(1));
        setTenureYears(yrs);
        setTenureYearsStr(yrs.toString());
      }
    }
    if (morParam) {
      const mor = Number(morParam);
      if (!isNaN(mor) && mor >= 0) {
        setMoratoriumMonths(mor);
        setMoratoriumMonthsStr(mor.toString());
      }
    }
  }, [searchParams]);

  // Recalculate whenever inputs change
  useEffect(() => {
    const totalMonths = Math.max(1, Math.round(tenureYears * 12));
    const result = calculateRepayment({
      principal: loanAmount,
      annualRate,
      tenureMonths: totalMonths,
      moratoriumMonths,
      moratoriumMode: 'NO_INTEREST_DURING_MORATORIUM',
      frequency: 'MONTHLY',
      projectCost,
    });
    setCalcResult(result);
  }, [loanAmount, projectCost, annualRate, tenureYears, moratoriumMonths]);

  // Clean typing handlers (Typing Only - No Sliders or Toggle Switches)
  const handleProjectCostChange = (val: string) => {
    setProjectCostStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setProjectCost(num);
      if (loanAmount > num) {
        setLoanAmount(num);
        setLoanAmountStr(num.toString());
      }
    }
  };

  const handleProjectCostBlur = () => {
    const num = parseFloat(projectCostStr);
    if (isNaN(num) || num <= 0) {
      setProjectCost(250000);
      setProjectCostStr('250000');
    } else {
      setProjectCost(num);
      setProjectCostStr(num.toString());
    }
  };

  const handleLoanChange = (val: string) => {
    setLoanAmountStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setLoanAmount(num);
      if (num > projectCost) {
        const newCost = Math.round(num / 0.9);
        setProjectCost(newCost);
        setProjectCostStr(newCost.toString());
      }
    }
  };

  const handleLoanBlur = () => {
    const num = parseFloat(loanAmountStr);
    if (isNaN(num) || num <= 0) {
      const fallback = Math.round(projectCost * 0.9);
      setLoanAmount(fallback);
      setLoanAmountStr(fallback.toString());
    } else {
      setLoanAmount(num);
      setLoanAmountStr(num.toString());
    }
  };

  const handleRateChange = (val: string) => {
    setAnnualRateStr(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setAnnualRate(num);
    }
  };

  const handleRateBlur = () => {
    const num = parseFloat(annualRateStr);
    if (isNaN(num) || num < 0) {
      setAnnualRate(6.0);
      setAnnualRateStr('6.0');
    } else {
      setAnnualRate(num);
      setAnnualRateStr(num.toString());
    }
  };

  const handleDigitKeyDown = (maxLen: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    const navigationKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Tab',
      'Enter',
      'Home',
      'End',
    ];
    if (navigationKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    const input = e.currentTarget;
    const hasSelection = (input.selectionEnd ?? 0) > (input.selectionStart ?? 0);
    if (input.value.length >= maxLen && !hasSelection) {
      e.preventDefault();
    }
  };

  const handleTenureChange = (val: string) => {
    const cleaned = val.replace(/[^\d.]/g, '').slice(0, 4);
    setTenureYearsStr(cleaned);
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      setTenureYears(num);
    }
  };

  const handleTenureBlur = () => {
    const num = parseFloat(tenureYearsStr);
    if (isNaN(num) || num <= 0) {
      setTenureYears(5);
      setTenureYearsStr('5');
    } else {
      const capped = Math.min(9999, num);
      setTenureYears(capped);
      setTenureYearsStr(capped.toString());
    }
  };

  const handleMoratoriumChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 3);
    setMoratoriumMonthsStr(cleaned);
    const num = parseInt(cleaned, 10);
    if (!isNaN(num) && num >= 0) {
      setMoratoriumMonths(num);
    } else if (cleaned === '') {
      setMoratoriumMonths(0);
    }
  };

  const handleMoratoriumBlur = () => {
    const num = parseInt(moratoriumMonthsStr, 10);
    if (isNaN(num) || num < 0) {
      setMoratoriumMonths(0);
      setMoratoriumMonthsStr('0');
    } else {
      const capped = Math.min(999, num);
      setMoratoriumMonths(capped);
      setMoratoriumMonthsStr(capped.toString());
    }
  };

  const marginMoney = Math.max(0, projectCost - loanAmount);
  const financedPercent = projectCost > 0 ? Math.round((loanAmount / projectCost) * 100) : 90;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-200/60">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{'← ' + t.common.backToHome}</span>
        </Link>
        <Link
          href="/schemes"
          className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:underline"
        >
          <span>{t.nav.schemes}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t.calculator.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {t.calculator.subtitle}
        </p>
      </div>

      {/* Main 2-Column Minimalist Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT: Clean Minimalist Typing Form (No Sliders, No Toggles) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="space-y-5">
            {/* 1. Project Cost */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-project-cost" className="text-xs font-bold text-slate-800">
                  {t.calculator.projectCost}
                </label>
                <span className="text-[11px] text-slate-400 font-medium">₹ Indian Rupee</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-400 font-bold text-sm select-none">₹</span>
                <input
                  id="input-project-cost"
                  type="number"
                  min="5000"
                  step="1000"
                  value={projectCostStr}
                  onChange={(e) => handleProjectCostChange(e.target.value)}
                  onBlur={handleProjectCostBlur}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm sm:text-base font-extrabold text-slate-900 transition-all outline-none"
                  placeholder="250000"
                />
              </div>

            </div>

            {/* 2. Loan Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-loan-amt" className="text-xs font-bold text-slate-800">
                  {t.calculator.loanAmount}
                </label>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-emerald-700 font-bold text-sm select-none">₹</span>
                <input
                  id="input-loan-amt"
                  type="number"
                  min="5000"
                  step="1000"
                  value={loanAmountStr}
                  onChange={(e) => handleLoanChange(e.target.value)}
                  onBlur={handleLoanBlur}
                  className="w-full pl-9 pr-4 py-3 bg-emerald-50/40 hover:bg-emerald-50/70 focus:bg-white border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm sm:text-base font-extrabold text-emerald-950 transition-all outline-none"
                  placeholder="225000"
                />
              </div>
            </div>

            {/* 3. Interest Rate & 4. Tenure Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-rate" className="text-xs font-bold text-slate-800">
                    {t.calculator.interestRate}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="input-rate"
                    type="number"
                    min="0"
                    max="30"
                    step="0.1"
                    value={annualRateStr}
                    onChange={(e) => handleRateChange(e.target.value)}
                    onBlur={handleRateBlur}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm sm:text-base font-extrabold text-slate-900 transition-all outline-none"
                    placeholder="6.0"
                  />
                  <span className="absolute right-3.5 text-slate-500 font-bold text-xs select-none">
                    % p.a.
                  </span>
                </div>

              </div>

              {/* Tenure Years */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-tenure" className="text-xs font-bold text-slate-800">
                    {t.calculator.tenure}
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="input-tenure"
                    type="number"
                    min="0.5"
                    max="9999"
                    step="any"
                    maxLength={4}
                    value={tenureYearsStr}
                    onKeyDown={handleDigitKeyDown(4)}
                    onInput={(e) => {
                      if (e.currentTarget.value.length > 4) {
                        e.currentTarget.value = e.currentTarget.value.slice(0, 4);
                      }
                    }}
                    onChange={(e) => handleTenureChange(e.target.value)}
                    onBlur={handleTenureBlur}
                    className="w-full pl-4 pr-14 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm sm:text-base font-extrabold text-slate-900 transition-all outline-none"
                    placeholder="5"
                  />
                  <span className="absolute right-3.5 text-slate-500 font-bold text-xs select-none">
                    {t.calculator.tableMonth}
                  </span>
                </div>

              </div>
            </div>

            {/* 5. Moratorium (Grace Period) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="input-moratorium" className="text-xs font-bold text-slate-800">
                  {t.calculator.moratorium}
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  id="input-moratorium"
                  type="number"
                  min="0"
                  max="999"
                  step="1"
                  maxLength={3}
                  value={moratoriumMonthsStr}
                  onKeyDown={handleDigitKeyDown(3)}
                  onInput={(e) => {
                    if (e.currentTarget.value.length > 3) {
                      e.currentTarget.value = e.currentTarget.value.slice(0, 3);
                    }
                  }}
                  onChange={(e) => handleMoratoriumChange(e.target.value)}
                  onBlur={handleMoratoriumBlur}
                  className="w-full pl-4 pr-16 py-3 bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl text-sm sm:text-base font-extrabold text-slate-900 transition-all outline-none"
                  placeholder="3"
                />
                <span className="absolute right-3.5 text-slate-500 font-bold text-xs select-none">
                  {t.calculator.tableMonth}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT: Clean, Elegant White Summary Dialogue Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                {t.calculator.monthlyInstallment}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl md:text-5xl font-black text-emerald-700 tracking-tight">
                  ₹{calcResult ? Math.round(calcResult.installmentPayment).toLocaleString('en-IN') : '0'}
                </span>
                <span className="text-sm font-semibold text-slate-500 select-none">/ {t.calculator.tableMonth}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {t.calculator.resultTitle}
              </p>
            </div>

            {/* Financial Breakdown Tiles in White Box */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">
                  {t.calculator.loanAmount}
                </span>
                <span className="font-extrabold text-slate-900 text-base">
                  ₹{loanAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">
                  {t.calculator.totalInterest}
                </span>
                <span className="font-extrabold text-amber-700 text-base">
                  ₹{calcResult ? Math.round(calcResult.totalInterest).toLocaleString('en-IN') : '0'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">
                  {t.calculator.totalRepayment}
                </span>
                <span className="font-extrabold text-slate-900 text-base">
                  ₹{calcResult ? Math.round(calcResult.totalRepayment).toLocaleString('en-IN') : '0'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <span className="text-[11px] text-slate-500 font-medium block mb-0.5">
                  {t.calculator.ownContribution}
                </span>
                <span className="font-extrabold text-emerald-700 text-base">
                  ₹{marginMoney.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action CTA below Total Amount to Repay & Breakdown */}
            <div className="pt-2">
              <Link
                href="/find-scheme"
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <span>{t.schemesPage.matchMyScheme}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Schedule Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-xs transition-colors flex items-center justify-between text-xs font-bold text-slate-800"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{t.calculator.scheduleTitle}</span>
            </span>
            {showSchedule ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Amortization Schedule */}
      {showSchedule && calcResult && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t.calculator.scheduleTitle}
              </h3>
              <p className="text-xs text-slate-500">
                {t.calculator.resultTitle}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full self-start sm:self-auto">
              {calcResult.amortizationPreview.length} {t.calculator.tableMonth}
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{t.calculator.tablePrincipal}</th>
                  <th className="p-3">{t.calculator.tableInterest}</th>
                  <th className="p-3 font-extrabold text-emerald-900">{t.calculator.tableTotal}</th>
                  <th className="p-3">{t.calculator.tableBalance}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calcResult.amortizationPreview.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-500">{row.month}</td>
                    <td className="p-3 font-medium">₹{row.principalPayment.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-medium text-amber-800">₹{row.interestPayment.toLocaleString('en-IN')}</td>
                    <td className="p-3 font-bold text-emerald-800">₹{row.totalPayment.toLocaleString('en-IN')}</td>
                    <td className="p-3 text-slate-500 font-medium">₹{row.remainingBalance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <Link
          href="/schemes"
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>{t.schemeDetail.backToSchemes}</span>
        </Link>
      </div>
    </div>
  );
}

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-sm font-semibold text-slate-500">Loading calculator...</div>}>
      <CalculatorContent />
    </Suspense>
  );
}
