import React, { useEffect } from 'react';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { BusinessImpactCard, RecommendationCard } from '../components/common/BusinessImpactCard';
import { CustomTable } from '../components/common/CustomTable';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { AlertTriangle, Percent, Hash, ShieldAlert } from 'lucide-react';

export const MissingValues = () => {
  const { isUploaded, isAnalyzed, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isAnalyzed && reportStatus.missing !== 'ready') {
      loadReport('missing');
    }
  }, [isAnalyzed]);

  if (!isUploaded || !isAnalyzed) {
    return <EmptyState title="Dataset Analysis Pending" message="Upload a CSV dataset and click 'Analyze Dataset' to view the Missing Values Report." />;
  }

  if (reportStatus.missing === 'loading' || !reportData.missing) {
    return <LoaderSkeleton message="Executing Missing Values Investigation Engine..." />;
  }

  const report = reportData.missing;
  const statusState = reportStatus.missing === 'ready' ? 'Generated' : reportStatus.missing === 'loading' ? 'Loading' : 'Not Generated';

  const tableColumns = [
    { header: 'Attribute Column', accessor: 'column_name', render: (val) => <code style={{ fontWeight: 600 }}>{val}</code> },
    { header: 'Missing Count', accessor: 'missing_count', render: (val) => val?.toLocaleString() },
    { header: 'Missing %', accessor: 'missing_pct', render: (val) => `${val}%` },
    { header: 'Detected Datatype', accessor: 'datatype', render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span> },
    { header: 'Column Severity', accessor: 'severity', render: (val) => <SeverityBadge level={val} /> }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Missing Values Investigation"
        subtitle="Detection of null, unassigned, and missing data attributes across columns."
        icon={AlertTriangle}
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
          label="Total Missing Cells"
          value={report.total_missing_values?.toLocaleString()}
          subtext="Null or empty observations"
          icon={Hash}
          color="var(--warning)"
        />
        <StatCard 
          label="Affected Rows Percentage"
          value={`${report.percentage_missing_rows}%`}
          subtext="Proportion of incomplete rows"
          icon={Percent}
          color="var(--danger)"
        />
        <StatCard 
          label="Overall Risk Severity"
          value={report.overall_severity}
          subtext="Based on critical column impact"
          icon={ShieldAlert}
          color="var(--critical)"
        />
      </div>

      {/* Impact & Recommendation Callouts */}
      <BusinessImpactCard impact={report.business_impact} />
      <RecommendationCard recommendation={report.recommendation} />

      {/* Column Breakdown Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Column-level Missing Value Breakdown</h3>
        <CustomTable columns={tableColumns} data={report.columns || []} />
      </div>
    </div>
  );
};
