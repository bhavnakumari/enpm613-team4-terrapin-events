/**
 * Event Types
 * Matches backend Event model exactly
 */

export type EventStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'cancelled';

export type EventCategory = 
  | 'academic' 
  | 'sports' 
  | 'cultural' 
  | 'workshop' 
  | 'seminar' 
  | 'social' 
  | 'career' 
  | 'other';

/**
 * Event Model
 * Complete event data from backend
 */
export interface Event {
  event_id: string;
  title: string;
  description?: string;
  category?: EventCategory;
  location: string;
  banner?: string;
  start_time: string; // ISO datetime string
  end_time?: string;
  registration_open_time?: string;
  registration_close_time?: string;
  capacity: number;
  status: EventStatus;
  organizer_id: string;
  organizer_email: string;
  requested_admin_id?: string;
  requested_admin_email?: string;
  approved_by_admin_id?: string;
  created_at: string;
  updated_at: string;
  is_paid: boolean;
  price?: number;
  currency?: string;
}

/**
 * Create Event Request
 * Data needed to create a new event
 */
export interface CreateEventRequest {
  title: string;
  description?: string;
  category?: EventCategory;
  location: string;
  banner?: string;
  start_time: string; // ISO datetime string
  end_time?: string;
  registration_open_time?: string;
  registration_close_time?: string;
  capacity: number;
  requested_admin_id?: string;
  status?: EventStatus; // 'draft' or 'pending_approval'
  is_paid?: boolean;
  price?: number;
  currency?: string;
}

/**
 * Update Event Request
 * Fields that can be updated (all optional)
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: EventCategory;
  location?: string;
  banner?: string;
  start_time?: string;
  end_time?: string;
  registration_open_time?: string;
  registration_close_time?: string;
  capacity?: number;
  status?: EventStatus;
  is_paid?: boolean;
  price?: number;
  currency?: string;
}
