import apiClient from './client';

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdAt: string;
  createdById?: string | null;
}

export const broadcastsApi = {
  getBroadcasts: async (limit: number = 1): Promise<BroadcastMessage[]> => {
    const response = await apiClient.get<{ success: boolean; data: BroadcastMessage[] }>(
      '/broadcasts',
      { params: { limit } }
    );
    return response.data.data || [];
  },
  createBroadcast: async (data: { title: string; message: string; isActive?: boolean }) => {
    const response = await apiClient.post<{ success: boolean; data: BroadcastMessage }>(
      '/broadcasts',
      data
    );
    return response.data.data;
  },
  updateBroadcast: async (
    id: string,
    data: Partial<{ title: string; message: string; isActive: boolean }>
  ) => {
    const response = await apiClient.patch<{ success: boolean; data: BroadcastMessage }>(
      `/broadcasts/${id}`,
      data
    );
    return response.data.data;
  },
  deleteBroadcast: async (id: string) => {
    await apiClient.delete(`/broadcasts/${id}`);
  },
};
