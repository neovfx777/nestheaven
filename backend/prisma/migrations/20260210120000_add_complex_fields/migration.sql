PRAGMA foreign_keys=OFF;

-- Rebuild Complex table with new fields
CREATE TABLE "new_Complex" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "walkability_score" INTEGER,
    "air_quality_score" INTEGER,
    "air_quality_note" TEXT,
    "nearby_infrastructure" TEXT,
    "title" TEXT,
    "location_text" TEXT,
    "location_lat" REAL,
    "location_lng" REAL,
    "banner_image_url" TEXT,
    "permission1_url" TEXT,
    "permission2_url" TEXT,
    "permission3_url" TEXT,
    "walkability_rating" INTEGER,
    "air_quality_rating" INTEGER,
    "nearby_note" TEXT,
    "nearby_places" TEXT,
    "amenities" TEXT,
    "created_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Complex_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Complex" (
    "id",
    "name",
    "address",
    "city",
    "description",
    "permissions",
    "latitude",
    "longitude",
    "walkability_score",
    "air_quality_score",
    "air_quality_note",
    "nearby_infrastructure",
    "created_at",
    "updated_at"
)
SELECT
    "id",
    "name",
    "address",
    "city",
    "description",
    "permissions",
    "latitude",
    "longitude",
    "walkability_score",
    "air_quality_score",
    "air_quality_note",
    "nearby_infrastructure",
    "created_at",
    "updated_at"
FROM "Complex";

DROP TABLE "Complex";
ALTER TABLE "new_Complex" RENAME TO "Complex";

-- Rebuild Apartment table to make complex_id nullable
CREATE TABLE "new_Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "complex_id" TEXT,
    "seller_id" TEXT NOT NULL,
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
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Apartment_complex_id_fkey" FOREIGN KEY ("complex_id") REFERENCES "Complex" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Apartment_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Apartment" (
    "id",
    "complex_id",
    "seller_id",
    "status",
    "price",
    "area",
    "rooms",
    "floor",
    "total_floors",
    "title",
    "description",
    "materials",
    "infrastructure_note",
    "created_at",
    "updated_at"
)
SELECT
    "id",
    "complex_id",
    "seller_id",
    "status",
    "price",
    "area",
    "rooms",
    "floor",
    "total_floors",
    "title",
    "description",
    "materials",
    "infrastructure_note",
    "created_at",
    "updated_at"
FROM "Apartment";

DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";

PRAGMA foreign_keys=ON;
