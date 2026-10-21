import React, { useState } from 'react';
import { X, Download, HardDrive, FileText, Calendar, User, ShieldCheck, Printer, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface VrdPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  vrd: any;
  vehicle: any;
}

export const VrdPreviewModal: React.FC<VrdPreviewModalProps> = ({
  isOpen,
  onClose,
  vrd,
  vehicle
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen || !vrd) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleResetZoom = () => setZoomLevel(100);

  const handleDownload = () => {
    if (vrd.fileUrl && vrd.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = vrd.fileUrl;
      a.download = vrd.fileName || `${vehicle.registrationMark}_VRD_${vrd.issueDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Generate clean downloadable text or print dialog
      window.print();
    }
  };

  const isImage = vrd.fileUrl && (vrd.fileUrl.startsWith('data:image/') || vrd.fileName?.match(/\.(png|jpg|jpeg|webp)$/i));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl h-[88vh] max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
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
                <h3 className="text-base font-bold text-zinc-900">Vehicle Registration Document Preview</h3>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800">
                  {vehicle.registrationMark}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Archived in local MinIO Object Storage &bull; Issue Date: {vrd.issueDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-0.5 bg-white border border-zinc-200 rounded-lg p-0.5 shadow-2xs">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 70}
                className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1.5 py-0.5 text-[11px] font-mono font-semibold text-zinc-600 hover:text-zinc-900 rounded"
                title="Reset Zoom to 100%"
              >
                {zoomLevel}%
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 160}
                className="p-1 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 disabled:opacity-30 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download VRD</span>
            </button>
            <button 
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MinIO Object Storage Bar */}
        <div className="px-6 py-2 bg-blue-50/70 border-b border-blue-200/50 flex items-center justify-between text-xs text-blue-900 flex-shrink-0">
          <div className="flex items-center gap-2 truncate">
            <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-semibold">Object Storage URI:</span>
            <code className="text-[11px] font-mono text-blue-800 truncate">
              {vrd.minioPath || `s3://minio-local/hk-transport-vrd-bucket/vehicles/${vehicle.id}/vrd_${vrd.id}.pdf`}
            </code>
          </div>
          <span className="text-[10px] text-blue-600 font-semibold px-2 py-0.5 bg-white/70 rounded">
            MinIO Cluster
          </span>
        </div>

        {/* Document Content View - Scrollable */}
        <div className="p-4 sm:p-6 min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-zinc-100/50 flex flex-col items-center custom-scrollbar">
          {isImage ? (
            <div 
              className="bg-white p-3 rounded-xl shadow-md border border-zinc-200 max-w-full flex-shrink-0 my-2 transition-all duration-150 flex justify-center"
              style={{ width: zoomLevel !== 100 ? `${zoomLevel}%` : undefined }}
            >
              <img src={vrd.fileUrl} alt="VRD Document" className="max-w-full h-auto object-contain rounded-lg shadow-2xs" />
            </div>
          ) : (
            /* Transport Dept Official Certificate Layout */
            <div 
              className="w-full bg-white border border-zinc-300 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-zinc-900 relative overflow-hidden flex-shrink-0 my-2 transition-all duration-150"
              style={{ maxWidth: `${Math.round(672 * (zoomLevel / 100))}px` }}
            >
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <span className="text-8xl font-black rotate-[-25deg]">TRANSPORT DEPT</span>
              </div>

              {/* Title Section */}
              <div className="border-b-2 border-zinc-900 pb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
                    The Government of the Hong Kong Special Administrative Region
                  </div>
                  <h2 className="text-xl font-black tracking-tight text-zinc-900 mt-1">
                    TRANSPORT DEPARTMENT &bull; VEHICLE REGISTRATION DOCUMENT
                  </h2>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    香港特別行政區政府 運輸署 車輛登記文件
                  </p>
                </div>
                <div className="text-right">
                  <div className="p-2 bg-zinc-100 rounded-lg border border-zinc-300 text-xs font-mono font-bold">
                    CERT NO: HKTD-{1000 + vrd.id}
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1">Status: Valid Official Record</span>
                </div>
              </div>

              {/* Particulars Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Registration Mark (登記號碼)</span>
                  <span className="text-lg font-black text-blue-900">{vehicle.registrationMark}</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Date of Issue (發出日期)</span>
                  <span className="text-base font-bold text-zinc-900">{vrd.issueDate}</span>
                </div>
              </div>

              {/* Registered Owner Particulars */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs">
                <div className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
                  Registered Owner Particulars (登記車主資料)
                </div>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Owner Name (English)</span>
                    <span className="font-bold text-zinc-900">{vrd.ownerNameEn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Owner Name (Chinese)</span>
                    <span className="font-bold text-zinc-900">{vrd.ownerNameZh || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Identity Document Type</span>
                    <span className="font-medium text-zinc-900">{vrd.idDocType} ({vrd.idDocPrefix || '***'})</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Licensing Office</span>
                    <span className="font-medium text-zinc-900">{vrd.licensingOffice || 'Kowloon'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-zinc-500 block">Registered Address (登記地址)</span>
                    <span className="font-medium text-zinc-900">
                      {[vrd.addressBuilding, vrd.addressStreet, vrd.addressDistrict, vrd.addressTerritory].filter(Boolean).join(', ') || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vehicle Particulars */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2 text-xs">
                <div className="font-bold text-zinc-800 uppercase tracking-wider text-[11px] border-b border-zinc-200 pb-1">
                  Vehicle Specifications (車輛規格)
                </div>
                <div className="grid grid-cols-3 gap-y-2 gap-x-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Make & Model</span>
                    <span className="font-medium text-zinc-900">{vehicle.make} {vehicle.model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Chassis VIN</span>
                    <span className="font-mono text-zinc-900">{vehicle.chassisNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Engine No</span>
                    <span className="font-mono text-zinc-900">{vehicle.engineNo || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Class</span>
                    <span className="font-medium text-zinc-900">{(vehicle.vehicleClass || 'PRIVATE_CAR').replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Year of Mfg</span>
                    <span className="font-medium text-zinc-900">{vehicle.yearOfManufacture}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Seating Capacity</span>
                    <span className="font-medium text-zinc-900">{vehicle.seatCapacity || 5} Persons</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Official Hong Kong Transport Department Electronic Record</span>
                <span className="font-mono">MINIO-ID: {vrd.id}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500 flex-shrink-0">
          <span>Staged in MinIO Object Storage bucket: <code>hk-transport-vrd-bucket</code></span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400 hidden sm:inline">Use mouse wheel or scrollbar to browse document</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
