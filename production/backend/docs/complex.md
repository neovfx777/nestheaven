# Complex Module

This backend supports a Complex entity representing a residential complex that can contain apartment listings.

## Endpoints

- `POST /api/complexes` (admin only, multipart/form-data)
- `GET /api/complexes` (public, supports pagination + optional title filter)
- `GET /api/complexes/:id` (public)
- `PATCH /api/complexes/:id` (admin only, multipart/form-data)
- `DELETE /api/complexes/:id` (admin only)

## Multipart Fields (Create/Update)

Text fields (string unless noted):
- `title` (required, max 120)
- `description` (required)
- `locationText` (required)
- `locationLat` (required number -90..90)
- `locationLng` (required number -180..180)
- `walkabilityRating` (required int 0..10)
- `airQualityRating` (required int 0..10)
- `nearbyNote` (optional)
- `nearbyPlaces` (optional JSON array)
- `amenities` (optional JSON array)
- `city` (optional, stored for legacy compatibility)

File fields:
- `banner` (optional image: jpg/png/webp)
- `permission1` (optional: pdf/jpg/png)
- `permission2` (optional: pdf/jpg/png)
- `permission3` (optional: pdf/jpg/png)

Notes:
- If you provide any permission file on create, provide all three.
- Arrays should be JSON strings in multipart requests.

### nearbyPlaces format

```json
[
  { "name": "Metro", "distanceMeters": 300, "note": "Blue line" },
  { "name": "Park", "distanceKm": 1.2 }
]
```

### amenities format

```json
["parking", "gym", "playground", "shopping", "stadium", "restaurant", "cafe", "daycare"]
```

## Example: Create Complex (curl)

```bash
curl -X POST "http://localhost:3000/api/complexes"   -H "Authorization: Bearer <ADMIN_TOKEN>"   -F "title=Green Park"   -F "description=Modern residential complex"   -F "locationText=123 Main St, Tashkent"   -F "locationLat=41.2995"   -F "locationLng=69.2401"   -F "walkabilityRating=8"   -F "airQualityRating=7"   -F "nearbyPlaces=[{"name":"Metro","distanceMeters":300}]"   -F "amenities=["parking","gym"]"   -F "banner=@/path/to/banner.jpg"   -F "permission1=@/path/to/permission1.pdf"   -F "permission2=@/path/to/permission2.pdf"   -F "permission3=@/path/to/permission3.pdf"
```
