import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { DepartmentCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { DepartmentResponseDTO } from '@/models/dto/office/workforce/response.dto';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Group } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Departments() {
    const { currentSelectedCompany } = useCompanyStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const departmentContentService = DepartmentContentService.getInstance();
    const [data, setData] = useState<DepartmentResponseDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDepart, setSelectedDepart] = useState<DepartmentResponseDTO | null>(null);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);

    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };

    const [formData, setFormData] = useState<DepartmentCreateRequestDTO>({
        name: "",
        bio: "",
        companyId: currentSelectedCompany?.id || 0
    });

    const columns: Column<DepartmentResponseDTO>[] = [
        { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-bold text-slate-900">{row.id}</span> },
        { header: 'Name', accessorKey: "name", cell: (row) => <span className="text-slate-500 font-mono">{row.name}</span> },
        { header: 'Bio', accessorKey: 'bio', cell: (row) => <span className="text-slate-600 text-hidden">{row.bio}</span> },
    ];

    const handleOpenModal = (depart?: DepartmentResponseDTO) => {
        if (depart) {
            setSelectedDepart(depart);
            setFormData({
                name: depart.name,
                bio: depart.bio,
                companyId: currentSelectedCompany?.id || 0
            });
        } else {
            setSelectedDepart(null);
            setFormData({
                name: "",
                bio: "",
                companyId: currentSelectedCompany?.id || 0
            });
        }
        setIsModalOpen(true);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedDepart) {
                const response = await departmentContentService.update(selectedDepart.id, {
                    name: formData.name,
                    bio: formData.bio
                });
                const newData = [...[...data].filter(d => d.id != response.id), response];
                setData(newData);
                showMessage('success', 'Department updated successfully.');
            } else {
                const response = await departmentContentService.create({
                    name: formData.name,
                    bio: formData.bio,
                    companyId: currentSelectedCompany?.id || 0
                });
                const newData = [...[...data].filter(d => d.id != response.id), response];
                setData(newData);
                showMessage('success', 'Department created successfully.');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to save department", error);
            showMessage('error', error?.message || 'Failed to save department.');
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
            if (selectedDepart) {
                await departmentContentService.delete(selectedDepart.id);
                setData(data.filter(d => d.id !== selectedDepart.id));
                showMessage('success', 'Department deleted successfully.');
            }
            setIsDeleteModalOpen(false);
            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to delete department", error);
            showMessage('error', error?.message || 'Failed to delete department.');
        }
    };

    const fetchDepartments = async () => {
        let response: PaginationBaseResponseDTO<DepartmentResponseDTO>;
        if (!search || search.trim() === "") {
            response = await departmentContentService.findAllS1(currentSelectedCompany?.id || 0, { page, size });
        } else {
            response = await departmentContentService.searchS1(search, currentSelectedCompany?.id || 0, { page, size });
        }
        settleResponseContent(response)
    }

    const settleResponseContent = (response: PaginationBaseResponseDTO<DepartmentResponseDTO>) => {
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        fetchDepartments();
    }, [currentSelectedCompany?.id, page, search])

    return (
        <>
            <EntityPageLayout
                title="Departments"
                description="Manage hierarchical departments and divisions within the company."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search departments..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setSearchParams({
                        q: e.target.value,
                        page: String(page)
                    })
                }}
                searchBarValue={search}
                icon={<Group className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    emptyMessage="No departments found."
                    pageNumber={1}
                    totalPages={1}
                    onPageChange={(p) => setPage(p)}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedDepart ? "Edit Department" : "Add Department"}
                onSubmit={handleSubmit}
                submitLabel={selectedDepart ? "SAVE CHANGES" : "CREATE"}
                onDelete={selectedDepart ? () => setIsDeleteModalOpen(true) : undefined}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                        <input
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bio / Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePrompt}
                title="Delete Department"
                message={`Are you sure you want to delete ${selectedDepart?.name}? This action cannot be undone.`}
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
