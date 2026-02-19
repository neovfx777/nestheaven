package uz.nestheaven.mobile.ui.fragments

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.button.MaterialButton
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ApartmentAdapter

class FavoritesFragment : Fragment(R.layout.fragment_favorites) {

    interface FavoritesHost {
        fun openApartmentDetail(id: String)
        fun requestLogin()
    }

    private var host: FavoritesHost? = null
    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ApartmentAdapter

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? FavoritesHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val recycler = view.findViewById<RecyclerView>(R.id.recyclerFavorites)
        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeFavorites)
        val progress = view.findViewById<ProgressBar>(R.id.favoritesProgress)
        val empty = view.findViewById<TextView>(R.id.favoritesEmpty)
        val loginButton = view.findViewById<MaterialButton>(R.id.favoritesLoginButton)

        adapter = ApartmentAdapter(
            onItemClick = { host?.openApartmentDetail(it.id) },
            onFavoriteClick = { removeFavorite(it.id, view) },
        )

        recycler.layoutManager = LinearLayoutManager(requireContext())
        recycler.adapter = adapter

        loginButton.setOnClickListener { host?.requestLogin() }

        swipe.setOnRefreshListener {
            loadFavorites(progress, empty, swipe, loginButton)
        }

        loadFavorites(progress, empty, swipe, loginButton)
    }

    override fun onResume() {
        super.onResume()
        view?.let {
            val progress = it.findViewById<ProgressBar>(R.id.favoritesProgress)
            val empty = it.findViewById<TextView>(R.id.favoritesEmpty)
            val swipe = it.findViewById<SwipeRefreshLayout>(R.id.swipeFavorites)
            val loginButton = it.findViewById<MaterialButton>(R.id.favoritesLoginButton)
            loadFavorites(progress, empty, swipe, loginButton)
        }
    }

    private fun loadFavorites(
        progress: ProgressBar,
        empty: TextView,
        swipe: SwipeRefreshLayout,
        loginButton: MaterialButton,
    ) {
        if (!sessionManager.isLoggedIn()) {
            progress.isVisible = false
            swipe.isRefreshing = false
            adapter.submitList(emptyList())
            empty.isVisible = true
            empty.text = getString(R.string.login_required_favorites)
            loginButton.isVisible = true
            return
        }

        loginButton.isVisible = false

        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            empty.isVisible = false
            try {
                val response = ApiClient.service.getFavorites(page = 1, limit = 100)
                if (response.isSuccessful) {
                    val items = JsonParsers.parseFavorites(response.body())
                    adapter.submitList(items)
                    adapter.setFavoriteIds(items.map { it.id }.toSet())
                    empty.isVisible = items.isEmpty()
                    empty.text = getString(R.string.empty_favorites)
                } else {
                    empty.isVisible = true
                    empty.text = getString(R.string.error_load_favorites)
                }
            } catch (e: Exception) {
                empty.isVisible = true
                empty.text = e.message ?: getString(R.string.error_load_favorites)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
        }
    }

    private fun removeFavorite(apartmentId: String, rootView: View) {
        viewLifecycleOwner.lifecycleScope.launch {
            try {
                val response = ApiClient.service.removeFavorite(apartmentId)
                if (response.isSuccessful) {
                    Snackbar.make(rootView, getString(R.string.favorite_removed), Snackbar.LENGTH_SHORT).show()
                    view?.let {
                        val progress = it.findViewById<ProgressBar>(R.id.favoritesProgress)
                        val empty = it.findViewById<TextView>(R.id.favoritesEmpty)
                        val swipe = it.findViewById<SwipeRefreshLayout>(R.id.swipeFavorites)
                        val loginButton = it.findViewById<MaterialButton>(R.id.favoritesLoginButton)
                        loadFavorites(progress, empty, swipe, loginButton)
                    }
                } else {
                    Snackbar.make(rootView, getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Snackbar.make(rootView, e.message ?: getString(R.string.favorite_failed), Snackbar.LENGTH_SHORT).show()
            }
        }
    }
}
