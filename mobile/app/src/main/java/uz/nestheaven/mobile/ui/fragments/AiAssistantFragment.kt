package uz.nestheaven.mobile.ui.fragments

import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.button.MaterialButton
import com.google.android.material.chip.Chip
import com.google.android.material.chip.ChipGroup
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.AppLanguage
import uz.nestheaven.mobile.core.ApartmentAssistantEnvelope
import uz.nestheaven.mobile.core.ApartmentAssistantMatch
import uz.nestheaven.mobile.core.ApartmentAssistantRequest
import uz.nestheaven.mobile.core.AssistantHistoryItem
import uz.nestheaven.mobile.core.ConversationMessageModel
import uz.nestheaven.mobile.ui.adapters.AiMatchesAdapter
import uz.nestheaven.mobile.ui.adapters.ChatMessagesAdapter
import java.time.Instant
import java.util.UUID

class AiAssistantFragment : Fragment(R.layout.fragment_ai_assistant) {

    interface AiAssistantHost {
        fun openApartmentDetail(id: String)
    }

    private lateinit var titleText: TextView
    private lateinit var subtitleText: TextView
    private lateinit var promptChips: ChipGroup
    private lateinit var messagesRecycler: RecyclerView
    private lateinit var matchesSection: View
    private lateinit var matchesTitle: TextView
    private lateinit var matchesRecycler: RecyclerView
    private lateinit var input: TextInputEditText
    private lateinit var sendButton: MaterialButton
    private lateinit var progress: ProgressBar

    private lateinit var messagesAdapter: ChatMessagesAdapter
    private lateinit var matchesAdapter: AiMatchesAdapter

    private val historyItems = mutableListOf<AssistantHistoryItem>()
    private var isSending = false

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        ApiClient.init(requireContext().applicationContext)

        titleText = view.findViewById(R.id.aiAssistantTitle)
        subtitleText = view.findViewById(R.id.aiAssistantSubtitle)
        promptChips = view.findViewById(R.id.aiAssistantPromptChips)
        messagesRecycler = view.findViewById(R.id.aiAssistantMessagesRecycler)
        matchesSection = view.findViewById(R.id.aiAssistantMatchesSection)
        matchesTitle = view.findViewById(R.id.aiAssistantMatchesTitle)
        matchesRecycler = view.findViewById(R.id.aiAssistantMatchesRecycler)
        input = view.findViewById(R.id.aiAssistantInput)
        sendButton = view.findViewById(R.id.aiAssistantSendButton)
        progress = view.findViewById(R.id.aiAssistantProgress)

        setupTexts()
        setupPrompts()
        setupMessages()
        setupMatches()
        setupComposer()

