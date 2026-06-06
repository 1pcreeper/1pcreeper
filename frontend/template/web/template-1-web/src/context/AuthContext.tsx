import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '@/services/AuthService';
import Cookies from 'js-cookie';
import type { AppUserDTO } from '@/dto/user.dto';
interface AuthContextValue {
  user: AppUserDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (name: string, password: string) => Promise<AppUserDTO>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUserDTO | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = Cookies.get('_secure') || null;
    if (storedToken) {
      AuthService.verify(storedToken)
        .then((u) => {
          setUser(u.user);
          setToken(storedToken);
        })
        .catch(() => {
          Cookies.remove('_secure');
          setUser(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(name: string, password: string) {
    const response = await AuthService.login({ name, password });
    setToken(response.accessToken);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    Cookies.remove('_secure');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
