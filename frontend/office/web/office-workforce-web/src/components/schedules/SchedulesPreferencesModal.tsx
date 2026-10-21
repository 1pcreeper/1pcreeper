import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, Heart, Clock, Save, X, CheckCircle2, AlertCircle, Trash2, MapPin } from 'lucide-react';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import StaffSchedulePreferenceContentService from '@/services/content/office/workforce/StaffSchedulePreferenceContentService';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import PlaceContentService from '@/services/content/office/workforce/PlaceContentService';
import WorkingPeriodContentService from '@/services/content/office/workforce/WorkingPeriodContentService';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { StaffSchedulePreferenceResponseDTO } from '@/models/dto/office/workforce/response.dto';

interface SchedulesPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlaceId?: string;
    companyId?: string;
}

const WEEKDAYS = [
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' },
    { value: 7, label: 'Sunday', short: 'Sun' }
];

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

export function SchedulesPreferencesModal({ isOpen, onClose, currentPlaceId, companyId }: SchedulesPreferencesModalProps) {
    const [loading, setLoading] = useState(true);
    const [prefsLoading, setPrefsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [preferences, setPreferences] = useState<StaffSchedulePreferenceResponseDTO[]>([]);

    // Filter states
    const [filterStaffId, setFilterStaffId] = useState<string>('');
    const [filterStaffLabel, setFilterStaffLabel] = useState<string>('');
    const [filterWeekday, setFilterWeekday] = useState<string>('');

    // Form states for creating a new preference
    const [newStaffId, setNewStaffId] = useState<number>(0);
    const [newPlaceId, setNewPlaceId] = useState<number>(Number(currentPlaceId) || 0);
    const [newWeekDay, setNewWeekDay] = useState<number>(1);
    const [newWorkingPeriodId, setNewWorkingPeriodId] = useState<number>(0);
    const [newPriorityIndex, setNewPriorityIndex] = useState<number>(0);

    // Dropdown options
    const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([]);
    const [placesList, setPlacesList] = useState<{ id: number; name: string }[]>([]);
    const [workingPeriods, setWorkingPeriods] = useState<{ id: number; name: string }[]>([]);

    // Place being edited (switchable without closing the modal)
    const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(currentPlaceId ? Number(currentPlaceId) : null);
    const [selectedPlaceLabel, setSelectedPlaceLabel] = useState<string>('');

    const showFeedback = (type: 'success' | 'error', text: string) => {
        setFeedback({ type, text });
        if (type === 'success') {
            setTimeout(() => setFeedback(null), 3000);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        setSelectedPlaceId(currentPlaceId ? Number(currentPlaceId) : null);
        setSelectedPlaceLabel('');
    }, [isOpen, currentPlaceId]);

    useEffect(() => {
        if (!isOpen) return;
        loadInitialData();
    }, [isOpen, companyId]);

    // Working periods depend on the selected place's department
    useEffect(() => {
        if (!isOpen) return;
        if (!selectedPlaceId) {
            setWorkingPeriods([]);
            return;
        }
        setNewPlaceId(selectedPlaceId);
        loadWorkingPeriods();
    }, [isOpen, selectedPlaceId]);

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

    const loadInitialData = async () => {
        setLoading(true);
        setFeedback(null);
        const staffService = StaffContentService.getInstance();
        try {
            // Load places (scoped to the current company)
            try {
                const cId = Number(companyId) || undefined;
                const places = await fetchAllPages(page =>
                    PlaceContentService.getInstance().search(undefined, '', true, { page, size: PAGE_SIZE }, cId)
                );
                setPlacesList(places.map(p => ({ id: p.id, name: p.name })));
            } catch (err: any) {
                setPlacesList([]);
                showFeedback('error', err?.message || 'Failed to load places.');
            }

            // Load staff
            try {
                const cId = Number(companyId) || 0;
                const staff = await fetchAllPages(page => staffService.findAllS1(cId, { page, size: PAGE_SIZE }));
                const mapped = staff.map(s => ({
                    id: s.id,
                    name: staffService.getDisplayName(s) || `Staff #${s.id}`
                }));
                setStaffList(mapped);
                if (mapped.length > 0) {
                    setNewStaffId(prev => prev || mapped[0].id);
                }
            } catch (err: any) {
                setStaffList([]);
                showFeedback('error', err?.message || 'Failed to load staff list.');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadWorkingPeriods = async () => {
        if (!selectedPlaceId) return;
        try {
            let departId: number | undefined;
            const place = await PlaceContentService.getInstance().findById(selectedPlaceId);
            departId = place?.departId;
            const periods = await fetchAllPages(page =>
                WorkingPeriodContentService.getInstance().search(departId, undefined, { page, size: PAGE_SIZE })
            );
            const mapped = periods.map(w => ({ id: w.id, name: w.name || `Period #${w.id}` }));
            setWorkingPeriods(mapped);
            setNewWorkingPeriodId(mapped[0]?.id ?? 0);
        } catch (err: any) {
            setWorkingPeriods([]);
            showFeedback('error', err?.message || 'Failed to load working periods.');
        }
    };

    const loadPreferences = useCallback(async () => {
        if (!selectedPlaceId) {
            setPreferences([]);
            return;
        }
        setPrefsLoading(true);
        try {
            const res = await fetchAllPages(page =>
                StaffSchedulePreferenceContentService.getInstance().search(
                    filterStaffId ? Number(filterStaffId) : undefined,
                    selectedPlaceId,
                    filterWeekday ? Number(filterWeekday) : undefined,
                    { page, size: PAGE_SIZE }
                )
            );
            setPreferences(res);
        } catch (err: any) {
            setPreferences([]);
            showFeedback('error', err?.message || 'Failed to load preferences.');
        } finally {
            setPrefsLoading(false);
        }
    }, [selectedPlaceId, filterStaffId, filterWeekday]);

    useEffect(() => {
        if (!isOpen) return;
        loadPreferences();
    }, [isOpen, loadPreferences]);

    const fetchStaffFilterOptions = async (searchValue: string, pageNum: number) => {
        const cId = Number(companyId) || 0;
        if (!cId) return { content: [], totalPages: 0 };
        try {
            const staffService = StaffContentService.getInstance();
            const res = searchValue.trim()
                ? await staffService.searchS1(searchValue.trim(), cId, { page: pageNum, size: PAGE_SIZE })
                : await staffService.findAllS1(cId, { page: pageNum, size: PAGE_SIZE });
            return {
                content: (res.content || []).map(s => ({
                    id: s.id,
                    label: staffService.getDisplayName(s) || `Staff #${s.id}`
                })),
                totalPages: res.totalPages || 0
            };
        } catch (error) {
            console.error('Failed to search staff:', error);
            return { content: [], totalPages: 0 };
        }
    };

    const handleCreatePreference = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaffId || !newPlaceId || !newWorkingPeriodId) {
            showFeedback('error', 'Please select a staff member, place and working period.');
            return;
        }
        setSaving(true);
        setFeedback(null);
        try {
            await StaffSchedulePreferenceContentService.getInstance().create({
                staffId: newStaffId,
                placeId: newPlaceId,
                weekDay: newWeekDay,
                workingPeriodId: newWorkingPeriodId,
                priorityIndex: newPriorityIndex
            });
            await loadPreferences();
            showFeedback('success', 'Staff schedule preference saved successfully!');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to create preference.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeletePreference = async (id: number) => {
        setSaving(true);
        setFeedback(null);
        try {
            await StaffSchedulePreferenceContentService.getInstance().delete(id);
            await loadPreferences();
            showFeedback('success', 'Preference removed.');
        } catch (err: any) {
            showFeedback('error', err?.message || 'Failed to delete preference.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                            <Heart className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Staff Schedule Preferences</h3>
                            <p className="text-xs text-slate-500">Configure weekly shift preferences and priorities for AI schedule generation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Feedback Banner */}
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

                {/* Main Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Place Selector */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Editing Place</label>
                        <DropdownSearch
                            value={selectedPlaceId}
                            initialLabel={selectedPlaceLabel}
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
                            <span className="text-xs font-medium">Select a place above to manage its staff preferences.</span>
                        </div>
                    ) : (
                    <>
                    {/* New Preference Form */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                            <Plus className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Add New Preference</span>
                        </h4>
                        <form onSubmit={handleCreatePreference} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Staff Member</label>
                                <select
                                    value={newStaffId}
                                    onChange={e => setNewStaffId(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                                >
                                    {staffList.length === 0 && <option value="0">No staff available</option>}
                                    {staffList.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (ID: #{s.id})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Assigned Place</label>
                                <select
                                    value={newPlaceId}
                                    onChange={e => setNewPlaceId(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                                >
                                    {placesList.length === 0 && <option value="0">No places available</option>}
                                    {placesList.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Weekday</label>
                                <select
                                    value={newWeekDay}
                                    onChange={e => setNewWeekDay(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                                >
                                    {WEEKDAYS.map(w => (
                                        <option key={w.value} value={w.value}>{w.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Preferred Shift / Period</label>
                                <select
                                    value={newWorkingPeriodId}
                                    onChange={e => setNewWorkingPeriodId(Number(e.target.value))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-500 font-medium"
                                >
                                    {workingPeriods.length === 0 && (
                                        <option value="0">No working periods configured for this place's department</option>
                                    )}
                                    {workingPeriods.map(wp => (
                                        <option key={wp.id} value={wp.id}>{wp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority (0 = Highest)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={newPriorityIndex}
                                    onChange={e => setNewPriorityIndex(Math.max(0, parseInt(e.target.value) || 0))}
                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-bold focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                >
                                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                    <span>Save Preference</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Filter Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600">Preferences Records ({preferences.length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-48">
                                <DropdownSearch
                                    value={filterStaffId ? Number(filterStaffId) : null}
                                    onChange={(val, opt) => {
                                        setFilterStaffId(val.toString());
                                        setFilterStaffLabel(opt?.label || '');
                                    }}
                                    fetchData={fetchStaffFilterOptions}
                                    placeholder="Filter by staff..."
                                    initialLabel={filterStaffLabel}
                                />
                            </div>
                            {filterStaffId && (
                                <button
                                    type="button"
                                    onClick={() => { setFilterStaffId(''); setFilterStaffLabel(''); }}
                                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                                    title="Clear staff filter"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <select
                                value={filterWeekday}
                                onChange={e => setFilterWeekday(e.target.value)}
                                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-700"
                            >
                                <option value="">All Weekdays</option>
                                {WEEKDAYS.map(w => (
                                    <option key={w.value} value={w.value.toString()}>{w.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Preferences List */}
                    {loading || prefsLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            <span className="text-xs font-medium">Loading preferences from backend...</span>
                        </div>
                    ) : preferences.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs text-slate-500 font-medium">No preferences configured yet.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add staff shift preferences.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                            {preferences.map((pref, idx) => {
                                const weekdayObj = WEEKDAYS.find(w => w.value === pref.weekDay);
                                return (
                                    <div key={pref.id || idx} className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="w-12 text-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[11px] font-bold uppercase tracking-wider">
                                                {weekdayObj?.short || `Day ${pref.weekDay}`}
                                            </span>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-900">{pref.staffName || `Staff #${pref.staffId}`}</span>
                                                    <span className="text-[10px] text-slate-400">&bull;</span>
                                                    <span className="text-xs text-slate-600">{pref.placeName || `Place #${pref.placeId}`}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span>{pref.workingPeriodName || `Shift Period #${pref.workingPeriodId}`}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                                                Priority #{pref.priorityIndex ?? 0}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePreference(pref.id)}
                                                disabled={saving}
                                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                title="Delete preference"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
