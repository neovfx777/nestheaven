package uz.nestheaven.mobile.core

import androidx.appcompat.app.AppCompatDelegate
import java.util.Locale

object AppLanguage {
    private const val DEFAULT_TAG = "uz"

    fun currentTag(): String {
        val raw = AppCompatDelegate.getApplicationLocales().toLanguageTags().trim()
        if (raw.isBlank()) return DEFAULT_TAG

        val normalized = raw.substringBefore(',').substringBefore('-').lowercase(Locale.ROOT)
        return when (normalized) {
            "uz", "ru", "en" -> normalized
            else -> DEFAULT_TAG
        }
    }

    fun translate(uz: String, ru: String, en: String): String {
        return when (currentTag()) {
            "ru" -> ru
            "en" -> en
            else -> uz
        }
    }

    fun pick(uz: String?, ru: String?, en: String?, fallback: String = ""): String {
        val candidates = when (currentTag()) {
            "ru" -> listOf(ru, en, uz)
            "en" -> listOf(en, ru, uz)
            else -> listOf(uz, ru, en)
        }

        return candidates.firstOrNull { !it.isNullOrBlank() }
            ?.trim()
            .orEmpty()
            .ifBlank { fallback }
    }
}
