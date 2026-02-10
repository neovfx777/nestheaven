const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('ADMIN_TOKEN is required');
  process.exit(1);
}

async function request(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${ADMIN_TOKEN}`,
    },
    body,
  });
  const text = await res.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = text;
  }
  return { status: res.status, payload };
}

async function run() {
  const baseForm = new FormData();
  baseForm.append('title', 'Smoke Test Complex');
  baseForm.append('description', 'Smoke test description');
  baseForm.append('locationText', 'Test Address');
  baseForm.append('locationLat', '41.2995');
  baseForm.append('locationLng', '69.2401');
  baseForm.append('walkabilityRating', '7');
  baseForm.append('airQualityRating', '6');
  baseForm.append('amenities', JSON.stringify(['parking', 'gym']));
  baseForm.append('nearbyPlaces', JSON.stringify([{ name: 'Park', distanceMeters: 250 }]));

  console.log('Creating complex without files...');
  const createNoFiles = await request('POST', '/complexes', baseForm);
  console.log(createNoFiles.status, createNoFiles.payload?.data?.id || createNoFiles.payload);

  if (!createNoFiles.payload?.data?.id) {
    console.error('Create without files failed. Aborting.');
    return;
  }

  const complexId = createNoFiles.payload.data.id;

  const fullForm = new FormData();
  fullForm.append('title', 'Smoke Test Complex Full');
  fullForm.append('description', 'Smoke test with files');
  fullForm.append('locationText', 'Test Address 2');
  fullForm.append('locationLat', '41.3000');
  fullForm.append('locationLng', '69.2500');
  fullForm.append('walkabilityRating', '8');
  fullForm.append('airQualityRating', '7');

  const bannerBlob = new Blob(['banner'], { type: 'image/png' });
  const permBlob = new Blob(['pdf'], { type: 'application/pdf' });

  fullForm.append('banner', bannerBlob, 'banner.png');
  fullForm.append('permission1', permBlob, 'permission1.pdf');
  fullForm.append('permission2', permBlob, 'permission2.pdf');
  fullForm.append('permission3', permBlob, 'permission3.pdf');

  console.log('Creating complex with files...');
  const createWithFiles = await request('POST', '/complexes', fullForm);
  console.log(createWithFiles.status, createWithFiles.payload?.data?.id || createWithFiles.payload);

  console.log('Listing complexes...');
  const listRes = await fetch(`${API_BASE}/complexes`);
  console.log(listRes.status);

  console.log('Fetching detail...');
  const detailRes = await fetch(`${API_BASE}/complexes/${complexId}`);
  console.log(detailRes.status);

  console.log('Updating one permission file...');
  const updateForm = new FormData();
  updateForm.append('permission1', permBlob, 'permission1-new.pdf');
  const updateRes = await request('PATCH', `/complexes/${complexId}`, updateForm);
  console.log(updateRes.status, updateRes.payload?.data?.id || updateRes.payload);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
