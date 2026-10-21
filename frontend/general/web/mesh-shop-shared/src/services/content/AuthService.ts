import { initializeApp, getApps } from "firebase/app";
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    type Auth,
} from "firebase/auth";

export const isMockMode =
    import.meta.env.VITE_USE_MOCK === "true" || (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK !== "false");
export default class AuthService {
    private static INSTANCE: AuthService;
    private auth?: Auth;
    private sessionListeners = new Set<() => void>();
    public onSessionChange(listener: () => void) {
        this.sessionListeners.add(listener);
        return () => this.sessionListeners.delete(listener);
    }
    private notifySession() {
        for (const listener of this.sessionListeners) listener();
    }
    private constructor() {}
    public static getInstance() {
        return (this.INSTANCE ??= new AuthService());
    }
    private getAuth(): Auth {
        if (this.auth) return this.auth;
        if (!import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID)
            throw new Error("Firebase is not configured. Add your Firebase values to the app's .env.local file.");
        const app =
            getApps()[0] ||
            initializeApp({
                apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
                authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
                projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
                appId: import.meta.env.VITE_FIREBASE_APP_ID,
            });
        return (this.auth = getAuth(app));
    }
    private setCookie(token: string | null) {
        document.cookie = `_secure=${token ? encodeURIComponent(token) : ""}; Path=/; Max-Age=${token ? 3600 : 0}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    }
    public async getToken(): Promise<string | null> {
        if (isMockMode || !import.meta.env.VITE_FIREBASE_API_KEY || !import.meta.env.VITE_FIREBASE_PROJECT_ID)
            return null;
        const auth = this.getAuth();
        await auth.authStateReady();
        const token = (await auth.currentUser?.getIdToken()) || null;
        this.setCookie(token);
        return token;
    }
    public async login(email?: string, password?: string, register = false): Promise<void> {
        if (isMockMode) {
            sessionStorage.setItem("mesh:demo-auth", "signed-in");
            return;
        }
        const auth = this.getAuth();
        if (email && password) {
            if (register) await createUserWithEmailAndPassword(auth, email, password);
            else await signInWithEmailAndPassword(auth, email, password);
        } else await signInWithPopup(auth, new GoogleAuthProvider());
        await this.getToken();
        this.notifySession();
    }
    public async isSignedIn() {
        return isMockMode ? sessionStorage.getItem("mesh:demo-auth") === "signed-in" : Boolean(await this.getToken());
    }
    public async logout() {
        if (!isMockMode) await signOut(this.getAuth());
        sessionStorage.removeItem("mesh:demo-auth");
        this.setCookie(null);
        this.notifySession();
    }
}
