package uz.nestheaven.mobile

import android.os.Bundle
import android.content.Intent
import android.view.View
import android.widget.ImageView
import android.widget.ImageButton
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
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.ApartmentDetailModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.SimilarListingAdapter
import kotlin.math.pow
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
        val prevImageButton = findViewById<ImageButton>(R.id.detailImagePrevButton)
        val nextImageButton = findViewById<ImageButton>(R.id.detailImageNextButton)
        val title = findViewById<TextView>(R.id.detailTitle)
        val locationInline = findViewById<TextView>(R.id.detailLocationInline)
        val city = findViewById<TextView>(R.id.detailCity)
        val price = findViewById<TextView>(R.id.detailPrice)
        val rooms = findViewById<TextView>(R.id.detailRoomsValue)
        val area = findViewById<TextView>(R.id.detailAreaValue)
        val floor = findViewById<TextView>(R.id.detailFloorValue)
        val totalFloors = findViewById<TextView>(R.id.detailTotalFloorsValue)
        val status = findViewById<TextView>(R.id.detailStatus)
        val description = findViewById<TextView>(R.id.detailDescription)
        val progress = findViewById<ProgressBar>(R.id.detailProgress)
        val favoriteButton = findViewById<MaterialButton>(R.id.detailFavoriteButton)
        val chatButton = findViewById<MaterialButton>(R.id.detailChatButton)
        val locationCard = findViewById<View>(R.id.detailLocationCard)
        val locationText = findViewById<TextView>(R.id.detailLocationText)
        val developerText = findViewById<TextView>(R.id.detailDeveloperText)
        val blockText = findViewById<TextView>(R.id.detailBlockText)
        val coordinatesText = findViewById<TextView>(R.id.detailCoordinatesText)
        val similarSection = findViewById<View>(R.id.detailSimilarSection)
        val similarShowAll = findViewById<View>(R.id.detailSimilarShowAll)
        val similarRecycler = findViewById<RecyclerView>(R.id.detailSimilarRecycler)
        val mortgageCard = findViewById<View>(R.id.detailMortgageCard)
        val mortgageLoanValue = findViewById<TextView>(R.id.detailMortgageLoanValue)
        val mortgageMonthlyValue = findViewById<TextView>(R.id.detailMortgageMonthlyValue)
        val pricePerM2Value = findViewById<TextView>(R.id.detailPricePerM2Value)
        val conditionValue = findViewById<TextView>(R.id.detailConditionValue)
        val yearBuiltValue = findViewById<TextView>(R.id.detailYearBuiltValue)
        val walkabilityValue = findViewById<TextView>(R.id.detailWalkabilityValue)
        val airQualityValue = findViewById<TextView>(R.id.detailAirQualityValue)
        val amenityOne = findViewById<TextView>(R.id.detailAmenityOne)
        val amenityTwo = findViewById<TextView>(R.id.detailAmenityTwo)
        val amenityThree = findViewById<TextView>(R.id.detailAmenityThree)
        val complexName = findViewById<TextView>(R.id.detailComplexName)

        val similarAdapter = SimilarListingAdapter { model ->
            startActivity(
                Intent(this, ApartmentDetailActivity::class.java).apply {
                    putExtra(EXTRA_APARTMENT_ID, model.id)
                },
            )
        }
        similarRecycler.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        similarRecycler.adapter = similarAdapter
        similarRecycler.isNestedScrollingEnabled = false

        favoriteButton.isVisible = sessionManager.isLoggedIn()
        chatButton.isVisible = sessionManager.isLoggedIn()
        prevImageButton.setOnClickListener { }
        nextImageButton.setOnClickListener { }

        chatButton.setOnClickListener {
            startActivity(
                android.content.Intent(this, ChatActivity::class.java).apply {
                    putExtra(ChatActivity.EXTRA_APARTMENT_ID, apartmentId)
                },
            )
        }

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
                        locationInline.text = model.locationText ?: model.city
                        price.text = model.priceText
                        rooms.text = model.roomsValue?.toString() ?: "-"
                        area.text = model.areaValue?.toInt()?.toString() ?: "-"
                        floor.text = model.floorValue?.toString() ?: "-"
                        totalFloors.text = model.totalFloorsValue?.toString() ?: "-"
                        status.text = model.statusText
                        applyStatusStyle(status, model.statusText)
                        description.text = model.description
                        complexName.text = model.complexTitle ?: getString(R.string.detail_value_unknown)
                        pricePerM2Value.text = buildPricePerM2(model)
                        conditionValue.text = model.conditionText ?: getString(R.string.detail_value_unknown)
                        yearBuiltValue.text = model.yearBuiltText ?: getString(R.string.detail_value_unknown)
                        walkabilityValue.text = model.walkabilityText?.let {
                            getString(R.string.detail_score_format, it)
                        } ?: getString(R.string.detail_metric_missing, getString(R.string.detail_walkability_label))
                        airQualityValue.text = model.airQualityText?.let {
                            getString(R.string.detail_score_format, it)
                        } ?: getString(R.string.detail_metric_missing, getString(R.string.detail_air_quality_label))
                        bindAmenityChip(amenityOne, model.amenitiesText.getOrNull(0))
                        bindAmenityChip(amenityTwo, model.amenitiesText.getOrNull(1))
                        bindAmenityChip(amenityThree, model.amenitiesText.getOrNull(2))
                        bindLocationSection(
                            model = model,
                            locationCard = locationCard,
                            locationText = locationText,
                            developerText = developerText,
                            blockText = blockText,
                            coordinatesText = coordinatesText,
                        )
                        bindMortgageSection(
                            model = model,
                            mortgageCard = mortgageCard,
                            mortgageLoanValue = mortgageLoanValue,
                            mortgageMonthlyValue = mortgageMonthlyValue,
                        )
                        loadSimilarListings(
                            apartmentId = apartmentId,
                            model = model,
                            similarAdapter = similarAdapter,
                            similarSection = similarSection,
                            showAllView = similarShowAll,
                        )

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

    private fun bindLocationSection(
        model: ApartmentDetailModel,
        locationCard: View,
        locationText: TextView,
        developerText: TextView,
        blockText: TextView,
        coordinatesText: TextView,
    ) {
        val hasAnyLocation =
            !model.locationText.isNullOrBlank() ||
            !model.developerText.isNullOrBlank() ||
            !model.blocksText.isNullOrBlank() ||
            (model.latitude != null && model.longitude != null)

        locationCard.isVisible = hasAnyLocation
        if (!hasAnyLocation) return

        locationText.text = model.locationText ?: model.city
        developerText.text = getString(
            R.string.detail_location_developer,
            model.developerText ?: getString(R.string.detail_value_unknown),
        )
        blockText.text = getString(
            R.string.detail_location_blocks,
            model.blocksText ?: getString(R.string.detail_value_unknown),
        )
        coordinatesText.text = if (model.latitude != null && model.longitude != null) {
            getString(R.string.detail_location_coordinates, model.latitude, model.longitude)
        } else {
            getString(R.string.detail_location_map_soon)
        }
    }

    private fun bindMortgageSection(
        model: ApartmentDetailModel,
        mortgageCard: View,
        mortgageLoanValue: TextView,
        mortgageMonthlyValue: TextView,
    ) {
        val price = model.priceValue
        mortgageCard.isVisible = price != null && price > 0
        if (price == null || price <= 0) return

        val loanAmount = price * 0.70
        val annualRate = 0.045
        val months = 30 * 12
        val monthlyRate = annualRate / 12
        val monthlyPayment = if (monthlyRate == 0.0) {
            loanAmount / months
        } else {
            val factor = (1 + monthlyRate).pow(months.toDouble())
            loanAmount * monthlyRate * factor / (factor - 1)
        }

        mortgageLoanValue.text = formatCurrency(loanAmount)
        mortgageMonthlyValue.text = formatCurrency(monthlyPayment)
    }

    private suspend fun loadSimilarListings(
        apartmentId: String,
        model: ApartmentDetailModel,
        similarAdapter: SimilarListingAdapter,
        similarSection: View,
        showAllView: View,
    ) {
        runCatching {
            ApiClient.service.getApartments(page = 1, limit = 40, search = model.city.takeIf { it.isNotBlank() })
        }.onSuccess { response ->
            if (!response.isSuccessful) {
                similarSection.isVisible = false
                return@onSuccess
            }

            val items = JsonParsers.parseApartments(response.body())
                .filter { it.id != apartmentId }
                .sortedWith(
                    compareByDescending<uz.nestheaven.mobile.core.ApartmentCardModel> {
                        it.city.equals(model.city, ignoreCase = true)
                    }.thenByDescending {
                        it.title.contains(model.complexTitle.orEmpty(), ignoreCase = true)
                    },
                )
                .take(6)

            val hasItems = items.isNotEmpty()
            similarSection.isVisible = hasItems
            if (!hasItems) return@onSuccess

            similarAdapter.submitList(items)
            showAllView.isVisible = false
        }.onFailure {
            similarSection.isVisible = false
        }
    }

    private fun formatCurrency(value: Double): String {
        val rounded = java.text.DecimalFormat("#,###").format(value)
        return "$rounded UZS"
    }

    private fun buildPricePerM2(model: ApartmentDetailModel): String {
        val area = model.areaValue
        val price = model.priceValue
        if (area == null || price == null || area <= 0) return getString(R.string.detail_value_unknown)
        return formatCurrency(price / area)
    }

    private fun bindAmenityChip(view: TextView, value: String?) {
        val normalized = value?.trim().orEmpty()
        view.isVisible = normalized.isNotBlank()
        if (normalized.isNotBlank()) {
            view.text = normalized.replaceFirstChar { if (it.isLowerCase()) it.titlecase(Locale.getDefault()) else it.toString() }
        }
    }

    companion object {
        const val EXTRA_APARTMENT_ID = "extra_apartment_id"
    }
}
