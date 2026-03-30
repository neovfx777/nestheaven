package uz.nestheaven.mobile.core

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken

object BlockedListings {
    private const val PREFS_NAME = "nh_blocked_listings"
    private const val KEY_BLOCKED_APARTMENTS = "blocked_apartments"
    private const val KEY_BLOCKED_SNAPSHOTS = "blocked_snapshots_json"

    data class Snapshot(
        val id: String,
        val title: String? = null,
        val city: String? = null,
        val priceText: String? = null,
        val createdAt: Long = System.currentTimeMillis(),
    )

    private val gson = Gson()

    fun getBlockedApartmentIds(context: Context): Set<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val stored = prefs.getStringSet(KEY_BLOCKED_APARTMENTS, emptySet()) ?: emptySet()
        return stored.toSet()
    }

    fun getBlockedSnapshots(context: Context): List<Snapshot> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val raw = prefs.getString(KEY_BLOCKED_SNAPSHOTS, null)?.trim().orEmpty()
        if (raw.isBlank()) return emptyList()

        return runCatching {
            val type = object : TypeToken<List<Snapshot>>() {}.type
            gson.fromJson<List<Snapshot>>(raw, type) ?: emptyList()
        }.getOrDefault(emptyList())
    }

    fun getBlockedForDisplay(context: Context): List<Snapshot> {
        val ids = getBlockedApartmentIds(context)
        if (ids.isEmpty()) return emptyList()

        val snapshots = getBlockedSnapshots(context)
        val snapshotMap = snapshots.associateBy { it.id }

        // Ensure every id has at least a placeholder snapshot so UI always shows something.
        return ids.map { id -> snapshotMap[id] ?: Snapshot(id = id) }
            .sortedByDescending { it.createdAt }
    }

    fun isApartmentBlocked(context: Context, apartmentId: String): Boolean {
        return getBlockedApartmentIds(context).contains(apartmentId)
    }

    fun blockApartment(
        context: Context,
        apartmentId: String,
        title: String? = null,
        city: String? = null,
        priceText: String? = null,
    ) {
        if (apartmentId.isBlank()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val next = getBlockedApartmentIds(context).toMutableSet().apply { add(apartmentId) }

        val currentSnapshots = getBlockedSnapshots(context).toMutableList()
        val without = currentSnapshots.filterNot { it.id == apartmentId }.toMutableList()
        without.add(Snapshot(id = apartmentId, title = title, city = city, priceText = priceText))

        prefs.edit()
            .putStringSet(KEY_BLOCKED_APARTMENTS, next)
            .putString(KEY_BLOCKED_SNAPSHOTS, gson.toJson(without))
            .apply()
    }

    fun unblockApartment(context: Context, apartmentId: String) {
        if (apartmentId.isBlank()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val next = getBlockedApartmentIds(context).toMutableSet().apply { remove(apartmentId) }
        val nextSnapshots = getBlockedSnapshots(context).filterNot { it.id == apartmentId }
        prefs.edit()
            .putStringSet(KEY_BLOCKED_APARTMENTS, next)
            .putString(KEY_BLOCKED_SNAPSHOTS, gson.toJson(nextSnapshots))
            .apply()
    }
}
