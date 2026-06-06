import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, List,
  Type, HelpCircle, BookMarked, Trophy, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/grades', label: 'Grades', icon: GraduationCap },
  { to: '/topics', label: 'Topics', icon: BookOpen },
  { to: '/subtopics', label: 'Subtopics', icon: List },
  { to: '/words', label: 'Words', icon: Type },
  { to: '/questions', label: 'Questions', icon: HelpCircle },
  { to: '/subscriptions', label: 'Subscriptions', icon: BookMarked },
  { to: '/exercise-rounds', label: 'Exercise Rounds', icon: Trophy },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={cn(
          'flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out flex-shrink-0',
          sidebarOpen ? 'w-56' : 'w-16'
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold truncate">DSE Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors',
              !sidebarOpen && 'mx-auto'
            )}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                )
              }
              title={!sidebarOpen ? label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
              {sidebarOpen && (
                <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white uppercase">
                {user?.displayName?.[0] ?? 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.name}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex h-8 w-8 mx-auto items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="p-6">{children}</div>;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
