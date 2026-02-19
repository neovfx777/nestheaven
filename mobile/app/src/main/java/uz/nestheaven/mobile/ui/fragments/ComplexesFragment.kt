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
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.ui.adapters.ComplexAdapter

class ComplexesFragment : Fragment(R.layout.fragment_complexes) {

    interface ComplexesHost {
        fun openComplexDetail(id: String)
    }

    private var host: ComplexesHost? = null
    private lateinit var adapter: ComplexAdapter

    override fun onAttach(context: Context) {
        super.onAttach(context)
        host = context as? ComplexesHost
    }

    override fun onDetach() {
        super.onDetach()
        host = null
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recycler = view.findViewById<RecyclerView>(R.id.recyclerComplexes)
        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeComplexes)
        val progress = view.findViewById<ProgressBar>(R.id.complexesProgress)
        val empty = view.findViewById<TextView>(R.id.complexesEmpty)

        adapter = ComplexAdapter { model ->
            host?.openComplexDetail(model.id)
        }

        recycler.layoutManager = LinearLayoutManager(requireContext())
        recycler.adapter = adapter

        swipe.setOnRefreshListener {
            loadComplexes(progress, empty, swipe)
        }

        loadComplexes(progress, empty, swipe)
    }

    private fun loadComplexes(progress: ProgressBar, empty: TextView, swipe: SwipeRefreshLayout) {
        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            empty.isVisible = false

            try {
                val response = ApiClient.service.getComplexes(page = 1, limit = 50)
                if (response.isSuccessful) {
                    val items = JsonParsers.parseComplexes(response.body())
                    adapter.submitList(items)
                    empty.isVisible = items.isEmpty()
                    empty.text = getString(R.string.empty_complexes)
                } else {
                    empty.isVisible = true
                    empty.text = getString(R.string.error_load_complexes)
                }
            } catch (e: Exception) {
                empty.isVisible = true
                empty.text = e.message ?: getString(R.string.error_load_complexes)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
        }
    }
}
