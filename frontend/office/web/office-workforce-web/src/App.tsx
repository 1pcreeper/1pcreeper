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
import CompanyDetails from './pages/companies/_id/CompanyDetails';
import Dashboard from './pages/companies/_id/dashboard/Dashboard';
import Departments from './pages/companies/_id/departments/Departments';
import Periods from './pages/companies/_id/periods/Periods';
import Schedules from './pages/companies/_id/schedules/Schedules';
import PersonDetails from './pages/persons/_id/PersonDetails';
import Persons from './pages/persons/Persons';
import StaffDetails from './pages/staffs/_id/StaffDetails';
import Staffs from './pages/staffs/Staffs';
import Places from './pages/companies/_id/places/Places';
import Occupations from './pages/companies/_id/occupations/Occupations';
import Organizations from './pages/organizations/Organizations';
import OrganizationDetails from './pages/organizations/_id/OrganizationDetails';

import ErrorPage from '@/pages/error/Error';

const router = createBrowserRouter([
    {
        path: "/",
        element: <BasicRoute />,
        errorElement: <ErrorPage />,
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
                                        path: "/companies/:id/info",
                                        element: <CompanyDetails />
                                    },
                                    {
                                        path: "/companies/:id/schedules",
                                        element: <Schedules />
                                    },
                                    {
                                        path: "/companies/:id/departments",
                                        element: <Departments />
                                    },
                                    {
                                        path: "/companies/:id/periods",
                                        element: <Periods />
                                    },
                                    {
                                        path: "/companies/:id/places",
                                        element: <Places />
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
                                        path: "/persons",
                                        element: <Persons />
                                    },
                                    {
                                        path: "/persons/:id",
                                        element: <PersonDetails />
                                    },
                                    {
                                        path: "/organizations",
                                        element: <Organizations />
                                    },
                                    {
                                        path: "/organizations/:id",
                                        element: <OrganizationDetails />
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
