package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ConversationMessageModel
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ChatMessagesAdapter(
    private val meId: String,
) : RecyclerView.Adapter<RecyclerView.ViewHolder>() {

    private val items = mutableListOf<ConversationMessageModel>()

    fun submitList(newItems: List<ConversationMessageModel>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    fun append(message: ConversationMessageModel) {
        items.add(message)
        notifyItemInserted(items.lastIndex)
    }

    override fun getItemCount(): Int = items.size

    override fun getItemViewType(position: Int): Int {
        return if (items[position].senderId == meId) VIEW_OUTGOING else VIEW_INCOMING
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecyclerView.ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        return if (viewType == VIEW_OUTGOING) {
            OutgoingViewHolder(inflater.inflate(R.layout.item_chat_outgoing, parent, false))
        } else {
            IncomingViewHolder(inflater.inflate(R.layout.item_chat_incoming, parent, false))
        }
    }

    override fun onBindViewHolder(holder: RecyclerView.ViewHolder, position: Int) {
        val item = items[position]
        when (holder) {
            is IncomingViewHolder -> holder.bind(item)
            is OutgoingViewHolder -> holder.bind(item)
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

    private inner class IncomingViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val bodyText: TextView = itemView.findViewById(R.id.chatMessageBody)
        private val timeText: TextView = itemView.findViewById(R.id.chatMessageTime)

        fun bind(item: ConversationMessageModel) {
            bodyText.text = item.body
            timeText.text = formatTime(item.createdAt)
        }
    }

    private inner class OutgoingViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val bodyText: TextView = itemView.findViewById(R.id.chatMessageBody)
        private val timeText: TextView = itemView.findViewById(R.id.chatMessageTime)

        fun bind(item: ConversationMessageModel) {
            bodyText.text = item.body
            timeText.text = formatTime(item.createdAt)
        }
    }

    companion object {
        private const val VIEW_INCOMING = 0
        private const val VIEW_OUTGOING = 1
    }
}

