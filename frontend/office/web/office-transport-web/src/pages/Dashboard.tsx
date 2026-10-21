import { useAuth } from '../components/AuthProvider.tsx';
import { Car, FileText, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  // Casting as any because the AuthProvider type hasn't been strictly updated yet to reflect the new syncUser role addition
  const role = (user as any)?.role || 'TRANSPORT_USER';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Welcome back to the Hong Kong Transport CMS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-center">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600 mr-4">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-500">Total Vehicles</h2>
            <p className="text-2xl font-semibold text-zinc-900">Manage</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-center">
          <div className="bg-green-100 p-3 rounded-lg text-green-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-500">Processed VRDs</h2>
            <p className="text-2xl font-semibold text-zinc-900">Scan</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600 mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-500">System Status</h2>
            <p className="text-2xl font-semibold text-zinc-900">Online</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 flex items-center">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-zinc-500">Your Role</h2>
            <p className="text-lg font-semibold text-zinc-900 truncate">{role}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50">
          <h2 className="text-lg font-semibold text-zinc-900">Quick Actions</h2>
        </div>
        <div className="p-6 flex gap-4">
           <Link to="/vehicles" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
             View Vehicle Directory
           </Link>
           {role === 'TRANSPORT_ADMIN' && (
             <button className="inline-flex items-center px-4 py-2 border border-zinc-300 text-sm font-medium rounded-md text-zinc-700 bg-white hover:bg-zinc-50">
               Manage Users
             </button>
           )}
        </div>
      </div>
    </div>
  );
}
