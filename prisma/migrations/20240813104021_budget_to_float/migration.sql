/*
  Warnings:

  - Changed the type of `budget` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "budget",
ADD COLUMN     "budget" DOUBLE PRECISION NOT NULL;
