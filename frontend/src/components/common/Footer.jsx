import React from 'react';
import { Layers } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-surface)',
      padding: '1.75rem 2rem',
      fontSize: '0.85rem',
      color: 'var(--text-muted)',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--text-heading)' }}>
          <Layers size={16} color="var(--primary)" />
          <span>DataLens – Data Quality Impact Investigator</span>
        </div>

        <div>
          Enterprise Data Quality Engine • Standalone React Architecture
        </div>

        <div>
          © {new Date().getFullYear()} DataLens Platform
        </div>
      </div>
    </footer>
  );
};
