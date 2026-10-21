import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AuthService from '../services/AuthService.ts';

interface AppUser {
  id: number;
  uid: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const res = await AuthService.getInstance().verify();
        const userData: any = res.data || res;
        setUser(userData);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const login = async (token: string) => {
    localStorage.setItem('auth_token', token);
    await verifyToken();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
