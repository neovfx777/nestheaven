package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager
import java.util.Locale

class ProfileFragment : Fragment(R.layout.fragment_profile) {

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
        val settingsItem = view.findViewById<View>(R.id.profileSettingsItem)

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

        settingsItem.setOnClickListener {
            requireLoginOr {
            Toast.makeText(
                requireContext(),
                getString(R.string.settings_coming_soon),
                Toast.LENGTH_SHORT,
            ).show()
            }
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
