/*
  Warnings:

  - You are about to alter the column `amount` on the `invoice_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(8,2)`.
  - You are about to alter the column `totalAmount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `paidAmount` on the `invoices` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to drop the column `subject` on the `teachers` table. All the data in the column will be lost.
  - You are about to alter the column `salary` on the `teachers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `capacity` on table `classes` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `branchId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "classes" ALTER COLUMN "capacity" SET NOT NULL,
ALTER COLUMN "capacity" SET DEFAULT 30;

-- AlterTable
ALTER TABLE "invoice_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(8,2);

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "branchId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "teachers" DROP COLUMN "subject",
ALTER COLUMN "salary" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
