# NestHeaven Mobile (Expo Router)

## Setup

1. Install dependencies

```bash
cd mobile
npm install
```

2. Configure API URL

`mobile/.env` uses `EXPO_PUBLIC_API_URL`. For real devices, use your LAN IP:

```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api
```

3. Run the app

```bash
npm run start
```

## Notes

- Expo Router is used for navigation.
- Admin/Manager/Owner/Seller/User roles are enforced in screens.
- Complex creation supports map selection + banner + permission files.
