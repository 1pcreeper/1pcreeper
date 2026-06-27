import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useOfficeAuthContext } from "./contexts/OfficeAuthContext";
import CompanyContentService from "./services/content/office/workforce/CompanyContentService";
import { useCompanyStore } from "./store/useCompanyStore";

export default function Orchestrator() {
    const location = useLocation();
    const { authOfficeUser } = useOfficeAuthContext();
    const { currentSelectedCompany, setCurrentSelectedCompany } = useCompanyStore();
    const companyContentService = CompanyContentService.getInstance();

    const begin = async () => {

    }

    const syncCompanyBySelection = async () => {
        const companyIdResult = extractCompanyId();
        const localStorageCompanyId = localStorage.getItem("currentSelectedCompany");
        if (companyIdResult) {
            const companyResult = await companyContentService.findById(companyIdResult);
            setCurrentSelectedCompany(companyResult);
            localStorage.setItem("currentSelectedCompany", String(companyResult.id));
            return;
        }
        if (localStorageCompanyId && !Number.isNaN(localStorageCompanyId)) {
            const companyResult = await companyContentService.findById(Number(localStorageCompanyId));
            setCurrentSelectedCompany(companyResult);
            localStorage.setItem("currentSelectedCompany", String(companyResult.id));
            return;
        }
    }

    const extractCompanyId = (): number | null => {
        const pathName = location.pathname;
        const companyPathPattern = /^\/companies\/[0-9]+/;
        if (!companyPathPattern.test(pathName)) {
            return null;
        }
        return Number(pathName.substring(11).split("/")[0]);
    }

    useEffect(() => {
        begin()
    }, []);

    useEffect(() => {
        syncCompanyBySelection();
    }, [location]);

    return (
        <>
            <Outlet />
        </>
    )
}