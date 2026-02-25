# NestHeaven Production Bundle

Bu papkada deploy uchun yig'ilgan asosiy qismlar bor:

- `backend/` - Node.js backend kodi (`node_modules` siz)
- `frontend/` - frontend kodi va tayyor `dist/` build
- `apk/nestheaven-debug.apk` - Android debug APK (hozir VPS API bilan build qilingan)
- `apk/nestheaven-vps-debug.apk` - Android debug APK (VPS API)
- `apk/nestheaven-release.apk` - Android release APK (`unsigned`)
- `apk/nestheaven-release-unsigned.apk` - Android release APK (`unsigned`)

## Backend ishga tushirish

```powershell
cd backend
cmd /c npm install
cmd /c npm run start
```

## Frontend ishga tushirish (dist bilan)

Statik serverga `frontend/dist` papkani qo'ying.

Muhim: eski `assets/*` fayllar qolib ketmasligi uchun deployni **to'liq almashtirish** rejimida qiling (`rsync --delete` yoki oldin papkani tozalang).

Yoki local test:

```powershell
cd frontend
cmd /c npm install
cmd /c npx vite preview --host --port 4173
```

Linux deploy misol:

```bash
cd /path/to/project/frontend
npm ci
npm run build
sudo rsync -av --delete dist/ /var/www/nestheaven/
sudo systemctl reload nginx
```

## Eslatma

- `frontend/dist` build `vite build` orqali tayyorlangan.
- `backend` va `frontend` production nusxasi root loyihadagi oxirgi fixlar bilan sync qilingan.
- `release` APK unsigned, production store tarqatish uchun signing kerak bo'ladi.

