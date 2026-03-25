package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ComplexCardModel
import uz.nestheaven.mobile.core.ImageLoading

class ComplexAdapter(
    private val onItemClick: (ComplexCardModel) -> Unit,
) : RecyclerView.Adapter<ComplexAdapter.ComplexViewHolder>() {

    private val items = mutableListOf<ComplexCardModel>()

    fun submitList(newItems: List<ComplexCardModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ComplexViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_complex, parent, false)
        return ComplexViewHolder(view)
    }

    override fun onBindViewHolder(holder: ComplexViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ComplexViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageCover: ImageView = itemView.findViewById(R.id.imageCover)
        private val textTitle: TextView = itemView.findViewById(R.id.textTitle)
        private val textMeta: TextView = itemView.findViewById(R.id.textMeta)
        private val textRating: TextView = itemView.findViewById(R.id.textRating)

        fun bind(item: ComplexCardModel) {
            textTitle.text = item.title
            textMeta.text = "${item.city} - ${item.blocksText}"
            textRating.text = item.ratingText
            textRating.visibility = if (item.ratingText.isBlank()) View.GONE else View.VISIBLE

            ImageLoading.load(imageCover, item.imageUrl, caller = "ComplexAdapter")

            itemView.setOnClickListener { onItemClick(item) }
        }
    }
}
