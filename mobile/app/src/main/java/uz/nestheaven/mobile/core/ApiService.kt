package uz.nestheaven.mobile.core

import com.google.gson.JsonObject
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<AuthResponse>

    @GET("auth/me")
    suspend fun me(): Response<MeResponse>

    @GET("apartments")
    suspend fun getApartments(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
    ): Response<JsonObject>

    @GET("apartments/{id}")
    suspend fun getApartmentById(@Path("id") id: String): Response<JsonObject>

    @GET("complexes")
    suspend fun getComplexes(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): Response<JsonObject>

    @GET("complexes/{id}")
    suspend fun getComplexById(@Path("id") id: String): Response<JsonObject>

    @GET("broadcasts")
    suspend fun getBroadcasts(@Query("limit") limit: Int = 5): Response<JsonObject>

    @GET("users/favorites")
    suspend fun getFavorites(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 50,
    ): Response<JsonObject>

    @POST("users/favorites/{apartmentId}")
    suspend fun addFavorite(@Path("apartmentId") apartmentId: String): Response<JsonObject>

    @DELETE("users/favorites/{apartmentId}")
    suspend fun removeFavorite(@Path("apartmentId") apartmentId: String): Response<JsonObject>

    @GET("users/favorites/status/{apartmentId}")
    suspend fun getFavoriteStatus(@Path("apartmentId") apartmentId: String): Response<JsonObject>

    @GET("users/me")
    suspend fun getProfile(): Response<UserDto>

    @PATCH("users/me")
    suspend fun updateProfile(@Body body: JsonObject): Response<UserDto>
}
