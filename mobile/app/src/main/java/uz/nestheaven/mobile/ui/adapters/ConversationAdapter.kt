package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ConversationSummaryModel
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ConversationAdapter(
    private val onItemClick: (ConversationSummaryModel) -> Unit,
) : RecyclerView.Adapter<ConversationAdapter.ConversationViewHolder>() {

    private val items = mutableListOf<ConversationSummaryModel>()

    fun submitList(newItems: List<ConversationSummaryModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ConversationViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_conversation, parent, false)
        return ConversationViewHolder(view)
    }

    override fun onBindViewHolder(holder: ConversationViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class ConversationViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val nameText: TextView = itemView.findViewById(R.id.conversationName)
        private val subtitleText: TextView = itemView.findViewById(R.id.conversationSubtitle)
        private val timeText: TextView = itemView.findViewById(R.id.conversationTime)

        fun bind(item: ConversationSummaryModel) {
            nameText.text = item.counterpartName

            subtitleText.text = item.lastMessage?.body?.trim().orEmpty().ifBlank {
                item.apartmentTitle?.trim().orEmpty().ifBlank { "-" }
            }

            timeText.text = formatTime(item.lastMessage?.createdAt ?: item.updatedAt)

            itemView.setOnClickListener { onItemClick(item) }
        }
    }

    private fun formatTime(value: String?): String {
        val timestamp = parseTimestamp(value)
        if (timestamp <= 0L) return ""
        return SimpleDateFormat("HH:mm", Locale.getDefault()).format(timestamp)
    }

    private fun parseTimestamp(value: String?): Long {
        if (value.isNullOrBlank()) return 0L

        val patterns = listOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSSX",
            "yyyy-MM-dd'T'HH:mm:ssX",
        )

        for (pattern in patterns) {
            val formatter = SimpleDateFormat(pattern, Locale.US).apply {
                timeZone = TimeZone.getTimeZone("UTC")
            }
            val parsed = runCatching { formatter.parse(value)?.time }.getOrNull()
            if (parsed != null) return parsed
        }

        return 0L
    }
}

