package uz.nestheaven.mobile

import android.os.Bundle
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.appbar.MaterialToolbar
import com.yandex.mapkit.MapKitFactory
import com.yandex.mapkit.geometry.Point
import com.yandex.mapkit.map.CameraPosition
import com.yandex.mapkit.map.IconStyle
import com.yandex.mapkit.mapview.MapView
import com.yandex.runtime.image.ImageProvider
import uz.nestheaven.mobile.core.MapKitInitializer

class YandexMapActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_LAT = "extra_lat"
        const val EXTRA_LNG = "extra_lng"
        const val EXTRA_TITLE = "extra_title"
    }

    private var mapView: MapView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_yandex_map)

        val toolbar = findViewById<MaterialToolbar>(R.id.mapToolbar)
        toolbar.setNavigationOnClickListener { finish() }

        val container = findViewById<FrameLayout>(R.id.yandexMapContainer)
        if (!MapKitInitializer.ensureInitialized(this)) {
            // No API key; just show a simple message and keep the screen alive.
            container.removeAllViews()
            container.addView(
                TextView(this).apply {
                    text = getString(R.string.map_api_key_missing)
                    setTextColor(getColor(R.color.nh_text_secondary))
                    textAlignment = TextView.TEXT_ALIGNMENT_CENTER
                    textSize = 14f
                },
                FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT,
                ).apply {
                    gravity = android.view.Gravity.CENTER
                },
            )
            return
        }

        val lat = intent.getDoubleExtra(EXTRA_LAT, Double.NaN)
        val lng = intent.getDoubleExtra(EXTRA_LNG, Double.NaN)
        val title = intent.getStringExtra(EXTRA_TITLE).orEmpty()
        if (title.isNotBlank()) toolbar.title = title

        val mv = MapView(this)
        container.removeAllViews()
        container.addView(
            mv,
            FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT,
            ),
        )
        mapView = mv
        if (!lat.isFinite() || !lng.isFinite()) return

        val point = Point(lat, lng)
        mv.mapWindow.map.move(CameraPosition(point, 15.5f, 0f, 0f))

        val icon = ImageProvider.fromResource(this, R.drawable.ic_house_marker_green_24)
        val style = IconStyle().apply {
            anchor = android.graphics.PointF(0.5f, 1.0f)
        }

        mv.mapWindow.map.mapObjects.addPlacemark().apply {
            geometry = point
            setIcon(icon, style)
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
}
