import { apiClient } from '../lib/api-client';

export const registrationsService = {
  /**
   * Get current user's registrations with full event details
   */
  async getMyRegistrationsWithEvents(): Promise<any[]> {
    return apiClient.get<any[]>('/api/events/registrations/my-registrations-with-events');
  },

  /**
   * Register for an event
   */
  async registerForEvent(eventId: string): Promise<any> {
    return apiClient.post<any>(`/api/events/${eventId}/register`);
  },

  /**
   * Cancel a registration
   */
  async cancelRegistration(eventId: string): Promise<void> {
    return apiClient.delete<void>(`/api/events/${eventId}/register`);
  },
};
