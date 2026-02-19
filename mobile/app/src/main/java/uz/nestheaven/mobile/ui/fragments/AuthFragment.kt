package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.RegisterRequest
import uz.nestheaven.mobile.core.LoginRequest
import uz.nestheaven.mobile.core.SessionManager

class AuthFragment : Fragment(R.layout.fragment_auth) {

    interface AuthHost {
        fun onAuthenticated()
    }

    private var authHost: AuthHost? = null
    private lateinit var sessionManager: SessionManager

    override fun onAttach(context: Context) {
        super.onAttach(context)
        authHost = context as? AuthHost
    }

    override fun onDetach() {
        super.onDetach()
        authHost = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val loginEmail = view.findViewById<TextInputEditText>(R.id.loginEmail)
        val loginPassword = view.findViewById<TextInputEditText>(R.id.loginPassword)
        val registerFirstName = view.findViewById<TextInputEditText>(R.id.registerFirstName)
        val registerLastName = view.findViewById<TextInputEditText>(R.id.registerLastName)
        val registerEmail = view.findViewById<TextInputEditText>(R.id.registerEmail)
        val registerPassword = view.findViewById<TextInputEditText>(R.id.registerPassword)
        val registerPhone = view.findViewById<TextInputEditText>(R.id.registerPhone)
        val buttonLogin = view.findViewById<Button>(R.id.buttonLogin)
        val buttonRegister = view.findViewById<Button>(R.id.buttonRegister)
        val progress = view.findViewById<ProgressBar>(R.id.authProgress)
        val textError = view.findViewById<TextView>(R.id.authError)

        fun setLoading(loading: Boolean) {
            progress.isVisible = loading
            buttonLogin.isEnabled = !loading
            buttonRegister.isEnabled = !loading
            textError.isVisible = false
        }

        buttonLogin.setOnClickListener {
            val email = loginEmail.text?.toString()?.trim().orEmpty()
            val password = loginPassword.text?.toString().orEmpty()

            if (email.isBlank() || password.isBlank()) {
                textError.text = getString(R.string.error_fill_login)
                textError.isVisible = true
                return@setOnClickListener
            }

            viewLifecycleOwner.lifecycleScope.launch {
                setLoading(true)
                try {
                    val response = ApiClient.service.login(LoginRequest(email, password))
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        sessionManager.saveSession(body.token, body.user)
                        authHost?.onAuthenticated()
                    } else {
                        textError.text = getString(R.string.error_login_failed)
                        textError.isVisible = true
                    }
                } catch (e: Exception) {
                    textError.text = e.message ?: getString(R.string.error_login_failed)
                    textError.isVisible = true
                } finally {
                    setLoading(false)
                }
            }
        }

        buttonRegister.setOnClickListener {
            val firstName = registerFirstName.text?.toString()?.trim().orEmpty()
            val lastName = registerLastName.text?.toString()?.trim().orEmpty()
            val email = registerEmail.text?.toString()?.trim().orEmpty()
            val password = registerPassword.text?.toString().orEmpty()
            val phone = registerPhone.text?.toString()?.trim().takeUnless { it.isNullOrBlank() }

            if (firstName.isBlank() || lastName.isBlank() || email.isBlank() || password.isBlank()) {
                textError.text = getString(R.string.error_fill_register)
                textError.isVisible = true
                return@setOnClickListener
            }

            if (password.length < 6) {
                textError.text = getString(R.string.error_password_short)
                textError.isVisible = true
                return@setOnClickListener
            }

            viewLifecycleOwner.lifecycleScope.launch {
                setLoading(true)
                try {
                    val request = RegisterRequest(
                        email = email,
                        password = password,
                        firstName = firstName,
                        lastName = lastName,
                        phone = phone,
                    )
                    val response = ApiClient.service.register(request)
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        sessionManager.saveSession(body.token, body.user)
                        Snackbar.make(view, getString(R.string.register_success), Snackbar.LENGTH_SHORT).show()
                        authHost?.onAuthenticated()
                    } else {
                        textError.text = getString(R.string.error_register_failed)
                        textError.isVisible = true
                    }
                } catch (e: Exception) {
                    textError.text = e.message ?: getString(R.string.error_register_failed)
                    textError.isVisible = true
                } finally {
                    setLoading(false)
                }
            }
        }
    }
}
