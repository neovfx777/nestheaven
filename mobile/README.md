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

## Publish (signed) release build

Google Play uchun odatda **AAB** tavsiya qilinadi, APK esa test/sideload uchun qulay.

### 1) Java 17 (majburiy)

Gradle ishlashi uchun JDK 17 kerak:
- `JAVA_HOME` ni JDK 17 ga ko'rsating
- `java -version` 17 chiqsin

### 2) Keystore yaratish (1 marta)

```powershell
keytool -genkeypair -v -keystore nestheaven-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nestheaven
```

Key’ni xavfsiz joyda saqlang (gitga qo'shmang).

### 3) `mobile/keystore.properties` qo'shing (gitga kirmaydi)

`mobile/keystore.properties`:

```properties
RELEASE_STORE_FILE=nestheaven-release.jks
RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
RELEASE_KEY_ALIAS=nestheaven
RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

### 4) Versiyani chiqarish (versionCode/versionName)

Build vaqtida berishingiz mumkin:

```powershell
.\gradlew.bat assembleRelease -PVERSION_CODE=2 -PVERSION_NAME=1.0.1
.\gradlew.bat bundleRelease -PVERSION_CODE=2 -PVERSION_NAME=1.0.1
```

### Outputlar

- Signed APK: `mobile\app\build\outputs\apk\release\app-release.apk`
- AAB: `mobile\app\build\outputs\bundle\release\app-release.aab`
