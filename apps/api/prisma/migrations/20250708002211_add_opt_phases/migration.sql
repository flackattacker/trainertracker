/*
  Warnings:

  - You are about to drop the column `createdByCptId` on the `Program` table. All the data in the column will be lost.
  - Added the required column `assessmentDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessor` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cptId` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateOfBirth` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cptId` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primaryGoal` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programName` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cptId` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Progress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Progress` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
CREATE TABLE "new_Assessment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assessmentDate" DATETIME NOT NULL,
    "assessor" TEXT NOT NULL,
    "notes" TEXT,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Assessment_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Assessment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assessment" ("clientId", "createdAt", "data", "id", "type") SELECT "clientId", "createdAt", "data", "id", "type" FROM "Assessment";
DROP TABLE "Assessment";
ALTER TABLE "new_Assessment" RENAME TO "Assessment";
CREATE TABLE "new_Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "codeName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("codeName", "cptId", "createdAt", "id", "status", "updatedAt") SELECT "codeName", "cptId", "createdAt", "id", "status", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_codeName_key" ON "Client"("codeName");
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");
CREATE TABLE "new_Program" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "programName" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "optPhase" TEXT NOT NULL DEFAULT 'STABILIZATION_ENDURANCE',
    "primaryGoal" TEXT NOT NULL,
    "secondaryGoals" TEXT,
    "notes" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Program_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Program_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Program" ("clientId", "createdAt", "data", "id", "updatedAt") SELECT "clientId", "createdAt", "data", "id", "updatedAt" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
CREATE TABLE "new_Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "programId" TEXT,
    "date" DATETIME NOT NULL,
    "weight" REAL,
    "bodyFat" REAL,
    "notes" TEXT,
    "data" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Progress_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Progress_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Progress" ("clientId", "createdAt", "data", "id") SELECT "clientId", "createdAt", "data", "id" FROM "Progress";
DROP TABLE "Progress";
ALTER TABLE "new_Progress" RENAME TO "Progress";
