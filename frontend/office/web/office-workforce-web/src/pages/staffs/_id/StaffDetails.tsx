import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { useOfficeAuthContext } from '@/contexts/OfficeAuthContext';
import { formatPostgresDate } from '@/lib/utils';
import { StaffSchedulePreferenceDTO } from '@/models/dto/office/workforce/object.dto';
import { StaffUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { StaffDetailResponseDTO } from '@/models/dto/office/workforce/response.dto';
import CompanyContentService from '@/services/content/office/workforce/CompanyContentService';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { ArrowLeft, Briefcase, Building, Calendar, Clock, CreditCard, Edit2, FileText, Mail, MapPin, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

export default function StaffDetails() {
    const { currentSelectedCompany } = useCompanyStore();
    const staffContentService = StaffContentService.getInstance();
    const companyContentService = CompanyContentService.getInstance();
    const personContentService = PersonContentService.getInstance();
    const { id } = useParams();
    const navigate = useNavigate();

    const { authOfficeUser } = useOfficeAuthContext();
    const isWorkforceAdmin = Array.isArray(authOfficeUser?.workforce?.roles) ? authOfficeUser?.workforce?.roles?.includes('WORKFORCE_ADMIN') || authOfficeUser?.workforce?.roles?.includes('OFFICE_ADMIN') : authOfficeUser?.workforce?.roles?.has?.('WORKFORCE_ADMIN') || authOfficeUser?.workforce?.roles?.has?.('OFFICE_ADMIN');

    const [staffDetail, setStaffDetail] = useState<StaffDetailResponseDTO | null>(null);

    const [activeTab, setActiveTab] = useState<'schedule_preference' | 'salary' | 'other'>('schedule_preference');

    const [isEditingStaff, setIsEditingStaff] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);
    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };

    const [editStaffData, setEditStaffData] = useState<StaffUpdateRequestDTO>({
        departId: 0,
        custId: '',
        type: 'FULL_TIME' as any,
        details: { maxWorkingHrs: 40 },
        about: ''
    });

    const fetchDepartments = async (compId: number) => {
        try {
            const res = await DepartmentContentService.getInstance().findAllS1(compId, { page: 0, size: 100 });
            setDepartments(res.content);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditStaffClick = () => {
        if (staffDetail) {
            setEditStaffData({
                departId: staffDetail.staff.departId,
                custId: staffDetail.staff.custId || '',
                type: staffDetail.staff.type as any,
                details: {
                    maxWorkingHrs: staffDetail.staffDetail.maxWorkingHrs || 40
                },
                about: staffDetail.staffDetail.about || ''
            });
            fetchDepartments(staffDetail.company.id);
            setIsEditingStaff(true);
        }
    };

    const handleEditStaffSubmit = async () => {
        try {
            await StaffContentService.getInstance().update(Number(id), editStaffData);
            setIsEditingStaff(false);
            showMessage('success', 'Staff details updated successfully.');
            fetchStaff();
        } catch (error: any) {
            console.error(error);
            showMessage('error', error?.message || 'Failed to update staff.');
        }
    };

    const handleDeleteStaff = async () => {
        try {
            const randomNumber = Math.floor(Math.random() * 10000) + 1;
            const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to delete`);
            if (randomNumber.toString() !== deleteModalInput) {
                window.alert("Input Incorrect");
                window.location.reload();
                return;
            }
            await StaffContentService.getInstance().delete(Number(id));
            showMessage('success', 'Staff deleted successfully.');
            setTimeout(() => navigate(`/companies/${currentSelectedCompany?.id}/staffs`), 1000);
        } catch (error: any) {
            console.error(error);
            showMessage('error', error?.message || 'Failed to delete staff.');
        }
    };

    const [isPreferenceModalOpen, setIsPreferenceModalOpen] = useState(false);

    // Form state for adding schedule preference
    const [prefFormData, setPrefFormData] = useState({ placeId: '1', placeName: 'Main Headquarters', weekDay: 1, workingPeriodName: 'Day Shift', priorityIndex: 1 });

    // Mock data representing full payload
    const staffDetailDisplay = {
        id: staffDetail?.staff.id || "",
        person: {
            id: staffDetail?.person.id || "",
            name_english: staffDetail?.person.nameEnglish || "",
            name_chinese: staffDetail?.person.nameChinese || "",
            office_tel: staffDetail?.person.officeTel || "",
            mobile_tel: staffDetail?.person.mobileTel || "",
            email: staffDetail?.person.email || "",
            hk_id: staffDetail?.person.hkId || "",
            cn_id: staffDetail?.person.cnId || "",
            mo_id: staffDetail?.person.moId || "",
            passport_id: staffDetail?.person.passportId || "",
            details: {
                date_of_birth: staffDetail?.personDetail.dateOfBirth ? formatPostgresDate(staffDetail?.personDetail.dateOfBirth) : null,
                gender: staffDetail?.personDetail.gender || "",
                nationality: staffDetail?.personDetail.nationality || "",
                occupation: staffDetail?.personDetail.occupation || "",
                address: staffDetail?.personDetail.address || "",
                wechat_id: staffDetail?.personDetail.wechatId || "",
                instagram_id: staffDetail?.personDetail.instagramId || "",
                website: staffDetail?.personDetail.website || "",
                bio: staffDetail?.personDetail.bio || ""
            }
        },
        staff: {
            id: staffDetail?.staff.id || "",
            company_name: staffDetail?.company ? companyContentService.getDisplayName(staffDetail?.company!) : "",
            org_name: staffDetail?.staff.departName || "",
            cust_id: staffDetail?.staff.custId || "",
            work_type: staffDetail?.staff.type || "",
            details: {
                max_working_hours: staffDetail?.staffDetail.maxWorkingHrs || "",
                occupations: [...staffDetail?.staffOccupations || []],
                about: staffDetail?.staffDetail.about || ""
            }
        }
    };

    const [preferences, setPreferences] = useState<StaffSchedulePreferenceDTO[]>([]);

    const p = staffDetailDisplay.person;
    const d = p.details;
    const si = staffDetailDisplay.staff;
    const sd = staffDetailDisplay.staff.details;
    const o = staffDetailDisplay.staff.details.occupations;

    const handleAddPreference = (e: React.FormEvent) => {
        e.preventDefault();
        //TO BE IMPLEMENTED
        setIsPreferenceModalOpen(false);
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const fetchStaff = async () => {
        if (!id || Number.isNaN(id)) {
            navigate("/errors/not-found");
        }
        try {
            const response = await staffContentService.findByIdInDetail(Number(id));
            setStaffDetail(response);
            setPreferences(response.schedulePreferences);
        } catch (error) {
            console.error("Failed to fetch staff details:", error);
            navigate(`/companies/${currentSelectedCompany?.id}/staffs`);
        }
    }

    const handleOpenAssignOccupationModal = () => {
        // TO BE IMPLEMENTED
    };

    useEffect(() => {
        fetchStaff();
    }, [id]);

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <div className="justify-between px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center gap-4">
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{p.name_chinese ? p.name_chinese : p.name_english ? p.name_english : 'Unnamed Person'}</h1>
                        </div>
                        <p className="text-xs text-purple-500 font-medium">Staff Profile</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isWorkforceAdmin && (
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Delete Person"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-7xl mx-auto space-y-6">

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Big Avatar Sidebar */}
                        <div className="w-full lg:w-72 shrink-0">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center py-10 px-6 h-full">
                                <Link to={`/persons/${p.id}`} className="relative mb-5">
                                    <div className="w-40 h-40 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                        <span className="text-5xl font-bold text-indigo-300">{p.name_english?.charAt(0) || p.name_chinese?.charAt(0) || 'U'}</span>
                                    </div>
                                    <div className="absolute -bottom-1 -translate-x-1/2 left-1/2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Working</span>
                                    </div>
                                </Link>
                                <Link to={`/persons/${p.id}`} className="text-xl font-bold text-slate-900">
                                    {p.name_chinese || p.name_english || 'Unnamed Person'}
                                </Link>
                                <Link to={`/persons/${p.id}`} className="text-sm font-medium text-slate-500 mb-1">
                                    {p.name_english || p.name_chinese || 'Unnamed Person'}
                                </Link>
                                <div className="mt-1 w-full">
                                    <div className="flex items-center justify-center mb-2">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{staffDetailDisplay.staff.org_name}</h3>
                                    </div>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 tracking-wider">
                                        {si.work_type.replace(/_/g, ' ')}
                                    </span>
                                    <Link to={`/persons/${p.id}`} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider">
                                        PersonID: {p.id}
                                    </Link>
                                </div>
                                <div className="mt-8 w-full">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Occupations</h3>
                                        {isWorkforceAdmin && (<button
                                            onClick={handleOpenAssignOccupationModal}
                                            className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>)}
                                    </div>
                                    {o && o.length > 0 ? (
                                        <div className="space-y-2">
                                            {o.map((occ, idx) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center group">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">{occ.occupationName}</h4>
                                                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"> Since {formatPostgresDate(occ.createdAt)}</h5>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 bg-slate-50 rounded border border-slate-200 border-dashed">
                                            <p className="text-xs text-slate-500">Not assigned any occupations.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Info Section */}
                        <div className="flex-1 flex flex-col gap-6">

                            {/* Personal & Employment Information */}
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900">Personal & Employment Information</h2>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Left Column: Personal Information */}
                                    <div className="flex flex-col gap-5">
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">Personal</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chinese Name</label>
                                                <div className="text-sm font-medium text-slate-900">{p.name_chinese}</div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">English Name</label>
                                                <div className="text-sm font-medium text-slate-900">{p.name_english}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
                                                <div className="text-sm text-slate-900 truncate" title={p.email}>{p.email}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Mobile Tel</label>
                                                <div className="text-sm font-mono text-slate-700">{p.mobile_tel || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Office Tel</label>
                                                <div className="text-sm font-mono text-slate-700">{p.office_tel || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> HK ID</label>
                                                <div className="text-sm font-mono text-slate-700">{p.hk_id || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Passport ID</label>
                                                <div className="text-sm font-mono text-slate-700">{p.passport_id || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> CN ID</label>
                                                <div className="text-sm font-mono text-slate-700">{p.cn_id || '-'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> MO ID</label>
                                                <div className="text-sm font-mono text-slate-700">{p.mo_id || '-'}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Employment Overview */}
                                    <div className="flex flex-col gap-5">
                                        <div className="flex justify-between items-center mb-1 border-b border-slate-100 pb-2">
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Employment Overview</h3>
                                            {isWorkforceAdmin && !isEditingStaff && (
                                                <button onClick={handleEditStaffClick} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors -mt-1">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {isEditingStaff && (
                                                <div className="flex gap-2 -mt-1">
                                                    <button onClick={() => setIsEditingStaff(false)} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded border border-slate-200">Cancel</button>
                                                    <button onClick={handleEditStaffSubmit} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm">Save</button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                            <div className="col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Building className="w-3 h-3" /> Company</label>
                                                <div className="text-sm font-medium text-slate-900">{si.company_name}</div>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                                                {isEditingStaff ? (
                                                    <DropdownSearch
                                                        value={editStaffData.departId}
                                                        onChange={(val) => setEditStaffData({ ...editStaffData, departId: val })}
                                                        fetchData={async (search, page) => {
                                                            if (!staffDetail?.company.id) return { content: [], totalPages: 0 };
                                                            const res = await DepartmentContentService.getInstance().searchS1(search, staffDetail.company.id, { page, size: 10 });
                                                            return {
                                                                content: res.content.map(o => ({ id: o.id, label: o.name })),
                                                                totalPages: res.totalPages
                                                            };
                                                        }}
                                                        placeholder="Search department..."
                                                        initialLabel={departments.find(o => o.id === editStaffData.departId)?.name || ''}
                                                    />
                                                ) : (
                                                    <div className="text-sm font-medium text-slate-900">{si.org_name}</div>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Work Type</label>
                                                {isEditingStaff ? (
                                                    <select className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={editStaffData.type} onChange={e => setEditStaffData({ ...editStaffData, type: e.target.value as any })}>
                                                        <option value="FULL_TIME">Full Time</option>
                                                        <option value="FULL_PART_TIME">Full Part Time</option>
                                                        <option value="PART_TIME">Part Time</option>
                                                        <option value="CONTRACT">Contract</option>
                                                        <option value="FREELANCE">Freelance</option>
                                                        <option value="INTERN">Intern</option>
                                                        <option value="TEMPORARY">Temporary</option>
                                                        <option value="SPECIAL">Special</option>
                                                    </select>
                                                ) : (
                                                    <div className="text-sm font-medium text-slate-900">{si.work_type.replace(/_/g, ' ')}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cust ID</label>
                                                {isEditingStaff ? (
                                                    <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        value={editStaffData.custId} onChange={e => setEditStaffData({ ...editStaffData, custId: e.target.value })} />
                                                ) : (
                                                    <div className="text-sm font-mono text-slate-700">{si.cust_id || '-'}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Staff ID</label>
                                                <div className="text-sm font-mono text-slate-900">{si.id}</div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Person ID</label>
                                                <div className="text-sm font-mono text-slate-900">{p.id}</div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company ID</label>
                                                <div className="text-sm font-mono text-slate-900">{staffDetail?.company.id}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Preferences & Additional Details */}
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <h2 className="text-sm font-bold text-slate-900">Work Preferences & Additional Details</h2>
                                </div>
                                <div className="p-5 flex flex-col gap-8">

                                    {/* Top: Work Preferences */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                            Work Preferences
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Max Working Hours</label>
                                                {isEditingStaff ? (
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" min="1" className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                            value={editStaffData.details.maxWorkingHrs} onChange={e => setEditStaffData({ ...editStaffData, details: { ...editStaffData.details, maxWorkingHrs: Number(e.target.value) } })} />
                                                        <span className="text-sm text-slate-500 font-medium">hrs/week</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-2xl font-bold font-mono text-slate-900">{sd.max_working_hours} <span className="text-sm text-slate-500 font-medium">hrs/week</span></div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"></label>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">About</label>
                                            <textarea className={isEditingStaff ? 'w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500' : 'w-full text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 min-h-15'}
                                                value={isEditingStaff ? editStaffData.about : staffDetail?.staffDetail.about || '-'} onChange={e => setEditStaffData({ ...editStaffData, about: e.target.value })} rows={3} disabled={!isEditingStaff} readOnly={isEditingStaff ? false : true} />
                                        </div>
                                    </div>

                                    {/* Bottom: Additional Details */}
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                            Additional Details
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date of Birth</label>
                                                <div className="text-sm font-medium text-slate-900">{d.date_of_birth}</div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                                                <div className="text-sm font-medium text-slate-900 capitalize">{d.gender.toLowerCase()}</div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Address</label>
                                                <div className="text-sm text-slate-700">{d.address}</div>
                                            </div>
                                        </div>
                                        <div className="mt-5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Search className="w-3 h-3" /> Bio</label>
                                            <textarea className={'w-full text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 min-h-15'}
                                                value={p?.details.bio || '-'} rows={5} disabled readOnly />
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Section Menu (Tabs) */}
                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
                        <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50/50">
                            <button
                                onClick={() => setActiveTab('schedule_preference')}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'schedule_preference' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Schedule Preferences
                            </button>
                            <button
                                onClick={() => setActiveTab('salary')}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'salary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Salary
                            </button>
                            <button
                                onClick={() => setActiveTab('other')}
                                className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'other' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                Other
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === 'schedule_preference' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900">Schedule Preferences</h3>
                                            <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsPreferenceModalOpen(true)}
                                            className="bg-indigo-600 text-white px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1.5 hover:bg-indigo-700 transition"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            ADD PREFERENCE
                                        </button>
                                    </div>

                                    {preferences.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {preferences.map(pref => (
                                                <div key={pref.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                                    <div className="flex justify-between items-start mb-3 pl-2">
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Place</div>
                                                            <div className="text-sm font-bold text-slate-900">{pref.placeName}</div>
                                                            <div className="text-[10px] text-slate-500 font-mono">ID: {pref.placeId}</div>
                                                        </div>
                                                        <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold border border-slate-200">
                                                            Priority: {pref.priorityIndex}
                                                        </div>
                                                    </div>

                                                    <div className="pl-2 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Day</div>
                                                            <div className="text-sm font-medium text-slate-700">{dayNames[pref.weekDay]}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Period</div>
                                                            <div className="text-sm font-medium text-slate-700">{pref.workingPeriodName}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-200">
                                            <p className="text-sm text-slate-500">No schedule preferences configured.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'salary' && (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                        <Clock className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-1">Salary Details</h3>
                                    <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                </div>
                            )}

                            {activeTab === 'other' && (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                    <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <Modal
                isOpen={isPreferenceModalOpen}
                onClose={() => setIsPreferenceModalOpen(false)}
                title="Add Schedule Preference"
                onSubmit={handleAddPreference}
                submitLabel="ADD PREFERENCE"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Place</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={prefFormData.placeId}
                            onChange={(e) => {
                                const name = e.target.options[e.target.selectedIndex].text;
                                setPrefFormData({ ...prefFormData, placeId: e.target.value, placeName: name });
                            }}
                        >
                            <option value="1">Main Headquarters</option>
                            <option value="2">Downtown Branch</option>
                            <option value="3">Westside Warehouse</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Day of Week</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={prefFormData.weekDay}
                                onChange={(e) => setPrefFormData({ ...prefFormData, weekDay: parseInt(e.target.value) })}
                            >
                                <option value={1}>Monday</option>
                                <option value={2}>Tuesday</option>
                                <option value={3}>Wednesday</option>
                                <option value={4}>Thursday</option>
                                <option value={5}>Friday</option>
                                <option value={6}>Saturday</option>
                                <option value={0}>Sunday</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Priority Index</label>
                            <input
                                type="number" min="0" required
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={prefFormData.priorityIndex}
                                onChange={(e) => setPrefFormData({ ...prefFormData, priorityIndex: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Working Period</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={prefFormData.workingPeriodName}
                            onChange={(e) => setPrefFormData({ ...prefFormData, workingPeriodName: e.target.value })}
                        >
                            <option value="Day Shift">Day Shift</option>
                            <option value="Night Shift">Night Shift</option>
                            <option value="Flexi Day">Flexi Day</option>
                        </select>
                    </div>
                </div>
            </Modal>


            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Staff"
                onSubmit={handleDeleteStaff}
                submitLabel="DELETE"
            >
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3">
                    <Trash2 className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-sm mb-1">Warning: Irreversible Action</h4>
                        <p className="text-xs opacity-90 leading-relaxed">
                            Are you sure you want to permanently delete this staff member? This will remove all associated work preferences, assignments, and employment records.
                        </p>
                    </div>
                </div>
            </Modal>

            <MessageModal
                isOpen={modalMessage !== null}
                onClose={() => setModalMessage(null)}
                type={modalMessage?.type || 'error'}
                title={modalMessage?.title || 'Message'}
                message={modalMessage?.text || ''}
            />
        </div >
    );
}


