// AryaSaarthi — Python Rule Engine Client Bridge
// Connects Next.js to FastAPI Python Rule Engine & MongoDB Backend on Port 8000
// Features zero-downtime automatic fallback to local TypeScript engine if Python service is offline.

import { RecommendationRequest, RecommendationResponse } from './types';
import { evaluateRecommendation } from './schemeEngine';

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

export interface PythonEngineStatus {
  online: boolean;
  database: string;
  version?: string;
  error?: string;
}

/**
 * Checks connectivity to the Python FastAPI microservice & MongoDB.
 */
export async function getPythonEngineStatus(): Promise<PythonEngineStatus> {
  try {
    const res = await fetch(`${PYTHON_ENGINE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) {
      return { online: false, database: 'disconnected', error: `HTTP ${res.status}` };
    }
    const data = await res.json();
    return {
      online: true,
      database: data.database || 'connected',
      version: data.version || '2026.09.2-live'
    };
  } catch (err: any) {
    return {
      online: false,
      database: 'offline_fallback',
      error: err.message || 'Connection failed'
    };
  }
}

/**
 * Normalizes Python FastAPI engine output to the full canonical RecommendationResponse
 * expected by the AryaSaarthi frontend, ensuring `results`, `recommended`, and `alternatives`
 * are always populated and never undefined.
 */
function normalizePythonEngineResponse(
  data: any,
  request: RecommendationRequest
): RecommendationResponse {
  const canonical = evaluateRecommendation(request);

  if (!data || typeof data !== 'object') {
    return canonical;
  }

  // If Python already returns a valid results array
  if (Array.isArray(data.results) && data.results.length > 0) {
    return {
      ...canonical,
      ...data,
      results: data.results,
      recommended: data.recommended || canonical.recommended,
      alternatives: Array.isArray(data.alternatives) ? data.alternatives : canonical.alternatives,
    };
  }

  // Handle Python FastAPI format with { bestMatch, candidateSchemes }
  const pythonBest = data.bestMatch;
  const pythonCandidates: any[] = Array.isArray(data.candidateSchemes) ? data.candidateSchemes : [];

  const allPythonItems = [
    ...(pythonBest ? [pythonBest] : []),
    ...pythonCandidates,
  ];

  const pythonByCode = new Map<string, any>();
  for (const item of allPythonItems) {
    if (item.schemeCode) pythonByCode.set(item.schemeCode, item);
    if (item.schemeId) pythonByCode.set(item.schemeId, item);
  }

  // Re-score canonical results with Python evaluation if present
  const updatedResults = canonical.results.map((resItem) => {
    const pyMatch = pythonByCode.get(resItem.schemeCode) || pythonByCode.get(resItem.scheme.id);
    if (pyMatch) {
      const isStrong = pyMatch.decision === 'STRONG_MATCH' || pyMatch.decision === 'LIKELY_MATCH';
      const isIneligible = pyMatch.decision === 'INELIGIBLE';
      return {
        ...resItem,
        decision: isStrong
          ? ('LIKELY_MATCH' as const)
          : isIneligible
          ? ('NOT_MATCHING' as const)
          : resItem.decision,
        matchScore: typeof pyMatch.score === 'number' ? Math.round(pyMatch.score * 100) : resItem.matchScore,
        reasons: Array.isArray(pyMatch.reasons) && pyMatch.reasons.length > 0 ? pyMatch.reasons : resItem.reasons,
        reasonsHi: Array.isArray(pyMatch.reasonsHi) && pyMatch.reasonsHi.length > 0 ? pyMatch.reasonsHi : resItem.reasonsHi,
        warnings: Array.isArray(pyMatch.warnings) ? pyMatch.warnings : resItem.warnings,
        warningsHi: Array.isArray(pyMatch.warningsHi) ? pyMatch.warningsHi : resItem.warningsHi,
      };
    }
    return resItem;
  });

  updatedResults.sort((a, b) => b.matchScore - a.matchScore);

  let recommended = canonical.recommended;
  if (pythonBest) {
    const topItem = updatedResults.find(
      (r) => r.schemeCode === pythonBest.schemeCode || r.scheme.id === pythonBest.schemeId
    );
    if (topItem) {
      recommended = {
        schemeId: topItem.scheme.id,
        schemeName: topItem.scheme.name,
        matchedRule: pythonBest.reasons?.[0] || canonical.recommended?.matchedRule || '',
        fitScore: typeof pythonBest.score === 'number' ? pythonBest.score : (canonical.recommended?.fitScore || 0.85),
        schemeCode: topItem.scheme.code,
        category: topItem.scheme.category,
        interestRate: `${topItem.scheme.beneficiary_interest_rate_min}% – ${topItem.scheme.beneficiary_interest_rate_max}%`,
        maxLoanAmount: topItem.scheme.max_loan_amount,
      };
    }
  }

  return {
    engineVersion: canonical.engineVersion,
    requestId: data.requestId || canonical.requestId,
    evaluatedAt: data.evaluatedAt || canonical.evaluatedAt,
    recommended,
    alternatives: canonical.alternatives,
    results: updatedResults,
    source: canonical.source,
  };
}

/**
 * Evaluates applicant recommendation using the high-performance Python Rule Engine.
 * Automatically falls back to the native TypeScript engine if the Python service is offline.
 */
export async function evaluateWithPythonEngine(
  request: RecommendationRequest
): Promise<{ response: RecommendationResponse; engineSource: 'PYTHON_FASTAPI' | 'TYPESCRIPT_FALLBACK' }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(`${PYTHON_ENGINE_URL}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        response: normalizePythonEngineResponse(data, request),
        engineSource: 'PYTHON_FASTAPI'
      };
    }
    console.warn(`[PythonEngineClient] Service returned HTTP ${res.status}, using TypeScript fallback.`);
  } catch (err: any) {
    console.info(`[PythonEngineClient] Python microservice unavailable (${err.message}). Using local TypeScript engine.`);
  }

  // Resilient Fallback to TypeScript Engine
  const fallbackResult = evaluateRecommendation(request);
  return {
    response: fallbackResult,
    engineSource: 'TYPESCRIPT_FALLBACK'
  };
}
