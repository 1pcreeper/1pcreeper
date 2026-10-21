import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Folder, CornerDownRight, HardDrive } from 'lucide-react';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, parent: string | null) => Promise<void>;
  existingFolders: any[];
  defaultParent?: string | null;
  vehicleReg?: string;
  vehicleId?: string | number;
  nasRoot?: string;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingFolders,
  defaultParent = null,
  vehicleReg,
  vehicleId = '1',
  nasRoot
}) => {
  const [folderName, setFolderName] = useState('');
  const [parentFolder, setParentFolder] = useState<string | null>(defaultParent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize parent folder with defaultParent when modal opens or selection changes
  useEffect(() => {
    if (isOpen) {
      setParentFolder(defaultParent || null);
      setFolderName('');
      setError(null);
    }
  }, [isOpen, defaultParent]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(folderName.trim(), parentFolder);
      setFolderName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectiveNasRoot = nasRoot || `\\\\HK-OFFICE-NAS\\TransportDept\\Vehicles\\${vehicleId}`;
  const fullNasPreview = `${effectiveNasRoot}\\${parentFolder ? `${parentFolder}\\` : ''}${folderName.trim() || 'New_Folder'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-900 font-semibold text-sm">
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <FolderPlus className="w-4 h-4" />
            </div>
            <span>{parentFolder ? 'Create Nested Subfolder' : 'Create New Folder'}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Parent Directory Selector (Highlights if selected from tree view) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-zinc-700">
                Target Parent Directory
              </label>
              {parentFolder && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Nested inside selected folder
                </span>
              )}
            </div>

            <select
              value={parentFolder || ''}
              onChange={(e) => setParentFolder(e.target.value ? e.target.value : null)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">📁 Root (Vehicle Directory)</option>
              {existingFolders.map((f: any) => (
                <option key={f.id || f.name} value={f.name}>
                  {f.parent ? `↳ 📁 ${f.parent} / ${f.name}` : `📁 ${f.name}`}
                </option>
              ))}
            </select>

            {parentFolder ? (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-100">
                <CornerDownRight className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span>Will be created inside <strong className="font-semibold">{parentFolder}</strong></span>
              </div>
            ) : (
              <div className="mt-1.5 text-[11px] text-zinc-500">
                Folder will be created at the top level of this vehicle's NAS repository.
              </div>
            )}
          </div>

          {/* Folder Name Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. 2024 Inspection Reports, Invoices & Claims"
              autoFocus
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Live NAS Path Preview */}
          <div className="p-2.5 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
              <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium">Target NAS Path:</span>
            </div>
            <div className="font-mono text-[11px] text-blue-700 break-all bg-white p-1.5 rounded border border-zinc-200 select-all">
              {fullNasPreview}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
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
              <FolderPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating...' : parentFolder ? 'Create Subfolder' : 'Create Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
