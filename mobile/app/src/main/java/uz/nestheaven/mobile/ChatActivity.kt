package uz.nestheaven.mobile

import android.os.Bundle
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.isVisible
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.appbar.MaterialToolbar
import com.google.android.material.button.MaterialButton
import com.google.gson.JsonObject
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.ConversationDetailModel
import uz.nestheaven.mobile.core.ConversationMessageModel
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SendMessageRequest
import uz.nestheaven.mobile.core.SendToConversationRequest
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ChatMessagesAdapter

class ChatActivity : AppCompatActivity() {

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ChatMessagesAdapter
    private lateinit var recycler: RecyclerView
    private lateinit var progress: ProgressBar
    private lateinit var input: EditText
    private lateinit var sendButton: MaterialButton

    private var conversationId: String? = null
    private var apartmentId: String? = null
    private var meId: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ApiClient.init(applicationContext)
        sessionManager = SessionManager(this)
        meId = sessionManager.getUser()?.id.orEmpty()

        setContentView(R.layout.activity_chat)

        val toolbar = findViewById<MaterialToolbar>(R.id.chatToolbar)
        toolbar.setNavigationIcon(R.drawable.ic_arrow_back_24)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.chat_title)
        toolbar.setNavigationOnClickListener { finish() }

        conversationId = intent.getStringExtra(EXTRA_CONVERSATION_ID)
        apartmentId = intent.getStringExtra(EXTRA_APARTMENT_ID)

        recycler = findViewById(R.id.chatRecycler)
        progress = findViewById(R.id.chatProgress)
        input = findViewById(R.id.chatInput)
        sendButton = findViewById(R.id.chatSendButton)

        val layoutManager = LinearLayoutManager(this).apply {
            stackFromEnd = true
        }

        adapter = ChatMessagesAdapter(meId)
        recycler.layoutManager = layoutManager
        recycler.adapter = adapter

        val sendCurrent = {
            val text = input.text?.toString()?.trim().orEmpty()
            if (text.isBlank()) return@sendCurrent
            sendMessage(text)
        }

        sendButton.setOnClickListener { sendCurrent() }
        input.setOnEditorActionListener { _, actionId, _ ->
            if (actionId == EditorInfo.IME_ACTION_SEND) {
                sendCurrent()
                true
            } else {
                false
            }
        }

        if (!sessionManager.isLoggedIn()) {
            Toast.makeText(this, getString(R.string.chat_login_required), Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        conversationId?.let { loadConversation(it) }
    }

    private fun loadConversation(id: String) {
        lifecycleScope.launch {
            progress.isVisible = true
            try {
                val response = ApiClient.service.getConversation(id)
                if (response.isSuccessful) {
                    val model = JsonParsers.parseConversationDetail(response.body(), meId)
                    renderConversation(model)
                } else {
                    Toast.makeText(this@ChatActivity, getString(R.string.chat_failed_load), Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@ChatActivity,
                    e.message ?: getString(R.string.chat_failed_load),
                    Toast.LENGTH_SHORT,
                ).show()
            } finally {
                progress.isVisible = false
            }
        }
    }

    private fun renderConversation(model: ConversationDetailModel?) {
        if (model == null) return
        adapter.submitList(model.messages)
        scrollToBottom()
    }

    private fun sendMessage(text: String) {
        val currentConversationId = conversationId
        val currentApartmentId = apartmentId

        sendButton.isEnabled = false

        lifecycleScope.launch {
            try {
                if (!currentConversationId.isNullOrBlank()) {
                    val response = ApiClient.service.sendToConversation(
                        currentConversationId,
                        SendToConversationRequest(text = text),
                    )

                    if (response.isSuccessful) {
                        val message = parseMessageFromSend(response.body())
                        if (message != null) {
                            input.setText("")
                            adapter.append(message)
                            scrollToBottom()
                        }
                    } else {
                        Toast.makeText(this@ChatActivity, getString(R.string.chat_failed_send), Toast.LENGTH_SHORT).show()
                    }
                } else if (!currentApartmentId.isNullOrBlank()) {
                    val response = ApiClient.service.sendMessage(
                        SendMessageRequest(apartmentId = currentApartmentId, text = text),
                    )

                    val createdConversationId = response.body()
                        ?.getAsJsonObject("data")
                        ?.get("conversationId")
                        ?.asString
                        ?.trim()
                        .orEmpty()

                    if (response.isSuccessful && createdConversationId.isNotBlank()) {
                        input.setText("")
                        conversationId = createdConversationId
                        loadConversation(createdConversationId)
                    } else {
                        Toast.makeText(this@ChatActivity, getString(R.string.chat_failed_send), Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@ChatActivity, getString(R.string.chat_failed_send), Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@ChatActivity,
                    e.message ?: getString(R.string.chat_failed_send),
                    Toast.LENGTH_SHORT,
                ).show()
            } finally {
                sendButton.isEnabled = true
            }
        }
    }

    private fun parseMessageFromSend(root: JsonObject?): ConversationMessageModel? {
        val obj = root
            ?.getAsJsonObject("data")
            ?: return null

        val id = obj.get("id")?.asString?.trim().orEmpty()
        if (id.isBlank()) return null

        return ConversationMessageModel(
            id = id,
            body = obj.get("body")?.asString.orEmpty(),
            senderId = obj.get("senderId")?.asString.orEmpty(),
            createdAt = obj.get("createdAt")?.asString,
        )
    }

    private fun scrollToBottom() {
        if (adapter.itemCount == 0) return
        recycler.scrollToPosition(adapter.itemCount - 1)
    }

    companion object {
        const val EXTRA_CONVERSATION_ID = "extra_conversation_id"
        const val EXTRA_APARTMENT_ID = "extra_apartment_id"
    }
}

