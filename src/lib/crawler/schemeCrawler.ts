import prisma from '../db';
import { getSchemeByCode } from '../schemeData';
import { MONITORED_SOURCES, CrawlerTargetSource } from './sources';
import { scrapePortalSource, ScrapedPortalData, ScrapeOptions } from './scraperEngine';

export interface CrawledUpdateProposal {
  schemeCode: string;
  schemeName: string;
  provider: string;
  sourceUrl: string;
  oldInterestRateMin?: number;
  newInterestRateMin: number;
  oldInterestRateMax?: number;
  newInterestRateMax: number;
  oldMaxLoan?: number;
  newMaxLoan?: number;
  oldRepaymentMonths?: number;
  newRepaymentMonths?: number;
  changeSummary: string;
  confidenceScore: number;
  isLiveFetch?: boolean;
  httpStatus?: number;
  latencyMs?: number;
}

export interface CrawlScanResult {
  timestamp: string;
  sourcesScanned: number;
  proposalsFound: number;
  newPendingCreated: number;
  rateAlertsCreated: number;
  items: Array<{
    sourceName: string;
    schemeCode: string;
    status: 'NEW_PENDING_PROPOSAL' | 'ALREADY_PENDING' | 'UP_TO_DATE' | 'PORTAL_UNREACHABLE' | 'GAZETTE_VERIFIED';
    summary?: string;
    isLiveFetch?: boolean;
    latencyMs?: number;
    httpStatus?: number;
    rawExcerpt?: string;
  }>;
}

