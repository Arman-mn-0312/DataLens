import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataLens } from '../../context/DataLensContext';
import { DataLensLogo } from './DataLensLogo';
import { Sun, Moon, UploadCloud, CheckCircle2, Menu, UserRound } from 'lucide-react';

export const Navbar = ({ onMenuToggle }) => {
  const { theme, toggleTheme, isUploaded, isAnalyzed, dataset } = useDataLens();
  const location = useLocation();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" style={{ padding: 0, textDecoration: 'none' }}>
        <DataLensLogo iconSize={32} showText={true} />
      </Link>

      {isUploaded && (
        <div className="dataset-status-pill">
          <span className="status-dot active" />
          <span style={{ fontWeight: 600 }}>{dataset?.filename || 'dataset.csv'}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            ({dataset?.filesize || '4.8 MB'})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Active Dataset
          </span>
        </div>
      )}

      <nav className="navbar-nav">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="nav-link mobile-menu-button"
            title="Open navigation"
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>
        )}
        <Link 
          to="/upload" 
          className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}
        >
          <UploadCloud size={16} /> Upload
        </Link>

        <div className="navbar-profile-widget" aria-label="User profile" title="User profile">
          <div className="navbar-profile-icon"><UserRound size={17} /></div>
        </div>
        
        <button 
          onClick={toggleTheme} 
          className="nav-link" 
          title="Toggle Theme"
          style={{ padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-md)' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </nav>
    </header>
  );
};
