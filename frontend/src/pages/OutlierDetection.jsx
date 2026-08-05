import React, { useEffect } from 'react';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { BusinessImpactCard, RecommendationCard } from '../components/common/BusinessImpactCard';
import { CustomTable } from '../components/common/CustomTable';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Activity, Columns, ShieldAlert } from 'lucide-react';

export const OutlierDetection = () => {
  const { isUploaded, isAnalyzed, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isAnalyzed && reportStatus.outlier !== 'ready') {
      loadReport('outlier');
    }
  }, [isAnalyzed]);

  if (!isUploaded || !isAnalyzed) {
    return <EmptyState title="Dataset Analysis Pending" message="Upload a CSV dataset and click 'Analyze Dataset' to view the Outlier Detection Report." />;
  }

  if (reportStatus.outlier === 'loading' || !reportData.outlier) {
    return <LoaderSkeleton message="Executing Statistical Outlier & IQR Anomaly Detection..." />;
  }

  const report = reportData.outlier;
  const statusState = reportStatus.outlier === 'ready' ? 'Generated' : reportStatus.outlier === 'loading' ? 'Loading' : 'Not Generated';

  const tableColumns = [
    { header: 'Numerical Column', accessor: 'column_name', render: (val) => <code>{val}</code> },
    { header: 'Outlier Count', accessor: 'outlier_count', render: (val) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{val}</span> },
    { header: 'Outlier %', accessor: 'percentage', render: (val) => `${val}%` },
    { header: 'Lower Bound (IQR)', accessor: 'lower_bound', render: (val) => val?.toLocaleString() },
    { header: 'Upper Bound (IQR)', accessor: 'upper_bound', render: (val) => val?.toLocaleString() },
    { header: 'Max Value Detected', accessor: 'max_val', render: (val) => <span style={{ color: 'var(--critical)', fontWeight: 700 }}>{val?.toLocaleString()}</span> },
    { header: 'Severity', accessor: 'severity', render: (val) => <SeverityBadge level={val} /> }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Outlier Detection Investigation"
        subtitle="Statistical anomaly detection using Interquartile Range (IQR) bounds to identify metric distortion."
        icon={Activity}
        badge={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              Status: {statusState}
            </span>
            <SeverityBadge level={report.overall_severity} />
          </div>
        }
      />

      {/* Summary Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '1.5rem' }}>
        <StatCard 
          label="Total Statistical Outliers"
          value={report.total_outliers?.toLocaleString()}
          subtext="Values exceeding 1.5x IQR bounds"
          icon={Activity}
          color="var(--critical)"
        />
        <StatCard 
          label="Numerical Columns Checked"
          value={report.columns_analyzed}
          subtext="Continuous numeric variables"
          icon={Columns}
          color="var(--primary)"
        />
        <StatCard 
          label="Model Distortion Severity"
          value={report.overall_severity}
          subtext="High risk to mean & variance metrics"
          icon={ShieldAlert}
          color="var(--danger)"
        />
      </div>

      {/* Impact & Recommendation Callouts */}
      <BusinessImpactCard impact={report.business_impact} />
      <RecommendationCard recommendation={report.recommendation} />

      {/* Summary Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Numerical Anomaly Breakdown</h3>
        <CustomTable columns={tableColumns} data={report.summary || []} />
      </div>
    </div>
  );
};
