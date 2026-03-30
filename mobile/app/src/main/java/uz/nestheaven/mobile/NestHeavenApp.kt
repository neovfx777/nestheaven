package uz.nestheaven.mobile

import android.app.Application
import uz.nestheaven.mobile.core.MapKitInitializer

class NestHeavenApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize MapKit only when API key is configured (otherwise it crashes on startup).
        MapKitInitializer.ensureInitialized(this)
    }
}
