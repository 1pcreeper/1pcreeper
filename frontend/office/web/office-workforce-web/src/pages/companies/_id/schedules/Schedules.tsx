import { SchedulesCalendarGrid } from '@/components/schedules/SchedulesCalendarGrid';
import { SchedulesModals } from '@/components/schedules/SchedulesModals';
import { SchedulesSidebar } from '@/components/schedules/SchedulesSidebar';
import { SchedulesToolbox } from '@/components/schedules/SchedulesToolbox';
import { cn } from '@/lib/utils';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

const PLACES = [
    { id: 'p1', name: 'Main Headquarters' },
    { id: 'p2', name: 'Downtown Branch' },
    { id: 'p3', name: 'Westside Operations' },
    { id: 'p4', name: 'Eastside Support' },
    { id: 'p5', name: 'North Campus' },
    { id: 'p6', name: 'South Division' },
    { id: 'p7', name: 'Central Hub' },
];

const TASK_HISTORY = [
    { id: 1, title: 'HQ - Aug 2024', status: 'PROCESSING', rules: 'Processing rules...' },
    { id: 2, title: 'Branch A - Jul 2024', status: 'COMPLETED', rules: 'Completed • 45 shifts' },
    { id: 3, title: 'HQ - May 2024', status: 'FAILED', rules: 'Error: Conflict in Rule ORG-4' }
];

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

const initialShifts: Shift[] = [
    { id: '1', placeId: 'p1', date: new Date(2024, 7, 1), staffName: 'John Doe', role: 'Reception', startTime: '09:00', endTime: '17:00', status: 'ACTIVE' },
    { id: '2', placeId: 'p1', date: new Date(2024, 7, 2), staffName: 'Sarah Smith', role: 'Reception', startTime: '09:00', endTime: '17:00', status: 'ACTIVE' },
    { id: '3', placeId: 'p2', date: new Date(2024, 7, 2), staffName: 'M. Lee', role: 'Support', startTime: '18:00', endTime: '22:00', status: 'DRAFT' },
];

