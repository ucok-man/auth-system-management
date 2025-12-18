/*
  Warnings:

  - Added the required column `scope` to the `Verification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationScope" AS ENUM ('SelectRole');

-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "scope" "VerificationScope" NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
