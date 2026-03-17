package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import android.view.View
import android.view.animation.DecelerateInterpolator

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

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
            delay(2000)
            startActivity(Intent(this@SplashActivity, MainActivity::class.java))
            finish()
        }
    }
}
