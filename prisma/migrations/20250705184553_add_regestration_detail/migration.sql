-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_COMPLETED', 'ENROLLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentOption" AS ENUM ('REGISTRATION_MONTHLY', 'REGISTRATION_QUARTERLY');

-- AlterTable
ALTER TABLE "students" ALTER COLUMN "admissionDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentOption" "PaymentOption",
    "registrationFee" DECIMAL(8,2) NOT NULL DEFAULT 1000,
    "additionalFee" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(8,2) NOT NULL,
    "paidAmount" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "paymentDueDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "enrolledAt" TIMESTAMP(3),
    "enrolledById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registrations_studentId_key" ON "registrations"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_registrationNumber_key" ON "registrations"("registrationNumber");

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_enrolledById_fkey" FOREIGN KEY ("enrolledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
