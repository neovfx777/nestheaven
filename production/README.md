# NestHeaven Production Bundle

Bu papkada deploy uchun yig'ilgan asosiy qismlar bor:

- `backend/` - Node.js backend kodi (`node_modules` siz)
- `frontend/` - frontend kodi va tayyor `dist/` build
- `apk/nestheaven-debug.apk` - Android APK (Kotlin WebView)

## Backend ishga tushirish

```powershell
cd backend
cmd /c npm install
cmd /c npm run start
```

## Frontend ishga tushirish (dist bilan)

Statik serverga `frontend/dist` papkani qo'ying.

Yoki local test:

```powershell
cd frontend
cmd /c npm install
cmd /c npx vite preview --host --port 4173
```

## Eslatma

- `frontend/dist` build `vite build` orqali tayyorlangan.
- `npm run build` hozirgi holatda TypeScript xatolari sabab to'xtaydi, lekin `dist` mavjud va yig'ilgan.

