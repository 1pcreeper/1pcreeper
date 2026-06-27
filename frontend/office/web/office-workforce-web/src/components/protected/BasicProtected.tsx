import { useOfficeAuthContext } from "@/contexts/OfficeAuthContext";
import { Outlet, useNavigate } from "react-router-dom";
import Forbidden from "../errors/Forbidden";

export default function BasicProtected() {
    const navigate = useNavigate();
    const officeAuthContext = useOfficeAuthContext();
    const isAuthenticated = officeAuthContext.authOfficeUser != null;
    if (!isAuthenticated) {
        return <Forbidden />
    }
    return <Outlet />;
}