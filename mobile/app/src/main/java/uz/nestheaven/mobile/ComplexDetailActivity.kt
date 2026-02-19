package uz.nestheaven.mobile

import android.os.Bundle
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import com.bumptech.glide.Glide
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers

class ComplexDetailActivity : AppCompatActivity() {

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

        val image = findViewById<ImageView>(R.id.complexDetailImage)
        val title = findViewById<TextView>(R.id.complexDetailTitle)
        val city = findViewById<TextView>(R.id.complexDetailCity)
        val blocks = findViewById<TextView>(R.id.complexDetailBlocks)
        val rating = findViewById<TextView>(R.id.complexDetailRating)
        val amenities = findViewById<TextView>(R.id.complexDetailAmenities)
        val nearby = findViewById<TextView>(R.id.complexDetailNearby)
        val description = findViewById<TextView>(R.id.complexDetailDescription)
        val progress = findViewById<ProgressBar>(R.id.complexDetailProgress)

        lifecycleScope.launch {
            progress.isVisible = true
            try {
                val response = ApiClient.service.getComplexById(complexId)
                if (response.isSuccessful) {
                    val model = JsonParsers.parseComplexDetail(response.body())
                    if (model != null) {
                        supportActionBar?.title = model.title
                        title.text = model.title
                        city.text = model.city
                        blocks.text = model.blocksText
                        rating.text = model.ratingText
                        amenities.text = model.amenitiesText
                        nearby.text = model.nearbyText
                        description.text = model.description

                        Glide.with(this@ComplexDetailActivity)
                            .load(model.imageUrl)
                            .placeholder(R.drawable.placeholder_image)
                            .error(R.drawable.placeholder_image)
                            .centerCrop()
                            .into(image)
                    }
                }
            } catch (e: Exception) {
                Snackbar.make(title, e.message ?: getString(R.string.error_load_details), Snackbar.LENGTH_LONG).show()
            } finally {
                progress.isVisible = false
            }
        }
    }

    companion object {
        const val EXTRA_COMPLEX_ID = "extra_complex_id"
    }
}
