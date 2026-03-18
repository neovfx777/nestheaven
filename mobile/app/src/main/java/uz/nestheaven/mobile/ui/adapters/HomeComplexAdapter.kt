package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ComplexCardModel

class HomeComplexAdapter(
    private val onItemClick: (ComplexCardModel) -> Unit,
) : RecyclerView.Adapter<HomeComplexAdapter.HomeComplexViewHolder>() {

    private val items = mutableListOf<ComplexCardModel>()

    fun submitList(newItems: List<ComplexCardModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): HomeComplexViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_home_complex, parent, false)
        return HomeComplexViewHolder(view)
    }

    override fun onBindViewHolder(holder: HomeComplexViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class HomeComplexViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageCover: ImageView = itemView.findViewById(R.id.imageCover)
        private val textTitle: TextView = itemView.findViewById(R.id.textTitle)
        private val textMeta: TextView = itemView.findViewById(R.id.textMeta)

        fun bind(item: ComplexCardModel) {
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

