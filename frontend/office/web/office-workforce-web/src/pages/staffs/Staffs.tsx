import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { StaffResponseDTO } from '@/models/dto/office/workforce/response.dto';
import StaffContentService from '@/services/content/office/workforce/StaffContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Staffs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const navigate = useNavigate();
    const { currentSelectedCompany } = useCompanyStore();
    const companyId = currentSelectedCompany?.id;
    const [data, setData] = useState<StaffResponseDTO[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffResponseDTO | null>(null);
    const staffContentService = StaffContentService.getInstance();
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [formData, setFormData] = useState({ name: '', role: 'Software Engineer', department: 'Engineering', status: 'Active', type: 'FULL_TIME', cust_id: '' });

    const columns: Column<StaffResponseDTO>[] = [
        { header: 'Staff ID', accessorKey: 'id', cell: (row) => <span className="text-slate-500">{row.id}</span> },
        { header: 'Name', accessorKey: 'personNameEnglish', cell: (row) => <span className="font-bold text-slate-900">{staffContentService.getDisplayName(row)}</span> },
        { header: 'Organization', accessorKey: 'orgName', cell: (row) => <span className="text-slate-600">{row.orgName}</span> },
        { header: 'Person ID', accessorKey: 'personId', cell: (row) => <span className="text-slate-500">{row.personId}</span> },
        {
            header: 'Status',
            cell: (row) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${row.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {row.isActive ? "Active" : "Inactive"}
                </span>
            )
        },
    ];

    const fetchStaffs = async () => {
        let response: PaginationBaseResponseDTO<StaffResponseDTO>;
        if (!search || search.trim() === "") {
            response = await staffContentService.findAllS1(companyId || 0, { page, size });
            settleResponseContent(response);
        }
        else {
            response = await staffContentService.searchS1(search, companyId || 0, { page, size });
            settleResponseContent(response);
        }
    };

    const settleResponseContent = (response: PaginationBaseResponseDTO<StaffResponseDTO>) => {
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        fetchStaffs();
    }, [search, page, companyId]);

    return (
        <>
            <EntityPageLayout
                onAdd={() => { }}
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

        </>
    );
}
