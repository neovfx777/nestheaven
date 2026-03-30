plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

import java.io.FileInputStream
import java.util.Properties

fun normalizeApiBaseUrl(raw: String?, fallback: String): String {
    val value = raw?.trim().orEmpty().ifBlank { fallback }
    return if (value.endsWith("/")) value else "$value/"
}

android {
    namespace = "uz.nestheaven.mobile"
    compileSdk = 36

    val versionCodeValue =
        (project.findProperty("VERSION_CODE") as String?)?.trim()?.toIntOrNull() ?: 1
    val versionNameValue =
        (project.findProperty("VERSION_NAME") as String?)?.trim().orEmpty().ifBlank { "1.0.0" }

    val debugApiBaseUrl = normalizeApiBaseUrl(
        (project.findProperty("API_BASE_URL_DEBUG") as String?)
            ?: (project.findProperty("API_BASE_URL") as String?),
        "http://10.0.2.2:3000/api/",
    )
    val releaseApiBaseUrl = normalizeApiBaseUrl(
        project.findProperty("API_BASE_URL_RELEASE") as String?,
        "http://nestheaven.uz/api/",
    )

    defaultConfig {
        applicationId = "uz.nestheaven.mobile"
        // Yandex MapKit (maps.mobile 4.30+) requires minSdk 26.
        minSdk = 26
        targetSdk = 36
        versionCode = versionCodeValue
        versionName = versionNameValue
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("String", "API_BASE_URL", "\"$debugApiBaseUrl\"")

        val localProps = Properties()
        val localPropsFile = rootProject.file("local.properties")
        if (localPropsFile.exists()) {
            FileInputStream(localPropsFile).use { localProps.load(it) }
        }

        val yandexMapkitKey =
            (project.findProperty("YANDEX_MAPKIT_API_KEY") as String?)?.trim()?.takeIf { it.isNotBlank() }
                ?: System.getenv("YANDEX_MAPKIT_API_KEY")?.trim()?.takeIf { it.isNotBlank() }
                ?: localProps.getProperty("YANDEX_MAPKIT_API_KEY")?.trim()?.takeIf { it.isNotBlank() }
                ?: ""
        buildConfigField("String", "YANDEX_MAPKIT_API_KEY", "\"$yandexMapkitKey\"")
    }

    // Release signing (for publishing). Keep secrets out of git.
    val keystoreProps = Properties()
    val keystorePropsFile = rootProject.file("keystore.properties")
    if (keystorePropsFile.exists()) {
        FileInputStream(keystorePropsFile).use { keystoreProps.load(it) }
    }
    fun ks(name: String): String? =
        (project.findProperty(name) as String?)?.trim()?.takeIf { it.isNotBlank() }
            ?: System.getenv(name)?.trim()?.takeIf { it.isNotBlank() }
            ?: keystoreProps.getProperty(name)?.trim()?.takeIf { it.isNotBlank() }

    val releaseStoreFile = ks("RELEASE_STORE_FILE")
    val releaseStorePassword = ks("RELEASE_STORE_PASSWORD")
    val releaseKeyAlias = ks("RELEASE_KEY_ALIAS")
    val releaseKeyPassword = ks("RELEASE_KEY_PASSWORD")
    val hasReleaseSigning =
        !releaseStoreFile.isNullOrBlank() &&
            !releaseStorePassword.isNullOrBlank() &&
            !releaseKeyAlias.isNullOrBlank() &&
            !releaseKeyPassword.isNullOrBlank()

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = file(releaseStoreFile!!)
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            buildConfigField("String", "API_BASE_URL", "\"$debugApiBaseUrl\"")
        }
        release {
            isMinifyEnabled = false
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
            buildConfigField("String", "API_BASE_URL", "\"$releaseApiBaseUrl\"")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        buildConfig = true
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.9.1")
    implementation("androidx.fragment:fragment-ktx:1.8.4")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("androidx.recyclerview:recyclerview:1.3.2")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.viewpager2:viewpager2:1.1.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.8.6")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    implementation("com.squareup.retrofit2:converter-gson:2.11.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.github.bumptech.glide:glide:4.16.0")
    implementation("com.yandex.android:maps.mobile:4.30.0-lite")

    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
