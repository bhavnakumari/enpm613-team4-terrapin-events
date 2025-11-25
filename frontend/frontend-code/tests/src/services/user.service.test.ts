import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from '../../../src/services/user.service';
import { apiClient } from '../../../src/lib/api-client';

vi.mock('../../../src/lib/api-client');

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should get current user profile successfully', async () => {
      const mockUser = { id: 'user-1', email: 'user@test.com', role: 'student' };
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const result = await userService.getMyProfile();

      expect(apiClient.get).toHaveBeenCalledWith('/api/users/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateMyProfile', () => {
    it('should update current user profile successfully', async () => {
      const updates = { first_name: 'Updated', major: 'Computer Science' };
      const mockUser = { id: 'user-1', ...updates };
      vi.mocked(apiClient.patch).mockResolvedValue(mockUser);

      const result = await userService.updateMyProfile(updates);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/users/me', updates);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserById', () => {
    it('should get user by directory id successfully', async () => {
      const mockUser = { id: 'user-1', email: 'user@test.com', first_name: 'John' };
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const result = await userService.getUserById('118234567');

      expect(apiClient.get).toHaveBeenCalledWith('/api/users/118234567');
      expect(result).toEqual(mockUser);
    });
  });
});
