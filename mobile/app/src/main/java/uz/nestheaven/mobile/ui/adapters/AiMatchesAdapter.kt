package uz.nestheaven.mobile.ui.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApartmentAssistantMatch
import uz.nestheaven.mobile.core.AppLanguage
import uz.nestheaven.mobile.core.ImageLoading
import uz.nestheaven.mobile.core.JsonParsers
import java.text.DecimalFormat

class AiMatchesAdapter(
    private val onOpenClicked: (ApartmentAssistantMatch) -> Unit,
) : RecyclerView.Adapter<AiMatchesAdapter.MatchViewHolder>() {

    private val items = mutableListOf<ApartmentAssistantMatch>()
    private val priceFormat = DecimalFormat("#,###")

    fun submitList(newItems: List<ApartmentAssistantMatch>) {
        items.clear()
        items.addAll(newItems)
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MatchViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_ai_match, parent, false)
        return MatchViewHolder(view)
    }

    override fun onBindViewHolder(holder: MatchViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    inner class MatchViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val imageView: ImageView = itemView.findViewById(R.id.aiMatchImage)
        private val badgeText: TextView = itemView.findViewById(R.id.aiMatchBadge)
        private val titleText: TextView = itemView.findViewById(R.id.aiMatchTitle)
        private val metaText: TextView = itemView.findViewById(R.id.aiMatchMeta)
        private val locationText: TextView = itemView.findViewById(R.id.aiMatchLocation)
        private val openButton: MaterialButton = itemView.findViewById(R.id.aiMatchOpenButton)

        fun bind(item: ApartmentAssistantMatch) {
            ImageLoading.load(
                imageView = imageView,
                url = JsonParsers.resolveAssetUrl(item.coverImage),
                caller = "AiMatchesAdapter",
            )

            titleText.text = item.title.ifBlank {
                AppLanguage.translate("Kvartira", "Квартира", "Apartment")
            }

            badgeText.text = when {
                item.metroDistanceMeters != null -> AppLanguage.translate(
                    "Metro ~${item.metroDistanceMeters}m",
                    "Метро ~${item.metroDistanceMeters}м",
                    "Metro ~${item.metroDistanceMeters}m",
                )
                !item.complexName.isNullOrBlank() -> item.complexName
                !item.city.isNullOrBlank() -> item.city
                else -> AppLanguage.translate("AI tavsiya", "AI рекомендация", "AI recommendation")
            }

            metaText.text = listOfNotNull(
                item.price?.let { "${priceFormat.format(it)} UZS" },
                item.rooms?.let {
                    AppLanguage.translate("$it xona", "$it комн.", "$it rooms")
                },
                item.area?.let {
                    AppLanguage.translate("${it.toInt()} m2", "${it.toInt()} м2", "${it.toInt()} m2")
                },
            ).joinToString("  •  ")

            locationText.text = listOfNotNull(
                item.locationText?.trim()?.takeIf { it.isNotBlank() },
                item.city?.trim()?.takeIf { it.isNotBlank() },
            ).distinct().joinToString("\n").ifBlank {
                AppLanguage.translate(
                    "Joylashuv ko'rsatilmagan",
                    "Локация не указана",
                    "Location not specified",
                )
            }

            openButton.text = AppLanguage.translate("Ko'rish", "Открыть", "Open")

            itemView.setOnClickListener { onOpenClicked(item) }
            openButton.setOnClickListener { onOpenClicked(item) }
        }
    }
}
