-- CreateTable
CREATE TABLE "BranchGrade" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,

    CONSTRAINT "BranchGrade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BranchGrade" ADD CONSTRAINT "BranchGrade_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchGrade" ADD CONSTRAINT "BranchGrade_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
