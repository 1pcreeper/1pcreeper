import React, { useState, useEffect } from 'react';
import { Loader2, Plus, Shield, Clock, Save, X, CheckCircle2, AlertCircle, Trash2, MapPin, ChevronUp, ChevronDown, Briefcase } from 'lucide-react';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import PlaceContentService from '@/services/content/office/workforce/PlaceContentService';
import PlaceScheduleRuleContentService from '@/services/content/office/workforce/PlaceScheduleRuleContentService';
import PlaceOccupationRuleContentService from '@/services/content/office/workforce/PlaceOccupationRuleContentService';
import PlaceWorkingPeriodRuleContentService from '@/services/content/office/workforce/PlaceWorkingPeriodRuleContentService';
import OccupationContentService from '@/services/content/office/workforce/OccupationContentService';
import WorkingPeriodContentService from '@/services/content/office/workforce/WorkingPeriodContentService';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { WorkType } from '@/models/dto/office/workforce/enum.dto';
import {
    PlaceOccupationRuleResponseDTO,
    PlaceWorkingPeriodRuleResponseDTO
} from '@/models/dto/office/workforce/response.dto';

interface SchedulesRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    placeId: string;
    placeName: string;
    companyId?: string;
}

const PAGE_SIZE = 20;

const ALL_WORK_TYPES = Object.values(WorkType);

const WEEKDAYS = [
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
    { value: 7, label: 'Sunday', short: 'Sun' }
];

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

const trimTime = (t?: string) => (t && t.length >= 5 ? t.substring(0, 5) : '');
const formatWorkType = (wt: string) => wt.replace(/_/g, ' ');

