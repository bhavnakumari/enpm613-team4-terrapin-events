import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrationsService } from '../../../src/services/registrations.service';
import { apiClient } from '../../../src/lib/api-client';

vi.mock('../../../src/lib/api-client');

describe('RegistrationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyRegistrationsWithEvents', () => {
    it('should get user registrations with event details successfully', async () => {
      const mockRegistrations = [
        { 
          id: 'reg-1', 
          event: { id: 'evt-1', title: 'Event 1' }, 
          status: 'confirmed' 
        },
        { 
          id: 'reg-2', 
          event: { id: 'evt-2', title: 'Event 2' }, 
          status: 'waitlisted' 
        }
      ];
      vi.mocked(apiClient.get).mockResolvedValue(mockRegistrations);

      const result = await registrationsService.getMyRegistrationsWithEvents();

      expect(apiClient.get).toHaveBeenCalledWith('/api/events/registrations/my-registrations-with-events');
      expect(result).toEqual(mockRegistrations);
    });
  });

  describe('registerForEvent', () => {
    it('should register for an event successfully', async () => {
      const mockRegistration = { id: 'reg-1', event_id: 'evt-1', status: 'confirmed' };
      vi.mocked(apiClient.post).mockResolvedValue(mockRegistration);

      const result = await registrationsService.registerForEvent('evt-1');

      expect(apiClient.post).toHaveBeenCalledWith('/api/events/evt-1/register', undefined);
      expect(result).toEqual(mockRegistration);
    });

    it('should register for an event with payment data', async () => {
      const paymentData = { method: 'card', amount: 50 };
      const mockRegistration = { id: 'reg-1', event_id: 'evt-1', status: 'confirmed' };
      vi.mocked(apiClient.post).mockResolvedValue(mockRegistration);

      const result = await registrationsService.registerForEvent('evt-1', paymentData);

      expect(apiClient.post).toHaveBeenCalledWith('/api/events/evt-1/register', paymentData);
      expect(result).toEqual(mockRegistration);
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel a registration successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue(undefined);

      await registrationsService.cancelRegistration('evt-1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/events/evt-1/register');
    });
  });
});
