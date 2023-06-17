/*
  Warnings:

  - You are about to drop the column `email` on the `BloodCollectors` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `BloodCollectors` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `BloodCollectors` table. All the data in the column will be lost.
  - You are about to drop the column `userID` on the `Donate` table. All the data in the column will be lost.
  - You are about to drop the column `userUID` on the `Notification` table. All the data in the column will be lost.
  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bloodType` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `uid` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userEmail]` on the table `BloodCollectors` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userEmail` to the `BloodCollectors` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donorID` to the `Donate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donorsUID` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Donate" DROP CONSTRAINT "Donate_userID_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userUID_fkey";

-- AlterTable
ALTER TABLE "BloodCollectors" DROP COLUMN "email",
DROP COLUMN "password",
DROP COLUMN "username",
ADD COLUMN     "userEmail" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Donate" DROP COLUMN "userID",
ADD COLUMN     "donorID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userUID",
ADD COLUMN     "donorsUID" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "bloodType",
DROP COLUMN "gender",
DROP COLUMN "token",
DROP COLUMN "uid",
ADD COLUMN     "type" TEXT NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("email");

-- DropTable
DROP TABLE "Admin";

-- CreateTable
CREATE TABLE "Donors" (
    "uid" TEXT NOT NULL,
    "bloodType" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,

    CONSTRAINT "Donors_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donors_userEmail_key" ON "Donors"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "BloodCollectors_userEmail_key" ON "BloodCollectors"("userEmail");

-- AddForeignKey
ALTER TABLE "Donors" ADD CONSTRAINT "Donors_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_donorsUID_fkey" FOREIGN KEY ("donorsUID") REFERENCES "Donors"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodCollectors" ADD CONSTRAINT "BloodCollectors_userEmail_fkey" FOREIGN KEY ("userEmail") REFERENCES "Users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donate" ADD CONSTRAINT "Donate_donorID_fkey" FOREIGN KEY ("donorID") REFERENCES "Donors"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
