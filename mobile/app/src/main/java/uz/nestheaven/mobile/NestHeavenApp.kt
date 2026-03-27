package uz.nestheaven.mobile

import android.app.Application
import com.yandex.mapkit.MapKitFactory

class NestHeavenApp : Application() {
    override fun onCreate() {
        super.onCreate()

        // Yandex MapKit must be initialized before using MapView.
        // API key should be provided via Gradle property: -PYANDEX_MAPKIT_API_KEY=...
        val apiKey = BuildConfig.YANDEX_MAPKIT_API_KEY
        if (apiKey.isNotBlank()) {
            MapKitFactory.setApiKey(apiKey)
        }
        MapKitFactory.initialize(this)
    }
}

