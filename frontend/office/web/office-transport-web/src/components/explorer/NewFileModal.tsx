import React, { useState, useRef, useEffect } from 'react';
import { 
  X, FilePlus, UploadCloud, FileText, Sheet, FileCode, 
  Image as ImageIcon, Archive, File, HardDrive, Check
} from 'lucide-react';

interface NewFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileData: { 
    fileName: string; 
    folder: string; 
    fileType: string; 
    content?: string; 
    fileSize?: string;
    fileUrl?: string;
  }) => Promise<void>;
  existingFolders: any[];
  currentFolder?: string;
  vehicleReg?: string;
  vehicleId?: string | number;
  nasRoot?: string;
}

export const NewFileModal: React.FC<NewFileModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingFolders,
  currentFolder = 'General',
  vehicleReg,
  vehicleId = '1',
  nasRoot
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [fileName, setFileName] = useState('');
  const [targetFolder, setTargetFolder] = useState(currentFolder || 'General');
  const [fileType, setFileType] = useState('pdf');
  const [customExtension, setCustomExtension] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTargetFolder(currentFolder || 'General');
      setFileName('');
      setNotes('');
      setUploadedFile(null);
      setFileContent(null);
      setFileDataUrl(null);
      setError(null);
      setCustomExtension('');
    }
  }, [isOpen, currentFolder]);

  if (!isOpen) return null;

  // Handle local file selection of ANY format
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setFileName(file.name);

    // Extract extension
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'dat';
    setFileType(ext);

    // Format size
    const sizeInKb = file.size / 1024;
    const formattedSize = sizeInKb > 1024 
      ? `${(sizeInKb / 1024).toFixed(1)} MB` 
      : `${Math.round(sizeInKb)} KB`;

    // Read content if text or image
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setFileDataUrl(loadEvt.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('text/') || ext === 'json' || ext === 'csv' || ext === 'log' || ext === 'txt' || ext === 'xml') {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setFileContent(loadEvt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setFileName(file.name);
    const parts = file.name.split('.');
    const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'dat';
    setFileType(ext);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setFileDataUrl(loadEvt.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('text/') || ext === 'json' || ext === 'csv' || ext === 'log' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setFileContent(loadEvt.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      setError('Please provide a file or file name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const effectiveExt = customExtension.trim() 
        ? customExtension.trim().replace(/^\./, '').toLowerCase() 
        : fileType.toLowerCase().replace(/^\./, '');

      let cleanName = fileName.trim();
      if (!cleanName.toLowerCase().endsWith(`.${effectiveExt}`)) {
        cleanName = `${cleanName}.${effectiveExt}`;
      }

      let computedSize = '1.2 MB';
      if (uploadedFile) {
        const sizeInKb = uploadedFile.size / 1024;
        computedSize = sizeInKb > 1024 
          ? `${(sizeInKb / 1024).toFixed(1)} MB` 
          : `${Math.round(sizeInKb)} KB`;
      } else {
        if (effectiveExt === 'pdf') computedSize = '1.4 MB';
        else if (['docx', 'doc'].includes(effectiveExt)) computedSize = '320 KB';
        else if (['xlsx', 'xls', 'csv'].includes(effectiveExt)) computedSize = '120 KB';
        else if (['png', 'jpg', 'jpeg', 'webp'].includes(effectiveExt)) computedSize = '2.4 MB';
        else if (['zip', 'rar', '7z'].includes(effectiveExt)) computedSize = '5.8 MB';
        else computedSize = '45 KB';
      }

      await onSubmit({
        fileName: cleanName,
        folder: targetFolder || 'General',
        fileType: effectiveExt,
        content: fileContent || notes.trim() || undefined,
        fileSize: computedSize,
        fileUrl: fileDataUrl || undefined
      });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to upload/create file');
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectiveExt = customExtension.trim() 
    ? customExtension.trim().replace(/^\./, '').toLowerCase() 
    : fileType.toLowerCase().replace(/^\./, '');

  const liveFileName = fileName.trim() 
    ? (fileName.toLowerCase().endsWith(`.${effectiveExt}`) ? fileName.trim() : `${fileName.trim()}.${effectiveExt}`)
    : `New_Document.${effectiveExt}`;

  const effectiveNasRoot = nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicleId}`;
  const fullNasPath = `${effectiveNasRoot}\\${targetFolder}\\${liveFileName}`;

  const popularFormats = [
    { ext: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-600 bg-red-50 border-red-200' },
    { ext: 'docx', label: 'DOCX', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { ext: 'xlsx', label: 'XLSX', icon: Sheet, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { ext: 'csv', label: 'CSV', icon: Sheet, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { ext: 'txt', label: 'TXT', icon: FileCode, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { ext: 'png', label: 'PNG', icon: ImageIcon, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { ext: 'jpg', label: 'JPG', icon: ImageIcon, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { ext: 'zip', label: 'ZIP', icon: Archive, color: 'text-zinc-600 bg-zinc-50 border-zinc-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-zinc-900 font-bold text-sm">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <FilePlus className="w-4 h-4" />
            </div>
            <span>Upload or Register NAS Document (Any Format)</span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch: Upload Any Format vs Manual Entry */}
        <div className="px-5 pt-3 flex border-b border-zinc-200 bg-zinc-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Any File Format</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'manual'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Create / Register Manually</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto min-h-0 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* TAB 1: UPLOAD ANY FORMAT */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
              >
                <div className="p-3 bg-blue-50 group-hover:bg-blue-100 text-blue-600 rounded-full transition-colors">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-700 group-hover:underline">Click to upload</span>
                  <span className="text-xs text-zinc-500"> or drag and drop any file</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Supports ALL formats: PDF, DOCX, XLSX, CSV, PNG, JPG, ZIP, CAD, JSON, TXT, etc.
                </p>
              </div>

              {uploadedFile && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2 truncate">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold">{uploadedFile.name}</span>
                      <span className="text-emerald-700 ml-2 font-mono text-[11px]">
                        ({(uploadedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  </div>
                  <span className="font-mono uppercase font-bold text-[10px] bg-emerald-200/80 px-1.5 py-0.5 rounded">
                    .{fileType}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MANUAL FORMAT SPECIFICATION */}
          {activeTab === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Choose Common Format or Type Custom Extension
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {popularFormats.map((fmt) => {
                    const Icon = fmt.icon;
                    const isSelected = fileType === fmt.ext && !customExtension;
                    return (
                      <button
                        key={fmt.ext}
                        type="button"
                        onClick={() => {
                          setFileType(fmt.ext);
                          setCustomExtension('');
                        }}
                        className={`p-2 rounded-lg border text-center flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-2xs'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">.{fmt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Custom File Extension (e.g. log, json, cad, xml, heic)
                </label>
                <input
                  type="text"
                  value={customExtension}
                  onChange={(e) => setCustomExtension(e.target.value.replace(/^\./, ''))}
                  placeholder="e.g. mp4, json, svg, rtf, log"
                  className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* File Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Document / File Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Maintenance_Invoice_2024, Vehicle_Photo_Side"
                className="w-full px-3 py-2 pr-14 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-zinc-400 select-none uppercase">
                .{effectiveExt}
              </span>
            </div>
          </div>

          {/* Target Folder */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Destination Folder in Office NAS
            </label>
            <select
              value={targetFolder}
              onChange={(e) => setTargetFolder(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {existingFolders.map((f: any) => (
                <option key={f.id || f.name} value={f.name}>
                  {f.parent ? `📁 ${f.parent} / ${f.name}` : `📁 ${f.name}`}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add archival notes, vendor details, or remarks..."
              className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Live NAS Path Preview */}
          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium">Office NAS Destination:</span>
            </div>
            <div className="font-mono text-[11px] text-blue-700 break-all bg-white p-1.5 rounded border border-zinc-200 select-all">
              {fullNasPath}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Uploading...' : 'Save to Office NAS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
