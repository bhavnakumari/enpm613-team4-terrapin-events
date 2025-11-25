import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../../../src/contexts/AuthContext';
import { authService } from '../../../src/services/auth.service';
import { userService } from '../../../src/services/user.service';

vi.mock('../../../src/services/auth.service');
vi.mock('../../../src/services/user.service');

// Test component that uses the auth context
function TestComponent() {
  const { 
    user, 
    login, 
    logout, 
    refreshUser, 
    isAuthenticated, 
    isAdmin, 
    isOrganizer, 
    isParticipant,
    isLoading,
    error 
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test', 'password');
    } catch (e) {
      // Error handled by context
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshUser();
    } catch (e) {
      // Error handled by context
    }
  };

  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="isOrganizer">{isOrganizer ? 'true' : 'false'}</div>
      <div data-testid="isParticipant">{isParticipant ? 'true' : 'false'}</div>
      <div data-testid="isLoading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={handleLogin}>Login</button>
      <button onClick={logout}>Logout</button>
      <button onClick={handleRefresh}>Refresh</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('provides initial unauthenticated state', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });
    expect(screen.getByTestId('user').textContent).toBe('No user');
    expect(screen.getByTestId('isAdmin').textContent).toBe('false');
  });

  it('loads user from localStorage on mount', async () => {
    const mockUser = {
      id: '1',
      email: 'test@umd.edu',
      first_name: 'Test',
      last_name: 'User',
      role: 'participant' as const,
      directory_id: 'test123',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@umd.edu');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('isParticipant').textContent).toBe('true');
    });
  });

  it('handles login successfully', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'admin@umd.edu',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin' as const,
      directory_id: 'admin123',
    };

    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'new-token',
      token_type: 'bearer',
      user: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('admin@umd.edu');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
      expect(screen.getByTestId('isAdmin').textContent).toBe('true');
    });

    expect(localStorage.getItem('access_token')).toBe('new-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('handles login error', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBe('Invalid credentials');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });
  });

  it('handles logout', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'test@umd.edu',
      first_name: 'Test',
      last_name: 'User',
      role: 'participant' as const,
      directory_id: 'test123',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    });

    const logoutButton = screen.getByText('Logout');
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('No user');
    });

    expect(authService.logout).toHaveBeenCalled();
  });

  it('refreshes user data successfully', async () => {
    const user = userEvent.setup();
    const initialUser = {
      id: '1',
      email: 'test@umd.edu',
      first_name: 'Test',
      last_name: 'User',
      role: 'participant' as const,
      directory_id: 'test123',
    };

    const updatedUser = {
      ...initialUser,
      first_name: 'Updated',
      last_name: 'Name',
    };

    localStorage.setItem('user', JSON.stringify(initialUser));
    localStorage.setItem('access_token', 'test-token');

    vi.mocked(userService.getMyProfile).mockResolvedValue(updatedUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    await waitFor(() => {
      const userData = JSON.parse(localStorage.getItem('user')!);
      expect(userData.first_name).toBe('Updated');
    });
  });

  it('logs out on refresh error with 401', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: '1',
      email: 'test@umd.edu',
      first_name: 'Test',
      last_name: 'User',
      role: 'participant' as const,
      directory_id: 'test123',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'expired-token');

    vi.mocked(userService.getMyProfile).mockRejectedValue(new Error('401 Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('true');
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });
  });

  it('identifies organizer role correctly', async () => {
    const mockUser = {
      id: '1',
      email: 'organizer@umd.edu',
      first_name: 'Event',
      last_name: 'Organizer',
      role: 'organizer' as const,
      directory_id: 'org123',
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('access_token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isOrganizer').textContent).toBe('true');
      expect(screen.getByTestId('isAdmin').textContent).toBe('false');
      expect(screen.getByTestId('isParticipant').textContent).toBe('false');
    });
  });

  it('clears invalid localStorage data on mount', async () => {
    localStorage.setItem('user', 'invalid-json');
    localStorage.setItem('access_token', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
    });

    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('throws error when useAuth is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });
});
