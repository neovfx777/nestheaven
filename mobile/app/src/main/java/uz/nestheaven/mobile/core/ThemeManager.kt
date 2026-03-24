package uz.nestheaven.mobile.core

import androidx.appcompat.app.AppCompatDelegate

object ThemeManager {
    const val MODE_LIGHT = "light"
    const val MODE_DARK = "dark"

    fun applySavedTheme(sessionManager: SessionManager) {
        AppCompatDelegate.setDefaultNightMode(resolveNightMode(sessionManager.getThemeMode()))
    }

    fun isDarkMode(sessionManager: SessionManager): Boolean {
        return sessionManager.getThemeMode() == MODE_DARK
    }

    fun toggleTheme(sessionManager: SessionManager): Boolean {
        val nextMode = if (isDarkMode(sessionManager)) MODE_LIGHT else MODE_DARK
        sessionManager.setThemeMode(nextMode)
        AppCompatDelegate.setDefaultNightMode(resolveNightMode(nextMode))
        return nextMode == MODE_DARK
    }

    private fun resolveNightMode(mode: String?): Int {
        return if (mode == MODE_DARK) {
            AppCompatDelegate.MODE_NIGHT_YES
        } else {
            AppCompatDelegate.MODE_NIGHT_NO
        }
    }
}
