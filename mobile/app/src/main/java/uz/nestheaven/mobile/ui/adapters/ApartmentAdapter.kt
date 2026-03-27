package uz.nestheaven.mobile.ui.adapters

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApartmentCardModel
import uz.nestheaven.mobile.core.ImageLoading

class ApartmentAdapter(
    private val onItemClick: (ApartmentCardModel) -> Unit,
    private val onFavoriteClick: ((ApartmentCardModel) -> Unit)? = null,
) : RecyclerView.Adapter<ApartmentAdapter.ApartmentViewHolder>() {

    private val items = mutableListOf<ApartmentCardModel>()
    private val favoriteIds = mutableSetOf<String>()
    private val blockedIds = mutableSetOf<String>()

    fun submitList(newItems: List<ApartmentCardModel>) {
        items.clear()
        items.addAll(newItems.filterNot { blockedIds.contains(it.id) })
        notifyDataSetChanged()
    }

    fun setFavoriteIds(ids: Set<String>) {
        favoriteIds.clear()
        favoriteIds.addAll(ids)
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

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ApartmentViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_apartment, parent, false)
        return ApartmentViewHolder(view)
    }

    override fun onBindViewHolder(holder: ApartmentViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ApartmentViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageCover: ImageView = itemView.findViewById(R.id.imageCover)
        private val textTitle: TextView = itemView.findViewById(R.id.textTitle)
        private val textMeta: TextView = itemView.findViewById(R.id.textMeta)
        private val textPrice: TextView = itemView.findViewById(R.id.textPrice)
        private val textStatus: TextView = itemView.findViewById(R.id.textStatus)
        private val buttonFavorite: ImageButton = itemView.findViewById(R.id.buttonFavorite)

        fun bind(item: ApartmentCardModel) {
            textTitle.text = item.title
            textMeta.text = "${item.city} - ${item.roomsText}"
            textPrice.text = item.priceText
            textStatus.visibility = View.GONE

            ImageLoading.load(imageCover, item.imageUrl, caller = "ApartmentAdapter")

            val isFavorite = favoriteIds.contains(item.id)
            buttonFavorite.setImageResource(
                if (isFavorite) android.R.drawable.btn_star_big_on
                else android.R.drawable.btn_star_big_off,
            )
            buttonFavorite.imageTintList = ColorStateList.valueOf(
                ContextCompat.getColor(
                    itemView.context,
                    if (isFavorite) R.color.nh_warning else R.color.nh_text_secondary,
                ),
            )

            buttonFavorite.visibility = if (onFavoriteClick != null) View.VISIBLE else View.GONE
            buttonFavorite.setOnClickListener { onFavoriteClick?.invoke(item) }
            itemView.setOnClickListener { onItemClick(item) }
        }
    }
}
