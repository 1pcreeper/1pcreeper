import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { WorkType } from '@/models/dto/office/workforce/enum.dto';
import { StaffCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { StaffResponseDTO } from '@/models/dto/office/workforce/response.dto';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Staffs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const navigate = useNavigate();
    const { currentSelectedCompany } = useCompanyStore();
    const companyId = currentSelectedCompany?.id || 0;
    const [data, setData] = useState<StaffResponseDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);
    const staffContentService = StaffContentService.getInstance();
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [formData, setFormData] = useState<StaffCreateRequestDTO>({
        companyId: companyId,
        personId: 0,
        departId: 0,
        custId: '',
        type: WorkType.FULL_TIME,
        details: { maxWorkingHrs: 40 }
    });

    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };

    const columns: Column<StaffResponseDTO>[] = [
        { header: 'Staff ID', accessorKey: 'id', cell: (row) => <span className="text-slate-900 font-bold ">{row.id}</span> },
        { header: 'Name', accessorKey: 'personNameEnglish', cell: (row) => <span className="font-bold text-slate-900">{staffContentService.getDisplayName(row)}</span> },
        { header: 'Department', accessorKey: 'departName', cell: (row) => <span className="text-slate-600">{row.departName}</span> },
        { header: 'Person ID', accessorKey: 'personId', cell: (row) => <span className="text-slate-500">{row.personId}</span> }
    ];

    const fetchStaffs = async () => {
        let response: PaginationBaseResponseDTO<StaffResponseDTO>;
        if (!search || search.trim() === "") {
            response = await staffContentService.findAllS1(companyId, { page, size });
            settleResponseContent(response);
        }
        else {
            response = await staffContentService.searchS1(search, companyId, { page, size });
            settleResponseContent(response);
        }
    };

    const settleResponseContent = (response: PaginationBaseResponseDTO<StaffResponseDTO>) => {
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        if (companyId > 0) {
            setFormData(prev => ({ ...prev, companyId }));
            fetchStaffs();
        }
    }, [search, page, companyId]);

    const handleCreateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await staffContentService.create(formData);
            setIsModalOpen(false);
            showMessage('success', 'Staff assigned successfully.');
            setFormData({
                companyId: companyId,
                personId: 0,
                departId: 0,
                custId: '',
                type: WorkType.FULL_TIME,
                details: { maxWorkingHrs: 40 }
            });
            fetchStaffs();
        } catch (error: any) {
            console.error("Failed to assign staff", error);
            showMessage('error', error?.message || 'Failed to assign staff.');
        }
    };

    return (
        <>
            <EntityPageLayout
                onAdd={() => setIsModalOpen(true)}
                title="Staff"
                description="Manage personnel records, roles, and employment status."
                searchPlaceholder="Search staff by name or role..."
                icon={<Users className="w-5 h-5" />}
                searchBarValue={search}
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setSearchParams({
                        q: e.target.value,
                        page: String(page)
                    })
                }}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onRowClick={(staff) => navigate(`/staffs/${staff.id}`)}
                    emptyMessage="No staff members found."
                    pageNumber={page}
                    totalPages={totalPages}
                    onPageChange={p => setPage(p)}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Assign Person to Staff"
                onSubmit={handleCreateStaff}
                submitLabel="ASSIGN"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Person</label>
                        <DropdownSearch
                            value={formData.personId}
                            onChange={(val) => setFormData({ ...formData, personId: val })}
                            fetchData={async (searchTerm, pageNum) => {
                                const res = await PersonContentService.getInstance().searchS1(searchTerm, { page: pageNum, size: 10 });
                                return {
                                    content: res.content.map(p => ({ id: p.id, label: `${p.nameEnglish || ''} ${p.nameChinese || ''} (ID: ${p.id})`.trim() })),
                                    totalPages: res.totalPages
                                };
                            }}
                            placeholder="Search person..."
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department / Department</label>
                        <DropdownSearch
                            value={formData.departId}
                            onChange={(val) => setFormData({ ...formData, departId: val })}
                            fetchData={async (searchTerm, pageNum) => {
                                const res = await DepartmentContentService.getInstance().searchS1(searchTerm, companyId, { page: pageNum, size: 10 });
                                return {
                                    content: res.content.map(o => ({ id: o.id, label: o.name })),
                                    totalPages: res.totalPages
                                };
                            }}
                            placeholder="Search department..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Work Type</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkType })}
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
                                value={formData.custId}
                                onChange={(e) => setFormData({ ...formData, custId: e.target.value })}
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
                            value={formData.details.maxWorkingHrs}
                            onChange={(e) => setFormData({ ...formData, details: { maxWorkingHrs: Number(e.target.value) } })}
                            required
                            min={1}
                        />
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
        </>
    );
}
