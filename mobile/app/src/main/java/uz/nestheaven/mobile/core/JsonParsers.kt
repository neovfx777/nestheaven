package uz.nestheaven.mobile.core

import com.google.gson.JsonArray
import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
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
            val priceValue = obj.optNumber("price")
            val roomsValue = obj.optNumber("rooms")?.toInt()
            val areaValue = obj.optNumber("area")
            val floorValue = obj.optNumber("floor")?.toInt()
            val statusRaw = obj.optString("status")?.lowercase().orEmpty()
            val priceText = priceValue?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
            val roomsText = roomsValue?.let { formatRoomCount(it) } ?: "-"
            val statusText = normalizeStatus(statusRaw)
            val coverImage = obj.optString("coverImage")
                ?: obj.optArray("images")?.firstObject()?.optString("url")
                ?: complex?.optString("coverImage")
                ?: complex?.optArray("images")?.firstObject()?.optString("url")

            val latitude = complex?.optNumber("locationLat") ?: complex?.optNumber("latitude") ?: obj.optNumber("lat")
            val longitude = complex?.optNumber("locationLng") ?: complex?.optNumber("longitude") ?: obj.optNumber("lng")

            ApartmentCardModel(
                id = id,
                title = title.ifBlank { apartmentFallback() },
                city = city.ifBlank { unknownLabel() },
                priceText = priceText,
                roomsText = roomsText,
                statusText = statusText,
                imageUrl = resolveAssetUrl(coverImage),
                statusRaw = statusRaw,
                priceValue = priceValue,
                roomsValue = roomsValue,
                areaValue = areaValue,
                floorValue = floorValue,
                createdAt = obj.optString("createdAt"),
                latitude = latitude,
                longitude = longitude,
            )
        }
    }

    fun parseComplexes(root: JsonObject?): List<ComplexCardModel> {
        val complexes = root.optArray("data")
            ?: root.optObject("data").optArray("items")
            ?: return emptyList()
        return complexes.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null
            val title = localized(obj.get("title")).ifBlank { localized(obj.get("name")) }
            val city = obj.optString("city").orEmpty()
            val blocks = obj.optNumber("blockCount")?.toInt() ?: 0
            val walkability = obj.optNumber("walkability")?.toInt()
            val airQuality = obj.optNumber("airQuality")?.toInt()
            val ratingText = listOfNotNull(
                walkability?.let { "${walkabilityShortLabel()}: $it" },
                airQuality?.let { "${airQualityShortLabel()}: $it" },
            ).joinToString("  |  ").ifBlank { noRatingLabel() }
            val banner = obj.optString("coverImage")
                ?: obj.optArray("images")?.firstObject()?.optString("url")
                ?: obj.optString("bannerImage")
                ?: obj.optString("bannerImageUrl")

            ComplexCardModel(
                id = id,
                title = title.ifBlank { complexFallback() },
                city = city.ifBlank { unknownLabel() },
                blocksText = if (blocks > 0) formatBlockCount(blocks) else "-",
                ratingText = ratingText,
                imageUrl = resolveAssetUrl(banner),
            )
        }
    }

    fun parseComplexMapMarkers(root: JsonObject?): List<ComplexMapMarkerModel> {
        val complexes = root.optArray("data")
            ?: root.optObject("data").optArray("items")
            ?: return emptyList()

        return complexes.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null
            val title = localized(obj.get("title")).ifBlank { localized(obj.get("name")) }.ifBlank {
                complexFallback()
            }

            val location = obj.optObject("location")
            val lat = location.optNumber("lat") ?: obj.optNumber("locationLat") ?: obj.optNumber("lat")
            val lng = location.optNumber("lng") ?: obj.optNumber("locationLng") ?: obj.optNumber("lng")
            if (lat == null || lng == null) return@mapNotNull null

            ComplexMapMarkerModel(
                id = id,
                title = title,
                lat = lat,
                lng = lng,
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
            val priceValue = obj.optNumber("price")
            val roomsValue = obj.optNumber("rooms")?.toInt()
            val areaValue = obj.optNumber("area")
            val floorValue = obj.optNumber("floor")?.toInt()
            val statusRaw = obj.optString("status")?.lowercase().orEmpty()
            val priceText = priceValue?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
            val roomsText = roomsValue?.let { formatRoomCount(it) } ?: "-"
            val statusText = normalizeStatus(statusRaw)
            val coverImage = obj.optString("coverImage")
                ?: obj.optArray("images")?.firstObject()?.optString("url")

            val latitude = complex?.optNumber("locationLat") ?: complex?.optNumber("latitude") ?: obj.optNumber("lat")
            val longitude = complex?.optNumber("locationLng") ?: complex?.optNumber("longitude") ?: obj.optNumber("lng")

            ApartmentCardModel(
                id = id,
                title = title.ifBlank { apartmentFallback() },
                city = city.ifBlank { unknownLabel() },
                priceText = priceText,
                roomsText = roomsText,
                statusText = statusText,
                imageUrl = resolveAssetUrl(coverImage),
                statusRaw = statusRaw,
                priceValue = priceValue,
                roomsValue = roomsValue,
                areaValue = areaValue,
                floorValue = floorValue,
                createdAt = obj.optString("createdAt"),
                latitude = latitude,
                longitude = longitude,
            )
        }
    }

    fun parseBroadcasts(root: JsonObject?): List<BroadcastModel> {
        val list = root.optArray("data") ?: return emptyList()
        return list.mapNotNull { item ->
            val obj = item.optObject() ?: return@mapNotNull null
            val title = localized(obj.get("title")).ifBlank { listingFallback() }
            val message = localized(obj.get("message")).ifBlank { "" }
            BroadcastModel(title = title, message = message)
        }
    }

    fun parseApartmentDetail(root: JsonObject?): ApartmentDetailModel? {
        val obj = root.optObject("data") ?: return null
        val id = obj.optString("id") ?: return null
        val title = localized(obj.get("title")).ifBlank { apartmentFallback() }
        val description = localized(obj.get("description")).ifBlank { descriptionFallback() }
        val complex = obj.optObject("complex")
        val complexId = complex?.optString("id")
        val complexTitle = localized(complex?.get("title"))
            .ifBlank { localized(complex?.get("name")) }
            .ifBlank { null }
        val city = complex?.optString("city") ?: obj.optString("city").orEmpty()
        val priceValue = obj.optNumber("price")
        val priceText = priceValue?.let { "${moneyFormat.format(it)} UZS" } ?: "-"
        val roomsValue = obj.optNumber("rooms")?.toInt()
        val areaValue = obj.optNumber("area")
        val pricePerSquare = if (priceValue != null && areaValue != null && areaValue > 0) priceValue / areaValue else null
        val roomsText = roomsValue?.let { formatRoomCount(it) } ?: "-"
        val areaText = areaValue?.let { "${it} m2" } ?: "-"
        val floor = obj.optNumber("floor")?.toInt()
        val totalFloors = obj.optNumber("totalFloors")?.toInt()
        val floorText = if (floor != null && totalFloors != null) "$floor / $totalFloors" else floor?.toString() ?: "-"
        val statusText = normalizeStatus(obj.optString("status"))
        val image = obj.optArray("images")?.firstObject()?.optString("url") ?: obj.optString("coverImage")
        val locationText = complex?.optString("locationText")
            ?: localized(complex?.get("address"))
        val developerText = complex?.optString("developer")
        val blockCount = complex?.optNumber("blockCount")?.toInt()
        val blocksText = if (blockCount != null && blockCount > 0) formatBlockCount(blockCount) else null
        val latitude = complex?.optNumber("locationLat") ?: complex?.optNumber("latitude")
        val longitude = complex?.optNumber("locationLng") ?: complex?.optNumber("longitude")
        val yearBuiltText = obj.optNumber("readyByYear")?.toInt()?.toString()
            ?: complex?.optString("yearBuilt")
            ?: "2023"
        val conditionText = when (obj.optString("constructionStatus")?.lowercase()) {
            "available" -> availableCondition()
            "built" -> readyCondition()
            else -> readyCondition()
        }
        val walkabilityText = complex?.optNumber("walkabilityRating")?.toInt()?.let { "$it%" }
            ?: complex?.optNumber("walkabilityScore")?.toInt()?.let { "$it%" }
        val airQualityText = complex?.optNumber("airQualityRating")?.toInt()?.let { "$it%" }
            ?: complex?.optNumber("airQualityScore")?.toInt()?.let { "$it%" }
        val amenitiesText = complex?.optArray("amenities")
            ?.mapNotNull { it.optStringOrNull() }
            ?: emptyList()

        return ApartmentDetailModel(
            id = id,
            title = title,
            description = description,
            city = city.ifBlank { unknownLabel() },
            priceText = priceText,
            priceValue = priceValue,
            roomsValue = roomsValue,
            areaValue = areaValue,
            floorValue = floor,
            totalFloorsValue = totalFloors,
            roomsText = roomsText,
            areaText = areaText,
            floorText = floorText,
            statusText = statusText,
            imageUrl = resolveAssetUrl(image),
            complexId = complexId,
            complexTitle = complexTitle,
            locationText = locationText?.ifBlank { null },
            developerText = developerText?.ifBlank { null },
            blocksText = blocksText,
            latitude = latitude,
            longitude = longitude,
            yearBuiltText = yearBuiltText,
            conditionText = conditionText,
            walkabilityText = walkabilityText,
            airQualityText = airQualityText,
            amenitiesText = amenitiesText,
        )
    }

    fun parseComplexDetail(root: JsonObject?): ComplexDetailModel? {
        val obj = root.optObject("data") ?: return null
        val id = obj.optString("id") ?: return null
        val title = localized(obj.get("title")).ifBlank { localized(obj.get("name")) }.ifBlank { complexFallback() }
        val description = localized(obj.get("description")).ifBlank { descriptionFallback() }
        val city = obj.optString("city").orEmpty()
        val blocks = obj.optNumber("blockCount")?.toInt() ?: 0
        val walkability = obj.optNumber("walkability")?.toInt()
            ?: obj.optNumber("walkabilityRating")?.toInt()
        val airQuality = obj.optNumber("airQuality")?.toInt()
            ?: obj.optNumber("airQualityRating")?.toInt()
        val ratingText = listOfNotNull(
            walkability?.let { "${walkabilityLongLabel()}: $it" },
            airQuality?.let { "${airQualityLongLabel()}: $it" },
        ).joinToString("\n").ifBlank { noRatingLabel() }

        val amenities = obj.optArray("amenities")
            ?.mapNotNull { it.optStringOrNull() }
            ?: emptyList()

        val nearbyPlaces = parseNearbyPlaces(
            obj.optArray("nearbyPlaces") ?: obj.optArray("nearby"),
        )

        val permissions = parseComplexPermissions(obj)

        val images = obj.optArray("images")
            ?.mapNotNull { element ->
                val imageObj = element.optObject() ?: return@mapNotNull null
                val url = resolveAssetUrl(imageObj.optString("url")) ?: return@mapNotNull null
                ComplexImageModel(
                    id = imageObj.optString("id") ?: url,
                    url = url,
                    order = imageObj.optNumber("order")?.toInt()
                        ?: imageObj.optNumber("ord")?.toInt()
                        ?: 0,
                )
            }
            ?.sortedBy { it.order }
            ?: emptyList()

        val coverImage = obj.optString("coverImage")
            ?: images.firstOrNull()?.url
            ?: obj.optString("bannerImage")
            ?: obj.optString("bannerImageUrl")

        val address = localized(obj.get("locationText"))
            .ifBlank { localized(obj.optObject("location")?.get("address")) }
            .ifBlank { localized(obj.get("address")) }
            .ifBlank { obj.optString("locationText").orEmpty() }
            .ifBlank { obj.optString("address").orEmpty() }
            .ifBlank { "" }
            .ifBlank { null }

        val location = obj.optObject("location")
        val latitude = obj.optNumber("locationLat") ?: location.optNumber("lat") ?: obj.optNumber("latitude")
        val longitude = obj.optNumber("locationLng") ?: location.optNumber("lng") ?: obj.optNumber("longitude")

        val apartmentCount = obj.optObject("_count")?.optNumber("apartments")?.toInt()
            ?: obj.optNumber("apartmentCount")?.toInt()
            ?: obj.optNumber("apartmentsCount")?.toInt()

        return ComplexDetailModel(
            id = id,
            title = title,
            description = description,
            city = city.ifBlank { unknownLabel() },
            blocksText = if (blocks > 0) formatBlockCount(blocks) else "-",
            ratingText = ratingText,
            address = address,
            developer = obj.optString("developer")?.ifBlank { null },
            blockCount = obj.optNumber("blockCount")?.toInt(),
            apartmentCount = apartmentCount,
            walkability = walkability,
            airQuality = airQuality,
            latitude = latitude,
            longitude = longitude,
            amenities = amenities,
            nearbyPlaces = nearbyPlaces,
            permissions = permissions,
            images = images,
            imageUrl = resolveAssetUrl(coverImage),
        )
    }

    private fun parseNearbyPlaces(array: JsonArray?): List<ComplexNearbyPlaceModel> {
        if (array == null) return emptyList()
        return array.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val name = obj.optString("name").orEmpty().trim()
            if (name.isBlank()) return@mapNotNull null

            val distanceMeters = obj.optNumber("distanceMeters")?.toInt()
            val distanceKm = obj.optNumber("distanceKm")
            val type = obj.optString("type")?.ifBlank { null }
            val note = obj.optString("note")?.ifBlank { null }

            ComplexNearbyPlaceModel(
                name = name,
                distanceMeters = distanceMeters,
                distanceKm = distanceKm,
                type = type,
                note = note,
            )
        }
    }

    private fun parseComplexPermissions(obj: JsonObject): ComplexPermissionsModel? {
        val direct1 = resolveAssetUrl(obj.optString("permission1Url")) ?: resolveAssetUrl(obj.optString("permission1"))
        val direct2 = resolveAssetUrl(obj.optString("permission2Url")) ?: resolveAssetUrl(obj.optString("permission2"))
        val direct3 = resolveAssetUrl(obj.optString("permission3Url")) ?: resolveAssetUrl(obj.optString("permission3"))

        var parsed1: String? = null
        var parsed2: String? = null
        var parsed3: String? = null

        val permissionsElement = obj.get("permissions")
        val permissionsObj = when {
            permissionsElement == null || permissionsElement.isJsonNull -> null
            permissionsElement.isJsonObject -> permissionsElement.asJsonObject
            permissionsElement.isJsonPrimitive -> {
                val raw = runCatching { permissionsElement.asString }.getOrNull()
                if (raw.isNullOrBlank()) null
                else runCatching { JsonParser.parseString(raw) }.getOrNull()?.optObject()
            }
            else -> null
        }

        if (permissionsObj != null) {
            parsed1 = resolveAssetUrl(permissionsObj.optString("permission1"))
            parsed2 = resolveAssetUrl(permissionsObj.optString("permission2"))
            parsed3 = resolveAssetUrl(permissionsObj.optString("permission3"))
        }

        val p1 = direct1 ?: parsed1
        val p2 = direct2 ?: parsed2
        val p3 = direct3 ?: parsed3

        if (p1.isNullOrBlank() && p2.isNullOrBlank() && p3.isNullOrBlank()) return null
        return ComplexPermissionsModel(
            permission1Url = p1,
            permission2Url = p2,
            permission3Url = p3,
        )
    }

    fun parseConversations(root: JsonObject?, meId: String?): List<ConversationSummaryModel> {
        val conversations = root.optArray("data") ?: return emptyList()
        val normalizedMeId = meId?.trim().orEmpty()

        return conversations.mapNotNull { element ->
            val obj = element.optObject() ?: return@mapNotNull null
            val id = obj.optString("id") ?: return@mapNotNull null

            val apartmentObj = obj.optObject("apartment")
            val apartmentId = apartmentObj?.optString("id")
            val apartmentTitle = localized(apartmentObj?.get("title"))
                .ifBlank { apartmentObj?.optString("title").orEmpty() }
                .trim()
                .ifBlank { null }

            val userObj = obj.optObject("user")
            val realtorObj = obj.optObject("realtor")

            val userId = userObj?.optString("id").orEmpty()
            val counterpartObj = if (normalizedMeId.isNotBlank() && normalizedMeId == userId) realtorObj else userObj

            val counterpartId = counterpartObj?.optString("id")
            val counterpartName = counterpartObj?.optString("fullName")
                ?: buildFullName(counterpartObj)
            val counterpartPhone = counterpartObj?.optString("phone")

            val lastMessage = parseConversationMessage(obj.optObject("lastMessage"))

            ConversationSummaryModel(
                id = id,
                apartmentId = apartmentId,
                apartmentTitle = apartmentTitle,
                counterpartId = counterpartId,
                counterpartName = counterpartName.ifBlank { "-" },
                counterpartPhone = counterpartPhone,
                lastMessage = lastMessage,
                updatedAt = obj.optString("updatedAt"),
            )
        }
    }

    fun parseConversationDetail(root: JsonObject?, meId: String?): ConversationDetailModel? {
        val obj = root.optObject("data") ?: return null
        val id = obj.optString("id") ?: return null
        val normalizedMeId = meId?.trim().orEmpty()

        val apartmentObj = obj.optObject("apartment")
        val apartmentId = apartmentObj?.optString("id")
        val apartmentTitle = localized(apartmentObj?.get("title"))
            .ifBlank { apartmentObj?.optString("title").orEmpty() }
            .trim()
            .ifBlank { null }

        val userObj = obj.optObject("user")
        val realtorObj = obj.optObject("realtor")

        val userId = userObj?.optString("id").orEmpty()
        val counterpartObj = if (normalizedMeId.isNotBlank() && normalizedMeId == userId) realtorObj else userObj

        val counterpartId = counterpartObj?.optString("id")
        val counterpartName = counterpartObj?.optString("fullName")
            ?: buildFullName(counterpartObj)
        val counterpartPhone = counterpartObj?.optString("phone")

        val messages = obj.optArray("messages")
            ?.mapNotNull { parseConversationMessage(it.optObject()) }
            ?: emptyList()

        return ConversationDetailModel(
            id = id,
            apartmentId = apartmentId,
            apartmentTitle = apartmentTitle,
            counterpartId = counterpartId,
            counterpartName = counterpartName.ifBlank { "-" },
            counterpartPhone = counterpartPhone,
            messages = messages,
        )
    }

    fun localized(element: JsonElement?): String {
        if (element == null || element.isJsonNull) return ""
        if (element.isJsonPrimitive) {
            val value = element.asString
            val trimmed = value.trim()
            if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
                val parsed = runCatching { JsonParser.parseString(trimmed) }.getOrNull()
                if (parsed?.isJsonObject == true) {
                    val obj = parsed.asJsonObject
                    return AppLanguage.pick(
                        uz = obj.optString("uz"),
                        ru = obj.optString("ru"),
                        en = obj.optString("en"),
                    )
                }
            }
            return value
        }

        if (element.isJsonObject) {
            val obj = element.asJsonObject
            return AppLanguage.pick(
                uz = obj.optString("uz"),
                ru = obj.optString("ru"),
                en = obj.optString("en"),
            )
        }

        return ""
    }

    private fun buildFullName(user: JsonObject?): String {
        if (user == null) return ""
        val first = user.optString("firstName").orEmpty()
        val last = user.optString("lastName").orEmpty()
        return "$first $last".trim()
    }

    private fun parseConversationMessage(obj: JsonObject?): ConversationMessageModel? {
        if (obj == null) return null
        val id = obj.optString("id") ?: return null
        return ConversationMessageModel(
            id = id,
            body = obj.optString("body").orEmpty(),
            senderId = obj.optString("senderId").orEmpty(),
            createdAt = obj.optString("createdAt"),
        )
    }

    fun resolveAssetUrl(url: String?): String? {
        if (url.isNullOrBlank()) return null

        val trimmed = url.trim()
        val parsed = trimmed.toHttpUrlOrNull()
        val activeBase = ApiClient.activeBaseUrl.toHttpUrlOrNull()
        val origin = activeBase?.newBuilder()?.encodedPath("/")?.build()

        if (parsed != null && activeBase != null) {
            val localHosts = setOf("localhost", "127.0.0.1", "10.0.2.2", "10.0.3.2")
            val normalizedPath = when {
                parsed.encodedPath.startsWith("/api/uploads/") -> parsed.encodedPath
                parsed.encodedPath.startsWith("/uploads/") -> "/api${parsed.encodedPath}"
                else -> parsed.encodedPath
            }
            val builder = parsed.newBuilder().encodedPath(normalizedPath)
            if (parsed.host in localHosts) {
                builder.scheme(activeBase.scheme)
                    .host(activeBase.host)
                    .port(activeBase.port)
            }
            return builder.build().toString()
        }

        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed

        if (origin != null) {
            val rewritten = when {
                trimmed.startsWith("/api/uploads/") -> trimmed
                trimmed.startsWith("/uploads/") -> "/api$trimmed"
                trimmed.startsWith("uploads/") -> "/api/$trimmed"
                else -> trimmed
            }
            val resolved = origin.resolve(rewritten)?.toString()
            if (resolved != null) return resolved
        }

        val baseHost = ApiClient.activeBaseUrl.replace(Regex("/api/?$"), "")
        val rewritten = when {
            trimmed.startsWith("/api/uploads/") -> trimmed
            trimmed.startsWith("/uploads/") -> "/api$trimmed"
            trimmed.startsWith("uploads/") -> "/api/$trimmed"
            else -> trimmed
        }
        return if (rewritten.startsWith("/")) "$baseHost$rewritten" else "$baseHost/$rewritten"
    }

    private fun normalizeStatus(raw: String?): String {
        val normalized = raw?.trim()?.lowercase()
        return when (normalized) {
            "active" -> AppLanguage.translate("Faol", "Активно", "Active")
            "sold" -> AppLanguage.translate("Sotilgan", "Продано", "Sold")
            "hidden" -> AppLanguage.translate("Yashirin", "Скрыто", "Hidden")
            else -> if (raw.isNullOrBlank()) unknownLabel() else raw
        }
    }

    private fun apartmentFallback(): String =
        AppLanguage.translate("Kvartira", "Квартира", "Apartment")

    private fun complexFallback(): String =
        AppLanguage.translate("Kompleks", "Комплекс", "Complex")

    private fun listingFallback(): String =
        AppLanguage.translate("E'lon", "Объявление", "Listing")

    private fun descriptionFallback(): String =
        AppLanguage.translate("Tavsif berilmagan", "Описание не указано", "Description not provided")

    private fun unknownLabel(): String =
        AppLanguage.translate("Noma'lum", "Неизвестно", "Unknown")

    private fun noRatingLabel(): String =
        AppLanguage.translate("Reyting yo'q", "Нет рейтинга", "No rating")

    private fun notSpecifiedLabel(): String =
        AppLanguage.translate("Ko'rsatilmagan", "Не указано", "Not specified")

    private fun readyCondition(): String =
        AppLanguage.translate("Tayyor", "Готово", "Ready")

    private fun availableCondition(): String =
        AppLanguage.translate("Oq suvoq", "Предчистовая отделка", "White box")

    private fun formatRoomCount(count: Int): String =
        AppLanguage.translate("$count xonali", "$count-комн.", "$count-room")

    private fun formatBlockCount(count: Int): String =
        AppLanguage.translate("$count blok", "$count блок", "$count blocks")

    private fun walkabilityShortLabel(): String =
        AppLanguage.translate("Piyoda", "Пешком", "Walk")

    private fun airQualityShortLabel(): String =
        AppLanguage.translate("Havo", "Воздух", "Air")

    private fun walkabilityLongLabel(): String =
        AppLanguage.translate("Piyoda qulayligi", "Пешая доступность", "Walkability")

    private fun airQualityLongLabel(): String =
        AppLanguage.translate("Havo sifati", "Качество воздуха", "Air quality")

    private fun JsonElement?.optObject(): JsonObject? {
        if (this == null || this.isJsonNull || !this.isJsonObject) return null
        return this.asJsonObject
    }

    private fun JsonElement?.optStringOrNull(): String? {
        if (this == null || this.isJsonNull || !this.isJsonPrimitive) return null
        return runCatching { this.asString }.getOrNull()
    }

    private fun JsonArray.firstObject(): JsonObject? {
        if (size() == 0) return null
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
