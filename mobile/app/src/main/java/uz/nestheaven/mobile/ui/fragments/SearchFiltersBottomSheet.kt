package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import android.widget.ArrayAdapter
import android.widget.ImageButton
import android.widget.Spinner
import android.widget.Toast
import com.google.android.material.bottomsheet.BottomSheetDialogFragment
import com.google.android.material.chip.ChipGroup
import com.google.android.material.slider.RangeSlider
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import uz.nestheaven.mobile.R

class SearchFiltersBottomSheet : BottomSheetDialogFragment(R.layout.bottom_sheet_search_filters) {

    enum class SortOption {
        NEWEST,
        PRICE_ASC,
        PRICE_DESC,
        AREA_ASC,
        AREA_DESC,
        ROOMS_ASC,
        ROOMS_DESC,
    }

    data class Filters(
        val query: String? = null,
        val roomsExact: Int? = null,
        val minRooms: Int? = null,
        val maxRooms: Int? = null,
        val minPrice: Double? = null,
        val maxPrice: Double? = null,
        val minArea: Double? = null,
        val maxArea: Double? = null,
        val minFloor: Int? = null,
        val maxFloor: Int? = null,
        val sortOption: SortOption = SortOption.NEWEST,
    )

    var initialFilters: Filters = Filters()
    var onApplyFilters: ((Filters) -> Unit)? = null

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val closeButton = view.findViewById<ImageButton>(R.id.searchFiltersCloseButton)
        val queryLayout = view.findViewById<TextInputLayout>(R.id.searchFiltersQueryLayout)
        val queryInput = view.findViewById<TextInputEditText>(R.id.searchFiltersQueryInput)

