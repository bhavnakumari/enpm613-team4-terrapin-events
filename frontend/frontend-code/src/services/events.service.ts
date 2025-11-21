import { apiClient } from '../lib/api-client';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../types/event';

export const eventsService = {
 
  async getAllEvents(): Promise<Event[]> {
    return apiClient.get<Event[]>('/api/events');
  },

  async getEventById(eventId: string): Promise<Event> {
    return apiClient.get<Event>(`/api/events/${eventId}`);
  },

  async createEvent(data: CreateEventRequest): Promise<Event> {
    return apiClient.post<Event>('/api/events', data);
  },

  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<Event> {
    return apiClient.patch<Event>(`/api/events/${eventId}`, data);
  },


  async deleteEvent(eventId: string): Promise<void> {
    return apiClient.delete<void>(`/api/events/${eventId}`);
  },

  async approveEvent(eventId: string): Promise<Event> {
    return apiClient.post<Event>(`/api/events/${eventId}/approve`);
  },

  async rejectEvent(eventId: string): Promise<Event> {
    return apiClient.post<Event>(`/api/events/${eventId}/reject`);
  },


  async getEventsByStatus(status: Event['status']): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.status === status);
  },

  async getMyEvents(organizerId: string): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.organizer_id === organizerId);
  },

  async getEventsByCategory(category: Event['category']): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    return allEvents.filter(event => event.category === category);
  },

  async getUpcomingEvents(): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    const now = new Date();
    return allEvents
      .filter(event => new Date(event.start_time) > now)
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  },

  async getPastEvents(): Promise<Event[]> {
    const allEvents = await this.getAllEvents();
    const now = new Date();
    return allEvents
      .filter(event => new Date(event.start_time) <= now)
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  },
};
