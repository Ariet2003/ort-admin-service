/*
  Warnings:

  - The values [e] on the enum `CorrectOption` will be removed. If these variants are still used in the database, this will fail.
  - The values [MANAGER,TRAINER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `option_e` on the `trial_test_questions` table. All the data in the column will be lost.
  - You are about to drop the `group_students` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trainer_subjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `trial_test_trainers` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CorrectOption_new" AS ENUM ('a', 'b', 'c', 'd');
ALTER TABLE "trial_test_questions" ALTER COLUMN "correct_option" TYPE "CorrectOption_new" USING ("correct_option"::text::"CorrectOption_new");
ALTER TYPE "CorrectOption" RENAME TO "CorrectOption_old";
ALTER TYPE "CorrectOption_new" RENAME TO "CorrectOption";
DROP TYPE "CorrectOption_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'STUDENT');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
COMMIT;

-- DropForeignKey
ALTER TABLE "group_students" DROP CONSTRAINT "group_students_group_id_fkey";

-- DropForeignKey
ALTER TABLE "group_students" DROP CONSTRAINT "group_students_student_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_course_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_current_material_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_manager_id_fkey";

-- DropForeignKey
ALTER TABLE "groups" DROP CONSTRAINT "groups_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_course_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "trainer_subjects" DROP CONSTRAINT "trainer_subjects_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "trial_test_trainers" DROP CONSTRAINT "trial_test_trainers_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "trial_test_trainers" DROP CONSTRAINT "trial_test_trainers_trial_test_id_fkey";

-- AlterTable
ALTER TABLE "trial_test_questions" DROP COLUMN "option_e";

-- DropTable
DROP TABLE "group_students";

-- DropTable
DROP TABLE "groups";

-- DropTable
DROP TABLE "payments";

-- DropTable
DROP TABLE "settings";

-- DropTable
DROP TABLE "trainer_subjects";

-- DropTable
DROP TABLE "trial_test_trainers";

-- DropEnum
DROP TYPE "GroupStatus";

-- DropEnum
DROP TYPE "GroupStudentStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PaymentType";

-- DropEnum
DROP TYPE "TrainerSubjectType";
