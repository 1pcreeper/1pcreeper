import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider, LoginPage, RouteError } from "@mesh-shop/shared";
import Home from "./pages/Home";
import Explorer from "./pages/Explorer";
import Shop from "./pages/Shop";

const router = createBrowserRouter([
    {
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        errorElement: <RouteError />,
        children: [
            { path: "/", element: <Navigate to="/home" replace /> },
            { path: "/home", element: <Home /> },
            { path: "/auth/login", element: <LoginPage /> },
            { path: "/game/maps/:id", element: <Explorer type="maps" /> },
            { path: "/game/spots/:id", element: <Explorer type="spots" /> },
            { path: "/game/places/:id", element: <Explorer type="places" /> },
            { path: "/shop", element: <Shop /> },
            { path: "*", element: <RouteError /> },
        ],
    },
]);
export default function App() {
    return <RouterProvider router={router} />;
}
