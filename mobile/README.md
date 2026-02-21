# NestHeaven Android (Native Kotlin)

Bu modul `WebView` emas. Ilova Android native Kotlin kodida yozilgan va backend API bilan to'g'ridan-to'g'ri ishlaydi.

## Nimalar bor

- Public home + apartments + complexes oqimi (login shartsiz)
- Auth (login/register) va profil
- Favorites qo'shish/olib tashlash
- Apartment filter/sort (narx, xona, status, saralash)
- Apartment va complex detail sahifalari
- API token `SharedPreferences` orqali saqlanadi

## API bazasini sozlash

`mobile/gradle.properties`:

```properties
API_BASE_URL=http://45.92.173.175:3000/api/
```

Build vaqtida ham override qilish mumkin:

```powershell
.\gradlew.bat assembleDebug -PAPI_BASE_URL=http://45.92.173.175:3000/api/
```

## Android SDK sozlash

Gradle ishga tushishi uchun `mobile/local.properties` faylida SDK yo'lini ko'rsating:

```properties
sdk.dir=C\:\\Users\\<USERNAME>\\AppData\\Local\\Android\\Sdk
```

Yoki `ANDROID_HOME` env var orqali belgilang.

## Debug APK build

```powershell
cd mobile
.\gradlew.bat assembleDebug
```

APK:

`mobile\app\build\outputs\apk\debug\app-debug.apk`

## Release APK build

```powershell
cd mobile
.\gradlew.bat assembleRelease
```

APK:

`mobile\app\build\outputs\apk\release\app-release.apk`
