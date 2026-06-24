import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { Briefcase } from 'lucide-react';
import React, { useState } from 'react';

type Occupation = { id: string; title: string; department: string; level: string; headcount: number; status?: string };

const MOCK_DATA: Occupation[] = [
    { id: '1', title: 'Software Engineer', department: 'Engineering', level: 'Mid', headcount: 24, status: 'Active' },
    { id: '2', title: 'Product Manager', department: 'Product', level: 'Senior', headcount: 5, status: 'Active' },
    { id: '3', title: 'HR Generalist', department: 'Human Resources', level: 'Junior', headcount: 3, status: 'Active' },
    { id: '4', title: 'Sales Representative', department: 'Sales Div', level: 'Entry', headcount: 15, status: 'Active' },
];

export default function Occupations() {
    const [data, setData] = useState(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOccupation, setSelectedOccupation] = useState<Occupation | null>(null);

    const [formData, setFormData] = useState({ title: '', department: 'Engineering', level: 'Mid', headcount: 1, status: 'Active' });

    const columns: Column<Occupation>[] = [
        { header: 'Title', accessorKey: 'title', cell: (row) => <span className="font-bold text-slate-900">{row.title}</span> },
        { header: 'Department', accessorKey: 'department', cell: (row) => <span className="text-slate-600">{row.department}</span> },
        { header: 'Level', accessorKey: 'level', cell: (row) => <span className="text-slate-500">{row.level}</span> },
        { header: 'Headcount', accessorKey: 'headcount', cell: (row) => <span className="text-slate-500">{row.headcount}</span> },
    ];

    const handleOpenModal = (occupation?: Occupation) => {
        if (occupation) {
            setSelectedOccupation(occupation);
            setFormData({ title: occupation.title, department: occupation.department, level: occupation.level, headcount: occupation.headcount, status: occupation.status || 'Active' });
        } else {
            setSelectedOccupation(null);
            setFormData({ title: '', department: 'Engineering', level: 'Entry', headcount: 1, status: 'Active' });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (occupation: Occupation) => {
        setSelectedOccupation(occupation);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOccupation) {
            setData(data.map(d => d.id === selectedOccupation.id ? { ...d, ...formData } : d));
        } else {
            setData([...data, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedOccupation) {
            setData(data.filter(d => d.id !== selectedOccupation.id));
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <EntityPageLayout
                title="Occupations"
                description="Manage job roles, titles, and required headcount."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search occupations..."
                icon={<Briefcase className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDelete}
                    emptyMessage="No occupations found."
                    pageNumber={1}
                    totalPages={1}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedOccupation ? "Edit Occupation" : "Add Occupation"}
                onSubmit={handleSubmit}
                submitLabel={selectedOccupation ? "SAVE" : "CREATE"}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Title / Name</label>
                        <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Organization / Department</label>
                        <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                            <option value="Engineering">Engineering</option>
                            <option value="Product">Product</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Sales Div">Sales Div</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Level</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                <option value="Entry">Entry</option>
                                <option value="Junior">Junior</option>
                                <option value="Mid">Mid</option>
                                <option value="Senior">Senior</option>
                                <option value="Lead">Lead</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Required Headcount</label>
                            <input type="number" required min="0" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.headcount} onChange={e => setFormData({ ...formData, headcount: parseInt(e.target.value) })} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={formData.status === 'Active'} onChange={e => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })} id="occupation-active" />
                        <label htmlFor="occupation-active" className="text-xs text-slate-700">Is Active</label>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Occupation"
                message={`Are you sure you want to delete ${selectedOccupation?.title}?`}
            />
        </>
    );
}
