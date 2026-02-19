package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
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
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ApartmentAdapter

class ApartmentsFragment : Fragment(R.layout.fragment_apartments) {

    interface ApartmentsHost {
        fun openApartmentDetail(id: String)
        fun requestLogin()
    }

    private var host: ApartmentsHost? = null
    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ApartmentAdapter

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
        val searchButton = view.findViewById<Button>(R.id.apartmentsSearchButton)

        adapter = ApartmentAdapter(
            onItemClick = { item -> host?.openApartmentDetail(item.id) },
            onFavoriteClick = { item -> toggleFavorite(item.id, view) },
        )

        recyclerView.layoutManager = LinearLayoutManager(requireContext())
        recyclerView.adapter = adapter

        swipe.setOnRefreshListener {
            loadApartments(searchInput.text?.toString(), progress, empty, swipe)
        }

        searchButton.setOnClickListener {
            loadApartments(searchInput.text?.toString(), progress, empty, swipe)
        }

        loadApartments(null, progress, empty, swipe)
    }

    private fun loadApartments(
        search: String?,
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
                    limit = 50,
                    search = search?.trim().takeUnless { it.isNullOrBlank() },
                )

                if (response.isSuccessful) {
                    val items = JsonParsers.parseApartments(response.body())
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
