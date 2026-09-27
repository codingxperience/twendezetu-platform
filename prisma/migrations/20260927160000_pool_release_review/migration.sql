-- Large pool releases wait for a finance review; this records the request.
ALTER TABLE "Pool" ADD COLUMN "releaseRequestedAt" TIMESTAMP(3);
CREATE INDEX "Pool_releaseRequestedAt" ON "Pool" ("releaseRequestedAt") WHERE "releaseRequestedAt" IS NOT NULL AND "status" <> 'RELEASED';
