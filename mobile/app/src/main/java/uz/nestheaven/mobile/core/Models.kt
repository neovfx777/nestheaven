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
    val createdAt: String? = null,
)

data class ComplexCardModel(
    val id: String,
    val title: String,
    val city: String,
    val blocksText: String,
    val ratingText: String,
    val imageUrl: String?,
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
    val roomsText: String,
    val areaText: String,
    val floorText: String,
    val statusText: String,
    val imageUrl: String?,
)

data class ComplexDetailModel(
    val id: String,
    val title: String,
    val description: String,
    val city: String,
    val blocksText: String,
    val ratingText: String,
    val amenitiesText: String,
    val nearbyText: String,
    val imageUrl: String?,
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
