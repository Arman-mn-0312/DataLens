import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useDataLens } from '../../context/DataLensContext';
import { AnalysisProgressTracker } from './AnalysisProgressTracker';
import { 
  Home as HomeIcon,
  FileSearch, 
  AlertTriangle, 
  Copy, 
  Binary, 
  Activity, 
  BarChart3, 
  FileDown,
  Info,
  FileText,
  Database,
  UploadCloud,
  ChevronDown,
  UserRound,
  CircleCheck,
  CircleDashed,
  X
} from 'lucide-react';

const qualityItems = [
  { to: '/overview', label: 'Overview', icon: FileSearch, status: 'overview' },
  { to: '/missing', label: 'Missing Values', icon: AlertTriangle, status: 'missing' },
  { to: '/duplicate', label: 'Duplicate Records', icon: Copy, status: 'duplicate' },
  { to: '/datatype', label: 'Datatype Validation', icon: Binary, status: 'datatype' },
  { to: '/outlier', label: 'Outlier Detection', icon: Activity, status: 'outlier' }
];

export const Sidebar = ({ isOpen = true, onNavigate }) => {
  const { reportStatus, dataset, isUploaded } = useDataLens();
  const location = useLocation();
  const [openSections, setOpenSections] = useState({ quality: true, reports: false, dataset: false });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusBadge = (reportId) => {
    const status = reportStatus[reportId];
    if (status === 'ready') {
      return <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-light)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Ready</span>;
    }
    if (status === 'loading') {
      return <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Loading...</span>;
    }
    return <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-dim)', backgroundColor: 'var(--bg-hover)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Pending</span>;
  };

  const renderSection = (id, label, children, active) => (
    <div className="sidebar-nav-group sidebar-collapsible-group">
      <button
        type="button"
        className={`sidebar-section-header ${active ? 'has-active-child' : ''}`}
        aria-expanded={openSections[id]}
        onClick={() => toggleSection(id)}
      >
        <span className="section-header-left">{label}</span>
        <ChevronDown className="chevron-icon" size={16} style={{ transform: openSections[id] ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <div className={`sidebar-sub-menu ${openSections[id] ? 'is-open' : ''}`} aria-hidden={!openSections[id]}>
        {children}
      </div>
    </div>
  );

  const closeOnNavigate = () => onNavigate?.();

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-mobile-header">
          <span className="sidebar-mobile-title">Navigation</span>
          <button type="button" className="sidebar-close-button" onClick={closeOnNavigate} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-nav-group">
          <div className="sidebar-label">Main</div>
          <NavLink to="/" end onClick={closeOnNavigate} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left"><HomeIcon size={16} /><span>Home</span></div>
          </NavLink>
          <NavLink to="/dashboard" onClick={closeOnNavigate} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left"><BarChart3 size={16} /><span>Dashboard</span></div>
            {getStatusBadge('dashboard')}
          </NavLink>
        </div>

        {renderSection('quality', 'Data Quality Analysis', qualityItems.map(({ to, label, icon: Icon, status }) => (
          <NavLink key={to} to={to} onClick={closeOnNavigate} className={({ isActive }) => `sidebar-sub-item ${isActive ? 'active' : ''}`}>
            <span className="item-left"><Icon size={15} /><span>{label}</span></span>
            {getStatusBadge(status)}
          </NavLink>
        )), qualityItems.some(item => location.pathname === item.to))}

        {renderSection('reports', 'Reports', (
          <NavLink to="/reports" onClick={closeOnNavigate} className={({ isActive }) => `sidebar-sub-item ${isActive ? 'active' : ''}`}>
            <span className="item-left"><FileDown size={15} /><span>Generate &amp; Download Reports</span></span>
          </NavLink>
        ), location.pathname === '/reports')}

        {renderSection('dataset', 'Dataset', (
          <>
            <NavLink to="/upload" onClick={closeOnNavigate} className={({ isActive }) => `sidebar-sub-item ${isActive ? 'active' : ''}`}>
              <span className="item-left"><UploadCloud size={15} /><span>Upload Dataset</span></span>
            </NavLink>
            <div className="sidebar-dataset-info" aria-label="Current dataset">
              <div className="sidebar-dataset-heading"><Database size={15} /><span>Current Dataset</span></div>
              <span className="sidebar-dataset-name">{isUploaded ? dataset?.filename : 'No dataset selected'}</span>
              <span className={`sidebar-dataset-status ${isUploaded ? 'ready' : ''}`}>
                {isUploaded ? <CircleCheck size={13} /> : <CircleDashed size={13} />}
                {isUploaded ? 'Dataset Ready' : 'No Dataset'}
              </span>
            </div>
          </>
        ), location.pathname === '/upload')}

        <div className="sidebar-divider" />
        <div className="sidebar-nav-group sidebar-bottom-links">
          <NavLink to="/documentation" onClick={closeOnNavigate} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left"><FileText size={16} /><span>Documentation</span></div>
          </NavLink>
          <NavLink to="/about" onClick={closeOnNavigate} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left"><Info size={16} /><span>About</span></div>
          </NavLink>
        </div>

        <div className="sidebar-profile-card">
          <div className="sidebar-profile-icon"><UserRound size={18} /></div>
          <div><strong>DataLens User</strong><span>Analyst</span></div>
        </div>

        <div className="sidebar-progress-section">
          <AnalysisProgressTracker />
        </div>
      </div>
    </aside>
  );
};
