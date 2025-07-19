-- CreateTable
CREATE TABLE "SessionWorkout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "workoutName" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionWorkout_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionWorkout_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionWorkoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "exerciseName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "plannedSets" INTEGER NOT NULL,
    "plannedReps" INTEGER NOT NULL,
    "plannedWeight" REAL,
    "plannedRestTime" INTEGER,
    "plannedTempo" TEXT,
    "plannedRpe" INTEGER,
    "actualSets" INTEGER,
    "actualReps" INTEGER,
    "actualWeight" REAL,
    "actualRestTime" INTEGER,
    "actualTempo" TEXT,
    "actualRpe" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "difficulty" TEXT,
    "formQuality" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SessionPerformance_sessionWorkoutId_fkey" FOREIGN KEY ("sessionWorkoutId") REFERENCES "SessionWorkout" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SetPerformance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionPerformanceId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "setType" TEXT NOT NULL DEFAULT 'WORKING',
    "reps" INTEGER,
    "weight" REAL,
    "restTime" INTEGER,
    "tempo" TEXT,
    "rpe" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "difficulty" TEXT,
    "formQuality" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SetPerformance_sessionPerformanceId_fkey" FOREIGN KEY ("sessionPerformanceId") REFERENCES "SessionPerformance" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
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
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Program_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Program_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Program" ("clientId", "cptId", "createdAt", "data", "endDate", "id", "notes", "optPhase", "primaryGoal", "programName", "secondaryGoals", "startDate", "updatedAt") SELECT "clientId", "cptId", "createdAt", "data", "endDate", "id", "notes", "optPhase", "primaryGoal", "programName", "secondaryGoals", "startDate", "updatedAt" FROM "Program";
DROP TABLE "Program";
ALTER TABLE "new_Program" RENAME TO "Program";
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "programId" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT NOT NULL DEFAULT 'IN_PERSON',
    "location" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" JSONB,
    "parentSessionId" TEXT,
    "recurringSessionId" TEXT,
    "completedAt" DATETIME,
    "completionNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Session_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("clientId", "cptId", "createdAt", "endTime", "id", "isRecurring", "location", "notes", "parentSessionId", "recurringPattern", "recurringSessionId", "startTime", "status", "type", "updatedAt") SELECT "clientId", "cptId", "createdAt", "endTime", "id", "isRecurring", "location", "notes", "parentSessionId", "recurringPattern", "recurringSessionId", "startTime", "status", "type", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";

-- CreateIndex
CREATE UNIQUE INDEX "SessionWorkout_sessionId_workoutId_key" ON "SessionWorkout"("sessionId", "workoutId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionPerformance_sessionWorkoutId_exerciseId_key" ON "SessionPerformance"("sessionWorkoutId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "SetPerformance_sessionPerformanceId_setNumber_setType_key" ON "SetPerformance"("sessionPerformanceId", "setNumber", "setType");
