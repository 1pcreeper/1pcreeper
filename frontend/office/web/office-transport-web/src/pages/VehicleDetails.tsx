import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import VehicleService from '../services/VehicleService.ts';
import { 
  ArrowLeft, FileText, Wrench, AlertCircle, Car, Calendar, 
  User as UserIcon, Folder, FolderTree, ArrowRight, HardDrive, 
  ShieldCheck, Eye, Download, Edit3, Sparkles, Bell, CheckCircle2, History, Camera, AlertTriangle, Clock
} from 'lucide-react';
import clsx from 'clsx';
import { VrdUploadModal } from '../components/vrd/VrdUploadModal.tsx';
import { VrdApprovalQueueModal } from '../components/vrd/VrdApprovalQueueModal.tsx';
import { VrdVerificationModal } from '../components/vrd/VrdVerificationModal.tsx';
import { VrdRecordsModal } from '../components/vrd/VrdRecordsModal.tsx';
import { VrdEditDataModal } from '../components/vrd/VrdEditDataModal.tsx';
import { VrdPreviewModal } from '../components/vrd/VrdPreviewModal.tsx';
import { EditCarAvatarModal } from '../components/vehicle/EditCarAvatarModal.tsx';
import { VrdExpiryModal } from '../components/vrd/VrdExpiryModal.tsx';
import { getVrdExpiryStatus } from '../utils/vrdExpiry.ts';

