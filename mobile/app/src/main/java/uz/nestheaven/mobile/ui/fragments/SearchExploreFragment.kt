package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.supervisorScope
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.ApartmentCardModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.ui.adapters.HomeComplexAdapter
import uz.nestheaven.mobile.ui.adapters.HomeListingAdapter
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class SearchExploreFragment : Fragment(R.layout.fragment_search_explore) {

    interface SearchExploreHost {
        fun openApartmentDetail(id: String)
        fun openComplexDetail(id: String)
    }

    private var host: SearchExploreHost? = null
    private lateinit var complexesAdapter: HomeComplexAdapter
    private lateinit var popularAdapter: HomeListingAdapter

    private var currentFilters = SearchFiltersBottomSheet.Filters()

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? SearchExploreHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeSearchExplore)
        val progress = view.findViewById<ProgressBar>(R.id.searchExploreProgress)
        val errorText = view.findViewById<TextView>(R.id.searchExploreError)
        val complexesEmpty = view.findViewById<TextView>(R.id.searchExploreComplexesEmpty)
        val popularEmpty = view.findViewById<TextView>(R.id.searchExplorePopularEmpty)
        val complexesRecycler = view.findViewById<RecyclerView>(R.id.searchExploreComplexesRecycler)
        val popularRecycler = view.findViewById<RecyclerView>(R.id.searchExplorePopularRecycler)

        val searchInput = view.findViewById<EditText>(R.id.searchExploreInput)
        val filtersButton = view.findViewById<View>(R.id.searchExploreFiltersButton)
        val showAllComplexes = view.findViewById<View>(R.id.searchExploreShowAllComplexes)
        val showAllPopular = view.findViewById<View>(R.id.searchExploreShowAllPopular)

        searchInput.setText(currentFilters.query.orEmpty())

        complexesAdapter = HomeComplexAdapter { model -> host?.openComplexDetail(model.id) }
        popularAdapter = HomeListingAdapter { model -> host?.openApartmentDetail(model.id) }

        complexesRecycler.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        complexesRecycler.adapter = complexesAdapter
        complexesRecycler.isNestedScrollingEnabled = false

        popularRecycler.layoutManager = GridLayoutManager(requireContext(), 3)
        popularRecycler.adapter = popularAdapter
        popularRecycler.isNestedScrollingEnabled = false

        showAllComplexes.setOnClickListener { (parentFragment as? SearchFragment)?.openComplexesList() }
        showAllPopular.setOnClickListener { (parentFragment as? SearchFragment)?.openApartmentsList() }

        filtersButton.setOnClickListener {
            val fragmentManager = parentFragmentManager
            if (!isAdded || fragmentManager.isStateSaved) return@setOnClickListener
            if (fragmentManager.findFragmentByTag("searchFilters") != null) return@setOnClickListener

            val sheet = SearchFiltersBottomSheet.newInstance().apply {
                initialFilters = currentFilters
                onApplyFilters = { filters ->
                    currentFilters = filters
                    searchInput.setText(filters.query.orEmpty())
                    loadExplore(
                        progress = progress,
                        swipe = swipe,
                        errorText = errorText,
                        complexesEmpty = complexesEmpty,
                        popularEmpty = popularEmpty,
                    )
                }
            }
            sheet.show(fragmentManager, "searchFilters")
        }

        searchInput.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEARCH) {
                val query = searchInput.text?.toString()?.trim().takeUnless { it.isNullOrBlank() }
                currentFilters = currentFilters.copy(query = query)
                loadExplore(
                    progress = progress,
                    swipe = swipe,
                    errorText = errorText,
                    complexesEmpty = complexesEmpty,
                    popularEmpty = popularEmpty,
                )
                true
            } else {
                false
            }
        }

        swipe.setOnRefreshListener {
            loadExplore(
                progress = progress,
                swipe = swipe,
                errorText = errorText,
                complexesEmpty = complexesEmpty,
                popularEmpty = popularEmpty,
            )
        }

        loadExplore(
            progress = progress,
            swipe = swipe,
            errorText = errorText,
            complexesEmpty = complexesEmpty,
            popularEmpty = popularEmpty,
        )
    }

    private fun loadExplore(
        progress: ProgressBar,
        swipe: SwipeRefreshLayout,
        errorText: TextView,
        complexesEmpty: TextView,
        popularEmpty: TextView,
    ) {
        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            errorText.isVisible = false

            try {
                val (apartmentsResponse, complexesResponse) = supervisorScope {
                    val apartmentsDeferred = async {
                        runCatching {
                            ApiClient.service.getApartments(
                                page = 1,
                                limit = 90,
                                search = currentFilters.query,
                                minPrice = currentFilters.minPrice,
                                maxPrice = currentFilters.maxPrice,
                                rooms = currentFilters.roomsExact,
                            )
                        }.getOrNull()
                    }
                    val complexesDeferred = async {
                        runCatching { ApiClient.service.getComplexes(page = 1, limit = 40) }.getOrNull()
                    }

                    apartmentsDeferred.await() to complexesDeferred.await()
                }

                val apartments = if (apartmentsResponse?.isSuccessful == true) {
                    val items = JsonParsers.parseApartments(apartmentsResponse.body())
                    val filtered = applyClientFilters(items, currentFilters)
                    applySort(filtered, currentFilters.sortOption)
                } else {
                    emptyList()
                }

                val complexes = if (complexesResponse?.isSuccessful == true) {
                    val items = JsonParsers.parseComplexes(complexesResponse.body())
                    val query = currentFilters.query?.lowercase().orEmpty()
                    if (query.isNotBlank()) {
                        items.filter {
                            it.title.lowercase().contains(query) || it.city.lowercase().contains(query)
                        }.take(10)
                    } else {
                        items.take(10)
                    }
                } else {
                    emptyList()
                }

                complexesAdapter.submitList(complexes)
                popularAdapter.submitList(apartments)

                complexesEmpty.isVisible = complexes.isEmpty()
                popularEmpty.isVisible = apartments.isEmpty()
            } catch (e: Exception) {
                errorText.isVisible = true
                errorText.text = e.message ?: getString(R.string.error_network_generic)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
        }
    }

    private fun applyClientFilters(
        items: List<ApartmentCardModel>,
        filters: SearchFiltersBottomSheet.Filters,
    ): List<ApartmentCardModel> {
        val minRooms = filters.minRooms
        val maxRooms = filters.maxRooms
        val minArea = filters.minArea
        val maxArea = filters.maxArea
        val minFloor = filters.minFloor
        val maxFloor = filters.maxFloor
        val minPrice = filters.minPrice
        val maxPrice = filters.maxPrice

        if (
            minRooms == null &&
            maxRooms == null &&
            minArea == null &&
            maxArea == null &&
            minFloor == null &&
            maxFloor == null &&
            minPrice == null &&
            maxPrice == null
        ) {
            return items
        }

        return items.filter { model ->
            val roomsValue = model.roomsValue
            val areaValue = model.areaValue
            val floorValue = model.floorValue
            val priceValue = model.priceValue

            val roomsOk = when {
                minRooms != null || maxRooms != null -> {
                    if (roomsValue == null) return@filter false
                    val min = minRooms ?: Int.MIN_VALUE
                    val max = maxRooms ?: Int.MAX_VALUE
                    roomsValue in min..max
                }
                else -> true
            }

            val areaOk = when {
                minArea != null || maxArea != null -> {
                    if (areaValue == null) return@filter false
                    val min = minArea ?: Double.NEGATIVE_INFINITY
                    val max = maxArea ?: Double.POSITIVE_INFINITY
                    areaValue in min..max
                }
                else -> true
            }

            val floorOk = when {
                minFloor != null || maxFloor != null -> {
                    if (floorValue == null) return@filter false
                    val min = minFloor ?: Int.MIN_VALUE
                    val max = maxFloor ?: Int.MAX_VALUE
                    floorValue in min..max
                }
                else -> true
            }

            val priceOk = when {
                minPrice != null || maxPrice != null -> {
                    if (priceValue == null) return@filter false
                    val min = minPrice ?: Double.NEGATIVE_INFINITY
                    val max = maxPrice ?: Double.POSITIVE_INFINITY
                    priceValue in min..max
                }
                else -> true
            }

            roomsOk && areaOk && floorOk && priceOk
        }
    }

    private fun applySort(
        items: List<ApartmentCardModel>,
        sortOption: SearchFiltersBottomSheet.SortOption,
    ): List<ApartmentCardModel> {
        return when (sortOption) {
            SearchFiltersBottomSheet.SortOption.PRICE_ASC -> items.sortedBy { it.priceValue ?: Double.MAX_VALUE }
            SearchFiltersBottomSheet.SortOption.PRICE_DESC -> items.sortedByDescending { it.priceValue ?: Double.MIN_VALUE }
            SearchFiltersBottomSheet.SortOption.AREA_ASC -> items.sortedBy { it.areaValue ?: Double.MAX_VALUE }
            SearchFiltersBottomSheet.SortOption.AREA_DESC -> items.sortedByDescending { it.areaValue ?: Double.MIN_VALUE }
            SearchFiltersBottomSheet.SortOption.ROOMS_ASC -> items.sortedBy { it.roomsValue ?: Int.MAX_VALUE }
            SearchFiltersBottomSheet.SortOption.ROOMS_DESC -> items.sortedByDescending { it.roomsValue ?: Int.MIN_VALUE }
            else -> items.sortedByDescending { parseTimestamp(it.createdAt) }
        }
    }

    private fun parseTimestamp(value: String?): Long {
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
}
