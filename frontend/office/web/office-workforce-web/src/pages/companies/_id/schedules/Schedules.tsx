import { SchedulesCalendarGrid } from '@/components/schedules/SchedulesCalendarGrid';
import { SchedulesModals } from '@/components/schedules/SchedulesModals';
import { SchedulesPreferencesModal } from '@/components/schedules/SchedulesPreferencesModal';
import { SchedulesRulesModal } from '@/components/schedules/SchedulesRulesModal';
import { SchedulesSidebar } from '@/components/schedules/SchedulesSidebar';
import { SchedulesToolbox } from '@/components/schedules/SchedulesToolbox';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { cn, formatPostgresDate } from '@/lib/utils';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import PlaceContentService from '@/services/content/office/workforce/PlaceContentService';
import ScheduleContentService from '@/services/content/office/workforce/ScheduleContentService';
import ScheduleGenerationContentService from '@/services/content/office/workforce/ScheduleGenerationContentService';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import StaffOccupationContentService from '@/services/content/office/workforce/StaffOccupationContentService';
import { addDays, addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 20;

async function fetchAllPages<T>(fetcher: (page: number) => Promise<PaginationBaseResponseDTO<T>>): Promise<T[]> {
    const first = await fetcher(0);
    const all = [...(first?.content || [])];
    const totalPages = first?.totalPages || 0;
    for (let page = 1; page < totalPages; page++) {
        const res = await fetcher(page);
        all.push(...(res?.content || []));
    }
    return all;
}

type Shift = {
    id: string;
    placeId: string;
    date: Date;
    staffId?: number;
    staffName: string;
    role: string;
    startTime: string;
    endTime: string;
    startDateTime: Date;
    endDateTime: Date;
    status: 'ACTIVE' | 'DRAFT';
};

type TaskHistoryItem = {
    id: number;
    title: string;
    status: string;
    rules: string;
};

export default function Schedules() {
    const { id: companyIdStr } = useParams<{ id: string }>();
    const companyId = Number(companyIdStr) || 0;
    const [searchParams, setSearchParams] = useSearchParams();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [mode, setMode] = useState<'CURRENT' | 'DRAFT'>('DRAFT');
    const [selectionMode, setSelectionMode] = useState<'IDLE' | 'MULTIPLE' | 'CREATE'>('IDLE');

    const [placesList, setPlacesList] = useState<{ id: string; name: string; departId?: number }[]>([]);
    const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);
    const [staffOccupations, setStaffOccupations] = useState<{ id: string; name: string }[]>([]);
    const [staffOccupationsLoading, setStaffOccupationsLoading] = useState(false);

    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
    const [selectedPlaceLabel, setSelectedPlaceLabel] = useState<string>('');
    const [multipleSelectMethod, setMultipleSelectMethod] = useState<'SCHEDULE' | 'DATE'>('SCHEDULE');

    const [viewDayDetails, setViewDayDetails] = useState<Date | null>(null);
    const [rightSidebarMode, setRightSidebarMode] = useState<'SCHEDULE' | 'FORMS'>('SCHEDULE');

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [isClearDraftsModalOpen, setIsClearDraftsModalOpen] = useState(false);
    const [isSubmitDraftsModalOpen, setIsSubmitDraftsModalOpen] = useState(false);

    // Rule & Preference Modal state
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string; title: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' });
    };

    const [formData, setFormData] = useState({
        staffId: '',
        staffName: '',
        role: '',
        startTime: '09:00',
        endTime: '17:00',
        placeId: '',
        workingPeriodId: ''
    });

    // Load Places from PlaceContentService
    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const places = await fetchAllPages(page =>
                    PlaceContentService.getInstance().search(undefined, '', true, { page, size: PAGE_SIZE }, companyId)
                );
                const loadedPlaces = places.map(p => ({
                    id: p.id.toString(),
                    name: p.name,
                    departId: p.departId
                }));
                setPlacesList(loadedPlaces);
                const paramId = searchParams.get('placeId');
                const initial = (paramId && loadedPlaces.find(p => p.id === paramId)) || loadedPlaces[0];
                if (initial) {
                    setSelectedPlaceId(Number(initial.id));
                    setSelectedPlaceLabel(initial.name);
                    setFormData(prev => ({ ...prev, placeId: prev.placeId || initial.id }));
                }
            } catch (err: any) {
                showMessage('error', err?.message || 'Failed to load places.');
            }
        };
        fetchPlaces();
    }, [companyIdStr]);

    // Load Staff from StaffContentService
    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const staff = await fetchAllPages(page =>
                    StaffContentService.getInstance().findAllS1(companyId, { page, size: PAGE_SIZE })
                );
                const mapped = staff.map(s => ({
                    id: s.id.toString(),
                    name: StaffContentService.getInstance().getDisplayName(s) || `Staff #${s.id}`
                }));
                setStaffList(mapped);
                if (mapped.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        staffId: prev.staffId || mapped[0].id,
                        staffName: prev.staffName || mapped[0].name
                    }));
                }
            } catch (err: any) {
                showMessage('error', err?.message || 'Failed to load staff.');
            }
        };
        fetchStaff();
    }, [companyIdStr]);

    // Load the selected staff member's occupations (role options are scoped to the staff)
    useEffect(() => {
        const sId = Number(formData.staffId);
        if (!sId) {
            setStaffOccupations([]);
            return;
        }
        let cancelled = false;
        const loadStaffOccupations = async () => {
            setStaffOccupationsLoading(true);
            try {
                const occupations = await fetchAllPages(page =>
                    StaffOccupationContentService.getInstance().search(sId, undefined, undefined, { page, size: PAGE_SIZE })
                );
                if (cancelled) return;
                const mapped = occupations.map(o => ({
                    id: o.occupationId.toString(),
                    name: o.occupationName || `Occupation #${o.occupationId}`
                }));
                setStaffOccupations(mapped);
                setFormData(prev => ({ ...prev, role: mapped.length > 0 ? mapped[0].name : '' }));
            } catch (err: any) {
                if (!cancelled) {
                    setStaffOccupations([]);
                    showMessage('error', err?.message || 'Failed to load staff occupations.');
                }
            } finally {
                if (!cancelled) setStaffOccupationsLoading(false);
            }
        };
        loadStaffOccupations();
        return () => { cancelled = true; };
    }, [formData.staffId]);

    // Paged place options for the header place selector
    const fetchPlaceOptions = async (searchValue: string, pageNum: number) => {
        try {
            const res = await PlaceContentService.getInstance().search(
                undefined,
                searchValue.trim() || '',
                true,
                { page: pageNum, size: 10 },
                companyId
            );
            return {
                content: (res.content || []).map(p => ({ id: p.id, label: p.name })),
                totalPages: res.totalPages || 0
            };
        } catch (error) {
            console.error('Failed to search places:', error);
            return { content: [], totalPages: 0 };
        }
    };

    const handlePlaceChange = (id: number, label: string) => {
        setSelectedPlaceId(id);
        setSelectedPlaceLabel(label);
        setSearchParams({ placeId: id.toString() });
        setSelectedShiftIds([]);
        setSelectedDates([]);
        setFormData(prev => ({ ...prev, placeId: id.toString(), workingPeriodId: '' }));
    };

    // Load Schedules from ScheduleContentService
    const fetchSchedules = useCallback(async () => {
        if (!selectedPlaceId) {
            setShifts([]);
            return;
        }
        try {
            const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd') + 'T00:00:00';
            // Pad +1 day so overnight shifts starting on the month's last day (end_at past midnight) are included
            const endStr = format(addDays(endOfMonth(currentDate), 1), 'yyyy-MM-dd') + 'T23:59:59';
            const schedules = await fetchAllPages(page =>
                ScheduleContentService.getInstance().search(
                    selectedPlaceId,
                    undefined,
                    undefined,
                    startStr,
                    endStr,
                    { page, size: PAGE_SIZE }
                )
            );
            const mapped: Shift[] = schedules.map(s => {
                const startRaw = formatPostgresDate(s.startAt);
                const startTime = s.startAt[3].toString().padStart(2, '0') + ":" + s.startAt[4].toString().padStart(2, '0');
                const endTime = s.endAt[3].toString().padStart(2, '0') + ":" + s.endAt[4].toString().padStart(2, '0');

                return {
                    id: s.id.toString(),
                    placeId: s.placeId.toString(),
                    date: new Date(startRaw),
                    staffId: s.staffId,
                    staffName: s.staffNameChinese || s.staffNameEnglish || `Staff #${s.staffId}`,
                    role: s.remark || '—',
                    startTime,
                    endTime,
                    startDateTime: new Date(s.startAt[0], s.startAt[1] - 1, s.startAt[2], s.startAt[3], s.startAt[4]),
                    endDateTime: new Date(s.endAt[0], s.endAt[1] - 1, s.endAt[2], s.endAt[3], s.endAt[4]),
                    status: s.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT'
                };
            });
            setShifts(mapped);
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to load schedules.');
        }
    }, [currentDate, selectedPlaceId]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleGenerateClick = async (options: { placeId: string; year: number; month: number }) => {
        setIsGenerating(true);
        try {
            const task = await ScheduleGenerationContentService.getInstance().triggerGeneration({
                placeId: Number(options.placeId),
                year: options.year,
                month: options.month
            });
            const displayPlaceName = task.placeName || placesList.find(p => p.id === options.placeId)?.name || `Place #${options.placeId}`;
            const targetDate = new Date(task.targetYear ?? options.year, (task.targetMonth ?? options.month) - 1, 1);
            const newTaskItem: TaskHistoryItem = {
                id: task.id,
                title: `AI Roster - ${displayPlaceName} (${format(targetDate, 'MMMM yyyy')})`,
                status: task.status || 'PENDING',
                rules: 'Roster generation task submitted to scheduler engine...'
            };
            setTaskHistory(prev => [newTaskItem, ...prev]);

            // Poll task completion
            const taskId = task.id;
            const interval = setInterval(async () => {
                try {
                    const statusRes = await ScheduleGenerationContentService.getInstance().getTaskStatus(taskId);
                    if (statusRes.status === 'COMPLETED' || statusRes.status === 'FAILED') {
                        clearInterval(interval);
                        setTaskHistory(prev => prev.map(t => t.id === taskId ? {
                            ...t,
                            status: statusRes.status,
                            rules: statusRes.status === 'COMPLETED' ? 'Completed roster schedule assignments' : (statusRes.errorMessage || 'Roster generation failed')
                        } : t));
                        if (statusRes.status === 'COMPLETED') {
                            fetchSchedules();
                        }
                    }
                } catch {
                    clearInterval(interval);
                }
            }, 2500);
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to trigger schedule generation.');
        } finally {
            setIsGenerating(false);
            setIsGenerateModalOpen(false);
        }
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

    const handleDeleteConfirm = async () => {
        try {
            for (const sId of selectedShiftIds) {
                const numId = Number(sId);
                if (!isNaN(numId)) {
                    await ScheduleContentService.getInstance().delete(numId);
                }
            }
            showMessage('success', `${selectedShiftIds.length} shift(s) deleted successfully.`);
            await fetchSchedules();
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to delete selected shifts.');
        } finally {
            setSelectedShiftIds([]);
            setIsDeleteModalOpen(false);
        }
    };

    const handleClearDraftsConfirm = async () => {
        const activePlaceIdStr = selectedPlaceId ? selectedPlaceId.toString() : '';
        const draftShifts = shifts.filter(s => s.status === 'DRAFT' && s.placeId === activePlaceIdStr);
        try {
            for (const s of draftShifts) {
                const numId = Number(s.id);
                if (!isNaN(numId)) {
                    await ScheduleContentService.getInstance().delete(numId);
                }
            }
            showMessage('success', 'All draft shifts cleared successfully.');
            await fetchSchedules();
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to clear draft shifts.');
        } finally {
            setIsClearDraftsModalOpen(false);
        }
    };

    const handleSubmitDraftsConfirm = async () => {
        const activePlaceIdStr = selectedPlaceId ? selectedPlaceId.toString() : '';
        const draftShifts = shifts.filter(s => s.status === 'DRAFT' && s.placeId === activePlaceIdStr);
        try {
            for (const s of draftShifts) {
                const numId = Number(s.id);
                if (!isNaN(numId)) {
                    await ScheduleContentService.getInstance().updateStatus(numId, { status: 'ACTIVE' });
                }
            }
            showMessage('success', 'All draft shifts submitted successfully.');
            await fetchSchedules();
        } catch (err: any) {
            showMessage('error', err?.message || 'Failed to submit draft shifts.');
        } finally {
            setIsSubmitDraftsModalOpen(false);
        }
    };

    // Overnight shifts: an end time earlier than the start time means the shift ends the next day
    const resolveEndPrefix = (datePrefix: string, startTime: string, endTime: string): string =>
        endTime < startTime ? format(addDays(new Date(datePrefix), 1), 'yyyy-MM-dd') : datePrefix;

    // Client-side conflict pre-check: same staff, same place, overlapping datetimes (mirrors backend rule)
    const findConflictBullet = (target: {
        excludeShiftId?: string;
        date: Date;
        staffId: number;
        placeId: string;
        startTime: string;
        endTime: string;
    }): string | null => {
        const datePrefix = format(target.date, 'yyyy-MM-dd');
        const targetStart = new Date(`${datePrefix}T${target.startTime}:00`);
        const targetEnd = new Date(`${resolveEndPrefix(datePrefix, target.startTime, target.endTime)}T${target.endTime}:00`);
        for (const existing of shifts) {
            if (target.excludeShiftId && existing.id === target.excludeShiftId) continue;
            if (existing.staffId !== target.staffId) continue;
            if (existing.placeId !== target.placeId) continue;
            if (existing.startDateTime < targetEnd && existing.endDateTime > targetStart) {
                const placeName = placesList.find(p => p.id === target.placeId)?.name || `Place #${target.placeId}`;
                const overnight = isSameDay(existing.startDateTime, existing.endDateTime) ? '' : ' (ends next day)';
                return `• ${format(existing.startDateTime, 'yyyy-MM-dd')}: ${existing.staffName} already registered ${existing.startTime} - ${existing.endTime}${overnight} at ${placeName}`;
            }
        }
        return null;
    };

    const validateStaffRole = (): boolean => {
        if (staffOccupationsLoading) {
            showMessage('error', 'Staff occupations are still loading, please wait a moment.');
            return false;
        }
        if (staffOccupations.length === 0) {
            showMessage('error', 'The selected staff member has no occupations assigned. Assign an occupation before scheduling.');
            return false;
        }
        if (!formData.role) {
            showMessage('error', 'Please select a role/occupation.');
            return false;
        }
        return true;
    };

    const handleOverwriteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newStatus = mode === 'CURRENT' ? 'ACTIVE' : 'DRAFT';
        const pId = Number(formData.placeId);
        const sId = Number(formData.staffId);
        if (isNaN(pId) || isNaN(sId)) {
            showMessage('error', 'Please select a place and a staff member.');
            return;
        }
        if (!validateStaffRole()) return;
        const wpId = Number(formData.workingPeriodId) || undefined;
        const occupationId = staffOccupations.find(o => o.name === formData.role)?.id;

        const bullets: string[] = [];
        const cleanShiftIds: string[] = [];
        for (const shiftId of selectedShiftIds) {
            const existingShift = shifts.find(s => s.id === shiftId);
            if (!existingShift) continue;
            const bullet = findConflictBullet({
                excludeShiftId: shiftId,
                date: existingShift.date,
                staffId: sId,
                placeId: formData.placeId,
                startTime: formData.startTime,
                endTime: formData.endTime
            });
            if (bullet) bullets.push(bullet); else cleanShiftIds.push(shiftId);
        }

        let successCount = 0;
        for (const shiftId of cleanShiftIds) {
            const existingShift = shifts.find(s => s.id === shiftId);
            const numId = Number(shiftId);
            if (!existingShift || isNaN(numId)) continue;
            const datePrefix = format(existingShift.date, 'yyyy-MM-dd');
            try {
                await ScheduleContentService.getInstance().update(numId, {
                    placeId: pId,
                    staffId: sId,
                    workingPeriodId: wpId,
                    occupationId: occupationId ? Number(occupationId) : undefined,
                    startAt: `${datePrefix}T${formData.startTime}:00`,
                    endAt: `${resolveEndPrefix(datePrefix, formData.startTime, formData.endTime)}T${formData.endTime}:00`,
                    status: newStatus,
                    remark: formData.role || formData.staffName
                });
                successCount++;
            } catch (err: any) {
                bullets.push(err?.message || `• ${datePrefix}: Failed to update shift.`);
            }
        }

        await fetchSchedules();
        setSelectedShiftIds([]);
        setIsOverwriteModalOpen(false);
        if (bullets.length > 0) {
            const summary = successCount > 0 ? `${successCount} shift(s) overwritten successfully.\n\n` : '';
            showMessage('error', `${summary}Some shifts were rejected:\n${bullets.join('\n')}`);
        } else {
            showMessage('success', `${successCount} shift(s) overwritten successfully.`);
        }
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newStatus = mode === 'CURRENT' ? 'ACTIVE' : 'DRAFT';
        const pId = Number(formData.placeId);
        const sId = Number(formData.staffId);
        if (isNaN(pId) || isNaN(sId)) {
            showMessage('error', 'Please select a place and a staff member.');
            return;
        }
        if (!validateStaffRole()) return;
        const wpId = Number(formData.workingPeriodId);
        if (!wpId) {
            showMessage('error', 'Please select a working period.');
            return;
        }
        const occupationId = staffOccupations.find(o => o.name === formData.role)?.id;

        const bullets: string[] = [];
        const cleanDates: string[] = [];
        for (const dateStr of selectedDates) {
            const bullet = findConflictBullet({
                date: new Date(dateStr),
                staffId: sId,
                placeId: formData.placeId,
                startTime: formData.startTime,
                endTime: formData.endTime
            });
            if (bullet) bullets.push(bullet); else cleanDates.push(dateStr);
        }

        let successCount = 0;
        for (const dateStr of cleanDates) {
            const datePrefix = format(new Date(dateStr), 'yyyy-MM-dd');
            try {
                await ScheduleContentService.getInstance().create({
                    placeId: pId,
                    staffId: sId,
                    workingPeriodId: wpId,
                    occupationId: occupationId ? Number(occupationId) : undefined,
                    startAt: `${datePrefix}T${formData.startTime}:00`,
                    endAt: `${resolveEndPrefix(datePrefix, formData.startTime, formData.endTime)}T${formData.endTime}:00`,
                    status: newStatus,
                    remark: formData.role || formData.staffName
                });
                successCount++;
            } catch (err: any) {
                bullets.push(err?.message || `• ${datePrefix}: Failed to create shift.`);
            }
        }

        await fetchSchedules();
        setSelectedDates([]);
        setIsCreateModalOpen(false);
        if (bullets.length > 0) {
            const summary = successCount > 0 ? `${successCount} shift(s) created successfully.\n\n` : '';
            showMessage('error', `${summary}Some shifts were rejected:\n${bullets.join('\n')}`);
        } else {
            showMessage('success', `${successCount} shift(s) created successfully.`);
        }
    };

    const visibleShifts = shifts.filter(s => {
        if (mode === 'CURRENT') return s.status === 'ACTIVE';
        return true;
    });

    const activePlaceId = selectedPlaceId ? selectedPlaceId.toString() : '';
    const activePlaceName = selectedPlaceLabel || placesList.find(p => p.id === activePlaceId)?.name || '';
    const headerTitle = activePlaceName ? `${activePlaceName} - ${format(currentDate, 'MMMM yyyy')} Roster` : `${format(currentDate, 'MMMM yyyy')} Roster`;

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
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
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
                                    "px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer",
                                    mode === 'DRAFT'
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                DRAFT MODE
                            </button>
                        </div>

                        <div className="flex items-center gap-1 ml-2">
                            <button onClick={prevMonth} className="p-1 rounded text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={nextMonth} className="p-1 rounded text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-56">
                            <DropdownSearch
                                value={selectedPlaceId}
                                initialLabel={selectedPlaceLabel}
                                onChange={(id, opt) => handlePlaceChange(id, opt?.label || '')}
                                fetchData={fetchPlaceOptions}
                                placeholder="Select a place..."
                            />
                        </div>
                    </div>
                </div>

                {/* Calendar Grid */}
                {!selectedPlaceId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <MapPin className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-medium text-slate-500">No place selected.</p>
                        <p className="text-[11px] text-slate-400">Select a place above to view its roster, or add one from the Places page.</p>
                    </div>
                ) : (
                    <>
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
                    </>
                )}

            </div>

            {/* Sidebar with Generation, Rules & Preferences trigger buttons */}
            <SchedulesSidebar
                rightSidebarMode={rightSidebarMode}
                setRightSidebarMode={setRightSidebarMode}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                taskHistory={taskHistory}
                staffCount={staffList.length}
                onOpenRulesModal={() => setIsRulesModalOpen(true)}
                onOpenPreferencesModal={() => setIsPreferencesModalOpen(true)}
            />

            {/* Core Schedules Modals with Staff and Occupations lists */}
            <SchedulesModals
                isGenerateModalOpen={isGenerateModalOpen}
                setIsGenerateModalOpen={setIsGenerateModalOpen}
                isGenerating={isGenerating}
                handleGenerateClick={handleGenerateClick}
                defaultGeneratePlaceId={activePlaceId}
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
                PLACES={placesList}
                staffList={staffList}
                staffOccupations={staffOccupations}
                staffOccupationsLoading={staffOccupationsLoading}
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

            {/* Workplace Roster Rules & Quotas Modal */}
            <SchedulesRulesModal
                isOpen={isRulesModalOpen}
                onClose={() => setIsRulesModalOpen(false)}
                placeId={activePlaceId}
                placeName={activePlaceName}
                companyId={companyIdStr}
            />

            {/* Staff Shift Preferences Modal */}
            <SchedulesPreferencesModal
                isOpen={isPreferencesModalOpen}
                onClose={() => setIsPreferencesModalOpen(false)}
                currentPlaceId={activePlaceId}
                companyId={companyIdStr}
            />

            {modalMessage && (
                <MessageModal
                    isOpen={!!modalMessage}
                    onClose={() => setModalMessage(null)}
                    type={modalMessage.type}
                    title={modalMessage.title}
                    message={modalMessage.text}
                />
            )}
        </div>
    );
}
