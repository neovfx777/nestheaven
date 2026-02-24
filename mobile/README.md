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
API_BASE_URL_DEBUG=http://10.0.2.2:3000/api/
API_BASE_URL_RELEASE=http://nestheaven.uz/api/
```

Muhim:
- Android Emulator uchun `localhost` o'rniga `10.0.2.2` ishlatiladi.
- Release APK uchun API avtomatik VPS (`API_BASE_URL_RELEASE`) dan olinadi.
- Real telefonni lokal backend bilan test qilmoqchi bo'lsangiz LAN IP ishlating.

Build vaqtida ham override qilish mumkin:

```powershell
.\gradlew.bat assembleDebug -PAPI_BASE_URL_DEBUG=http://192.168.1.50:3000/api/
.\gradlew.bat assembleRelease -PAPI_BASE_URL_RELEASE=http://nestheaven.uz/api/
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