        if (savedInstanceState == null) {
            addAssistantMessage(initialAssistantGreeting())
        }
    }

    private fun setupTexts() {
        titleText.text = AppLanguage.translate(
            "AI uy yordamchi",
            "AI помощник по недвижимости",
            "AI home assistant",
        )
        subtitleText.text = AppLanguage.translate(
            "Budjet, xona, metro yoki hududni yozing. Men bazadagi mos uylarni topib beraman.",
            "Напишите бюджет, комнаты, метро или район. Я подберу варианты из базы.",
            "Tell me your budget, rooms, metro, or area. I will suggest homes from the database.",
        )
        input.hint = AppLanguage.translate(
            "Masalan: 2 xona, metro yaqinida, 700 mln gacha",
            "Например: 2 комнаты, рядом с метро, до 700 млн",
            "For example: 2 rooms, near metro, up to 700 mln",
        )
    }

    private fun setupPrompts() {
        promptChips.removeAllViews()
        buildPromptTexts().forEach { prompt ->
            val chip = Chip(requireContext()).apply {
                text = prompt
                isClickable = true
                isCheckable = false
                setOnClickListener {
                    input.setText(prompt)
                    input.setSelection(prompt.length)
                    sendCurrentMessage()
                }
            }
            promptChips.addView(chip)
        }
    }

    private fun buildPromptTexts(): List<String> {
        return when (AppLanguage.currentTag()) {
            "ru" -> listOf(
                "2 комнаты рядом с метро",
                "Семейная квартира возле школы",
                "Новостройка до 1 млрд",
            )
            "en" -> listOf(
                "2 rooms near metro",
                "Family apartment near a school",
                "New building under 1 bln",
            )
            else -> listOf(
                "2 xona metro yaqinida",
                "Maktab yaqinida oilaviy kvartira",
                "1 mlrd gacha yangi uy",
            )
        }
    }

    private fun setupMessages() {
        messagesAdapter = ChatMessagesAdapter(ME_ID)
        messagesRecycler.layoutManager = LinearLayoutManager(requireContext()).apply {
            stackFromEnd = true
        }
        messagesRecycler.adapter = messagesAdapter
    }

    private fun setupMatches() {
        matchesAdapter = AiMatchesAdapter { match ->
            (activity as? AiAssistantHost)?.openApartmentDetail(match.id)
        }
        matchesRecycler.layoutManager = LinearLayoutManager(
            requireContext(),
            LinearLayoutManager.HORIZONTAL,
            false,
        )
        matchesRecycler.adapter = matchesAdapter
        matchesSection.isVisible = false
    }

    private fun setupComposer() {
        sendButton.setOnClickListener { sendCurrentMessage() }
        input.setOnEditorActionListener { _, actionId, event ->
            val isEnter = event?.keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN
            if (actionId == EditorInfo.IME_ACTION_SEND || isEnter) {
                sendCurrentMessage()
                true
            } else {
                false
            }
        }
    }

    private fun sendCurrentMessage() {
        if (isSending) return

        val message = input.text?.toString()?.trim().orEmpty()
        if (message.isBlank()) return

        input.setText("")
        addUserMessage(message)
        setSending(true)

        val request = ApartmentAssistantRequest(
            message = message,
            history = historyItems.toList(),
            language = AppLanguage.currentTag(),
            limit = 5,
        )

        lifecycleScope.launch {
            try {
                val response = ApiClient.service.apartmentsAssistant(request)
                if (response.isSuccessful) {
                    val payload = response.body()?.data
                    if (payload != null) {
                        addAssistantMessage(payload.reply)
                        renderMatches(payload.matches)
                    } else {
                        showError(
                            AppLanguage.translate(
                                "AI javobi bo'sh qaytdi",
                                "AI вернул пустой ответ",
                                "AI returned an empty reply",
                            ),
                        )
                    }
                } else {
                    val errorText = response.errorBody()?.string()?.takeIf { it.isNotBlank() }
                    showError(errorText ?: getString(R.string.error_network_generic))
                }
            } catch (error: Exception) {
                showError(error.message ?: getString(R.string.error_network_generic))
            } finally {
                setSending(false)
            }
        }
    }

    private fun renderMatches(matches: List<ApartmentAssistantMatch>) {
        matchesAdapter.submitList(matches)
        matchesSection.isVisible = matches.isNotEmpty()
        matchesTitle.text = when {
            matches.isEmpty() -> ""
            AppLanguage.currentTag() == "ru" -> "Подходящие варианты: ${matches.size}"
            AppLanguage.currentTag() == "en" -> "Suggested homes: ${matches.size}"
            else -> "Mos variantlar: ${matches.size}"
        }
    }

    private fun addUserMessage(message: String) {
        historyItems.add(AssistantHistoryItem(role = ROLE_USER, content = message))
        messagesAdapter.append(
            ConversationMessageModel(
                id = UUID.randomUUID().toString(),
                body = message,
                senderId = ME_ID,
                createdAt = Instant.now().toString(),
            ),
        )
        scrollMessagesToBottom()
    }

    private fun addAssistantMessage(message: String) {
        historyItems.add(AssistantHistoryItem(role = ROLE_ASSISTANT, content = message))
        messagesAdapter.append(
            ConversationMessageModel(
                id = UUID.randomUUID().toString(),
                body = message,
                senderId = AI_ID,
                createdAt = Instant.now().toString(),
            ),
        )
        scrollMessagesToBottom()
    }

    private fun scrollMessagesToBottom() {
        messagesRecycler.post {
            if (messagesAdapter.itemCount > 0) {
                messagesRecycler.scrollToPosition(messagesAdapter.itemCount - 1)
            }
        }
    }

    private fun setSending(sending: Boolean) {
        isSending = sending
        progress.isVisible = sending
        sendButton.isEnabled = !sending
        input.isEnabled = !sending
    }

    private fun initialAssistantGreeting(): String {
        return AppLanguage.translate(
            "Salom. Qanday uy qidiryapsiz? Masalan, budjet, xonalar soni, metro yoki maktab yaqinligini yozing.",
            "Здравствуйте. Какое жилье вы ищете? Напишите бюджет, количество комнат, метро или близость к школе.",
            "Hi. What kind of home are you looking for? Tell me your budget, room count, metro, or nearby school needs.",
        )
    }

    private fun showError(message: String) {
        Toast.makeText(requireContext(), message, Toast.LENGTH_SHORT).show()
    }

    companion object {
        private const val ME_ID = "user"
        private const val AI_ID = "assistant"
        private const val ROLE_USER = "user"
        private const val ROLE_ASSISTANT = "assistant"
    }
}

