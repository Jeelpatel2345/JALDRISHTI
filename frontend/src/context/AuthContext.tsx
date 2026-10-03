import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'default-officer',
    email: 'rajkot.officer@jaldrishti.gov.in',
    full_name: 'Vikram Mehta',
    role: 'district_officer',
    district: 'Rajkot',
    state: 'Gujarat'
  });
  const [role, setRole] = useState<UserRole>('district_officer');
  const [token, setToken] = useState<string | null>(localStorage.getItem('jaldrishti_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check active profile on mount
    const fetchProfile = async () => {
      try {
        const u = await api.getProfile();
        setUser(u);
        setRole(u.role);
      } catch (err) {
        // Fallback to demo default if backend token expired
      }
    };
    fetchProfile();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setToken(data.access_token);
      localStorage.setItem('jaldrishti_token', data.access_token);
      setUser(data.user);
      setRole(data.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jaldrishti_token');
    setToken(null);
    setUser(null);
    setRole('public');
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const data = await api.demoSwitch(newRole);
      setToken(data.access_token);
      localStorage.setItem('jaldrishti_token', data.access_token);
      setUser(data.user);
      setRole(data.user.role);
    } catch (err) {
      // Offline fallback
      setRole(newRole);
      if (user) {
        setUser({ ...user, role: newRole });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!role) return false;
    if (role === 'super_admin') return true;
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider value={{ user, role, token, isLoading, login, logout, switchRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
