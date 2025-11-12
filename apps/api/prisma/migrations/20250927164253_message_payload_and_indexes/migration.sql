-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "npcName" TEXT,
    "content" TEXT NOT NULL,
    "intent" TEXT,
    "tone" TEXT,
    "factsUsed" JSONB,
    "confidence" REAL,
    "raw" JSONB,
    "payloadJson" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("confidence", "content", "createdAt", "factsUsed", "id", "intent", "npcName", "raw", "role", "sessionId", "tone") SELECT "confidence", "content", "createdAt", "factsUsed", "id", "intent", "npcName", "raw", "role", "sessionId", "tone" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE INDEX "Message_sessionId_createdAt_idx" ON "Message"("sessionId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
