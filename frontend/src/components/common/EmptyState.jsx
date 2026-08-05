import React from 'react';
import { Database } from 'lucide-react';

export const EmptyState = ({ title = "No Dataset Loaded", message = "Please upload a CSV dataset to execute the DataLens investigation workflow.", action }) => {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem', margin: '2rem 0' }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-subtle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        marginBottom: '1rem'
      }}>
        <Database size={28} />
      </div>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ maxWidth: '460px', margin: '0 auto 1.5rem auto' }}>{message}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
