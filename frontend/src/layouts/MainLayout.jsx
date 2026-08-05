import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Footer } from '../components/common/Footer';

export const MainLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="workspace-container">
        <Sidebar />
        <main className="main-content" style={{ marginLeft: 'var(--sidebar-width)' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
