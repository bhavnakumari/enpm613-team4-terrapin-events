import { describe, it, expect, vi, beforeEach } from 'vitest';
import { eventsService } from '../src/services/events.service';
import { authService } from '../src/services/auth.service';
import { apiClient } from '../src/lib/api-client';

vi.mock('../src/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Comprehensive Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Events Service', () => {
    it('should fetch all events', async () => {
      const mockEvents = [{ event_id: '1', title: 'Test Event' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);
      
      const result = await eventsService.getAllEvents();
      
      expect(result).toEqual(mockEvents);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events');
    });

    it('should fetch event by id', async () => {
      const mockEvent = { event_id: '1', title: 'Test Event' };
      vi.mocked(apiClient.get).mockResolvedValue(mockEvent);
      
      const result = await eventsService.getEventById('1');
      
      expect(result).toEqual(mockEvent);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/1');
    });

    it('should create a new event', async () => {
      const newEvent = { title: 'New Event', description: 'Test' };
      const mockResponse = { event_id: '1', ...newEvent };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      
      const result = await eventsService.createEvent(newEvent as any);
      
      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/api/events', newEvent);
    });

    it('should update an event', async () => {
      const updates = { title: 'Updated Title' };
      const mockResponse = { event_id: '1', ...updates };
      vi.mocked(apiClient.patch).mockResolvedValue(mockResponse);
      
      const result = await eventsService.updateEvent('1', updates as any);
      
      expect(result).toEqual(mockResponse);
      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/1', updates);
    });

    it('should delete an event', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);
      
      await eventsService.deleteEvent('1');
      
      expect(apiClient.delete).toHaveBeenCalledWith('/api/events/1');
    });

    it('should fetch my events', async () => {
      const mockEvents = [{ event_id: '1', title: 'My Event' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);
      
      const result = await eventsService.getMyEvents();
      
      expect(result).toEqual(mockEvents);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/my-events');
    });

    it('should fetch catalog', async () => {
      const mockCatalog = [{ id: '1', name: 'Category' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockCatalog);
      
      const result = await eventsService.getCatalog();
      
      expect(result).toEqual(mockCatalog);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/catalog');
    });

    it('should fetch category stats', async () => {
      const mockStats = [{ category: 'workshop', count: 5 }];
      vi.mocked(apiClient.get).mockResolvedValue(mockStats);
      
      const result = await eventsService.getCategoryStats();
      
      expect(result).toEqual(mockStats);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/categories/stats');
    });

    it('should approve event', async () => {
      const mockEvent = { event_id: '1', status: 'approved' };
      vi.mocked(apiClient.patch).mockResolvedValue(mockEvent);
      
      const result = await eventsService.approveEvent('1');
      
      expect(result).toEqual(mockEvent);
      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/1', { status: 'approved' });
    });

    it('should reject event', async () => {
      const mockEvent = { event_id: '1', status: 'rejected' };
      vi.mocked(apiClient.patch).mockResolvedValue(mockEvent);
      
      const result = await eventsService.rejectEvent('1');
      
      expect(result).toEqual(mockEvent);
      expect(apiClient.patch).toHaveBeenCalledWith('/api/events/1', { status: 'rejected' });
    });

    it('should get pending events', async () => {
      const mockEvents = [{ event_id: '1', status: 'pending' }];
      vi.mocked(apiClient.get).mockResolvedValue(mockEvents);
      
      const result = await eventsService.getPendingEvents();
      
      expect(result).toEqual(mockEvents);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/admin/pending-events');
    });

    it('should get admin stats', async () => {
      const mockStats = { total: 10, pending: 2 };
      vi.mocked(apiClient.get).mockResolvedValue(mockStats);
      
      const result = await eventsService.getAdminStats();
      
      expect(result).toEqual(mockStats);
      expect(apiClient.get).toHaveBeenCalledWith('/api/events/admin/stats');
    });

    it('should filter events by status', async () => {
      const allEvents = [
        { event_id: '1', status: 'approved' },
        { event_id: '2', status: 'pending' },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(allEvents);
      
      const result = await eventsService.getEventsByStatus('approved');
      
      expect(result).toHaveLength(1);
      expect(result[0].event_id).toBe('1');
    });

    it('should filter events by category', async () => {
      const allEvents = [
        { event_id: '1', category: 'workshop' },
        { event_id: '2', category: 'seminar' },
      ];
      vi.mocked(apiClient.get).mockResolvedValue(allEvents);
      
      const result = await eventsService.getEventsByCategory('workshop');
      
      expect(result).toHaveLength(1);
      expect(result[0].event_id).toBe('1');
    });
  });

  describe('Auth Service', () => {
    it('should login successfully', async () => {
      const mockResponse = { 
        access_token: 'token123', 
        user: { directory_id: '118123456', email: 'test@umd.edu', role: 'participant' } 
      };
      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);
      
      const result = await authService.login('118123456', 'password123');
      
      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', { 
        directory_id: '118123456', 
        password: 'password123' 
      });
    });

    it('should handle login errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Invalid credentials'));
      
      await expect(authService.login('wrong', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('should logout and clear storage', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      
      authService.logout();
      
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('API Client', () => {
    it('should have all HTTP methods', () => {
      expect(apiClient.get).toBeDefined();
      expect(apiClient.post).toBeDefined();
      expect(apiClient.patch).toBeDefined();
      expect(apiClient.delete).toBeDefined();
    });
  });
});
