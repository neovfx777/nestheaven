package uz.nestheaven.mobile.core

import android.content.Context
import android.os.Build
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import uz.nestheaven.mobile.BuildConfig
import java.util.concurrent.TimeUnit

object ApiClient {
    private const val TAG = "ApiClient"

    @Volatile
    private var initialized = false

    @Volatile
    var activeBaseUrl: String = BuildConfig.API_BASE_URL
        private set

    lateinit var service: ApiService
        private set

    private fun normalizeBaseUrl(url: String): String {
        val trimmed = url.trim()
        return if (trimmed.endsWith("/")) trimmed else "$trimmed/"
    }

    private fun isProbablyEmulator(): Boolean {
        return Build.FINGERPRINT.startsWith("generic") ||
            Build.FINGERPRINT.lowercase().contains("emulator") ||
            Build.MODEL.contains("Emulator") ||
            Build.MODEL.contains("Android SDK built for x86")
    }

    private fun resolveBaseUrl(configuredUrl: String): String {
        val normalized = normalizeBaseUrl(configuredUrl)

        if (!isProbablyEmulator()) return normalized

        return normalized
            .replace("://localhost", "://10.0.2.2")
            .replace("://127.0.0.1", "://10.0.2.2")
    }

    fun init(context: Context) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return

            activeBaseUrl = resolveBaseUrl(BuildConfig.API_BASE_URL)

            val logger = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(AuthInterceptor(context.applicationContext))
                .addInterceptor(logger)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()

            val retrofit = Retrofit.Builder()
                .baseUrl(activeBaseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()

            service = retrofit.create(ApiService::class.java)
            initialized = true
            Log.i(TAG, "API base URL: $activeBaseUrl")
        }
    }
}
