import apiClient from './client';

export interface RealtorAvailabilityBlock {
  id: string;
  startAt: string;
  endAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface RealtorAvailabilityResponse {
  from: string;
  to: string;
  blocks: RealtorAvailabilityBlock[];
}

export interface RealtorBooking {
  id: string;
  apartmentId: string;
  userId: string;
  startAt: string;
  endAt: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  apartment?: { id: string; title: any };
  user?: { id: string; fullName: string; email: string; phone?: string | null } | null;
}

export interface RealtorBookingsResponse {
  from: string;
  to: string;
  bookings: RealtorBooking[];
}

export const realtorsApi = {
  getMyAvailability: async (from?: string, to?: string): Promise<RealtorAvailabilityResponse> => {
    const response = await apiClient.get<{ success: boolean; data: RealtorAvailabilityResponse }>('/realtors/me/availability', {
      params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });
    return response.data.data;
  },

  createAvailability: async (startAt: string, endAt: string): Promise<RealtorAvailabilityBlock> => {
    const response = await apiClient.post<{ success: boolean; data: RealtorAvailabilityBlock }>('/realtors/me/availability', {
      startAt,
      endAt,
    });
    return response.data.data;
  },

  deleteAvailability: async (id: string): Promise<void> => {
    await apiClient.delete(`/realtors/me/availability/${id}`);
  },

  getMyBookings: async (from?: string, to?: string): Promise<RealtorBookingsResponse> => {
    const response = await apiClient.get<{ success: boolean; data: RealtorBookingsResponse }>('/realtors/me/bookings', {
      params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });
    return response.data.data;
  },
};

