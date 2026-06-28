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
import Organizations from './pages/companies/_id/organizations/Organizations';
import Periods from './pages/companies/_id/periods/Periods';
import Schedules from './pages/companies/_id/schedules/Schedules';
import PersonDetails from './pages/persons/_id/PersonDetails';
import Persons from './pages/persons/Persons';
import StaffDetails from './pages/staffs/_id/StaffDetails';
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
                                        path: "/companies/:id/schedules",
                                        element: <Schedules />
                                    },
                                    {
                                        path: "/companies/:id/organizations",
                                        element: <Organizations />
                                    },
                                    {
                                        path: "/companies/:id/periods",
                                        element: <Periods />
                                    },
                                    {
                                        path: "/companies/:id/staffs",
                                        element: <Staffs />
                                    },
                                    {
                                        path: "/persons",
                                        element: <Persons />
                                    },
                                    {
                                        path: "/persons/:id",
                                        element: <PersonDetails />
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
