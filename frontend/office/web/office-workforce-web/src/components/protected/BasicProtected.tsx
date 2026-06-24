import { useOfficeAuthContext } from "@/contexts/OfficeAuthContext";
import { Outlet, useNavigate } from "react-router-dom";

export default function BasicProtected() {
    const navigate = useNavigate();
    const officeAuthContext = useOfficeAuthContext();
    const isAuthenticated = officeAuthContext.authOfficeUser != null;
    if (!isAuthenticated) {
        navigate("/auth/login");
    }
    return <Outlet />;
}