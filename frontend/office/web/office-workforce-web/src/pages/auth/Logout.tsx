import { useOfficeAuthContext } from "@/contexts/OfficeAuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {

    const { logout } = useOfficeAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        logout();
        navigate("/auth/login");
    }, []);

    return (
        <></>
    )
}