        val roomsChips = view.findViewById<ChipGroup>(R.id.searchFiltersRoomsChips)
        val minRoomsInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMinRoomsInput)
        val maxRoomsInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMaxRoomsInput)

        val minPriceInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMinPriceInput)
        val maxPriceInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMaxPriceInput)
        val priceSlider = view.findViewById<RangeSlider>(R.id.searchFiltersPriceSlider)

        val minAreaInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMinAreaInput)
        val maxAreaInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMaxAreaInput)
        val areaSlider = view.findViewById<RangeSlider>(R.id.searchFiltersAreaSlider)

        val minFloorInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMinFloorInput)
        val maxFloorInput = view.findViewById<TextInputEditText>(R.id.searchFiltersMaxFloorInput)

        val sortSpinner = view.findViewById<Spinner>(R.id.searchFiltersSortSpinner)

        val resetButton = view.findViewById<View>(R.id.searchFiltersResetButton)
        val applyButton = view.findViewById<View>(R.id.searchFiltersApplyButton)

        closeButton.setOnClickListener { dismiss() }

        setupSortSpinner(sortSpinner)

        queryLayout.setEndIconOnClickListener {
            Toast.makeText(requireContext(), getString(R.string.filters_voice_coming_soon), Toast.LENGTH_SHORT).show()
        }

        bindInitialState(
            queryInput = queryInput,
            roomsChips = roomsChips,
            minRoomsInput = minRoomsInput,
            maxRoomsInput = maxRoomsInput,
            minPriceInput = minPriceInput,
            maxPriceInput = maxPriceInput,
            priceSlider = priceSlider,
            minAreaInput = minAreaInput,
            maxAreaInput = maxAreaInput,
            areaSlider = areaSlider,
            minFloorInput = minFloorInput,
            maxFloorInput = maxFloorInput,
            sortSpinner = sortSpinner,
        )

        priceSlider.addOnChangeListener { slider, _, fromUser ->
            if (!fromUser) return@addOnChangeListener
            val values = slider.values
            if (values.size >= 2) {
                minPriceInput.setText(values[0].toLong().toString())
                maxPriceInput.setText(values[1].toLong().toString())
            }
        }

        areaSlider.addOnChangeListener { slider, _, fromUser ->
            if (!fromUser) return@addOnChangeListener
            val values = slider.values
            if (values.size >= 2) {
                minAreaInput.setText(values[0].toInt().toString())
                maxAreaInput.setText(values[1].toInt().toString())
            }
        }

        resetButton.setOnClickListener {
            onApplyFilters?.invoke(Filters())
            dismiss()
        }

        applyButton.setOnClickListener {
            val selectedRoomsChipId = roomsChips.checkedChipId
            val roomsExactFromChip = when (selectedRoomsChipId) {
                R.id.searchFiltersRoom1 -> 1
                R.id.searchFiltersRoom2 -> 2
                R.id.searchFiltersRoom3 -> 3
                R.id.searchFiltersRoom4 -> 4
                else -> null
            }

            val chipRequestsFivePlus = selectedRoomsChipId == R.id.searchFiltersRoom5Plus

            var minRooms = minRoomsInput.text?.toString()?.trim()?.toIntOrNull()
            val maxRooms = maxRoomsInput.text?.toString()?.trim()?.toIntOrNull()

            val roomsExact = roomsExactFromChip

            if (chipRequestsFivePlus) {
                if (minRooms == null || minRooms < 5) minRooms = 5
            }

            val minPrice = minPriceInput.text?.toString()?.trim()?.toDoubleOrNull()
            val maxPrice = maxPriceInput.text?.toString()?.trim()?.toDoubleOrNull()

            val minArea = minAreaInput.text?.toString()?.trim()?.toDoubleOrNull()
            val maxArea = maxAreaInput.text?.toString()?.trim()?.toDoubleOrNull()

            val sortOption = when (sortSpinner.selectedItemPosition) {
                1 -> SortOption.PRICE_ASC
                2 -> SortOption.PRICE_DESC
                3 -> SortOption.AREA_ASC
                4 -> SortOption.AREA_DESC
                5 -> SortOption.ROOMS_ASC
                6 -> SortOption.ROOMS_DESC
                else -> SortOption.NEWEST
            }

            val filters = Filters(
                query = queryInput.text?.toString()?.trim().takeUnless { it.isNullOrBlank() },
                roomsExact = roomsExact,
                minRooms = if (roomsExact != null) null else minRooms,
                maxRooms = if (roomsExact != null) null else maxRooms,
                minPrice = minPrice,
                maxPrice = maxPrice,
                minArea = minArea,
                maxArea = maxArea,
                minFloor = minFloorInput.text?.toString()?.trim()?.toIntOrNull(),
                maxFloor = maxFloorInput.text?.toString()?.trim()?.toIntOrNull(),
                sortOption = sortOption,
            )

            onApplyFilters?.invoke(filters)
            dismiss()
        }
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

    private fun bindInitialState(
        queryInput: TextInputEditText,
        roomsChips: ChipGroup,
        minRoomsInput: TextInputEditText,
        maxRoomsInput: TextInputEditText,
        minPriceInput: TextInputEditText,
        maxPriceInput: TextInputEditText,
        priceSlider: RangeSlider,
        minAreaInput: TextInputEditText,
        maxAreaInput: TextInputEditText,
        areaSlider: RangeSlider,
        minFloorInput: TextInputEditText,
        maxFloorInput: TextInputEditText,
        sortSpinner: Spinner,
    ) {
        queryInput.setText(initialFilters.query.orEmpty())

        val checkedChipId = when (initialFilters.roomsExact) {
            1 -> R.id.searchFiltersRoom1
            2 -> R.id.searchFiltersRoom2
            3 -> R.id.searchFiltersRoom3
            4 -> R.id.searchFiltersRoom4
            else -> {
                if ((initialFilters.minRooms ?: 0) >= 5) R.id.searchFiltersRoom5Plus else View.NO_ID
            }
        }
        if (checkedChipId != View.NO_ID) {
            roomsChips.check(checkedChipId)
        }

        minRoomsInput.setText(initialFilters.minRooms?.toString().orEmpty())
        maxRoomsInput.setText(initialFilters.maxRooms?.toString().orEmpty())

        minPriceInput.setText(initialFilters.minPrice?.toLong()?.toString().orEmpty())
        maxPriceInput.setText(initialFilters.maxPrice?.toLong()?.toString().orEmpty())

        val rawMinPrice = (initialFilters.minPrice ?: priceSlider.valueFrom.toDouble()).toFloat()
        val rawMaxPrice = (initialFilters.maxPrice ?: priceSlider.valueTo.toDouble()).toFloat()
        setSafeRange(priceSlider, rawMinPrice, rawMaxPrice)

        minAreaInput.setText(initialFilters.minArea?.toString().orEmpty())
        maxAreaInput.setText(initialFilters.maxArea?.toString().orEmpty())

        val rawMinArea = (initialFilters.minArea ?: areaSlider.valueFrom.toDouble()).toFloat()
        val rawMaxArea = (initialFilters.maxArea ?: areaSlider.valueTo.toDouble()).toFloat()
        setSafeRange(areaSlider, rawMinArea, rawMaxArea)

        minFloorInput.setText(initialFilters.minFloor?.toString().orEmpty())
        maxFloorInput.setText(initialFilters.maxFloor?.toString().orEmpty())

        sortSpinner.setSelection(
            when (initialFilters.sortOption) {
                SortOption.PRICE_ASC -> 1
                SortOption.PRICE_DESC -> 2
                SortOption.AREA_ASC -> 3
                SortOption.AREA_DESC -> 4
                SortOption.ROOMS_ASC -> 5
                SortOption.ROOMS_DESC -> 6
                else -> 0
            },
        )
    }

    private fun setSafeRange(slider: RangeSlider, rawMin: Float, rawMax: Float) {
        val from = slider.valueFrom
        val to = slider.valueTo

        var safeMin = rawMin.coerceIn(from, to)
        var safeMax = rawMax.coerceIn(from, to)

        if (safeMin > safeMax) {
            val tmp = safeMin
            safeMin = safeMax
            safeMax = tmp
        }

        runCatching {
            slider.values = listOf(safeMin, safeMax)
        }.getOrElse {
            slider.values = listOf(from, to)
        }
    }

    companion object {
        fun newInstance(): SearchFiltersBottomSheet {
            return SearchFiltersBottomSheet().apply {
                arguments = Bundle()
            }
        }
    }
}
