import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const LandingLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div style={{ marginTop: 'var(--navbar-height)', flex: 1 }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};
