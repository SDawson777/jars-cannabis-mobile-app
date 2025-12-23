-- Migration: add indexes for Product.purchasesLast30d and Order.createdAt
-- NOTE: This migration was created manually because a live Postgres DB wasn't available during generation.

-- Create index on Product.purchasesLast30d
CREATE INDEX IF NOT EXISTS "Product_purchasesLast30d_idx" ON "Product" ("purchasesLast30d");

-- Create index on Order.createdAt
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order" ("createdAt");
