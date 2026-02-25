package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.ApartmentCardModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ApartmentAdapter
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ApartmentsFragment : Fragment(R.layout.fragment_apartments) {

    interface ApartmentsHost {
        fun openApartmentDetail(id: String)
        fun requestLogin()
    }

    private enum class SortOption {
        NEWEST,
        PRICE_ASC,
        PRICE_DESC,
        AREA_ASC,
        AREA_DESC,
        ROOMS_ASC,
        ROOMS_DESC,
    }

    private data class ApartmentsFilter(
        val search: String? = null,
        val minPrice: Double? = null,
        val maxPrice: Double? = null,
        val rooms: Int? = null,
        val status: String? = null,
        val sortOption: SortOption = SortOption.NEWEST,
    )

    private var host: ApartmentsHost? = null
    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ApartmentAdapter
    private var currentFilter = ApartmentsFilter()

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? ApartmentsHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val recyclerView = view.findViewById<RecyclerView>(R.id.recyclerApartments)
        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeApartments)
        val progress = view.findViewById<ProgressBar>(R.id.apartmentsProgress)
        val empty = view.findViewById<TextView>(R.id.apartmentsEmpty)
        val searchInput = view.findViewById<TextInputEditText>(R.id.apartmentsSearchInput)
        val minPriceInput = view.findViewById<TextInputEditText>(R.id.apartmentsMinPriceInput)
        val maxPriceInput = view.findViewById<TextInputEditText>(R.id.apartmentsMaxPriceInput)
        val roomsInput = view.findViewById<TextInputEditText>(R.id.apartmentsRoomsInput)
        val statusSpinner = view.findViewById<Spinner>(R.id.apartmentsStatusSpinner)
        val sortSpinner = view.findViewById<Spinner>(R.id.apartmentsSortSpinner)
        val searchButton = view.findViewById<Button>(R.id.apartmentsSearchButton)
        val applyFiltersButton = view.findViewById<Button>(R.id.apartmentsApplyFiltersButton)
        val resetFiltersButton = view.findViewById<Button>(R.id.apartmentsResetFiltersButton)

        adapter = ApartmentAdapter(
            onItemClick = { item -> host?.openApartmentDetail(item.id) },
            onFavoriteClick = { item -> toggleFavorite(item.id, view) },
        )

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter

        setupStatusSpinner(statusSpinner)
        setupSortSpinner(sortSpinner)

        swipe.setOnRefreshListener {
            currentFilter = parseFilter(
                searchInput = searchInput,
                minPriceInput = minPriceInput,
                maxPriceInput = maxPriceInput,
                roomsInput = roomsInput,
                statusSpinner = statusSpinner,
                sortSpinner = sortSpinner,
            )
            loadApartments(currentFilter, progress, empty, swipe)
        }

        val applyCurrentFilters = {
            currentFilter = parseFilter(
                searchInput = searchInput,
                minPriceInput = minPriceInput,
                maxPriceInput = maxPriceInput,
                roomsInput = roomsInput,
                statusSpinner = statusSpinner,
                sortSpinner = sortSpinner,
            )
            loadApartments(currentFilter, progress, empty, swipe)
        }

        searchButton.setOnClickListener { applyCurrentFilters() }
        applyFiltersButton.setOnClickListener { applyCurrentFilters() }

        resetFiltersButton.setOnClickListener {
            searchInput.setText("")
            minPriceInput.setText("")
            maxPriceInput.setText("")
            roomsInput.setText("")
            statusSpinner.setSelection(0)
            sortSpinner.setSelection(0)
            currentFilter = ApartmentsFilter()
            loadApartments(currentFilter, progress, empty, swipe)
        }

        loadApartments(currentFilter, progress, empty, swipe)
    }

    private fun setupStatusSpinner(statusSpinner: Spinner) {
        val statusOptions = listOf(
            getString(R.string.filter_status_all),
            getString(R.string.filter_status_active),
            getString(R.string.filter_status_sold),
            getString(R.string.filter_status_hidden),
        )

        val adapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            statusOptions,
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        statusSpinner.adapter = adapter
    }

    private fun setupSortSpinner(sortSpinner: Spinner) {
        val sortOptions = listOf(
            getString(R.string.filter_sort_newest),
            getString(R.string.filter_sort_price_asc),
            getString(R.string.filter_sort_price_desc),
            getString(R.string.filter_sort_area_asc),
            getString(R.string.filter_sort_area_desc),
            getString(R.string.filter_sort_rooms_asc),
            getString(R.string.filter_sort_rooms_desc),
        )

        val adapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_spinner_item,
            sortOptions,
        )
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        sortSpinner.adapter = adapter
    }

    private fun parseFilter(
        searchInput: TextInputEditText,
        minPriceInput: TextInputEditText,
        maxPriceInput: TextInputEditText,
        roomsInput: TextInputEditText,
        statusSpinner: Spinner,
        sortSpinner: Spinner,
    ): ApartmentsFilter {
        val status = when (statusSpinner.selectedItemPosition) {
            1 -> "active"
            2 -> "sold"
            3 -> "hidden"
            else -> null
        }

        val sortOption = when (sortSpinner.selectedItemPosition) {
            1 -> SortOption.PRICE_ASC
            2 -> SortOption.PRICE_DESC
            3 -> SortOption.AREA_ASC
            4 -> SortOption.AREA_DESC
            5 -> SortOption.ROOMS_ASC
            6 -> SortOption.ROOMS_DESC
            else -> SortOption.NEWEST
        }

        return ApartmentsFilter(
            search = searchInput.text?.toString()?.trim().takeUnless { it.isNullOrBlank() },
            minPrice = minPriceInput.text?.toString()?.trim()?.toDoubleOrNull(),
            maxPrice = maxPriceInput.text?.toString()?.trim()?.toDoubleOrNull(),
            rooms = roomsInput.text?.toString()?.trim()?.toIntOrNull(),
            status = status,
            sortOption = sortOption,
        )
    }

    private fun loadApartments(
        filter: ApartmentsFilter,
        progress: ProgressBar,
        empty: TextView,
        swipe: SwipeRefreshLayout,
    ) {
        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            empty.isVisible = false

            try {
                val response = ApiClient.service.getApartments(
                    page = 1,
                    limit = 100,
                    search = filter.search,
                    minPrice = filter.minPrice,
                    maxPrice = filter.maxPrice,
                    rooms = filter.rooms,
                    status = filter.status,
                )

                if (response.isSuccessful) {
                    val items = applySort(
                        JsonParsers.parseApartments(response.body()),
                        filter.sortOption,
                    )
                    adapter.submitList(items)
                    empty.isVisible = items.isEmpty()
                    empty.text = getString(R.string.empty_apartments)

                    if (sessionManager.isLoggedIn()) {
                        loadFavoriteIds()
                    } else {
                        adapter.setFavoriteIds(emptySet())
                    }
                } else {
                    empty.isVisible = true
                    empty.text = getString(R.string.error_load_apartments)
                }
            } catch (e: Exception) {
                empty.isVisible = true
                empty.text = e.message ?: getString(R.string.error_load_apartments)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
        }
    }

    private fun applySort(items: List<ApartmentCardModel>, sortOption: SortOption): List<ApartmentCardModel> {
        return when (sortOption) {
            SortOption.NEWEST -> items.sortedByDescending { parseCreatedAt(it.createdAt) }
            SortOption.PRICE_ASC -> items.sortedBy { it.priceValue ?: Double.MAX_VALUE }
            SortOption.PRICE_DESC -> items.sortedByDescending { it.priceValue ?: 0.0 }
            SortOption.AREA_ASC -> items.sortedBy { it.areaValue ?: Double.MAX_VALUE }
            SortOption.AREA_DESC -> items.sortedByDescending { it.areaValue ?: 0.0 }
            SortOption.ROOMS_ASC -> items.sortedBy { it.roomsValue ?: Int.MAX_VALUE }
            SortOption.ROOMS_DESC -> items.sortedByDescending { it.roomsValue ?: 0 }
        }
    }

    private fun parseCreatedAt(value: String?): Long {
        if (value.isNullOrBlank()) return 0L

        val patterns = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ssX",
        )

        for (pattern in patterns) {
            val formatter = SimpleDateFormat(pattern, Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val parsed = runCatching { formatter.parse(value)?.time }.getOrNull()
            if (parsed != null) return parsed
        }

        return 0L
    }

    private fun loadFavoriteIds() {
        viewLifecycleOwner.lifecycleScope.launch {
            runCatching { ApiClient.service.getFavorites(limit = 100) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        val ids = JsonParsers.parseFavoriteApartmentIds(response.body())
                        adapter.setFavoriteIds(ids)
                    }
                }
        }
    }

    private fun toggleFavorite(apartmentId: String, rootView: View) {
        if (!sessionManager.isLoggedIn()) {
            Snackbar.make(rootView, getString(R.string.login_required), Snackbar.LENGTH_SHORT).show()
            host?.requestLogin()
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val statusResponse = ApiClient.service.getFavoriteStatus(apartmentId)
                val isFavorite = statusResponse.body()
                    ?.getAsJsonObject("data")
                    ?.get("isFavorite")
                    ?.asBoolean
                    ?: false

                val response = if (isFavorite) {
                    ApiClient.service.removeFavorite(apartmentId)
                } else {
                    ApiClient.service.addFavorite(apartmentId)
                }

                if (response.isSuccessful) {
                    loadFavoriteIds()
                    Snackbar.make(
                        rootView,
                        if (isFavorite) getString(R.string.favorite_removed) else getString(R.string.favorite_added),
                        Snackbar.LENGTH_SHORT,
                    ).show()
                } else {
                    Snackbar.make(rootView, getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Snackbar.make(rootView, e.message ?: getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
            }
        }
    }
}
