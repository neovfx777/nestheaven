package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApartmentCardModel
import uz.nestheaven.mobile.core.ImageLoading

class SimilarListingAdapter(
    private val onItemClick: (ApartmentCardModel) -> Unit,
) : RecyclerView.Adapter<SimilarListingAdapter.SimilarListingViewHolder>() {

    private val items = mutableListOf<ApartmentCardModel>()
    private val blockedIds = mutableSetOf<String>()

    fun submitList(newItems: List<ApartmentCardModel>) {
        items.clear()
        items.addAll(newItems.filterNot { blockedIds.contains(it.id) })
        notifyDataSetChanged()
    }

    fun setBlockedIds(ids: Set<String>) {
        blockedIds.clear()
        blockedIds.addAll(ids)
        if (blockedIds.isNotEmpty()) {
            items.removeAll { blockedIds.contains(it.id) }
        }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): SimilarListingViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_similar_listing, parent, false)
        return SimilarListingViewHolder(view)
    }

    override fun onBindViewHolder(holder: SimilarListingViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class SimilarListingViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageCover: ImageView = itemView.findViewById(R.id.similarListingImage)
        private val textTitle: TextView = itemView.findViewById(R.id.similarListingTitle)
        private val textMeta: TextView = itemView.findViewById(R.id.similarListingMeta)

        fun bind(item: ApartmentCardModel) {
            textTitle.text = item.title
            textMeta.text = item.city

            ImageLoading.load(imageCover, item.imageUrl, caller = "SimilarListingAdapter")

            itemView.setOnClickListener { onItemClick(item) }
        }
    }
}