export function SchedulesRulesModal({ isOpen, onClose, placeId, placeName, companyId }: SchedulesRulesModalProps) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Place being edited (switchable without closing the modal)
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(placeId ? Number(placeId) : null);
    const [selectedPlaceLabel, setSelectedPlaceLabel] = useState<string>('');

    // Section 1: Work type priorities (ordered, first = highest)
    const [scheduleRuleId, setScheduleRuleId] = useState<number | null>(null);
    const [workTypePriorities, setWorkTypePriorities] = useState<string[]>([]);

    // Section 2: Occupation rules per weekday
    const [selectedWeekDay, setSelectedWeekDay] = useState<number>(1);
    const [occupationRules, setOccupationRules] = useState<PlaceOccupationRuleResponseDTO[]>([]);
    const [occupations, setOccupations] = useState<{ id: number; name: string }[]>([]);
    const [newOccupationId, setNewOccupationId] = useState<number | null>(null);

    // Section 3: Working period rules nested under each occupation rule
    const [wpRulesByOccRule, setWpRulesByOccRule] = useState<Record<number, PlaceWorkingPeriodRuleResponseDTO[]>>({});
    const [wpCounts, setWpCounts] = useState<Record<number, number>>({});
    const [workingPeriods, setWorkingPeriods] = useState<{ id: number; name: string }[]>([]);
    const [newWpId, setNewWpId] = useState<Record<number, number | null>>({});
    const [newWpCount, setNewWpCount] = useState<Record<number, number>>({});

    useEffect(() => {
        if (!isOpen) return;
        setSelectedPlaceId(placeId ? Number(placeId) : null);
        setSelectedPlaceLabel('');
    }, [isOpen, placeId]);

    useEffect(() => {
        if (!isOpen) return;
        if (!selectedPlaceId) {
            setScheduleRuleId(null);
            setWorkTypePriorities([]);
            setOccupationRules([]);
            setWpRulesByOccRule({});
            setOccupations([]);
            setWorkingPeriods([]);
            setLoading(false);
            return;
        }
        loadPlaceData();
    }, [isOpen, selectedPlaceId]);

    useEffect(() => {
        if (!isOpen || !selectedPlaceId) return;
        loadOccupationRules();
    }, [isOpen, selectedPlaceId, selectedWeekDay]);

    const showFeedback = (type: 'success' | 'error', text: string) => {
        setFeedback({ type, text });
        if (type === 'success') {
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    const fetchPlaceOptions = async (searchValue: string, pageNum: number) => {
        const cId = Number(companyId) || undefined;
        try {
            const res = await PlaceContentService.getInstance().search(
                undefined,
                searchValue.trim() || '',
                true,
                { page: pageNum, size: 10 },
                cId
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

    const loadPlaceData = async () => {
        if (!selectedPlaceId) return;
        setLoading(true);
        setFeedback(null);
        try {
            // Base schedule rule (work type priorities)
            try {
                const rule = await PlaceScheduleRuleContentService.getInstance().findByPlaceId(selectedPlaceId);
                setScheduleRuleId(rule?.id ?? null);
                setWorkTypePriorities(rule?.workTypePriorities || []);
            } catch {
                // Rule may not exist yet for this place
                setScheduleRuleId(null);
                setWorkTypePriorities([]);
            }

            // Occupations and working periods, scoped to the place's department when known
            let departId: number | undefined;
            try {
                const place = await PlaceContentService.getInstance().findById(selectedPlaceId);
                departId = place?.departId;
            } catch {
                departId = undefined;
            }

            const occupationList = await fetchAllPages(page =>
                OccupationContentService.getInstance().search(departId, '', true, { page, size: PAGE_SIZE })
            );
            const mappedOccupations = occupationList.map(o => ({ id: o.id, name: o.name }));
            setOccupations(mappedOccupations);
            setNewOccupationId(prev => prev ?? (mappedOccupations[0]?.id ?? null));

            const periodList = await fetchAllPages(page =>
                WorkingPeriodContentService.getInstance().search(departId, undefined, { page, size: PAGE_SIZE })
            );
            setWorkingPeriods(periodList.map(w => ({
                id: w.id,
                name: `${w.name || `Period #${w.id}`} (${trimTime(w.startAt)} - ${trimTime(w.endAt)})`
            })));
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to load rules from the workforce backend.');
        } finally {
            setLoading(false);
        }
    };

    const loadOccupationRules = async () => {
        if (!selectedPlaceId) return;
        try {
            const rules = await fetchAllPages(page =>
                PlaceOccupationRuleContentService.getInstance().search(selectedPlaceId, selectedWeekDay, undefined, { page, size: PAGE_SIZE })
            );
            setOccupationRules(rules);

            const map: Record<number, PlaceWorkingPeriodRuleResponseDTO[]> = {};
            for (const rule of rules) {
                map[rule.id] = await fetchAllPages(page =>
                    PlaceWorkingPeriodRuleContentService.getInstance().search(rule.id, undefined, { page, size: PAGE_SIZE })
                );
            }
            setWpRulesByOccRule(map);

            const counts: Record<number, number> = {};
            Object.values(map).flat().forEach(w => { counts[w.id] = w.personCount; });
            setWpCounts(counts);
        } catch (err: any) {
            setOccupationRules([]);
            setWpRulesByOccRule({});
            showFeedback('error', err?.message || 'Failed to load occupation rules.');
        }
    };

    // Section 1 handlers
    const movePriority = (index: number, direction: -1 | 1) => {
        setWorkTypePriorities(prev => {
            const next = [...prev];
            const target = index + direction;
            if (target < 0 || target >= next.length) return prev;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const handleSaveScheduleRule = async () => {
        if (!selectedPlaceId) return;
        setSaving(true);
        setFeedback(null);
        try {
            if (scheduleRuleId) {
                await PlaceScheduleRuleContentService.getInstance().update(scheduleRuleId, {
                    workTypePriorities
                });
            } else {
                const res = await PlaceScheduleRuleContentService.getInstance().create({
                    placeId: selectedPlaceId,
                    workTypePriorities
                });
                setScheduleRuleId(res.id);
            }
            showFeedback('success', 'Work type priorities saved successfully!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to save work type priorities.');
        } finally {
            setSaving(false);
        }
    };

    // Section 2 handlers
    const handleAddOccupationRule = async () => {
        if (!selectedPlaceId || !newOccupationId) return;
        setSaving(true);
        setFeedback(null);
        try {
            await PlaceOccupationRuleContentService.getInstance().create({
                placeId: selectedPlaceId,
                weekDay: selectedWeekDay,
                occupationId: newOccupationId
            });
            await loadOccupationRules();
            showFeedback('success', 'Occupation rule added!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to add occupation rule.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteOccupationRule = async (id: number) => {
        setSaving(true);
        setFeedback(null);
        try {
            await PlaceOccupationRuleContentService.getInstance().delete(id);
            await loadOccupationRules();
            showFeedback('success', 'Occupation rule removed!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to delete occupation rule.');
        } finally {
            setSaving(false);
        }
    };

    // Section 3 handlers
    const handleAddWpRule = async (occupationRuleId: number) => {
        const workingPeriodId = newWpId[occupationRuleId];
        const personCount = newWpCount[occupationRuleId] ?? 1;
        if (!workingPeriodId || personCount < 1) return;
        setSaving(true);
        setFeedback(null);
        try {
            await PlaceWorkingPeriodRuleContentService.getInstance().create({
                occupationRuleId,
                workingPeriodId,
                personCount
            });
            await loadOccupationRules();
            showFeedback('success', 'Working period rule added!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to add working period rule.');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateWpRule = async (id: number) => {
        const personCount = wpCounts[id];
        if (personCount === undefined || personCount < 0) return;
        setSaving(true);
        setFeedback(null);
        try {
            await PlaceWorkingPeriodRuleContentService.getInstance().update(id, { personCount });
            await loadOccupationRules();
            showFeedback('success', 'Working period rule updated!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to update working period rule.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteWpRule = async (id: number) => {
        setSaving(true);
        setFeedback(null);
        try {
            await PlaceWorkingPeriodRuleContentService.getInstance().delete(id);
            await loadOccupationRules();
            showFeedback('success', 'Working period rule removed!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to delete working period rule.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const availableWorkTypes = ALL_WORK_TYPES.filter(wt => !workTypePriorities.includes(wt));
    const selectedWeekDayLabel = WEEKDAYS.find(w => w.value === selectedWeekDay)?.label || '';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Roster Rules & Quotas</h3>
                            <p className="text-xs text-slate-500">{selectedPlaceLabel || placeName || (selectedPlaceId ? `Place #${selectedPlaceId}` : 'No place selected')}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Feedback */}
                {feedback && (
                    <div className={`mx-6 mt-4 p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                        feedback.type === 'success'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                            : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                        {feedback.type === 'success'
                            ? <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                        <span>{feedback.text}</span>
                    </div>
                )}

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Place Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Editing Place</label>
                        <DropdownSearch
                            value={selectedPlaceId}
                            initialLabel={selectedPlaceLabel || placeName}
                            onChange={(id, opt) => {
                                setSelectedPlaceId(id);
                                setSelectedPlaceLabel(opt?.label || '');
                            }}
                            fetchData={fetchPlaceOptions}
                            placeholder="Select a place to edit..."
                        />
                    </div>

                    {!selectedPlaceId ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <MapPin className="w-6 h-6 text-slate-300" />
                            <span className="text-xs font-medium">Select a place above to manage its roster rules.</span>
                        </div>
                    ) : loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            <span className="text-xs font-medium">Loading rules from workforce backend...</span>
                        </div>
                    ) : (
                        <>
                            {/* Section 1: Work Type Requirements */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                                    <Briefcase className="w-4 h-4 text-slate-500" />
                                    <span>Work Type Requirements</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 mb-1">Priority Order <span className="font-normal text-slate-400">(first = highest priority)</span></label>
                                        {workTypePriorities.length === 0 ? (
                                            <p className="text-xs text-slate-500 italic">No work types prioritized yet. Add from the available pool below.</p>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {workTypePriorities.map((wt, idx) => (
                                                    <div key={wt} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-slate-200 text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-5 h-5 flex items-center justify-center bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold">{idx + 1}</span>
                                                            <span className="font-semibold text-slate-800">{formatWorkType(wt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => movePriority(idx, -1)}
                                                                disabled={idx === 0}
                                                                className="p-1 text-slate-500 hover:bg-slate-100 rounded transition-colors disabled:opacity-30"
                                                                title="Move up"
                                                            >
                                                                <ChevronUp className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => movePriority(idx, 1)}
                                                                disabled={idx === workTypePriorities.length - 1}
                                                                className="p-1 text-slate-500 hover:bg-slate-100 rounded transition-colors disabled:opacity-30"
                                                                title="Move down"
                                                            >
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setWorkTypePriorities(prev => prev.filter(x => x !== wt))}
                                                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                                title="Remove"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {availableWorkTypes.length > 0 && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 mb-1">Available Work Types</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {availableWorkTypes.map(wt => (
                                                    <button
                                                        key={wt}
                                                        type="button"
                                                        onClick={() => setWorkTypePriorities(prev => [...prev, wt])}
                                                        className="px-2.5 py-1 text-[11px] font-bold rounded border bg-white text-slate-600 border-slate-300 hover:bg-slate-100 transition-colors flex items-center gap-1"
                                                        title="Add to priority list"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                        {formatWorkType(wt)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleSaveScheduleRule}
                                            disabled={saving}
                                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-sm transition-colors"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            <span>Save Priorities</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Occupation Rules (per weekday) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                                    <Shield className="w-4 h-4 text-slate-500" />
                                    <span>Occupation Rules (Per Weekday)</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                    {/* Weekday tabs */}
                                    <div className="flex flex-wrap gap-1">
                                        {WEEKDAYS.map(w => (
                                            <button
                                                key={w.value}
                                                type="button"
                                                onClick={() => setSelectedWeekDay(w.value)}
                                                className={`px-2.5 py-1 text-[11px] font-bold rounded border transition-colors ${
                                                    selectedWeekDay === w.value
                                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                                                }`}
                                            >
                                                {w.short}
                                            </button>
                                        ))}
                                    </div>

                                    {occupationRules.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic">No occupation rules configured for {selectedWeekDayLabel}.</p>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {occupationRules.map(rule => (
                                                <div key={rule.id} className="flex items-center justify-between bg-white px-3 py-1.5 rounded border border-slate-200 text-xs">
                                                    <span className="font-semibold text-slate-800 truncate">{rule.occupationName || `Occupation #${rule.occupationId}`}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteOccupationRule(rule.id)}
                                                        disabled={saving}
                                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add Occupation Rule Input */}
                                    <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                                        <select
                                            value={newOccupationId ?? ''}
                                            onChange={(e) => setNewOccupationId(Number(e.target.value))}
                                            className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                                        >
                                            {occupations.length === 0 && <option value="">No occupations available</option>}
                                            {occupations.map(o => (
                                                <option key={o.id} value={o.id}>{o.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={handleAddOccupationRule}
                                            disabled={saving || !newOccupationId}
                                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>Add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Working Period Rules (nested under each occupation rule) */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                                    <Clock className="w-4 h-4 text-slate-500" />
                                    <span>Working Period Rules</span>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                                    {occupationRules.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic">Add an occupation rule for {selectedWeekDayLabel} first — working period rules attach to it.</p>
                                    ) : (
                                        occupationRules.map(rule => {
                                            const wpRules = wpRulesByOccRule[rule.id] || [];
                                            return (
                                                <div key={rule.id} className="bg-white rounded border border-slate-200 overflow-hidden">
                                                    <div className="px-3 py-1.5 bg-slate-100/70 border-b border-slate-200">
                                                        <span className="text-xs font-bold text-slate-800">{rule.occupationName || `Occupation #${rule.occupationId}`}</span>
                                                        <span className="text-[10px] text-slate-400 ml-2">{selectedWeekDayLabel}</span>
                                                    </div>
                                                    <div className="p-2 pl-5 space-y-1.5">
                                                        {wpRules.length === 0 && (
                                                            <p className="text-[11px] text-slate-400 italic">No working periods assigned.</p>
                                                        )}
                                                        {wpRules.map(wp => (
                                                            <div key={wp.id} className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-100 text-xs">
                                                                <span className="font-medium text-slate-700 truncate">{wp.workingPeriodName || `Period #${wp.workingPeriodId}`}</span>
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={wpCounts[wp.id] ?? wp.personCount}
                                                                        onChange={(e) => setWpCounts(prev => ({
                                                                            ...prev,
                                                                            [wp.id]: Math.max(0, parseInt(e.target.value) || 0)
                                                                        }))}
                                                                        className="w-14 px-1.5 py-0.5 border border-slate-300 rounded text-xs text-right bg-white font-bold"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleUpdateWpRule(wp.id)}
                                                                        disabled={saving}
                                                                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                                                        title="Save"
                                                                    >
                                                                        <Save className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleDeleteWpRule(wp.id)}
                                                                        disabled={saving}
                                                                        className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}

                                                        {/* Add Working Period Rule Input */}
                                                        <div className="flex items-center gap-1.5 pt-1">
                                                            <select
                                                                value={newWpId[rule.id] ?? ''}
                                                                onChange={(e) => setNewWpId(prev => ({ ...prev, [rule.id]: Number(e.target.value) || null }))}
                                                                className="flex-1 px-2 py-1 border border-slate-300 rounded text-[11px] bg-white focus:ring-1 focus:ring-indigo-500"
                                                            >
                                                                <option value="">Select working period...</option>
                                                                {workingPeriods.map(w => (
                                                                    <option key={w.id} value={w.id}>{w.name}</option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={newWpCount[rule.id] ?? 1}
                                                                onChange={(e) => setNewWpCount(prev => ({
                                                                    ...prev,
                                                                    [rule.id]: Math.max(1, parseInt(e.target.value) || 1)
                                                                }))}
                                                                className="w-14 px-1.5 py-1 border border-slate-300 rounded text-[11px] text-right bg-white font-bold"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddWpRule(rule.id)}
                                                                disabled={saving || !newWpId[rule.id]}
                                                                className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[11px] font-bold flex items-center gap-1 transition-colors disabled:opacity-50"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                                <span>Add</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
