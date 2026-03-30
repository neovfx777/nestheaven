package uz.nestheaven.mobile.core

import android.content.Context
import android.content.Intent
import android.net.Uri

object MapLinks {
    private const val YANDEX_MAPS_PACKAGE = "ru.yandex.yandexmaps"

    fun openYandexMaps(
        context: Context,
        lat: Double,
        lng: Double,
        zoom: Int = 16,
    ) {
        val appUri = Uri.parse(
            "yandexmaps://maps.yandex.ru/?ll=$lng,$lat&z=$zoom&pt=$lng,$lat,pm2rdm"
        )
        val webUri = Uri.parse(
            "https://yandex.com/maps/?ll=$lng%2C$lat&z=$zoom&pt=$lng%2C$lat,pm2rdm"
        )

        val appIntent = Intent(Intent.ACTION_VIEW, appUri).apply {
            `package` = YANDEX_MAPS_PACKAGE
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        val pm = context.packageManager
        if (appIntent.resolveActivity(pm) != null) {
            context.startActivity(appIntent)
            return
        }

        context.startActivity(
            Intent(Intent.ACTION_VIEW, webUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            },
        )
    }
}

