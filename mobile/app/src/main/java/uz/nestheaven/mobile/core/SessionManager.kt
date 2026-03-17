package uz.nestheaven.mobile.core

import android.content.Context
import com.google.gson.Gson

class SessionManager(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    private val gson = Gson()

    fun saveSession(token: String, user: UserDto?) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_USER, user?.let { gson.toJson(it) })
            .apply()
    }

    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)

    fun getUser(): UserDto? {
        val raw = prefs.getString(KEY_USER, null) ?: return null
        return runCatching { gson.fromJson(raw, UserDto::class.java) }.getOrNull()
    }

    fun isLoggedIn(): Boolean = !getToken().isNullOrBlank()

    fun isGetStartedSeen(): Boolean = prefs.getBoolean(KEY_GET_STARTED_SEEN, false)

    fun setGetStartedSeen(seen: Boolean) {
        prefs.edit().putBoolean(KEY_GET_STARTED_SEEN, seen).apply()
    }

    fun getLanguageTag(): String? = prefs.getString(KEY_LANGUAGE_TAG, null)

    fun setLanguageTag(tag: String) {
        prefs.edit().putString(KEY_LANGUAGE_TAG, tag).apply()
    }

    fun clear() {
        val keepGetStartedSeen = isGetStartedSeen()
        val keepLanguageTag = getLanguageTag()
        prefs.edit()
            .clear()
            .putBoolean(KEY_GET_STARTED_SEEN, keepGetStartedSeen)
            .apply {
                if (!keepLanguageTag.isNullOrBlank()) {
                    putString(KEY_LANGUAGE_TAG, keepLanguageTag)
                }
            }
            .apply()
    }

    companion object {
        private const val PREFS_NAME = "nestheaven_session"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER = "user"
        private const val KEY_GET_STARTED_SEEN = "get_started_seen"
        private const val KEY_LANGUAGE_TAG = "language_tag"
    }
}
