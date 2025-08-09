-- CreateEnum
CREATE TYPE "Language" AS ENUM ('KYRGYZ', 'RUSSIAN');

-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'RUSSIAN';

-- AlterTable
ALTER TABLE "trial_tests" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'RUSSIAN';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'RUSSIAN';
