import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { OrganizationCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { OrganizationResponseDTO } from '@/models/dto/office/workforce/response.dto';
import OrganizationContentService from '@/services/content/office/workforce/OrganizationContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Building } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function Organizations() {
    const { currentSelectedCompany } = useCompanyStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);
    const organizationContentService = OrganizationContentService.getInstance();
    const [data, setData] = useState<OrganizationResponseDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<OrganizationResponseDTO | null>(null);

    const [formData, setFormData] = useState<OrganizationCreateRequestDTO>({
        name: "",
        bio: "",
        companyId: currentSelectedCompany?.id || 0
    });

    const columns: Column<OrganizationResponseDTO>[] = [
        { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-bold text-slate-900">{row.id}</span> },
        { header: 'Name', accessorKey: "name", cell: (row) => <span className="text-slate-500 font-mono">{row.name}</span> },
        { header: 'Bio', accessorKey: 'bio', cell: (row) => <span className="text-slate-600 text-hidden">{row.bio}</span> },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {row.isActive ? "Active" : "Inactive"}
                </span>
            )
        },
    ];

    const handleOpenModal = (org?: OrganizationResponseDTO) => {
        if (org) {
            setSelectedOrg(org);
            setFormData({
                name: org.name,
                bio: org.bio,
                companyId: currentSelectedCompany?.id || 0
            });
        } else {
            setSelectedOrg(null);
            setFormData({
                name: "",
                bio: "",
                companyId: currentSelectedCompany?.id || 0
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (org: OrganizationResponseDTO) => {
        setSelectedOrg(org);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOrg) {
            const response = await organizationContentService.update(selectedOrg.id, {
                name: formData.name,
                bio: formData.bio
            });
            const newData = [...[...data].filter(d => d.id != response.id), response];
            setData(newData);
        } else {
            const response = await organizationContentService.create({
                name: formData.name,
                bio: formData.bio,
                companyId: currentSelectedCompany?.id || 0
            });
            const newData = [...[...data].filter(d => d.id != response.id), response];
            setData(newData);
        }
        setIsModalOpen(false);
    };

    const handleDeletePrompt = async () => {
        setIsDeleteModalOpen(false);
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to delete`);
        if (randomNumber.toString() === deleteModalInput) {
            handleDelete();
        } else {
            window.alert("Input Incorrect");
        }
    };

    const handleDelete = async () => {
        if (selectedOrg) {
            const response = await organizationContentService.delete(selectedOrg.id);
            setData(data.filter(d => d.id !== selectedOrg.id));
        }
        setIsDeleteModalOpen(false);
    };

    const fetchOrganizations = async () => {
        let response: PaginationBaseResponseDTO<OrganizationResponseDTO>;
        if (!search || search.trim() === "") {
            response = await organizationContentService.findAllS1(currentSelectedCompany?.id || 0, { page, size });
        } else {
            response = await organizationContentService.searchS1(search, currentSelectedCompany?.id || 0, { page, size });
        }
        settleResponseContent(response)
    }

    const settleResponseContent = (response: PaginationBaseResponseDTO<OrganizationResponseDTO>) => {
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        fetchOrganizations();
    }, [currentSelectedCompany?.id, page, search])

    return (
        <>
            <EntityPageLayout
                title="Organizations"
                description="Manage hierarchical departments and divisions within the company."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search organizations..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setSearchParams({
                        q: e.target.value,
                        page: String(page)
                    })
                }}
                searchBarValue={search}
                icon={<Building className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDelete}
                    emptyMessage="No organizations found."
                    pageNumber={1}
                    totalPages={1}
                    onPageChange={(p) => setPage(p)}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedOrg ? "Edit Organization" : "Add Organization"}
                onSubmit={handleSubmit}
                submitLabel={selectedOrg ? "SAVE CHANGES" : "CREATE"}
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
                title="Delete Organization"
                message={`Are you sure you want to delete ${selectedOrg?.name}? This action cannot be undone.`}
            />
        </>
    );
}
