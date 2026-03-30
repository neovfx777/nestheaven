package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import uz.nestheaven.mobile.R

class BlockedListingsAdapter(
    private val onUnblock: (String) -> Unit,
) : RecyclerView.Adapter<BlockedListingsAdapter.VH>() {

    data class Item(
        val id: String,
        val title: String? = null,
        val city: String? = null,
        val priceText: String? = null,
    )

    private val items = mutableListOf<Item>()

    fun submitList(list: List<Item>) {
        items.clear()
        items.addAll(list)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_blocked_listing, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val title: TextView = itemView.findViewById(R.id.blockedTitle)
        private val meta: TextView = itemView.findViewById(R.id.blockedMeta)
        private val price: TextView = itemView.findViewById(R.id.blockedPrice)
        private val systemMessage: TextView = itemView.findViewById(R.id.blockedSystemMessage)
        private val unblockButton: MaterialButton = itemView.findViewById(R.id.blockedUnblockButton)

        fun bind(item: Item) {
            title.text = item.title ?: itemView.context.getString(R.string.blocked_listing_unknown_title)
            meta.text = item.city ?: itemView.context.getString(R.string.blocked_listing_unknown_city)
            price.text = item.priceText ?: itemView.context.getString(R.string.blocked_listing_unknown_price)
            systemMessage.setText(R.string.blocked_listing_system_message)
            unblockButton.setOnClickListener { onUnblock(item.id) }
        }
    }
}
