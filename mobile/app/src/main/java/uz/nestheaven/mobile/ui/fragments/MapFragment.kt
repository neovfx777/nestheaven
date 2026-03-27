package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.map.MapObjectTapListener
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.ComplexDetailActivity
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers

class MapFragment : Fragment(R.layout.fragment_map) {

    private var mapView: MapView? = null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val progress = view.findViewById<ProgressBar>(R.id.mapProgress)
        val errorText = view.findViewById<TextView>(R.id.mapError)
        val countText = view.findViewById<TextView>(R.id.mapComplexCount)
        val mv = view.findViewById<MapView>(R.id.mapView)
        mapView = mv

        // Default center: Tashkent
        mv.mapWindow.map.move(
            CameraPosition(Point(41.3111, 69.2797), 11.5f, 0f, 0f),
        )

        val markerIcon = ImageProvider.fromResource(requireContext(), R.drawable.ic_house_marker_green_24)
        val iconStyle = IconStyle().apply {
            anchor = android.graphics.PointF(0.5f, 1.0f)
        }

        progress.isVisible = true
        errorText.isVisible = false

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = ApiClient.service.getComplexes(page = 1, limit = 200)
                if (!response.isSuccessful) {
                    errorText.isVisible = true
                    errorText.text = getString(R.string.home_load_failed)
                    return@launch
                }

                val markers = JsonParsers.parseComplexMapMarkers(response.body())
                countText.text = "${markers.size} ta kompleks"

                val objects = mv.mapWindow.map.mapObjects
                objects.clear()

                val tapListener = MapObjectTapListener { mapObject, _ ->
                    val id = mapObject.userData as? String ?: return@MapObjectTapListener false
                    val intent = android.content.Intent(requireContext(), ComplexDetailActivity::class.java)
                    intent.putExtra(ComplexDetailActivity.EXTRA_COMPLEX_ID, id)
                    startActivity(intent)
                    true
                }

                markers.forEach { marker ->
                    objects.addPlacemark().apply {
                        geometry = Point(marker.lat, marker.lng)
                        setIcon(markerIcon, iconStyle)
                        userData = marker.id
                        addTapListener(tapListener)
                    }
                }
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
        MapKitFactory.getInstance().onStart()
        mapView?.onStart()
    }

    override fun onStop() {
        mapView?.onStop()
        MapKitFactory.getInstance().onStop()
        super.onStop()
    }
}
