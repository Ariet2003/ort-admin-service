/*
  Warnings:

  - Changed the type of `subject_type` on the `trainer_subjects` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TrainerSubjectType" AS ENUM ('language', 'math');

-- AlterTable
ALTER TABLE "trainer_subjects" DROP COLUMN "subject_type",
ADD COLUMN     "subject_type" "TrainerSubjectType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "trainer_subjects_trainer_id_subject_type_key" ON "trainer_subjects"("trainer_id", "subject_type");
