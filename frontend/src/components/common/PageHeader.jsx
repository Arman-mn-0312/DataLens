import React from 'react';

export const PageHeader = ({ title, subtitle, icon: Icon, badge, actions }) => {
  return (
    <div className="page-header fade-in">
      <div className="header-title-group">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {Icon && <Icon size={24} color="var(--primary)" />}
          <h1>{title}</h1>
          {badge && <div>{badge}</div>}
        </div>
        {subtitle && <p style={{ marginTop: '0.25rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.75rem' }}>{actions}</div>}
    </div>
  );
};
