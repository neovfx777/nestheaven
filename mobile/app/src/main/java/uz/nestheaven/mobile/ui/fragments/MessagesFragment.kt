package uz.nestheaven.mobile.ui.fragments

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import kotlinx.coroutines.launch
import uz.nestheaven.mobile.ChatActivity
import uz.nestheaven.mobile.R
import uz.nestheaven.mobile.core.ApiClient
import uz.nestheaven.mobile.core.JsonParsers
import uz.nestheaven.mobile.core.SessionManager
import uz.nestheaven.mobile.ui.adapters.ConversationAdapter

class MessagesFragment : Fragment(R.layout.fragment_messages) {

    private lateinit var sessionManager: SessionManager
    private lateinit var adapter: ConversationAdapter

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        val swipe = view.findViewById<SwipeRefreshLayout>(R.id.swipeMessages)
        val recycler = view.findViewById<RecyclerView>(R.id.recyclerConversations)
        val empty = view.findViewById<TextView>(R.id.messagesEmpty)
        val progress = view.findViewById<ProgressBar>(R.id.messagesProgress)

        adapter = ConversationAdapter { conversation ->
            startActivity(
                Intent(requireContext(), ChatActivity::class.java).apply {
                    putExtra(ChatActivity.EXTRA_CONVERSATION_ID, conversation.id)
                },
            )
        }

        recycler.layoutManager = LinearLayoutManager(requireContext())
        recycler.adapter = adapter

        swipe.setOnRefreshListener {
            loadConversations(progress, empty, swipe)
        }

        loadConversations(progress, empty, swipe)
    }

    override fun onResume() {
        super.onResume()
        view?.let { root ->
            loadConversations(
                progress = root.findViewById(R.id.messagesProgress),
                empty = root.findViewById(R.id.messagesEmpty),
                swipe = root.findViewById(R.id.swipeMessages),
            )
        }
    }

    private fun loadConversations(
        progress: ProgressBar,
        empty: TextView,
        swipe: SwipeRefreshLayout,
    ) {
        if (!sessionManager.isLoggedIn()) {
            adapter.submitList(emptyList())
            progress.isVisible = false
            swipe.isRefreshing = false
            empty.isVisible = true
            empty.text = getString(R.string.messages_login_required)
            return
        }

        viewLifecycleOwner.lifecycleScope.launch {
            progress.isVisible = true
            empty.isVisible = false

            try {
                val response = ApiClient.service.listConversations()
                if (response.isSuccessful) {
                    val meId = sessionManager.getUser()?.id
                    val items = JsonParsers.parseConversations(response.body(), meId)
                    adapter.submitList(items)
                    empty.isVisible = items.isEmpty()
                    empty.text = getString(R.string.messages_empty)
                } else {
                    adapter.submitList(emptyList())
                    empty.isVisible = true
                    empty.text = getString(R.string.messages_failed)
                }
            } catch (e: Exception) {
                adapter.submitList(emptyList())
                empty.isVisible = true
                empty.text = e.message ?: getString(R.string.messages_failed)
            } finally {
                progress.isVisible = false
                swipe.isRefreshing = false
            }
        }
    }
}

