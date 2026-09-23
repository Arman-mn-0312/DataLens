import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDataLens } from '../../context/DataLensContext';
import { useAuth } from '../../auth/AuthContext';
import { DataLensLogo } from './DataLensLogo';
import { Sun, Moon, UploadCloud, CheckCircle2, Menu, UserRound, ArrowRight, LogIn, LogOut } from 'lucide-react';

export const Navbar = ({ onMenuToggle }) => {
  const { theme, toggleTheme, isUploaded, dataset } = useDataLens();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        {isAuthenticated ? (
          <>
            <Link 
              to="/upload" 
              className={`nav-link ${location.pathname === '/upload' ? 'active' : ''}`}
            >
              <UploadCloud size={16} /> Upload
            </Link>

            <div className="navbar-profile-container" ref={profileRef} style={{ position: 'relative' }}>
              <button
                type="button"
                className="navbar-profile-widget"
                aria-label="User profile"
                aria-expanded={isProfileMenuOpen}
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                style={{ cursor: 'pointer', background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', padding: '0.25rem' }}
              >
                <div className="navbar-profile-icon"><UserRound size={17} /></div>
              </button>

              {isProfileMenuOpen && (
                <div
                  className="user-menu-dropdown"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    minWidth: '200px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    padding: '0.85rem',
                    zIndex: 200,
                  }}
                >
                  <div style={{ paddingBottom: '0.65rem', marginBottom: '0.65rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name || 'User'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email || ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem 0.5rem',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--danger, #ef4444)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <LogIn size={15} /> Login
            </Link>
            <Link 
              to="/register" 
              className="btn btn-primary"
              style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Register <ArrowRight size={14} />
            </Link>
          </>
        )}

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

