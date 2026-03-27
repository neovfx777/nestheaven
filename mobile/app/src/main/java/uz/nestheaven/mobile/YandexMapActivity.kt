package uz.nestheaven.mobile

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider

class YandexMapActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_LAT = "extra_lat"
        const val EXTRA_LNG = "extra_lng"
        const val EXTRA_TITLE = "extra_title"
    }

    private lateinit var mapView: MapView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_yandex_map)

        val toolbar = findViewById<MaterialToolbar>(R.id.mapToolbar)
        toolbar.setNavigationOnClickListener { finish() }

        val lat = intent.getDoubleExtra(EXTRA_LAT, Double.NaN)
        val lng = intent.getDoubleExtra(EXTRA_LNG, Double.NaN)
        val title = intent.getStringExtra(EXTRA_TITLE).orEmpty()
        if (title.isNotBlank()) toolbar.title = title

        mapView = findViewById(R.id.yandexMapView)
        if (!lat.isFinite() || !lng.isFinite()) return

        val point = Point(lat, lng)
        mapView.mapWindow.map.move(CameraPosition(point, 15.5f, 0f, 0f))

        val icon = ImageProvider.fromResource(this, R.drawable.ic_house_marker_green_24)
        val style = IconStyle().apply {
            anchor = android.graphics.PointF(0.5f, 1.0f)
        }

        mapView.mapWindow.map.mapObjects.addPlacemark().apply {
            geometry = point
            setIcon(icon, style)
        }
    }

    override fun onStart() {
        super.onStart()
        MapKitFactory.getInstance().onStart()
        mapView.onStart()
    }

    override fun onStop() {
        mapView.onStop()
        MapKitFactory.getInstance().onStop()
        super.onStop()
    }
}

