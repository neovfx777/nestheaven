import apiClient from './client';

export interface ConversationParticipant {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
}

export interface ConversationLastMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export interface ConversationSummary {
  id: string;
  apartment: { id: string; title: any } | null;
  user: ConversationParticipant | null;
  realtor: ConversationParticipant | null;
  lastMessage: ConversationLastMessage | null;
  updatedAt: string;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
}

export interface ConversationDetail {
  id: string;
  apartment: { id: string; title: any } | null;
  user: ConversationParticipant | null;
  realtor: ConversationParticipant | null;
  messages: ConversationMessage[];
  updatedAt: string;
  createdAt: string;
}

export const messagesApi = {
  listConversations: async (): Promise<ConversationSummary[]> => {
    const response = await apiClient.get<{ success: boolean; data: ConversationSummary[] }>('/messages/conversations');
    return response.data.data;
  },

  getConversation: async (id: string): Promise<ConversationDetail> => {
    const response = await apiClient.get<{ success: boolean; data: ConversationDetail }>(`/messages/conversations/${id}`);
    return response.data.data;
  },

  sendForApartment: async (apartmentId: string, text: string): Promise<{ conversationId: string; message: ConversationMessage }> => {
    const response = await apiClient.post<{ success: boolean; data: { conversationId: string; message: ConversationMessage } }>(
      '/messages/send',
      { apartmentId, text }
    );
    return response.data.data;
  },

  sendToConversation: async (conversationId: string, text: string): Promise<ConversationMessage> => {
    const response = await apiClient.post<{ success: boolean; data: ConversationMessage }>(
      `/messages/conversations/${conversationId}/messages`,
      { text }
    );
    return response.data.data;
  },
};

