import { DeleteModal } from '@/components/ui/DeleteModal';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { formatPostgresDate } from '@/lib/utils';
import { OrganizationDetailRequestDTO, OrganizationUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { OrganizationDetailResponseDTO, OrganizationResponseDTO } from '@/models/dto/office/workforce/response.dto';
import OrganizationContentService from '@/services/content/office/workforce/OrganizationContentService';
import OrganizationDetailContentService from '@/services/content/office/workforce/OrganizationDetailContentService';
import {
    ArrowLeft,
    Building2,
    Calendar,
    CheckCircle2,
    Clock, Edit2,
    FileText,
    History,
    Mail,
    Phone, ShieldCheck,
    Trash2,
    UserCheck,
    XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function OrganizationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const organizationContentService = OrganizationContentService.getInstance();
    const organizationDetailContentService = OrganizationDetailContentService.getInstance();

    const [organization, setOrganization] = useState<OrganizationResponseDTO | null>(null);
    const [details, setDetails] = useState<OrganizationDetailResponseDTO | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [copiedUid, setCopiedUid] = useState<boolean>(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);

    const [messageModal, setMessageModal] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessageModal({ isOpen: true, type, title: type === 'success' ? 'Success' : 'Error', message: text });
    };

    // Edit form states
    const [nameEnglish, setNameEnglish] = useState('');
    const [nameChinese, setNameChinese] = useState('');
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
    const [secretaryLicenseNumber, setSecretaryLicenseNumber] = useState('');
    const [email, setEmail] = useState('');
    const [telZone, setTelZone] = useState('852');
    const [telNumber, setTelNumber] = useState('');
    const [isActiveStatus, setIsActiveStatus] = useState<boolean>(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Details form states
    const [detailsBio, setDetailsBio] = useState('');
    const [detailsAddress, setDetailsAddress] = useState('');
    const [detailsIndustry, setDetailsIndustry] = useState('');
    const [detailsWebsite, setDetailsWebsite] = useState('');

    const fetchOrganization = async () => {
        if (!id || Number.isNaN(Number(id))) {
            navigate('/organizations');
            return;
        }

        setIsLoading(true);
        try {
            const org = await organizationContentService.findById(Number(id));
            setOrganization(org);
        } catch (error) {
            console.error("Failed to load organization:", error);
            navigate('/organizations');
        } finally {
            setIsLoading(false);
        }

        try {
            const detail = await organizationDetailContentService.findByOrgId(Number(id));
            setDetails(detail);
        } catch {
            setDetails(null);
        }
    };

    useEffect(() => {
        fetchOrganization();
    }, [id]);

    // Validation
    useEffect(() => {
        const newErrors: Record<string, string> = {};

        if (businessRegistrationNumber && !/^[0-9]{8}$/.test(businessRegistrationNumber.trim())) {
            newErrors.businessRegistrationNumber = "Business Registration Number must be exactly 8 digits.";
        }

        if (secretaryLicenseNumber && !/^[0-9]{6}$/.test(secretaryLicenseNumber.trim())) {
            newErrors.secretaryLicenseNumber = "Secretary License Number must be exactly 6 digits.";
        }

        if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
            newErrors.email = "Invalid email format.";
        }

        if (telNumber) {
            const formattedTel = `+${telZone.padStart(3, '0')} ${telNumber.trim()}`;
            if (!/^[+]([0-9]){3}\s([0-9])+$/.test(formattedTel)) {
                newErrors.tel = "Invalid telephone format. Example: +852 28881234";
            }
        }

        setErrors(newErrors);
    }, [businessRegistrationNumber, secretaryLicenseNumber, email, telZone, telNumber]);

    const handleOpenEditModal = () => {
        if (!organization) return;
        setNameEnglish(organization.nameEnglish || '');
        setNameChinese(organization.nameChinese || '');
        setBusinessRegistrationNumber(organization.businessRegistrationNumber || '');
        setSecretaryLicenseNumber(organization.secretaryLicenseNumber || '');
        setEmail(organization.email || '');
        setIsActiveStatus(organization.isActive ?? true);

        if (organization.tel && organization.tel.startsWith('+')) {
            const parts = organization.tel.substring(1).split(' ');
            if (parts.length >= 2) {
                setTelZone(parts[0].replace(/^0+/, '') || '852');
                setTelNumber(parts.slice(1).join(' '));
            } else {
                setTelZone('852');
                setTelNumber(organization.tel);
            }
        } else {
            setTelZone('852');
            setTelNumber(organization.tel || '');
        }

        setErrors({});
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!organization) return;
        if (!nameEnglish.trim()) {
            showMessage('error', 'English organization name is required.');
            return;
        }
        if (Object.keys(errors).length > 0) {
            showMessage('error', 'Please resolve the highlighted validation errors.');
            return;
        }

        const formattedTel = telNumber.trim() ? `+${telZone.padStart(3, '0')} ${telNumber.trim()}` : undefined;

        const payload: OrganizationUpdateRequestDTO = {
            nameEnglish: nameEnglish.trim(),
            nameChinese: nameChinese.trim() ? nameChinese.trim() : undefined,
            businessRegistrationNumber: businessRegistrationNumber.trim() ? businessRegistrationNumber.trim() : undefined,
            secretaryLicenseNumber: secretaryLicenseNumber.trim() ? secretaryLicenseNumber.trim() : undefined,
            email: email.trim() ? email.trim() : undefined,
            tel: formattedTel,
            isActive: isActiveStatus,
        };

        try {
            const updated = await organizationContentService.update(organization.id, payload);
            setOrganization(updated);
            setIsEditModalOpen(false);
            showMessage('success', 'Organization updated successfully.');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to update organization.');
        }
    };

    const handleOpenDetailsModal = () => {
        setDetailsBio(details?.bio || '');
        setDetailsAddress(details?.address || '');
        setDetailsIndustry(details?.industry || '');
        setDetailsWebsite(details?.website || '');
        setIsDetailsModalOpen(true);
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        const payload: OrganizationDetailRequestDTO = {
            bio: detailsBio.trim() ? detailsBio.trim() : undefined,
            address: detailsAddress.trim() ? detailsAddress.trim() : undefined,
            industry: detailsIndustry.trim() ? detailsIndustry.trim() : undefined,
            website: detailsWebsite.trim() ? detailsWebsite.trim() : undefined,
        };

        try {
            const updated = await organizationDetailContentService.upsert(Number(id), payload);
            setDetails(updated);
            setIsDetailsModalOpen(false);
            showMessage('success', 'Organization details saved successfully.');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to save organization details.');
        }
    };

    const handleDelete = async () => {
        if (!organization) return;
        try {
            await organizationContentService.delete(organization.id);
            setIsDeleteModalOpen(false);
            navigate('/organizations');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to deactivate organization.');
        }
    };


    if (isLoading) {
        return (
            <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
                <div className="text-slate-400 text-xs font-medium animate-pulse flex items-center gap-2">
                    <Building2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Loading organization profile...</span>
                </div>
            </div>
        );
    }

    if (!organization) {
        return null;
    }

    return (
        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 flex flex-col gap-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/organizations')}
                        className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm"
                        title="Back to Organizations"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                                {organization.nameEnglish}
                            </h1>
                            {organization.isActive ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Active
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                    <XCircle className="w-3 h-3 text-slate-400" />
                                    Inactive
                                </span>
                            )}
                        </div>
                        {organization.nameChinese && (
                            <p className="text-xs text-slate-500 mt-0.5">{organization.nameChinese}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenEditModal}
                        className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        Edit Profile
                    </button>
                    <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        Deactivate
                    </button>
                </div>
            </div>

            {/* Grid of Profile Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Identity & Corporate Profile */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <Building2 className="w-4 h-4 text-indigo-600" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Corporate Identity
                            </h2>
                        </div>

                        <div className="space-y-3.5">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Internal System ID
                                </span>
                                <span className="text-xs font-mono font-bold text-slate-900">
                                    {organization.id}
                                </span>
                            </div>

                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Registered English Name
                                </span>
                                <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                                    {organization.nameEnglish}
                                </span>
                            </div>

                            {organization.nameChinese && (
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Registered Chinese Name
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                                        {organization.nameChinese}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Business Registration & Compliance */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                Compliance & Legal Registration
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Business Registration Number (BRN)
                                    </span>
                                    {organization.businessRegistrationNumber ? (
                                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-medium flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            HK 8-Digit Format Valid
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Not Provided</span>
                                    )}
                                </div>
                                <div className="font-mono text-base font-bold text-slate-900">
                                    {organization.businessRegistrationNumber || '—'}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Inland Revenue Department Business Registration certificate identifier.
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Company Secretary License Number (SLN)
                                    </span>
                                    {organization.secretaryLicenseNumber ? (
                                        <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-medium flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                                            TCSP 6-Digit License Valid
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 italic">Not Provided</span>
                                    )}
                                </div>
                                <div className="font-mono text-base font-bold text-slate-900">
                                    {organization.secretaryLicenseNumber || '—'}
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                    Trust or Company Service Provider (TCSP) authorized license.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-1">

                    </div>
                </div>

                {/* 3. Verified Contact Channels */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Contact Channels
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                <Phone className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Official Telephone
                                </span>
                                {organization.tel ? (
                                    <a
                                        href={`tel:${organization.tel.replace(/\s+/g, '')}`}
                                        className="font-mono text-xs font-semibold text-indigo-600 hover:underline block mt-0.5"
                                    >
                                        {organization.tel}
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic mt-0.5 block">
                                        No telephone recorded
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                <Mail className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Corporate Email
                                </span>
                                {organization.email ? (
                                    <a
                                        href={`mailto:${organization.email}`}
                                        className="text-xs font-semibold text-indigo-600 hover:underline block mt-0.5"
                                    >
                                        {organization.email}
                                    </a>
                                ) : (
                                    <span className="text-xs text-slate-400 italic mt-0.5 block">
                                        No email recorded
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. System Audit Metadata */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
                        <History className="w-4 h-4 text-indigo-600" />
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            System Audit & Metadata
                        </h2>
                    </div>

                    <div className="space-y-3.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                Created Timestamp:
                            </span>
                            <span className="font-mono text-slate-800 font-medium">
                                {organization.createdAt ? formatPostgresDate(organization.createdAt) : '—'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                Last Updated:
                            </span>
                            <span className="font-mono text-slate-800 font-medium">
                                {organization.updatedAt ? formatPostgresDate(organization.updatedAt) : '—'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                Created By (User ID):
                            </span>
                            <span className="font-mono text-slate-800 font-medium">
                                {organization.createdBy !== undefined && organization.createdBy !== null ? `User #${organization.createdBy}` : 'System'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                Updated By (User ID):
                            </span>
                            <span className="font-mono text-slate-800 font-medium">
                                {organization.updatedBy !== undefined && organization.updatedBy !== null ? `User #${organization.updatedBy}` : '—'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        </div>
                    </div>
                </div>

                {/* 5. Organization Details */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Organization Details
                                </h2>
                            </div>
                            <button
                                onClick={handleOpenDetailsModal}
                                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-colors flex items-center gap-1.5"
                            >
                                <Edit2 className="w-3 h-3 text-slate-500" />
                                Edit Details
                            </button>
                        </div>

                        {details ? (
                            <div className="space-y-3.5">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Bio
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900 block mt-0.5 whitespace-pre-wrap">
                                        {details.bio || '—'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Address
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900 block mt-0.5 whitespace-pre-wrap">
                                        {details.address || '—'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Industry
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900 block mt-0.5">
                                        {details.industry || '—'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                        Website
                                    </span>
                                    {details.website ? (
                                        <a
                                            href={details.website}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-semibold text-indigo-600 hover:underline block mt-0.5 break-all"
                                        >
                                            {details.website}
                                        </a>
                                    ) : (
                                        <span className="text-xs font-semibold text-slate-900 block mt-0.5">—</span>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 italic">No details recorded</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Organization Profile"
                onSubmit={handleEditSubmit}
                submitLabel="SAVE CHANGES"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                English Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                value={nameEnglish}
                                onChange={(e) => setNameEnglish(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                Chinese Name
                            </label>
                            <input
                                value={nameChinese}
                                onChange={(e) => setNameChinese(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                Business Reg. No. (BRN)
                            </label>
                            <input
                                maxLength={8}
                                value={businessRegistrationNumber}
                                onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.businessRegistrationNumber && (
                                <p className="text-[10px] text-rose-500 mt-1">{errors.businessRegistrationNumber}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                Secretary License No. (SLN)
                            </label>
                            <input
                                maxLength={6}
                                value={secretaryLicenseNumber}
                                onChange={(e) => setSecretaryLicenseNumber(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            {errors.secretaryLicenseNumber && (
                                <p className="text-[10px] text-rose-500 mt-1">{errors.secretaryLicenseNumber}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {errors.email && (
                            <p className="text-[10px] text-rose-500 mt-1">{errors.email}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Telephone Number
                        </label>
                        <div className="flex gap-2">
                            <div className="w-24 relative">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">+</span>
                                <input
                                    maxLength={3}
                                    value={telZone}
                                    onChange={(e) => setTelZone(e.target.value)}
                                    className="w-full pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <input
                                value={telNumber}
                                onChange={(e) => setTelNumber(e.target.value)}
                                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                        {errors.tel && (
                            <p className="text-[10px] text-rose-500 mt-1">{errors.tel}</p>
                        )}
                    </div>
                </div>
            </Modal>

            {/* Edit Details Modal */}
            <Modal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                title="Edit Organization Details"
                onSubmit={handleDetailsSubmit}
                submitLabel="SAVE CHANGES"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Bio
                        </label>
                        <textarea
                            rows={4}
                            value={detailsBio}
                            onChange={(e) => setDetailsBio(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Address
                        </label>
                        <textarea
                            rows={3}
                            value={detailsAddress}
                            onChange={(e) => setDetailsAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Industry
                        </label>
                        <input
                            value={detailsIndustry}
                            onChange={(e) => setDetailsIndustry(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                            Website
                        </label>
                        <input
                            type="url"
                            value={detailsWebsite}
                            onChange={(e) => setDetailsWebsite(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Deactivate Organization"
                message={`Are you sure you want to deactivate organization "${organization.nameEnglish}"? This record will be soft-deleted and removed from active directories.`}
            />

            {/* Message Modal */}
            {messageModal.isOpen && (
                <MessageModal
                    isOpen={messageModal.isOpen}
                    onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
                    type={messageModal.type}
                    title={messageModal.title}
                    message={messageModal.message}
                />
            )}
        </div>
    );
}
