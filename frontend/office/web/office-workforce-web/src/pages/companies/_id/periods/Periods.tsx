import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { Clock } from 'lucide-react';
import React, { useState } from 'react';

type Period = { id: string; name: string; start: string; end: string; duration: string; type: string; status?: string };

const MOCK_DATA: Period[] = [
    { id: '1', name: 'Morning Shift', start: '08:00', end: '16:00', duration: '8h', type: 'Fixed', status: 'Active' },
    { id: '2', name: 'Evening Shift', start: '16:00', end: '00:00', duration: '8h', type: 'Fixed', status: 'Active' },
    { id: '3', name: 'Night Shift', start: '00:00', end: '08:00', duration: '8h', type: 'Fixed', status: 'Active' },
    { id: '4', name: 'Flexi Day', start: 'Flexible', end: 'Flexible', duration: '8h', type: 'Flexible', status: 'Active' },
];

export default function Periods() {
    const [data, setData] = useState(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null);

    const [formData, setFormData] = useState({ name: '', start: '', end: '', duration: '', type: 'Fixed', status: 'Active' });

    const columns: Column<Period>[] = [
        { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
        { header: 'Type', accessorKey: 'type', cell: (row) => <span className="text-slate-600">{row.type}</span> },
        { header: 'Start Time', accessorKey: 'start', cell: (row) => <span className="text-slate-500 font-mono">{row.start}</span> },
        { header: 'End Time', accessorKey: 'end', cell: (row) => <span className="text-slate-500 font-mono">{row.end}</span> },
        { header: 'Duration', accessorKey: 'duration', cell: (row) => <span className="text-slate-600">{row.duration}</span> },
    ];

    const handleOpenModal = (period?: Period) => {
        if (period) {
            setSelectedPeriod(period);
            setFormData({ name: period.name, start: period.start, end: period.end, duration: period.duration, type: period.type, status: period.status || 'Active' });
        } else {
            setSelectedPeriod(null);
            setFormData({ name: '', start: '09:00', end: '17:00', duration: '8h', type: 'Fixed', status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (period: Period) => {
        setSelectedPeriod(period);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPeriod) {
            setData(data.map(d => d.id === selectedPeriod.id ? { ...d, ...formData } : d));
        } else {
            setData([...data, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedPeriod) {
            setData(data.filter(d => d.id !== selectedPeriod.id));
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <EntityPageLayout
                title="Working Periods"
                description="Define standard shifts, schedules, and flexible working hours."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search periods..."
                icon={<Clock className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDelete}
                    emptyMessage="No working periods found."
                    pageNumber={1}
                    totalPages={1}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedPeriod ? "Edit Working Period" : "Add Working Period"}
                onSubmit={handleSubmit}
                submitLabel={selectedPeriod ? "SAVE" : "CREATE"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Time</label>
                            <input type="time" required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono" value={formData.start} onChange={e => setFormData({ ...formData, start: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Time</label>
                            <input type="time" required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono" value={formData.end} onChange={e => setFormData({ ...formData, end: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Duration</label>
                            <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 8h" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Fixed">Fixed</option>
                                <option value="Flexible">Flexible</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.status === 'Active'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })} id="period-active" />
                        <label htmlFor="period-active" className="text-xs text-slate-700">Is Active</label>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Period"
                message={`Are you sure you want to delete ${selectedPeriod?.name}?`}
            />
        </>
    );
}
