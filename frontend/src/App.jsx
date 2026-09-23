import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataLensProvider } from './context/DataLensContext';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { LandingLayout } from './layouts/LandingLayout';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { GoogleCallback } from './pages/GoogleCallback';
import { Upload } from './pages/Upload';
import { Overview } from './pages/Overview';
import { MissingValues } from './pages/MissingValues';
import { Duplicates } from './pages/Duplicates';
import { DatatypeValidation } from './pages/DatatypeValidation';
import { OutlierDetection } from './pages/OutlierDetection';
import { Dashboard } from './pages/Dashboard';
import { ReportsExport } from './pages/ReportsExport';
import { About } from './pages/About';
import { Documentation } from './pages/Documentation';
import { NotFound } from './pages/NotFound';

import './styles/index.css';
import './styles/components.css';

export const App = () => {
  return (
    <AuthProvider>
      <DataLensProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
            </Route>

            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/upload" element={<Upload />} />
              <Route path="/overview" element={<Overview />} />
              <Route path="/missing" element={<MissingValues />} />
              <Route path="/duplicate" element={<Duplicates />} />
              <Route path="/datatype" element={<DatatypeValidation />} />
              <Route path="/outlier" element={<OutlierDetection />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/reports" element={<ReportsExport />} />
              <Route path="/about" element={<About />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DataLensProvider>
    </AuthProvider>
  );
};

export default App;
