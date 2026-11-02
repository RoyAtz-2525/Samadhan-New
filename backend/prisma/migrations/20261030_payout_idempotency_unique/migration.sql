-- AlterTable
-- Adds unique index on Payment(idempotencyKey)
-- Safe for existing Standard Checkout payments where idempotencyKey is NULL
CREATE UNIQUE INDEX "Payment_idempotencyKey_key" ON "Payment"("idempotencyKey");
