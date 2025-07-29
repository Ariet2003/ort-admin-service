/*
  Warnings:

  - The values [language,math] on the enum `SubjectType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubjectType_new" AS ENUM ('math1', 'math2', 'analogy', 'reading', 'grammar');
ALTER TABLE "trial_test_questions" ALTER COLUMN "subject_type" TYPE "SubjectType_new" USING ("subject_type"::text::"SubjectType_new");
ALTER TYPE "SubjectType" RENAME TO "SubjectType_old";
ALTER TYPE "SubjectType_new" RENAME TO "SubjectType";
DROP TYPE "SubjectType_old";
COMMIT;
