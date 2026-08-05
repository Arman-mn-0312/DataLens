import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataLens } from '../../context/DataLensContext';
import { DataLensLogo } from './DataLensLogo';
import { Sun, Moon, FileText, Info, UploadCloud, CheckCircle2 } from 'lucide-react';

export const Navbar = () => {
  const { theme, toggleTheme, isUploaded, isAnalyzed, dataset } = useDataLens();
  const location = useLocation();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand" style={{ padding: 0, textDecoration: 'none' }}>
        <DataLensLogo iconSize={32} showText={true} />
      </Link>

      {isUploaded && (
        <div className="dataset-status-pill">
          <span className={`status-dot ${isAnalyzed ? 'active' : ''}`} />
          <span style={{ fontWeight: 600 }}>{dataset?.filename || 'dataset.csv'}</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
            ({dataset?.filesize || '4.8 MB'})
          </span>
          {isAnalyzed ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Analyzed
            </span>
          ) : (
            <span style={{ color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}>
              Pending Analysis
            </span>
          )}
        </div>
      )}

      <nav className="navbar-nav">
        <Link 
          to="/upload" 
          className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}
        >
          <UploadCloud size={16} /> Upload
        </Link>
        <Link 
          to="/documentation" 
          className={`nav-link ${location.pathname === '/documentation' ? 'active' : ''}`}
        >
          <FileText size={16} /> Documentation
        </Link>
        <Link 
          to="/about" 
          className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
        >
          <Info size={16} /> About
        </Link>
        
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
