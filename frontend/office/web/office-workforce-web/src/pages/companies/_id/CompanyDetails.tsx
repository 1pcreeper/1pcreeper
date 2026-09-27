import { DeleteModal } from '@/components/ui/DeleteModal';
import { MessageModal } from '@/components/ui/MessageModal';
import { CompanyCreateRequestDTO } from '@/models/dto/office/workforce/request.dto';
import { CompanyResponseDTO } from '@/models/dto/office/workforce/response.dto';
import CompanyContentService from '@/services/content/office/workforce/CompanyContentService';
import { useCompanyStore } from '@/store/useCompanyStore';
import { Building, Save, Trash2, } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function CompanyDetails() {
    const { id: companyIdStr } = useParams();
    const companyId = Number(companyIdStr);
    const navigate = useNavigate();
    const { setCurrentSelectedCompany } = useCompanyStore();
    const companyContentService = CompanyContentService.getInstance();

    const [company, setCompany] = useState<CompanyResponseDTO | null>(null);
    const [editData, setEditData] = useState<CompanyCreateRequestDTO | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const [telZone, setTelZone] = useState('');
    const [telNum, setTelNum] = useState('');

    const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error', text: string, title: string } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setModalMessage({ type, text, title: type === 'success' ? 'Success' : 'Error' });
    };

    useEffect(() => {
        fetchCompany();
    }, [companyId]);

    const fetchCompany = async () => {
        try {
            const data = await companyContentService.findById(companyId);
            setCompany(data);
            setCurrentSelectedCompany(data);
            initEditData(data);
        } catch (error) {
            console.error("Failed to load company info", error);
            showMessage('error', 'Failed to load company details.');
        }
    };

    const initEditData = (data: CompanyResponseDTO) => {
        setEditData({
            nameEnglish: data.nameEnglish || "",
            nameChinese: data.nameChinese || "",
            businessRegistrationNumber: data.businessRegistrationNumber || "",
            secretaryLicenseNumber: data.secretaryLicenseNumber || "",
            email: data.email || "",
            tel: data.tel || "",
            details: {
                bio: data.details?.bio || "",
                address: data.details?.address || "",
                industry: data.details?.industry || "",
                website: data.details?.website || ""
            }
        });

        if (data.tel) {
            const parts = data.tel.replace('+', '').split(' ');
            if (parts.length >= 2) {
                setTelZone(parts[0]);
                setTelNum(parts.slice(1).join(' '));
            } else {
                setTelZone('');
                setTelNum(data.tel);
            }
        } else {
            setTelZone('');
            setTelNum('');
        }
    };

    const validateField = (field: string, value: string): string => {
        if (!editData) return "";
        switch (field) {
            case 'name':
                if (!editData.nameEnglish && !editData.nameChinese && !value) return "At least English or Chinese name is required.";
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
        if (!editData) return;
        let updatedData = { ...editData };
        if (isDetail) {
            updatedData.details = { ...updatedData.details, [field]: value };
        } else {
            (updatedData as any)[field] = value;
            const error = validateField(field === 'nameEnglish' || field === 'nameChinese' ? 'name' : field, value);
            setFormErrors(prev => ({ ...prev, [field === 'nameEnglish' || field === 'nameChinese' ? 'name' : field]: error }));
        }
        setEditData(updatedData);
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

    const handleUpdate = async () => {
        if (!editData) return;
        let fullTel;
        (telZone && telNum) && (fullTel = `+${telZone.padStart(3, '0')} ${telNum}`);
        const nameError = validateField('name', editData.nameEnglish || editData.nameChinese);
        const brnError = validateField('businessRegistrationNumber', editData.businessRegistrationNumber);
        const slnError = validateField('secretaryLicenseNumber', editData.secretaryLicenseNumber);
        const emailError = validateField('email', editData.email);
        const telError = validateField('tel', fullTel || '');

        const errors = {
            name: nameError,
            businessRegistrationNumber: brnError,
            secretaryLicenseNumber: slnError,
            email: emailError,
            tel: telError
        };

        setFormErrors(errors);

        if (Object.values(errors).some(err => err !== "")) {
            showMessage('error', 'Please fix form errors before saving.');
            return;
        }

        try {
            const payload = { ...editData, tel: fullTel };
            const updatedCompany = await companyContentService.update(companyId, payload);
            setCompany(updatedCompany);
            setCurrentSelectedCompany(updatedCompany);
            setIsEditing(false);
            showMessage('success', 'Company details updated successfully.');
        } catch (error: any) {
            console.error("Failed to update company", error);
            showMessage('error', error?.message || 'Failed to update company.');
        }
    };

    const handleDeletePrompt = async () => {
        setIsDeleteModalOpen(false);
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to confirm deletion of this company.`);
        if (randomNumber.toString() === deleteModalInput) {
            handleDelete();
        } else {
            showMessage('error', "Input Incorrect. Deletion cancelled.");
        }
    };

    const handleDelete = async () => {
        const randomNumber = Math.floor(Math.random() * 10000) + 1;
        const deleteModalInput = window.prompt(`Please enter '${randomNumber}' to delete`);
        if (randomNumber.toString() !== deleteModalInput) {
            window.alert("Input Incorrect");
            window.location.reload();
            return;
        }
        try {
            await companyContentService.delete(companyId);
            showMessage('success', 'Company deleted successfully.');
            // Clear context and redirect
            setCurrentSelectedCompany(null);
            setTimeout(() => {
                navigate('/companies');
            }, 1000);
        } catch (error: any) {
            console.error("Failed to delete company", error);
            showMessage('error', error?.message || 'Failed to delete company.');
        }
    };

    if (!company || !editData) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    return (
        <>
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
                        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{company.nameChinese || company.nameEnglish}</h2>
                                    <p className="text-xs text-slate-500">Company Information</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                initEditData(company);
                                                setFormErrors({});
                                            }}
                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={handleUpdate}
                                            className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            SAVE
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            DELETE
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:border-indigo-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-colors"
                                        >
                                            EDIT
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">English Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.nameEnglish}
                                            onChange={(e) => handleInputChange('nameEnglish', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-900">{company.nameEnglish || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Chinese Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.nameChinese}
                                            onChange={(e) => handleInputChange('nameChinese', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <p className="text-sm font-bold text-slate-900">{company.nameChinese || '-'}</p>
                                    )}
                                </div>
                                {formErrors.name && isEditing && <p className="col-span-2 text-xs text-red-500 font-medium -mt-4">{formErrors.name}</p>}

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Business Reg. No.</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editData.businessRegistrationNumber}
                                                onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                            />
                                            {formErrors.businessRegistrationNumber && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.businessRegistrationNumber}</p>}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-600 font-mono">{company.businessRegistrationNumber || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Secretary License No.</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={editData.secretaryLicenseNumber}
                                                onChange={(e) => handleInputChange('secretaryLicenseNumber', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                                            />
                                            {formErrors.secretaryLicenseNumber && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.secretaryLicenseNumber}</p>}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-600 font-mono">{company.secretaryLicenseNumber || '-'}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Contact Email</label>
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                            {formErrors.email && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.email}</p>}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-600">{company.email || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Telephone</label>
                                    {isEditing ? (
                                        <>
                                            <div className="flex gap-2 items-center">
                                                <span className="text-slate-500 font-bold">+</span>
                                                <input type="text" placeholder="Zone" className="w-16 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-center font-mono" value={telZone} onChange={e => setTelZone(e.target.value)} />
                                                <input type="text" placeholder="Number" className="flex-1 bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono" value={telNum} onChange={e => setTelNum(e.target.value)} />
                                            </div>
                                            {formErrors.tel && <p className="text-xs text-red-500 font-medium mt-1">{formErrors.tel}</p>}
                                        </>
                                    ) : (
                                        <p className="text-sm text-slate-600 font-mono">{company.tel || '-'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Company Details</h3>
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Industry</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.details.industry}
                                                onChange={(e) => handleInputChange('industry', e.target.value, true)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-600">{company.details?.industry || '-'}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Website</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editData.details.website}
                                                onChange={(e) => handleInputChange('website', e.target.value, true)}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            <p className="text-sm text-slate-600">{company.details?.website || '-'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-6">
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editData.details.address}
                                            onChange={(e) => handleInputChange('address', e.target.value, true)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        />
                                    ) : (
                                        <p className="text-sm text-slate-600">{company.details?.address || '-'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Bio / Description</label>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.details.bio}
                                            onChange={(e) => handleInputChange('bio', e.target.value, true)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                                        />
                                    ) : (
                                        <textarea
                                            value={editData.details.bio}
                                            readOnly
                                            disabled
                                            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MessageModal
                isOpen={modalMessage !== null}
                onClose={() => setModalMessage(null)}
                type={modalMessage?.type || 'error'}
                title={modalMessage?.title || 'Message'}
                message={modalMessage?.text || ''}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeletePrompt}
                title="Delete Company"
                message={`Are you sure you want to delete ${company.nameEnglish || company.nameChinese}? This action cannot be undone.`}
            />
        </>
    );
}
