import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../../src/services/auth.service';
import { apiClient } from '../../../src/lib/api-client';

vi.mock('../../../src/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
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
  });

  describe('logout', () => {
    it('should remove token and user from localStorage', () => {
      localStorage.setItem('access_token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));
      
      authService.logout();
      
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
