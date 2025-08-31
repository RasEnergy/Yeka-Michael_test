-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('REGULAR_STUDENT', 'NEW_STUDENT');

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "photo" TEXT;

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "gradeId" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "studentType" "StudentType" NOT NULL DEFAULT 'NEW_STUDENT';

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
