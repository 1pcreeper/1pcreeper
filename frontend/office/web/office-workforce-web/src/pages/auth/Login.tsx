import { useOfficeAuthContext } from '@/contexts/OfficeAuthContext';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const officeAuthContext = useOfficeAuthContext();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await officeAuthContext.login(name, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-sm">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Workforce Login</h1>
                {error && <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-md">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-700 transition"
                    >
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}
