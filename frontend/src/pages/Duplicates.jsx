import React, { useEffect } from 'react';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { BusinessImpactCard, RecommendationCard } from '../components/common/BusinessImpactCard';
import { CustomTable } from '../components/common/CustomTable';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Copy, Percent, AlertCircle } from 'lucide-react';

export const Duplicates = () => {
  const { isUploaded, isAnalyzed, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isAnalyzed && reportStatus.duplicate !== 'ready') {
      loadReport('duplicate');
    }
  }, [isAnalyzed]);

  if (!isUploaded || !isAnalyzed) {
    return <EmptyState title="Dataset Analysis Pending" message="Upload a CSV dataset and click 'Analyze Dataset' to view the Duplicate Records Report." />;
  }

  if (reportStatus.duplicate === 'loading' || !reportData.duplicate) {
    return <LoaderSkeleton message="Running Record Deduplication & Match Engine..." />;
  }

  const report = reportData.duplicate;
  const statusState = reportStatus.duplicate === 'ready' ? 'Generated' : reportStatus.duplicate === 'loading' ? 'Loading' : 'Not Generated';

  const tableColumns = [
    { header: 'Natural Key (Customer ID)', accessor: 'customer_id', render: (val) => <code>{val}</code> },
    { header: 'Full Name', accessor: 'full_name' },
    { header: 'Email Address', accessor: 'email_address' },
    { header: 'Duplicate Frequency', accessor: 'duplicate_count', render: (val) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{val}x Duplicate</span> }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Duplicate Records Investigation"
        subtitle="Identification of redundant, identical, and conflicting entity rows in your dataset."
        icon={Copy}
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
          label="Total Duplicate Rows"
          value={report.total_duplicate_rows?.toLocaleString()}
          subtext="Identical entity observations"
          icon={Copy}
          color="var(--info)"
        />
        <StatCard 
          label="Dataset Inflation Rate"
          value={`${report.percentage_duplicates}%`}
          subtext="Proportion of artificial record volume"
          icon={Percent}
          color="var(--warning)"
        />
        <StatCard 
          label="Operational Impact"
          value={report.overall_severity}
          subtext="Risk of double-counting in reporting"
          icon={AlertCircle}
          color="var(--danger)"
        />
      </div>

      {/* Impact & Recommendation Callouts */}
      <BusinessImpactCard impact={report.business_impact} />
      <RecommendationCard recommendation={report.recommendation} />

      {/* Sample Duplicates Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Sample Duplicate Entity Pairs</h3>
        <CustomTable columns={tableColumns} data={report.duplicate_samples || []} />
      </div>
    </div>
  );
};
