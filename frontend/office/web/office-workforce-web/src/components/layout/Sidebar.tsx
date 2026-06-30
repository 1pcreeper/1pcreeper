import { useCompanyStore } from '@/store/useCompanyStore';
import { Building, CalendarCheck, ChevronDown, Clock, FolderTree, LayoutDashboard, User, Users } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const mainNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
    { icon: CalendarCheck, label: 'Schedules', path: 'schedules' },
];

const individualNav = [
    { icon: User, label: 'Person', path: 'persons' },
];

const companyNav = [
    { icon: Users, label: 'Staff', path: 'staffs' },
    { icon: Building, label: 'Organizations', path: 'organizations' },
    { icon: Clock, label: 'Periods', path: 'periods' },
];

export default function Sidebar() {
    const location = useLocation();
    const { currentSelectedCompany } = useCompanyStore();
    const companyId = currentSelectedCompany?.id || null;
    const [isIndividualNavOpen, setIsPeopleNavOpen] = useState(
        individualNav.some(item => location.pathname.includes(item.path))
    );
    const [isCompanyNavOpen, setIsCompanyNavOpen] = useState(
        companyNav.some(item => location.pathname.includes(item.path))
    );

    return (
        <aside className="w-48 bg-white border-r border-slate-200 flex flex-col py-4 gap-1 flex-shrink-0 overflow-y-auto hide-scrollbar z-10">
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main</div>
            {
                companyId &&
                mainNav.map((item) => (
                    <NavLink
                        key={item.path}
                        to={`/companies/${companyId}/${item.path}`}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-2.5 mx-2 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                                isActive
                                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                            )
                        }
                    >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                    </NavLink>
                ))
            }

            <div className="mt-4 mb-1 mx-2">
                <button
                    onClick={() => setIsPeopleNavOpen(!isIndividualNavOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider rounded transition-colors focus:outline-none"
                >
                    <div className="flex items-center gap-2">
                        <FolderTree className="w-3 h-3" />
                        <span>Individual</span>
                    </div>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isIndividualNavOpen ? "rotate-180" : "")} />
                </button>
            </div>

            {isIndividualNavOpen && (
                <div className="flex flex-col gap-1 anim-fade-in pl-2">
                    {
                        individualNav.map((item) => (
                            <NavLink
                                key={item.path}
                                to={`/${item.path}`}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-2.5 mx-2 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                                    )
                                }
                            >
                                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                </div>
            )}

            <div className="mt-4 mb-1 mx-2">
                <button
                    onClick={() => setIsCompanyNavOpen(!isCompanyNavOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider rounded transition-colors focus:outline-none"
                >
                    <div className="flex items-center gap-2">
                        <FolderTree className="w-3 h-3" />
                        <span>Company</span>
                    </div>
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isCompanyNavOpen ? "rotate-180" : "")} />
                </button>
            </div>

            {isCompanyNavOpen && (
                <div className="flex flex-col gap-1 anim-fade-in pl-2">
                    {
                        companyId &&
                        companyNav.map((item) => (
                            <NavLink
                                key={item.path}
                                to={`/companies/${companyId}/${item.path}`}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-2.5 mx-2 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                                    )
                                }
                            >
                                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                </div>
            )}
        </aside>
    );
}
