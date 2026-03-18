package uz.nestheaven.mobile

import android.content.Intent
import android.os.Bundle
import android.os.CountDownTimer
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager

class RegisterVerificationActivity : AppCompatActivity() {

    private var resendTimer: CountDownTimer? = null
    private var canResend: Boolean = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        setContentView(R.layout.activity_verification)

        val sessionManager = SessionManager(this)
        val email = intent.getStringExtra(EXTRA_EMAIL)
            ?.trim()
            .orEmpty()
            .ifBlank { sessionManager.getVerificationEmail().orEmpty() }

        val code = findViewById<TextInputEditText>(R.id.verificationCode)
        val resend = findViewById<TextView>(R.id.verificationResend)
        val buttonVerify = findViewById<MaterialButton>(R.id.verificationButton)
        val promptText = findViewById<TextView>(R.id.verificationPromptText)
        val promptAction = findViewById<MaterialButton>(R.id.verificationPromptAction)
        val error = findViewById<TextView>(R.id.verificationError)

        promptText.text = getString(R.string.register_prompt_have_account)
        promptAction.text = getString(R.string.login)

        fun showError(message: String) {
            error.text = message
            error.isVisible = true
        }

        fun resetError() {
            error.isVisible = false
        }

        fun updateResendUi(secondsRemaining: Int?) {
            if (secondsRemaining != null && secondsRemaining > 0) {
                canResend = false
                resend.text = getString(R.string.verification_resend_in, secondsRemaining)
                resend.setTextColor(getColor(R.color.nh_text_secondary))
                resend.isEnabled = false
            } else {
                canResend = true
                resend.text = getString(R.string.verification_resend)
                resend.setTextColor(getColor(R.color.nh_splash_bg))
                resend.isEnabled = true
            }
        }

        fun startResendTimer() {
            resendTimer?.cancel()
            updateResendUi(60)
            resendTimer = object : CountDownTimer(60_000, 1_000) {
                override fun onTick(millisUntilFinished: Long) {
                    val secondsLeft = (millisUntilFinished / 1_000).toInt()
                    updateResendUi(secondsLeft)
                }

                override fun onFinish() {
                    updateResendUi(null)
                }
            }.start()
        }

        promptAction.setOnClickListener {
            sessionManager.clear()
            val intent = Intent(this, LoginActivity::class.java)
            if (email.isNotBlank()) {
                intent.putExtra(LoginActivity.EXTRA_PREFILL_EMAIL, email)
            }
            startActivity(intent)
            finish()
        }

        resend.setOnClickListener {
            if (!canResend) return@setOnClickListener
            resetError()
            Toast.makeText(this, getString(R.string.verification_resend_sent), Toast.LENGTH_SHORT).show()
            startResendTimer()
        }

        buttonVerify.setOnClickListener {
            val codeValue = code.text?.toString()?.trim().orEmpty()
            resetError()

            if (codeValue.length != 6) {
                showError(getString(R.string.error_fill_verification_code))
                return@setOnClickListener
            }

            sessionManager.clearVerificationPending()
            Toast.makeText(this, getString(R.string.verification_success), Toast.LENGTH_SHORT).show()

            if (sessionManager.isLoggedIn()) {
                openMain()
            } else {
                val intent = Intent(this, LoginActivity::class.java)
                if (email.isNotBlank()) {
                    intent.putExtra(LoginActivity.EXTRA_PREFILL_EMAIL, email)
                }
                startActivity(intent)
                finish()
            }
        }

        startResendTimer()
    }

    override fun onDestroy() {
        resendTimer?.cancel()
        super.onDestroy()
    }

    private fun openMain() {
        val intent = Intent(this, MainActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        startActivity(intent)
        finish()
    }

    companion object {
        const val EXTRA_EMAIL = "extra_email"
    }
}
