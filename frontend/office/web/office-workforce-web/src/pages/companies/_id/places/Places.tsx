import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { DropdownSearch } from '@/components/ui/DropdownSearch';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { PlaceCreateRequestDTO, PlaceUpdateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { DepartmentResponseDTO, PlaceResponseDTO } from '@/models/dto/office/workforce/response.dto';
import DepartmentContentService from '@/services/content/office/workforce/DepartmentContentService';
import PlaceContentService from '@/services/content/office/workforce/PlaceContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { CheckCircle2, MapPin, X, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export default function Places() {
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

    const placeContentService = PlaceContentService.getInstance();
    const departmentContentService = DepartmentContentService.getInstance();

    const [data, setData] = useState<PlaceResponseDTO[]>([]);
    const [departments, setDepartments] = useState<DepartmentResponseDTO[]>([]);
    const [selectedDepartId, setSelectedDepartId] = useState<number | null>(null);
    const [selectedDepartLabel, setSelectedDepartLabel] = useState<string>('');
    const [filterDepartLabel, setFilterDepartLabel] = useState<string>('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<PlaceResponseDTO | null>(null);
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
        address: string;
        departId: number;
        isActive: boolean;
    }>({
        name: '',
        address: '',
        departId: 0,
        isActive: true,
    });

    const columns: Column<PlaceResponseDTO>[] = [
        {
            header: 'ID',
            accessorKey: 'id',
            cell: (row) => <span className="font-bold text-slate-900 font-mono">{row.id}</span>,
        },
        {
            header: 'Place Name',
            accessorKey: 'name',
            cell: (row) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{row.name}</span>
                </div>
            ),
        },
        {
            header: 'Department',
            accessorKey: 'departName',
            cell: (row) => (
                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {row.departName || `Dept #${row.departId}`}
                </span>
            ),
        },
        {
            header: 'Physical Address',
            accessorKey: 'address',
            cell: (row) => <span className="text-slate-600 truncate max-w-xs block">{row.address || '-'}</span>,
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
            console.error("Failed to fetch departments for places:", error);
        }
    };

    const fetchPlaces = async () => {
        if (!companyId) return;
        try {
            const response: PaginationBaseResponseDTO<PlaceResponseDTO> = await placeContentService.search(
                selectedDepartId || undefined,
                search.trim() ? search.trim() : undefined,
                true,
                { page, size },
                companyId
            );
            setData(response.content || []);
            setSize(response.pageSize || 10);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch places:", error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, [companyId]);

    useEffect(() => {
        fetchPlaces();
    }, [companyId, selectedDepartId, page, search]);

    const handleOpenModal = (place?: PlaceResponseDTO) => {
        if (place) {
            setSelectedPlace(place);
            setFormData({
                name: place.name,
                address: place.address || '',
                departId: place.departId,
                isActive: place.isActive ?? true,
            });
            const dept = departments.find(d => d.id === place.departId);
            setSelectedDepartLabel(place.departName || dept?.name || `Dept #${place.departId}`);
        } else {
            setSelectedPlace(null);
            const defaultDeptId = selectedDepartId || (departments.length > 0 ? departments[0].id : 0);
            setFormData({
                name: '',
                address: '',
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
            showMessage('error', 'Place name is required.');
            return;
        }
        if (!formData.departId) {
            showMessage('error', 'Please assign this place to a department.');
            return;
        }

        try {
            if (selectedPlace) {
                const updatePayload: PlaceUpdateRequestDTO = {
                    name: formData.name.trim(),
                    address: formData.address.trim(),
                    departId: formData.departId,
                };
                const updated = await placeContentService.update(selectedPlace.id, updatePayload);
                setData(data.map(p => (p.id === selectedPlace.id ? updated : p)));
                showMessage('success', 'Place updated successfully.');
            } else {
                const createPayload: PlaceCreateRequestDTO = {
                    name: formData.name.trim(),
                    address: formData.address.trim(),
                    departId: formData.departId,
                };
                const created = await placeContentService.create(createPayload);
                setData([created, ...data]);
                showMessage('success', 'Place created successfully.');
            }
            setIsModalOpen(false);
            fetchPlaces();
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to save place.');
        }
    };

    const handleDelete = async () => {
        if (!selectedPlace) return;
        try {
            await placeContentService.delete(selectedPlace.id);
            setData(data.filter(p => p.id !== selectedPlace.id));
            setIsDeleteModalOpen(false);
            setIsModalOpen(false);
            showMessage('success', 'Place deleted successfully.');
        } catch (error: any) {
            showMessage('error', error?.message || 'Failed to delete place.');
        }
    };

    return (
        <>
            <EntityPageLayout
                title="Places"
                description="Manage operational facilities, work sites, and physical company locations."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search places by name or address..."
                onSearchBarChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                    setSearchParams({
                        q: e.target.value,
                        page: "0",
                    });
                }}
                searchBarValue={search}
                icon={<MapPin className="w-5 h-5" />}
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
                        Total Sites: <span className="font-bold text-slate-800 font-mono">{data.length}</span>
                    </div>
                </div>

                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    emptyMessage="No places configured for this company. Click 'Add New' to create one."
                    pageNumber={page + 1}
                    totalPages={totalPages}
                    onPageChange={(p) => setPage(p - 1)}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPlace ? "Edit Place" : "Add Place"}
                onSubmit={handleSubmit}
                submitLabel={selectedPlace ? "SAVE CHANGES" : "CREATE PLACE"}
                onDelete={selectedPlace ? () => setIsDeleteModalOpen(true) : undefined}
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
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Place Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            required
                            placeholder="e.g. Central Bank Plaza, Headquarters"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                            Physical Address
                        </label>
                        <textarea
                            rows={3}
                            placeholder="e.g. 1 Finance Street, Central, Hong Kong"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Place"
                message={`Are you sure you want to deactivate "${selectedPlace?.name}"? Scheduled rosters and records linked to this location may be affected.`}
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
