package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.button.MaterialButton
import com.google.android.material.card.MaterialCardView
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.supervisorScope
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.BroadcastModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ApartmentAdapter
import uz.nestheaven.mobile.ui.adapters.ComplexAdapter
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class HomeFragment : Fragment(R.layout.fragment_home) {

    interface HomeHost {
        fun openApartmentDetail(id: String)
        fun openComplexDetail(id: String)
        fun openApartmentsTab()
        fun openComplexesTab()
    }

    private var host: HomeHost? = null
    private lateinit var sessionManager: SessionManager
    private lateinit var featuredAdapter: ApartmentAdapter
    private lateinit var recommendedAdapter: ApartmentAdapter
    private lateinit var complexesAdapter: ComplexAdapter
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
        sessionManager = SessionManager(requireContext())

        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeHome)
        val progress = view.findViewById<ProgressBar>(R.id.homeProgress)
        val errorText = view.findViewById<TextView>(R.id.homeError)
        val featuredEmpty = view.findViewById<TextView>(R.id.homeFeaturedEmpty)
        val recommendedEmpty = view.findViewById<TextView>(R.id.homeRecommendedEmpty)
        val complexesEmpty = view.findViewById<TextView>(R.id.homeComplexesEmpty)
        val statApartments = view.findViewById<TextView>(R.id.homeStatApartments)
        val statComplexes = view.findViewById<TextView>(R.id.homeStatComplexes)
        val statFavorites = view.findViewById<TextView>(R.id.homeStatFavorites)
        val broadcastsContainer = view.findViewById<LinearLayout>(R.id.homeBroadcastsContainer)
        val browseApartmentsButton = view.findViewById<MaterialButton>(R.id.homeBrowseApartmentsButton)
        val browseComplexesButton = view.findViewById<MaterialButton>(R.id.homeBrowseComplexesButton)
        val featuredRecycler = view.findViewById<RecyclerView>(R.id.homeFeaturedRecycler)
        val recommendedRecycler = view.findViewById<RecyclerView>(R.id.homeRecommendedRecycler)
        val complexesRecycler = view.findViewById<RecyclerView>(R.id.homeComplexesRecycler)

        featuredAdapter = ApartmentAdapter(
            onItemClick = { host?.openApartmentDetail(it.id) },
            onFavoriteClick = null,
        )
        recommendedAdapter = ApartmentAdapter(
            onItemClick = { host?.openApartmentDetail(it.id) },
            onFavoriteClick = null,
        )
        complexesAdapter = ComplexAdapter { host?.openComplexDetail(it.id) }

        featuredRecycler.layoutManager = LinearLayoutManager(requireContext())
        featuredRecycler.isNestedScrollingEnabled = false
        featuredRecycler.adapter = featuredAdapter

        recommendedRecycler.layoutManager = LinearLayoutManager(requireContext())
        recommendedRecycler.isNestedScrollingEnabled = false
        recommendedRecycler.adapter = recommendedAdapter

        complexesRecycler.layoutManager = LinearLayoutManager(requireContext())
        complexesRecycler.isNestedScrollingEnabled = false
        complexesRecycler.adapter = complexesAdapter

        browseApartmentsButton.setOnClickListener { host?.openApartmentsTab() }
        browseComplexesButton.setOnClickListener { host?.openComplexesTab() }

        swipe.setOnRefreshListener {
            loadHome(
                progress = progress,
                swipe = swipe,
                errorText = errorText,
                featuredEmpty = featuredEmpty,
                recommendedEmpty = recommendedEmpty,
                complexesEmpty = complexesEmpty,
                statApartments = statApartments,
                statComplexes = statComplexes,
                statFavorites = statFavorites,
                broadcastsContainer = broadcastsContainer,
            )
        }

        loadHome(
            progress = progress,
            swipe = swipe,
            errorText = errorText,
            featuredEmpty = featuredEmpty,
            recommendedEmpty = recommendedEmpty,
            complexesEmpty = complexesEmpty,
            statApartments = statApartments,
            statComplexes = statComplexes,
            statFavorites = statFavorites,
            broadcastsContainer = broadcastsContainer,
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
                featuredEmpty = root.findViewById(R.id.homeFeaturedEmpty),
                recommendedEmpty = root.findViewById(R.id.homeRecommendedEmpty),
                complexesEmpty = root.findViewById(R.id.homeComplexesEmpty),
                statApartments = root.findViewById(R.id.homeStatApartments),
                statComplexes = root.findViewById(R.id.homeStatComplexes),
                statFavorites = root.findViewById(R.id.homeStatFavorites),
                broadcastsContainer = root.findViewById(R.id.homeBroadcastsContainer),
            )
        }
    }

    private fun loadHome(
        progress: ProgressBar,
        swipe: SwipeRefreshLayout,
        errorText: TextView,
        featuredEmpty: TextView,
        recommendedEmpty: TextView,
        complexesEmpty: TextView,
        statApartments: TextView,
        statComplexes: TextView,
        statFavorites: TextView,
        broadcastsContainer: LinearLayout,
    ) {
        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            errorText.isVisible = false

            try {
                val apartmentsResponse = supervisorScope {
                    val apartmentsDeferred = async {
                        runCatching { ApiClient.service.getApartments(page = 1, limit = 40) }
                    }
                    apartmentsDeferred.await().getOrNull()
                }

                val complexesResponse = supervisorScope {
                    val complexesDeferred = async {
                        runCatching { ApiClient.service.getComplexes(page = 1, limit = 20) }
                    }
                    complexesDeferred.await().getOrNull()
                }

                val broadcastsResponse = supervisorScope {
                    val broadcastsDeferred = async {
                        runCatching { ApiClient.service.getBroadcasts(limit = 5) }
                    }
                    broadcastsDeferred.await().getOrNull()
                }

                val favoritesResponse = if (sessionManager.isLoggedIn()) {
                    supervisorScope {
                        val favoritesDeferred = async {
                            runCatching { ApiClient.service.getFavorites(page = 1, limit = 100) }
                        }
                        favoritesDeferred.await().getOrNull()
                    }
                } else {
                    null
                }

                val apartments = if (apartmentsResponse?.isSuccessful == true) {
                    JsonParsers.parseApartments(apartmentsResponse.body()).sortedByDescending {
                        parseTimestamp(it.createdAt)
                    }
                } else {
                    emptyList()
                }

                val featured = apartments.take(6)
                val recommended = apartments.drop(6).take(6)

                val complexes = if (complexesResponse?.isSuccessful == true) {
                    JsonParsers.parseComplexes(complexesResponse.body()).take(4)
                } else {
                    emptyList()
                }

                val broadcasts = if (broadcastsResponse?.isSuccessful == true) {
                    JsonParsers.parseBroadcasts(broadcastsResponse.body())
                } else {
                    emptyList()
                }

                val favoriteCount = if (favoritesResponse?.isSuccessful == true) {
                    JsonParsers.parseFavoriteApartmentIds(favoritesResponse.body()).size
                } else {
                    0
                }

                featuredAdapter.submitList(featured)
                recommendedAdapter.submitList(recommended)
                complexesAdapter.submitList(complexes)
                renderBroadcasts(broadcastsContainer, broadcasts)

                featuredEmpty.isVisible = featured.isEmpty()
                recommendedEmpty.isVisible = recommended.isEmpty()
                complexesEmpty.isVisible = complexes.isEmpty()

                statApartments.text = apartments.size.toString()
                statComplexes.text = complexes.size.toString()
                statFavorites.text = if (sessionManager.isLoggedIn()) favoriteCount.toString() else "-"
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

    private fun renderBroadcasts(container: LinearLayout, broadcasts: List<BroadcastModel>) {
        container.removeAllViews()

        if (broadcasts.isEmpty()) {
            container.addView(
                TextView(requireContext()).apply {
                    text = getString(R.string.home_broadcast_empty)
                    setTextAppearance(com.google.android.material.R.style.TextAppearance_Material3_BodyMedium)
                    setTextColor(ContextCompat.getColor(requireContext(), R.color.nh_text_secondary))
                },
            )
            return
        }

        broadcasts.forEach { item ->
            val card = MaterialCardView(requireContext()).apply {
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.MATCH_PARENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                ).apply {
                    bottomMargin = dp(8)
                }
                radius = dp(18).toFloat()
                cardElevation = dp(1).toFloat()
                setCardBackgroundColor(ContextCompat.getColor(requireContext(), R.color.nh_surface_card))
                strokeColor = ContextCompat.getColor(requireContext(), R.color.nh_border)
                strokeWidth = dp(1)
            }

            val content = LinearLayout(requireContext()).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(14), dp(14), dp(14), dp(14))
            }

            val title = TextView(requireContext()).apply {
                text = item.title
                setTextAppearance(com.google.android.material.R.style.TextAppearance_Material3_TitleSmall)
                setTextColor(ContextCompat.getColor(requireContext(), R.color.nh_text_primary))
            }

            val message = TextView(requireContext()).apply {
                text = item.message
                setPadding(0, dp(4), 0, 0)
                setTextAppearance(com.google.android.material.R.style.TextAppearance_Material3_BodyMedium)
                setTextColor(ContextCompat.getColor(requireContext(), R.color.nh_text_secondary))
            }

            content.addView(title)
            content.addView(message)
            card.addView(content)
            container.addView(card)
        }
    }

    private fun dp(value: Int): Int {
        val density = resources.displayMetrics.density
        return (value * density).toInt()
    }
}
