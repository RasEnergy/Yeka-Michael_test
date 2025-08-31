-- DropForeignKey
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_branchId_fkey";

-- DropForeignKey
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_enrolledById_fkey";

-- DropForeignKey
ALTER TABLE "registrations" DROP CONSTRAINT "registrations_studentId_fkey";

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "discountAmount" DECIMAL(10,2),
ADD COLUMN     "finalAmount" DECIMAL(10,2),
ADD COLUMN     "registrationId" TEXT;

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "discountAmount" DECIMAL(10,2),
ADD COLUMN     "discountPercentage" DOUBLE PRECISION,
ALTER COLUMN "registrationFee" DROP DEFAULT,
ALTER COLUMN "registrationFee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "additionalFee" DROP NOT NULL,
ALTER COLUMN "additionalFee" DROP DEFAULT,
ALTER COLUMN "additionalFee" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paidAmount" DROP NOT NULL,
ALTER COLUMN "paidAmount" DROP DEFAULT,
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(10,2);

-- CreateTable
CREATE TABLE "_InvoiceToRegistration" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InvoiceToRegistration_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_PaymentToRegistration" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PaymentToRegistration_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InvoiceToRegistration_B_index" ON "_InvoiceToRegistration"("B");

-- CreateIndex
CREATE INDEX "_PaymentToRegistration_B_index" ON "_PaymentToRegistration"("B");

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToRegistration" ADD CONSTRAINT "_InvoiceToRegistration_A_fkey" FOREIGN KEY ("A") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InvoiceToRegistration" ADD CONSTRAINT "_InvoiceToRegistration_B_fkey" FOREIGN KEY ("B") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToRegistration" ADD CONSTRAINT "_PaymentToRegistration_A_fkey" FOREIGN KEY ("A") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PaymentToRegistration" ADD CONSTRAINT "_PaymentToRegistration_B_fkey" FOREIGN KEY ("B") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
