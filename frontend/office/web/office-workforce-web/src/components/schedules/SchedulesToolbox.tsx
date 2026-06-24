import { Trash2, Edit, Plus, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type SelectionMode = 'IDLE' | 'MULTIPLE' | 'CREATE';
type MultipleSelectMethod = 'SCHEDULE' | 'DATE';
type Mode = 'CURRENT' | 'DRAFT';

type SchedulesToolboxProps = {
  mode: Mode;
  selectionMode: SelectionMode;
  multipleSelectMethod: MultipleSelectMethod;
  selectedShiftIds: string[];
  selectedDates: string[];
  handleSelectionModeChange: (mode: 'MULTIPLE' | 'CREATE') => void;
  setMultipleSelectMethod: (method: MultipleSelectMethod) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setRightSidebarMode: (mode: 'SCHEDULE' | 'FORMS') => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsOverwriteModalOpen: (open: boolean) => void;
  setIsClearDraftsModalOpen: (open: boolean) => void;
  setIsSubmitDraftsModalOpen: (open: boolean) => void;
};

export function SchedulesToolbox({
  mode,
  selectionMode,
  multipleSelectMethod,
  selectedShiftIds,
  selectedDates,
  handleSelectionModeChange,
  setMultipleSelectMethod,
  setIsDeleteModalOpen,
  setRightSidebarMode,
  setIsCreateModalOpen,
  setIsOverwriteModalOpen,
  setIsClearDraftsModalOpen,
  setIsSubmitDraftsModalOpen
}: SchedulesToolboxProps) {
  return (
    <div className="flex flex-col items-center absolute bottom-0 left-0 w-full pointer-events-none z-30 pb-4 gap-2">
      <div className="bg-slate-900 text-white rounded-full px-6 py-2 shadow-2xl flex items-center gap-8 pointer-events-auto border border-slate-700">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Toolbox</span>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex bg-slate-800 p-1 rounded-full">
            <button 
              onClick={() => handleSelectionModeChange('MULTIPLE')}
              className={cn(
                "px-4 py-1 text-[10px] font-bold rounded-full transition-colors",
                selectionMode === 'MULTIPLE' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              MULTIPLE SELECT
            </button>
            <button 
              onClick={() => handleSelectionModeChange('CREATE')}
              className={cn(
                "px-4 py-1 text-[10px] font-bold rounded-full transition-colors",
                selectionMode === 'CREATE' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              )}
            >
              CREATE MODE
            </button>
          </div>
        </div>
        
        {(selectionMode === 'MULTIPLE' || selectionMode === 'CREATE') && (
           <div className="flex gap-2 items-center">
              {selectionMode === 'MULTIPLE' && (
                 <>
                   <div className="flex bg-slate-800 p-1 rounded mr-2">
                     <button onClick={() => setMultipleSelectMethod('SCHEDULE')} className={cn("px-2 py-0.5 text-[9px] font-bold rounded", multipleSelectMethod === 'SCHEDULE' ? "bg-slate-600 text-white" : "text-slate-400 hover:bg-slate-700")}>BY SCHEDULE</button>
                     <button onClick={() => setMultipleSelectMethod('DATE')} className={cn("px-2 py-0.5 text-[9px] font-bold rounded", multipleSelectMethod === 'DATE' ? "bg-slate-600 text-white" : "text-slate-400 hover:bg-slate-700")}>BY DATE</button>
                   </div>
                   <button 
                     onClick={() => setIsDeleteModalOpen(true)}
                     disabled={selectedShiftIds.length === 0}
                     className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     <Trash2 className="w-3 h-3" />
                     DELETE
                   </button>
                   <button
                     onClick={() => setRightSidebarMode('FORMS')}
                     className="px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-500 rounded text-[10px] font-bold flex items-center gap-1"
                   >
                     GENERATE FORMS
                   </button>
                 </>
              )}
              <button 
                onClick={() => selectionMode === 'CREATE' ? setIsCreateModalOpen(true) : setIsOverwriteModalOpen(true)}
                disabled={selectionMode === 'CREATE' ? selectedDates.length === 0 : selectedShiftIds.length === 0}
                className="px-3 py-1 bg-white text-slate-900 hover:bg-slate-200 rounded text-[10px] font-bold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {selectionMode === 'CREATE' ? <Plus className="w-3 h-3" /> : <Edit className="w-3 h-3" />}
                {selectionMode === 'CREATE' ? 'CREATE' : 'OVERWRITE'}
              </button>
           </div>
        )}
      </div>

      {mode === 'DRAFT' && (
        <div className="bg-slate-800 text-white rounded-full px-4 py-1.5 shadow-xl flex items-center gap-4 pointer-events-auto border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
           <span className="text-[10px] font-bold uppercase text-slate-400 pl-2">Draft Actions</span>
           <div className="h-3 w-px bg-slate-600"></div>
           <div className="flex gap-2">
              <button 
                onClick={() => setIsClearDraftsModalOpen(true)}
                className="px-3 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                CLEAR ALL DRAFTS
              </button>
              <button 
                onClick={() => setIsSubmitDraftsModalOpen(true)}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 rounded-full text-[10px] font-bold flex items-center gap-1 text-white transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                SUBMIT DRAFTS
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
