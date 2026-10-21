import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AccountResponseDTO } from "../models/dto/mesh.dto";
import { services } from "../services/ServiceContainer";
import { isMockMode } from "../services/content/AuthService";

interface AuthContextValue {
    account: AccountResponseDTO | null;
    loading: boolean;
    error: string;
    login: (email?: string, password?: string, register?: boolean) => Promise<void>;
    logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue>(null!);
export function AuthProvider({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
    const [account, setAccount] = useState<AccountResponseDTO | null>(null);
    const [loading, setLoading] = useState(true),
        [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        (async () => {
            if ((isMockMode && admin) || (await services.auth.isSignedIn())) {
                const account = await services.verifyAccount();
                if (active) setAccount(account);
            }
        })()
            .catch((error) => {
                if (active) setError(error.message);
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [admin]);
    const login = async (email?: string, password?: string, register?: boolean) => {
        await services.auth.login(email, password, register);
        setAccount(await services.verifyAccount());
        setError("");
    };
    const logout = async () => {
        await services.auth.logout();
        setAccount(null);
    };
    return <AuthContext.Provider value={{ account, loading, error, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
export function ProtectedRoute() {
    const { account, loading } = useAuth(),
        location = useLocation();
    if (loading)
        return (
            <div className="state-screen">
                <span className="spinner" />
                Verifying your account…
            </div>
        );
    if (!account) return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    if (
        !account.roles.some((role) =>
            ["ADMIN", "STAFF", "GENERAL_ADMIN", "GENERAL_STAFF"].includes(role.replace(/^ROLE_/, "").toUpperCase()),
        )
    )
        return (
            <div className="state-screen">
                <h1>Staff access required</h1>
                <p>Your account does not have permission to open this workspace.</p>
                <a href="/auth/login">Sign in with another account</a>
            </div>
        );
    return <Outlet />;
}
