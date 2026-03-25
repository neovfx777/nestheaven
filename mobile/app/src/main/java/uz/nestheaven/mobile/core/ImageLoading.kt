package uz.nestheaven.mobile.core

import android.graphics.drawable.Drawable
import android.util.Log
import android.widget.ImageView
import androidx.annotation.DrawableRes
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import uz.nestheaven.mobile.BuildConfig
import uz.nestheaven.mobile.R

object ImageLoading {
    private const val TAG = "ImageLoading"

    fun load(
        imageView: ImageView,
        url: String?,
        caller: String,
        @DrawableRes placeholder: Int = R.drawable.placeholder_image,
    ) {
        val request = Glide.with(imageView)
            .load(url)
            .placeholder(placeholder)
            .error(placeholder)
            .centerCrop()

        if (BuildConfig.DEBUG) {
            request.listener(
                object : RequestListener<Drawable> {
                    override fun onLoadFailed(
                        e: GlideException?,
                        model: Any?,
                        target: Target<Drawable>,
                        isFirstResource: Boolean,
                    ): Boolean {
                        val rootCauses = e?.rootCauses
                            ?.joinToString(" | ") { cause -> "${cause.javaClass.simpleName}: ${cause.message}" }
                        Log.w(TAG, "[$caller] Image load failed url=$url model=$model rootCauses=$rootCauses", e)
                        return false
                    }

                    override fun onResourceReady(
                        resource: Drawable,
                        model: Any,
                        target: Target<Drawable>?,
                        dataSource: DataSource,
                        isFirstResource: Boolean,
                    ): Boolean {
                        return false
                    }
                },
            )
        }

        request.into(imageView)
    }
}

