import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }} className="fade-in">
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--bg-subtle)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-dim)',
        marginBottom: '1rem'
      }}>
        <FileQuestion size={32} />
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404 - Page Not Found</h1>
      <p style={{ maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
        The page or report view you requested does not exist in DataLens.
      </p>
      <Link to="/overview" className="btn btn-primary">
        Return to Overview
      </Link>
    </div>
  );
};
