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

    fun clear() {
        prefs.edit().clear().apply()
    }

    companion object {
        private const val PREFS_NAME = "nestheaven_session"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER = "user"
    }
}
