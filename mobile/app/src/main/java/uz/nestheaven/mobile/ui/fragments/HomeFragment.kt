package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
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
import uz.nestheaven.mobile.core.BlockedListings
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.ui.adapters.HomeComplexAdapter
import uz.nestheaven.mobile.ui.adapters.HomeListingAdapter
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class HomeFragment : Fragment(R.layout.fragment_home) {

    interface HomeHost {
        fun openApartmentDetail(id: String)
        fun openComplexDetail(id: String)
        fun openApartmentsTab()
        fun openComplexesTab()
        fun openFavorites()
    }

    private var host: HomeHost? = null
    private lateinit var complexesAdapter: HomeComplexAdapter
    private lateinit var popularAdapter: HomeListingAdapter
    private var firstResumeHandled = false

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? HomeHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeHome)
        val progress = view.findViewById<ProgressBar>(R.id.homeProgress)
        val errorText = view.findViewById<TextView>(R.id.homeError)
        val complexesEmpty = view.findViewById<TextView>(R.id.homeComplexesEmpty)
        val popularEmpty = view.findViewById<TextView>(R.id.homePopularEmpty)
        val complexesRecycler = view.findViewById<RecyclerView>(R.id.homeComplexesRecycler)
        val popularRecycler = view.findViewById<RecyclerView>(R.id.homePopularRecycler)

        val favoritesButton = view.findViewById<View>(R.id.homeFavoritesButton)
        val showAllComplexes = view.findViewById<View>(R.id.homeShowAllComplexes)
        val showAllPopular = view.findViewById<View>(R.id.homeShowAllPopular)

        complexesAdapter = HomeComplexAdapter { model ->
            host?.openComplexDetail(model.id)
        }
        popularAdapter = HomeListingAdapter { model ->
            host?.openApartmentDetail(model.id)
        }
        popularAdapter.setBlockedIds(BlockedListings.getBlockedApartmentIds(requireContext()))

        complexesRecycler.layoutManager = LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false)
        complexesRecycler.adapter = complexesAdapter
        complexesRecycler.isNestedScrollingEnabled = false

        popularRecycler.layoutManager = GridLayoutManager(requireContext(), 3)
        popularRecycler.adapter = popularAdapter
        popularRecycler.isNestedScrollingEnabled = false

        favoritesButton.setOnClickListener { host?.openFavorites() }
        showAllComplexes.setOnClickListener { host?.openComplexesTab() }
        showAllPopular.setOnClickListener { host?.openApartmentsTab() }

        swipe.setOnRefreshListener {
            loadHome(
                progress = progress,
                swipe = swipe,
                errorText = errorText,
                complexesEmpty = complexesEmpty,
                popularEmpty = popularEmpty,
            )
        }

        loadHome(
            progress = progress,
            swipe = swipe,
            errorText = errorText,
            complexesEmpty = complexesEmpty,
            popularEmpty = popularEmpty,
        )
    }

    override fun onResume() {
        super.onResume()
        if (!firstResumeHandled) {
            firstResumeHandled = true
            return
        }

        view?.let { root ->
            loadHome(
                progress = root.findViewById(R.id.homeProgress),
                swipe = root.findViewById(R.id.swipeHome),
                errorText = root.findViewById(R.id.homeError),
                complexesEmpty = root.findViewById(R.id.homeComplexesEmpty),
                popularEmpty = root.findViewById(R.id.homePopularEmpty),
            )
        }
    }

    private fun loadHome(
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
                        runCatching { ApiClient.service.getApartments(page = 1, limit = 60) }.getOrNull()
                    }
                    val complexesDeferred = async {
                        runCatching { ApiClient.service.getComplexes(page = 1, limit = 40) }.getOrNull()
                    }

                    apartmentsDeferred.await() to complexesDeferred.await()
                }

                val apartments = if (apartmentsResponse?.isSuccessful == true) {
                    JsonParsers.parseApartments(apartmentsResponse.body()).sortedByDescending {
                        parseTimestamp(it.createdAt)
                    }
                } else {
                    emptyList()
                }

                val complexes = if (complexesResponse?.isSuccessful == true) {
                    JsonParsers.parseComplexes(complexesResponse.body()).take(10)
                } else {
                    emptyList()
                }

                val popular = apartments.take(12)

                complexesAdapter.submitList(complexes)
                popularAdapter.setBlockedIds(BlockedListings.getBlockedApartmentIds(requireContext()))
                popularAdapter.submitList(popular)

                complexesEmpty.isVisible = complexes.isEmpty()
                popularEmpty.isVisible = popular.isEmpty()
            } catch (e: Exception) {
                errorText.isVisible = true
                errorText.text = e.message ?: getString(R.string.home_load_failed)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
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
