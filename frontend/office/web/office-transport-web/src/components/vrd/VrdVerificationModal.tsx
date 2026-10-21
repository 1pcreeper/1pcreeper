import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, HardDrive, FileText, Download, 
  ExternalLink, Calendar, User, MapPin, Car, ShieldCheck, CheckCircle2, Ban
} from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface VrdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  submission: any;
  onApproved: () => void;
}

export const VrdVerificationModal: React.FC<VrdVerificationModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  submission,
  onApproved
}) => {
  if (!isOpen || !submission) return null;

  const initial = submission.scannedData || {};
  const [formData, setFormData] = useState({
    issueDate: initial.issueDate || new Date().toISOString().split('T')[0],
    licensingOffice: initial.licensingOffice || 'Kowloon Licensing Office',
    ownerNameEn: initial.ownerNameEn || '',
    ownerNameZh: initial.ownerNameZh || '',
    idDocType: initial.idDocType || 'HKID',
    idDocPrefix: initial.idDocPrefix || 'A',
    addressBuilding: initial.addressBuilding || '',
    addressStreet: initial.addressStreet || '',
    addressDistrict: initial.addressDistrict || '',
    addressTerritory: initial.addressTerritory || 'Kowloon',
    registrationMark: initial.registrationMark || '',
    chassisNo: initial.chassisNo || '',
    engineNo: initial.engineNo || '',
    make: initial.make || '',
    model: initial.model || '',
    yearOfManufacture: initial.yearOfManufacture || 2021,
    vehicleClass: initial.vehicleClass || 'PRIVATE_CAR',
    fuelType: initial.fuelType || 'PETROL',
    seatCapacity: initial.seatCapacity || 5,
    grossVehicleWeightKg: initial.grossVehicleWeightKg || 1500
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRecommitAndConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await VehicleService.getInstance().approveVrdSubmission(vehicleId, submission.id, {
        scannedData: formData
      });
      onApproved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve and confirm VRD');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDecline = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await VehicleService.getInstance().declineVrdSubmission({
        vehicleId: Number(vehicleId),
        subId: Number(submission.id),
        reason: 'Declined during manual verification review'
      });
      setShowDeclineConfirm(false);
      onApproved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to decline VRD scan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadOriginal = () => {
    if (submission.fileDataUrl) {
      const a = document.createElement('a');
      a.href = submission.fileDataUrl;
      a.download = submission.fileName || 'VRD_Scanned_Document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("Downloading official document from MinIO object storage: " + submission.minioPath);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Verify & Recommit Scanned VRD</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Ready for Review
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Compare OCR extraction against original document, edit any discrepancies, and recommit to official records
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

        {/* Content Body: Split View (Left: Document Preview | Right: Editable Scanned Data) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: MinIO Document Preview (lg:col-span-5) */}
          <div className="lg:col-span-5 border-r border-zinc-200 bg-zinc-100 flex flex-col h-full overflow-hidden">
            <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-zinc-700 font-semibold truncate">
                <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="truncate">{submission.fileName}</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadOriginal}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-md transition-colors shadow-2xs"
                title="Download original file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>

            {/* MinIO Storage Reference Path */}
            <div className="px-3 py-2 bg-blue-50/60 border-b border-blue-200/50 flex items-center gap-2 text-[11px] text-blue-900 font-mono">
              <HardDrive className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span className="truncate">{submission.minioPath}</span>
            </div>

            {/* Document Viewer Container */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col items-center custom-scrollbar">
              {submission.mimeType?.startsWith('image/') || submission.fileDataUrl?.startsWith('data:image/') ? (
                <div className="bg-white p-2 rounded-xl shadow-md border border-zinc-300 max-w-full my-auto flex-shrink-0">
                  <img 
                    src={submission.fileDataUrl} 
                    alt="Scanned VRD Document" 
                    className="max-h-[60vh] object-contain rounded-lg"
                  />
                </div>
              ) : (
                /* PDF / Document Mock Render */
                <div className="w-full max-w-sm bg-white rounded-xl shadow-lg border border-zinc-300 p-6 space-y-4 text-left my-auto flex-shrink-0">
                  <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">HKSAR Transport Dept</div>
                      <div className="text-sm font-bold text-zinc-900">Vehicle Registration Document</div>
                    </div>
                    <div className="p-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold font-mono">
                      VRD/CERT
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                      <span className="text-[10px] text-zinc-400 block uppercase">Registration Mark</span>
                      <span className="font-bold text-base text-zinc-900">{formData.registrationMark || 'AB1234'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                        <span className="text-[10px] text-zinc-400 block uppercase">Class</span>
                        <span className="font-medium text-zinc-900">{formData.vehicleClass}</span>
                      </div>
                      <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200">
                        <span className="text-[10px] text-zinc-400 block uppercase">Issue Date</span>
                        <span className="font-medium text-zinc-900">{formData.issueDate}</span>
                      </div>
                    </div>

                    <div className="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                      <span className="text-[10px] text-zinc-400 block uppercase">Registered Owner</span>
                      <span className="font-bold text-zinc-900">{formData.ownerNameEn}</span>
                      {formData.ownerNameZh && <span className="text-zinc-600 block">{formData.ownerNameZh}</span>}
                    </div>

                    <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-200 text-[11px]">
                      <span className="text-[10px] text-zinc-400 block uppercase">Registered Address</span>
                      <span className="text-zinc-700">
                        {[formData.addressBuilding, formData.addressStreet, formData.addressDistrict, formData.addressTerritory].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200 text-[10px] text-zinc-400 text-center">
                    Original binary object stored on local MinIO cluster
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Editable Scanned Data Form (lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-white">
            <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-900 uppercase tracking-wider">
                OCR Extracted Data (Editable)
              </span>
              <span className="text-zinc-500">Edit fields to correct scan text before committing</span>
            </div>

            <form onSubmit={handleRecommitAndConfirm} className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="p-6 min-h-0 flex-1 overflow-y-auto space-y-6 custom-scrollbar text-xs">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Section 1: Document Particulars */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm border-b border-zinc-100 pb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Document & Licensing Particulars</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Date of Issue *</label>
                      <input 
                        type="date"
                        required
                        value={formData.issueDate}
                        onChange={(e) => handleChange('issueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Licensing Office</label>
                      <select 
                        value={formData.licensingOffice}
                        onChange={(e) => handleChange('licensingOffice', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Kowloon Licensing Office">Kowloon Licensing Office</option>
                        <option value="Hong Kong Licensing Office">Hong Kong Licensing Office</option>
                        <option value="Kwun Tong Licensing Office">Kwun Tong Licensing Office</option>
                        <option value="Shatin Licensing Office">Shatin Licensing Office</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Registered Owner */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm border-b border-zinc-100 pb-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Current Registered Owner Particulars</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Owner Name (English) *</label>
                      <input 
                        type="text"
                        required
                        value={formData.ownerNameEn}
                        onChange={(e) => handleChange('ownerNameEn', e.target.value)}
                        placeholder="e.g. WONG TAI MING"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Owner Name (Chinese)</label>
                      <input 
                        type="text"
                        value={formData.ownerNameZh}
                        onChange={(e) => handleChange('ownerNameZh', e.target.value)}
                        placeholder="e.g. 黃大明"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Identity Document Type</label>
                      <select 
                        value={formData.idDocType}
                        onChange={(e) => handleChange('idDocType', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="HKID">Hong Kong Identity Card (HKID)</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="BUSINESS_REGISTRATION">Business Registration (BR)</option>
                        <option value="OTHER">Other Official Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Document Prefix / Number</label>
                      <input 
                        type="text"
                        value={formData.idDocPrefix}
                        onChange={(e) => handleChange('idDocPrefix', e.target.value)}
                        placeholder="e.g. K"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Registered Address */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm border-b border-zinc-100 pb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span>Registered Address</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-600 font-semibold mb-1">Flat / Floor / Building</label>
                      <input 
                        type="text"
                        value={formData.addressBuilding}
                        onChange={(e) => handleChange('addressBuilding', e.target.value)}
                        placeholder="e.g. Unit 802, Block A, Fortune Plaza"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Street Address</label>
                      <input 
                        type="text"
                        value={formData.addressStreet}
                        onChange={(e) => handleChange('addressStreet', e.target.value)}
                        placeholder="e.g. 68 Nathan Road"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">District</label>
                      <input 
                        type="text"
                        value={formData.addressDistrict}
                        onChange={(e) => handleChange('addressDistrict', e.target.value)}
                        placeholder="e.g. Tsim Sha Tsui"
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-zinc-600 font-semibold mb-1">Territory</label>
                      <select 
                        value={formData.addressTerritory}
                        onChange={(e) => handleChange('addressTerritory', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Kowloon">Kowloon (九龍)</option>
                        <option value="Hong Kong">Hong Kong Island (香港島)</option>
                        <option value="New Territories">New Territories (新界)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 4: Vehicle Specs from Document */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-bold text-zinc-800 text-sm border-b border-zinc-100 pb-2">
                    <Car className="w-4 h-4 text-blue-600" />
                    <span>Scanned Vehicle Particulars</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Reg Mark</label>
                      <input 
                        type="text"
                        value={formData.registrationMark}
                        onChange={(e) => handleChange('registrationMark', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-bold text-blue-900 bg-zinc-50"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Chassis VIN</label>
                      <input 
                        type="text"
                        value={formData.chassisNo}
                        onChange={(e) => handleChange('chassisNo', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Engine No</label>
                      <input 
                        type="text"
                        value={formData.engineNo}
                        onChange={(e) => handleChange('engineNo', e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeclineConfirm(true)}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    title="Decline and abandon this scan"
                  >
                    <Ban className="w-3.5 h-3.5 text-red-600" />
                    <span>Decline & Abandon Scan</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Committing to Official Records...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Recommit & Confirm as Approved VRD</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* In-App Decline Confirmation Dialog */}
      {showDeclineConfirm && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-150"
          onClick={() => {
            if (!isSubmitting) setShowDeclineConfirm(false);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-zinc-200 max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-red-100 text-red-700 rounded-xl flex-shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-zinc-900">Decline &amp; Abandon Scan?</h4>
                <p className="text-xs text-zinc-500 font-mono mt-0.5 truncate" title={submission.fileName}>
                  {submission.fileName}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to decline and abandon this VRD scan? This document will not be committed to official vehicle records.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setShowDeclineConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDecline}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Yes, Decline &amp; Abandon</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
