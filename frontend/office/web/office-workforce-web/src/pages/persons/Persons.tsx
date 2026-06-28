import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { PersonResponseDTO } from '@/models/dto/office/workforce/response.dto';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import { Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Persons() {
    const [searchParams, setSearchParams] = useSearchParams();
    const pageParam = searchParams.get("page");
    const qParam = searchParams.get("q");
    const navigate = useNavigate();

    const personContentService = PersonContentService.getInstance();
    const [search, setSearch] = useState<string>(qParam || "");
    const [page, setPage] = useState<number>(Number.isNaN(pageParam) ? 0 : Number(pageParam));
    const [size, setSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [data, setData] = useState<PersonResponseDTO[]>([]);

    const [formData, setFormData] = useState({ title: '', department: 'Engineering', level: 'Mid', headcount: 1, status: 'Active' });

    const columns: Column<PersonResponseDTO>[] = [
        { header: 'ID', accessorKey: 'id', cell: (row) => <span className="font-bold text-slate-900">{row.id}</span> },
        { header: 'Name', accessorKey: 'nameChinese', cell: (row) => <span className="text-slate-600">{personContentService.getDisplayName(row)}</span> },
        { header: 'Identity', accessorKey: 'nameEnglish', cell: (row) => <span className="text-slate-500">{personContentService.getIdentity(row)}</span> },
        { header: 'email', accessorKey: 'email', cell: (row) => <span className="text-slate-500">{row.email}</span> },
        { header: 'Tel', accessorKey: 'mobileTel', cell: (row) => <span className="text-slate-500">{personContentService.getTelphone(row)}</span> }
    ];
    const fetchPersons = async () => {
        let response: PaginationBaseResponseDTO<PersonResponseDTO>;
        if (!search || search.trim() === "") {
            response = await personContentService.findAllS1({ page, size });
            settleResponseContent(response);
        }
        else {
            response = await personContentService.searchS1(search, { page, size });
            settleResponseContent(response);
        }
    };

    const settleResponseContent = (response: PaginationBaseResponseDTO<PersonResponseDTO>) => {
        setData(response.content);
        setSize(response.pageSize);
        setTotalPages(response.totalPages);
    };

    useEffect(() => {
        fetchPersons();
    }, [search, page]);

    return (
        <>
            <EntityPageLayout
                title="Persons"
                description="Manage person's contact."
                onAdd={() => { }}
                searchPlaceholder="Search occupations..."
                icon={<Briefcase className="w-5 h-5" />}
                searchBarValue={search}
                onSearchBarChange={e => {
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
                    emptyMessage="No persons found."
                    pageNumber={page}
                    totalPages={totalPages}
                    onPageChange={p => setPage(p)}
                    onRowClick={(p) => navigate(`/persons/${p.id}`)}
                />
            </EntityPageLayout>

        </>
    );
}
