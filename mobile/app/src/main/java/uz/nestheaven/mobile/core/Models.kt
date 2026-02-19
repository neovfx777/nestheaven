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
