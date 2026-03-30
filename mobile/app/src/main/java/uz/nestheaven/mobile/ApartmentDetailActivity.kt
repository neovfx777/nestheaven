package uz.nestheaven.mobile

import android.os.Bundle
import android.content.Intent
import android.view.View
import android.widget.ScrollView
import android.widget.ImageView
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.text.StaticLayout
import android.text.TextUtils
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.android.material.snackbar.Snackbar
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.ApartmentDetailModel
import uz.nestheaven.mobile.core.BlockedListings
import uz.nestheaven.mobile.core.ImageLoading
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.SimilarListingAdapter
import kotlin.math.pow
import java.util.Locale

class ApartmentDetailActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private var currentModel: ApartmentDetailModel? = null
    private var isDescriptionExpanded: Boolean = false

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
        if (BlockedListings.isApartmentBlocked(this, apartmentId)) {
            Toast.makeText(
                this,
                getString(R.string.blocked_listing_system_message),
                Toast.LENGTH_LONG,
            ).show()
            finish()
            return
        }

        val scroll = findViewById<ScrollView>(R.id.detailScroll)
        val image = findViewById<ImageView>(R.id.detailImage)
        val prevImageButton = findViewById<ImageButton>(R.id.detailImagePrevButton)
        val nextImageButton = findViewById<ImageButton>(R.id.detailImageNextButton)
        val actionFavorite = findViewById<ImageButton>(R.id.detailActionFavorite)
        val actionShare = findViewById<ImageButton>(R.id.detailActionShare)
        val actionBlock = findViewById<ImageButton>(R.id.detailActionBlock)
        val title = findViewById<TextView>(R.id.detailTitle)
        val city = findViewById<TextView>(R.id.detailCity)
        val price = findViewById<TextView>(R.id.detailPrice)
        val rooms = findViewById<TextView>(R.id.detailRoomsValue)
        val area = findViewById<TextView>(R.id.detailAreaValue)
        val floor = findViewById<TextView>(R.id.detailFloorValue)
        val totalFloors = findViewById<TextView>(R.id.detailTotalFloorsValue)
        val status = findViewById<TextView>(R.id.detailStatus)
        val description = findViewById<TextView>(R.id.detailDescription)
        val descriptionToggle = findViewById<TextView>(R.id.detailDescriptionToggle)
        val progress = findViewById<ProgressBar>(R.id.detailProgress)
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
        val estimatedMonthlyValue = findViewById<TextView>(R.id.detailEstimatedMonthlyValue)
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

        similarAdapter.setBlockedIds(BlockedListings.getBlockedApartmentIds(this))

        actionFavorite.isVisible = sessionManager.isLoggedIn()
        chatButton.isVisible = sessionManager.isLoggedIn()
        prevImageButton.setOnClickListener { }
        nextImageButton.setOnClickListener { }

        price.setOnClickListener {
            scroll.post { scroll.smoothScrollTo(0, mortgageCard.top) }
        }
        estimatedMonthlyValue.setOnClickListener {
            scroll.post { scroll.smoothScrollTo(0, mortgageCard.top) }
        }

        chatButton.setOnClickListener {
            startActivity(
                android.content.Intent(this, ChatActivity::class.java).apply {
                    putExtra(ChatActivity.EXTRA_APARTMENT_ID, apartmentId)
                },
            )
        }

        actionBlock.setOnClickListener {
            val model = currentModel
            BlockedListings.blockApartment(
                context = this,
                apartmentId = apartmentId,
                title = model?.title,
                city = model?.city,
                priceText = model?.priceText,
            )
            Toast.makeText(
                this,
                getString(R.string.blocked_listing_system_message),
                Toast.LENGTH_LONG,
            ).show()
            finish()
        }

        actionShare.setOnClickListener {
            val model = currentModel
            val shareText = if (model != null) {
                "${model.title}\n${model.priceText}\n${model.city}"
            } else {
                getString(R.string.app_name)
            }
            startActivity(
                Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, shareText)
                },
            )
        }

        actionFavorite.setOnClickListener {
            if (!sessionManager.isLoggedIn()) {
                Snackbar.make(it, getString(R.string.login_required), Snackbar.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                runCatching {
                    val statusResp = ApiClient.service.getFavoriteStatus(apartmentId)
                    if (statusResp.code() == 401) {
                        sessionManager.clear()
                        Snackbar.make(title, getString(R.string.login_required), Snackbar.LENGTH_SHORT).show()
                        startActivity(Intent(this@ApartmentDetailActivity, LoginActivity::class.java))
                        return@runCatching
                    }
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
                        renderFavoriteAction(actionFavorite, isFavoriteNow = !isFavorite)
                    } else if (response.code() == 401) {
                        sessionManager.clear()
                        Snackbar.make(title, getString(R.string.login_required), Snackbar.LENGTH_SHORT).show()
                        startActivity(Intent(this@ApartmentDetailActivity, LoginActivity::class.java))
                    } else {
                        Snackbar.make(title, getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
                    }
                }.onFailure {
                    Snackbar.make(title, it.message ?: getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
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
                        currentModel = model
                        title.text = model.title
                        city.text = model.city
                        price.text = model.priceText
                        rooms.text = model.roomsValue?.toString() ?: "-"
                        area.text = model.areaValue?.toInt()?.toString() ?: "-"
                        floor.text = model.floorValue?.toString() ?: "-"
                        totalFloors.text = model.totalFloorsValue?.toString() ?: "-"
                        status.isVisible = false
                        bindExpandableDescription(
                            descriptionView = description,
                            toggleView = descriptionToggle,
                            text = model.description,
                        )
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
                        estimatedMonthlyValue.text = computeEstimatedMonthly(model)?.let { formatCurrency(it) }
                            ?: getString(R.string.detail_value_unknown)
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

                        ImageLoading.load(image, model.imageUrl, caller = "ApartmentDetailActivity")
                    }
                }

                if (sessionManager.isLoggedIn()) {
                    val statusResp = ApiClient.service.getFavoriteStatus(apartmentId)
                    val isFavorite = statusResp.body()
                        ?.getAsJsonObject("data")
                        ?.get("isFavorite")
                        ?.asBoolean
                        ?: false
                    renderFavoriteAction(actionFavorite, isFavoriteNow = isFavorite)
                }
            } catch (e: Exception) {
                Snackbar.make(title, e.message ?: getString(R.string.error_load_details), Snackbar.LENGTH_LONG).show()
            } finally {
                progress.isVisible = false
            }
        }
    }

    private fun bindExpandableDescription(
        descriptionView: TextView,
        toggleView: TextView,
        text: String?,
    ) {
        val value = text?.trim().orEmpty()
        descriptionView.text = value

        // Reset per-listing state
        isDescriptionExpanded = false
        applyDescriptionState(descriptionView, toggleView)

        descriptionView.post {
            val width = (descriptionView.width - descriptionView.paddingLeft - descriptionView.paddingRight)
                .coerceAtLeast(0)
            if (value.isBlank() || width <= 0) {
                toggleView.isVisible = false
                return@post
            }

            val layout = StaticLayout.Builder
                .obtain(value, 0, value.length, descriptionView.paint, width)
                .build()
            toggleView.isVisible = layout.lineCount > 4
            applyDescriptionState(descriptionView, toggleView)
        }

        toggleView.setOnClickListener {
            isDescriptionExpanded = !isDescriptionExpanded
            applyDescriptionState(descriptionView, toggleView)
        }
    }

    private fun applyDescriptionState(descriptionView: TextView, toggleView: TextView) {
        if (isDescriptionExpanded) {
            descriptionView.maxLines = Int.MAX_VALUE
            descriptionView.ellipsize = null
            toggleView.setText(R.string.detail_description_less)
        } else {
            descriptionView.maxLines = 4
            descriptionView.ellipsize = TextUtils.TruncateAt.END
            toggleView.setText(R.string.detail_description_more)
        }
    }

    private fun renderFavoriteAction(button: ImageButton, isFavoriteNow: Boolean) {
        button.setImageResource(if (isFavoriteNow) R.drawable.ic_nav_favorites_24 else R.drawable.ic_heart_outline_24)
        button.contentDescription = if (isFavoriteNow) {
            getString(R.string.favorite_remove)
        } else {
            getString(R.string.favorite_add)
        }
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

        val hasCoords = model.latitude != null && model.longitude != null
        locationCard.isClickable = hasCoords
        locationCard.isFocusable = hasCoords
        coordinatesText.isClickable = hasCoords
        coordinatesText.isFocusable = hasCoords

        if (hasCoords) {
            val openMap = View.OnClickListener {
                val intent = android.content.Intent(this@ApartmentDetailActivity, YandexMapActivity::class.java)
                intent.putExtra(YandexMapActivity.EXTRA_LAT, model.latitude!!)
                intent.putExtra(YandexMapActivity.EXTRA_LNG, model.longitude!!)
                intent.putExtra(YandexMapActivity.EXTRA_TITLE, model.locationText ?: model.city)
                startActivity(intent)
            }
            locationCard.setOnClickListener(openMap)
            coordinatesText.setOnClickListener(openMap)
        } else {
            locationCard.setOnClickListener(null)
            coordinatesText.setOnClickListener(null)
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
        val monthlyPayment = computeMonthlyPayment(loanAmount)

        mortgageLoanValue.text = formatCurrency(loanAmount)
        mortgageMonthlyValue.text = formatCurrency(monthlyPayment)
    }

    private fun computeEstimatedMonthly(model: ApartmentDetailModel): Double? {
        val price = model.priceValue ?: return null
        if (price <= 0) return null
        val loanAmount = price * 0.70
        return computeMonthlyPayment(loanAmount)
    }

    private fun computeMonthlyPayment(loanAmount: Double): Double {
        val annualRate = 0.045
        val months = 30 * 12
        val monthlyRate = annualRate / 12
        return if (monthlyRate == 0.0) {
            loanAmount / months
        } else {
            val factor = (1 + monthlyRate).pow(months.toDouble())
            loanAmount * monthlyRate * factor / (factor - 1)
        }
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
