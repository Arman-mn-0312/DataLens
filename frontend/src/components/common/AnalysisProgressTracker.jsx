import React from 'react';
import { useDataLens } from '../../context/DataLensContext';
import { CheckCircle2, Clock, Loader2, UploadCloud } from 'lucide-react';

export const AnalysisProgressTracker = () => {
  const { reportStatus, isUploaded, isAnalyzed } = useDataLens();

  const steps = [
    { id: 'upload', label: '1. Upload', isUploadStep: true },
    { id: 'overview', label: '2. Overview' },
    { id: 'missing', label: '3. Missing Values' },
    { id: 'duplicate', label: '4. Duplicate Records' },
    { id: 'datatype', label: '5. Datatype Validation' },
    { id: 'outlier', label: '6. Outlier Detection' },
    { id: 'dashboard', label: '7. Dashboard' }
  ];

  const getStepStatus = (step) => {
    if (step.isUploadStep) {
      return isUploaded ? 'Completed' : 'Pending';
    }
    const status = reportStatus[step.id];
    if (status === 'ready') return 'Completed';
    if (status === 'loading') return 'Loading';
    return 'Pending';
  };

  const completedCount = steps.filter(s => getStepStatus(s) === 'Completed').length;

  return (
    <div className="progress-tracker-card fade-in">
      <div className="tracker-header">
        <span className="tracker-title">Workflow Pipeline</span>
        <span className="tracker-badge">
          {completedCount}/{steps.length} Completed
        </span>
      </div>

      <div className="tracker-list">
        {steps.map(step => {
          const status = getStepStatus(step);
          
          return (
            <div key={step.id} className="tracker-step" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="step-icon">
                  {status === 'Completed' && <CheckCircle2 size={14} color="var(--success)" />}
                  {status === 'Loading' && <Loader2 size={14} className="spin" color="var(--primary)" />}
                  {status === 'Pending' && <Clock size={14} color="var(--text-dim)" />}
                </span>
                <span style={{ 
                  color: status === 'Completed' ? 'var(--text-heading)' : 'var(--text-muted)',
                  fontWeight: status === 'Completed' ? 500 : 400,
                  fontSize: '0.785rem'
                }}>
                  {step.label}
                </span>
              </div>

              <span style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                color: status === 'Completed' ? 'var(--success)' : status === 'Loading' ? 'var(--primary)' : 'var(--text-dim)',
                backgroundColor: status === 'Completed' ? 'var(--success-light)' : status === 'Loading' ? 'var(--primary-light)' : 'transparent',
                padding: '0.1rem 0.35rem',
                borderRadius: '3px'
              }}>
                {status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
