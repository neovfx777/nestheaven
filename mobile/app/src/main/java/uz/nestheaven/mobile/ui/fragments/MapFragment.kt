package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Circle
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CameraListener
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.PlacemarkMapObject
import com.yandex.mapkit.map.TextStyle
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.ApartmentDetailActivity
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.BlockedListings
import uz.nestheaven.mobile.core.ApartmentCardModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.MapKitInitializer

class MapFragment : Fragment(R.layout.fragment_map) {

    private var mapView: MapView? = null
    private var cameraJob: Job? = null
    private var selectedApartmentId: String? = null
    private var allApartments: List<ApartmentCardModel> = emptyList()

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val progress = view.findViewById<ProgressBar>(R.id.mapProgress)
        val errorText = view.findViewById<TextView>(R.id.mapError)
        val countText = view.findViewById<TextView>(R.id.mapComplexCount)
        val container = view.findViewById<FrameLayout>(R.id.mapContainer)

        if (!MapKitInitializer.ensureInitialized(requireContext())) {
            progress.isVisible = false
            errorText.isVisible = true
            errorText.text = getString(R.string.map_api_key_missing)
            countText.isVisible = false
            container.removeAllViews()
            mapView = null
            return
        }

        val mv = MapView(requireContext())
        container.removeAllViews()
        container.addView(
            mv,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        mapView = mv

        // Default center: Tashkent
        val map = mv.mapWindow.map
        map.move(
            CameraPosition(Point(41.3111, 69.2797), 11.5f, 0f, 0f),
        )

        val markerIcon = ImageProvider.fromResource(requireContext(), R.drawable.ic_house_marker_green_24)
        val iconStyle = IconStyle().apply {
            anchor = android.graphics.PointF(0.5f, 1.0f)
        }

        progress.isVisible = true
        errorText.isVisible = false

        val cameraListener = CameraListener { _, _, _, finished ->
            if (!finished) return@CameraListener
            cameraJob?.cancel()
            cameraJob = viewLifecycleOwner.lifecycleScope.launch {
                delay(250)
                renderForCamera(countText, markerIcon, iconStyle)
            }
        }
        map.addCameraListener(cameraListener)

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = ApiClient.service.getApartments(page = 1, limit = 200)
                if (!response.isSuccessful) {
                    errorText.isVisible = true
                    errorText.text = getString(R.string.home_load_failed)
                    return@launch
                }

                val blocked = BlockedListings.getBlockedApartmentIds(requireContext())
                allApartments = JsonParsers.parseApartments(response.body())
                    .filterNot { blocked.contains(it.id) }
                    .filter { it.latitude != null && it.longitude != null }

                renderForCamera(countText, markerIcon, iconStyle)
            } catch (e: Exception) {
                errorText.isVisible = true
                errorText.text = e.message ?: getString(R.string.home_load_failed)
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

    private fun renderForCamera(
        countText: TextView,
        markerIcon: ImageProvider,
        iconStyle: IconStyle,
    ) {
        val mv = mapView ?: return
        val map = mv.mapWindow.map
        val vr = map.visibleRegion
        val center = map.cameraPosition.target

        // Dynamic radius: tied to current zoom (distance to visible region corner).
        val radiusMeters = distanceMeters(center, vr.topLeft)
            .coerceAtLeast(300.0)
            .coerceAtMost(25_000.0)

        val within = allApartments.filter { apt ->
            val lat = apt.latitude ?: return@filter false
            val lng = apt.longitude ?: return@filter false
            val d = distanceMeters(center, Point(lat, lng))
            d <= radiusMeters
        }

        val radiusKm = radiusMeters / 1000.0
        countText.text = "${within.size} ta e'lon • ${"%.1f".format(radiusKm)} km"

        val objects = map.mapObjects
        objects.clear()

        // Circle overlay
        objects.addCircle(Circle(center, radiusMeters.toFloat())).apply {
            strokeWidth = 2.5f
            strokeColor = Color.parseColor("#F9C300") // yellow accent
            fillColor = Color.parseColor("#33F9C300") // translucent yellow
        }

        within.forEach { apt ->
            val lat = apt.latitude ?: return@forEach
            val lng = apt.longitude ?: return@forEach
            val placemark = objects.addPlacemark().apply {
                geometry = Point(lat, lng)
                setIcon(markerIcon, iconStyle)
                userData = apt.id
            }
            configurePlacemarkLabel(placemark, apt)
            placemark.addTapListener(MapObjectTapListener { mapObject, _ ->
                val id = mapObject.userData as? String ?: return@MapObjectTapListener false
                val wasSelected = selectedApartmentId == id
                selectedApartmentId = id
                renderForCamera(countText, markerIcon, iconStyle)
                if (wasSelected) {
                    val intent = android.content.Intent(requireContext(), ApartmentDetailActivity::class.java)
                    intent.putExtra(ApartmentDetailActivity.EXTRA_APARTMENT_ID, id)
                    startActivity(intent)
                }
                true
            })
        }
    }

    private fun configurePlacemarkLabel(placemark: PlacemarkMapObject, apt: ApartmentCardModel) {
        val isSelected = selectedApartmentId == apt.id
        if (!isSelected) return

        val price = apt.priceText.trim().ifBlank { "-" }
        placemark.setText(
            price,
            TextStyle().apply {
                size = 12f
                color = Color.parseColor("#F9C300")
                outlineColor = Color.parseColor("#1A1A1A")
                outlineWidth = 2f
                placement = TextStyle.Placement.TOP
                offset = 6f
            },
        )
        placemark.zIndex = 10f
    }

    // Haversine distance (meters)
    private fun distanceMeters(a: Point, b: Point): Double {
        val r = 6371000.0
        val dLat = Math.toRadians(b.latitude - a.latitude)
        val dLon = Math.toRadians(b.longitude - a.longitude)
        val lat1 = Math.toRadians(a.latitude)
        val lat2 = Math.toRadians(b.latitude)
        val sinLat = Math.sin(dLat / 2)
        val sinLon = Math.sin(dLon / 2)
        val h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon
        return 2 * r * Math.asin(Math.sqrt(h))
    }
}
