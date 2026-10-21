import { useEffect, useState } from 'react';
import VehicleService from '../services/VehicleService.ts';
import { Link } from 'react-router-dom';
import { Search, Plus, Car, Calendar, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { getVrdExpiryStatus } from '../utils/vrdExpiry.ts';

interface Vehicle {
  id: number;
  registrationMark?: string;
  licensePlate?: string;
  chassisNo?: string;
  chassisNumber?: string;
  make: string;
  model: string;
  yearOfManufacture: number;
  vehicleClass: string;
  isActive: boolean;
  avatarUrl?: string;
  vrdExpiryDate?: string;
}

export function VehiclesList() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        let vehicleList: Vehicle[] = [];
        if (Array.isArray(res.data)) {
          vehicleList = res.data;
        } else if (res.data && Array.isArray((res.data as any).content)) {
          vehicleList = (res.data as any).content;
        } else if (Array.isArray(res)) {
          vehicleList = res;
        }
        setVehicles(vehicleList);
      } catch (error) {
        console.error("Failed to load vehicles", error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(fetchVehicles, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Vehicles</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage registered vehicles and documents.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search registration, make..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-zinc-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full sm:w-64"
            />
          </div>
          <Link to="/vehicles/new" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-zinc-500">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 text-center">
          <Car className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-900">No vehicles found</h3>
          <p className="text-zinc-500 mt-1">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <Link 
              key={v.id} 
              to={`/vehicles/${v.id}`}
              className="group bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
            >
              <div className="bg-zinc-100 h-44 overflow-hidden relative flex items-center justify-center border-b border-zinc-200 group-hover:bg-blue-50/50 transition-colors">
                {v.avatarUrl ? (
                  <img 
                    src={v.avatarUrl} 
                    alt={v.registrationMark} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <Car className="w-16 h-16 text-zinc-400 group-hover:text-blue-500 transition-colors" />
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
                    {v.registrationMark || v.licensePlate || `Vehicle #${v.id}`}
                  </h3>
                  <span className={clsx(
                    "px-2.5 py-0.5 rounded-full text-xs font-medium",
                    v.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {v.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-1 mb-3 flex-1">
                  <p className="text-sm text-zinc-600 font-medium">{v.yearOfManufacture} {v.make} {v.model}</p>
                  <p className="text-xs text-zinc-500">Class: {v.vehicleClass}</p>
                </div>

                {/* VRD Expiry Reminder Signals: Expiry Date + Days Left */}
                {(() => {
                  const expiry = getVrdExpiryStatus(v.vrdExpiryDate);
                  return (
                    <div className={`mb-4 p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      expiry.isExpiringSoon
                        ? 'bg-red-50 border-red-300 text-red-950'
                        : expiry.isNotSettled
                          ? 'bg-amber-50 border-amber-300 text-amber-950'
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}>
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        {expiry.isExpiringSoon ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                        ) : expiry.isNotSettled ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
                        )}
                        <div className="truncate">
                          <span className="text-[10px] text-zinc-500 block uppercase font-medium">VRD Expiry</span>
                          <span className={`font-bold text-xs truncate ${
                            expiry.isExpiringSoon 
                              ? 'text-red-700' 
                              : expiry.isNotSettled 
                                ? 'text-amber-800' 
                                : 'text-zinc-800'
                          }`}>
                            {expiry.formattedDate}
                          </span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block ${
                          expiry.isExpiringSoon
                            ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                            : expiry.isNotSettled
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {expiry.statusText}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                <div className="pt-3 border-t border-zinc-100 text-xs text-zinc-500 flex justify-between">
                  <span>VIN: {v.chassisNo || v.chassisNumber || 'N/A'}</span>
                  <span className="text-blue-600 font-medium group-hover:underline">View details &rarr;</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
