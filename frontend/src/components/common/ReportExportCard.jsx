import React, { useState } from 'react';
import { useDataLens } from '../../context/DataLensContext';
import { downloadReportFile } from '../../services/api';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles 
} from 'lucide-react';

export const ReportExportCard = ({ style = {} }) => {
  const { dataset, isUploaded } = useDataLens();
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'pdf' | 'excel' | null
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string } | null

  const handleDownload = async (format) => {
    if (!isUploaded) return;
    
    setDownloadingFormat(format);
    setFeedback(null);

    try {
      await downloadReportFile(format, dataset?.filename);
      setFeedback({
        type: 'success',
        message: `${format.toUpperCase()} report generated & downloaded successfully.`
      });
      // Clear success feedback after 4 seconds
      setTimeout(() => setFeedback(null), 4000);
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

  return (
    <div className="card" style={{ 
      background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
      border: '1px solid var(--border-color)',
      padding: '1.5rem',
      ...style 
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-heading)', margin: 0 }}>
              Export Quality Audit Reports
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
            Generate and download formatted reports containing full analysis results, severity audits, business impacts, and actionable recommendations.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Download PDF Button */}
          <button
            type="button"
            id="download-pdf-btn"
            className="btn btn-primary"
            onClick={() => handleDownload('pdf')}
            disabled={!isUploaded || downloadingFormat !== null}
            style={{
              opacity: (!isUploaded || downloadingFormat !== null) ? 0.65 : 1,
              cursor: (!isUploaded || downloadingFormat !== null) ? 'not-allowed' : 'pointer'
            }}
          >
            {downloadingFormat === 'pdf' ? (
              <>
                <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <FileText size={16} />
                <span>Download PDF Report</span>
              </>
            )}
          </button>

          {/* Download Excel Button */}
          <button
            type="button"
            id="download-excel-btn"
            className="btn btn-secondary"
            onClick={() => handleDownload('excel')}
            disabled={!isUploaded || downloadingFormat !== null}
            style={{
              opacity: (!isUploaded || downloadingFormat !== null) ? 0.65 : 1,
              cursor: (!isUploaded || downloadingFormat !== null) ? 'not-allowed' : 'pointer',
              borderColor: 'var(--border-strong)'
            }}
          >
            {downloadingFormat === 'excel' ? (
              <>
                <Loader2 size={16} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Generating Excel...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet size={16} color="var(--success)" />
                <span>Download Excel Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Inline Feedback Banner */}
      {feedback && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 0.9rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem',
          marginTop: '0.75rem',
          backgroundColor: feedback.type === 'success' ? 'var(--success-light)' : 'var(--danger-light)',
          color: feedback.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${feedback.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};
