import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: string | null;
    loading: boolean;
    login: (name: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {

    };

    const login = async (name: string, password: string) => {
        setUser(name);
        setLoading(false);
    };

    const logout = async () => {
        setUser(null);
        setLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
