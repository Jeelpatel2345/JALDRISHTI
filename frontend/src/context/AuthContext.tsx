import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { supabaseAuth, isSupabaseConfigured } from '../services/supabase';

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  district: string;
  state: string;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  isSupabaseLive: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialUser = (): User | null => {
    try {
      const saved = localStorage.getItem('jaldrishti_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  };

  const [user, setUser] = useState<User | null>(getInitialUser);
  const [role, setRole] = useState<UserRole>(() => getInitialUser()?.role || 'public');
  const [token, setToken] = useState<string | null>(localStorage.getItem('jaldrishti_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured) {
          const session = await supabaseAuth.getSession();
          if (session) {
            setUser(session.user);
            setRole(session.user.role);
            setToken(session.token);
            localStorage.setItem('jaldrishti_user', JSON.stringify(session.user));
            localStorage.setItem('jaldrishti_token', session.token);
            return;
          }
        }

        // Check if there is an active local session
        const saved = localStorage.getItem('jaldrishti_user');
        const savedToken = localStorage.getItem('jaldrishti_token');
        if (saved && savedToken) {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          setRole(parsed.role);
          setToken(savedToken);
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        try {
          const res = await supabaseAuth.signIn(email, pass);
          setUser(res.user);
          setRole(res.user.role);
          setToken(res.token);
          localStorage.setItem('jaldrishti_user', JSON.stringify(res.user));
          localStorage.setItem('jaldrishti_token', res.token);
          return;
        } catch (sbErr: any) {
          console.warn('Supabase sign-in error, falling back to platform auth:', sbErr.message);
        }
      }

      const data = await api.login(email, pass);
      setToken(data.access_token);
      setUser(data.user);
      setRole(data.user.role);
      localStorage.setItem('jaldrishti_user', JSON.stringify(data.user));
      localStorage.setItem('jaldrishti_token', data.access_token);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (regData: RegisterData) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured) {
        try {
          const res = await supabaseAuth.signUp(regData);
          if (res.token) {
            setUser(res.user);
            setRole(res.user.role);
            setToken(res.token);
            localStorage.setItem('jaldrishti_user', JSON.stringify(res.user));
            localStorage.setItem('jaldrishti_token', res.token);
            return;
          }
        } catch (sbErr: any) {
          console.warn('Supabase sign-up error, falling back:', sbErr.message);
        }
      }

      const createdUser: User = {
        id: `usr-${Date.now()}`,
        email: regData.email,
        full_name: regData.fullName,
        role: regData.role,
        district: regData.district,
        state: regData.state
      };
      const dummyToken = `jwt-token-${Date.now()}`;
      setUser(createdUser);
      setRole(createdUser.role);
      setToken(dummyToken);
      localStorage.setItem('jaldrishti_user', JSON.stringify(createdUser));
      localStorage.setItem('jaldrishti_token', dummyToken);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabaseAuth.signOut();
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('jaldrishti_user');
    localStorage.removeItem('jaldrishti_token');
    setToken(null);
    setUser(null);
    setRole('public');
  };

  const switchRole = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const demoEmails: Record<UserRole, string> = {
        super_admin: 'national.admin@jaldrishti.gov.in',
        district_officer: 'rajkot.officer@jaldrishti.gov.in',
        field_surveyor: 'field.surveyor@jaldrishti.gov.in',
        analyst: 'analyst@jaldrishti.gov.in',
        reviewer: 'auditor@jaldrishti.gov.in',
        public: 'citizen@jaldrishti.gov.in'
      };

      const demoNames: Record<UserRole, string> = {
        super_admin: 'Dr. Ramesh Sharma',
        district_officer: 'Vikram Mehta',
        field_surveyor: 'Rameshwar Yadav',
        analyst: 'Dr. Ananya Roy',
        reviewer: 'Col. K.S. Rathore',
        public: 'Public Citizen'
      };

      const demoUser: User = {
        id: `usr-${newRole}`,
        email: demoEmails[newRole] || 'officer@jaldrishti.gov.in',
        full_name: demoNames[newRole] || 'Department Officer',
        role: newRole,
        district: newRole === 'district_officer' ? 'Rajkot' : 'Ahmednagar',
        state: newRole === 'district_officer' ? 'Gujarat' : 'Maharashtra'
      };

      const dummyToken = `token-demo-${newRole}-${Date.now()}`;
      setUser(demoUser);
      setRole(newRole);
      setToken(dummyToken);
      localStorage.setItem('jaldrishti_user', JSON.stringify(demoUser));
      localStorage.setItem('jaldrishti_token', dummyToken);
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
    <AuthContext.Provider value={{ 
      user, 
      role, 
      token, 
      isLoading, 
      isSupabaseLive: isSupabaseConfigured,
      login, 
      register, 
      logout, 
      switchRole, 
      hasPermission 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
