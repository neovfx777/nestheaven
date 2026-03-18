package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApartmentCardModel

class HomeListingAdapter(
    private val onItemClick: (ApartmentCardModel) -> Unit,
) : RecyclerView.Adapter<HomeListingAdapter.HomeListingViewHolder>() {

    private val items = mutableListOf<ApartmentCardModel>()

    fun submitList(newItems: List<ApartmentCardModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HomeListingViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_home_listing, parent, false)
        return HomeListingViewHolder(view)
    }

    override fun onBindViewHolder(holder: HomeListingViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class HomeListingViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageCover: ImageView = itemView.findViewById(R.id.imageCover)
        private val textTitle: TextView = itemView.findViewById(R.id.textTitle)
        private val textMeta: TextView = itemView.findViewById(R.id.textMeta)

        fun bind(item: ApartmentCardModel) {
            textTitle.text = item.title
            textMeta.text = item.city

            Glide.with(itemView)
                .load(item.imageUrl)
                .placeholder(R.drawable.placeholder_image)
                .error(R.drawable.placeholder_image)
                .centerCrop()
                .into(imageCover)

            itemView.setOnClickListener { onItemClick(item) }
        }
    }
}

