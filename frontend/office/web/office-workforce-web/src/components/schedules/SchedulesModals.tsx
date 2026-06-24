import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, isSameDay } from 'date-fns';
import { SearchablePlaceSelect } from '../SearchablePlaceSelect';
import React from 'react';

type Shift = {
  id: string;
  placeId: string;
  date: Date;
  staffName: string;
  role: string;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'DRAFT';
};

type FormData = {
  staffName: string;
  role: string;
  startTime: string;
  endTime: string;
  placeId: string;
};

type Place = { id: string; name: string };

type SchedulesModalsProps = {
  isGenerateModalOpen: boolean;
  setIsGenerateModalOpen: (open: boolean) => void;
  isGenerating: boolean;
  handleGenerateClick: () => void;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  handleDeleteConfirm: () => void;
  selectedShiftIds: string[];
  isOverwriteModalOpen: boolean;
  setIsOverwriteModalOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  handleOverwriteSubmit: (e: React.FormEvent) => void;
  handleCreateSubmit: (e: React.FormEvent) => void;
  selectedDates: string[];
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  PLACES: Place[];
  mode: 'CURRENT' | 'DRAFT';
  isClearDraftsModalOpen: boolean;
  setIsClearDraftsModalOpen: (open: boolean) => void;
  handleClearDraftsConfirm: () => void;
  isSubmitDraftsModalOpen: boolean;
  setIsSubmitDraftsModalOpen: (open: boolean) => void;
  handleSubmitDraftsConfirm: () => void;
  viewDayDetails: Date | null;
  setViewDayDetails: (date: Date | null) => void;
  visibleShifts: Shift[];
};

export function SchedulesModals({
  isGenerateModalOpen,
  setIsGenerateModalOpen,
  isGenerating,
  handleGenerateClick,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  handleDeleteConfirm,
  selectedShiftIds,
  isOverwriteModalOpen,
  setIsOverwriteModalOpen,
  isCreateModalOpen,
  setIsCreateModalOpen,
  handleOverwriteSubmit,
  handleCreateSubmit,
  selectedDates,
  formData,
  setFormData,
  PLACES,
  mode,
  isClearDraftsModalOpen,
  setIsClearDraftsModalOpen,
  handleClearDraftsConfirm,
  isSubmitDraftsModalOpen,
  setIsSubmitDraftsModalOpen,
  handleSubmitDraftsConfirm,
  viewDayDetails,
  setViewDayDetails,
  visibleShifts
}: SchedulesModalsProps) {
  return (
    <>
      {/* Generate Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Generate New Schedule</h3>
              <button 
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
               <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Target Place</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Main Headquarters</option>
                    <option>Downtown Branch</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Year</label>
                    <input type="number" defaultValue="2024" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Month</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      <option>August</option>
                      <option>September</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Rule Presets</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Standard Corporate (40h/week)</option>
                    <option>24/7 Continuous Operations</option>
                  </select>
                </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
              >
                CANCEL
              </button>
              <button 
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 shadow-sm"
              >
                {isGenerating && <Loader2 className="w-3 h-3 animate-spin" />}
                {isGenerating ? 'INITIALIZING...' : 'CONFIRM GENERATE'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals for Create/Overwrite/Delete */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Delete Selected Shifts</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete {selectedShiftIds.length} shifts? This action cannot be undone.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
              >
                CANCEL
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="px-3 py-1.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {(isOverwriteModalOpen || isCreateModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-900 uppercase">
                {isOverwriteModalOpen ? `Overwrite ${selectedShiftIds.length} Shifts` : `Create Shifts for ${selectedDates.length} Dates`}
              </h3>
              <button 
                onClick={() => {
                  setIsOverwriteModalOpen(false);
                  setIsCreateModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={isOverwriteModalOpen ? handleOverwriteSubmit : handleCreateSubmit}>
              <div className="p-5 space-y-4">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Place</label>
                    <SearchablePlaceSelect 
                      places={PLACES} 
                      value={formData.placeId} 
                      onChange={(val) => setFormData(p => ({ ...p, placeId: val }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Staff Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.staffName}
                      onChange={(e) => setFormData(p => ({ ...p, staffName: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      placeholder="e.g. Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Role</label>
                    <input 
                      required
                      type="text" 
                      value={formData.role}
                      onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      placeholder="e.g. Supervisor"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                      <input 
                        type="time" 
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData(p => ({ ...p, startTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Time</label>
                      <input 
                        type="time" 
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData(p => ({ ...p, endTime: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => {
                    setIsOverwriteModalOpen(false);
                    setIsCreateModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="px-3 py-1.5 rounded text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {isOverwriteModalOpen ? 'OVERWRITE' : 'CREATE'} ({mode === 'CURRENT' ? 'ACTIVE' : 'DRAFT'})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Drafts Modals */}
      {isClearDraftsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Clear All Drafts</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete all drafts? This action cannot be undone.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setIsClearDraftsModalOpen(false)} className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white">CANCEL</button>
              <button onClick={handleClearDraftsConfirm} className="px-3 py-1.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm">DELETE ALL</button>
            </div>
          </div>
        </div>
      )}

      {isSubmitDraftsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-sm flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Submit All Drafts</h3>
              <p className="text-xs text-slate-500">
                Confirm submitting all drafts. They will become regular active schedules.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button onClick={() => setIsSubmitDraftsModalOpen(false)} className="px-3 py-1.5 rounded text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition-colors border border-slate-300 bg-white">CANCEL</button>
              <button onClick={handleSubmitDraftsConfirm} className="px-3 py-1.5 rounded text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">SUBMIT</button>
            </div>
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {viewDayDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded shadow-xl w-full max-w-md flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-xs font-bold text-slate-900 uppercase">Shifts for {format(viewDayDetails, 'PP')}</h3>
               <button onClick={() => setViewDayDetails(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200 transition-colors">
                 <Plus className="w-4 h-4 rotate-45" />
               </button>
            </div>
             <div className="p-5 max-h-[60vh] overflow-y-auto">
               {(() => {
                 const dayShifts = visibleShifts.filter(s => isSameDay(s.date, viewDayDetails));
                 if (dayShifts.length === 0) return <p className="text-xs text-slate-500">No shifts scheduled for this day.</p>;
                 return (
                   <div className="space-y-2">
                     {dayShifts.map(shift => (
                       <div key={shift.id} className={cn("p-2.5 border rounded-md flex justify-between items-center", shift.status === 'ACTIVE' ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 border-dashed text-amber-900")}>
                         <div>
                           <p className="text-xs font-bold">{shift.staffName}</p>
                           <p className="text-[10px] uppercase opacity-70 mt-0.5">{shift.role}</p>
                         </div>
                         <div className="text-right flex flex-col items-end gap-1">
                           <p className="text-xs font-bold">{shift.startTime} - {shift.endTime}</p>
                           <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded", shift.status === 'ACTIVE' ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800")}>{shift.status}</span>
                         </div>
                       </div>
                     ))}
                   </div>
                 )
               })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
