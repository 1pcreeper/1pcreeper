import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppShell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans antialiased">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
