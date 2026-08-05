import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { FileText, BookOpen, ShieldAlert } from 'lucide-react';

export const Documentation = () => {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="fade-in">
      <PageHeader 
        title="DataLens Documentation & User Guide"
        subtitle="Comprehensive guide to interpreting reports, understanding severity classifications, and taking action."
        icon={FileText}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Severity Classification Guide */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldAlert size={22} />
            <h3 style={{ fontSize: '1.25rem' }}>Severity Level Classification Guide</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--info)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <SeverityBadge level="Low" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Informational / Low Impact</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Minor data anomalies (such as missing optional email attributes) that do not break pipeline execution or distort core financial metrics.
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--warning)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <SeverityBadge level="Medium" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Operational Caution</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Defects (such as duplicate rows or missing age values) that cause record inflation or mild bias in segmentation models.
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--danger)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <SeverityBadge level="High" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>High Priority Risk</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Schema non-conformance (such as invalid email syntax or negative age values) that can trigger silent downstream ETL failures.
              </p>
            </div>

            <div style={{ padding: '0.85rem 1rem', borderLeft: '4px solid var(--critical)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <SeverityBadge level="Critical" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-heading)' }}>Critical Executive Alert</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>
                Extreme numerical outliers (such as monthly spend values &gt; $90,000) that distort baseline revenue means by over 300%.
              </p>
            </div>
          </div>
        </div>

        {/* Report Types Interpretation Guide */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--brand)', marginBottom: '1rem' }}>
            <BookOpen size={22} />
            <h3 style={{ fontSize: '1.25rem' }}>Report Types & Interpretation Guide</h3>
          </div>

          <div className="grid-cols-2" style={{ gap: '1.25rem' }}>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '0.35rem', color: 'var(--primary)' }}>Missing Value Report</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Evaluates empty cell density across columns. Use the recommendation card to select between median imputation or record dropping.
              </p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '0.35rem', color: 'var(--primary)' }}>Duplicate Records Report</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Identifies identical rows using natural keys. Deduplicating these records prevents double-billing and artificial metric inflation.
              </p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '0.35rem', color: 'var(--primary)' }}>Datatype Validation Report</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Checks string formatting and numerical bounds. Helps engineers configure ingestion schema validators before data landing.
              </p>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ marginBottom: '0.35rem', color: 'var(--primary)' }}>Outlier Detection Report</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Uses 1.5x IQR statistical bounds to isolate extreme anomalies. Essential for sanitizing training data for machine learning models.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
