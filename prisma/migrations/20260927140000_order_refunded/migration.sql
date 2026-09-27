-- Partial refunds accumulate on the order, so later refunds only return what
-- is left.
ALTER TABLE "Order" ADD COLUMN "refundedMinor" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD CONSTRAINT "Order_refundedMinor_range" CHECK ("refundedMinor" >= 0 AND "refundedMinor" <= "totalMinor");
