package uz.nestheaven.mobile

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import com.google.android.material.appbar.MaterialToolbar
import com.google.gson.Gson
import org.json.JSONObject
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.SessionManager

class WebDashboardActivity : AppCompatActivity() {

    private val gson = Gson()
    private var injected = false

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)

        val sessionManager = SessionManager(this)
        val token = sessionManager.getToken()?.trim().orEmpty()
        val user = sessionManager.getUser()
        if (token.isBlank() || user == null) {
            finish()
            return
        }

        setContentView(R.layout.activity_web_dashboard)

        val toolbar = findViewById<MaterialToolbar>(R.id.webDashboardToolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener {
            val webView = findViewById<WebView>(R.id.webDashboardWebView)
            if (webView.canGoBack()) webView.goBack() else finish()
        }

        val progress = findViewById<ProgressBar>(R.id.webDashboardProgress)
        val webView = findViewById<WebView>(R.id.webDashboardWebView)

        val path = intent.getStringExtra(EXTRA_PATH)?.trim().orEmpty().ifBlank { "/dashboard" }
        val webBase = deriveWebBaseUrl(ApiClient.activeBaseUrl)
        val entryUrl = webBase
        val targetUrl = joinUrl(webBase, path)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.cacheMode = WebSettings.LOAD_DEFAULT
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true

        webView.webChromeClient = WebChromeClient()
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)

                if (!injected) {
                    injected = true
                    val authStorage = buildAuthStorageJson(token, user)
                    val language = sessionManager.getLanguageTag()?.trim().orEmpty()

                    val script = buildString {
                        append("try{")
                        append("localStorage.setItem('auth-storage', ")
                        append(JSONObject.quote(authStorage))
                        append(");")
                        if (language.isNotBlank()) {
                            append("localStorage.setItem('selected-language', ")
                            append(JSONObject.quote(language))
                            append(");")
                        }
                        append("}catch(e){}")
                    }

                    view.evaluateJavascript(script) {
                        view.loadUrl(targetUrl)
                    }
                    return
                }
            }
        }

        webView.setOnLongClickListener { false }
        webView.isLongClickable = true

        progress.isVisible = true
        webView.visibility = View.INVISIBLE

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progress.isVisible = newProgress < 100
                webView.visibility = if (newProgress < 15) View.INVISIBLE else View.VISIBLE
            }
        }

        // Load base origin first so we can safely write localStorage for that origin, then navigate.
        webView.loadUrl(entryUrl)
    }

    private fun buildAuthStorageJson(token: String, user: uz.nestheaven.mobile.core.UserDto): String {
        val fullName = listOfNotNull(user.firstName, user.lastName)
            .joinToString(" ")
            .trim()
            .ifBlank { user.email }

        val webUser = mapOf(
            "id" to user.id,
            "email" to user.email,
            "fullName" to fullName,
            "firstName" to user.firstName,
            "lastName" to user.lastName,
            "role" to user.role,
            "isActive" to (user.isActive ?: true),
            "emailVerified" to true,
        )

        val persisted = mapOf(
            "state" to mapOf(
                "user" to webUser,
                "token" to token,
                "isAuthenticated" to true,
            ),
            "version" to 0,
        )

        return gson.toJson(persisted)
    }

    private fun deriveWebBaseUrl(apiBaseUrl: String): String {
        val normalized = apiBaseUrl.trim().ifBlank { "" }
        if (normalized.isBlank()) return "https://nestheaven.uz/"

        val withoutApi = normalized
            .removeSuffix("/")
            .removeSuffix("/api")
            .removeSuffix("/api/")
            .removeSuffix("api/")
        return if (withoutApi.endsWith("/")) withoutApi else "$withoutApi/"
    }

    private fun joinUrl(base: String, path: String): String {
        val baseNormalized = if (base.endsWith("/")) base.dropLast(1) else base
        val pathNormalized = if (path.startsWith("/")) path else "/$path"
        return "$baseNormalized$pathNormalized"
    }

    companion object {
        const val EXTRA_PATH = "extra_path"
    }
}

