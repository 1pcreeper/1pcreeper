import { useOfficeAuthContext } from '@/contexts/OfficeAuthContext';
import CompanyContentService from '@/services/content/office/workforce/CompanyContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Building2, Loader2, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEngineStore } from '../../store/useEngineStore';

export default function Header() {
    const { logout, authOfficeUser } = useOfficeAuthContext();
    const isProcessing = useEngineStore((state) => state.isProcessing);
    const location = useLocation();
    const navigate = useNavigate();
    const paths = location.pathname.split('/').filter(Boolean);
    const currentPath = paths[paths.length - 1] || 'Dashboard';

    const { currentSelectedCompany } = useCompanyStore();
    const companyContentService = CompanyContentService.getInstance();



    return (
        <header className="h-12 flex items-center justify-between px-4 bg-white border-b border-slate-200 z-20 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 font-bold text-indigo-600">
                    <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center text-white text-xs">OW</div>
                    <span className="tracking-tight uppercase text-sm hidden sm:inline-block">Office Workforce</span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <button
                    onClick={() => navigate('/companies')}
                    title="Switch Company"
                    className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-xs font-bold text-slate-600 transition-colors"
                >
                    <Building2 className="w-3 h-3" />
                    <span className="max-w-[100px] truncate">{currentSelectedCompany && companyContentService.getDisplayName(currentSelectedCompany)}</span>
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <nav className="text-xs text-slate-500 font-medium flex gap-2">
                    <span className="text-slate-900 underline decoration-indigo-500 capitalize">{currentPath.replace('-', ' ')}</span>
                </nav>
            </div>

            <div className="flex items-center gap-6">
                {isProcessing ? (
                    <div className="flex items-center gap-2 bg-amber-50 px-2 py-1 rounded border border-amber-200 hidden sm:flex">
                        <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-700">Engine: Processing</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:flex">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-600">Engine: Idle</span>
                    </div>
                )}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold leading-none">{authOfficeUser?.displayName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{authOfficeUser?.name}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-inner shrink-0">
                        AU
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors shrink-0"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
