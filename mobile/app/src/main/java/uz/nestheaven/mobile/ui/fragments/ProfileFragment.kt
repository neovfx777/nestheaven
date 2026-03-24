package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatDelegate
import androidx.core.view.isVisible
import androidx.core.os.LocaleListCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.core.ThemeManager
import java.util.Locale

class ProfileFragment : Fragment(R.layout.fragment_profile) {

    data class LanguageOption(
        val tag: String,
        val labelRes: Int,
        val shortCode: String,
    )

    interface ProfileHost {
        fun onLogoutRequested()
        fun requestLogin()
        fun openFavorites()
        fun openMessages()
    }

    private var host: ProfileHost? = null
    private lateinit var sessionManager: SessionManager

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? ProfileHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val progress = view.findViewById<ProgressBar>(R.id.profileProgress)
        val nameText = view.findViewById<TextView>(R.id.profileName)
        val phoneText = view.findViewById<TextView>(R.id.profilePhone)
        val favoritesItem = view.findViewById<View>(R.id.profileFavoritesItem)
        val messagesItem = view.findViewById<View>(R.id.profileMessagesItem)
        val infoItem = view.findViewById<View>(R.id.profileInfoItem)
        val languageItem = view.findViewById<View>(R.id.profileLanguageItem)
        val languageValue = view.findViewById<TextView>(R.id.profileLanguageValue)
        val settingsItem = view.findViewById<View>(R.id.profileSettingsItem)
        val themeToggle = view.findViewById<ImageButton>(R.id.profileThemeToggle)
        val languages = listOf(
            LanguageOption("uz", R.string.language_uz_name, "UZ"),
            LanguageOption("ru", R.string.language_ru_name, "RU"),
            LanguageOption("en", R.string.language_en_name, "EN"),
        )

        fun requireLoginOr(action: () -> Unit) {
            if (!sessionManager.isLoggedIn()) {
                host?.requestLogin()
                return
            }

            action()
        }

        favoritesItem.setOnClickListener {
            requireLoginOr { host?.openFavorites() }
        }

        messagesItem.setOnClickListener {
            requireLoginOr { host?.openMessages() }
        }

        infoItem.setOnClickListener {
            requireLoginOr {
                Toast.makeText(
                    requireContext(),
                    getString(R.string.profile_info_coming_soon),
                    Toast.LENGTH_SHORT,
                ).show()
            }
        }

        renderLanguageValue(languageValue, languages)
        languageItem.setOnClickListener {
            showLanguagePicker(languageValue, languages)
        }

        settingsItem.setOnClickListener {
            requireLoginOr {
            Toast.makeText(
                requireContext(),
                getString(R.string.settings_coming_soon),
                Toast.LENGTH_SHORT,
            ).show()
            }
        }

        renderThemeToggle(themeToggle)
        themeToggle.setOnClickListener {
            val darkModeEnabled = ThemeManager.toggleTheme(sessionManager)
            renderThemeToggle(themeToggle)
            Toast.makeText(
                requireContext(),
                getString(
                    if (darkModeEnabled) R.string.theme_dark_enabled else R.string.theme_light_enabled,
                ),
                Toast.LENGTH_SHORT,
            ).show()
        }

        renderUser(nameText, phoneText)
        refreshProfile(progress, nameText, phoneText)
    }

    override fun onResume() {
        super.onResume()
        view?.let { root ->
            refreshProfile(
                progress = root.findViewById(R.id.profileProgress),
                nameText = root.findViewById(R.id.profileName),
                phoneText = root.findViewById(R.id.profilePhone),
            )
        }
    }

    private fun renderUser(nameText: TextView, phoneText: TextView) {
        val user = sessionManager.getUser()

        val fullName = if (user != null) {
            listOfNotNull(user.firstName, user.lastName)
                .joinToString(" ")
                .trim()
                .ifBlank { "-" }
        } else {
            "-"
        }

        nameText.text = fullName.uppercase(Locale.getDefault())
        phoneText.text = user?.phone?.trim().orEmpty().ifBlank { "-" }
    }

    private fun renderLanguageValue(
        languageValue: TextView,
        languages: List<LanguageOption>,
    ) {
        val currentTag = resolveCurrentLanguageTag(languages)
        languageValue.text = languages.firstOrNull { it.tag == currentTag }?.shortCode ?: "UZ"
    }

    private fun renderThemeToggle(themeToggle: ImageButton) {
        val darkModeEnabled = ThemeManager.isDarkMode(sessionManager)
        themeToggle.setImageResource(
            if (darkModeEnabled) R.drawable.ic_light_mode_24 else R.drawable.ic_dark_mode_24,
        )
        themeToggle.contentDescription = getString(
            if (darkModeEnabled) R.string.theme_switch_to_light else R.string.theme_switch_to_dark,
        )
    }

    private fun showLanguagePicker(
        languageValue: TextView,
        languages: List<LanguageOption>,
    ) {
        val currentTag = resolveCurrentLanguageTag(languages)
        val labels = languages.map { getString(it.labelRes) }.toTypedArray()
        val checkedIndex = languages.indexOfFirst { it.tag == currentTag }.coerceAtLeast(0)

        MaterialAlertDialogBuilder(requireContext())
            .setTitle(R.string.language_picker_title)
            .setSingleChoiceItems(labels, checkedIndex) { dialog, which ->
                dialog.dismiss()
                val selected = languages.getOrNull(which) ?: return@setSingleChoiceItems
                applyLanguage(selected.tag)
                renderLanguageValue(languageValue, languages)
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun resolveCurrentLanguageTag(languages: List<LanguageOption>): String {
        val raw = resolveCurrentLanguageTagRaw()
        return languages.firstOrNull { it.tag == raw }?.tag ?: "uz"
    }

    private fun resolveCurrentLanguageTagRaw(): String {
        val fromPrefs = sessionManager.getLanguageTag()?.trim()
        val fromAppCompat = AppCompatDelegate.getApplicationLocales().toLanguageTags().trim()
        val resolved = when {
            !fromPrefs.isNullOrBlank() -> fromPrefs
            fromAppCompat.isNotBlank() -> fromAppCompat.substringBefore(',').substringBefore('-')
            else -> "uz"
        }

        return resolved.lowercase(Locale.ROOT)
    }

    private fun applyLanguage(tag: String) {
        val normalized = tag.lowercase(Locale.ROOT)
        if (normalized == resolveCurrentLanguageTagRaw()) return

        sessionManager.setLanguageTag(normalized)
        AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(normalized))
        activity?.recreate()
    }

    private fun refreshProfile(
        progress: ProgressBar,
        nameText: TextView,
        phoneText: TextView,
    ) {
        if (!sessionManager.isLoggedIn()) {
            progress.isVisible = false
            renderUser(nameText, phoneText)
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            try {
                val response = ApiClient.service.me()
                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()!!.user
                    sessionManager.saveSession(sessionManager.getToken().orEmpty(), user)
                }
            } catch (_: Exception) {
                // Ignore refresh errors for now.
            } finally {
                progress.isVisible = false
                renderUser(nameText, phoneText)
            }
        }
    }
}
