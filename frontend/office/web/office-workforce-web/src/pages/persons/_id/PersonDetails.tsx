import { PersonDetailResponseDTO } from '@/models/dto/office/workforce/response.dto';
import PersonContentService from '@/services/content/office/workforce/PersonContentService';
import { ArrowDownLeftSquareIcon, ArrowLeft, Calendar, Clock, CreditCard, FileText, Mail, MapPin, Phone, Search, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function PersonDetails() {
    const personContentService = PersonContentService.getInstance();
    const { id } = useParams();
    const navigate = useNavigate();
    const [personDetail, setPersonDetail] = useState<PersonDetailResponseDTO | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPersonDetail, setSelectedPersonDetail] = useState<PersonDetailResponseDTO | null>(null);
    const [activeTab, setActiveTab] = useState<'opt1' | 'opt2' | 'opt3'>('opt1');

    const handleOpenModal = (personDetailSelection?: PersonDetailResponseDTO) => {
        if (personDetailSelection) {
            setSelectedPersonDetail(personDetailSelection);
        } else {
            setSelectedPersonDetail(null); //reset create new form
        }
        setIsModalOpen(true);
    };

    const handleOpenDelete = (personDetailSelection: PersonDetailResponseDTO) => {
        setSelectedPersonDetail(personDetailSelection);
        setIsDeleteModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedPersonDetail) {

        } else {

        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (selectedPersonDetail) {

        }
        setIsDeleteModalOpen(false);
    };

    const fetchPersonDetail = async () => {
        if (!id || Number.isNaN(id)) {
            navigate("/errors/not-found");
        }
        const response = await personContentService.findByIdInDetail(Number(id));
        setPersonDetail(response);
    }
    useEffect(() => {
        fetchPersonDetail();
    }, [id]);

    return (
        <>
            <div className="flex flex-col h-full bg-slate-50 relative">
                <div className="px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 -ml-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{personDetail && personContentService.getDisplayName(personDetail?.person)}</h1>
                        <p className="text-xs text-slate-500 font-medium">Person Profile</p>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <div className="max-w-7xl mx-auto space-y-6">

                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Big Avatar Sidebar */}
                            <div className="w-full lg:w-72 shrink-0">
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center py-10 px-6 h-full">
                                    <div className="relative mb-5">
                                        <div className="w-40 h-40 rounded-full bg-indigo-50 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                            <span className="text-5xl font-bold text-indigo-300">{personDetail?.person.nameEnglish.charAt(0)}</span>
                                        </div>
                                        <div className="absolute -bottom-1 -translate-x-1/2 left-1/2 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Working</span>
                                        </div>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">{personDetail?.person.nameEnglish}</h2>
                                    <div className="text-sm font-medium text-slate-500 mb-1">{personDetail?.person.nameChinese}</div>
                                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 tracking-wider">
                                            PersonID: {personDetail?.person.id}
                                        </span>
                                    </div>
                                    {
                                        personDetail?.staffs &&
                                        <table className='mt-4 flex w-full flex-col'>
                                            <th className="w-full inline-flex items-center justify-center text-center px-2 py-0.5 rounded-t-sm font-bold bg-blue-100 text-slate-700 tracking-wider">
                                                Employment
                                            </th>
                                            <tr className='w-full bg-blue-50 text-slate-700 p-4'>
                                                {
                                                    personDetail?.staffs.map((staff, idx) => {
                                                        return (
                                                            <div className="overflow-hidden text-clip flex justify-between">
                                                                <div>
                                                                    <h4>{staff.companyName}</h4>
                                                                    <h5 className='text-xs'>{staff.orgName}</h5>
                                                                </div>
                                                                <button onClick={(e) => navigate(`/staffs/${staff.id}`)}>
                                                                    <ArrowDownLeftSquareIcon className='text-blue-800' />
                                                                </button>
                                                            </div>
                                                        );
                                                    })
                                                }
                                            </tr>
                                        </table>

                                    }

                                </div>
                            </div>

                            {/* Right Info Section */}
                            <div className="flex-1 flex flex-col gap-6">

                                {/* Personal & Employment Information */}
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>
                                    </div>
                                    <div className="p-5 grid grid-cols-1  gap-x-8 gap-y-6">
                                        {/* Left Column: Personal Information */}
                                        <div className="flex flex-col gap-5">
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">Personal</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chinese Name</label>
                                                    <div className="text-sm font-medium text-slate-900">{personDetail?.person.nameChinese}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">English Name</label>
                                                    <div className="text-sm font-medium text-slate-900">{personDetail?.person.nameEnglish}</div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
                                                    <div className="text-sm text-slate-900 truncate" title={personDetail?.person.email}>{personDetail?.person.email}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Mobile Tel</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.mobileTel || '-'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> Office Tel</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.officeTel || '-'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> HK ID</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.hkId || '-'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Passport ID</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.passportId || '-'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> CN ID</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.cnId || '-'}</div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> MO ID</label>
                                                    <div className="text-sm font-mono text-slate-700">{personDetail?.person.moId || '-'}</div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* Work Preferences & Additional Details */}
                                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                    <div className="border-b border-slate-200 bg-slate-50/50 px-5 py-3 flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <h2 className="text-sm font-bold text-slate-900">Additional Details</h2>
                                    </div>
                                    <div className="p-5 flex flex-col gap-8">

                                        {/* Bottom: Additional Details */}
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                Additional Details
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Date of Birth</label>
                                                    <div className="text-sm font-medium text-slate-900">{personDetail?.detail.dateOfBirth}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</label>
                                                    <div className="text-sm font-medium text-slate-900 capitalize">{personDetail?.detail.gender.toLowerCase()}</div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Address</label>
                                                    <div className="text-sm text-slate-700">{personDetail?.detail.address}</div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Search className="w-3 h-3" /> Bio</label>
                                                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-100">{personDetail?.detail.bio}</p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Section Menu (Tabs) */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
                            <div className="flex border-b border-slate-200 px-2 pt-2 bg-slate-50/50">
                                <button
                                    onClick={() => setActiveTab('opt1')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt1' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => setActiveTab('opt2')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt2' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Status
                                </button>
                                <button
                                    onClick={() => setActiveTab('opt3')}
                                    className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'opt3' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                                >
                                    Other
                                </button>
                            </div>

                            <div className="p-6">
                                {activeTab === 'opt1' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'opt2' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'opt3' && (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900">Opt</h3>
                                                <p className="text-xs text-slate-500">Manage preferred working locations and periods for scheduling.</p>
                                            </div>
                                        </div>
                                        <div className="py-12 flex flex-col items-center justify-center text-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
                                                <Search className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 mb-1">Other Settings</h3>
                                            <p className="text-xs text-slate-500">TO BE IMPLEMENTED</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* <Modal
                    isOpen={isPreferenceModalOpen}
                    onClose={() => setIsPreferenceModalOpen(false)}
                    title="Add Schedule Preference"
                    onSubmit={handleAddPreference}
                    submitLabel="ADD PREFERENCE"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Place</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={prefFormData.placeId}
                                onChange={(e) => {
                                    const name = e.target.options[e.target.selectedIndex].text;
                                    setPrefFormData({ ...prefFormData, placeId: e.target.value, placeName: name });
                                }}
                            >
                                <option value="1">Main Headquarters</option>
                                <option value="2">Downtown Branch</option>
                                <option value="3">Westside Warehouse</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Day of Week</label>
                                <select
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={prefFormData.weekDay}
                                    onChange={(e) => setPrefFormData({ ...prefFormData, weekDay: parseInt(e.target.value) })}
                                >
                                    <option value={1}>Monday</option>
                                    <option value={2}>Tuesday</option>
                                    <option value={3}>Wednesday</option>
                                    <option value={4}>Thursday</option>
                                    <option value={5}>Friday</option>
                                    <option value={6}>Saturday</option>
                                    <option value={0}>Sunday</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Priority Index</label>
                                <input
                                    type="number" min="0" required
                                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={prefFormData.priorityIndex}
                                    onChange={(e) => setPrefFormData({ ...prefFormData, priorityIndex: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Working Period</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                value={prefFormData.workingPeriodName}
                                onChange={(e) => setPrefFormData({ ...prefFormData, workingPeriodName: e.target.value })}
                            >
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                                <option value="Flexi Day">Flexi Day</option>
                            </select>
                        </div>
                    </div>
                </Modal> */}

            </div>
        </>
    );
}
