import React from 'react';
import { Link } from 'react-router-dom';
import logoHorizontal from '../assets/logo/datalens-logo-horizontal.svg';
import logoDark from '../assets/logo/datalens-logo-dark.svg';
import { useDataLens } from '../context/DataLensContext';
import { ShieldCheck, Zap, ArrowRight, FileCheck, BarChart2 } from 'lucide-react';

export const Home = () => {
  const { theme } = useDataLens();

  return (
    <div style={{ backgroundColor: 'var(--bg-canvas)', minHeight: 'calc(100vh - var(--navbar-height))' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '4rem 1.5rem 3rem 1.5rem',
        textAlign: 'center'
      }} className="fade-in">
        
        {/* Horizontal Brand Logo System Display */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <img 
            src={theme === 'dark' ? logoDark : logoHorizontal} 
            alt="DataLens Official Brand Logo" 
            style={{ height: '72px', width: 'auto', objectFit: 'contain' }}
          />
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--primary-light)',
          color: 'var(--primary)',
          border: '1px solid var(--primary-border)',
          padding: '0.35rem 0.85rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.825rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <ShieldCheck size={15} /> AI-Inspired Data Quality Impact Investigator
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          color: 'var(--text-heading)',
          maxWidth: '900px',
          margin: '0 auto 1.25rem auto'
        }}>
          Don't just detect data errors. Understand their business impact.
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '680px',
          margin: '0 auto 2.25rem auto',
          lineHeight: 1.6
        }}>
          DataLens transforms raw quality statistics into actionable business risk assessments and step-by-step remediation advice for data teams.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/upload" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            Upload Dataset <ArrowRight size={18} />
          </Link>
          <Link to="/overview" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
            Explore Sample Investigation
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem 5rem 1.5rem' }}>
        <div className="grid-cols-3">
          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <Zap size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Contextual Business Impact</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Translates raw error counts (like 12% missing values) into concrete enterprise risks, such as revenue model bias and billing errors.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <FileCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>On-Demand Guided Pipeline</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Overview auto-loads immediately. Deep-dive reports on duplicates, schema mismatches, and outliers load lazily only when requested.
            </p>
          </div>

          <div className="card">
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--warning-light)',
              color: 'var(--warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}>
              <BarChart2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Algorithmic Health Scoring</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Calculates a unified 0–100 Dataset Health Score with itemized point deductions to guide executive triage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
