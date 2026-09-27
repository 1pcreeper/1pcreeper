import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import React from 'react';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

export function MessageModal({ isOpen, onClose, title, message, type }: MessageModalProps) {
  if (!isOpen) return null;

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const iconColor = type === 'success' ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold text-slate-900 uppercase flex items-center gap-2">
             <Icon className={`w-4 h-4 ${iconColor}`} /> {title}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5 text-sm text-slate-700">
          {message}
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
