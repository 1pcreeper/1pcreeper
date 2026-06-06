import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LogoutPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    function handleLogout() {
        logout();
        navigate('/login');
    }
    useEffect(() => {
        handleLogout();
    }, []); // Run once on component mount
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">You have been logged out</h1>
                <p className="text-sm text-slate-500 mb-6">Thank you for using the DSE Admin Console. See you next time!</p>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Log in again
                </button>
            </div>
        </div>
    );
}