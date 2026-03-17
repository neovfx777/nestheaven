import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { messagesApi, type ConversationSummary } from '../../api/messages';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

function pickTitle(title: any): string {
  if (!title) return 'Apartment';
  if (typeof title === 'string') {
    try {
      const parsed = JSON.parse(title);
      if (parsed && typeof parsed === 'object') {
        return parsed.en || parsed.uz || parsed.ru || 'Apartment';
      }
    } catch {
      return title;
    }
    return title;
  }
  if (typeof title === 'object') {
    return title.en || title.uz || title.ru || 'Apartment';
  }
  return 'Apartment';
}

function getCounterpart(conversation: ConversationSummary, meId: string) {
  if (conversation.user?.id === meId) return conversation.realtor;
  if (conversation.realtor?.id === meId) return conversation.user;
  return conversation.realtor || conversation.user;
}

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const meId = user?.id || '';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [text, setText] = useState('');

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['messages-conversations'],
    queryFn: () => messagesApi.listConversations(),
  });

  useEffect(() => {
    if (!selectedId && conversations && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selectedConversation = useMemo(
    () => conversations?.find((c) => c.id === selectedId) || null,
    [conversations, selectedId]
  );

  const { data: conversationDetail, isLoading: conversationLoading } = useQuery({
    queryKey: ['messages-conversation', selectedId],
    queryFn: () => messagesApi.getConversation(selectedId as string),
    enabled: !!selectedId,
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error('No conversation selected');
      if (!text.trim()) throw new Error('Message is empty');
      return messagesApi.sendToConversation(selectedId, text.trim());
    },
    onSuccess: async () => {
      setText('');
      await queryClient.invalidateQueries({ queryKey: ['messages-conversation', selectedId] });
      await queryClient.invalidateQueries({ queryKey: ['messages-conversations'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send message');
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 rounded-lg">
          <MessageSquare className="h-6 w-6 text-primary-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Chat with realtors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-gray-900 mb-3">Conversations</div>

          {conversationsLoading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : conversations && conversations.length ? (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const active = conversation.id === selectedId;
                const counterpart = meId ? getCounterpart(conversation, meId) : null;
                return (
                  <button
                    key={conversation.id}
                    className={`w-full text-left border rounded-lg p-3 hover:bg-gray-50 ${
                      active ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedId(conversation.id)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-gray-900 truncate">
                        {counterpart?.fullName || counterpart?.email || 'Conversation'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 truncate">
                      {conversation.apartment ? pickTitle(conversation.apartment.title) : ''}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {conversation.lastMessage?.body || 'No messages yet'}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-gray-600">No conversations yet.</div>
          )}
        </Card>

        <Card className="p-4 lg:col-span-2">
          {!selectedId ? (
            <div className="text-sm text-gray-600">Select a conversation to start chatting.</div>
          ) : conversationLoading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : conversationDetail ? (
            <div className="flex flex-col h-[70vh]">
              <div className="border-b pb-3 mb-3">
                <div className="text-sm font-semibold text-gray-900">
                  {conversationDetail.apartment ? pickTitle(conversationDetail.apartment.title) : 'Conversation'}
                </div>
              </div>

              <div className="flex-1 overflow-auto space-y-2 pr-2">
                {conversationDetail.messages.map((message) => {
                  const isMine = message.senderId === meId;
                  return (
                    <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          isMine ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div>{message.body}</div>
                        <div className={`text-[10px] mt-1 ${isMine ? 'text-primary-100' : 'text-gray-500'}`}>
                          {new Date(message.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t mt-3">
                <div className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your message..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMutation.mutate();
                      }
                    }}
                  />
                  <Button onClick={() => sendMutation.mutate()} disabled={sendMutation.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">Conversation not found.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

