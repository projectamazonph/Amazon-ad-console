-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "portfolio" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Enabled',
    "dailyBudget" REAL NOT NULL DEFAULT 25,
    "defaultBid" REAL NOT NULL DEFAULT 0.75,
    "startDate" TEXT,
    "endDate" TEXT,
    "targetingMode" TEXT,
    "adFormat" TEXT,
    "campaignGoal" TEXT,
    "bidStrategy" TEXT,
    "placements" TEXT,
    "products" TEXT,
    "creative" TEXT,
    "metrics" TEXT,
    "adGroups" TEXT,
    "targets" TEXT,
    "searchTerms" TEXT,
    "negatives" TEXT,
    "budgetRules" TEXT,
    "history" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 7,
    "results" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_userId_campaignId_key" ON "Campaign"("userId", "campaignId");
