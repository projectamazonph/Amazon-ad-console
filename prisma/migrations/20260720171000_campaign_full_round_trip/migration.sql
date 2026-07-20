-- Add columns so a Campaign survives a DB round-trip without losing engine fields
ALTER TABLE "Campaign" ADD COLUMN "portfolioId" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "creativeStatus" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "creativeIssue" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "createdBySimulator" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Campaign" ADD COLUMN "productAds" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "ads" TEXT;
