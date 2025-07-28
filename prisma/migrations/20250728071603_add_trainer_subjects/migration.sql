-- CreateTable
CREATE TABLE "trainer_subjects" (
    "id" SERIAL NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "subject_type" "SubjectType" NOT NULL,

    CONSTRAINT "trainer_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trainer_subjects_trainer_id_subject_type_key" ON "trainer_subjects"("trainer_id", "subject_type");

-- AddForeignKey
ALTER TABLE "trainer_subjects" ADD CONSTRAINT "trainer_subjects_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
