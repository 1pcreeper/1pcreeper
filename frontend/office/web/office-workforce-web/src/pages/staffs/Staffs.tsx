import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { DeleteModal } from '@/components/ui/DeleteModal';
import { Modal } from '@/components/ui/Modal';
import { Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type StaffMember = { id: string; name: string; role: string; department: string; status: string; type?: string; cust_id?: string };

const MOCK_DATA: StaffMember[] = [
    { id: '1', name: 'Alice Smith', role: 'Software Engineer', department: 'Engineering', status: 'Active', type: 'FULL_TIME', cust_id: 'EMP-001' },
    { id: '2', name: 'Bob Jones', role: 'Product Manager', department: 'Product', status: 'On Leave', type: 'FULL_TIME', cust_id: 'EMP-002' },
    { id: '3', name: 'Charlie Brown', role: 'HR Generalist', department: 'Human Resources', status: 'Active', type: 'PART_TIME', cust_id: 'EMP-003' },
    { id: '4', name: 'Diana Prince', role: 'Sales Representative', department: 'Sales Div', status: 'Active', type: 'CONTRACT', cust_id: 'EMP-004' },
];

export default function Staffs() {
    const navigate = useNavigate();
    const { companyId } = useParams();
    const [data, setData] = useState(MOCK_DATA);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const [formData, setFormData] = useState({ name: '', role: 'Software Engineer', department: 'Engineering', status: 'Active', type: 'FULL_TIME', cust_id: '' });

    const columns: Column<StaffMember>[] = [
        { header: 'Name', accessorKey: 'name', cell: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
        { header: 'Role', accessorKey: 'role', cell: (row) => <span className="text-slate-600">{row.role}</span> },
        { header: 'Department', accessorKey: 'department', cell: (row) => <span className="text-slate-500">{row.department}</span> },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {row.status}
                </span>
            )
        },
    ];

    const handleOpenModal = (staff?: StaffMember) => {
        if (staff) {
            setSelectedStaff(staff);
            setFormData({ name: staff.name, role: staff.role, department: staff.department, status: staff.status, type: staff.type || 'FULL_TIME', cust_id: staff.cust_id || '' });
        } else {
            setSelectedStaff(null);
            setFormData({ name: '', role: 'Software Engineer', department: 'Engineering', status: 'Active', type: 'FULL_TIME', cust_id: '' });
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (staff: StaffMember) => {
        setSelectedStaff(staff);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedStaff) {
            setData(data.map(d => d.id === selectedStaff.id ? { ...d, ...formData } : d));
        } else {
            setData([...data, { id: Date.now().toString(), ...formData }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedStaff) {
            setData(data.filter(d => d.id !== selectedStaff.id));
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <EntityPageLayout
                title="Staff"
                description="Manage personnel records, roles, and employment status."
                onAdd={() => handleOpenModal()}
                searchPlaceholder="Search staff by name or role..."
                icon={<Users className="w-5 h-5" />}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    onEdit={handleOpenModal}
                    onDelete={handleOpenDelete}
                    onRowClick={(staff) => navigate(`/companies/${companyId}/staff/${staff.id}`)}
                    emptyMessage="No staff members found."
                    pageNumber={1}
                    totalPages={1}
                />
            </EntityPageLayout>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedStaff ? "Edit Staff Member" : "Add Staff Member"}
                onSubmit={handleSubmit}
                submitLabel={selectedStaff ? "SAVE" : "CREATE"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                            <input required className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Employee ID (Optional)</label>
                            <input className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-mono" value={formData.cust_id} onChange={e => setFormData({ ...formData, cust_id: e.target.value })} placeholder="e.g. EMP-001" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Role / Occupation</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                <option value="Software Engineer">Software Engineer</option>
                                <option value="Product Manager">Product Manager</option>
                                <option value="HR Generalist">HR Generalist</option>
                                <option value="Sales Representative">Sales Representative</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })}>
                                <option value="Engineering">Engineering</option>
                                <option value="Product">Product</option>
                                <option value="Human Resources">Human Resources</option>
                                <option value="Sales Div">Sales Div</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Work Type</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="FULL_TIME">Full Time</option>
                                <option value="FULL_PART_TIME">Full Part Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="FREELANCE">Freelance</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Modal>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Staff Member"
                message={`Are you sure you want to delete ${selectedStaff?.name}?`}
            />
        </>
    );
}
