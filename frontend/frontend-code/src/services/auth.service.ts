

import { apiClient } from '../lib/api-client';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authService = {
  
  async login(directoryId: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      directory_id: directoryId,
      password: password,
    } as LoginRequest);

    return response;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },
};
