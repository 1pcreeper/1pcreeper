
import { DeleteModal } from '@/components/ui/DeleteModal';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { useOfficeAuthContext } from '@/contexts/OfficeAuthContext';
import { formatPostgresDate } from '@/lib/utils';
import { WorkType } from '@/models/dto/office/workforce/enum.dto';
import { PersonUpdateRequestDTO, StaffCreateRequestDTO, StaffUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { CompanyResponseDTO, DepartmentResponseDTO, PersonDetailResponseDTO, StaffResponseDTO } from '@/models/dto/office/workforce/response.dto';
import CompanyContentService from '@/services/content/office/workforce/CompanyContentService';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import { ArrowDownLeftSquareIcon, ArrowLeft, Calendar, Clock, CreditCard, Edit2, FileText, Mail, MapPin, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PersonDetails() {
    const personContentService = PersonContentService.getInstance();
    const { id } = useParams();
    const navigate = useNavigate();
    const [personDetail, setPersonDetail] = useState<PersonDetailResponseDTO | null>(null);

    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditingPerson, setIsEditingPerson] = useState(false);

    const [mobileZone, setMobileZone] = useState('');
    const [mobileNum, setMobileNum] = useState('');
    const [officeZone, setOfficeZone] = useState('');
    const [officeNum, setOfficeNum] = useState('');
    const [hkId1, setHkId1] = useState('');
    const [hkId2, setHkId2] = useState('');
    const [hkId3, setHkId3] = useState('');
    const [moId1, setMoId1] = useState('');
    const [moId2, setMoId2] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditStaffModalOpen, setIsEditStaffModalOpen] = useState(false);

    const [editPersonData, setEditPersonData] = useState<PersonUpdateRequestDTO>({
        nameEnglish: '', nameChinese: '', officeTel: '', mobileTel: '', email: '',
        hkId: '', cnId: '', moId: '', passportId: '', bio: '', dateOfBirth: '', gender: 'MALE', nationality: '', occupation: '', address: '', wechatId: '', instagramId: '', website: ''
    });

    const [editStaffData, setEditStaffData] = useState<StaffUpdateRequestDTO>({
        departId: 0, custId: '', type: WorkType.FULL_TIME, details: { maxWorkingHrs: 40 }, about: ''
    });
    const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
    const [editingStaffCompanyId, setEditingStaffCompanyId] = useState<number | null>(null);

    const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [assignFormData, setAssignFormData] = useState<StaffCreateRequestDTO>({
        companyId: 0,
        personId: Number(id) || 0,
        departId: 0,
        custId: '',
        type: WorkType.FULL_TIME,
        details: { maxWorkingHrs: 40 }
    });

    const [activeTab, setActiveTab] = useState<'opt1' | 'opt2' | 'opt3'>('opt1');
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };
    const { authOfficeUser } = useOfficeAuthContext();
    const isWorkforceAdmin = Array.isArray(authOfficeUser?.workforce?.roles) ? authOfficeUser?.workforce?.roles?.includes('WORKFORCE_ADMIN') || authOfficeUser?.workforce?.roles?.includes('OFFICE_ADMIN') : authOfficeUser?.workforce?.roles?.has?.('WORKFORCE_ADMIN') || authOfficeUser?.workforce?.roles?.has?.('OFFICE_ADMIN');

    const fetchPersonDetail = async () => {
        if (!id || Number.isNaN(id)) {
            navigate("/errors/not-found");
        }
        try {
            const response = await personContentService.findByIdInDetail(Number(id));
            setPersonDetail(response);
        } catch (error) {
            console.error("Failed to fetch person details:", error);
            navigate("/persons");
        }
    }
    useEffect(() => {
        fetchPersonDetail();
    }, [id]);


    useEffect(() => {
        const newErrors: Record<string, string> = {};
        if (editPersonData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/.test(editPersonData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (officeZone || officeNum) {
            const officeTel = `+${officeZone.padStart(3, '0')} ${officeNum}`;
            if (!/^(\+([0-9]){3}\s([0-9])+)$/.test(officeTel)) {
                newErrors.officeTel = "Invalid office telephone format. Example: +852 12345678";
            }
        }
        if (mobileZone || mobileNum) {
            const mobileTel = `+${mobileZone.padStart(3, '0')} ${mobileNum}`;
            if (!/^(\+([0-9]){3}\s([0-9])+)$/.test(mobileTel)) {
                newErrors.mobileTel = "Invalid mobile telephone format";
            }
        }
        if (hkId1 || hkId2 || hkId3) {
            const hkId = `${hkId1.toUpperCase()}${hkId2}(${hkId3})`;
            if (!/^[A-Z][0-9]{6}\([0-9A-Z]\)$/.test(hkId)) {
                newErrors.hkId = "Invalid HK ID format. Example: A123456(1)";
            }
        }
        if (moId1 || moId2) {
            const moId = `${moId1}${moId2}`;
            if (!/^\d{8}$/.test(moId)) {
                newErrors.moId = "Invalid MO ID format. Must be exactly 8 digits.";
            }
        }
        if (editPersonData.cnId && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\d|3[01]))\d{3}[\dXx]$/.test(editPersonData.cnId)) {
            newErrors.cnId = "Invalid CN ID format";
        }
        if (editPersonData.passportId && !/^[A-Z0-9]+$/.test(editPersonData.passportId)) {
            newErrors.passportId = "Invalid Passport ID format";
        }
        setErrors(newErrors);
    }, [editPersonData.email, editPersonData.cnId, editPersonData.passportId, mobileZone, mobileNum, officeZone, officeNum, hkId1, hkId2, hkId3, moId1, moId2]);

    const handleEditPersonClick = () => {
        if (personDetail) {
            setEditPersonData({
                nameEnglish: personDetail.person.nameEnglish || '',
                nameChinese: personDetail.person.nameChinese || '',
                officeTel: personDetail.person.officeTel || '',
                mobileTel: personDetail.person.mobileTel || '',
                email: personDetail.person.email || '',
                hkId: personDetail.person.hkId || '',
                cnId: personDetail.person.cnId || '',
                moId: personDetail.person.moId || '',
                passportId: personDetail.person.passportId || '',
                bio: personDetail.detail?.bio || '',
                dateOfBirth: (() => {
                    const d = personDetail.detail?.dateOfBirth;
                    if (!d) return '';
                    if (Array.isArray(d)) return `${d[0]}-${String(d[1]).padStart(2, '0')}-${String(d[2]).padStart(2, '0')}`;
                    return String(d).split('T')[0];
                })(),
                gender: personDetail.detail?.gender || 'MALE',
                nationality: personDetail.detail?.nationality || '',
                occupation: personDetail.detail?.occupation || '',
                address: personDetail.detail?.address || '',
                wechatId: personDetail.detail?.wechatId || '',
                instagramId: personDetail.detail?.instagramId || '',
                website: personDetail.detail?.website || ''
            });

            const mTel = personDetail.person.mobileTel || '';
            const oTel = personDetail.person.officeTel || '';

            setMobileZone(mTel ? mTel.split(' ')[0]?.replace('+', '') || '' : '');
            setMobileNum(mTel ? mTel.split(' ')[1] || '' : '');

            setOfficeZone(oTel ? oTel.split(' ')[0]?.replace('+', '') || '' : '');
            setOfficeNum(oTel ? oTel.split(' ')[1] || '' : '');

            const hk = personDetail.person.hkId || '';
            if (hk) {
                setHkId1(hk.charAt(0) || '');
                setHkId2(hk.substring(1, 7) || '');
                setHkId3(hk.charAt(8) || '');
            } else {
                setHkId1(''); setHkId2(''); setHkId3('');
            }

            const mo = personDetail.person.moId || '';
            if (mo) {
                setMoId1(mo.substring(0, 7) || '');
                setMoId2(mo.charAt(7) || '');
            } else {
                setMoId1(''); setMoId2('');
            }

            setIsEditingPerson(true);
        }
    };

    const handleDeletePerson = async () => {
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to delete`);
        if (randomNumber.toString() !== deleteModalInput) {
            window.alert("Input Incorrect");
            window.location.reload();
            return;
        }
        try {
            await personContentService.delete(Number(id));
            showMessage('success', 'Person deleted successfully.');
            setTimeout(() => navigate('/persons'), 1000);
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to delete person.');
        }
    };

    const handleEditPersonSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        if (e) e.preventDefault();
        try {
            const finalData = { ...editPersonData };
            if (mobileZone && mobileNum) finalData.mobileTel = `+${mobileZone.padStart(3, '0')} ${mobileNum}`;
            else finalData.mobileTel = '';
            if (officeZone && officeNum) finalData.officeTel = `+${officeZone.padStart(3, '0')} ${officeNum}`;
            else finalData.officeTel = '';
            if (hkId1 && hkId2 && hkId3) finalData.hkId = `${hkId1.toUpperCase()}${hkId2}(${hkId3})`;
            else finalData.hkId = '';
            if (moId1 && moId2) finalData.moId = `${moId1}${moId2}`;
            else finalData.moId = '';
            if (finalData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/.test(finalData.email)) throw new Error("Invalid email format");
            if (finalData.officeTel && !/^(\+([0-9]){3}\s([0-9])+)$/.test(finalData.officeTel)) throw new Error("Invalid office telephone format. Example: +852 12345678");
            if (finalData.mobileTel && !/^(\+([0-9]){3}\s([0-9])+)$/.test(finalData.mobileTel)) throw new Error("Invalid mobile telephone format");
            if (finalData.hkId && !/^[A-Z][0-9]{6}\([0-9A-Z]\)$/.test(finalData.hkId)) throw new Error("Invalid HK ID format. Example: A123456(1)");
            if (finalData.moId && !/^\d{8}$/.test(finalData.moId)) throw new Error("Invalid MO ID format. Must be exactly 8 digits.");
            if (finalData.cnId && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\d|3[01]))\d{3}[\dXx]$/.test(finalData.cnId)) throw new Error("Invalid CN ID format");
            if (finalData.passportId && !/^[A-Z0-9]+$/.test(finalData.passportId)) throw new Error("Invalid Passport ID format");
            if (!finalData.nameEnglish && !finalData.nameChinese) throw new Error("At least English Name or Chinese Name is required.");

            await personContentService.update(Number(id), finalData);
            setIsEditingPerson(false);
            showMessage("success", "Person updated successfully.");
            fetchPersonDetail();
        } catch (error: any) {
            console.error("Failed to update person:", error);
            showMessage("error", error?.message || "Failed to update person.");
        }
    };

    const handleOpenEditStaffModal = async (staff: StaffResponseDTO) => {
        try {
            const staffDetails = await StaffContentService.getInstance().findByIdInDetail(staff.id);
            setEditStaffData({
                departId: staff.departId,
                custId: staffDetails.staff.custId || '',
                type: staffDetails.staff.type || WorkType.FULL_TIME,
                details: { maxWorkingHrs: staffDetails.staffDetail?.maxWorkingHrs || 40 },
                about: staffDetails.staffDetail?.about || ''
            });
            setEditingStaffId(staff.id);
            setEditingStaffCompanyId(staffDetails.company?.id);
            if (staffDetails.company?.id) await fetchDepartments(staffDetails.company.id);
            setIsEditStaffModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch staff details:", error);
        }
    };

    const handleEditStaffSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaffId) return;
        try {
            await StaffContentService.getInstance().update(editingStaffId, editStaffData);
            setIsEditStaffModalOpen(false);
            showMessage("success", "Staff details updated successfully.");
            fetchPersonDetail();
        } catch (error: any) {
            console.error("Failed to update staff:", error);
            showMessage("error", error?.message || "Failed to update staff details.");
        }
    };

    const handleOpenAssignModal = async () => {
        const res = await CompanyContentService.getInstance().findAllS1({ page: 0, size: 100 });
        setCompanies(res.content);
        if (res.content.length > 0) {
            const firstCompanyId = res.content[0].id;
            setAssignFormData(prev => ({ ...prev, companyId: firstCompanyId, personId: Number(id) }));
            fetchDepartments(firstCompanyId);
        }
        setIsAssignModalOpen(true);
    };

    const fetchDepartments = async (companyId: number) => {
        const res = await DepartmentContentService.getInstance().findAllS1(companyId, { page: 0, size: 100 });
        setDepartments(res.content);
        if (res.content.length > 0) {
            setAssignFormData(prev => ({ ...prev, departId: res.content[0].id }));
        }
    };

    const handleCompanyChange = (compId: number) => {
        setAssignFormData(prev => ({ ...prev, companyId: compId }));
        fetchDepartments(compId);
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StaffContentService.getInstance().create(assignFormData);
            setIsAssignModalOpen(false);
            showMessage("success", "Staff assigned successfully.");
            fetchPersonDetail();
        } catch (error: any) {
            console.error("Failed to assign staff:", error);
            showMessage("error", error?.message || "Failed to assign staff.");
        }
    };

    return (
        <>
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
                                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{personDetail && personContentService.getDisplayName(personDetail?.person)}</h1>
                            </div>
                            <p className="text-xs text-blue-600 font-medium">Person Profile</p>
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
                                    <div className="relative mb-5">
                                        <div className="w-40 h-40 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                            <span className="text-5xl font-bold text-indigo-300">{personDetail?.person.nameEnglish?.charAt(0)}</span>
                                        </div>
                                        <div className="absolute -bottom-1 -translate-x-1/2 left-1/2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Working</span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{personDetail?.person.nameChinese}</h2>
                                    <div className="text-sm font-medium text-slate-500 mb-1">{personDetail?.person.nameEnglish}</div>
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider">
                                            PersonID: {personDetail?.person.id}
                                        </span>
                                    </div>

                                    <div className="mt-8 w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Employment</h3>
                                            {isWorkforceAdmin && (<button
                                                onClick={handleOpenAssignModal}
                                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>)}
                                        </div>
                                        {personDetail?.staffs && personDetail.staffs.length > 0 ? (
                                            <div className="space-y-2">
                                                {personDetail.staffs.map((staff, idx) => (
                                                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-3 flex justify-between items-center group">
                                                        <div>
                                                            <h4 className="text-sm font-bold text-slate-900">{staff.companyName}</h4>
                                                            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{staff.departName}</h5>
                                                        </div>
                                                        <button
                                                            onClick={(e) => navigate(`/staffs/${staff.id}`)}
                                                            className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <ArrowDownLeftSquareIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-slate-50 rounded border border-slate-200 border-dashed">
                                                <p className="text-xs text-slate-500">Not assigned to any company.</p>
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
                                        <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                                    </div>
                                    <div className="p-5 grid grid-cols-1  gap-x-8 gap-y-6">
                                        {/* Left Column: Personal Information */}
                                        <div className="flex flex-col gap-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">Personal</h3>
                                                {isWorkforceAdmin && !isEditingPerson && (<button onClick={handleEditPersonClick} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors -mt-4">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>)}
                                                {isEditingPerson && (
                                                    <div className="flex gap-2 -mt-4">
                                                        <button onClick={() => setIsEditingPerson(false)} className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded border border-slate-200">Cancel</button>
                                                        <button onClick={handleEditPersonSubmit} className="px-3 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded">Save</button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chinese Name</label>
                                                    {isEditingPerson ? (
                                                        <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.nameChinese} onChange={e => setEditPersonData({ ...editPersonData, nameChinese: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.nameChinese || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">English Name</label>
                                                    {isEditingPerson ? (
                                                        <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.nameEnglish} onChange={e => setEditPersonData({ ...editPersonData, nameEnglish: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.nameEnglish || '-'}</div>
                                                    )}
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
                                                    {isEditingPerson ? (
                                                        <input type="email" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.email} onChange={e => setEditPersonData({ ...editPersonData, email: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.email || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Mobile Tel</label>
                                                    {isEditingPerson ? (
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-slate-500 font-bold">+</span>
                                                            <input type="text" placeholder="Zone" className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={mobileZone} onChange={e => setMobileZone(e.target.value)} />
                                                            <input type="text" placeholder="Number" className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={mobileNum} onChange={e => setMobileNum(e.target.value)} />
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.mobileTel || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Office Tel</label>
                                                    {isEditingPerson ? (
                                                        <div className="flex gap-2 items-center">
                                                            <span className="text-slate-500 font-bold">+</span>
                                                            <input type="text" placeholder="Zone" className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={officeZone} onChange={e => setOfficeZone(e.target.value)} />
                                                            <input type="text" placeholder="Number" className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={officeNum} onChange={e => setOfficeNum(e.target.value)} />
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.officeTel || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> HK ID</label>
                                                    {isEditingPerson ? (
                                                        <div>
                                                            <div className="flex gap-1 items-center">
                                                                <input type="text" placeholder="A" maxLength={1} className="w-8 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center uppercase" value={hkId1} onChange={e => setHkId1(e.target.value.toUpperCase())} />
                                                                <input type="text" placeholder="123456" maxLength={6} className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 tracking-widest" value={hkId2} onChange={e => setHkId2(e.target.value)} />
                                                                <span className="text-slate-500 font-bold text-xs"> ( </span>
                                                                <input type="text" placeholder="1" maxLength={1} className="w-8 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={hkId3} onChange={e => setHkId3(e.target.value)} />
                                                                <span className="text-slate-500 font-bold text-xs"> ) </span>
                                                            </div>
                                                            {errors.hkId && <div className="text-red-500 text-[10px] mt-1">{errors.hkId}</div>}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.hkId || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Passport ID</label>
                                                    {isEditingPerson ? (
                                                        <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.passportId} onChange={e => setEditPersonData({ ...editPersonData, passportId: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.passportId || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> CN ID</label>
                                                    {isEditingPerson ? (
                                                        <div>
                                                            <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.cnId} onChange={e => setEditPersonData({ ...editPersonData, cnId: e.target.value })} />
                                                            {errors.cnId && <div className="text-red-500 text-[10px] mt-1">{errors.cnId}</div>}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.cnId || '-'}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> MO ID</label>
                                                    {isEditingPerson ? (
                                                        <div>
                                                            <div className="flex gap-1 items-center">
                                                                <input type="text" placeholder="1234567" maxLength={7} className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 tracking-widest" value={moId1} onChange={e => setMoId1(e.target.value)} />
                                                                <span className="text-slate-500 font-bold text-xs">(</span>
                                                                <input type="text" placeholder="8" maxLength={1} className="w-8 bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={moId2} onChange={e => setMoId2(e.target.value)} />
                                                                <span className="text-slate-500 font-bold text-xs">)</span>
                                                            </div>
                                                            {errors.moId && <div className="text-red-500 text-[10px] mt-1">{errors.moId}</div>}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.person.moId || '-'}</div>
                                                    )}
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
                                        <h2 className="text-sm font-bold text-slate-900">Additional Details</h2>
                                    </div>
                                    <div className="p-5 flex flex-col gap-8">

                                        {/* Bottom: Additional Details */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                Additional Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date of Birth</label>
                                                    {isEditingPerson ? (
                                                        <input type="date" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.dateOfBirth} onChange={e => setEditPersonData({ ...editPersonData, dateOfBirth: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{(() => {
                                                            return personDetail?.detail?.dateOfBirth ? formatPostgresDate(personDetail.detail.dateOfBirth) : '-';
                                                        })()}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                                                    {isEditingPerson ? (
                                                        <select className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.gender} onChange={e => setEditPersonData({ ...editPersonData, gender: e.target.value as any })}>
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                            <option value="OTHER">Other</option>
                                                        </select>
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900 capitalize">{personDetail?.detail?.gender?.toLowerCase() || '-'}</div>
                                                    )}
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Address</label>
                                                    {isEditingPerson ? (
                                                        <input type="text" className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500" value={editPersonData.address} onChange={e => setEditPersonData({ ...editPersonData, address: e.target.value })} />
                                                    ) : (
                                                        <div className="text-sm font-medium text-slate-900">{personDetail?.detail?.address || '-'}</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Search className="w-3 h-3" /> Bio</label>
                                                <textarea className={isEditingPerson ? 'w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500' : 'w-full text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100 min-h-15'}
                                                    value={isEditingPerson ? editPersonData.bio : personDetail?.detail?.bio || '-'} onChange={e => setEditPersonData({ ...editPersonData, bio: e.target.value })} rows={5} disabled={!isEditingPerson} readOnly={isEditingPerson ? false : true} />
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
                                    onClick={() => setActiveTab('opt1')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt1' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => setActiveTab('opt2')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt2' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => setActiveTab('opt3')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt3' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Other
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'opt1' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'opt2' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'opt3' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Edit Staff Modal */}
                <Modal
                    isOpen={isEditStaffModalOpen}
                    onClose={() => setIsEditStaffModalOpen(false)}
                    title="Edit Staff Information"
                    onSubmit={handleEditStaffSubmit}
                    submitLabel="UPDATE"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department / Department</label>
                            <DropdownSearch
                                value={editStaffData.departId}
                                onChange={(val) => setEditStaffData({ ...editStaffData, departId: val })}
                                disabled={!editingStaffCompanyId}
                                fetchData={async (search, page) => {
                                    if (!editingStaffCompanyId) return { content: [], totalPages: 0 };
                                    const res = await DepartmentContentService.getInstance().searchS1(search, editingStaffCompanyId, { page, size: 10 });
                                    return {
                                        content: res.content.map(o => ({ id: o.id, label: o.name })),
                                        totalPages: res.totalPages
                                    };
                                }}
                                placeholder="Search department..."
                                initialLabel={departments.find(o => o.id === editStaffData.departId)?.name || ''}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Work Type</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={editStaffData.type}
                                    onChange={(e) => setEditStaffData({ ...editStaffData, type: e.target.value as WorkType })}
                                >
                                    {Object.values(WorkType).map(wt => (
                                        <option key={wt} value={wt}>{wt.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Employee / Cust ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={editStaffData.custId}
                                    onChange={(e) => setEditStaffData({ ...editStaffData, custId: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Max Working Hours</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={editStaffData.details.maxWorkingHrs}
                                onChange={(e) => setEditStaffData({ ...editStaffData, details: { maxWorkingHrs: Number(e.target.value) } })}
                                required
                                min={1}
                            />
                        </div>
                    </div>
                </Modal>

                <Modal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    title="Assign Person to Company"
                    onSubmit={handleAssignSubmit}
                    submitLabel="ASSIGN"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company</label>
                            <DropdownSearch
                                value={assignFormData.companyId}
                                onChange={handleCompanyChange}
                                fetchData={async (search, page) => {
                                    const res = await CompanyContentService.getInstance().searchS1(search, { page, size: 10 });
                                    return {
                                        content: res.content.map(c => ({ id: c.id, label: c.nameEnglish || c.nameChinese || `Company #${c.id}` })),
                                        totalPages: res.totalPages
                                    };
                                }}
                                placeholder="Search company..."
                                initialLabel={companies.find(c => c.id === assignFormData.companyId)?.nameEnglish || companies.find(c => c.id === assignFormData.companyId)?.nameChinese || ''}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department / Department</label>
                            <DropdownSearch
                                value={assignFormData.departId}
                                onChange={(val) => setAssignFormData({ ...assignFormData, departId: val })}
                                disabled={assignFormData.companyId === 0}
                                fetchData={async (search, page) => {
                                    const res = await DepartmentContentService.getInstance().searchS1(search, assignFormData.companyId, { page, size: 10 });
                                    return {
                                        content: res.content.map(o => ({ id: o.id, label: o.name })),
                                        totalPages: res.totalPages
                                    };
                                }}
                                placeholder="Search department..."
                                initialLabel={departments.find(o => o.id === assignFormData.departId)?.name || ''}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Work Type</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={assignFormData.type}
                                    onChange={(e) => setAssignFormData({ ...assignFormData, type: e.target.value as WorkType })}
                                >
                                    {Object.values(WorkType).map(wt => (
                                        <option key={wt} value={wt}>{wt.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Employee / Cust ID</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={assignFormData.custId}
                                    onChange={(e) => setAssignFormData({ ...assignFormData, custId: e.target.value })}
                                    required
                                    placeholder="e.g. EMP-1029"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Max Working Hours</label>
                            <input
                                type="number"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={assignFormData.details.maxWorkingHrs}
                                onChange={(e) => setAssignFormData({ ...assignFormData, details: { maxWorkingHrs: Number(e.target.value) } })}
                                required
                                min={1}
                            />
                        </div>
                    </div>
                </Modal>
            </div >

            <MessageModal
                isOpen={modalMessage !== null}
                onClose={() => setModalMessage(null)}
                type={modalMessage?.type || 'error'}
                title={modalMessage?.title || 'Message'}
                message={modalMessage?.text || ''}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePerson}
                title="Delete Person"
                message="Are you sure you want to delete this person? This action cannot be undone."
            />
        </>
    );
}
