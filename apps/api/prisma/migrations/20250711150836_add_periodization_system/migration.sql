-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "muscleGroups" JSONB NOT NULL,
    "equipment" JSONB NOT NULL,
    "difficulty" TEXT NOT NULL,
    "instructions" TEXT,
    "videoUrl" TEXT,
    "imageUrl" TEXT,
    "cptId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Exercise_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExerciseCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Exercise_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExerciseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "ExerciseVariation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" TEXT NOT NULL,
    "equipment" JSONB NOT NULL,
    "instructions" TEXT,
    "videoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExerciseVariation_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgramTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "periodizationType" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgramTemplate_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Macrocycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cptId" TEXT NOT NULL,
    "clientId" TEXT,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "periodizationType" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Macrocycle_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Macrocycle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Macrocycle_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ProgramTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mesocycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "macrocycleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "focus" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "periodizationMethod" TEXT NOT NULL,
    "intensityRange" JSONB NOT NULL,
    "volumeRange" JSONB NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Mesocycle_macrocycleId_fkey" FOREIGN KEY ("macrocycleId") REFERENCES "Macrocycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Microcycle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mesocycleId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "periodizationType" TEXT NOT NULL,
    "intensityTarget" REAL NOT NULL,
    "volumeTarget" REAL NOT NULL,
    "deload" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Microcycle_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutDay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "microcycleId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "focus" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutDay_microcycleId_fkey" FOREIGN KEY ("microcycleId") REFERENCES "Microcycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workoutDayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "weight" TEXT,
    "rest" TEXT,
    "tempo" TEXT,
    "rpe" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkoutExercise_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProgressionRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mesocycleId" TEXT NOT NULL,
    "exerciseType" TEXT NOT NULL,
    "progressionType" TEXT NOT NULL,
    "increment" JSONB NOT NULL,
    "frequency" TEXT NOT NULL,
    "conditions" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProgressionRule_mesocycleId_fkey" FOREIGN KEY ("mesocycleId") REFERENCES "Mesocycle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
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
    "experienceLevel" TEXT NOT NULL DEFAULT 'BEGINNER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "passwordHash" TEXT,
    CONSTRAINT "Client_cptId_fkey" FOREIGN KEY ("cptId") REFERENCES "CPT" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Client" ("codeName", "cptId", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "notes", "passwordHash", "phone", "status", "updatedAt") SELECT "codeName", "cptId", "createdAt", "dateOfBirth", "email", "firstName", "gender", "id", "lastName", "notes", "passwordHash", "phone", "status", "updatedAt" FROM "Client";
DROP TABLE "Client";
ALTER TABLE "new_Client" RENAME TO "Client";
CREATE UNIQUE INDEX "Client_codeName_key" ON "Client"("codeName");
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseCategory_name_key" ON "ExerciseCategory"("name");
