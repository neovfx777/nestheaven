package uz.nestheaven.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.webkit.WebResourceErrorCompat
import androidx.webkit.WebViewClientCompat
import uz.nestheaven.mobile.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val uris = WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data)
            fileChooserCallback?.onReceiveValue(uris)
            fileChooserCallback = null
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        configureWebView()

        if (savedInstanceState == null) {
            binding.webView.loadUrl(BuildConfig.WEB_APP_URL)
        } else {
            binding.webView.restoreState(savedInstanceState)
        }
    }

    private fun configureWebView() {
        with(binding.webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            builtInZoomControls = false
            displayZoomControls = false
            javaScriptCanOpenWindowsAutomatically = true
            mediaPlaybackRequiresUserGesture = false
            mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
            userAgentString = "$userAgentString NestHeavenAndroid/1.0"
        }

        CookieManager.getInstance().setAcceptCookie(true)
        CookieManager.getInstance().setAcceptThirdPartyCookies(binding.webView, true)

        binding.webView.webViewClient = object : WebViewClientCompat() {
            override fun shouldOverrideUrlLoading(
                view: WebView,
                request: WebResourceRequest
            ): Boolean {
                val uri = request.url
                val scheme = uri.scheme
                if (scheme == "http" || scheme == "https") {
                    return false
                }
                runCatching {
                    startActivity(Intent(Intent.ACTION_VIEW, uri))
                }
                return true
            }

            override fun onReceivedError(
                view: WebView,
                request: WebResourceRequest,
                error: WebResourceErrorCompat
            ) {
                super.onReceivedError(view, request, error)
                if (request.isForMainFrame) {
                    binding.errorText.visibility = View.VISIBLE
                }
            }

            override fun onPageFinished(view: WebView, url: String?) {
                super.onPageFinished(view, url)
                binding.errorText.visibility = View.GONE
            }
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                if (filePathCallback == null || fileChooserParams == null) {
                    return false
                }
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback

                return runCatching {
                    fileChooserLauncher.launch(fileChooserParams.createIntent())
                    true
                }.getOrElse {
                    fileChooserCallback = null
                    false
                }
            }
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        binding.webView.saveState(outState)
    }

    override fun onDestroy() {
        binding.webView.apply {
            clearHistory()
            clearCache(true)
            loadUrl("about:blank")
            onPause()
            removeAllViews()
            destroy()
        }
        super.onDestroy()
    }
}

