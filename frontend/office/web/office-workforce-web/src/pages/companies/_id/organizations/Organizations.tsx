import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { Building } from 'lucide-react';
import React, { useState } from 'react';

type Organization = { id: string; name: string; code: string; parent: string; status: string; bio?: string };

const MOCK_DATA: Organization[] = [
    { id: '1', name: 'Engineering Dept', code: 'ENG', parent: 'Acme Corp', status: 'Active' },
    { id: '2', name: 'Human Resources', code: 'HR', parent: 'Acme Corp', status: 'Active' },
    { id: '3', name: 'North America Sales', code: 'NA-SALES', parent: 'Sales Div', status: 'Active' },
];

export default function Organizations() {
    const [data, setData] = useState(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    const [formData, setFormData] = useState({ name: '', code: '', parent: '1', status: 'Active', bio: '' });

    const columns: Column<Organization>[] = [
        { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
        { header: 'Code', cell: (row) => <span className="text-slate-500 font-mono">{row.code}</span> },
        { header: 'Parent Org', accessorKey: 'parent', cell: (row) => <span className="text-slate-600">{row.parent}</span> },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleOpenModal = (org?: Organization) => {
        if (org) {
            setSelectedOrg(org);
            setFormData({ name: org.name, code: org.code, parent: '1', status: org.status, bio: org.bio || '' });
        } else {
            setSelectedOrg(null);
            setFormData({ name: '', code: '', parent: '1', status: 'Active', bio: '' });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (org: Organization) => {
        setSelectedOrg(org);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOrg) {
            setData(data.map(d => d.id === selectedOrg.id ? { ...d, ...formData } : d));
        } else {
            setData([...data, { id: Date.now().toString(), ...formData, parent: 'Acme Corp' }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedOrg) {
            setData(data.filter(d => d.id !== selectedOrg.id));
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <EntityPageLayout
                title="Organizations"
                description="Manage hierarchical departments and divisions within the company."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search organizations..."
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
                    onPageChange={(p) => console.log('Page:', p)}
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
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Code</label>
                        <input
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Parent Org</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={formData.parent}
                            onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                        >
                            <option value="1">Acme Corp</option>
                            <option value="2">Sales Div</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bio / Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.status === 'Active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                            id="org-active"
                        />
                        <label htmlFor="org-active" className="text-xs text-slate-700">Is Active</label>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Organization"
                message={`Are you sure you want to delete ${selectedOrg?.name}? This action cannot be undone.`}
            />
        </>
    );
}
