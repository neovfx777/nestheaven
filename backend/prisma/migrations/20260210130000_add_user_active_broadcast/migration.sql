PRAGMA foreign_keys=OFF;

-- Rebuild User table to add activation fields and deactivation relation
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deactivated_at" DATETIME,
    "deactivated_by_id" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by_id" TEXT,
    CONSTRAINT "User_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "User_deactivated_by_id_fkey" FOREIGN KEY ("deactivated_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_User" (
    "id",
    "email",
    "password_hash",
    "role",
    "first_name",
    "last_name",
    "phone",
    "created_at",
    "updated_at",
    "created_by_id"
)
SELECT
    "id",
    "email",
    "password_hash",
    "role",
    "first_name",
    "last_name",
    "phone",
    "created_at",
    "updated_at",
    "created_by_id"
FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";

-- Recreate unique index on email
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create Broadcast table
CREATE TABLE "Broadcast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    CONSTRAINT "Broadcast_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

PRAGMA foreign_keys=ON;
