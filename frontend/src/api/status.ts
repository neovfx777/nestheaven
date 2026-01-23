import apiClient from './client';

export interface StatusHistory {
  id: string;
  apartmentId: string;
  fromStatus: string;
  toStatus: string;
  changedById: string;
  changedBy: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  reason: string | null;
  createdAt: string;
}

export interface StatusTransition {
  from: string;
  to: string;
  allowed: boolean;
  description: string;
}

export interface BulkStatusResponse {
  successful: number;
  failed: number;
  errors: Array<{
    apartmentId: string;
    error: string;
  }>;
}

export const statusApi = {
  // Change apartment status
  changeStatus: async (
    apartmentId: string, 
    status: string, 
    reason?: string
  ) => {
    const response = await apiClient.put(`/apartments/${apartmentId}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  // Get status history
  getStatusHistory: async (apartmentId: string) => {
    const response = await apiClient.get<{ success: boolean; data: StatusHistory[] }>(
      `/apartments/${apartmentId}/status/history`
    );
    return response.data.data;
  },

  // Get available status transitions
  getAvailableTransitions: async (apartmentId: string) => {
    const response = await apiClient.get<{ 
      success: boolean; 
      data: {
        currentStatus: string;
        isOwner: boolean;
        userRole: string;
        availableTransitions: StatusTransition[];
      }
    }>(`/apartments/${apartmentId}/status/transitions`);
    return response.data.data;
  },

  // Bulk change status (admin only)
  bulkChangeStatus: async (
    apartmentIds: string[], 
    status: string, 
    reason?: string
  ): Promise<BulkStatusResponse> => {
    const response = await apiClient.post<{ 
      success: boolean; 
      data: BulkStatusResponse 
    }>('/apartments/bulk/status', {
      apartmentIds,
      status,
      reason,
    });
    return response.data.data;
  },

  // Mark as sold (seller only)
  markAsSold: async (
    apartmentId: string, 
    soldPrice?: number, 
    soldDate?: string, 
    buyerInfo?: string
  ) => {
    const response = await apiClient.post(`/apartments/${apartmentId}/mark-sold`, {
      soldPrice,
      soldDate,
      buyerInfo,
    });
    return response.data;
  },
};