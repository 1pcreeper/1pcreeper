import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
}

export function Modal({ isOpen, onClose, title, children, onSubmit, submitLabel = "Save" }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
            >
              CANCEL
            </button>
            <button 
              type="submit"
              className="px-3 py-1.5 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
