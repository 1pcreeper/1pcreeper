/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider.tsx';
import { Layout } from './components/Layout.tsx';
import { Login } from './pages/Login.tsx';
import { VehiclesList } from './pages/VehiclesList.tsx';
import { VehicleDetails } from './pages/VehicleDetails.tsx';
import { VehicleExplorer } from './pages/VehicleExplorer.tsx';
import { AddVehicle } from './pages/AddVehicle.tsx';
import { Dashboard } from './pages/Dashboard.tsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<VehiclesList />} />
            <Route path="/vehicles/new" element={<AddVehicle />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/vehicles/:id/explorer" element={<VehicleExplorer />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
