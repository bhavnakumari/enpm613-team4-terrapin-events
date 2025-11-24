import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsService } from '../../../src/services/events.service';
import { apiClient } from '../../../src/lib/api-client';

vi.mock('../../../src/lib/api-client');

describe('EventsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllEvents', () => {
    it('should get all events successfully', async () => {
      const mockEvents = [
        { id: 'evt-1', title: 'Event 1', status: 'approved' },
        { id: 'evt-2', title: 'Event 2', status: 'approved' }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getAllEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventById', () => {
    it('should get event by id successfully', async () => {
      const mockEvent = { id: 'evt-1', title: 'Event 1', status: 'approved' };
      vi.mocked(apiClient.get).mockResolvedValue(mockEvent);

      const result = await eventsService.getEventById('evt-1');

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/evt-1');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('createEvent', () => {
    it('should create an event successfully', async () => {
      const newEvent = { title: 'New Event', description: 'Test' };
      const mockEvent = { id: 'evt-3', ...newEvent, status: 'pending' };
      vi.mocked(apiClient.post).mockResolvedValue(mockEvent);

      const result = await eventsService.createEvent(newEvent);

      expect(apiClient.post).toHaveBeenCalledWith('/api/events', newEvent);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      const updates = { title: 'Updated Event' };
      const mockEvent = { id: 'evt-1', ...updates };
      vi.mocked(apiClient.patch).mockResolvedValue(mockEvent);

      const result = await eventsService.updateEvent('evt-1', updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/evt-1', updates);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await eventsService.deleteEvent('evt-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/events/evt-1');
    });
  });

  describe('approveEvent', () => {
    it('should approve an event successfully', async () => {
      const mockEvent = { id: 'evt-1', status: 'approved' };
      vi.mocked(apiClient.patch).mockResolvedValue(mockEvent);

      const result = await eventsService.approveEvent('evt-1');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/evt-1', { status: 'approved' });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('rejectEvent', () => {
    it('should reject an event successfully', async () => {
      const mockEvent = { id: 'evt-1', status: 'rejected' };
      vi.mocked(apiClient.patch).mockResolvedValue(mockEvent);

      const result = await eventsService.rejectEvent('evt-1');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/evt-1', { status: 'rejected' });
      expect(result).toEqual(mockEvent);
    });
  });

  describe('getEventsByStatus', () => {
    it('should filter events by status', async () => {
      const mockEvents = [
        { id: 'evt-1', status: 'approved' },
        { id: 'evt-2', status: 'pending' },
        { id: 'evt-3', status: 'approved' }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getEventsByStatus('approved');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('evt-1');
      expect(result[1].id).toBe('evt-3');
    });
  });

  describe('getMyEvents', () => {
    it('should get user events successfully', async () => {
      const mockEvents = [{ id: 'evt-1', title: 'My Event' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getMyEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/my-events');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEventsByCategory', () => {
    it('should filter events by category', async () => {
      const mockEvents = [
        { id: 'evt-1', category: 'workshop' },
        { id: 'evt-2', category: 'seminar' },
        { id: 'evt-3', category: 'workshop' }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getEventsByCategory('workshop');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('evt-1');
      expect(result[1].id).toBe('evt-3');
    });
  });

  describe('getUpcomingEvents', () => {
    it('should get future events sorted by start time', async () => {
      const futureDate1 = new Date(Date.now() + 86400000).toISOString(); // +1 day
      const futureDate2 = new Date(Date.now() + 172800000).toISOString(); // +2 days
      const mockEvents = [
        { id: 'evt-2', start_time: futureDate2 },
        { id: 'evt-1', start_time: futureDate1 }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getUpcomingEvents();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('evt-1'); // Earlier event first
      expect(result[1].id).toBe('evt-2');
    });
  });

  describe('getPastEvents', () => {
    it('should get past events sorted by start time desc', async () => {
      const pastDate1 = new Date(Date.now() - 86400000).toISOString(); // -1 day
      const pastDate2 = new Date(Date.now() - 172800000).toISOString(); // -2 days
      const mockEvents = [
        { id: 'evt-2', start_time: pastDate2 },
        { id: 'evt-1', start_time: pastDate1 }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getPastEvents();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('evt-1'); // More recent event first
      expect(result[1].id).toBe('evt-2');
    });
  });

  describe('getCatalog', () => {
    it('should get event catalog successfully', async () => {
      const mockEvents = [{ id: 'evt-1', title: 'Catalog Event' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getCatalog();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/catalog');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getCategoryStats', () => {
    it('should get category statistics successfully', async () => {
      const mockStats = [
        { category: 'workshop', count: 5 },
        { category: 'seminar', count: 3 }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockStats);

      const result = await eventsService.getCategoryStats();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/categories/stats');
      expect(result).toEqual(mockStats);
    });
  });

  describe('getPendingEvents', () => {
    it('should get pending events successfully', async () => {
      const mockEvents = [{ id: 'evt-1', status: 'pending' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);

      const result = await eventsService.getPendingEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/admin/pending-events');
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getAdminStats', () => {
    it('should get admin statistics successfully', async () => {
      const mockStats = { total: 10, approved: 8, pending: 2 };
      vi.mocked(apiClient.get).mockResolvedValue(mockStats);

      const result = await eventsService.getAdminStats();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/admin/stats');
      expect(result).toEqual(mockStats);
    });
  });
});
