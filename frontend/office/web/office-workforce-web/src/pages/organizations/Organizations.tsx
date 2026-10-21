import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { OrganizationCreateRequestDTO, OrganizationUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { OrganizationResponseDTO } from '@/models/dto/office/workforce/response.dto';
import OrganizationContentService from '@/services/content/office/workforce/OrganizationContentService';
import { Building2, CheckCircle2, ChevronRight, Mail, Phone, ShieldCheck, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Organizations() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const navigate = useNavigate();

    const organizationContentService = OrganizationContentService.getInstance();
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(Number(pageParam)) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    const [data, setData] = useState<OrganizationResponseDTO[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationResponseDTO | null>(null);

    const [messageModal, setMessageModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessageModal({ isOpen: true, type, title: type === 'success' ? 'Success' : 'Error', message: text });
    };

    // Form fields
    const [nameEnglish, setNameEnglish] = useState('');
    const [nameChinese, setNameChinese] = useState('');
    const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
    const [secretaryLicenseNumber, setSecretaryLicenseNumber] = useState('');
    const [email, setEmail] = useState('');
    const [telZone, setTelZone] = useState('852');
    const [telNumber, setTelNumber] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Live validation
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

    const fetchOrganizations = async () => {
        try {
            const response: PaginationBaseResponseDTO<OrganizationResponseDTO> = await organizationContentService.search(
                search.trim() ? search.trim() : undefined,
                true,
                { page, size }
            );
            setData(response.content || []);
            setSize(response.pageSize || 10);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch organizations:", error);
        }
    };

    useEffect(() => {
        fetchOrganizations();
    }, [page, search]);

    const handleOpenCreateModal = () => {
        setNameEnglish('');
        setNameChinese('');
        setBusinessRegistrationNumber('');
        setSecretaryLicenseNumber('');
        setEmail('');
        setTelZone('852');
        setTelNumber('');
        setErrors({});
        setIsCreateModalOpen(true);
    };

    const handleOpenEditModal = (org: OrganizationResponseDTO) => {
        setSelectedOrg(org);
        setNameEnglish(org.nameEnglish || '');
        setNameChinese(org.nameChinese || '');
        setBusinessRegistrationNumber(org.businessRegistrationNumber || '');
        setSecretaryLicenseNumber(org.secretaryLicenseNumber || '');
        setEmail(org.email || '');

        if (org.tel && org.tel.startsWith('+')) {
            const parts = org.tel.substring(1).split(' ');
            if (parts.length >= 2) {
                setTelZone(parts[0].replace(/^0+/, '') || '852');
                setTelNumber(parts.slice(1).join(' '));
            } else {
                setTelZone('852');
                setTelNumber(org.tel);
            }
        } else {
            setTelZone('852');
            setTelNumber(org.tel || '');
        }

        setErrors({});
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameEnglish.trim()) {
            showMessage('error', 'English organization name is required.');
            return;
        }
        if (Object.keys(errors).length > 0) {
            showMessage('error', 'Please resolve the highlighted validation errors.');
            return;
        }

        const formattedTel = telNumber.trim() ? `+${telZone.padStart(3, '0')} ${telNumber.trim()}` : undefined;

        const payload: OrganizationCreateRequestDTO = {
            nameEnglish: nameEnglish.trim(),
            nameChinese: nameChinese.trim() ? nameChinese.trim() : undefined,
            businessRegistrationNumber: businessRegistrationNumber.trim() ? businessRegistrationNumber.trim() : undefined,
            secretaryLicenseNumber: secretaryLicenseNumber.trim() ? secretaryLicenseNumber.trim() : undefined,
            email: email.trim() ? email.trim() : undefined,
            tel: formattedTel,
        };

        try {
            const created = await organizationContentService.create(payload);
            setData([created, ...data]);
            setIsCreateModalOpen(false);
            showMessage('success', 'Organization created successfully.');
            fetchOrganizations();
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to create organization.');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrg) return;
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
        };

        try {
            const updated = await organizationContentService.update(selectedOrg.id, payload);
            setData(data.map(o => (o.id === selectedOrg.id ? updated : o)));
            setIsEditModalOpen(false);
            showMessage('success', 'Organization updated successfully.');
            fetchOrganizations();
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to update organization.');
        }
    };

    const handleDelete = async () => {
        if (!selectedOrg) return;
        try {
            await organizationContentService.delete(selectedOrg.id);
            setData(data.filter(o => o.id !== selectedOrg.id));
            setIsDeleteModalOpen(false);
            setIsEditModalOpen(false);
            showMessage('success', 'Organization deactivated successfully.');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to deactivate organization.');
        }
    };

    const columns: Column<OrganizationResponseDTO>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (row) => <span className="font-bold text-slate-900 font-mono">{row.id}</span>,
        },
        {
            header: 'Organization Name',
            accessorKey: 'nameEnglish',
            cell: (row) => (
                <div
                    onClick={() => navigate(`/organizations/${row.id}`)}
                    className="cursor-pointer group"
                >
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <span>{row.nameEnglish}</span>
                    </div>
                    {row.nameChinese && (
                        <div className="text-xs text-slate-500 pl-5">{row.nameChinese}</div>
                    )}
                </div>
            ),
        },
        {
            header: 'BR Number',
            accessorKey: 'businessRegistrationNumber',
            cell: (row) =>
                row.businessRegistrationNumber ? (
                    <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {row.businessRegistrationNumber}
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs italic">Unassigned</span>
                ),
        },
        {
            header: 'Sec. License',
            accessorKey: 'secretaryLicenseNumber',
            cell: (row) =>
                row.secretaryLicenseNumber ? (
                    <span className="font-mono text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3 text-indigo-500" />
                        {row.secretaryLicenseNumber}
                    </span>
                ) : (
                    <span className="text-slate-400 text-xs italic">-</span>
                ),
        },
        {
            header: 'Contact Channels',
            accessorKey: 'email',
            cell: (row) => (
                <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                    {row.email && (
                        <div className="flex items-center gap-1 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{row.email}</span>
                        </div>
                    )}
                    {row.tel && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span>{row.tel}</span>
                        </div>
                    )}
                    {!row.email && !row.tel && <span className="text-slate-400 italic">No contact info</span>}
                </div>
            ),
        },
        {
            header: 'Status',
            accessorKey: 'isActive',
            cell: (row) => (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                    {row.isActive ? (
                        <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-700">Active</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-500">Inactive</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            header: '',
            accessorKey: 'uid',
            cell: (row) => (
                <button
                    onClick={() => navigate(`/organizations/${row.id}`)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="View Organization Details"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            ),
        },
    ];

    return (
        <>
            <EntityPageLayout
                title="Organizations"
                description="Directory of legal corporate entities, incorporated partners, and business contacts."
                onAdd={handleOpenCreateModal}
                searchPlaceholder="Search by corporate name, BR number, license, email, or telephone..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                    setSearchParams({
                        q: e.target.value,
                        page: "0",
                    });
                }}
                searchBarValue={search}
                icon={<Building2 className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenEditModal}
                    emptyMessage="No organizations found in the directory. Click 'Add New' to create one."
                    pageNumber={page + 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p - 1)}
                />
            </EntityPageLayout>

            {/* Create Organization Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create Organization"
                onSubmit={handleCreateSubmit}
                submitLabel="CREATE ORGANIZATION"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                                English Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                                required
                                placeholder="e.g. Acme Corporation Limited"
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
                                placeholder="e.g. 頂峰企業服務有限公司"
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
                                placeholder="8 digits, e.g. 12345678"
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
                                placeholder="6 digits, e.g. 654321"
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
                            placeholder="e.g. contact@acme.com"
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
                                    placeholder="852"
                                    maxLength={3}
                                    value={telZone}
                                    onChange={(e) => setTelZone(e.target.value)}
                                    className="w-full pl-5 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                            <input
                                placeholder="e.g. 28881234"
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

            {/* Edit Organization Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Organization"
                onSubmit={handleEditSubmit}
                submitLabel="SAVE CHANGES"
                onDelete={() => setIsDeleteModalOpen(true)}
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

            {/* Delete Modal */}
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Deactivate Organization"
                message={`Are you sure you want to deactivate organization "${selectedOrg?.nameEnglish}"? This record will be soft-deleted.`}
            />

            {/* Message Notification Modal */}
            {messageModal.isOpen && (
                <MessageModal
                    isOpen={messageModal.isOpen}
                    onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
                    type={messageModal.type}
                    title={messageModal.title}
                    message={messageModal.message}
                />
            )}
        </>
    );
}
