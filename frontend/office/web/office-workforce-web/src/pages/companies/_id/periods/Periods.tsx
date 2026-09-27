import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { WorkingPeriodCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { DepartmentResponseDTO, WorkingPeriodResponseDTO } from '@/models/dto/office/workforce/response.dto';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import WorkingPeriodContentService from '@/services/content/office/workforce/WorkingPeriodContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Periods() {
    const { id: companyIdStr } = useParams();
    const companyId = Number(companyIdStr);
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const workingPeriodContentService = WorkingPeriodContentService.getInstance();
    const departmentContentService = DepartmentContentService.getInstance();

    const [data, setData] = useState<WorkingPeriodResponseDTO[]>([]);
    const { currentSelectedCompany } = useCompanyStore();
    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [selectedDepartId, setSelectedDepartId] = useState<number | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<WorkingPeriodResponseDTO | null>(null);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };

    const [formData, setFormData] = useState<WorkingPeriodCreateRequestDTO>({ name: '', startAt: '09:00:00', endAt: '17:00:00', departId: 0 });

    const columns: Column<WorkingPeriodResponseDTO>[] = [
        { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-bold text-slate-900">{row.id}</span> },
        { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
        { header: 'Start Time', accessorKey: 'startAt', cell: (row) => <span className="text-slate-500 font-mono">{row.startAt}</span> },
        { header: 'End Time', accessorKey: 'endAt', cell: (row) => <span className="text-slate-500 font-mono">{row.endAt}</span> },
    ];

    const fetchDepartments = async () => {
        if (Number.isNaN(companyId)) return;
        const response = await departmentContentService.findAllS1(companyId, { page: 0, size: 100 });
        setDepartments(response.content);
        if (response.content.length > 0 && selectedDepartId === null) {
            setSelectedDepartId(response.content[0].id);
        }
    };

    const fetchPeriods = async () => {
        if (!selectedDepartId) return;
        let response: PaginationBaseResponseDTO<WorkingPeriodResponseDTO>;
        if (!search || search.trim() === "") {
            response = await workingPeriodContentService.findAllS1(selectedDepartId, { page, size });
        } else {
            response = await workingPeriodContentService.searchS1(search, selectedDepartId, { page, size });
        }
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        fetchDepartments();
    }, [companyId]);

    useEffect(() => {
        if (selectedDepartId) {
            fetchPeriods();
        }
    }, [selectedDepartId, page, search]);

    const handleOpenModal = (period?: WorkingPeriodResponseDTO) => {
        if (period) {
            setSelectedPeriod(period);
            setFormData({ name: period.name, startAt: period.startAt, endAt: period.endAt, departId: period.departId });
        } else {
            setSelectedPeriod(null);
            setFormData({ name: '', startAt: '09:00:00', endAt: '17:00:00', departId: selectedDepartId || (departments.length > 0 ? departments[0].id : 0) });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedPeriod) {
                const response = await workingPeriodContentService.update(selectedPeriod.id, formData);
                setData([...data.filter(d => d.id !== selectedPeriod.id), response]);
                showMessage('success', 'Working period updated successfully.');
            } else {
                const response = await workingPeriodContentService.create(formData);
                setData([...data.filter(d => d.id !== response.id), response]);
                showMessage('success', 'Working period created successfully.');
            }
            setIsModalOpen(false);
            fetchPeriods();
        } catch (error: any) {
            console.error("Failed to save working period", error);
            showMessage('error', error?.message || 'Failed to save working period.');
        }
    };

    const handleDeletePrompt = async () => {
        setIsDeleteModalOpen(false);
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to delete`);
        if (randomNumber.toString() === deleteModalInput) {
            handleDelete();
        } else {
            showMessage('error', "Input Incorrect. Deletion cancelled.");
        }
    };

    const handleDelete = async () => {
        try {
            if (selectedPeriod) {
                await workingPeriodContentService.delete(selectedPeriod.id);
                setData(data.filter(d => d.id !== selectedPeriod.id));
                showMessage('success', 'Working period deleted successfully.');
            }
            setIsDeleteModalOpen(false);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to delete working period", error);
            showMessage('error', error?.message || 'Failed to delete working period.');
        }
    };

    return (
        <>
            <EntityPageLayout
                title="Working Periods"
                description="Define standard shifts, schedules, and flexible working hours."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search periods..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setSearchParams({ q: e.target.value, page: String(page) });
                }}
                searchBarValue={search}
                icon={<Clock className="w-5 h-5" />}
            >
                <div className="mb-4 flex items-center gap-4">
                    <label className="text-xs ms-4 pt-3 font-bold text-slate-500 uppercase tracking-wider">Select Department:</label>
                    <div className="w-64 mt-3">
                        <DropdownSearch
                            value={selectedDepartId}
                            onChange={(val) => {
                                setSelectedDepartId(val);
                                setPage(0);
                            }}
                            fetchData={async (search, page) => {
                                if (!currentSelectedCompany?.id) return { content: [], totalPages: 0 };
                                const res = await DepartmentContentService.getInstance().searchS1(search, currentSelectedCompany.id, { page, size: 10 });
                                return {
                                    content: res.content.map(o => ({ id: o.id, label: o.name })),
                                    totalPages: res.totalPages
                                };
                            }}
                            placeholder="Select department..."
                            initialLabel={departments.find(o => o.id === selectedDepartId)?.name || ''}
                        />
                    </div>
                </div>

                {departments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                        Please create an department first to manage working periods.
                    </div>
                ) : (
                    <DataTable
                        data={data}
                        columns={columns}
                        onEdit={handleOpenModal}
                        emptyMessage="No working periods found."
                        pageNumber={page + 1}
                        totalPages={totalPages}
                        onPageChange={(p) => setPage(p - 1)}
                    />
                )}
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPeriod ? "Edit Working Period" : "Add Working Period"}
                onSubmit={handleSubmit}
                submitLabel={selectedPeriod ? "SAVE" : "CREATE"}
                onDelete={selectedPeriod ? () => setIsDeleteModalOpen(true) : undefined}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
                        <DropdownSearch
                            value={formData.departId}
                            onChange={(val) => setFormData({ ...formData, departId: val })}
                            disabled={!!selectedPeriod}
                            fetchData={async (search, page) => {
                                if (!currentSelectedCompany?.id) return { content: [], totalPages: 0 };
                                const res = await DepartmentContentService.getInstance().searchS1(search, currentSelectedCompany.id, { page, size: 10 });
                                return {
                                    content: res.content.map(o => ({ id: o.id, label: o.name })),
                                    totalPages: res.totalPages
                                };
                            }}
                            placeholder="Select department..."
                            initialLabel={departments.find(o => o.id === formData.departId)?.name || ''}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                            <input type="time" step="1" required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono" value={formData.startAt} onChange={e => setFormData({ ...formData, startAt: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Time</label>
                            <input type="time" step="1" required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono" value={formData.endAt} onChange={e => setFormData({ ...formData, endAt: e.target.value })} />
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePrompt}
                title="Delete Period"
                message={`Are you sure you want to delete ${selectedPeriod?.name}?`}
            />

            <MessageModal
                isOpen={modalMessage !== null}
                onClose={() => setModalMessage(null)}
                type={modalMessage?.type || 'error'}
                title={modalMessage?.title || 'Message'}
                message={modalMessage?.text || ''}
            />
        </>
    );
}
