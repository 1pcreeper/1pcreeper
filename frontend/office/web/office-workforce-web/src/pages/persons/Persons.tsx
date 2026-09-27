import { EntityPageLayout } from '@/components/layout/EntityPageLayout';
import { Column, DataTable } from '@/components/ui/DataTable';
import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { PaginationBaseResponseDTO } from '@/models/dto/base/base.dto';
import { PersonCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { PersonResponseDTO } from '@/models/dto/office/workforce/response.dto';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [messageModal, setMessageModal] = useState<{ isOpen: boolean, type: 'success' | 'error', title: string, message: string }>({ isOpen: false, type: 'success', title: '', message: '' });
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessageModal({ isOpen: true, type, title: type === 'success' ? 'Success' : 'Error', message: text });
    };
    const [createFormData, setCreateFormData] = useState<PersonCreateRequestDTO>({
        nameEnglish: '',
        nameChinese: '',
        officeTel: '',
        mobileTel: '',
        email: '',
        hkId: '',
        cnId: '',
        moId: '',
        passportId: ''
    });
    const [mobileZone, setMobileZone] = useState('');
    const [mobileNum, setMobileNum] = useState('');
    const [officeZone, setOfficeZone] = useState('');
    const [officeNum, setOfficeNum] = useState('');
    const [hkId1, setHkId1] = useState('');
    const [hkId2, setHkId2] = useState('');
    const [hkId3, setHkId3] = useState('');
    const [moId1, setMoId1] = useState('');
    const [moId2, setMoId2] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        const newErrors: Record<string, string> = {};
        if (createFormData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+.[a-zA-Z]{2,}$/.test(createFormData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (officeZone || officeNum) {
            const officeTel = `+${officeZone.padStart(3, '0')} ${officeNum}`;
            if (!/^(\+([0-9]){3}\s([0-9])+)$/.test(officeTel)) {
                newErrors.officeTel = "Invalid office telephone format. Example: +852 12345678";
            }
        }
        if (mobileZone || mobileNum) {
            const mobileTel = `+${mobileZone.padStart(3, '0')} ${mobileNum}`;
            if (!/^(\+([0-9]){3}\s([0-9])+)$/.test(mobileTel)) {
                newErrors.mobileTel = "Invalid mobile telephone format";
            }
        }
        if (hkId1 || hkId2 || hkId3) {
            const hkId = `${hkId1.toUpperCase()}${hkId2}(${hkId3})`;
            if (!/^[A-Z][0-9]{6}\([0-9A-Z]\)$/.test(hkId)) {
                newErrors.hkId = "Invalid HK ID format. Example: A123456(1)";
            }
        }
        if (moId1 || moId2) {
            const moId = `${moId1}${moId2}`;
            if (!/^\d{8}$/.test(moId)) {
                newErrors.moId = "Invalid MO ID format. Must be exactly 8 digits.";
            }
        }
        if (createFormData.cnId && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\d|3[01]))\d{3}[\dXx]$/.test(createFormData.cnId)) {
            newErrors.cnId = "Invalid CN ID format";
        }
        if (createFormData.passportId && !/^[A-Z0-9]+$/.test(createFormData.passportId)) {
            newErrors.passportId = "Invalid Passport ID format";
        }
        setErrors(newErrors);
    }, [createFormData, mobileZone, mobileNum, officeZone, officeNum, hkId1, hkId2, hkId3, moId1, moId2]);

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

    const handleCreatePerson = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const finalData = { ...createFormData };
            if (mobileZone && mobileNum) finalData.mobileTel = `+${mobileZone.padStart(3, '0')} ${mobileNum}`;
            else finalData.mobileTel = '';

            if (officeZone && officeNum) finalData.officeTel = `+${officeZone.padStart(3, '0')} ${officeNum}`;
            else finalData.officeTel = '';

            if (hkId1 && hkId2 && hkId3) finalData.hkId = `${hkId1.toUpperCase()}${hkId2}(${hkId3})`;
            else finalData.hkId = '';

            if (moId1 && moId2) finalData.moId = `${moId1}${moId2}`;
            else finalData.moId = '';

            // Validation
            if (finalData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._%+-]+\.[a-zA-Z]{2,}$/.test(finalData.email)) throw new Error("Invalid email format");
            if (finalData.officeTel && !/^(\+([0-9]){3}\s([0-9])+)$/.test(finalData.officeTel)) throw new Error("Invalid office telephone format. Example: +852 12345678");
            if (finalData.mobileTel && !/^(\+([0-9]){3}\s([0-9])+)$/.test(finalData.mobileTel)) throw new Error("Invalid mobile telephone format");
            if (finalData.hkId && !/^[A-Z][0-9]{6}\([0-9A-Z]\)$/.test(finalData.hkId)) throw new Error("Invalid HK ID format. Example: A123456(1)");
            if (finalData.moId && !/^\d{8}$/.test(finalData.moId)) throw new Error("Invalid MO ID format. Must be exactly 8 digits.");
            if (finalData.cnId && !/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|10|11|12)((0[1-9]|[12]\d|3[01]))\d{3}[\dXx]$/.test(finalData.cnId)) throw new Error("Invalid CN ID format");
            if (finalData.passportId && !/^[A-Z0-9]+$/.test(finalData.passportId)) throw new Error("Invalid Passport ID format");
            if (!finalData.nameEnglish && !finalData.nameChinese) throw new Error("At least English Name or Chinese Name is required.");

            await personContentService.create(finalData);
            setIsCreateModalOpen(false);
            setCreateFormData({
                nameEnglish: '', nameChinese: '', officeTel: '', mobileTel: '', email: '', hkId: '', cnId: '', moId: '', passportId: ''
            });
            setMobileZone(''); setMobileNum(''); setOfficeZone(''); setOfficeNum('');
            setHkId1(''); setHkId2(''); setHkId3(''); setMoId1(''); setMoId2('');

            fetchPersons();
            showMessage('success', 'Person created successfully.');
        } catch (error: any) {
            console.error("Failed to create person:", error);
            showMessage('error', error?.message || 'Failed to create person.');
        }
    };

    return (
        <>
            <EntityPageLayout
                title="Persons"
                description="Manage person's contact."
                onAdd={() => setIsCreateModalOpen(true)}
                searchPlaceholder="Search persons..."
                icon={<User className="w-5 h-5" />}
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

            <Modal maxWidth="max-w-xl"
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Person"
                onSubmit={handleCreatePerson}
                submitLabel="CREATE"
                submitDisabled={Object.keys(errors).length > 0 || (!createFormData.nameEnglish && !createFormData.nameChinese)}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">English Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={createFormData.nameEnglish}
                                onChange={(e) => setCreateFormData({ ...createFormData, nameEnglish: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chinese Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={createFormData.nameChinese}
                                onChange={(e) => setCreateFormData({ ...createFormData, nameChinese: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email</label>
                        <input
                            type="email"
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            value={createFormData.email}
                            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                        />
                        {errors.email && <div className="text-red-500 text-[10px] mt-1">{errors.email}</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Mobile Tel</label>
                            <div className="flex gap-2 items-center">
                                <span className="text-slate-500 font-bold">+</span>
                                <input type="text" placeholder="Zone" className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={mobileZone} onChange={e => setMobileZone(e.target.value)} />
                                <input type="text" placeholder="Number" className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" value={mobileNum} onChange={e => setMobileNum(e.target.value)} />
                            </div>
                            {errors.mobileTel && <div className="text-red-500 text-[10px] mt-1">{errors.mobileTel}</div>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Office Tel</label>
                            <div className="flex gap-2 items-center">
                                <span className="text-slate-500 font-bold">+</span>
                                <input type="text" placeholder="Zone" className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={officeZone} onChange={e => setOfficeZone(e.target.value)} />
                                <input type="text" placeholder="Number" className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500" value={officeNum} onChange={e => setOfficeNum(e.target.value)} />
                            </div>
                            {errors.officeTel && <div className="text-red-500 text-[10px] mt-1">{errors.officeTel}</div>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">HK ID</label>
                            <div className="flex gap-1 items-center">
                                <input type="text" placeholder="A" maxLength={1} className="w-10 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center uppercase" value={hkId1} onChange={e => setHkId1(e.target.value.toUpperCase())} />
                                <input type="text" placeholder="123456" maxLength={6} className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 tracking-widest" value={hkId2} onChange={e => setHkId2(e.target.value)} />
                                <span className="text-slate-500 font-bold"> ( </span>
                                <input type="text" placeholder="1" maxLength={1} className="w-10 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={hkId3} onChange={e => setHkId3(e.target.value)} />
                                <span className="text-slate-500 font-bold"> ) </span>
                            </div>
                            {errors.hkId && <div className="text-red-500 text-[10px] mt-1">{errors.hkId}</div>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Passport ID</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={createFormData.passportId}
                                onChange={(e) => setCreateFormData({ ...createFormData, passportId: e.target.value })}
                            />
                            {errors.passportId && <div className="text-red-500 text-[10px] mt-1">{errors.passportId}</div>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CN ID</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={createFormData.cnId}
                                onChange={(e) => setCreateFormData({ ...createFormData, cnId: e.target.value })}
                            />
                            {errors.cnId && <div className="text-red-500 text-[10px] mt-1">{errors.cnId}</div>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">MO ID</label>
                            <div className="flex gap-2 items-center">
                                <input type="text" placeholder="1234567" maxLength={7} className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 tracking-widest" value={moId1} onChange={e => setMoId1(e.target.value)} />
                                <span className="text-slate-500 font-bold">(</span>
                                <input type="text" placeholder="8" maxLength={1} className="w-10 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center" value={moId2} onChange={e => setMoId2(e.target.value)} />
                                <span className="text-slate-500 font-bold">)</span>
                            </div>
                            {errors.moId && <div className="text-red-500 text-[10px] mt-1">{errors.moId}</div>}
                        </div>
                    </div>
                </div>
            </Modal>

            <MessageModal
                isOpen={messageModal.isOpen}
                onClose={() => setMessageModal({ ...messageModal, isOpen: false })}
                type={messageModal.type}
                title={messageModal.title}
                message={messageModal.message}
            />
        </>
    );
}
