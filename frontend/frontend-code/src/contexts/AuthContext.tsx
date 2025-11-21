import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import type { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  login: (directoryId: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOrganizer: boolean;
  isParticipant: boolean;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Invalid data, clear storage
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const login = async (directoryId: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(directoryId, password);
      
      // Store token and user data
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err; // Re-throw so LoginPage can handle it
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  /**
   * Refresh User Profile
   * 
   * What it does: Fetches the latest user data from the server
   * When to use:
   * - After updating your profile
   * - To verify your session is still valid
   * - When you want the freshest data
   * 
   * Example in UserProfilePage:
   *   const { refreshUser } = useAuth();
   *   
   *   const handleSaveProfile = async () => {
   *     await userService.updateMyProfile(data);
   *     await refreshUser(); // Get fresh data from server
   *   };
   */
  const refreshUser = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const freshUserData = await userService.getMyProfile();
      
      // Update both state and localStorage
      localStorage.setItem('user', JSON.stringify(freshUserData));
      setUser(freshUserData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh user data';
      setError(errorMessage);
      
      // If refresh fails (token expired), log out
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        logout();
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOrganizer: user?.role === 'organizer',
    isParticipant: user?.role === 'participant',
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
