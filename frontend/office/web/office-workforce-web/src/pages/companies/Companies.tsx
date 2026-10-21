import { MessageModal } from '@/components/ui/MessageModal';
import { Modal } from '@/components/ui/Modal';
import { CompanyCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { CompanyResponseDTO } from '@/models/dto/office/workforce/response.dto';
import CompanyContentService from '@/services/content/office/workforce/CompanyContentService';
import { ArrowRight, Building, Plus, } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Companies() {
    const navigate = useNavigate();
    const [companies, setCompanies] = useState<CompanyResponseDTO[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [telZone, setTelZone] = useState('');
    const [telNum, setTelNum] = useState('');

    const showMessage = (type: 'success' | 'error', text: string) => { setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' }); };

    const [newCompany, setNewCompany] = useState<CompanyCreateRequestDTO>({
        nameEnglish: "",
        nameChinese: "",
        businessRegistrationNumber: "",
        secretaryLicenseNumber: "",
        email: "",
        tel: "",
        details: {
            bio: "",
            address: "",
            industry: "",
            website: ""
        }
    });
    const companyContentService = CompanyContentService.getInstance();
    const [page] = useState<number>(0);
    const pageSize = 10;

    const handleSelectCompany = (id: number) => {
        navigate(`/companies/${id}/info`);
    };

    const validateField = (field: string, value: string): string => {
        switch (field) {
            case 'name':
                if (!newCompany.nameEnglish && !newCompany.nameChinese && !value) return "At least English or Chinese name is required.";
                return "";
            case 'businessRegistrationNumber':
                if (value && !/^[0-9]{8}$/.test(value)) return "Business Registration Number must be exactly 8 digits.";
                return "";
            case 'secretaryLicenseNumber':
                if (value && !/^[0-9]{6}$/.test(value)) return "Secretary License Number must be exactly 6 digits.";
                return "";
            case 'email':
                if (value && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return "Invalid email format.";
                return "";
            case 'tel':
                if (telZone || telNum) {
                    if (!telZone || !telNum) return "Both zone and number are required for telephone.";
                    if (telZone && !/^[0-9]{1,3}$/.test(telZone.padStart(3, '0'))) return "Telephone zone must be 1 to 3 digits.";
                    if (telNum && !/^[0-9]{4,15}$/.test(telNum)) return "Telephone number must be 4 to 15 digits.";
                }
                return "";
            default:
                return "";
        }
    };

    const handleInputChange = (field: string, value: string, isDetail: boolean = false) => {
        if (isDetail) {
            setNewCompany({ ...newCompany, details: { ...newCompany.details, [field]: value } });
        } else {
            setNewCompany({ ...newCompany, [field]: value });
            const error = validateField(field === 'nameEnglish' || field === 'nameChinese' ? 'name' : field, value);
            setFormErrors(prev => ({ ...prev, [field === 'nameEnglish' || field === 'nameChinese' ? 'name' : field]: error }));
        }
    };

    useEffect(() => {
        if (telZone || telNum) {
            const fullTel = `+${telZone.padStart(3, '0')} ${telNum}`;
            const error = validateField('tel', fullTel);
            setFormErrors(prev => ({ ...prev, tel: error }));
        } else {
            setFormErrors(prev => ({ ...prev, tel: "" }));
        }
    }, [telZone, telNum]);

    const handleCreateCompany = async (e: React.FormEvent) => {
        e.preventDefault();

        const fullTel = (telZone || telNum) ? `+${telZone.padStart(3, '0')} ${telNum}` : '';
        const nameError = validateField('name', newCompany.nameEnglish || newCompany.nameChinese);
        const brnError = validateField('businessRegistrationNumber', newCompany.businessRegistrationNumber);
        const slnError = validateField('secretaryLicenseNumber', newCompany.secretaryLicenseNumber);
        const emailError = validateField('email', newCompany.email);
        const telError = validateField('tel', fullTel);

        const errors = {
            name: nameError,
            businessRegistrationNumber: brnError,
            secretaryLicenseNumber: slnError,
            email: emailError,
            tel: telError
        };

        setFormErrors(errors);

        if (Object.values(errors).some(err => err !== "")) {
            return;
        }

        try {
            const companyToCreate = { ...newCompany, tel: fullTel };
            const savedCompany: CompanyResponseDTO = await companyContentService.create(companyToCreate);
            setCompanies([...companies, savedCompany]);
            handleCloseModal();
            showMessage('success', 'Company created successfully.');
        } catch (error: any) {
            console.error("Failed to create company", error);
            showMessage('error', error?.message || 'Failed to create company.');
        }
    };

    const handleCloseModal = () => {
        setIsCreating(false);
        setFormErrors({});
        setTelZone('');
        setTelNum('');
        setNewCompany({
            nameEnglish: "",
            nameChinese: "",
            businessRegistrationNumber: "",
            secretaryLicenseNumber: "",
            email: "",
            tel: "",
            details: { bio: "", address: "", industry: "", website: "" }
        });
    };

    const fetchCompanies = async () => {
        const response = await companyContentService.findAllS1({ page, size: pageSize });
        setCompanies(response.content);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
                            <Building className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Select a Company</h1>
                        <p className="text-slate-500 max-w-sm mx-auto">Choose an existing company to manage or create a new one to get started.</p>
                    </div>

                    <div className="bg-white border text-left border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Your Companies</h2>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                <Plus className="w-3 h-3" />
                                NEW COMPANY
                            </button>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {companies.map(company => (
                                <button
                                    key={company.id}
                                    onClick={() => handleSelectCompany(company.id)}
                                    className="w-full text-left p-4 hover:bg-indigo-50 transition-colors flex items-center justify-between group"
                                >
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{company.nameChinese}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{company.nameEnglish}</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </button>
                            ))}
                            {companies.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    No companies found. Create one to get started.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isCreating}
                onClose={handleCloseModal}
                title="Create New Company"
                onSubmit={handleCreateCompany}
                submitLabel="CREATE COMPANY"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">English Name</label>
                            <input
                                type="text"
                                value={newCompany.nameEnglish}
                                onChange={(e) => handleInputChange('nameEnglish', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chinese Name</label>
                            <input
                                type="text"
                                value={newCompany.nameChinese}
                                onChange={(e) => handleInputChange('nameChinese', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g. 阿克米公司"
                            />
                        </div>
                    </div>
                    {formErrors.name && <p className="text-xs text-red-500 font-medium">{formErrors.name}</p>}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Business Reg. No.</label>
                            <input
                                type="text"
                                value={newCompany.businessRegistrationNumber}
                                onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                            {formErrors.businessRegistrationNumber && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.businessRegistrationNumber}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Secretary License No.</label>
                            <input
                                type="text"
                                value={newCompany.secretaryLicenseNumber}
                                onChange={(e) => handleInputChange('secretaryLicenseNumber', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                            />
                            {formErrors.secretaryLicenseNumber && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.secretaryLicenseNumber}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Contact Email</label>
                            <input
                                type="email"
                                value={newCompany.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {formErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.email}</p>}
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telephone</label>
                            <div className="flex gap-2 items-center">
                                <span className="text-slate-500 font-bold">+</span>
                                <input type="text" placeholder="Zone" className="w-15 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-mono" value={telZone} onChange={e => setTelZone(e.target.value)} />
                                <input type="text" placeholder="Number" className="flex w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" value={telNum} onChange={e => setTelNum(e.target.value)} />
                            </div>
                            {formErrors.tel && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.tel}</p>}
                        </div>
                    </div>
                </div>
            </Modal>

            <MessageModal
                isOpen={modalMessage !== null}
                onClose={() => setModalMessage(null)}
                type={modalMessage?.type || 'error'}
                title={modalMessage?.title || 'Message'}
                message={modalMessage?.text || ''}
            />
        </>
    );
}
