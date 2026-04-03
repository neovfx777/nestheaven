package uz.nestheaven.mobile.core

data class LoginRequest(
    val email: String,
    val password: String,
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String,
    val phone: String? = null,
)

data class UserDto(
    val id: String,
    val email: String,
    val role: String,
    val isActive: Boolean? = true,
    val firstName: String? = null,
    val lastName: String? = null,
    val phone: String? = null,
    val createdAt: String? = null,
)

data class AuthResponse(
    val token: String,
    val user: UserDto,
)

data class RegisterResponse(
    val token: String? = null,
    val user: UserDto? = null,
    val success: Boolean? = null,
    val requiresEmailVerification: Boolean? = null,
    val email: String? = null,
    val message: String? = null,
)

data class BasicMessageResponse(
    val success: Boolean,
    val message: String,
)

data class ResendVerificationRequest(
    val email: String,
)

data class MeResponse(
    val user: UserDto,
)

data class ApartmentCardModel(
    val id: String,
    val title: String,
    val city: String,
    val priceText: String,
    val roomsText: String,
    val statusText: String,
    val imageUrl: String?,
    val statusRaw: String = "",
    val priceValue: Double? = null,
    val roomsValue: Int? = null,
    val areaValue: Double? = null,
    val floorValue: Int? = null,
    val createdAt: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
)

data class ComplexCardModel(
    val id: String,
    val title: String,
    val city: String,
    val blocksText: String,
    val ratingText: String,
    val imageUrl: String?,
)

data class ComplexMapMarkerModel(
    val id: String,
    val title: String,
    val lat: Double,
    val lng: Double,
)

data class BroadcastModel(
    val title: String,
    val message: String,
)

data class ApartmentDetailModel(
    val id: String,
    val title: String,
    val description: String,
    val city: String,
    val priceText: String,
    val priceValue: Double? = null,
    val roomsValue: Int? = null,
    val areaValue: Double? = null,
    val floorValue: Int? = null,
    val totalFloorsValue: Int? = null,
    val roomsText: String,
    val areaText: String,
    val floorText: String,
    val statusText: String,
    val imageUrl: String?,
    val complexId: String? = null,
    val complexTitle: String? = null,
    val locationText: String? = null,
    val developerText: String? = null,
    val blocksText: String? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val yearBuiltText: String? = null,
    val conditionText: String? = null,
    val walkabilityText: String? = null,
    val airQualityText: String? = null,
    val amenitiesText: List<String> = emptyList(),
)

data class ComplexDetailModel(
    val id: String,
    val title: String,
    val description: String,
    val city: String,
    val blocksText: String,
    val ratingText: String,
    val address: String? = null,
    val developer: String? = null,
    val blockCount: Int? = null,
    val apartmentCount: Int? = null,
    val walkability: Int? = null,
    val airQuality: Int? = null,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val amenities: List<String> = emptyList(),
    val nearbyPlaces: List<ComplexNearbyPlaceModel> = emptyList(),
    val permissions: ComplexPermissionsModel? = null,
    val images: List<ComplexImageModel> = emptyList(),
    val imageUrl: String?,
)

data class ComplexImageModel(
    val id: String,
    val url: String,
    val order: Int = 0,
)

data class ComplexNearbyPlaceModel(
    val name: String,
    val distanceMeters: Int? = null,
    val distanceKm: Double? = null,
    val type: String? = null,
    val note: String? = null,
)

data class ComplexPermissionsModel(
    val permission1Url: String? = null,
    val permission2Url: String? = null,
    val permission3Url: String? = null,
)

data class ConversationMessageModel(
    val id: String,
    val body: String,
    val senderId: String,
    val createdAt: String? = null,
)

data class ConversationSummaryModel(
    val id: String,
    val apartmentId: String? = null,
    val apartmentTitle: String? = null,
    val counterpartId: String? = null,
    val counterpartName: String = "",
    val counterpartPhone: String? = null,
    val lastMessage: ConversationMessageModel? = null,
    val updatedAt: String? = null,
)

data class ConversationDetailModel(
    val id: String,
    val apartmentId: String? = null,
    val apartmentTitle: String? = null,
    val counterpartId: String? = null,
    val counterpartName: String = "",
    val counterpartPhone: String? = null,
    val messages: List<ConversationMessageModel> = emptyList(),
)

data class SendMessageRequest(
    val apartmentId: String,
    val text: String,
)

data class SendToConversationRequest(
    val text: String,
)

data class AssistantHistoryItem(
    val role: String,
    val content: String,
)

data class ApartmentAssistantRequest(
    val message: String,
    val history: List<AssistantHistoryItem> = emptyList(),
    val language: String = "uz",
    val limit: Int = 5,
)

data class ApartmentAssistantEnvelope(
    val success: Boolean,
    val data: ApartmentAssistantPayload,
)

data class ApartmentAssistantPayload(
    val reply: String,
    val matches: List<ApartmentAssistantMatch> = emptyList(),
    val appliedFilters: Map<String, String> = emptyMap(),
    val source: String? = null,
    val totalCandidatesChecked: Int? = null,
)

data class ApartmentAssistantMatch(
    val id: String,
    val title: String,
    val price: Double? = null,
    val rooms: Int? = null,
    val area: Double? = null,
    val floor: Int? = null,
    val status: String? = null,
    val coverImage: String? = null,
    val complexName: String? = null,
    val city: String? = null,
    val locationText: String? = null,
    val metroDistanceMeters: Int? = null,
    val score: Double? = null,
    val url: String? = null,
)
