-- CreateEnum
CREATE TYPE "StatusEnum" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userid" VARCHAR(100) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "primaryPhone" BIGINT NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "timeline" VARCHAR(20) NOT NULL,
    "budget" VARCHAR(20) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trackable" (
    "id" TEXT NOT NULL,
    "orderId" VARCHAR(255) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusEnum" NOT NULL,

    CONSTRAINT "Trackable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" BIGINT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trackable_orderId_idx" ON "Trackable"("orderId");

-- AddForeignKey
ALTER TABLE "Trackable" ADD CONSTRAINT "Trackable_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
