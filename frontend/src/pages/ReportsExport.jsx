import React, { useState } from 'react';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { downloadReportFile } from '../services/api';
import { 
  FileDown, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers, 
  ShieldCheck, 
  Table, 
  Activity, 
  Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReportsExport = () => {
  const { isUploaded, dataset, reportData } = useDataLens();
  const [downloadingFormat, setDownloadingFormat] = useState(null);
  const [feedback, setFeedback] = useState(null);

  if (!isUploaded) {
    return (
      <EmptyState 
        title="No Dataset Uploaded"
        message="Please upload a CSV, XLSX, or JSON dataset to generate downloadable reports."
        action={
          <Link to="/upload" className="btn btn-primary">
            Go to Upload Page
          </Link>
        }
      />
    );
  }

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    setFeedback(null);

    try {
      await downloadReportFile(format, dataset?.filename);
      setFeedback({
        type: 'success',
        message: `${format.toUpperCase()} report generated & downloaded successfully.`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error(`Export ${format} error:`, err);
      setFeedback({
        type: 'error',
        message: err.message || `Failed to generate ${format.toUpperCase()} report. Please ensure the backend is active.`
      });
    } finally {
      setDownloadingFormat(null);
    }
  };

  const overview = reportData?.overview || {};
  const dash = reportData?.dashboard?.summary || {};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Generate & Download Reports"
        subtitle="Export comprehensive quality reports based on actual DataLens analysis results."
        icon={FileDown}
        badge={
          <span style={{ 
            fontSize: '0.8rem', 
            fontWeight: 600, 
            color: 'var(--success)', 
            backgroundColor: 'var(--success-light)', 
            border: '1px solid var(--success-border)', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px' 
          }}>
            Analysis Active: {dataset?.filename || 'dataset.csv'}
          </span>
        }
      />

      {/* Dataset Summary Snapshot */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: 'var(--radius-lg)', 
            backgroundColor: 'var(--primary-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Sparkles size={24} color="var(--primary)" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-heading)' }}>
              {dataset?.filename || 'Active Dataset'}
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              {overview.total_rows ? `${overview.total_rows.toLocaleString()} records` : ''} 
              {overview.total_columns ? ` • ${overview.total_columns} columns` : ''} 
              {dash.health_score !== undefined ? ` • Health Score: ${dash.health_score}/100` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/dashboard" className="btn btn-secondary" style={{ fontSize: '0.825rem' }}>
            View Dashboard
          </Link>
          <Link to="/overview" className="btn btn-secondary" style={{ fontSize: '0.825rem' }}>
            View Overview
          </Link>
        </div>
      </div>

      {/* Global Feedback Toast */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 1.15rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem',
          marginBottom: '1.5rem',
          backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{feedback.message}</span>
        </div>
      )}

      {/* Two Export Options Cards */}
      <div className="grid-cols-2" style={{ marginBottom: '2rem' }}>
        {/* Option 1: PDF Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'var(--danger-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <FileText size={22} color="var(--danger)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-heading)' }}>
                  Executive PDF Audit Report
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  FORMAT: .PDF • MULTI-PAGE BRIEFING
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              A formatted, management-ready audit report formatted with executive scorecards, severity color coding, detailed anomaly tables, business impact evaluations, and strategic recommendations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Executive Health Score & Score Breakdown</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Missing, Duplicate, Datatype & Outlier Tables</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Business Impact & Remediation Action Matrix</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>DataLens Branding, Header/Footer & Dynamic Page Numbers</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem' }}
          >
            {downloadingFormat === 'pdf' ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating PDF Report...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>

        {/* Option 2: Excel Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: 'var(--radius-md)', 
                backgroundColor: 'var(--success-light)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <FileSpreadsheet size={22} color="var(--success)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-heading)' }}>
                  Data Engineering Excel Workbook
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  FORMAT: .XLSX • 7 STRUCTURED SHEETS
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              A structured multi-tab Excel workbook containing full dataset quality matrices, duplicate sample records, schema verification tables, statistical outlier thresholds, and remediation action items.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Sheet 1: Executive Summary & Score Deduction</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Sheets 2-6: Overview, Missing, Duplicate, Type & Outlier</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Sheet 7: Strategic Quality Recommendations Matrix</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={15} color="var(--success)" />
                <span>Styled Dark Slate Headers, Auto-Widths & Severity Cells</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat !== null}
            style={{ width: '100%', padding: '0.75rem 1rem', fontSize: '0.95rem', borderColor: 'var(--border-strong)' }}
          >
            {downloadingFormat === 'excel' ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating Excel Workbook...</span>
              </>
            ) : (
              <>
                <Download size={18} color="var(--success)" />
                <span>Download Excel Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
