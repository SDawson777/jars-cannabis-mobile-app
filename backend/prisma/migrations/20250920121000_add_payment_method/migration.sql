-- Add PaymentMethod table
CREATE TABLE IF NOT EXISTS "PaymentMethod" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "cardBrand" TEXT,
  "cardLast4" TEXT,
  "holderName" TEXT,
  "expiry" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "PaymentMethod" ADD CONSTRAINT IF NOT EXISTS "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");
