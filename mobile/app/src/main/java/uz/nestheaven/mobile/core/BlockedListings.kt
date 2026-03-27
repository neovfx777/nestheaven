package uz.nestheaven.mobile.core

import android.content.Context

object BlockedListings {
    private const val PREFS_NAME = "nh_blocked_listings"
    private const val KEY_BLOCKED_APARTMENTS = "blocked_apartments"

    fun getBlockedApartmentIds(context: Context): Set<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val stored = prefs.getStringSet(KEY_BLOCKED_APARTMENTS, emptySet()) ?: emptySet()
        return stored.toSet()
    }

    fun isApartmentBlocked(context: Context, apartmentId: String): Boolean {
        return getBlockedApartmentIds(context).contains(apartmentId)
    }

    fun blockApartment(context: Context, apartmentId: String) {
        if (apartmentId.isBlank()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val next = getBlockedApartmentIds(context).toMutableSet().apply { add(apartmentId) }
        prefs.edit().putStringSet(KEY_BLOCKED_APARTMENTS, next).apply()
    }

    fun unblockApartment(context: Context, apartmentId: String) {
        if (apartmentId.isBlank()) return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val next = getBlockedApartmentIds(context).toMutableSet().apply { remove(apartmentId) }
        prefs.edit().putStringSet(KEY_BLOCKED_APARTMENTS, next).apply()
    }
}

