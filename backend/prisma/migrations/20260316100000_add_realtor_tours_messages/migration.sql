-- CreateTable
CREATE TABLE "realtor_availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "realtor_id" TEXT NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "realtor_availability_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tour_bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartment_id" TEXT NOT NULL,
    "realtor_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "start_at" DATETIME NOT NULL,
    "end_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BOOKED',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tour_bookings_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tour_bookings_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tour_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "realtor_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "conversations_apartment_id_fkey" FOREIGN KEY ("apartment_id") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversations_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversation_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "complex_id" TEXT,
    "seller_id" TEXT NOT NULL,
    "realtor_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "price" REAL NOT NULL,
    "area" REAL NOT NULL,
    "rooms" INTEGER NOT NULL,
    "floor" INTEGER,
    "total_floors" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "materials" TEXT,
    "infrastructure_note" TEXT,
    "construction_status" TEXT,
    "ready_by_year" INTEGER,
    "ready_by_month" INTEGER,
    "renovation_status" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Apartment_complex_id_fkey" FOREIGN KEY ("complex_id") REFERENCES "Complex" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Apartment_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Apartment_realtor_id_fkey" FOREIGN KEY ("realtor_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Apartment" ("area", "complex_id", "construction_status", "created_at", "description", "floor", "id", "infrastructure_note", "materials", "price", "ready_by_month", "ready_by_year", "rooms", "seller_id", "status", "title", "total_floors", "updated_at") SELECT "area", "complex_id", "construction_status", "created_at", "description", "floor", "id", "infrastructure_note", "materials", "price", "ready_by_month", "ready_by_year", "rooms", "seller_id", "status", "title", "total_floors", "updated_at" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "realtor_availability_realtor_id_start_at_idx" ON "realtor_availability"("realtor_id", "start_at");

-- CreateIndex
CREATE INDEX "tour_bookings_realtor_id_start_at_idx" ON "tour_bookings"("realtor_id", "start_at");

-- CreateIndex
CREATE INDEX "tour_bookings_user_id_start_at_idx" ON "tour_bookings"("user_id", "start_at");

-- CreateIndex
CREATE INDEX "tour_bookings_apartment_id_start_at_idx" ON "tour_bookings"("apartment_id", "start_at");

-- CreateIndex
CREATE INDEX "conversations_user_id_idx" ON "conversations"("user_id");

-- CreateIndex
CREATE INDEX "conversations_realtor_id_idx" ON "conversations"("realtor_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_apartment_id_user_id_realtor_id_key" ON "conversations"("apartment_id", "user_id", "realtor_id");

-- CreateIndex
CREATE INDEX "conversation_messages_conversation_id_idx" ON "conversation_messages"("conversation_id");

-- CreateIndex
CREATE INDEX "conversation_messages_sender_id_idx" ON "conversation_messages"("sender_id");

