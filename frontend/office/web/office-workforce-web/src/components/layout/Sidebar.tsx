import { NavLink, useParams, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building, MapPin, Clock, Briefcase, Users, CalendarCheck, FolderTree, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

const mainNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: 'dashboard' },
  { icon: CalendarCheck, label: 'Schedules', path: 'schedules' },
];

const entityNav = [
  { icon: Building, label: 'Organizations', path: 'organizations' },
  { icon: MapPin, label: 'Places', path: 'places' },
  { icon: Clock, label: 'Periods', path: 'working-periods' },
  { icon: Briefcase, label: 'Occupations', path: 'occupations' },
  { icon: Users, label: 'Staff', path: 'staff' },
];

export default function Sidebar() {
  const { companyId } = useParams();
  const location = useLocation();
  const [isEntitiesOpen, setIsEntitiesOpen] = useState(
    entityNav.some(item => location.pathname.includes(item.path))
  );

  return (
    <aside className="w-48 bg-white border-r border-slate-200 flex flex-col py-4 gap-1 flex-shrink-0 overflow-y-auto hide-scrollbar z-10">
      <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main</div>
      {mainNav.map((item) => (
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
      ))}

      <div className="mt-4 mb-1 mx-2">
        <button 
          onClick={() => setIsEntitiesOpen(!isEntitiesOpen)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider rounded transition-colors focus:outline-none"
        >
          <div className="flex items-center gap-2">
            <FolderTree className="w-3 h-3" />
            <span>Entities</span>
          </div>
          <ChevronDown className={cn("w-3 h-3 transition-transform", isEntitiesOpen ? "rotate-180" : "")} />
        </button>
      </div>

      {isEntitiesOpen && (
        <div className="flex flex-col gap-1 anim-fade-in pl-2">
          {entityNav.map((item) => (
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
