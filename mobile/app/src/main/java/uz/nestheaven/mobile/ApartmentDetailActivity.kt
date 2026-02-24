package uz.nestheaven.mobile

import android.os.Bundle
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import java.util.Locale

class ApartmentDetailActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        sessionManager = SessionManager(this)

        setContentView(R.layout.activity_apartment_detail)

        val toolbar = findViewById<MaterialToolbar>(R.id.detailToolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener { finish() }

        val apartmentId = intent.getStringExtra(EXTRA_APARTMENT_ID)
        if (apartmentId.isNullOrBlank()) {
            finish()
            return
        }

        val image = findViewById<ImageView>(R.id.detailImage)
        val title = findViewById<TextView>(R.id.detailTitle)
        val city = findViewById<TextView>(R.id.detailCity)
        val price = findViewById<TextView>(R.id.detailPrice)
        val rooms = findViewById<TextView>(R.id.detailRooms)
        val area = findViewById<TextView>(R.id.detailArea)
        val floor = findViewById<TextView>(R.id.detailFloor)
        val status = findViewById<TextView>(R.id.detailStatus)
        val description = findViewById<TextView>(R.id.detailDescription)
        val progress = findViewById<ProgressBar>(R.id.detailProgress)
        val favoriteButton = findViewById<MaterialButton>(R.id.detailFavoriteButton)

        favoriteButton.isVisible = sessionManager.isLoggedIn()

        favoriteButton.setOnClickListener {
            if (!sessionManager.isLoggedIn()) {
                Snackbar.make(it, getString(R.string.login_required), Snackbar.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                runCatching {
                    val statusResp = ApiClient.service.getFavoriteStatus(apartmentId)
                    val isFavorite = statusResp.body()
                        ?.getAsJsonObject("data")
                        ?.get("isFavorite")
                        ?.asBoolean
                        ?: false

                    val response = if (isFavorite) {
                        ApiClient.service.removeFavorite(apartmentId)
                    } else {
                        ApiClient.service.addFavorite(apartmentId)
                    }

                    if (response.isSuccessful) {
                        favoriteButton.text = if (isFavorite) {
                            getString(R.string.favorite_add)
                        } else {
                            getString(R.string.favorite_remove)
                        }
                    }
                }
            }
        }

        lifecycleScope.launch {
            progress.isVisible = true
            try {
                val response = ApiClient.service.getApartmentById(apartmentId)
                if (response.isSuccessful) {
                    val model = JsonParsers.parseApartmentDetail(response.body())
                    if (model != null) {
                        supportActionBar?.title = model.title
                        title.text = model.title
                        city.text = model.city
                        price.text = model.priceText
                        rooms.text = model.roomsText
                        area.text = model.areaText
                        floor.text = model.floorText
                        status.text = model.statusText
                        applyStatusStyle(status, model.statusText)
                        description.text = model.description

                        Glide.with(this@ApartmentDetailActivity)
                            .load(model.imageUrl)
                            .placeholder(R.drawable.placeholder_image)
                            .error(R.drawable.placeholder_image)
                            .centerCrop()
                            .into(image)
                    }
                }

                if (sessionManager.isLoggedIn()) {
                    val statusResp = ApiClient.service.getFavoriteStatus(apartmentId)
                    val isFavorite = statusResp.body()
                        ?.getAsJsonObject("data")
                        ?.get("isFavorite")
                        ?.asBoolean
                        ?: false
                    favoriteButton.text = if (isFavorite) getString(R.string.favorite_remove) else getString(R.string.favorite_add)
                }
            } catch (e: Exception) {
                Snackbar.make(title, e.message ?: getString(R.string.error_load_details), Snackbar.LENGTH_LONG).show()
            } finally {
                progress.isVisible = false
            }
        }
    }

    private fun applyStatusStyle(view: TextView, statusText: String) {
        val normalized = statusText.lowercase(Locale.getDefault())
        val (backgroundRes, textColorRes) = when {
            "faol" in normalized || "active" in normalized -> R.drawable.bg_status_active to R.color.nh_success_fg
            "sot" in normalized || "sold" in normalized -> R.drawable.bg_status_sold to R.color.nh_error_fg
            "yash" in normalized || "hidden" in normalized -> R.drawable.bg_status_hidden to R.color.nh_neutral_fg
            else -> R.drawable.bg_status_default to R.color.nh_info_fg
        }

        view.setBackgroundResource(backgroundRes)
        view.setTextColor(ContextCompat.getColor(this, textColorRes))
    }

    companion object {
        const val EXTRA_APARTMENT_ID = "extra_apartment_id"
    }
}
