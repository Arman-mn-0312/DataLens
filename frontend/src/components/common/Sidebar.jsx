import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDataLens } from '../../context/DataLensContext';
import { AnalysisProgressTracker } from './AnalysisProgressTracker';
import { 
  LayoutDashboard, 
  FileSearch, 
  AlertTriangle, 
  Copy, 
  Binary, 
  Activity, 
  BarChart3, 
  Info, 
  FileText,
  Check,
  Clock
} from 'lucide-react';

export const Sidebar = () => {
  const { reportStatus, isAnalyzed } = useDataLens();

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

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-nav-group">
          <div className="sidebar-label">Investigation Workflows</div>

          <NavLink to="/overview" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <FileSearch size={16} />
              <span>Dataset Overview</span>
            </div>
            {getStatusBadge('overview')}
          </NavLink>

          <NavLink to="/missing" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <AlertTriangle size={16} />
              <span>Missing Values</span>
            </div>
            {getStatusBadge('missing')}
          </NavLink>

          <NavLink to="/duplicate" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <Copy size={16} />
              <span>Duplicate Records</span>
            </div>
            {getStatusBadge('duplicate')}
          </NavLink>

          <NavLink to="/datatype" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <Binary size={16} />
              <span>Datatype Validation</span>
            </div>
            {getStatusBadge('datatype')}
          </NavLink>

          <NavLink to="/outlier" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <Activity size={16} />
              <span>Outlier Detection</span>
            </div>
            {getStatusBadge('outlier')}
          </NavLink>
        </div>

        <div className="sidebar-nav-group">
          <div className="sidebar-label">Executive View</div>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <BarChart3 size={16} />
              <span>Master Dashboard</span>
            </div>
            {getStatusBadge('dashboard')}
          </NavLink>
        </div>

        <div className="sidebar-nav-group">
          <div className="sidebar-label">Platform & Help</div>
          <NavLink to="/about" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <Info size={16} />
              <span>About DataLens</span>
            </div>
          </NavLink>
          <NavLink to="/documentation" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
            <div className="item-left">
              <FileText size={16} />
              <span>Documentation</span>
            </div>
          </NavLink>
        </div>
      </div>

      <AnalysisProgressTracker />
    </aside>
  );
};
