package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ComplexImageModel
import uz.nestheaven.mobile.core.ImageLoading

class ComplexImagesAdapter : RecyclerView.Adapter<ComplexImagesAdapter.ImageViewHolder>() {

    private val items = mutableListOf<ComplexImageModel>()

    fun submitList(newItems: List<ComplexImageModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ImageViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_complex_gallery_image, parent, false)
        return ImageViewHolder(view)
    }

    override fun onBindViewHolder(holder: ImageViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ImageViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val image: ImageView = itemView.findViewById(R.id.complexGalleryImage)

        fun bind(item: ComplexImageModel) {
            ImageLoading.load(image, item.url, caller = "ComplexImagesAdapter")
        }
    }
}

