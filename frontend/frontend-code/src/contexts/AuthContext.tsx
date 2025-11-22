import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'participant' | 'admin' | 'organizer' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isParticipant: boolean;
  isOrganizer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('umd_events_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email: string, password: string, role: UserRole) => {
    // Mock login - in a real app, this would call an API
    const roleNames = {
      admin: 'Admin User',
      participant: 'John Terp',
      organizer: 'Event Organizer'
    };
    
    const newUser: User = {
      id: '1',
      name: roleNames[role as 'admin' | 'participant' | 'organizer'] || 'User',
      email: email,
      role: role as 'participant' | 'admin' | 'organizer',
    };
    
    setUser(newUser);
    localStorage.setItem('umd_events_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('umd_events_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isParticipant: user?.role === 'participant',
    isOrganizer: user?.role === 'organizer',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}