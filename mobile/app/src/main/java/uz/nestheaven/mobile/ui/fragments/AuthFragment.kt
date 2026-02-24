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
import com.google.android.material.button.MaterialButtonToggleGroup
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Response
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.LoginRequest
import uz.nestheaven.mobile.core.RegisterRequest
import uz.nestheaven.mobile.core.SessionManager

class AuthFragment : Fragment(R.layout.fragment_auth) {

    interface AuthHost {
        fun onAuthenticated()
    }

    private enum class AuthMode {
        LOGIN,
        REGISTER,
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

        val heroCard = view.findViewById<View>(R.id.authHeroCard)
        val mainCard = view.findViewById<View>(R.id.authMainCard)
        val authModeToggle = view.findViewById<MaterialButtonToggleGroup>(R.id.authModeToggle)
        val buttonModeLogin = view.findViewById<Button>(R.id.buttonModeLogin)
        val buttonModeRegister = view.findViewById<Button>(R.id.buttonModeRegister)
        val loginCard = view.findViewById<View>(R.id.loginCard)
        val registerCard = view.findViewById<View>(R.id.registerCard)
        val buttonGoToRegister = view.findViewById<Button>(R.id.buttonGoToRegister)
        val buttonGoToLogin = view.findViewById<Button>(R.id.buttonGoToLogin)
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

        var currentMode = AuthMode.LOGIN

        fun animateEntry() {
            val offset = 18f * resources.displayMetrics.density
            heroCard.alpha = 0f
            heroCard.translationY = -offset
            mainCard.alpha = 0f
            mainCard.translationY = offset

            heroCard.animate()
                .alpha(1f)
                .translationY(0f)
                .setDuration(320L)
                .start()
            mainCard.animate()
                .alpha(1f)
                .translationY(0f)
                .setStartDelay(80L)
                .setDuration(340L)
                .start()
        }

        fun setMode(mode: AuthMode, animate: Boolean, syncToggle: Boolean = true) {
            val selectedButtonId = if (mode == AuthMode.LOGIN) {
                R.id.buttonModeLogin
            } else {
                R.id.buttonModeRegister
            }

            if (syncToggle && authModeToggle.checkedButtonId != selectedButtonId) {
                authModeToggle.check(selectedButtonId)
            }

            val incoming = if (mode == AuthMode.LOGIN) loginCard else registerCard
            val outgoing = if (mode == AuthMode.LOGIN) registerCard else loginCard
            val alreadyVisible = (mode == AuthMode.LOGIN && loginCard.isVisible) ||
                (mode == AuthMode.REGISTER && registerCard.isVisible)

            if (alreadyVisible && currentMode == mode) {
                return
            }

            textError.isVisible = false

            if (!animate || !view.isAttachedToWindow) {
                outgoing.isVisible = false
                outgoing.alpha = 1f
                outgoing.translationX = 0f
                incoming.isVisible = true
                incoming.alpha = 1f
                incoming.translationX = 0f
                currentMode = mode
                return
            }

            val distance = 26f * resources.displayMetrics.density
            val direction = if (mode == AuthMode.REGISTER) 1f else -1f

            incoming.animate().cancel()
            outgoing.animate().cancel()

            incoming.isVisible = true
            incoming.alpha = 0f
            incoming.translationX = distance * direction

            outgoing.animate()
                .alpha(0f)
                .translationX(-distance * direction * 0.35f)
                .setDuration(170L)
                .withEndAction {
                    outgoing.isVisible = false
                    outgoing.alpha = 1f
                    outgoing.translationX = 0f
                }
                .start()

            incoming.animate()
                .alpha(1f)
                .translationX(0f)
                .setDuration(220L)
                .start()

            currentMode = mode
        }

        fun setLoading(loading: Boolean) {
            progress.isVisible = loading
            buttonLogin.isEnabled = !loading
            buttonRegister.isEnabled = !loading
            authModeToggle.isEnabled = !loading
            buttonModeLogin.isEnabled = !loading
            buttonModeRegister.isEnabled = !loading
            buttonGoToRegister.isEnabled = !loading
            buttonGoToLogin.isEnabled = !loading
            textError.isVisible = false
        }

        animateEntry()
        setMode(AuthMode.LOGIN, animate = false)

        authModeToggle.addOnButtonCheckedListener { _, checkedId, isChecked ->
            if (!isChecked) return@addOnButtonCheckedListener
            when (checkedId) {
                R.id.buttonModeRegister -> setMode(AuthMode.REGISTER, animate = true, syncToggle = false)
                R.id.buttonModeLogin -> setMode(AuthMode.LOGIN, animate = true, syncToggle = false)
            }
        }

        buttonGoToRegister.setOnClickListener {
            setMode(AuthMode.REGISTER, animate = true)
        }

        buttonGoToLogin.setOnClickListener {
            setMode(AuthMode.LOGIN, animate = true)
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
                        textError.text = resolveApiError(response, R.string.error_login_failed)
                        textError.isVisible = true
                    }
                } catch (e: Exception) {
                    textError.text = getString(R.string.error_network_generic)
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
                        textError.text = resolveApiError(response, R.string.error_register_failed)
                        textError.isVisible = true
                    }
                } catch (e: Exception) {
                    textError.text = getString(R.string.error_network_generic)
                    textError.isVisible = true
                } finally {
                    setLoading(false)
                }
            }
        }
    }

    private fun resolveApiError(response: Response<*>, fallbackResId: Int): String {
        return extractMessage(response) ?: getString(fallbackResId)
    }

    private fun extractMessage(response: Response<*>): String? {
        val rawBody = try {
            response.errorBody()?.string().orEmpty()
        } catch (_: Exception) {
            return null
        }

        if (rawBody.isBlank()) return null

        return try {
            val json = JSONObject(rawBody)
            when (val message = json.opt("message")) {
                is String -> message.takeIf { it.isNotBlank() }
                is JSONArray -> {
                    (0 until message.length())
                        .mapNotNull { index -> message.optString(index).takeIf { it.isNotBlank() } }
                        .joinToString("\n")
                        .takeIf { it.isNotBlank() }
                }
                else -> null
            } ?: json.optString("error").takeIf { it.isNotBlank() }
        } catch (_: Exception) {
            null
        }
    }
}
