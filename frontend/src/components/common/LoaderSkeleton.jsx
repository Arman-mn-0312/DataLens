import React from 'react';
import datalensLogoSvg from '../../assets/icons/datalens-logo.svg';

export const LoaderSkeleton = ({ message = "Analyzing report data..." }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3.5rem 1.5rem', gap: '1.25rem' }}>
      {/* 64x64 px SVG Icon above Loading Text */}
      <div>
        <img 
          src={datalensLogoSvg} 
          alt="DataLens Loading Icon" 
          style={{ 
            width: '64px', 
            height: '64px', 
            objectFit: 'contain',
            animation: 'pulseSkeleton 1.5s infinite ease-in-out'
          }} 
        />
      </div>

      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>
        {message}
      </div>

      <div className="grid-cols-4" style={{ width: '100%', marginTop: '1rem' }}>
        <div className="skeleton" style={{ height: '90px' }} />
        <div className="skeleton" style={{ height: '90px' }} />
        <div className="skeleton" style={{ height: '90px' }} />
        <div className="skeleton" style={{ height: '90px' }} />
      </div>

      <div className="skeleton" style={{ width: '100%', height: '120px' }} />
      <div className="skeleton" style={{ width: '100%', height: '240px' }} />
    </div>
  );
};
