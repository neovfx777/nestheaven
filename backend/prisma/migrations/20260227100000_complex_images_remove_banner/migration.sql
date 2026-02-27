-- CreateTable
CREATE TABLE "complex_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "complex_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "complex_images_complex_id_fkey" FOREIGN KEY ("complex_id") REFERENCES "Complex" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Drop banner_image_url from Complex
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
    "developer" TEXT,
    "block_count" INTEGER DEFAULT 1,
    "location_text" TEXT,
    "location_lat" REAL,
    "location_lng" REAL,
    "permission1_url" TEXT,
    "permission2_url" TEXT,
    "permission3_url" TEXT,
    "walkability_rating" INTEGER,
    "air_quality_rating" INTEGER,
    "nearby_note" TEXT,
    "nearby_places" TEXT,
    "amenities" TEXT,
    "allowed_sellers" TEXT,
    "created_by_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Complex_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Complex" ("id", "name", "address", "city", "description", "permissions", "latitude", "longitude", "walkability_score", "air_quality_score", "air_quality_note", "nearby_infrastructure", "title", "developer", "block_count", "location_text", "location_lat", "location_lng", "permission1_url", "permission2_url", "permission3_url", "walkability_rating", "air_quality_rating", "nearby_note", "nearby_places", "amenities", "allowed_sellers", "created_by_id", "created_at", "updated_at")
SELECT "id", "name", "address", "city", "description", "permissions", "latitude", "longitude", "walkability_score", "air_quality_score", "air_quality_note", "nearby_infrastructure", "title", "developer", "block_count", "location_text", "location_lat", "location_lng", "permission1_url", "permission2_url", "permission3_url", "walkability_rating", "air_quality_rating", "nearby_note", "nearby_places", "amenities", "allowed_sellers", "created_by_id", "created_at", "updated_at"
FROM "Complex";

DROP TABLE "Complex";

ALTER TABLE "new_Complex" RENAME TO "Complex";

CREATE INDEX "complex_images_complex_id_idx" ON "complex_images"("complex_id");
