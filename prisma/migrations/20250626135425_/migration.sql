/*
  Warnings:

  - You are about to drop the `daily_words` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "daily_words";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "DailyWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "words" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyWord_date_mode_key" ON "DailyWord"("date", "mode");
