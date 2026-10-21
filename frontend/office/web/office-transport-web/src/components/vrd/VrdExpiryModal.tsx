import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';
import { getVrdExpiryStatus } from '../../utils/vrdExpiry.ts';

interface VrdExpiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleReg: string;
  currentExpiryDate?: string | null;
  onSaved: (newDate: string | null) => void;
}

export const VrdExpiryModal: React.FC<VrdExpiryModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleReg,
  currentExpiryDate,
  onSaved
}) => {
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setExpiryDate(currentExpiryDate || '');
      setError(null);
    }
  }, [isOpen, currentExpiryDate]);

  if (!isOpen) return null;

  const preview = getVrdExpiryStatus(expiryDate);

  const handlePreset = (months: number, days?: number) => {
    const d = new Date();
    if (days !== undefined) {
      d.setDate(d.getDate() + days);
    } else {
      d.setMonth(d.getMonth() + months);
    }
    const iso = d.toISOString().split('T')[0];
    setExpiryDate(iso);
  };

  const handleClearToNull = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await VehicleService.getInstance().updateVehicleVrdExpiry({
        id: vehicleId,
        vrdExpiryDate: null
      });
      onSaved(null);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to clear VRD expiry date.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If user cleared the date input and clicks submit -> treat as null (ignored)
    const finalDate = expiryDate.trim() ? expiryDate.trim() : null;

    try {
      setIsSubmitting(true);
      setError(null);
      await VehicleService.getInstance().updateVehicleVrdExpiry({
        id: vehicleId,
        vrdExpiryDate: finalDate
      });
      onSaved(finalDate);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update VRD expiry date.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Set VRD Licence Expiry Date</h3>
              <p className="text-xs text-zinc-500">Vehicle {vehicleReg} &bull; Transport Department renewal tracker</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                VRD Licence Expiration Date
              </label>
              {expiryDate && (
                <button
                  type="button"
                  onClick={() => setExpiryDate('')}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold underline"
                >
                  Clear / Set to Null
                </button>
              )}
            </div>
            <div className="relative">
              <input 
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="No expiry date (null)"
                className="w-full px-3.5 py-2.5 border border-zinc-300 rounded-xl text-sm font-semibold text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              Select date or leave empty / click &quot;Ignore / Set to Null&quot; to ignore it. A yellow warning will remind you until settled.
            </p>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Quick HK Licence Presets &amp; Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePreset(4)}
                className="px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors text-center"
              >
                +4 Months
              </button>
              <button
                type="button"
                onClick={() => handlePreset(12)}
                className="px-2.5 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors text-center"
              >
                +1 Year
              </button>
              <button
                type="button"
                onClick={() => handlePreset(0, 7)}
                className="px-2.5 py-1.5 text-xs font-medium bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors text-center"
                title="Test 7 days left reminder (triggers red signal)"
              >
                7 Days (Red)
              </button>
              <button
                type="button"
                onClick={() => setExpiryDate('')}
                className="px-2.5 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition-colors text-center font-semibold"
                title="Clear date to null (triggers yellow warning)"
              >
                Null (Ignore)
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          {expiryDate ? (
            <div className={`p-4 rounded-xl border transition-colors ${
              preview.isExpiringSoon 
                ? 'bg-red-50/90 border-red-300 text-red-950' 
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    {preview.isExpiringSoon ? (
                      <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {preview.isExpiringSoon ? 'Expiring Soon Warning (<= 10 Days)' : 'Licence Active & Valid'}
                    </span>
                  </div>
                  <p className="text-sm font-bold">
                    Expires on {preview.formattedDate}
                  </p>
                  <p className="text-xs">
                    Countdown: <strong className={preview.isExpiringSoon ? 'text-red-700 font-bold' : 'text-emerald-700'}>{preview.statusText}</strong>
                  </p>
                </div>

                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  preview.isExpiringSoon 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {preview.statusText}
                </span>
              </div>
            </div>
          ) : (
            /* Yellow Warning Preview when Null / Not Settled */
            <div className="p-4 rounded-xl border bg-amber-50/90 border-amber-300 text-amber-950 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Yellow Warning: Expiry Not Settled
                    </span>
                  </div>
                  <p className="text-sm font-bold text-amber-950">
                    Expiry Date is Null (Ignored)
                  </p>
                  <p className="text-xs text-amber-800">
                    Reminder will show a <strong>Yellow Warning</strong> on vehicle details and list pages until settled.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Not Settled
                </span>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleClearToNull}
              disabled={isSubmitting}
              className="px-3 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors inline-flex items-center gap-1.5"
              title="Set expiry date to null to ignore it"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Ignore / Set to Null</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{expiryDate ? 'Save Expiry Date' : 'Save as Null'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
