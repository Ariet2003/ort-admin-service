-- CreateEnum
CREATE TYPE "TrialTestType" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "TrialTestStatus" AS ENUM ('created', 'in_progress', 'ready');

-- CreateEnum
CREATE TYPE "SubjectType" AS ENUM ('math1', 'math2', 'analogy', 'reading', 'grammar');

-- CreateEnum
CREATE TYPE "CorrectOption" AS ENUM ('a', 'b', 'c', 'd', 'e');

-- CreateTable
CREATE TABLE "trial_tests" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "TrialTestType" NOT NULL,
    "status" "TrialTestStatus" NOT NULL,
    "creator_admin_id" INTEGER,
    "creator_trainer_id" INTEGER,
    "duration_minutes" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trial_test_questions" (
    "id" SERIAL NOT NULL,
    "trial_test_id" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "image_url" TEXT,
    "option_a" TEXT NOT NULL,
    "option_b" TEXT NOT NULL,
    "option_c" TEXT NOT NULL,
    "option_d" TEXT NOT NULL,
    "option_e" TEXT NOT NULL,
    "subject_type" "SubjectType" NOT NULL,
    "correct_option" "CorrectOption" NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "explanation" TEXT,
    "points" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trial_test_questions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trial_tests" ADD CONSTRAINT "trial_tests_creator_admin_id_fkey" FOREIGN KEY ("creator_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_tests" ADD CONSTRAINT "trial_tests_creator_trainer_id_fkey" FOREIGN KEY ("creator_trainer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_test_questions" ADD CONSTRAINT "trial_test_questions_trial_test_id_fkey" FOREIGN KEY ("trial_test_id") REFERENCES "trial_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trial_test_questions" ADD CONSTRAINT "trial_test_questions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
