import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function DeleteModal({ isOpen, onClose, onConfirm, title, message }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-xs text-slate-500">{message}</p>
        </div>
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
          >
            CANCEL
          </button>
          <button 
            onClick={onConfirm}
            className="px-3 py-1.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
          >
            DELETE
          </button>
        </div>
      </div>
    </div>
  );
}
