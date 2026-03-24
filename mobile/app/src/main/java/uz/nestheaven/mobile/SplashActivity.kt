package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import android.view.View
import android.view.animation.DecelerateInterpolator
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.core.ThemeManager
import java.util.Locale

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        val sessionManager = SessionManager(this)
        ThemeManager.applySavedTheme(sessionManager)
        super.onCreate(savedInstanceState)
        applySavedLanguage(sessionManager)

        setContentView(R.layout.activity_splash)

        val content = findViewById<View>(R.id.splashContent)
        content.alpha = 0f
        content.translationY = resources.displayMetrics.density * 18f
        content.animate()
            .alpha(1f)
            .translationY(0f)
            .setDuration(1500)
            .setInterpolator(DecelerateInterpolator())
            .start()

        // Warm up singletons while splash is visible.
        ApiClient.init(applicationContext)

        lifecycleScope.launch {
            delay(2200)
            val next = when {
                sessionManager.isLoggedIn() && sessionManager.isVerificationPending() -> {
                    if (sessionManager.getVerificationFlow() == SessionManager.VERIFICATION_FLOW_REGISTER) {
                        RegisterVerificationActivity::class.java
                    } else {
                        LoginVerificationActivity::class.java
                    }
                }
                sessionManager.isLoggedIn() -> MainActivity::class.java
                else -> GetStartedActivity::class.java
            }
            startActivity(Intent(this@SplashActivity, next))
            finish()
        }
    }

    private fun applySavedLanguage(sessionManager: SessionManager) {
        val saved = sessionManager.getLanguageTag()
            ?.substringBefore(',')
            ?.substringBefore('-')
            ?.trim()
            .orEmpty()
        if (saved.isBlank()) return

        val current = AppCompatDelegate.getApplicationLocales()
            .toLanguageTags()
            .substringBefore(',')
            .substringBefore('-')
            .trim()
        if (current.isBlank() || current.lowercase(Locale.ROOT) != saved.lowercase(Locale.ROOT)) {
            AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(saved))
        }
    }
}
