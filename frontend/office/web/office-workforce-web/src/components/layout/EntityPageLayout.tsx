import { Plus, Search } from 'lucide-react';
import { ReactNode } from 'react';

interface EntityPageLayoutProps {
    title: string;
    description: string;
    onAdd: () => void;
    onSearchBarChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children: ReactNode;
    searchPlaceholder?: string;
    searchBarValue?: string
    icon?: ReactNode;
}

export function EntityPageLayout({ title, description, onAdd, children, searchPlaceholder, icon, onSearchBarChange, searchBarValue }: EntityPageLayoutProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shadow-inner">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h1>
                        <p className="text-xs text-slate-500 mt-1 placeholder-slate-400">{description}</p>
                    </div>
                </div>
                <button
                    onClick={onAdd}
                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 font-bold text-xs flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4 items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder || "Search..."}
                            onChange={onSearchBarChange}
                            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white shadow-sm"
                            value={searchBarValue}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-auto hide-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
}
