package uz.nestheaven.mobile.core

import android.content.Context
import com.yandex.mapkit.MapKitFactory
import uz.nestheaven.mobile.BuildConfig

object MapKitInitializer {
    @Volatile
    private var initialized = false

    /**
     * Initializes Yandex MapKit once. Returns false when no API key is configured.
     */
    fun ensureInitialized(context: Context): Boolean {
        if (initialized) return true

        val apiKey = BuildConfig.YANDEX_MAPKIT_API_KEY.trim()
        if (apiKey.isBlank()) return false

        synchronized(this) {
            if (initialized) return true
            MapKitFactory.setApiKey(apiKey)
            MapKitFactory.initialize(context.applicationContext)
            initialized = true
        }

        return true
    }
}

