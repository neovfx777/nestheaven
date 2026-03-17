package uz.nestheaven.mobile

import android.content.Intent
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.widget.ImageView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.SessionManager
import java.util.Locale

class GetStartedActivity : AppCompatActivity() {

    data class LanguageOption(
        val tag: String,
        val labelRes: Int,
        val shortCode: String,
        val flagResId: Int,
    )

    private val imagePaths = listOf(
        "file:///android_asset/get_started/get_started_1.png",
        "file:///android_asset/get_started/get_started_2.png",
        "file:///android_asset/get_started/get_started_3.png",
        "file:///android_asset/get_started/get_started_4.png",
        "file:///android_asset/get_started/get_started_5.png",
    )

    private var currentIndex = 0
    private var showingPrimary = true
    private var transitionInProgress = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_get_started)

        val sessionManager = SessionManager(this)
        val primary = findViewById<ImageView>(R.id.getStartedImagePrimary)
        val secondary = findViewById<ImageView>(R.id.getStartedImageSecondary)
        val button = findViewById<MaterialButton>(R.id.getStartedButton)
        val languageButton = findViewById<MaterialButton>(R.id.getStartedLanguageButton)

        val languages = listOf(
            LanguageOption("uz", R.string.language_uz_name, "UZ", R.drawable.ic_flag_uz),
            LanguageOption("ru", R.string.language_ru_name, "RU", R.drawable.ic_flag_ru),
            LanguageOption("en", R.string.language_en_name, "EN", R.drawable.ic_flag_en),
        )

        val currentTag = resolveCurrentLanguageTag(sessionManager, languages)
        val currentLanguage = languages.firstOrNull { it.tag == currentTag }
        languageButton.text = currentLanguage?.shortCode ?: "UZ"
        languageButton.setIconResource(currentLanguage?.flagResId ?: R.drawable.ic_flag_uz)
        languageButton.setOnClickListener {
            showLanguagePicker(sessionManager, languages)
        }

        loadInto(primary, imagePaths[currentIndex])

        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                while (isActive) {
                    delay(CAROUSEL_INTERVAL_MS)
                    crossfadeToNext(primary, secondary)
                }
            }
        }

        button.setOnClickListener {
            sessionManager.setGetStartedSeen(true)
            val next = if (sessionManager.isLoggedIn()) {
                MainActivity::class.java
            } else {
                LoginActivity::class.java
            }
            startActivity(Intent(this, next))
            finish()
        }
    }

    private fun showLanguagePicker(sessionManager: SessionManager, languages: List<LanguageOption>) {
        val currentTag = resolveCurrentLanguageTag(sessionManager, languages)
        val labels = languages.map { getString(it.labelRes) }.toTypedArray()
        val checkedIndex = languages.indexOfFirst { it.tag == currentTag }.coerceAtLeast(0)

        MaterialAlertDialogBuilder(this)
            .setTitle(R.string.language_picker_title)
            .setSingleChoiceItems(labels, checkedIndex) { dialog, which ->
                dialog.dismiss()
                val selected = languages.getOrNull(which) ?: return@setSingleChoiceItems
                findViewById<MaterialButton>(R.id.getStartedLanguageButton).apply {
                    text = selected.shortCode
                    setIconResource(selected.flagResId)
                }
                applyLanguage(sessionManager, selected.tag)
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun resolveCurrentLanguageTag(
        sessionManager: SessionManager,
        languages: List<LanguageOption>,
    ): String {
        val raw = resolveCurrentLanguageTagRaw(sessionManager)
        if (languages.isEmpty()) return raw

        return languages.firstOrNull { it.tag == raw }?.tag ?: DEFAULT_LANGUAGE_TAG
    }

    private fun resolveCurrentLanguageTagRaw(sessionManager: SessionManager): String {
        val fromPrefs = sessionManager.getLanguageTag()?.trim()
        val fromAppCompat = AppCompatDelegate.getApplicationLocales().toLanguageTags().trim()
        val resolved = when {
            !fromPrefs.isNullOrBlank() -> fromPrefs
            fromAppCompat.isNotBlank() -> fromAppCompat.substringBefore(',').substringBefore('-')
            else -> DEFAULT_LANGUAGE_TAG
        }

        return resolved.lowercase(Locale.ROOT)
    }

    private fun applyLanguage(sessionManager: SessionManager, tag: String) {
        val normalized = tag.lowercase(Locale.ROOT)
        if (normalized == resolveCurrentLanguageTagRaw(sessionManager)) return

        sessionManager.setLanguageTag(normalized)
        AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(normalized))
        recreate()
    }

    private fun crossfadeToNext(primary: ImageView, secondary: ImageView) {
        if (transitionInProgress || imagePaths.size < 2) return
        transitionInProgress = true

        val nextIndex = (currentIndex + 1) % imagePaths.size
        val nextView = if (showingPrimary) secondary else primary
        val currentView = if (showingPrimary) primary else secondary

        nextView.animate().cancel()
        currentView.animate().cancel()
        nextView.alpha = 0f

        Glide.with(this)
            .load(imagePaths[nextIndex])
            .listener(object : RequestListener<Drawable> {
                override fun onLoadFailed(
                    e: GlideException?,
                    model: Any?,
                    target: Target<Drawable>,
                    isFirstResource: Boolean,
                ): Boolean {
                    transitionInProgress = false
                    return false
                }

                override fun onResourceReady(
                    resource: Drawable,
                    model: Any,
                    target: Target<Drawable>?,
                    dataSource: DataSource,
                    isFirstResource: Boolean,
                ): Boolean {
                    nextView.post {
                        nextView.animate()
                            .alpha(1f)
                            .setDuration(CROSSFADE_MS)
                            .withEndAction { transitionInProgress = false }
                            .start()

                        currentView.animate()
                            .alpha(0f)
                            .setDuration(CROSSFADE_MS)
                            .start()

                        showingPrimary = !showingPrimary
                        currentIndex = nextIndex
                    }
                    return false
                }
            })
            .into(nextView)
    }

    private fun loadInto(view: ImageView, path: String) {
        Glide.with(this)
            .load(path)
            .into(view)
    }

    companion object {
        private const val DEFAULT_LANGUAGE_TAG = "uz"
        private const val CAROUSEL_INTERVAL_MS = 3500L
        private const val CROSSFADE_MS = 650L
    }
}
