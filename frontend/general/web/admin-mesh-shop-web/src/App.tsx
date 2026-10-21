import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider, LoginPage, ProtectedRoute, RouteError } from "@mesh-shop/shared";
import AdminShell from "./components/AdminShell";
import Dashboard from "./pages/Dashboard";
import MeshLibrary from "./pages/MeshLibrary";
import Merchants from "./pages/Merchants";
import Workspace from "./pages/Workspace";

const router = createBrowserRouter([
    {
        element: (
            <AuthProvider admin>
                <Outlet />
            </AuthProvider>
        ),
        errorElement: <RouteError />,
        children: [
            { path: "/auth/login", element: <LoginPage admin /> },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        element: <AdminShell />,
                        children: [
                            { path: "/", element: <Navigate to="/dashboard" replace /> },
                            { path: "/dashboard", element: <Dashboard /> },
                            { path: "/meshes", element: <MeshLibrary /> },
                            { path: "/merchants", element: <Merchants /> },
                        ],
                    },
                    { path: "/meshes/new", element: <Workspace kind="mesh" /> },
                    { path: "/meshes/:id", element: <Workspace kind="mesh" /> },
                    { path: "/game/maps/:id", element: <Workspace kind="maps" /> },
                    { path: "/game/spots/:id", element: <Workspace kind="spots" /> },
                    { path: "/game/places/:id", element: <Workspace kind="places" /> },
                ],
            },
            { path: "*", element: <RouteError /> },
        ],
    },
]);
export default function App() {
    return <RouterProvider router={router} />;
}
