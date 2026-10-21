import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Check, RotateCcw, Camera, AlertCircle } from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface EditCarAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: {
    id: number;
    registrationMark: string;
    make: string;
    model: string;
    avatarUrl?: string;
    vehicleClass?: string;
  };
  onSuccess: (newAvatarUrl: string) => void;
}

// Curated high quality presets matching common HK vehicle types
const PRESET_AVATARS = [
  {
    title: 'Executive White Sedan',
    category: 'Sedan / Saloon',
    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Modern Electric SUV (Blue)',
    category: 'Electric / SUV',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Performance Sport Coupe',
    category: 'Sport Car',
    url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Commercial Cargo Van',
    category: 'Light Goods Vehicle',
    url: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Transport Logistics Truck',
    category: 'Medium / Heavy Goods',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Urban Passenger Minibus',
    category: 'Minibus / Coach',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Urban Red Taxi Style',
    category: 'Public Transport / Taxi',
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=2070'
  },
  {
    title: 'Dispatch Motorcycle',
    category: 'Motorcycle',
    url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=2070'
  }
];

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070';

export const EditCarAvatarModal: React.FC<EditCarAvatarModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [selectedUrl, setSelectedUrl] = useState<string>(vehicle.avatarUrl || DEFAULT_AVATAR);
  const [customInputUrl, setCustomInputUrl] = useState<string>(vehicle.avatarUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputUrl.trim()) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    setErrorMessage(null);
    setSelectedUrl(customInputUrl.trim());
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await VehicleService.getInstance().updateVehicleAvatar({
        id: vehicle.id,
        avatarUrl: selectedUrl
      });

      if (response.success) {
        onSuccess(selectedUrl);
        onClose();
      } else {
        setErrorMessage(response.message || 'Failed to update vehicle avatar');
      }
    } catch (err: any) {
      console.error('Update avatar error:', err);
      setErrorMessage(err.message || 'Failed to update vehicle avatar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = () => {
    setSelectedUrl(DEFAULT_AVATAR);
    setCustomInputUrl('');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Edit Vehicle Avatar</h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800">
                  {vehicle.registrationMark}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {vehicle.make} {vehicle.model} &bull; Personalize banner photo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 min-h-0 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
              <span>Avatar Live Preview</span>
              <button 
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-blue-600 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            </div>
            <div className="w-full h-44 rounded-xl overflow-hidden relative bg-zinc-900 border border-zinc-200 shadow-inner group">
              <img 
                src={selectedUrl} 
                alt="Car Avatar Preview" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
                onError={() => {
                  setErrorMessage('Failed to load image from preview URL. Please verify the URL.');
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-3 left-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded backdrop-blur-xs">
                  {vehicle.vehicleClass?.replace(/_/g, ' ') || 'VEHICLE'}
                </span>
                <div className="text-xl font-bold tracking-tight mt-1">{vehicle.registrationMark}</div>
                <div className="text-xs text-zinc-300">{vehicle.make} {vehicle.model}</div>
              </div>
            </div>
          </div>

          {/* Source Selection Tabs */}
          <div>
            <div className="flex border-b border-zinc-200 space-x-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('preset')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'preset'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Preset Fleet Photos</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'upload'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload From Computer</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`pb-2.5 px-1 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'url'
                    ? 'border-blue-600 text-blue-600 font-semibold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Direct Image URL</span>
              </button>
            </div>

            {/* Tab 1: Presets */}
            {activeTab === 'preset' && (
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRESET_AVATARS.map((preset, index) => {
                  const isSelected = selectedUrl === preset.url;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSelectedUrl(preset.url);
                        setErrorMessage(null);
                      }}
                      className={`relative rounded-xl overflow-hidden border text-left group transition-all ${
                        isSelected 
                          ? 'border-blue-600 ring-2 ring-blue-500/50 shadow-md' 
                          : 'border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="h-20 w-full overflow-hidden bg-zinc-100">
                        <img 
                          src={preset.url} 
                          alt={preset.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                      </div>
                      <div className="p-2 bg-white">
                        <div className="text-[11px] font-semibold text-zinc-900 truncate">{preset.title}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{preset.category}</div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tab 2: Upload File */}
            {activeTab === 'upload' && (
              <div className="pt-4">
                <label className="border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-zinc-50/50 hover:bg-blue-50/20 transition-all text-center group">
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">Click to upload car photo</span>
                  <span className="text-xs text-zinc-500 mt-1">PNG, JPG, WebP up to 10MB</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}

            {/* Tab 3: Custom URL */}
            {activeTab === 'url' && (
              <form onSubmit={handleApplyCustomUrl} className="pt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Image Web Address (URL)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      placeholder="https://example.com/car-photo.jpg" 
                      value={customInputUrl}
                      onChange={(e) => setCustomInputUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Tip: Provide a publicly accessible HTTPS image link.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs flex-shrink-0">
          <span className="text-zinc-500">Changes apply to vehicle details and explorer view</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Avatar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
