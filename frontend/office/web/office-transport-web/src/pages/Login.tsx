import { Car, Info } from 'lucide-react';
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider.tsx';
import OfficeAccountAuthContentService from '../services/content/office/account/auth.ts';

export function Login() {
    const { user, loading, login } = useAuth();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('123123');

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
    }

    if (user) {
        return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />;
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSigningIn(true);
        setError(null);
        try {
            const res = await OfficeAccountAuthContentService.getInstance().login({ name: username, password });
            const token = res.token || (res as any).token;
            if (token) {
                await login(token);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to sign in. Please verify your credentials.');
            setIsSigningIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-blue-600">
                    <Car className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-zinc-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-zinc-600">
                    HK Transport CMS Portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-100">

                    <div className="mb-6 bg-blue-50 p-4 rounded-md flex items-start border border-blue-100">
                        <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            Mock login mode is enabled. Use <strong>admin@system.com</strong> / <strong>123123</strong> to login.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700">
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-zinc-300 rounded-md shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSigningIn}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSigningIn ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
