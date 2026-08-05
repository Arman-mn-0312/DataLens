import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Info, ShieldCheck, Calculator, Code2, ArrowRight, Zap, AlertTriangle, Copy, Binary, Activity } from 'lucide-react';

export const About = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="fade-in">
      <PageHeader 
        title="About DataLens"
        subtitle="Platform architecture, data quality investigation philosophy, and health score methodology."
        icon={Info}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Core Vision Card with High-Contrast Primary Highlights */}
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Core Purpose & Vision</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Contextual Investigation Platform
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.975rem' }}>
            DataLens is an enterprise <span style={{ color: 'var(--primary)', fontWeight: 700, backgroundColor: 'var(--primary-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Data Quality Impact Investigator</span>. Unlike traditional BI dashboards or exploratory data analysis (EDA) tools that simply present static error counts (such as <span style={{ color: 'var(--danger)', fontWeight: 600 }}>"12% missing values"</span>), DataLens explains <strong style={{ color: 'var(--text-heading)' }}>why</strong> issues matter, <strong style={{ color: 'var(--danger)' }}>which business processes</strong> are at risk, and <strong style={{ color: 'var(--success)' }}>what precise technical steps</strong> engineers should take to remediate them.
          </p>
        </div>

        {/* Health Score Calculation Methodology with Colorful Penalty Cards */}
        <div className="card" style={{ borderLeft: '4px solid var(--brand)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-light)',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calculator size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Dataset Health Score Algorithm</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--brand)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Algorithmic 0 to 100 Triage Model
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.975rem', marginBottom: '1.25rem' }}>
            DataLens evaluates dataset reliability on a unified <span style={{ color: 'var(--success)', fontWeight: 700, backgroundColor: 'var(--success-light)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid var(--success-border)' }}>0 to 100 Health Scale</span>. The score starts at 100 (Perfect Health) and applies itemized penalty deductions based on weighted risk severity:
          </p>

          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            {/* Missing Value Penalty Card */}
            <div style={{ 
              padding: '1.15rem', 
              backgroundColor: 'var(--warning-light)', 
              borderRadius: 'var(--radius-md)', 
              borderLeft: '4px solid var(--warning)',
              border: '1px solid var(--warning-border)',
              borderLeftWidth: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--warning)' }}>
                  <AlertTriangle size={18} />
                  <span>Missing Value Penalty</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--warning)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Up to -25 pts
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                Deducts points proportional to null cell density in critical numerical and categorical attributes.
              </div>
            </div>

            {/* Duplicate Record Penalty Card */}
            <div style={{ 
              padding: '1.15rem', 
              backgroundColor: 'var(--info-light)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--info-border)',
              borderLeft: '4px solid var(--info)',
              borderLeftWidth: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--info)' }}>
                  <Copy size={18} />
                  <span>Duplicate Record Penalty</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--info)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Up to -20 pts
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                Deducts points based on artificial record volume inflation and double-counting risk in reporting.
              </div>
            </div>

            {/* Datatype Mismatch Penalty Card */}
            <div style={{ 
              padding: '1.15rem', 
              backgroundColor: 'var(--brand-light)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)',
              borderLeft: '4px solid var(--brand)',
              borderLeftWidth: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--brand)' }}>
                  <Binary size={18} />
                  <span>Datatype Mismatch Penalty</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--brand)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Up to -25 pts
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                Deducts points for non-conforming schema patterns that trigger downstream ETL pipeline crashes.
              </div>
            </div>

            {/* Outlier Anomaly Penalty Card */}
            <div style={{ 
              padding: '1.15rem', 
              backgroundColor: 'var(--danger-light)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--danger-border)',
              borderLeft: '4px solid var(--danger)',
              borderLeftWidth: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--danger)' }}>
                  <Activity size={18} />
                  <span>Outlier Anomaly Penalty</span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', backgroundColor: 'var(--danger)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  Up to -30 pts
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                Deducts points for extreme numerical outliers that distort mean revenue and regression statistics.
              </div>
            </div>
          </div>
        </div>

        {/* Decoupled Architecture with Vibrant Diagram Badges */}
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--success-light)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Code2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Decoupled Enterprise Architecture</h3>
              <span style={{ fontSize: '0.775rem', color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Modular Separation of Concerns
              </span>
            </div>
          </div>

          <p style={{ color: 'var(--text-main)', lineHeight: '1.7', fontSize: '0.975rem', marginBottom: '1.25rem' }}>
            DataLens strictly enforces a decoupled separation of concerns between backend analytical computation and frontend user presentation:
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr auto 1fr', 
            alignItems: 'center', 
            gap: '1.25rem', 
            padding: '1.5rem', 
            backgroundColor: 'var(--bg-subtle)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border-color)',
            textAlign: 'center' 
          }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', backgroundColor: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                Analytical Layer
              </span>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.05rem', marginTop: '0.4rem' }}>Python Backend Engine</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Analysis Engine • Services • Reports</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
              <ArrowRight size={24} color="var(--primary)" />
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dim)' }}>REST API</span>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xs)' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#ffffff', backgroundColor: 'var(--success)', padding: '0.15rem 0.5rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                Presentation Layer
              </span>
              <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1.05rem', marginTop: '0.4rem' }}>Standalone React Frontend</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Vite • React Router • Recharts • Design Tokens</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
