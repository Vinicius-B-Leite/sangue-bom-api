/*
  Warnings:

  - Added the required column `gender` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "gender" TEXT NOT NULL;
