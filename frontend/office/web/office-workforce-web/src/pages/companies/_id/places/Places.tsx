import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { MapPin } from 'lucide-react';
import React, { useState } from 'react';

type Place = { id: string; name: string; location: string; capacity: number; type: string; status?: string };

const MOCK_DATA: Place[] = [
    { id: '1', name: 'Main Headquarters', location: 'New York, NY', capacity: 500, type: 'Office', status: 'Active' },
    { id: '2', name: 'Downtown Branch', location: 'San Francisco, CA', capacity: 150, type: 'Office', status: 'Active' },
    { id: '3', name: 'Westside Warehouse', location: 'Denver, CO', capacity: 50, type: 'Logistics', status: 'Active' },
];

export default function Places() {
    const [data, setData] = useState(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

    const [formData, setFormData] = useState({ name: '', location: '', capacity: 0, type: 'Office', status: 'Active' });

    const columns: Column<Place>[] = [
        { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
        { header: 'Location', accessorKey: 'location', cell: (row) => <span className="text-slate-500">{row.location}</span> },
        { header: 'Type', accessorKey: 'type', cell: (row) => <span className="text-slate-600">{row.type}</span> },
        { header: 'Capacity', accessorKey: 'capacity', cell: (row) => <span className="text-slate-600">{row.capacity}</span> },
    ];

    const handleOpenModal = (place?: Place) => {
        if (place) {
            setSelectedPlace(place);
            setFormData({ name: place.name, location: place.location, capacity: place.capacity, type: place.type, status: place.status || 'Active' });
        } else {
            setSelectedPlace(null);
            setFormData({ name: '', location: '', capacity: 0, type: 'Office', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (place: Place) => {
        setSelectedPlace(place);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPlace) {
            setData(data.map(d => d.id === selectedPlace.id ? { ...d, ...formData } : d));
        } else {
            setData([...data, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedPlace) {
            setData(data.filter(d => d.id !== selectedPlace.id));
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <EntityPageLayout
                title="Places"
                description="Manage physical locations, branches, and workspaces."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search places..."
                icon={<MapPin className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDelete}
                    emptyMessage="No places found."
                    pageNumber={1}
                    totalPages={1}
                    onPageChange={() => { }}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPlace ? "Edit Place" : "Add Place"}
                onSubmit={handleSubmit}
                submitLabel={selectedPlace ? "SAVE" : "CREATE"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Location / Address</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Office">Office</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Retail">Retail</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Capacity</label>
                            <input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.capacity} onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.status === 'Active'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })} id="place-active" />
                        <label htmlFor="place-active" className="text-xs text-slate-700">Is Active</label>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Place"
                message={`Are you sure you want to delete ${selectedPlace?.name}?`}
            />
        </>
    );
}