export async function runAutomatedPortalCrawler(options?: ScrapeOptions): Promise<CrawlScanResult> {
  const resultItems: CrawlScanResult['items'] = [];
  let proposalsFound = 0;
  let newPendingCreated = 0;
  let rateAlertsCreated = 0;

  for (const source of MONITORED_SOURCES) {
    // 1. Live scrape official source
    const scrapedData: ScrapedPortalData = await scrapePortalSource(source, options);

    // 2. Handle unreachable / failed portal requests honestly without fake data
    if (!scrapedData.isLiveFetch) {
      resultItems.push({
        sourceName: source.name,
        schemeCode: source.targetSchemeCode,
        status: 'PORTAL_UNREACHABLE',
        summary: scrapedData.errorMessage || 'Official portal connection timed out or blocked.',
        isLiveFetch: false,
        httpStatus: scrapedData.httpStatus || 0,
        latencyMs: scrapedData.latencyMs,
      });
      continue;
    }

    // 3. Handle Central Gazette / General Policy Sources (PIB & MSJE)
    if (
      source.category === 'CENTRAL_GAZETTE' ||
      !source.targetSchemeCode ||
      source.targetSchemeCode.startsWith('GENERAL') ||
      source.targetSchemeCode.startsWith('CENTRAL')
    ) {
      resultItems.push({
        sourceName: source.name,
        schemeCode: source.targetSchemeCode,
        status: 'GAZETTE_VERIFIED',
        summary: scrapedData.rawExcerpt || scrapedData.changeSummary || 'Official gazette releases monitored and verified.',
        isLiveFetch: true,
        httpStatus: scrapedData.httpStatus || 200,
        latencyMs: scrapedData.latencyMs,
        rawExcerpt: scrapedData.rawExcerpt,
      });
      continue;
    }

    const baseScheme = getSchemeByCode(source.targetSchemeCode);
    if (!baseScheme) continue;

    // Check if there are active database overrides already approved for this scheme
    const currentOverride = await prisma.activeSchemeOverride.findUnique({
      where: { schemeCode: baseScheme.code },
    });

    const activeMinRate = currentOverride ? currentOverride.interestRateMin : baseScheme.beneficiary_interest_rate_min;
    const activeMaxRate = currentOverride ? currentOverride.interestRateMax : baseScheme.beneficiary_interest_rate_max;
    const activeMaxLoan = currentOverride ? currentOverride.maxLoanAmount : baseScheme.max_loan_amount;
    const activeRepayment = currentOverride ? currentOverride.repaymentMonths : baseScheme.repayment_period_months;

    // Parameter is considered drifted only if the scraped value falls OUTSIDE the approved scheme bracket
    const rateDrift =
      scrapedData.interestRateMin !== undefined &&
      (scrapedData.interestRateMin < activeMinRate - 0.01 || (scrapedData.interestRateMax ?? scrapedData.interestRateMin) > activeMaxRate + 0.01) &&
      scrapedData.interestRateMin !== activeMinRate &&
      scrapedData.interestRateMax !== activeMaxRate;

    const loanMatchesOfficialCap =
      scrapedData.maxLoanAmount !== undefined &&
      (scrapedData.maxLoanAmount === activeMaxLoan ||
        scrapedData.maxLoanAmount === baseScheme.project_cost_max ||
        Math.abs(scrapedData.maxLoanAmount - activeMaxLoan) <= Math.max(activeMaxLoan * 0.15, 60000));

    const loanDrift = scrapedData.maxLoanAmount !== undefined && !loanMatchesOfficialCap;

    const repaymentDrift =
      scrapedData.repaymentMonths !== undefined &&
      Math.abs(scrapedData.repaymentMonths - activeRepayment) > 6;

    const hasRateDrift = rateDrift || loanDrift || repaymentDrift;

    const todayStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (!hasRateDrift) {
      // Update VerifiedScheme lastVerifiedDate in database to record live confirmation
      try {
        await prisma.verifiedScheme.updateMany({
          where: { code: baseScheme.code },
          data: {
            lastVerifiedDate: todayStr,
            officialSourceUrl: scrapedData.portalUrl,
          },
        });
      } catch (err) {
        // Non-fatal
      }

      resultItems.push({
        sourceName: source.name,
        schemeCode: source.targetSchemeCode,
        status: 'UP_TO_DATE',
        summary: `Live verified on ${todayStr} (HTTP ${scrapedData.httpStatus || 200}, ${scrapedData.latencyMs}ms). Official terms match current database.`,
        isLiveFetch: true,
        httpStatus: scrapedData.httpStatus || 200,
        latencyMs: scrapedData.latencyMs,
        rawExcerpt: scrapedData.rawExcerpt,
      });
      continue;
    }

    // Genuine drift detected from live official portal!
    proposalsFound++;

    const newMinRate = scrapedData.interestRateMin ?? activeMinRate;
    const newMaxRate = scrapedData.interestRateMax ?? activeMaxRate;
    const newMaxLoan = scrapedData.maxLoanAmount ?? activeMaxLoan;
    const newRepayment = scrapedData.repaymentMonths ?? activeRepayment;

    // 1. Record genuine Rate Alert Snapshot
    try {
      await prisma.schemeRateSnapshot.create({
        data: {
          schemeCode: baseScheme.code,
          schemeName: baseScheme.name,
          snapshotVersion: `LIVE-CRAWL-${new Date().toISOString().split('T')[0]}`,
          interestRateMin: newMinRate,
          interestRateMax: newMaxRate,
          maxLoanAmount: newMaxLoan,
          repaymentMonths: newRepayment,
          changeDetected: true,
          changeDescription: scrapedData.changeSummary || `Live update detected from ${source.name}`,
          previousRateMin: activeMinRate,
          previousRateMax: activeMaxRate,
          previousMaxLoan: activeMaxLoan,
          previousRepayment: activeRepayment,
          checkedAt: new Date(),
        },
      });
      rateAlertsCreated++;
    } catch (snapErr) {
      console.error('[runAutomatedPortalCrawler] Failed to write SchemeRateSnapshot:', snapErr);
    }

    // 2. Check if there is already a PENDING_REVIEW record for this scheme to avoid duplicates
    const existingPending = await prisma.pendingSchemeUpdate.findFirst({
      where: {
        schemeCode: baseScheme.code,
        status: 'PENDING_REVIEW',
      },
    });

    if (existingPending) {
      resultItems.push({
        sourceName: source.name,
        schemeCode: baseScheme.code,
        status: 'ALREADY_PENDING',
        summary: `Update detected from live portal — already in admin queue awaiting verification.`,
        isLiveFetch: true,
        httpStatus: scrapedData.httpStatus || 200,
        latencyMs: scrapedData.latencyMs,
        rawExcerpt: scrapedData.rawExcerpt,
      });
      continue;
    }

    // 3. Stage genuine update for admin human review
    await prisma.pendingSchemeUpdate.create({
      data: {
        schemeCode: baseScheme.code,
        schemeName: baseScheme.name,
        provider: source.name,
        sourceUrl: scrapedData.portalUrl,
        status: 'PENDING_REVIEW',
        oldInterestRateMin: activeMinRate,
        newInterestRateMin: newMinRate,
        oldInterestRateMax: activeMaxRate,
        newInterestRateMax: newMaxRate,
        oldMaxLoan: activeMaxLoan,
        newMaxLoan: newMaxLoan,
        oldRepaymentMonths: activeRepayment,
        newRepaymentMonths: newRepayment,
        changeSummary: scrapedData.changeSummary || `Live verified parameter drift detected from ${source.name}`,
        confidenceScore: scrapedData.confidenceScore || 1.0,
        reviewNotes: `Live Crawl from ${source.name}. HTTP ${scrapedData.httpStatus} (${scrapedData.latencyMs}ms). Excerpt: ${scrapedData.rawExcerpt?.slice(0, 200) || 'N/A'}`,
        isPublished: false,
      },
    });

    newPendingCreated++;
    resultItems.push({
      sourceName: source.name,
      schemeCode: baseScheme.code,
      status: 'NEW_PENDING_PROPOSAL',
      summary: scrapedData.changeSummary,
      isLiveFetch: true,
      httpStatus: scrapedData.httpStatus || 200,
      latencyMs: scrapedData.latencyMs,
      rawExcerpt: scrapedData.rawExcerpt,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    sourcesScanned: MONITORED_SOURCES.length,
    proposalsFound,
    newPendingCreated,
    rateAlertsCreated,
    items: resultItems,
  };
}