export default function Schedules() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 7)); // August 2024
    const [mode, setMode] = useState<'CURRENT' | 'DRAFT'>('CURRENT');
    const [selectionMode, setSelectionMode] = useState<'IDLE' | 'MULTIPLE' | 'CREATE'>('IDLE');

    const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
    const [isPlacesDropdownOpen, setIsPlacesDropdownOpen] = useState(false);
    const [placeSearchTerm, setPlaceSearchTerm] = useState('');
    const [multipleSelectMethod, setMultipleSelectMethod] = useState<'SCHEDULE' | 'DATE'>('SCHEDULE');

    const [viewDayDetails, setViewDayDetails] = useState<Date | null>(null);
    const [rightSidebarMode, setRightSidebarMode] = useState<'SCHEDULE' | 'FORMS'>('SCHEDULE');

    const [shifts, setShifts] = useState<Shift[]>(initialShifts);
    const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [isClearDraftsModalOpen, setIsClearDraftsModalOpen] = useState(false);
    const [isSubmitDraftsModalOpen, setIsSubmitDraftsModalOpen] = useState(false);

    const [formData, setFormData] = useState({ staffName: '', role: '', startTime: '09:00', endTime: '17:00', placeId: 'p1' });

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleGenerateClick = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setIsGenerateModalOpen(false);
        }, 2000);
    };

    const handleSelectionModeChange = (newMode: 'MULTIPLE' | 'CREATE') => {
        if (selectionMode === newMode) {
            setSelectionMode('IDLE');
        } else {
            setSelectionMode(newMode);
        }
        setSelectedShiftIds([]);
        setSelectedDates([]);
    };

    const handleDayClick = (date: Date) => {
        if (selectionMode === 'CREATE') {
            const dateStr = date.toISOString();
            setSelectedDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]);
        } else if (selectionMode === 'MULTIPLE' && multipleSelectMethod === 'DATE') {
            const dayShifts = visibleShifts.filter(s => isSameDay(s.date, date));
            const dayShiftIds = dayShifts.map(s => s.id);
            if (dayShiftIds.length > 0) {
                const allSelected = dayShiftIds.every(id => selectedShiftIds.includes(id));
                if (allSelected) {
                    setSelectedShiftIds(prev => prev.filter(id => !dayShiftIds.includes(id)));
                } else {
                    setSelectedShiftIds(prev => [...prev, ...dayShiftIds.filter(id => !prev.includes(id))]);
                }
            }
        } else if (selectionMode === 'IDLE') {
            setViewDayDetails(date);
        }
    };

    const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
        e.stopPropagation();
        if (selectionMode === 'MULTIPLE' && multipleSelectMethod === 'SCHEDULE') {
            if (mode === 'CURRENT' && shift.status !== 'ACTIVE') return;
            if (mode === 'DRAFT' && shift.status !== 'DRAFT' && shift.status !== 'ACTIVE') return;

            setSelectedShiftIds(prev => prev.includes(shift.id) ? prev.filter(id => id !== shift.id) : [...prev, shift.id]);
        }
    };

    const handleDeleteConfirm = () => {
        setShifts(prev => prev.filter(s => !selectedShiftIds.includes(s.id)));
        setSelectedShiftIds([]);
        setIsDeleteModalOpen(false);
    };

    const handleClearDraftsConfirm = () => {
        setShifts(prev => prev.filter(s => s.status !== 'DRAFT'));
        setIsClearDraftsModalOpen(false);
    };

    const handleSubmitDraftsConfirm = () => {
        setShifts(prev => prev.map(s => s.status === 'DRAFT' ? { ...s, status: 'ACTIVE' } : s));
        setIsSubmitDraftsModalOpen(false);
    };

    const handleOverwriteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShifts(prev => prev.map(s => {
            if (selectedShiftIds.includes(s.id)) {
                return { ...s, ...formData, status: mode === 'CURRENT' ? 'ACTIVE' : 'DRAFT' };
            }
            return s;
        }));
        setSelectedShiftIds([]);
        setIsOverwriteModalOpen(false);
        setFormData({ staffName: '', role: '', startTime: '09:00', endTime: '17:00', placeId: 'p1' });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newStatus = mode === 'CURRENT' ? 'ACTIVE' : 'DRAFT';
        const newShifts: Shift[] = selectedDates.map(dateStr => ({
            id: Math.random().toString(36).substring(7),
            placeId: formData.placeId,
            date: new Date(dateStr),
            staffName: formData.staffName,
            role: formData.role,
            startTime: formData.startTime,
            endTime: formData.endTime,
            status: newStatus as 'ACTIVE' | 'DRAFT',
        }));

        setShifts(prev => [...prev, ...newShifts]);
        setSelectedDates([]);
        setIsCreateModalOpen(false);
        setFormData({ staffName: '', role: '', startTime: '09:00', endTime: '17:00', placeId: 'p1' });
    };

    const visibleShifts = shifts.filter(s => {
        if (selectedPlaces.length > 0 && !selectedPlaces.includes(s.placeId)) return false;
        if (mode === 'CURRENT') return s.status === 'ACTIVE';
        return true;
    });

    const placeNames = selectedPlaces.length > 0 ? selectedPlaces.map(id => PLACES.find(p => p.id === id)?.name).join(', ') : '';
    const headerTitle = placeNames ? `${placeNames} - ${format(currentDate, 'MMMM yyyy')} Roster` : `${format(currentDate, 'MMMM yyyy')} Roster`;

    return (
        <div className="flex h-full w-full overflow-hidden bg-slate-50">

            {/* Center Calendar Section */}
            <div className="flex-1 flex flex-col relative overflow-hidden min-w-0 bg-slate-50">

                {/* View Controls */}
                <div className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-lg font-bold tracking-tight">{headerTitle}</h1>
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button
                                onClick={() => { setMode('CURRENT'); setSelectionMode('IDLE'); setSelectedShiftIds([]); setSelectedDates([]); }}
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                    mode === 'CURRENT'
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                CURRENT MODE
                            </button>
                            <button
                                onClick={() => { setMode('DRAFT'); setSelectionMode('IDLE'); setSelectedShiftIds([]); setSelectedDates([]); }}
                                className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                    mode === 'DRAFT'
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                DRAFT MODE
                            </button>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                            <button onClick={prevMonth} className="p-1 rounded text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={nextMonth} className="p-1 rounded text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="flex z-30">
                            {isPlacesDropdownOpen && <div className="fixed inset-0" onClick={() => setIsPlacesDropdownOpen(false)} />}
                            <div className="relative">
                                <div
                                    onClick={() => setIsPlacesDropdownOpen(!isPlacesDropdownOpen)}
                                    className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 cursor-pointer flex items-center justify-between w-52 overflow-hidden h-[30px]"
                                >
                                    <span className="truncate mr-2">
                                        {selectedPlaces.length > 0 ? `${selectedPlaces.length} Selected` : 'All Places'}
                                    </span>
                                    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                                {isPlacesDropdownOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-slate-200 rounded shadow-lg z-50 flex flex-col overflow-hidden">
                                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                                            <input
                                                type="text"
                                                value={placeSearchTerm}
                                                onChange={e => setPlaceSearchTerm(e.target.value)}
                                                placeholder="Search places..."
                                                className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-1 flex-1 hide-scrollbar">
                                            {PLACES.filter(p => p.name.toLowerCase().includes(placeSearchTerm.toLowerCase())).map(p => (
                                                <label key={p.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlaces.includes(p.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedPlaces([...selectedPlaces, p.id]);
                                                            else setSelectedPlaces(selectedPlaces.filter(id => id !== p.id));
                                                        }}
                                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs truncate">{p.name}</span>
                                                </label>
                                            ))}
                                            {PLACES.filter(p => p.name.toLowerCase().includes(placeSearchTerm.toLowerCase())).length === 0 && (
                                                <div className="text-center text-[10px] text-slate-400 py-2">No places found</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="relative">
                            <input type="text" placeholder="Search staff..." className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs w-52 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400" />
                        </div>
                        <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded border border-slate-200 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <SchedulesCalendarGrid
                    days={days}
                    monthStart={monthStart}
                    visibleShifts={visibleShifts}
                    selectedDates={selectedDates}
                    selectedShiftIds={selectedShiftIds}
                    selectionMode={selectionMode}
                    handleDayClick={handleDayClick}
                    handleShiftClick={handleShiftClick}
                />

                {/* Floating Toolbox (Bottom) */}
                <SchedulesToolbox
                    mode={mode}
                    selectionMode={selectionMode}
                    multipleSelectMethod={multipleSelectMethod}
                    selectedShiftIds={selectedShiftIds}
                    selectedDates={selectedDates}
                    handleSelectionModeChange={handleSelectionModeChange}
                    setMultipleSelectMethod={setMultipleSelectMethod}
                    setIsDeleteModalOpen={setIsDeleteModalOpen}
                    setRightSidebarMode={setRightSidebarMode}
                    setIsCreateModalOpen={setIsCreateModalOpen}
                    setIsOverwriteModalOpen={setIsOverwriteModalOpen}
                    setIsClearDraftsModalOpen={setIsClearDraftsModalOpen}
                    setIsSubmitDraftsModalOpen={setIsSubmitDraftsModalOpen}
                />

            </div>

            <SchedulesSidebar
                rightSidebarMode={rightSidebarMode}
                setRightSidebarMode={setRightSidebarMode}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                taskHistory={TASK_HISTORY}
            />
            <SchedulesModals
                isGenerateModalOpen={isGenerateModalOpen}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                isGenerating={isGenerating}
                handleGenerateClick={handleGenerateClick}
                isDeleteModalOpen={isDeleteModalOpen}
                setIsDeleteModalOpen={setIsDeleteModalOpen}
                handleDeleteConfirm={handleDeleteConfirm}
                selectedShiftIds={selectedShiftIds}
                isOverwriteModalOpen={isOverwriteModalOpen}
                setIsOverwriteModalOpen={setIsOverwriteModalOpen}
                isCreateModalOpen={isCreateModalOpen}
                setIsCreateModalOpen={setIsCreateModalOpen}
                handleOverwriteSubmit={handleOverwriteSubmit}
                handleCreateSubmit={handleCreateSubmit}
                selectedDates={selectedDates}
                formData={formData}
                setFormData={setFormData}
                PLACES={PLACES}
                mode={mode}
                isClearDraftsModalOpen={isClearDraftsModalOpen}
                setIsClearDraftsModalOpen={setIsClearDraftsModalOpen}
                handleClearDraftsConfirm={handleClearDraftsConfirm}
                isSubmitDraftsModalOpen={isSubmitDraftsModalOpen}
                setIsSubmitDraftsModalOpen={setIsSubmitDraftsModalOpen}
                handleSubmitDraftsConfirm={handleSubmitDraftsConfirm}
                viewDayDetails={viewDayDetails}
                setViewDayDetails={setViewDayDetails}
                visibleShifts={visibleShifts}
            />
        </div>
    );
}
