import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, AlertCircle, HardDrive, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import VehicleService from '../../services/VehicleService.ts';

interface VrdUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  vehicleReg: string;
  onSuccess: (submission: any) => void;
}

export const VrdUploadModal: React.FC<VrdUploadModalProps> = ({
  isOpen,
  onClose,
  vehicleId,
  vehicleReg,
  onSuccess
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a VRD document to scan.");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      const res = await VehicleService.getInstance().uploadVehicleVrdOcr(vehicleId, file);
      onSuccess(res.data?.submission || (res as any).submission);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to upload and scan VRD document.");
    } finally {
      setIsUploading(false);
    }
  };

  // Sample quick test presets
  const handleSelectSample = async (sampleType: 'transfer' | 'renewal') => {
    try {
      setIsUploading(true);
      setError(null);
      // Create a mock File object simulating a scanned VRD image/pdf
      const content = `HONG KONG TRANSPORT DEPARTMENT - VEHICLE REGISTRATION DOCUMENT
Registration Mark: ${vehicleReg}
Class: PRIVATE CAR
Owner: ${sampleType === 'transfer' ? 'CHAN TAI MAN (陳大文)' : 'LEE KA SHING (李嘉誠)'}
Date of Issue: ${new Date().toISOString().split('T')[0]}
Document: Certified VRD Form`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const sampleFile = new (window as any).File([blob], `${vehicleReg}_VRD_${sampleType}_2024.pdf`, { type: 'application/pdf' });
      const res = await VehicleService.getInstance().uploadVehicleVrdOcr(vehicleId, sampleFile);
      onSuccess(res.data?.submission || (res as any).submission);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to process sample scan.");
    } finally {
      setIsUploading(false);
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Scan VRD OCR & Object Store</h3>
              <p className="text-xs text-zinc-500">Upload to local MinIO bucket & initiate OCR extraction</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MinIO Storage Info Banner */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <HardDrive className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Local MinIO Object Storage Destination</p>
              <p className="text-[11px] text-blue-700 font-mono">
                s3://minio-local/hk-transport-vrd-bucket/vehicles/{vehicleId}/
              </p>
              <p className="text-[10px] text-blue-600">
                Independent of Office NAS Directory Tree &bull; Encrypted & stored with audit trail
              </p>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging 
                ? 'border-blue-500 bg-blue-50/50' 
                : file 
                  ? 'border-emerald-400 bg-emerald-50/30' 
                  : 'border-zinc-300 hover:border-blue-400 hover:bg-zinc-50'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,application/pdf"
              className="hidden" 
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-full">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="font-semibold text-sm text-zinc-900">{file.name}</div>
                <div className="text-xs text-zinc-500 font-mono">
                  {(file.size / 1024).toFixed(1)} KB &bull; {file.type || 'application/octet-stream'}
                </div>
                <span className="text-[11px] text-blue-600 hover:underline mt-1">Click to replace file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 bg-zinc-100 text-zinc-500 rounded-full">
                  <UploadCloud className="w-6 h-6 text-zinc-600" />
                </div>
                <div className="font-semibold text-sm text-zinc-900">
                  Drop your VRD document here, or <span className="text-blue-600">browse</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Supports official Transport Dept scans: PDF, PNG, JPG, JPEG (up to 20MB)
                </p>
              </div>
            )}
          </div>

          {/* Quick Test Preset Buttons */}
          <div className="pt-1">
            <span className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Or quick test with sample VRDs:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSelectSample('transfer')}
                className="p-2.5 text-left border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-colors text-xs group"
              >
                <div className="font-semibold text-zinc-800 group-hover:text-blue-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transfer VRD (Chan Tai Man)</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Simulate vehicle ownership transfer</div>
              </button>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => handleSelectSample('renewal')}
                className="p-2.5 text-left border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-xl transition-colors text-xs group"
              >
                <div className="font-semibold text-zinc-800 group-hover:text-blue-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Renewal VRD (Lee Ka Shing)</span>
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Simulate licensing renewal scan</div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-2xs inline-flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading to MinIO & Scanning...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Upload & Run OCR Scan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
