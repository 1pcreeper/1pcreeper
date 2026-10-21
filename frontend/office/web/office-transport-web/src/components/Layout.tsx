import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider.tsx';
import { LogOut, Car, LayoutDashboard, Menu, Shield } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

export function Layout() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  const handleLogout = () => {
    logout();
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <Car className="w-6 h-6 text-blue-600 mr-2" />
          <span className="text-lg font-semibold text-zinc-900">HK Transport CMS</span>
        </div>
        
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={clsx("w-5 h-5 mr-3", isActive ? "text-blue-700" : "text-zinc-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button 
            className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-zinc-900">{user.email}</span>
              <span className="text-xs text-zinc-500 flex items-center mt-0.5">
                <Shield className="w-3 h-3 mr-1" />
                {user.role || 'TRANSPORT_USER'}
              </span>
            </div>
            <div className="h-8 w-px bg-zinc-200 hidden sm:block mx-2" />
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </header>
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
