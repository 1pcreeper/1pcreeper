import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, User, Calendar, MapPin } from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface VrdEditDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  vrd: any;
  onSaved: () => void;
}

export const VrdEditDataModal: React.FC<VrdEditDataModalProps> = ({
  isOpen,
  onClose,
  vrd,
  onSaved
}) => {
  if (!isOpen || !vrd) return null;

  const [formData, setFormData] = useState({
    issueDate: vrd.issueDate || '',
    licensingOffice: vrd.licensingOffice || 'Kowloon',
    ownerNameEn: vrd.ownerNameEn || '',
    ownerNameZh: vrd.ownerNameZh || '',
    idDocType: vrd.idDocType || 'HKID',
    idDocPrefix: vrd.idDocPrefix || '',
    addressBuilding: vrd.addressBuilding || '',
    addressStreet: vrd.addressStreet || '',
    addressDistrict: vrd.addressDistrict || '',
    addressTerritory: vrd.addressTerritory || 'Kowloon'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);
      await VehicleService.getInstance().updateVrd(vrd.id, formData);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update VRD particulars');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Edit Scanned VRD Data</h3>
              <p className="text-xs text-zinc-500">Update registered owner particulars in system database</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Issue Date *</label>
              <input 
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Licensing Office</label>
              <input 
                type="text"
                value={formData.licensingOffice}
                onChange={(e) => handleChange('licensingOffice', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Owner Name (English) *</label>
              <input 
                type="text"
                required
                value={formData.ownerNameEn}
                onChange={(e) => handleChange('ownerNameEn', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Owner Name (Chinese)</label>
              <input 
                type="text"
                value={formData.ownerNameZh}
                onChange={(e) => handleChange('ownerNameZh', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">ID Document Type</label>
              <select 
                value={formData.idDocType}
                onChange={(e) => handleChange('idDocType', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="HKID">HKID</option>
                <option value="PASSPORT">Passport</option>
                <option value="BUSINESS_REGISTRATION">Business Registration</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">ID Document Prefix / No</label>
              <input 
                type="text"
                value={formData.idDocPrefix}
                onChange={(e) => handleChange('idDocPrefix', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-600 font-semibold mb-1">Building</label>
              <input 
                type="text"
                value={formData.addressBuilding}
                onChange={(e) => handleChange('addressBuilding', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">Street</label>
              <input 
                type="text"
                value={formData.addressStreet}
                onChange={(e) => handleChange('addressStreet', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-semibold mb-1">District</label>
              <input 
                type="text"
                value={formData.addressDistrict}
                onChange={(e) => handleChange('addressDistrict', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-zinc-600 font-semibold mb-1">Territory</label>
              <input 
                type="text"
                value={formData.addressTerritory}
                onChange={(e) => handleChange('addressTerritory', e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5"
            >
              {isSaving ? 'Saving Changes...' : 'Save & Update VRD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
