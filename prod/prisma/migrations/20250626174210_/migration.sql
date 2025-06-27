/*
  Warnings:

  - You are about to alter the column `date` on the `DailyWord` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyWord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "mode" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "words" TEXT NOT NULL
);
INSERT INTO "new_DailyWord" ("date", "id", "mode", "word", "words") SELECT "date", "id", "mode", "word", "words" FROM "DailyWord";
DROP TABLE "DailyWord";
ALTER TABLE "new_DailyWord" RENAME TO "DailyWord";
CREATE UNIQUE INDEX "DailyWord_date_mode_key" ON "DailyWord"("date", "mode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
