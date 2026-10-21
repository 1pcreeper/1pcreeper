import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { isMockMode } from "../../services/content/AuthService";
import { Brand, Notice } from "./UI";

export default function LoginPage({ admin = false }: { admin?: boolean }) {
    const auth = useAuth(),
        navigate = useNavigate(),
        location = useLocation();
    const [email, setEmail] = useState(""),
        [password, setPassword] = useState(""),
        [register, setRegister] = useState(false),
        [busy, setBusy] = useState(false),
        [error, setError] = useState("");
    const login = async (withEmail: boolean) => {
        setBusy(true);
        setError("");
        try {
            await auth.login(withEmail ? email : undefined, withEmail ? password : undefined, register);
            const from = location.state?.from;
            navigate(
                typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
                    ? from
                    : admin
                      ? "/dashboard"
                      : "/home",
                { replace: true },
            );
        } catch (error) {
            setError(error instanceof Error ? error.message : "Sign-in failed.");
        } finally {
            setBusy(false);
        }
    };
    return (
        <main className="login-page">
            <div className="login-card">
                <Brand studio={admin} />
                <span className="eyebrow">{admin ? "YOUR CREATIVE WORKSPACE" : "WELCOME TO THE DISTRICT"}</span>
                <h1>{register ? "Make yourself at home." : "A fresh perspective starts here."}</h1>
                <p>
                    {admin
                        ? "Sign in with your staff or admin account to manage spaces and assets."
                        : "Save your place in a world of independent design."}
                </p>
                {(error || auth.error) && <Notice error>{error || auth.error}</Notice>}
                {isMockMode ? (
                    <>
                        <Notice>Local demo · no Firebase account required.</Notice>
                        <button disabled={busy} className="button primary full-width" onClick={() => login(false)}>
                            Enter {admin ? "demo workspace" : "demo account"}
                            <ArrowRight size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <button disabled={busy} className="button secondary full-width" onClick={() => login(false)}>
                            Continue with Google
                        </button>
                        <div className="or-divider">or use email</div>
                        <form
                            onSubmit={(event: FormEvent) => {
                                event.preventDefault();
                                void login(true);
                            }}
                        >
                            <label>
                                Email
                                <input
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>
                            <label>
                                Password
                                <input
                                    type="password"
                                    autoComplete={register ? "new-password" : "current-password"}
                                    minLength={6}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>
                            <button disabled={busy} className="button primary full-width">
                                {busy ? "Signing in…" : register ? "Create account" : "Sign in"}
                                <ArrowRight size={18} />
                            </button>
                        </form>
                        {!admin && (
                            <button className="text-button" onClick={() => setRegister(!register)}>
                                {register ? "Already have an account? Sign in" : "New here? Create an account"}
                            </button>
                        )}
                    </>
                )}
                <Link className="text-button" to={admin ? "/dashboard" : "/home"}>
                    ← {admin ? "Back to workspace" : "Continue as a visitor"}
                </Link>
            </div>
        </main>
    );
}
