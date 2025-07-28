/*
  Warnings:

  - You are about to drop the column `creator_trainer_id` on the `trial_tests` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "trial_tests" DROP CONSTRAINT "trial_tests_creator_trainer_id_fkey";

-- AlterTable
ALTER TABLE "trial_tests" DROP COLUMN "creator_trainer_id";

-- CreateTable
CREATE TABLE "trial_test_trainers" (
    "id" SERIAL NOT NULL,
    "trial_test_id" INTEGER NOT NULL,
    "trainer_id" INTEGER NOT NULL,

    CONSTRAINT "trial_test_trainers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trial_test_trainers_trial_test_id_trainer_id_key" ON "trial_test_trainers"("trial_test_id", "trainer_id");

-- AddForeignKey
ALTER TABLE "trial_test_trainers" ADD CONSTRAINT "trial_test_trainers_trial_test_id_fkey" FOREIGN KEY ("trial_test_id") REFERENCES "trial_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_test_trainers" ADD CONSTRAINT "trial_test_trainers_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
