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

            ImageLoading.load(imageCover, item.imageUrl, caller = "HomeComplexAdapter")

            itemView.setOnClickListener { onItemClick(item) }
        }
    }
}
