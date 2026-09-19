-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "authMethod" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'beneficiary',
    "state" TEXT,
    "district" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "projectCost" INTEGER NOT NULL,
    "annualIncome" INTEGER NOT NULL,
    "scCertificate" TEXT NOT NULL,
    "courseType" TEXT,
    "gender" TEXT,
    "recommendedSchemeId" TEXT,
    "recommendedSchemeName" TEXT,
    "fitScore" REAL,
    "matchedRule" TEXT,
    "alternativesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SearchRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedScheme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "fitScore" REAL,
    "notes" TEXT,
    "savedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedScheme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SchemeRateSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "schemeCode" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "snapshotVersion" TEXT NOT NULL,
    "interestRateMin" REAL NOT NULL,
    "interestRateMax" REAL NOT NULL,
    "rebateWomenPct" REAL,
    "maxLoanAmount" INTEGER NOT NULL,
    "repaymentMonths" INTEGER NOT NULL,
    "changeDetected" BOOLEAN NOT NULL DEFAULT false,
    "changeDescription" TEXT,
    "previousRateMin" REAL,
    "previousRateMax" REAL,
    "previousMaxLoan" INTEGER,
    "previousRepayment" INTEGER,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SearchRecord_userId_createdAt_idx" ON "SearchRecord"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SavedScheme_userId_idx" ON "SavedScheme"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedScheme_userId_schemeId_key" ON "SavedScheme"("userId", "schemeId");

-- CreateIndex
CREATE INDEX "SchemeRateSnapshot_schemeCode_checkedAt_idx" ON "SchemeRateSnapshot"("schemeCode", "checkedAt");

-- CreateIndex
CREATE INDEX "SchemeRateSnapshot_changeDetected_checkedAt_idx" ON "SchemeRateSnapshot"("changeDetected", "checkedAt");
