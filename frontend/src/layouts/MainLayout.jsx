import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Navbar onMenuToggle={() => setIsSidebarOpen(prev => !prev)} />
      <div className="workspace-container">
        <Sidebar isOpen={isSidebarOpen} onNavigate={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && <button type="button" className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation" />}
        <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)' }}>
          <Outlet />
        </main>
      </div>
      <Footer className="main-footer" />
    </div>
  );
};
