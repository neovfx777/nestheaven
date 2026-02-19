package uz.nestheaven.mobile.core

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import uz.nestheaven.mobile.BuildConfig
import java.text.DecimalFormat

object JsonParsers {
    private val moneyFormat = DecimalFormat("#,###")

    fun parseApartments(root: JsonObject?): List<ApartmentCardModel> {
        val apartments = root.optObject("data").optArray("apartments") ?: return emptyList()
        return apartments.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null

            val title = localized(obj.get("title"))
            val complex = obj.optObject("complex")
            val city = complex?.optString("city") ?: obj.optString("city").orEmpty()
            val priceText = obj.optNumber("price")?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
            val roomsText = obj.optNumber("rooms")?.let { "${it.toInt()} xonali" } ?: "-"
            val statusText = normalizeStatus(obj.optString("status"))
            val coverImage = obj.optString("coverImage")
                ?: obj.optArray("images")?.firstObject()?.optString("url")
                ?: complex?.optString("bannerImageUrl")

            ApartmentCardModel(
                id = id,
                title = title.ifBlank { "Kvartira" },
                city = city.ifBlank { "Noma'lum" },
                priceText = priceText,
                roomsText = roomsText,
                statusText = statusText,
                imageUrl = resolveAssetUrl(coverImage),
            )
        }
    }

    fun parseComplexes(root: JsonObject?): List<ComplexCardModel> {
        val complexes = root.optArray("data") ?: return emptyList()
        return complexes.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null
            val title = localized(obj.get("title")).ifBlank { localized(obj.get("name")) }
            val city = obj.optString("city").orEmpty()
            val blocks = obj.optNumber("blockCount")?.toInt() ?: 0
            val walkability = obj.optNumber("walkability")?.toInt()
            val airQuality = obj.optNumber("airQuality")?.toInt()
            val ratingText = listOfNotNull(
                walkability?.let { "Walk: $it" },
                airQuality?.let { "Air: $it" },
            ).joinToString("  |  ").ifBlank { "Reyting yo'q" }
            val banner = obj.optString("bannerImage") ?: obj.optString("bannerImageUrl")

            ComplexCardModel(
                id = id,
                title = title.ifBlank { "Kompleks" },
                city = city.ifBlank { "Noma'lum" },
                blocksText = if (blocks > 0) "$blocks blok" else "-",
                ratingText = ratingText,
                imageUrl = resolveAssetUrl(banner),
            )
        }
    }

    fun parseFavoriteApartmentIds(root: JsonObject?): Set<String> {
        val apartments = root.optObject("data").optArray("apartments") ?: return emptySet()
        return apartments.mapNotNull { it.optObject()?.optString("id") }.toSet()
    }

    fun parseFavorites(root: JsonObject?): List<ApartmentCardModel> {
        val apartments = root.optObject("data").optArray("apartments") ?: return emptyList()
        return apartments.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null
            val title = localized(obj.get("title"))
            val complex = obj.optObject("complex")
            val city = complex?.optString("city") ?: obj.optString("city").orEmpty()
            val priceText = obj.optNumber("price")?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
            val roomsText = obj.optNumber("rooms")?.let { "${it.toInt()} xonali" } ?: "-"
            val statusText = normalizeStatus(obj.optString("status"))
            val coverImage = obj.optString("coverImage")
                ?: obj.optArray("images")?.firstObject()?.optString("url")

            ApartmentCardModel(
                id = id,
                title = title.ifBlank { "Kvartira" },
                city = city.ifBlank { "Noma'lum" },
                priceText = priceText,
                roomsText = roomsText,
                statusText = statusText,
                imageUrl = resolveAssetUrl(coverImage),
            )
        }
    }

    fun parseBroadcasts(root: JsonObject?): List<BroadcastModel> {
        val list = root.optArray("data") ?: return emptyList()
        return list.mapNotNull { item ->
            val obj = item.optObject() ?: return@mapNotNull null
            val title = localized(obj.get("title")).ifBlank { "E'lon" }
            val message = localized(obj.get("message")).ifBlank { "" }
            BroadcastModel(title = title, message = message)
        }
    }

    fun parseApartmentDetail(root: JsonObject?): ApartmentDetailModel? {
        val obj = root.optObject("data") ?: return null
        val id = obj.optString("id") ?: return null
        val title = localized(obj.get("title")).ifBlank { "Kvartira" }
        val description = localized(obj.get("description")).ifBlank { "Tavsif berilmagan" }
        val complex = obj.optObject("complex")
        val city = complex?.optString("city") ?: obj.optString("city").orEmpty()
        val priceText = obj.optNumber("price")?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
        val roomsText = obj.optNumber("rooms")?.let { "${it.toInt()} xonali" } ?: "-"
        val areaText = obj.optNumber("area")?.let { "${it} m2" } ?: "-"
        val floor = obj.optNumber("floor")?.toInt()
        val totalFloors = obj.optNumber("totalFloors")?.toInt()
        val floorText = if (floor != null && totalFloors != null) "$floor / $totalFloors" else floor?.toString() ?: "-"
        val statusText = normalizeStatus(obj.optString("status"))
        val image = obj.optArray("images")?.firstObject()?.optString("url") ?: obj.optString("coverImage")

        return ApartmentDetailModel(
            id = id,
            title = title,
            description = description,
            city = city.ifBlank { "Noma'lum" },
            priceText = priceText,
            roomsText = roomsText,
            areaText = areaText,
            floorText = floorText,
            statusText = statusText,
            imageUrl = resolveAssetUrl(image),
        )
    }

    fun parseComplexDetail(root: JsonObject?): ComplexDetailModel? {
        val obj = root.optObject("data") ?: return null
        val id = obj.optString("id") ?: return null
        val title = localized(obj.get("title")).ifBlank { localized(obj.get("name")) }.ifBlank { "Kompleks" }
        val description = localized(obj.get("description")).ifBlank { "Tavsif berilmagan" }
        val city = obj.optString("city").orEmpty()
        val blocks = obj.optNumber("blockCount")?.toInt() ?: 0
        val walkability = obj.optNumber("walkability")?.toInt()
        val airQuality = obj.optNumber("airQuality")?.toInt()
        val ratingText = listOfNotNull(
            walkability?.let { "Walkability: $it" },
            airQuality?.let { "Air quality: $it" },
        ).joinToString("\n").ifBlank { "Reyting yo'q" }

        val amenities = obj.optArray("amenities")
            ?.mapNotNull { it.optStringOrNull() }
            ?.joinToString(", ")
            ?.ifBlank { "Ko'rsatilmagan" }
            ?: "Ko'rsatilmagan"

        val nearby = obj.optArray("nearby")
            ?.mapNotNull { it.optObject()?.optString("name") }
            ?.joinToString(", ")
            ?.ifBlank { "Ko'rsatilmagan" }
            ?: "Ko'rsatilmagan"

        val banner = obj.optString("bannerImage") ?: obj.optString("bannerImageUrl")

        return ComplexDetailModel(
            id = id,
            title = title,
            description = description,
            city = city.ifBlank { "Noma'lum" },
            blocksText = if (blocks > 0) "$blocks blok" else "-",
            ratingText = ratingText,
            amenitiesText = amenities,
            nearbyText = nearby,
            imageUrl = resolveAssetUrl(banner),
        )
    }

    fun localized(element: JsonElement?): String {
        if (element == null || element.isJsonNull) return ""
        if (element.isJsonPrimitive) return element.asString

        if (element.isJsonObject) {
            val obj = element.asJsonObject
            return obj.optString("uz")
                ?: obj.optString("ru")
                ?: obj.optString("en")
                ?: ""
        }

        return ""
    }

    fun resolveAssetUrl(url: String?): String? {
        if (url.isNullOrBlank()) return null
        if (url.startsWith("http://") || url.startsWith("https://")) return url

        val baseHost = BuildConfig.API_BASE_URL.replace(Regex("/api/?$"), "")
        return if (url.startsWith("/")) "$baseHost$url" else "$baseHost/$url"
    }

    private fun normalizeStatus(raw: String?): String {
        return when (raw?.lowercase()) {
            "active" -> "Faol"
            "sold" -> "Sotilgan"
            "hidden" -> "Yashirilgan"
            else -> raw ?: "Noma'lum"
        }
    }

    private fun JsonElement?.optObject(): JsonObject? {
        if (this == null || this.isJsonNull || !this.isJsonObject) return null
        return this.asJsonObject
    }

    private fun JsonElement?.optStringOrNull(): String? {
        if (this == null || this.isJsonNull || !this.isJsonPrimitive) return null
        return runCatching { this.asString }.getOrNull()
    }

    private fun JsonArray.firstObject(): JsonObject? {
        if (isEmpty) return null
        return this[0].optObject()
    }

    private fun JsonObject?.optObject(name: String): JsonObject? {
        if (this == null || !this.has(name)) return null
        return this[name].optObject()
    }

    private fun JsonObject?.optArray(name: String): JsonArray? {
        if (this == null || !this.has(name)) return null
        val element = this[name]
        if (element == null || element.isJsonNull || !element.isJsonArray) return null
        return element.asJsonArray
    }

    private fun JsonObject?.optString(name: String): String? {
        if (this == null || !this.has(name)) return null
        val element = this[name]
        if (element == null || element.isJsonNull || !element.isJsonPrimitive) return null
        return runCatching { element.asString }.getOrNull()
    }

    private fun JsonObject?.optNumber(name: String): Double? {
        if (this == null || !this.has(name)) return null
        val element = this[name]
        if (element == null || element.isJsonNull || !element.isJsonPrimitive) return null
        return runCatching { element.asDouble }.getOrNull()
    }
}
