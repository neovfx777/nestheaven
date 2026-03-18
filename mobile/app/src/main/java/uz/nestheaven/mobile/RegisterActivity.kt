package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Response
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.RegisterRequest
import uz.nestheaven.mobile.core.SessionManager
import java.util.regex.Pattern

class RegisterActivity : AppCompatActivity() {

    private val passwordPattern: Pattern = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)

        val sessionManager = SessionManager(this)
        if (sessionManager.isLoggedIn()) {
            if (sessionManager.isVerificationPending()) {
                openPendingVerification(sessionManager)
            } else {
                openMain()
            }
            return
        }

        setContentView(R.layout.activity_register)

        val buttonBack = findViewById<ImageButton>(R.id.registerBack)
        val name = findViewById<TextInputEditText>(R.id.registerName)
        val email = findViewById<TextInputEditText>(R.id.registerEmail)
        val password = findViewById<TextInputEditText>(R.id.registerPassword)
        val passwordRepeat = findViewById<TextInputEditText>(R.id.registerPasswordRepeat)
        val phone = findViewById<TextInputEditText>(R.id.registerPhone)
        val buttonRegister = findViewById<MaterialButton>(R.id.registerButton)
        val buttonGoLogin = findViewById<MaterialButton>(R.id.registerGoLogin)
        val progress = findViewById<ProgressBar>(R.id.registerProgress)
        val error = findViewById<TextView>(R.id.registerError)

        fun setLoading(loading: Boolean) {
            progress.isVisible = loading
            buttonRegister.isEnabled = !loading
            buttonGoLogin.isEnabled = !loading
            buttonBack.isEnabled = !loading
        }

        fun showError(message: String) {
            error.text = message
            error.isVisible = true
        }

        buttonBack.setOnClickListener { finish() }
        buttonGoLogin.setOnClickListener { finish() }

        buttonRegister.setOnClickListener {
            val (first, last) = splitName(name.text?.toString()?.trim().orEmpty())
            val emailValue = email.text?.toString()?.trim().orEmpty()
            val passwordValue = password.text?.toString().orEmpty()
            val passwordRepeatValue = passwordRepeat.text?.toString().orEmpty()
            val phoneValue = phone.text?.toString()?.trim()?.takeUnless { it.isNullOrBlank() }?.let { normalizePhone(it) }

            error.isVisible = false

            if (first.isBlank() || emailValue.isBlank() || passwordValue.isBlank() || passwordRepeatValue.isBlank()) {
                showError(getString(R.string.error_fill_register))
                return@setOnClickListener
            }

            if (passwordValue != passwordRepeatValue) {
                showError(getString(R.string.error_password_mismatch))
                return@setOnClickListener
            }

            if (!passwordPattern.matcher(passwordValue).matches()) {
                showError(getString(R.string.error_password_policy))
                return@setOnClickListener
            }

            lifecycleScope.launch {
                setLoading(true)
                try {
                    val response = ApiClient.service.register(
                        RegisterRequest(
                            email = emailValue,
                            password = passwordValue,
                            firstName = first,
                            lastName = last,
                            phone = phoneValue,
                        ),
                    )

                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        val token = body.token
                        val user = body.user
                        if (!token.isNullOrBlank() && user != null) {
                            sessionManager.saveSession(token, user)
                            sessionManager.markVerificationPending(SessionManager.VERIFICATION_FLOW_REGISTER, emailValue)
                            openVerification(emailValue)
                        } else if (body.requiresEmailVerification == true) {
                            openVerification(body.email ?: emailValue)
                        } else {
                            showError(body.message?.takeIf { it.isNotBlank() } ?: getString(R.string.error_register_failed))
                        }
                    } else {
                        showError(resolveApiError(response, R.string.error_register_failed))
                    }
                } catch (_: Exception) {
                    showError(getString(R.string.error_network_generic))
                } finally {
                    setLoading(false)
                }
            }
        }
    }

    private fun openMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }

    private fun openVerification(email: String) {
        startActivity(
            Intent(this, RegisterVerificationActivity::class.java)
                .putExtra(RegisterVerificationActivity.EXTRA_EMAIL, email),
        )
        finish()
    }

    private fun openPendingVerification(sessionManager: SessionManager) {
        val flow = sessionManager.getVerificationFlow()
        val email = sessionManager.getVerificationEmail()

        val next = if (flow == SessionManager.VERIFICATION_FLOW_LOGIN) {
            LoginVerificationActivity::class.java
        } else {
            RegisterVerificationActivity::class.java
        }

        startActivity(
            Intent(this, next)
                .putExtra(RegisterVerificationActivity.EXTRA_EMAIL, email)
                .putExtra(LoginVerificationActivity.EXTRA_EMAIL, email),
        )
        finish()
    }

    private fun normalizePhone(raw: String): String {
        val digits = raw.filter { it.isDigit() }
        if (digits.isBlank()) return ""
        return if (digits.length == 9) "998$digits" else digits
    }

    private fun splitName(raw: String): Pair<String, String> {
        val parts = raw.trim()
            .split(Regex("\\s+"))
            .filter { it.isNotBlank() }

        if (parts.isEmpty()) return "" to ""
        if (parts.size == 1) return parts[0] to parts[0]

        return parts[0] to parts.drop(1).joinToString(" ")
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
