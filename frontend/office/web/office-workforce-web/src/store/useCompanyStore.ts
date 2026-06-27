import { CompanyResponseDTO } from '@/models/dto/office/workforce/response.dto';
import { create } from 'zustand';

interface CompanyStoreState {
    currentSelectedCompany: CompanyResponseDTO | null;
    setCurrentSelectedCompany: (company: CompanyResponseDTO) => void;
}

export const useCompanyStore = create<CompanyStoreState>((set) => ({
    currentSelectedCompany: null,
    setCurrentSelectedCompany: (company) => set({ currentSelectedCompany: company }),
}));
