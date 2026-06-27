/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Login from '@/pages/auth/Login';
import Companies from '@/pages/companies/Companies';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import BasicProtected from './components/protected/BasicProtected';
import { OfficeAuthContextProvider } from './contexts/OfficeAuthContext';
import Orchestrator from './Orchestrator';
import Logout from './pages/auth/Logout';
import Dashboard from './pages/companies/_id/dashboard/Dashboard';
import Occupations from './pages/companies/_id/occupations/Occupations';
import Organizations from './pages/companies/_id/organizations/Organizations';
import Periods from './pages/companies/_id/periods/Periods';
import Places from './pages/companies/_id/places/Places';
import Schedules from './pages/companies/_id/schedules/Schedules';
import StaffDetails from './pages/staffs/StaffDetails';
import Staffs from './pages/staffs/Staffs';

const router = createBrowserRouter([
    {
        path: "/",
        element: <BasicRoute />,
        children: [
            {
                path: "/",
                element: <Orchestrator />,
                children: [
                    {
                        path: "/",
                        element: <Navigate to="/companies" replace />
                    },
                    {
                        path: "/",
                        children: [
                            {
                                path: "/auth/login",
                                element: <Login />
                            },
                            {
                                path: "/auth/logout",
                                element: <Logout />
                            },
                        ]
                    },
                    {
                        path: "/",
                        element: <BasicProtected />,
                        children: [
                            {
                                path: "/",
                                element: <AppShell />,
                                children: [
                                    {
                                        path: "/companies",
                                        element: <Companies />
                                    },
                                    {
                                        path: "/companies/:id/dashboard",
                                        element: <Dashboard />
                                    },
                                    {
                                        path: "/companies/:id/organizations",
                                        element: <Organizations />
                                    },
                                    {
                                        path: "/companies/:id/places",
                                        element: <Places />
                                    },
                                    {
                                        path: "/companies/:id/periods",
                                        element: <Periods />
                                    },
                                    {
                                        path: "/companies/:id/occupations",
                                        element: <Occupations />
                                    },
                                    {
                                        path: "/companies/:id/staffs",
                                        element: <Staffs />
                                    },
                                    {
                                        path: "/companies/:id/schedules",
                                        element: <Schedules />
                                    },
                                    {
                                        path: "/staffs/:id",
                                        element: <StaffDetails />
                                    },
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
]);

function BasicRoute() {
    return (
        <OfficeAuthContextProvider>
            <Outlet />
        </OfficeAuthContextProvider>
    );
}

export default function App() {
    return (
        <RouterProvider router={router}>
        </RouterProvider>
    );
}
