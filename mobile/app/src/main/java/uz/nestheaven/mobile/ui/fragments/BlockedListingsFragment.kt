package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.BlockedListings
import uz.nestheaven.mobile.ui.adapters.BlockedListingsAdapter

class BlockedListingsFragment : Fragment(R.layout.fragment_blocked_listings) {

    private lateinit var adapter: BlockedListingsAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val recycler = view.findViewById<RecyclerView>(R.id.recyclerBlocked)
        val progress = view.findViewById<ProgressBar>(R.id.blockedProgress)
        val empty = view.findViewById<TextView>(R.id.blockedEmpty)

        adapter = BlockedListingsAdapter(
            onUnblock = { id ->
                BlockedListings.unblockApartment(requireContext(), id)
                load(progress, empty)
            },
        )

        recycler.layoutManager = LinearLayoutManager(requireContext())
        recycler.adapter = adapter

        load(progress, empty)
    }

    override fun onResume() {
        super.onResume()
        view?.let { root ->
            load(
                progress = root.findViewById(R.id.blockedProgress),
                empty = root.findViewById(R.id.blockedEmpty),
            )
        }
    }

    private fun load(progress: ProgressBar, empty: TextView) {
        val blocked = BlockedListings.getBlockedForDisplay(requireContext())
        if (blocked.isEmpty()) {
            progress.isVisible = false
            adapter.submitList(emptyList())
            empty.isVisible = true
            empty.text = getString(R.string.blocked_listings_empty)
            return
        }

        // Show immediately from local snapshots (API may be unavailable/unauthorized).
        val items = blocked.map {
            BlockedListingsAdapter.Item(
                id = it.id,
                title = it.title,
                city = it.city,
                priceText = it.priceText,
            )
        }
        progress.isVisible = false
        empty.isVisible = false
        adapter.submitList(items)
    }
}
