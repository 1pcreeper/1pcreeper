import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Eye, Download, Edit3, Calendar, User, 
  MapPin, HardDrive, Star, ShieldCheck, RefreshCw 
} from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface VrdRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicle: any;
  onPreviewVrd: (vrd: any) => void;
  onEditVrd: (vrd: any) => void;
  onRefresh: () => void;
}

export const VrdRecordsModal: React.FC<VrdRecordsModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicle,
  onPreviewVrd,
  onEditVrd,
  onRefresh
}) => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen, vehicleId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await VehicleService.getInstance().getVehicleVrds(vehicleId);
      const recordsList = Array.isArray(res.data) ? [...res.data] : (Array.isArray(res) ? [...res] : []);
      // Ensure sorted by issueDate descending
      recordsList.sort((a: any, b: any) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
      setRecords(recordsList);
    } catch (err) {
      console.error("Failed to load VRDs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (vrd: any) => {
    if (vrd.fileUrl && vrd.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = vrd.fileUrl;
      a.download = vrd.fileName || `${vehicle.registrationMark}_VRD_${vrd.issueDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Mock download certificate
      const text = `HONG KONG TRANSPORT DEPARTMENT - OFFICIAL VEHICLE REGISTRATION DOCUMENT
Registration Mark: ${vehicle.registrationMark}
Issue Date: ${vrd.issueDate}
Licensing Office: ${vrd.licensingOffice || 'Kowloon'}
Registered Owner: ${vrd.ownerNameEn} ${vrd.ownerNameZh ? `(${vrd.ownerNameZh})` : ''}
ID Document: ${vrd.idDocType} (${vrd.idDocPrefix || '***'})
Address: ${[vrd.addressBuilding, vrd.addressStreet, vrd.addressDistrict, vrd.addressTerritory].filter(Boolean).join(', ')}
MinIO Object Storage Path: ${vrd.minioPath || 's3://minio-local/hk-transport-vrd-bucket/'}`;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${vehicle.registrationMark}_VRD_${vrd.issueDate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900">Vehicle Registration Document (VRD) Records</h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-zinc-200 text-zinc-800">
                  {vehicle.registrationMark}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Historical records sorted by Issue Date &bull; Stored in MinIO Object Storage
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRecords}
              className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 rounded-lg transition-colors"
              title="Refresh records"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 min-h-0 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Loading VRD records...
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs">
              No VRD records registered for this vehicle.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((vrd: any, idx: number) => {
                const isLatest = idx === 0;

                return (
                  <div 
                    key={vrd.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isLatest 
                        ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-200 shadow-xs' 
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                      <div className="flex items-center gap-2">
                        {isLatest ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            <Star className="w-3 h-3 fill-blue-600 text-blue-600" />
                            <span>Latest VRD (Active Registered Owner)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 text-zinc-600">
                            <span>Historical Record #{records.length - idx}</span>
                          </span>
                        )}
                        <span className="text-xs text-zinc-500">
                          Issue Date: <strong className="text-zinc-900">{vrd.issueDate}</strong>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onPreviewVrd(vrd)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                          title="Preview VRD Document"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                        <button
                          onClick={() => handleDownload(vrd)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition-colors shadow-2xs"
                          title="Download VRD Document"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                        <button
                          onClick={() => onEditVrd(vrd)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                          title="Edit Scanned Data"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Data</span>
                        </button>
                      </div>
                    </div>

                    {/* Owner Particulars */}
                    <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Owner Name (EN)</span>
                        <span className="font-bold text-zinc-900">{vrd.ownerNameEn || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Owner Name (ZH)</span>
                        <span className="font-bold text-zinc-900">{vrd.ownerNameZh || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">ID Document</span>
                        <span className="font-medium text-zinc-800">{vrd.idDocType} ({vrd.idDocPrefix || '***'})</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Licensing Office</span>
                        <span className="font-medium text-zinc-800">{vrd.licensingOffice || 'Kowloon'}</span>
                      </div>
                      <div className="sm:col-span-2 md:col-span-3">
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Registered Address</span>
                        <span className="font-medium text-zinc-800">
                          {[vrd.addressBuilding, vrd.addressStreet, vrd.addressDistrict, vrd.addressTerritory].filter(Boolean).join(', ') || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-zinc-400 uppercase font-semibold">Object Storage</span>
                        <span className="font-mono text-[10px] text-blue-700 truncate block" title={vrd.minioPath}>
                          {vrd.minioPath ? 's3://minio-local/...' : 'Local Storage'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
          <span>Total {records.length} VRD records recorded on vehicle history</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
