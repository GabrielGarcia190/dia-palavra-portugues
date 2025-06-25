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
