package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.google.android.material.button.MaterialButton
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import retrofit2.Response
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.LoginRequest
import uz.nestheaven.mobile.core.SessionManager

class LoginActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)

        val sessionManager = SessionManager(this)
        if (sessionManager.isLoggedIn()) {
            openMain()
            return
        }

        setContentView(R.layout.activity_login)

        val email = findViewById<TextInputEditText>(R.id.loginEmail)
        val password = findViewById<TextInputEditText>(R.id.loginPassword)
        val forgot = findViewById<TextView>(R.id.loginForgot)
        val buttonLogin = findViewById<MaterialButton>(R.id.loginButton)
        val buttonGoRegister = findViewById<MaterialButton>(R.id.loginGoRegister)
        val progress = findViewById<ProgressBar>(R.id.loginProgress)
        val error = findViewById<TextView>(R.id.loginError)

        fun setLoading(loading: Boolean) {
            progress.isVisible = loading
            buttonLogin.isEnabled = !loading
            buttonGoRegister.isEnabled = !loading
            forgot.isEnabled = !loading
        }

        fun showError(message: String) {
            error.text = message
            error.isVisible = true
        }

        forgot.setOnClickListener {
            Snackbar.make(it, getString(R.string.forgot_password_hint), Snackbar.LENGTH_SHORT).show()
        }

        buttonGoRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        buttonLogin.setOnClickListener {
            val emailValue = email.text?.toString()?.trim().orEmpty()
            val passwordValue = password.text?.toString().orEmpty()

            error.isVisible = false

            if (emailValue.isBlank() || passwordValue.isBlank()) {
                showError(getString(R.string.error_fill_login))
                return@setOnClickListener
            }

            lifecycleScope.launch {
                setLoading(true)
                try {
                    val response = ApiClient.service.login(
                        LoginRequest(
                            email = emailValue,
                            password = passwordValue,
                        ),
                    )
                    if (response.isSuccessful && response.body() != null) {
                        val body = response.body()!!
                        sessionManager.saveSession(body.token, body.user)
                        openMain()
                    } else {
                        showError(resolveApiError(response, R.string.error_login_failed))
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
