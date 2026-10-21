import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VehicleService from '../services/VehicleService.ts';
import { ArrowLeft, Save, Car, Shield, Calendar, FileText, User } from 'lucide-react';
import { SearchablePersonSelect } from '../components/SearchablePersonSelect.tsx';
import { PersonSummaryDTO } from '../models/dto/office/transport/object.dto.ts';

export function AddVehicle() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPersonUid, setSelectedPersonUid] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<PersonSummaryDTO | undefined>(undefined);

  const [formData, setFormData] = useState({
    licensePlate: '',
    chassisNumber: '',
    engineNumber: '',
    color: '',
    make: '',
    model: '',
    yearOfManufacture: new Date().getFullYear().toString(),
    vehicleClass: 'PRIVATE_CAR',
    fuelType: 'PETROL',
    seatingCapacity: '5',
    engineCapacityCc: '1500',
    vrdExpiryDate: '',
    avatarUrl: '',
    // Additional details
    insuranceCompany: '',
    insurancePolicyNumber: '',
    insuranceExpiryDate: '',
    firstRegistrationDate: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePersonChange = (personUid: string, person?: PersonSummaryDTO) => {
    setSelectedPersonUid(personUid);
    setSelectedPerson(person);
    if (error && personUid) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonUid) {
      setError('Please select a registered owner (Person UID is required by the backend system).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        personUid: selectedPersonUid,
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        registrationMark: formData.licensePlate.trim().toUpperCase(),
        chassisNumber: formData.chassisNumber.trim(),
        chassisNo: formData.chassisNumber.trim(),
        engineNumber: formData.engineNumber.trim() || undefined,
        color: formData.color.trim() || undefined,
        make: formData.make.trim(),
        model: formData.model.trim(),
        yearOfManufacture: formData.yearOfManufacture ? parseInt(formData.yearOfManufacture) : undefined,
        vehicleClass: formData.vehicleClass,
        fuelType: formData.fuelType,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        seatCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : undefined,
        engineCapacityCc: formData.engineCapacityCc ? parseInt(formData.engineCapacityCc) : undefined,
        cylinderCapacityCc: formData.engineCapacityCc ? parseInt(formData.engineCapacityCc) : undefined,
        vrdExpiryDate: formData.vrdExpiryDate || undefined,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        insuranceCompany: formData.insuranceCompany.trim() || undefined,
        insurancePolicyNumber: formData.insurancePolicyNumber.trim() || undefined,
        insuranceExpiryDate: formData.insuranceExpiryDate || undefined,
        firstRegistrationDate: formData.firstRegistrationDate || undefined,
        notes: formData.notes.trim() || undefined
      };

      const res = await VehicleService.getInstance().createVehicle(payload);
      const newId = res.data?.id || (res as any).id;
      navigate(`/vehicles/${newId}`);
    } catch (err: any) {
      console.error('Failed to create vehicle:', err);
      setError(err.message || 'Failed to create vehicle. Please verify all required fields.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <Link to="/vehicles" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vehicles
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Register New Vehicle</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Add a new vehicle record and link it directly to a registered person owner via gRPC workforce directory.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          
          {/* Section 1: Owner Linking (gRPC-backed) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-semibold text-zinc-900">Registered Owner Linking (gRPC)</h2>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium ml-auto">
                Required by Backend
              </span>
            </div>

            <div>
              <SearchablePersonSelect
                value={selectedPersonUid}
                onChange={handlePersonChange}
                required={true}
                label="Registered Owner (Person Search)"
              />
              <p className="text-xs text-zinc-500 mt-1.5">
                Search persons by name, HKID, phone, or UID resolved across microservice boundaries via gRPC directory lookup.
              </p>
            </div>
          </div>

          {/* Section 2: Core Vehicle Specifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Car className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-semibold text-zinc-900">Vehicle Identification & Specifications</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  License Plate / Reg Mark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  required
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase font-mono"
                  placeholder="e.g. AB1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Chassis Number (VIN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="chassisNumber"
                  required
                  value={formData.chassisNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder="e.g. JT2BF22K1W0012345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Engine Number
                </label>
                <input
                  type="text"
                  name="engineNumber"
                  value={formData.engineNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder="e.g. 2ZR-FE-98765"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Make <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="make"
                  required
                  value={formData.make}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. TOYOTA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  required
                  value={formData.model}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. COROLLA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Year of Manufacture <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="yearOfManufacture"
                  required
                  min="1900"
                  max="2100"
                  value={formData.yearOfManufacture}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. WHITE / METALLIC GREY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Vehicle Class
                </label>
                <select
                  name="vehicleClass"
                  value={formData.vehicleClass}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="PRIVATE_CAR">Private Car</option>
                  <option value="LIGHT_GOODS_VEHICLE">Light Goods Vehicle</option>
                  <option value="MEDIUM_GOODS_VEHICLE">Medium Goods Vehicle</option>
                  <option value="HEAVY_GOODS_VEHICLE">Heavy Goods Vehicle</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="BUS">Bus</option>
                  <option value="MINIBUS">Minibus</option>
                  <option value="SPECIAL_PURPOSE">Special Purpose</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="PETROL">Petrol</option>
                  <option value="DIESEL">Diesel</option>
                  <option value="ELECTRIC">Electric</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="LPG">LPG</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  name="seatingCapacity"
                  min="1"
                  max="120"
                  value={formData.seatingCapacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Engine Capacity (cc)
                </label>
                <input
                  type="number"
                  name="engineCapacityCc"
                  min="1"
                  value={formData.engineCapacityCc}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 1498"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  VRD / Licence Expiry Date
                </label>
                <input
                  type="date"
                  name="vrdExpiryDate"
                  value={formData.vrdExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Vehicle Avatar Photo URL (Optional)
              </label>
              <input
                type="url"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
          </div>

          {/* Section 3: Registration & Insurance Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-semibold text-zinc-900">Insurance & Registration Details (1-to-1 Detail)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  First Registration Date
                </label>
                <input
                  type="date"
                  name="firstRegistrationDate"
                  value={formData.firstRegistrationDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Insurance Company
                </label>
                <input
                  type="text"
                  name="insuranceCompany"
                  value={formData.insuranceCompany}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. AXA Insurance (Hong Kong)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Insurance Policy Number
                </label>
                <input
                  type="text"
                  name="insurancePolicyNumber"
                  value={formData.insurancePolicyNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                  placeholder="e.g. POL-HK-2024-8839"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Insurance Expiry Date
                </label>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">
                  Notes / Remarks
                </label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-md shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. Corporate fleet vehicle assigned to Operations department"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
            <Link
              to="/vehicles"
              className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-md hover:bg-zinc-50 font-medium text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving Vehicle...' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
