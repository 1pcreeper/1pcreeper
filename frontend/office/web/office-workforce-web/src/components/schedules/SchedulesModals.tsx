import { Loader2, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format, isSameDay } from 'date-fns';
import { DropdownSearch } from '../ui/DropdownSearch';
import WorkingPeriodContentService from '@/services/content/office/workforce/WorkingPeriodContentService';
import { WorkingPeriodResponseDTO } from '@/models/dto/office/workforce/response.dto';
import React, { useEffect, useRef, useState } from 'react';

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
  staffId?: string;
  staffName: string;
  role: string;
  startTime: string;
  endTime: string;
  placeId: string;
  workingPeriodId?: string;
};

type Place = { id: string; name: string; departId?: number };
type StaffItem = { id: string; name: string };
type OccupationItem = { id: string; name: string };

// WorkingPeriod times arrive as LocalTime ("HH:mm:ss"), but tolerate Jackson arrays too
const toHHmm = (t: unknown): string => {
  if (Array.isArray(t)) {
    return `${String(t[0]).padStart(2, '0')}:${String(t[1] ?? 0).padStart(2, '0')}`;
  }
  const s = String(t ?? '');
  return s.length >= 5 ? s.substring(0, 5) : s;
};

type SchedulesModalsProps = {
  isGenerateModalOpen: boolean;
  setIsGenerateModalOpen: (open: boolean) => void;
  isGenerating: boolean;
  handleGenerateClick: (options: { placeId: string; year: number; month: number }) => void;
  defaultGeneratePlaceId?: string;
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
  staffList?: StaffItem[];
  staffOccupations?: OccupationItem[];
  staffOccupationsLoading?: boolean;
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
  defaultGeneratePlaceId,
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
  staffList = [],
  staffOccupations = [],
  staffOccupationsLoading = false,
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
  const currentYear = new Date().getFullYear();
  const [generatePlaceId, setGeneratePlaceId] = useState<string>('');
  const [generateYear, setGenerateYear] = useState<number>(currentYear);
  const [generateMonth, setGenerateMonth] = useState<number>(new Date().getMonth() + 1);
  const workingPeriodsRef = useRef<Map<number, WorkingPeriodResponseDTO>>(new Map());

  const fetchWorkingPeriodOptions = async (search: string, page: number) => {
    const departId = PLACES.find(p => p.id === formData.placeId)?.departId;
    try {
      const res = await WorkingPeriodContentService.getInstance().search(
        departId,
        search.trim() || undefined,
        { page, size: 10 }
      );
      (res.content || []).forEach(w => workingPeriodsRef.current.set(w.id, w));
      return {
        content: (res.content || []).map(w => ({
          id: w.id,
          label: `${w.name || `Period #${w.id}`} (${toHHmm(w.startAt)} - ${toHHmm(w.endAt)})`
        })),
        totalPages: res.totalPages || 0
      };
    } catch (error) {
      console.error('Failed to load working periods:', error);
      return { content: [], totalPages: 0 };
    }
  };

  const selectedWorkingPeriod = formData.workingPeriodId
    ? workingPeriodsRef.current.get(Number(formData.workingPeriodId))
    : undefined;
  const workingPeriodLabel = selectedWorkingPeriod
    ? `${selectedWorkingPeriod.name || `Period #${selectedWorkingPeriod.id}`} (${toHHmm(selectedWorkingPeriod.startAt)} - ${toHHmm(selectedWorkingPeriod.endAt)})`
    : '';

  useEffect(() => {
    if (isGenerateModalOpen) {
      setGeneratePlaceId(defaultGeneratePlaceId || PLACES[0]?.id || '');
      setGenerateYear(currentYear);
      setGenerateMonth(new Date().getMonth() + 1);
    }
  }, [isGenerateModalOpen]);

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
                  <select
                    value={generatePlaceId}
                    onChange={(e) => setGeneratePlaceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {PLACES.length === 0 && <option value="">No places available</option>}
                    {PLACES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Year</label>
                    <input
                      type="number"
                      min={currentYear - 1}
                      max={currentYear + 5}
                      value={generateYear}
                      onChange={(e) => setGenerateYear(parseInt(e.target.value) || currentYear)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Month</label>
                    <select
                      value={generateMonth}
                      onChange={(e) => setGenerateMonth(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {MONTHS.map((m, idx) => (
                        <option key={m} value={idx + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
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
                onClick={() => handleGenerateClick({ placeId: generatePlaceId, year: generateYear, month: generateMonth })}
                disabled={isGenerating || !generatePlaceId}
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
                    <DropdownSearch 
                      value={formData.placeId ? Number(formData.placeId) : null} 
                      onChange={(val) => setFormData(p => ({ ...p, placeId: val.toString(), workingPeriodId: '' }))} 
                      fetchData={async (search) => {
                        const filtered = PLACES.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
                        return {
                          content: filtered.map(p => ({ id: Number(p.id) || 0, label: p.name })),
                          totalPages: 1
                        };
                      }}
                      placeholder="Select Place..."
                      initialLabel={PLACES.find(p => p.id === formData.placeId)?.name || ''}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Staff</label>
                    {staffList && staffList.length > 0 ? (
                      <div className="space-y-1.5">
                        <select
                          value={formData.staffId || ''}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const found = staffList.find(s => s.id === selectedId);
                            setFormData(p => ({
                              ...p,
                              staffId: selectedId,
                              staffName: found ? found.name : p.staffName
                            }));
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Select from Assigned Staff --</option>
                          {staffList.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (ID: #{s.id})</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={formData.staffName}
                          onChange={(e) => setFormData(p => ({ ...p, staffName: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                          placeholder="Or type custom staff name"
                        />
                      </div>
                    ) : (
                      <input 
                        required
                        type="text" 
                        value={formData.staffName}
                        onChange={(e) => setFormData(p => ({ ...p, staffName: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        placeholder="e.g. Jane Doe"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Role / Occupation</label>
                    {formData.staffId ? (
                      staffOccupationsLoading ? (
                        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                          Loading staff occupations...
                        </div>
                      ) : staffOccupations.length > 0 ? (
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Select Occupation --</option>
                          {staffOccupations.map(o => (
                            <option key={o.id} value={o.name}>{o.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div>
                          <select
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-400 opacity-60 cursor-not-allowed"
                          >
                            <option>-- No Occupations --</option>
                          </select>
                          <p className="text-[10px] text-amber-600 mt-1">No occupations assigned to this staff.</p>
                        </div>
                      )
                    ) : (
                      <input
                        required
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="e.g. Supervisor"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Working Period</label>
                    <DropdownSearch
                      value={formData.workingPeriodId ? Number(formData.workingPeriodId) : null}
                      onChange={(val) => {
                        const wp = workingPeriodsRef.current.get(val);
                        setFormData(p => ({
                          ...p,
                          workingPeriodId: val.toString(),
                          startTime: wp ? toHHmm(wp.startAt) : p.startTime,
                          endTime: wp ? toHHmm(wp.endAt) : p.endTime
                        }));
                      }}
                      fetchData={fetchWorkingPeriodOptions}
                      placeholder="Select Working Period..."
                      initialLabel={workingPeriodLabel}
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
                      {formData.startTime && formData.endTime && formData.endTime < formData.startTime && (
                        <p className="mt-1 text-[10px] font-bold text-indigo-500">Ends next day (+1)</p>
                      )}
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
