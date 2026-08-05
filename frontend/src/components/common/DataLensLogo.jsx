import React from 'react';
import datalensLogoSvg from '../../assets/icons/datalens-logo.svg';

export const DataLensLogo = ({ iconSize = 32, showText = true, textStyle = {} }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      <img 
        src={datalensLogoSvg} 
        alt="DataLens Icon" 
        style={{ 
          width: `${iconSize}px`, 
          height: `${iconSize}px`, 
          objectFit: 'contain',
          display: 'block' 
        }} 
      />
      {showText && (
        <span style={{ 
          fontWeight: 800, 
          fontSize: '1.25rem', 
          color: 'var(--text-heading)', 
          letterSpacing: '-0.025em',
          ...textStyle 
        }}>
          Data<span style={{ color: 'var(--primary)' }}>Lens</span>
        </span>
      )}
    </div>
  );
};

export default DataLensLogo;
