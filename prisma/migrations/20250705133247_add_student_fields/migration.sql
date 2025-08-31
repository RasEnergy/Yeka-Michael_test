-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "workplace" TEXT;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "placeOfBirth" TEXT;
