-- CreateTable
CREATE TABLE "daily_words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "words" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_words_date_mode_key" ON "daily_words"("date", "mode");
