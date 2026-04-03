package uz.nestheaven.mobile

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.button.MaterialButton
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import kotlinx.coroutines.launch
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.async
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.BlockedListings
import uz.nestheaven.mobile.core.ComplexNearbyPlaceModel
import uz.nestheaven.mobile.core.ImageLoading
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.MapKitInitializer
import uz.nestheaven.mobile.ui.adapters.ApartmentAdapter
import uz.nestheaven.mobile.ui.adapters.ComplexImagesAdapter

class ComplexDetailActivity : AppCompatActivity() {

    private var mapView: MapView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)

        setContentView(R.layout.activity_complex_detail)

        val toolbar = findViewById<MaterialToolbar>(R.id.complexDetailToolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        toolbar.setNavigationOnClickListener { finish() }

        val complexId = intent.getStringExtra(EXTRA_COMPLEX_ID)
        if (complexId.isNullOrBlank()) {
            finish()
            return
        }

        val image = findViewById<ImageView>(R.id.complexDetailCover)
        val ratingChip = findViewById<TextView>(R.id.complexDetailRatingChip)
        val title = findViewById<TextView>(R.id.complexDetailTitle)
        val address = findViewById<TextView>(R.id.complexDetailAddress)
        val city = findViewById<TextView>(R.id.complexDetailCity)
        val blocks = findViewById<TextView>(R.id.complexDetailBlocks)
        val developer = findViewById<TextView>(R.id.complexDetailDeveloper)
        val galleryRecycler = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.complexDetailGalleryRecycler)
        val apartmentsCountValue = findViewById<TextView>(R.id.complexDetailApartmentsCountValue)
        val walkabilityValue = findViewById<TextView>(R.id.complexDetailWalkabilityValue)
        val airQualityValue = findViewById<TextView>(R.id.complexDetailAirQualityValue)
        val description = findViewById<TextView>(R.id.complexDetailDescription)
        val progress = findViewById<ProgressBar>(R.id.complexDetailProgress)

        val locationCard = findViewById<com.google.android.material.card.MaterialCardView>(R.id.complexDetailLocationCard)
        val locationText = findViewById<TextView>(R.id.complexDetailLocationText)
        val coordinatesText = findViewById<TextView>(R.id.complexDetailCoordinates)
        val mapContainer = findViewById<android.widget.FrameLayout>(R.id.complexDetailMapContainer)
        val mapError = findViewById<TextView>(R.id.complexDetailMapError)

        val amenitiesCard = findViewById<com.google.android.material.card.MaterialCardView>(R.id.complexDetailAmenitiesCard)
        val amenitiesGroup = findViewById<ChipGroup>(R.id.complexDetailAmenitiesGroup)

        val nearbyCard = findViewById<com.google.android.material.card.MaterialCardView>(R.id.complexDetailNearbyCard)
        val nearbyContainer = findViewById<android.widget.LinearLayout>(R.id.complexDetailNearbyContainer)

        val permissionsCard = findViewById<com.google.android.material.card.MaterialCardView>(R.id.complexDetailPermissionsCard)
        val permissionsContainer = findViewById<android.widget.LinearLayout>(R.id.complexDetailPermissionsContainer)

        val apartmentsCard = findViewById<com.google.android.material.card.MaterialCardView>(R.id.complexDetailApartmentsCard)
        val apartmentsTitle = findViewById<TextView>(R.id.complexDetailApartmentsTitle)
        val apartmentsRecycler = findViewById<androidx.recyclerview.widget.RecyclerView>(R.id.complexDetailApartmentsRecycler)
        val apartmentsEmpty = findViewById<TextView>(R.id.complexDetailApartmentsEmpty)

        val galleryAdapter = ComplexImagesAdapter()
        galleryRecycler.layoutManager = LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false)
        galleryRecycler.adapter = galleryAdapter
        galleryRecycler.isNestedScrollingEnabled = false

        val apartmentsAdapter = ApartmentAdapter(
            onItemClick = { model ->
                val intent = Intent(this, ApartmentDetailActivity::class.java)
                intent.putExtra(ApartmentDetailActivity.EXTRA_APARTMENT_ID, model.id)
                startActivity(intent)
            },
            onFavoriteClick = null,
        )
        apartmentsAdapter.setBlockedIds(BlockedListings.getBlockedApartmentIds(this))
        apartmentsRecycler.layoutManager = LinearLayoutManager(this)
        apartmentsRecycler.adapter = apartmentsAdapter
        apartmentsRecycler.isNestedScrollingEnabled = false

        lifecycleScope.launch {
            progress.isVisible = true
            try {
                val (complexResponse, apartmentsResponse) = supervisorScope {
                    val complexDeferred = async { ApiClient.service.getComplexById(complexId) }
                    val apartmentsDeferred = async { ApiClient.service.getApartments(page = 1, limit = 100, complexId = complexId) }
                    complexDeferred.await() to apartmentsDeferred.await()
                }

                val model = if (complexResponse.isSuccessful) JsonParsers.parseComplexDetail(complexResponse.body()) else null
                val apartments = if (apartmentsResponse.isSuccessful) JsonParsers.parseApartments(apartmentsResponse.body()) else emptyList()

                if (model != null) {
                    supportActionBar?.title = model.title
                    title.text = model.title
                    address.text = model.address.orEmpty()
                    address.isVisible = !model.address.isNullOrBlank()
                    city.text = model.city
                    blocks.text = getString(
                        R.string.detail_location_blocks,
                        model.blockCount?.toString() ?: model.blocksText,
                    )

                    if (!model.developer.isNullOrBlank()) {
                        developer.isVisible = true
                        developer.text = getString(R.string.detail_location_developer, model.developer)
                    } else {
                        developer.isVisible = false
                    }

                    apartmentsCountValue.text = (model.apartmentCount ?: apartments.size).toString()
                    walkabilityValue.text = model.walkability?.let { "$it/10" } ?: "-"
                    airQualityValue.text = model.airQuality?.let { "$it/10" } ?: "-"

                    val chipText = buildRatingChipText(model.walkability, model.airQuality)
                    ratingChip.text = chipText.orEmpty()
                    ratingChip.isVisible = !chipText.isNullOrBlank()

                    description.text = model.description
                    ImageLoading.load(image, model.imageUrl, caller = "ComplexDetailActivity")

                    val galleryItems = model.images
                        .filter { it.url.isNotBlank() }
                        .distinctBy { it.url }
                    if (galleryItems.size > 1) {
                        galleryRecycler.isVisible = true
                        galleryAdapter.submitList(galleryItems)
                    } else {
                        galleryRecycler.isVisible = false
                        galleryAdapter.submitList(emptyList())
                    }

                    bindAmenities(amenitiesCard, amenitiesGroup, model.amenities)
                    bindNearbyPlaces(nearbyCard, nearbyContainer, model.nearbyPlaces)
                    bindPermissions(permissionsCard, permissionsContainer, model.permissions)
                    bindLocation(
                        locationCard = locationCard,
                        locationText = locationText,
                        coordinatesText = coordinatesText,
                        mapContainer = mapContainer,
                        mapError = mapError,
                        title = model.title,
                        address = model.address,
                        lat = model.latitude,
                        lng = model.longitude,
                    )
                }

                // Apartments list
                apartmentsTitle.text = getString(
                    R.string.complex_detail_apartments_in_complex_title,
                ) + " (${apartments.size})"
                apartmentsAdapter.submitList(apartments)
                apartmentsEmpty.isVisible = apartments.isEmpty()
                apartmentsRecycler.isVisible = apartments.isNotEmpty()
                apartmentsCard.isVisible = true
            } catch (e: Exception) {
                Snackbar.make(title, e.message ?: getString(R.string.error_load_details), Snackbar.LENGTH_LONG).show()
            } finally {
                progress.isVisible = false
            }
        }
    }

    override fun onStart() {
        super.onStart()
        if (mapView != null) {
            MapKitFactory.getInstance().onStart()
            mapView?.onStart()
        }
    }

    override fun onStop() {
        if (mapView != null) {
            mapView?.onStop()
            MapKitFactory.getInstance().onStop()
        }
        super.onStop()
    }

    private fun bindAmenities(
        card: com.google.android.material.card.MaterialCardView,
        group: ChipGroup,
        amenities: List<String>,
    ) {
        group.removeAllViews()
        if (amenities.isEmpty()) {
            card.isVisible = false
            return
        }

        card.isVisible = true
        amenities.distinct().take(50).forEach { id ->
            val chip = Chip(this).apply {
                text = humanizeAmenity(id)
                isCheckable = false
                setEnsureMinTouchTargetSize(false)
                setTextColor(getColor(R.color.nh_success_fg))
                chipBackgroundColor = android.content.res.ColorStateList.valueOf(getColor(R.color.nh_success_bg))
            }
            group.addView(chip)
        }
    }

    private fun bindNearbyPlaces(
        card: com.google.android.material.card.MaterialCardView,
        container: android.widget.LinearLayout,
        places: List<ComplexNearbyPlaceModel>,
    ) {
        container.removeAllViews()
        if (places.isEmpty()) {
            card.isVisible = false
            return
        }

        card.isVisible = true
        val inflater = LayoutInflater.from(this)
        places.take(30).forEach { place ->
            val row = inflater.inflate(R.layout.item_complex_nearby_place, container, false)
            val name = row.findViewById<TextView>(R.id.nearbyPlaceName)
            val meta = row.findViewById<TextView>(R.id.nearbyPlaceMeta)
            name.text = place.name
            meta.text = buildNearbyMeta(place)
            container.addView(row)
        }
    }

    private fun bindPermissions(
        card: com.google.android.material.card.MaterialCardView,
        container: android.widget.LinearLayout,
        permissions: uz.nestheaven.mobile.core.ComplexPermissionsModel?,
    ) {
        container.removeAllViews()
        if (permissions == null) {
            card.isVisible = false
            return
        }

        val entries = listOf(
            getString(R.string.complex_detail_permission_1) to permissions.permission1Url,
            getString(R.string.complex_detail_permission_2) to permissions.permission2Url,
            getString(R.string.complex_detail_permission_3) to permissions.permission3Url,
        ).filter { (_, url) -> !url.isNullOrBlank() }

        if (entries.isEmpty()) {
            card.isVisible = false
            return
        }

        card.isVisible = true
        entries.forEach { (label, url) ->
            val button = MaterialButton(this, null, com.google.android.material.R.attr.materialButtonOutlinedStyle).apply {
                text = label
                icon = androidx.core.content.ContextCompat.getDrawable(this@ComplexDetailActivity, R.drawable.ic_document_24)
                iconPadding = 12
                isAllCaps = false
                setOnClickListener { openUrl(url!!) }
            }
            container.addView(button)
        }
    }

    private fun bindLocation(
        locationCard: com.google.android.material.card.MaterialCardView,
        locationText: TextView,
        coordinatesText: TextView,
        mapContainer: android.widget.FrameLayout,
        mapError: TextView,
        title: String,
        address: String?,
        lat: Double?,
        lng: Double?,
    ) {
        if (lat == null || lng == null) {
            locationCard.isVisible = false
            return
        }

        locationCard.isVisible = true
        locationText.text = address.orEmpty()

        coordinatesText.isVisible = true
        coordinatesText.text = getString(R.string.detail_location_coordinates, lat, lng)

        if (!MapKitInitializer.ensureInitialized(this)) {
            mapError.isVisible = true
            mapError.text = getString(R.string.map_api_key_missing)
            mapContainer.removeAllViews()
            mapView = null
            return
        }

        mapError.isVisible = false

        val mv = MapView(this)
        mapContainer.removeAllViews()
        mapContainer.addView(
            mv,
            android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        mapView = mv

        val map = mv.mapWindow.map
        map.move(CameraPosition(Point(lat, lng), 15.5f, 0f, 0f))

        val markerIcon = ImageProvider.fromResource(this, R.drawable.ic_house_marker_green_24)
        val iconStyle = IconStyle().apply { anchor = android.graphics.PointF(0.5f, 1.0f) }
        map.mapObjects.clear()
        map.mapObjects.addPlacemark().apply {
            geometry = Point(lat, lng)
            setIcon(markerIcon, iconStyle)
        }
    }

    private fun buildRatingChipText(walkability: Int?, airQuality: Int?): String? {
        val parts = mutableListOf<String>()
        if (walkability != null) parts.add("${getString(R.string.detail_walkability_label)} $walkability/10")
        if (airQuality != null) parts.add("${getString(R.string.detail_air_quality_label)} $airQuality/10")
        return parts.joinToString(" • ").ifBlank { null }
    }

    private fun buildNearbyMeta(place: ComplexNearbyPlaceModel): String {
        val distance = when {
            place.distanceMeters != null -> "${place.distanceMeters} m"
            place.distanceKm != null -> "${"%.1f".format(place.distanceKm)} km"
            else -> ""
        }
        val type = place.type?.trim().orEmpty()
        val note = place.note?.trim().orEmpty()

        return listOf(distance, type, note)
            .filter { it.isNotBlank() }
            .joinToString("  |  ")
            .ifBlank { "-" }
    }

    private fun humanizeAmenity(id: String): String {
        val trimmed = id.trim()
        if (trimmed.isBlank()) return trimmed
        val spaced = trimmed
            .replace(Regex("([a-z])([A-Z])"), "$1 $2")
            .replace("_", " ")
        return spaced.replaceFirstChar { if (it.isLowerCase()) it.titlecase() else it.toString() }
    }

    private fun openUrl(url: String) {
        runCatching {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }.onFailure {
            Snackbar.make(findViewById(android.R.id.content), getString(R.string.error_open_link), Snackbar.LENGTH_LONG).show()
        }
    }

    companion object {
        const val EXTRA_COMPLEX_ID = "extra_complex_id"
    }
}
