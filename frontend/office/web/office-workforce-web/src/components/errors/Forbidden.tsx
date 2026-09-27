import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                    <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Denied</h1>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        You don't have the required permissions to view this page. If you believe this is a mistake, please contact your administrator.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-bold text-sm rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-sm rounded-lg transition-colors shadow-sm"
                    >
                        <Home className="w-4 h-4" />
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
}