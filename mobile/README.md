# NestHeaven Android (Kotlin)

This folder now contains the Android native app in Kotlin.
React Native / Expo mobile code has been removed.

## What this app does

- Opens your frontend in an Android `WebView`
- Supports auth/session cookies
- Supports file chooser uploads from web forms
- Produces installable APK

## Configure frontend URL

Edit `mobile/gradle.properties`:

```properties
WEB_APP_URL=https://your-frontend-domain.com
```

Or override during build:

```powershell
.\gradlew assembleDebug -PWEB_APP_URL=https://your-frontend-domain.com
```

## Build Debug APK

```powershell
cd mobile
.\gradlew assembleDebug
```

APK output:

`mobile\app\build\outputs\apk\debug\app-debug.apk`

## Build Release APK

```powershell
cd mobile
.\gradlew assembleRelease
```

Release APK output:

`mobile\app\build\outputs\apk\release\app-release.apk`

