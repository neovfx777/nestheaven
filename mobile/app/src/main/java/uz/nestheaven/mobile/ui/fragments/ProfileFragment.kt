package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager

class ProfileFragment : Fragment(R.layout.fragment_profile) {

    interface ProfileHost {
        fun onLogoutRequested()
        fun requestLogin()
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
        val stateText = view.findViewById<TextView>(R.id.profileState)
        val nameText = view.findViewById<TextView>(R.id.profileName)
        val emailText = view.findViewById<TextView>(R.id.profileEmail)
        val roleText = view.findViewById<TextView>(R.id.profileRole)
        val phoneText = view.findViewById<TextView>(R.id.profilePhone)
        val refreshButton = view.findViewById<MaterialButton>(R.id.profileRefreshButton)
        val logoutButton = view.findViewById<MaterialButton>(R.id.profileLogoutButton)
        val loginButton = view.findViewById<MaterialButton>(R.id.profileLoginButton)

        logoutButton.setOnClickListener {
            sessionManager.clear()
            host?.onLogoutRequested()
        }

        loginButton.setOnClickListener {
            host?.requestLogin()
        }

        refreshButton.setOnClickListener {
            loadProfile(
                progress,
                stateText,
                nameText,
                emailText,
                roleText,
                phoneText,
                loginButton,
                logoutButton,
            )
        }

        loadProfile(
            progress,
            stateText,
            nameText,
            emailText,
            roleText,
            phoneText,
            loginButton,
            logoutButton,
        )
    }

    override fun onResume() {
        super.onResume()
        view?.let { v ->
            loadProfile(
                v.findViewById(R.id.profileProgress),
                v.findViewById(R.id.profileState),
                v.findViewById(R.id.profileName),
                v.findViewById(R.id.profileEmail),
                v.findViewById(R.id.profileRole),
                v.findViewById(R.id.profilePhone),
                v.findViewById(R.id.profileLoginButton),
                v.findViewById(R.id.profileLogoutButton),
            )
        }
    }

    private fun loadProfile(
        progress: ProgressBar,
        stateText: TextView,
        nameText: TextView,
        emailText: TextView,
        roleText: TextView,
        phoneText: TextView,
        loginButton: MaterialButton,
        logoutButton: MaterialButton,
    ) {
        if (!sessionManager.isLoggedIn()) {
            progress.isVisible = false
            stateText.text = getString(R.string.profile_login_required)
            loginButton.isVisible = true
            logoutButton.isVisible = false
            nameText.text = "-"
            emailText.text = "-"
            roleText.text = "-"
            phoneText.text = "-"
            return
        }

        loginButton.isVisible = false
        logoutButton.isVisible = true

        val cachedUser = sessionManager.getUser()
        if (cachedUser != null) {
            val fullName = listOfNotNull(cachedUser.firstName, cachedUser.lastName)
                .joinToString(" ")
                .ifBlank { "-" }
            nameText.text = fullName
            emailText.text = cachedUser.email
            roleText.text = cachedUser.role
            phoneText.text = cachedUser.phone ?: "-"
            stateText.text = getString(R.string.profile_synced)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            try {
                val response = ApiClient.service.me()
                if (response.isSuccessful && response.body() != null) {
                    val user = response.body()!!.user
                    sessionManager.saveSession(sessionManager.getToken().orEmpty(), user)

                    val fullName = listOfNotNull(user.firstName, user.lastName)
                        .joinToString(" ")
                        .ifBlank { "-" }
                    nameText.text = fullName
                    emailText.text = user.email
                    roleText.text = user.role
                    phoneText.text = user.phone ?: "-"
                    stateText.text = getString(R.string.profile_synced)
                } else {
                    stateText.text = getString(R.string.profile_failed)
                }
            } catch (e: Exception) {
                stateText.text = e.message ?: getString(R.string.profile_failed)
            } finally {
                progress.isVisible = false
            }
        }
    }
}
