-- CreateTable
CREATE TABLE "Donate" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userID" TEXT NOT NULL,
    "bloodCollectoID" TEXT NOT NULL,

    CONSTRAINT "Donate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Donate" ADD CONSTRAINT "Donate_userID_fkey" FOREIGN KEY ("userID") REFERENCES "Users"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donate" ADD CONSTRAINT "Donate_bloodCollectoID_fkey" FOREIGN KEY ("bloodCollectoID") REFERENCES "BloodCollectors"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
