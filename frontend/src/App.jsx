import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DataLensProvider } from './context/DataLensContext';
import { MainLayout } from './layouts/MainLayout';
import { LandingLayout } from './layouts/LandingLayout';

import { Home } from './pages/Home';
import { Upload } from './pages/Upload';
import { Overview } from './pages/Overview';
import { MissingValues } from './pages/MissingValues';
import { Duplicates } from './pages/Duplicates';
import { DatatypeValidation } from './pages/DatatypeValidation';
import { OutlierDetection } from './pages/OutlierDetection';
import { Dashboard } from './pages/Dashboard';
import { About } from './pages/About';
import { Documentation } from './pages/Documentation';
import { NotFound } from './pages/NotFound';

import './styles/index.css';
import './styles/components.css';

export const App = () => {
  return (
    <DataLensProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Route */}
          <Route element={<LandingLayout />}>
            <Route path="/" element={<Home />} />
          </Route>

          {/* Main Application Workspace Routes */}
          <Route element={<MainLayout />}>
            <Route path="/upload" element={<Upload />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/missing" element={<MissingValues />} />
            <Route path="/duplicate" element={<Duplicates />} />
            <Route path="/datatype" element={<DatatypeValidation />} />
            <Route path="/outlier" element={<OutlierDetection />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataLensProvider>
  );
};

export default App;