export function VehicleDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0');
  const size = parseInt(searchParams.get('size') || '10');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isApprovalQueueOpen, setIsApprovalQueueOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isExpiryModalOpen, setIsExpiryModalOpen] = useState(false);

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [selectedVrdForEdit, setSelectedVrdForEdit] = useState<any>(null);
  const [selectedVrdForPreview, setSelectedVrdForPreview] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDetails();
  }, [id, page, size]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await VehicleService.getInstance().getVehicleDetails({ id: Number(id), page, size });
      setData(res.data || res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Requirement: "it only show the latest VRD according the Issue date"
  const sortedVrds = useMemo(() => {
    if (!data?.vrds) return [];
    return (data.vrds as any[]).slice().sort((a, b) => {
      const timeA = a.issueDate ? new Date(a.issueDate).getTime() : 0;
      const timeB = b.issueDate ? new Date(b.issueDate).getTime() : 0;
      return timeB - timeA;
    });
  }, [data?.vrds]);

  const currentVrd = sortedVrds[0] || null;
  const pendingVrdCount = data?.pendingVrdCount || 0;

  // Handle previewing VRD
  const handlePreviewVrd = (vrd: any) => {
    setSelectedVrdForPreview(vrd);
    setIsPreviewModalOpen(true);
  };

  // Handle editing VRD
  const handleEditVrd = (vrd: any) => {
    setSelectedVrdForEdit(vrd);
    setIsEditModalOpen(true);
  };

  // Handle downloading VRD
  const handleDownloadVrd = (vrd: any) => {
    if (vrd.fileUrl && vrd.fileUrl.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = vrd.fileUrl;
      a.download = vrd.fileName || `${data.registrationMark}_VRD_${vrd.issueDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const text = `HONG KONG TRANSPORT DEPARTMENT - OFFICIAL VEHICLE REGISTRATION DOCUMENT
Registration Mark: ${data.registrationMark}
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
      a.download = `${data.registrationMark}_VRD_${vrd.issueDate}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (loading && !data) return <div className="p-8 text-zinc-500">Loading details...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-8">Not found</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-zinc-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        <Link to="/vehicles" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Vehicles
        </Link>
        
        {/* Car Big Picture Stay At Top */}
        <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-6 relative bg-zinc-900 shadow-md group">
          <img 
            src={data.avatarUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=2070"} 
            alt={`${data.make} ${data.model}`} 
            className="w-full h-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-[1.01]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* Edit Car Avatar Button */}
          <button
            onClick={() => setIsEditAvatarOpen(true)}
            className="absolute top-4 right-4 z-10 inline-flex items-center gap-2 px-3.5 py-2 bg-black/60 hover:bg-black/85 text-white rounded-xl backdrop-blur-md border border-white/20 text-xs font-semibold shadow-lg transition-all transform hover:scale-105 cursor-pointer"
            title="Edit car avatar photo"
          >
            <Camera className="w-4 h-4 text-white" />
            <span>Edit Car Avatar</span>
          </button>

          <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 text-white">
            <div className="flex items-center space-x-3 mb-2">
              <span className={clsx(
                "px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider",
                data.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"
              )}>
                {data.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-md text-xs font-bold uppercase tracking-wider text-white">
                {data.vehicleClass.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-1">{data.registrationMark || data.licensePlate || `Vehicle #${data.id}`}</h1>
            <p className="text-lg md:text-xl text-zinc-300 font-medium">{data.yearOfManufacture} {data.make} {data.model}</p>
          </div>
        </div>

        {/* VRD Expiry Reminder Card */}
        {(() => {
          const vrdExpiry = getVrdExpiryStatus(data.vrdExpiryDate);
          return (
            <div className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
              vrdExpiry.isExpiringSoon
                ? 'bg-red-50/95 border-red-300 text-red-950'
                : vrdExpiry.isNotSettled
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                  : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    vrdExpiry.isExpiringSoon
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : vrdExpiry.isNotSettled
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {vrdExpiry.isExpiringSoon ? (
                      <AlertTriangle className="w-5 h-5 text-red-600 animate-bounce" />
                    ) : vrdExpiry.isNotSettled ? (
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Calendar className="w-5 h-5 text-emerald-700" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm sm:text-base font-bold tracking-tight">
                        VRD Licence Expiry Reminder
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        vrdExpiry.isExpiringSoon
                          ? 'bg-red-100 text-red-800 border border-red-300 animate-pulse'
                          : vrdExpiry.isNotSettled
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {vrdExpiry.statusText}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                      <span>
                        Licence Expiry Date: <strong className={
                          vrdExpiry.isExpiringSoon 
                            ? 'text-red-700 font-bold' 
                            : vrdExpiry.isNotSettled 
                              ? 'text-amber-800 font-semibold' 
                              : ''
                        }>
                          {vrdExpiry.formattedDate}
                        </strong>
                      </span>
                      <span>&bull;</span>
                      <span>
                        Days Remaining: <strong className={
                          vrdExpiry.isExpiringSoon 
                            ? 'text-red-700 font-bold text-sm' 
                            : vrdExpiry.isNotSettled 
                              ? 'text-amber-800 font-semibold' 
                              : 'text-emerald-700 font-bold'
                        }>
                          {vrdExpiry.daysLeft !== null ? `${vrdExpiry.daysLeft} days` : 'Not settled'}
                        </strong>
                      </span>
                    </div>

                    {vrdExpiry.isExpiringSoon && (
                      <p className="mt-1.5 text-xs text-red-700 font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Warning: Vehicle licence is expiring soon (within 10 days). Please arrange renewal with the Transport Department.</span>
                      </p>
                    )}

                    {vrdExpiry.isNotSettled && (
                      <p className="mt-1.5 text-xs text-amber-800 font-semibold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Yellow Warning: VRD licence expiry date is not settled (ignored / empty). Set an expiry date to track renewal deadlines.</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
                  <button
                    onClick={() => setIsExpiryModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border shadow-2xs transition-colors cursor-pointer ${
                      vrdExpiry.isExpiringSoon
                        ? 'bg-red-600 hover:bg-red-700 text-white border-red-700'
                        : vrdExpiry.isNotSettled
                          ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                          : 'bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                    title="Click to input, edit, or ignore VRD licence expiry date"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{vrdExpiry.hasDate ? 'Edit Expiry Date' : 'Set Expiry Date'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vehicle Particulars Card */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
              <div className="flex items-center">
                <Car className="w-5 h-5 text-zinc-500 mr-2" />
                <h3 className="text-lg font-semibold text-zinc-900">Vehicle Particulars</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500 bg-zinc-100 px-2 py-1 rounded border border-zinc-200">
                VIN: {data.chassisNo}
              </span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Chassis No (VIN)</span><span className="font-medium text-zinc-900">{data.chassisNo || data.chassisNumber || '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Engine No</span><span className="font-medium text-zinc-900">{data.engineNo || data.engineNumber || '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Class</span><span className="font-medium text-zinc-900">{data.vehicleClass ? data.vehicleClass.replace(/_/g, ' ') : 'PRIVATE CAR'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Fuel Type</span><span className="font-medium text-zinc-900">{data.fuelType || '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Color</span><span className="font-medium text-zinc-900">{data.color || '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Engine Capacity</span><span className="font-medium text-zinc-900">{data.cylinderCapacityCc || data.engineCapacityCc ? `${data.cylinderCapacityCc || data.engineCapacityCc} cc` : '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Gross Weight</span><span className="font-medium text-zinc-900">{data.grossVehicleWeightKg ? `${data.grossVehicleWeightKg} kg` : '-'}</span></div>
              <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Seating</span><span className="font-medium text-zinc-900">{data.seatCapacity || data.seatingCapacity || '-'}</span></div>
              {(data.detail?.insuranceCompany || data.detail?.insurancePolicyNumber) && (
                <>
                  <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Insurance Company</span><span className="font-medium text-zinc-900">{data.detail.insuranceCompany}</span></div>
                  <div><span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Policy Number</span><span className="font-medium text-zinc-900">{data.detail.insurancePolicyNumber || '-'}</span></div>
                </>
              )}
              <div className="sm:col-span-2 pt-2 border-t border-zinc-100">
                <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">VRD Licence Expiry</span>
                {(() => {
                  const vrdExpiry = getVrdExpiryStatus(data.vrdExpiryDate);
                  return (
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm ${
                        vrdExpiry.isExpiringSoon 
                          ? 'text-red-700' 
                          : vrdExpiry.isNotSettled 
                            ? 'text-amber-800' 
                            : 'text-zinc-900'
                      }`}>
                        {vrdExpiry.formattedDate}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        vrdExpiry.isExpiringSoon
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : vrdExpiry.isNotSettled
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {vrdExpiry.statusText}
                      </span>
                      <button
                        onClick={() => setIsExpiryModalOpen(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer ml-auto"
                      >
                        {vrdExpiry.hasDate ? 'Edit Expiry Date' : 'Set Expiry Date'}
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Registered Person Owner (gRPC Cross-Service Link) */}
          {(data.owner?.uid || data.personUid || data.ownerName) && (
            <div className="bg-white rounded-xl shadow-xs border border-zinc-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 bg-indigo-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-zinc-900">Registered Person Owner (gRPC Directory Link)</h3>
                  <span className="text-[11px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Workforce Service gRPC
                  </span>
                </div>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Person Name (EN)</span>
                  <span className="font-bold text-zinc-900 text-base">{data.owner?.nameEnglish || data.ownerName || '-'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Person Name (ZH)</span>
                  <span className="font-bold text-zinc-900 text-base">{data.owner?.nameChinese || '-'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">HKID / National ID</span>
                  <span className="font-mono text-zinc-900 font-semibold">{data.owner?.hkId || '-'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Mobile Phone</span>
                  <span className="font-medium text-zinc-900">{data.owner?.mobileTel || data.ownerMobile || '-'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Email Address</span>
                  <span className="font-medium text-zinc-900">{data.owner?.email || data.ownerEmail || '-'}</span>
                </div>
                <div>
                  <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Person UID</span>
                  <span className="font-mono text-xs text-indigo-700 font-semibold block truncate" title={data.owner?.uid || data.personUid}>
                    {data.owner?.uid || data.personUid || '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Current Registered Owner Card */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-zinc-500" />
                <h3 className="text-lg font-semibold text-zinc-900">Current Registered Owner</h3>
                {currentVrd && (
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                    Latest VRD (Issued {currentVrd.issueDate})
                  </span>
                )}
              </div>

              {/* Top-Right Corner Controls: Notice Tag, Scan VRD OCR button, VRD Records */}
              <div className="flex items-center flex-wrap gap-2">
                {/* Notice Tag: Appears when a new VRD is uploaded and awaiting approval */}
                {pendingVrdCount > 0 && (
                  <button
                    onClick={() => setIsApprovalQueueOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-semibold shadow-2xs transition-all animate-pulse"
                    title="Click to open waiting approval queue"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span>{pendingVrdCount} New VRD Waiting Approval</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                )}

                {/* Scan VRD OCR Button */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="Upload and scan VRD document with OCR"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan VRD OCR</span>
                </button>

                {/* VRD Records Button */}
                <button
                  onClick={() => setIsRecordsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  title="View all VRD historical records"
                >
                  <History className="w-3.5 h-3.5 text-zinc-500" />
                  <span>VRD Records ({sortedVrds.length})</span>
                </button>
              </div>
            </div>

            {currentVrd ? (
              <div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Owner Name (EN)</span>
                    <span className="font-bold text-zinc-900 text-base">{currentVrd.ownerNameEn || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Owner Name (ZH)</span>
                    <span className="font-bold text-zinc-900 text-base">{currentVrd.ownerNameZh || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">ID Document</span>
                    <span className="font-medium text-zinc-900">{currentVrd.idDocType} ({currentVrd.idDocPrefix || '***'})</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Date of Issue</span>
                    <span className="font-medium text-zinc-900">{new Date(currentVrd.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Licensing Office</span>
                    <span className="font-medium text-zinc-900">{currentVrd.licensingOffice || 'Kowloon'}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Local MinIO Storage</span>
                    <span className="font-mono text-xs text-blue-700 truncate block" title={currentVrd.minioPath}>
                      {currentVrd.minioPath || 's3://minio-local/hk-transport-vrd-bucket/...'}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-zinc-500 text-xs uppercase tracking-wider mb-1">Registered Address</span>
                    <span className="font-medium text-zinc-900">
                      {[currentVrd.addressBuilding, currentVrd.addressStreet, currentVrd.addressDistrict, currentVrd.addressTerritory].filter(Boolean).join(', ') || '-'}
                    </span>
                  </div>
                </div>

                {/* Current Registered Owner Menu Action Bar: Preview, Download, Edit Scanned Data */}
                <div className="px-6 py-3.5 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* Preview VRD file button */}
                    <button
                      onClick={() => handlePreviewVrd(currentVrd)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors shadow-2xs"
                      title="Preview latest VRD document"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>Preview VRD</span>
                    </button>

                    {/* Download VRD file button */}
                    <button
                      onClick={() => handleDownloadVrd(currentVrd)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors shadow-2xs"
                      title="Download VRD document"
                    >
                      <Download className="w-3.5 h-3.5 text-zinc-600" />
                      <span>Download VRD</span>
                    </button>

                    {/* Edit Scanned Data button */}
                    <button
                      onClick={() => handleEditVrd(currentVrd)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors shadow-2xs"
                      title="Edit scanned owner particulars"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Scanned Data</span>
                    </button>
                  </div>

                  {/* View All Records link */}
                  <button
                    onClick={() => setIsRecordsModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    <span>View All {sortedVrds.length} Records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">
                No VRD owner records registered. Click <strong>Scan VRD OCR</strong> to upload one.
              </div>
            )}
          </div>

          {/* Maintenance & Repair Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center">
              <Wrench className="w-5 h-5 text-zinc-500 mr-2" />
              <h3 className="text-lg font-semibold text-zinc-900">Maintenance & Repair Logs</h3>
            </div>
            <div className="p-0">
              {data.logs && data.logs.length > 0 ? (
                <ul className="divide-y divide-zinc-200">
                  {data.logs.map((log: any) => (
                    <li key={log.id} className="p-4 hover:bg-zinc-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{log.description}</p>
                          <div className="mt-1 flex items-center text-xs text-zinc-500 space-x-4">
                            <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(log.date).toLocaleDateString()}</span>
                            <span>Mileage: {log.mileage.toLocaleString()} km</span>
                          </div>
                        </div>
                        {log.cost && <span className="text-sm font-medium text-zinc-700">${log.cost}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 text-center text-sm text-zinc-500">No maintenance logs recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Files & Documents Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900">Files & Documents</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Top 5 vehicle assets &bull; Office NAS storage</p>
              </div>
            </div>

            <div className="p-0 flex flex-col min-h-[260px]">
              {data.files && data.files.length > 0 ? (
                <>
                  <ul className="divide-y divide-zinc-200 flex-grow">
                    {data.files.slice(0, 5).map((f: any) => {
                      const ext = (f.fileType || f.fileName?.split('.').pop() || 'file').toLowerCase();
                      const extBadge = ext === 'pdf' ? 'bg-red-50 text-red-700 border-red-200' :
                                       ext === 'docx' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                       ext === 'xlsx' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                       ext === 'txt' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                       'bg-zinc-100 text-zinc-700 border-zinc-200';

                      return (
                        <li key={f.id} className="p-3.5 hover:bg-zinc-50 flex flex-col gap-1.5 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center min-w-0">
                              <FileText className="w-4 h-4 text-zinc-500 mr-2.5 flex-shrink-0" />
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-zinc-900 truncate">{f.fileName || 'Document'}</p>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase ${extBadge}`}>
                                    {ext}
                                  </span>
                                </div>
                                <div className="flex items-center mt-1 space-x-2 text-xs text-zinc-500">
                                  <span>{new Date(f.uploadedAt).toLocaleDateString()}</span>
                                  <span>&bull;</span>
                                  <span className="flex items-center text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">
                                    <Folder className="w-3 h-3 mr-1" />
                                    {f.folder || 'General'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  
                  {/* Redirect CTA to /vehicles/:id/explorer */}
                  <div className="p-3 bg-zinc-50 border-t border-zinc-200">
                    <Link 
                      to={`/vehicles/${id}/explorer`}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg shadow-2xs transition-all group"
                    >
                      <FolderTree className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span>Browse All Assets in Tree Explorer</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-sm text-zinc-500 flex-grow flex flex-col items-center justify-center gap-2">
                  <Folder className="w-8 h-8 text-zinc-300" />
                  <p>No files uploaded for this vehicle.</p>
                  <Link
                    to={`/vehicles/${id}/explorer`}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline mt-1"
                  >
                    <FolderTree className="w-3.5 h-3.5" />
                    <span>Open Office NAS Explorer</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Upload VRD to local MinIO & Scan OCR */}
      <VrdUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        vehicleId={Number(id)}
        vehicleReg={data.registrationMark}
        onSuccess={(submission) => {
          fetchDetails();
          showToast("VRD uploaded to MinIO object storage and queued for review");
          setIsApprovalQueueOpen(true);
        }}
      />

      {/* Modal 2: VRD Staging & Waiting Approval Queue */}
      <VrdApprovalQueueModal
        isOpen={isApprovalQueueOpen}
        onClose={() => setIsApprovalQueueOpen(false)}
        vehicleId={Number(id)}
        vehicleReg={data.registrationMark}
        onSelectSubmissionForReview={(submission) => {
          setSelectedSubmission(submission);
          setIsVerificationOpen(true);
        }}
        onRefreshData={fetchDetails}
      />

      {/* Modal 3: Verification & Recommit Modal */}
      <VrdVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        vehicleId={Number(id)}
        submission={selectedSubmission}
        onApproved={() => {
          fetchDetails();
          showToast("VRD verified, approved and committed to vehicle records!");
        }}
      />

      {/* Modal 4: VRD Historical Records */}
      <VrdRecordsModal
        isOpen={isRecordsModalOpen}
        onClose={() => setIsRecordsModalOpen(false)}
        vehicleId={Number(id)}
        vehicle={data}
        onPreviewVrd={(vrd) => handlePreviewVrd(vrd)}
        onEditVrd={(vrd) => handleEditVrd(vrd)}
        onRefresh={fetchDetails}
      />

      {/* Modal 5: Edit Scanned Data on existing VRD */}
      <VrdEditDataModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        vrd={selectedVrdForEdit}
        onSaved={() => {
          fetchDetails();
          showToast("VRD registered owner particulars updated successfully!");
        }}
      />

      {/* Modal 6: Preview VRD Document File */}
      <VrdPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        vrd={selectedVrdForPreview}
        vehicle={data}
      />

      {/* Modal 7: Edit Car Avatar */}
      {data && (
        <EditCarAvatarModal
          isOpen={isEditAvatarOpen}
          onClose={() => setIsEditAvatarOpen(false)}
          vehicle={data}
          onSuccess={(newAvatarUrl) => {
            setData((prev: any) => prev ? { ...prev, avatarUrl: newAvatarUrl } : prev);
            showToast("Car avatar updated successfully!");
          }}
        />
      )}

      {/* Modal 8: Set / Edit VRD Expiry Date */}
      {data && (
        <VrdExpiryModal
          isOpen={isExpiryModalOpen}
          onClose={() => setIsExpiryModalOpen(false)}
          vehicleId={Number(id)}
          vehicleReg={data.registrationMark}
          currentExpiryDate={data.vrdExpiryDate}
          onSaved={(newDate: string | null) => {
            setData((prev: any) => prev ? { ...prev, vrdExpiryDate: newDate } : prev);
            showToast(newDate ? `VRD Expiry Date updated to ${newDate}` : 'VRD Expiry Date cleared to null (ignored)');
          }}
        />
      )}
    </div>
  );
}
