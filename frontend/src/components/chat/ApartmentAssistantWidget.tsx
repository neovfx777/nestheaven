import { FormEvent, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';

import { AssistantFilterPatch, ChatApartmentMatch, chatApi } from '../../api/chat';
import { getAssetUrl } from '../../api/client';

interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  matches?: ChatApartmentMatch[];
  appliedFilters?: AssistantFilterPatch;
  isError?: boolean;
}

interface ApartmentAssistantWidgetProps {
  onApplyFilters?: (patch: AssistantFilterPatch) => void;
}

const initialMessage: ChatUiMessage = {
  id: 'assistant-initial',
  role: 'assistant',
  content:
    "Assalomu alaykum! Menga talabingizni yozing, masalan: \"metroga yaqin 2 xonali 120 minggacha uy top\". Men faqat bazadagi e'lonlardan topib beraman.",
};

const ApartmentAssistantWidget = ({ onApplyFilters }: ApartmentAssistantWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatUiMessage[]>([initialMessage]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const history = useMemo(
    () =>
      messages
        .filter((item) => item.role === 'user' || item.role === 'assistant')
        .slice(-10)
        .map((item) => ({ role: item.role, content: item.content })),
    [messages]
  );

  const scrollToBottom = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  };

  const pushMessage = (message: ChatUiMessage) => {
    setMessages((prev) => {
      const next = [...prev, message];
      setTimeout(scrollToBottom, 0);
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isSending) return;

    const question = input.trim();
    if (!question) return;

    setInput('');
    pushMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
    });

    setIsSending(true);
    try {
      const response = await chatApi.askApartmentAssistant({
        message: question,
        history,
        language: 'uz',
        limit: 5,
      });

      pushMessage({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        matches: response.matches,
        appliedFilters: response.appliedFilters,
      });
    } catch (error: any) {
      pushMessage({
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        content: error?.response?.data?.error || "So'rovni bajarib bo'lmadi. Keyinroq yana urinib ko'ring.",
        isError: true,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700"
        >
          <MessageCircle className="h-4 w-4" />
          AI Chat
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-4 z-50 w-[calc(100vw-2rem)] sm:right-6 sm:w-[390px]">
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <div className="text-sm font-semibold">NestHeaven AI</div>
                  <div className="text-[11px] text-blue-100">Faqat bazadagi e&apos;lonlar</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-md p-1 hover:bg-white/15">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={scrollRef} className="max-h-[420px] space-y-3 overflow-y-auto bg-slate-50 p-3">
              {messages.map((message) => (
                <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
                  <div
                    className={`inline-block max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.isError
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.matches && message.matches.length > 0 && (
                    <div className="mt-2 space-y-2 text-left">
                      {message.matches.map((match) => (
                        <div key={match.id} className="rounded-xl border border-slate-200 bg-white p-2.5">
                          <div className="flex gap-2.5">
                            <div className="h-14 w-16 overflow-hidden rounded-md bg-slate-100">
                              {match.coverImage ? (
                                <img
                                  src={getAssetUrl(match.coverImage) || ''}
                                  alt={match.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-900">{match.title}</p>
                              <p className="text-xs text-slate-600">
                                ${match.price.toLocaleString()} | {match.rooms} xona | {match.area}m2
                              </p>
                              <p className="truncate text-xs text-slate-500">
                                {match.locationText || match.city || "Manzil ko'rsatilmagan"}
                              </p>
                              {match.metroDistanceMeters != null && (
                                <p className="text-[11px] text-blue-700">Metro: ~{match.metroDistanceMeters}m</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <a
                              href={match.url}
                              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
                            >
                              E&apos;lonni ochish
                            </a>
                          </div>
                        </div>
                      ))}

                      {message.appliedFilters && onApplyFilters && (
                        <button
                          onClick={() => onApplyFilters(message.appliedFilters || {})}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <Sparkles className="h-3 w-3" />
                          Filtrga qo&apos;llash
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Masalan: metroga yaqin 2 xonali 120 minggacha..."
                  rows={2}
                  className="max-h-28 min-h-[44px] flex-1 resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSending || !input.trim()}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ApartmentAssistantWidget;
