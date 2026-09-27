import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  maxWidth?: string;
  submitDisabled?: boolean;
  onDelete?: () => void;
}

export function Modal({ isOpen, onClose, title, children, onSubmit, submitLabel = "Save", maxWidth = "max-w-md", submitDisabled = false, onDelete }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className={`bg-white rounded shadow-xl w-full ${maxWidth} flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-900 uppercase">{title}</h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={onSubmit}>
          <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-between gap-2">
            <div>
              {onDelete && (
                <button 
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1.5 rounded text-[10px] font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-200 bg-white"
                >
                  DELETE
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
              >
                CANCEL
              </button>
              <button 
                type="submit"
                disabled={submitDisabled}
                className={`px-3 py-1.5 rounded text-[10px] font-bold text-white transition-colors shadow-sm ${submitDisabled ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
