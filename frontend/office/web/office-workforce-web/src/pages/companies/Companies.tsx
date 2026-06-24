import { ArrowRight, Building2, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Company {
    id: string;
    name: string;
    activeStaff: number;
}

const mockCompanies: Company[] = [
    { id: 'c1', name: 'Acme Corp', activeStaff: 42 },
    { id: 'c2', name: 'Globex Inc', activeStaff: 120 },
    { id: 'c3', name: 'Initech', activeStaff: 8 },
];

export default function Companies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<Company[]>(mockCompanies);
    const [isCreating, setIsCreating] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    const handleSelectCompany = (id: string) => {
        navigate(`/companies/${id}/dashboard`);
    };

    const handleCreateCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim()) return;

        const newCompany: Company = {
            id: `c${Date.now()}`,
            name: newCompanyName,
            activeStaff: 0,
        };
        setCompanies([...companies, newCompany]);
        setNewCompanyName('');
        setIsCreating(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Select a Company</h1>
                    <p className="text-slate-500 max-w-sm mx-auto">Choose an existing company to manage or create a new one to get started.</p>
                </div>

                <div className="bg-white border text-left border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your Companies</h2>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                            <Plus className="w-3 h-3" />
                            NEW COMPANY
                        </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {companies.map(company => (
                            <button
                                key={company.id}
                                onClick={() => handleSelectCompany(company.id)}
                                className="w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                            >
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{company.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{company.activeStaff} Active Staff</p>
                                </div>
                                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </button>
                        ))}
                        {companies.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                No companies found. Create one to get started.
                            </div>
                        )}
                    </div>
                </div>

                {isCreating && (
                    <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Create New Company</h3>
                        <form onSubmit={handleCreateCompany} className="flex gap-3">
                            <input
                                type="text"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="Company Name"
                                className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!newCompanyName.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                Create
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
