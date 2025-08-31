/*
  Warnings:

  - You are about to drop the column `isRecurring` on the `fee_types` table. All the data in the column will be lost.
  - You are about to drop the `BranchGrade` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[schoolId,name]` on the table `fee_types` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[schoolId,level]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolId` to the `fee_types` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `grades` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BranchGrade" DROP CONSTRAINT "BranchGrade_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchGrade" DROP CONSTRAINT "BranchGrade_gradeId_fkey";

-- AlterTable
ALTER TABLE "fee_types" DROP COLUMN "isRecurring",
ADD COLUMN     "amount" DECIMAL(10,2),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "processedById" TEXT,
ADD COLUMN     "registrationId" TEXT;

-- DropTable
DROP TABLE "BranchGrade";

-- CreateTable
CREATE TABLE "_GradeToStudent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GradeToStudent_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_GradeToStudent_B_index" ON "_GradeToStudent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "fee_types_schoolId_name_key" ON "fee_types"("schoolId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "grades_schoolId_level_key" ON "grades"("schoolId", "level");

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_types" ADD CONSTRAINT "fee_types_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradeToStudent" ADD CONSTRAINT "_GradeToStudent_A_fkey" FOREIGN KEY ("A") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GradeToStudent" ADD CONSTRAINT "_GradeToStudent_B_fkey" FOREIGN KEY ("B") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
