import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { OccupationCreateRequestDTO, OccupationUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { DepartmentResponseDTO, OccupationResponseDTO } from '@/models/dto/office/workforce/response.dto';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import OccupationContentService from '@/services/content/office/workforce/OccupationContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Briefcase, CheckCircle2, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Occupations() {
    const { id: companyIdStr } = useParams();
    const { currentSelectedCompany } = useCompanyStore();
    const companyId = Number(companyIdStr) || currentSelectedCompany?.id || 0;

    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");

    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(Number(pageParam)) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    const occupationContentService = OccupationContentService.getInstance();
    const departmentContentService = DepartmentContentService.getInstance();

    const [data, setData] = useState<OccupationResponseDTO[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [selectedDepartId, setSelectedDepartId] = useState<number | null>(null);
    const [selectedDepartLabel, setSelectedDepartLabel] = useState<string>('');
    const [filterDepartLabel, setFilterDepartLabel] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOccupation, setSelectedOccupation] = useState<OccupationResponseDTO | null>(null);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; text: string; title: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' });
    };

    const fetchDepartmentOptions = async (searchValue: string, pageNum: number) => {
        if (!companyId) return { content: [], totalPages: 0 };
        try {
            const res = searchValue.trim()
                ? await departmentContentService.searchS1(searchValue.trim(), companyId, { page: pageNum, size: 10 })
                : await departmentContentService.findAllS1(companyId, { page: pageNum, size: 10 });
            return {
                content: (res.content || []).map(d => ({ id: d.id, label: d.name })),
                totalPages: res.totalPages || 0,
            };
        } catch (error) {
            console.error("Failed to search departments:", error);
            return { content: [], totalPages: 0 };
        }
    };

    const [formData, setFormData] = useState<{
        name: string;
        departId: number;
        isActive: boolean;
    }>({
        name: '',
        departId: 0,
        isActive: true,
    });

    const columns: Column<OccupationResponseDTO>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (row) => <span className="font-bold text-slate-900 font-mono">{row.id}</span>,
        },
        {
            header: 'Occupation Name',
            accessorKey: 'name',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{row.name}</span>
                </div>
            ),
        },
        {
            header: 'Department',
            accessorKey: 'departId',
            cell: (row) => {
                const dept = departments.find(d => d.id === row.departId);
                return (
                    <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {dept?.name || `Dept #${row.departId}`}
                    </span>
                );
            },
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
    ];

    const fetchDepartments = async () => {
        if (!companyId) return;
        try {
            const response = await departmentContentService.findAllS1(companyId, { page: 0, size: 100 });
            setDepartments(response.content || []);
        } catch (error) {
            console.error("Failed to fetch departments for occupations:", error);
        }
    };

    const fetchOccupations = async () => {
        try {
            const response: PaginationBaseResponseDTO<OccupationResponseDTO> = await occupationContentService.search(
                selectedDepartId || undefined,
                search.trim() ? search.trim() : undefined,
                true,
                { page, size }
            );
            setData(response.content || []);
            setSize(response.pageSize || 10);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch occupations:", error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [companyId]);

    useEffect(() => {
        fetchOccupations();
    }, [selectedDepartId, page, search]);

    const handleOpenModal = (occupation?: OccupationResponseDTO) => {
        if (occupation) {
            setSelectedOccupation(occupation);
            setFormData({
                name: occupation.name,
                departId: occupation.departId,
                isActive: occupation.isActive ?? true,
            });
            const dept = departments.find(d => d.id === occupation.departId);
            setSelectedDepartLabel(dept?.name || `Dept #${occupation.departId}`);
        } else {
            setSelectedOccupation(null);
            const defaultDeptId = selectedDepartId || (departments.length > 0 ? departments[0].id : 0);
            setFormData({
                name: '',
                departId: defaultDeptId,
                isActive: true,
            });
            const dept = departments.find(d => d.id === defaultDeptId);
            setSelectedDepartLabel(dept?.name || '');
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showMessage('error', 'Occupation name is required.');
            return;
        }
        if (!selectedOccupation && !formData.departId) {
            showMessage('error', 'Please assign this occupation to a department.');
            return;
        }

        try {
            if (selectedOccupation) {
                const updatePayload: OccupationUpdateRequestDTO = {
                    name: formData.name.trim(),
                };
                const updated = await occupationContentService.update(selectedOccupation.id, updatePayload);
                setData(data.map(o => (o.id === selectedOccupation.id ? updated : o)));
                showMessage('success', 'Occupation updated successfully.');
            } else {
                const createPayload: OccupationCreateRequestDTO = {
                    departId: formData.departId,
                    name: formData.name.trim(),
                };
                const created = await occupationContentService.create(createPayload);
                setData([created, ...data]);
                showMessage('success', 'Occupation created successfully.');
            }
            setIsModalOpen(false);
            fetchOccupations();
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to save occupation.');
        }
    };

    const handleDelete = async () => {
        if (!selectedOccupation) return;
        try {
            await occupationContentService.update(selectedOccupation.id, { isActive: false });
            setData(data.filter(o => o.id !== selectedOccupation.id));
            setIsDeleteModalOpen(false);
            setIsModalOpen(false);
            showMessage('success', 'Occupation deactivated successfully.');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to deactivate occupation.');
        }
    };

    return (
        <>
            <EntityPageLayout
                title="Occupations"
                description="Manage job titles and occupational roles assigned to departments."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search occupations by name..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                    setSearchParams({
                        q: e.target.value,
                        page: "0",
                    });
                }}
                searchBarValue={search}
                icon={<Briefcase className="w-5 h-5" />}
            >
                <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Filter:</span>
                        <div className="w-56">
                            <DropdownSearch
                                value={selectedDepartId}
                                initialLabel={filterDepartLabel}
                                onChange={(id, opt) => {
                                    setSelectedDepartId(id);
                                    setFilterDepartLabel(opt?.label || '');
                                    setPage(0);
                                }}
                                fetchData={fetchDepartmentOptions}
                                placeholder="All Departments"
                            />
                        </div>
                        {selectedDepartId !== null && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDepartId(null);
                                    setFilterDepartLabel('');
                                    setPage(0);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-200 transition-colors"
                                title="Clear department filter"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="text-xs text-slate-500">
                        Total Occupations: <span className="font-bold text-slate-800 font-mono">{data.length}</span>
                    </div>
                </div>

                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    emptyMessage="No occupations configured for this company. Click 'Add New' to create one."
                    pageNumber={page + 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p - 1)}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedOccupation ? "Edit Occupation" : "Add Occupation"}
                onSubmit={handleSubmit}
                submitLabel={selectedOccupation ? "SAVE CHANGES" : "CREATE OCCUPATION"}
                onDelete={selectedOccupation ? () => setIsDeleteModalOpen(true) : undefined}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Department <span className="text-rose-500">*</span>
                        </label>
                        <DropdownSearch
                            value={formData.departId || null}
                            initialLabel={selectedDepartLabel}
                            onChange={(id, opt) => {
                                setFormData({ ...formData, departId: id });
                                if (opt) setSelectedDepartLabel(opt.label);
                            }}
                            fetchData={fetchDepartmentOptions}
                            placeholder="Select a department..."
                            disabled={!!selectedOccupation}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Occupation Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            placeholder="e.g. Security Guard, Site Supervisor"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Deactivate Occupation"
                message={`Are you sure you want to deactivate "${selectedOccupation?.name}"? Staff assignments and records linked to this occupation may be affected.`}
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
        </>
    );
}
