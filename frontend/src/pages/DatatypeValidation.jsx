import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { BusinessImpactCard, RecommendationCard } from '../components/common/BusinessImpactCard';
import { CustomTable } from '../components/common/CustomTable';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Binary, Columns, AlertTriangle } from 'lucide-react';

export const DatatypeValidation = () => {
  const { isUploaded, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isUploaded && reportStatus.datatype === 'pending') {
      loadReport('datatype');
    }
  }, [isUploaded, reportStatus.datatype]);

  if (!isUploaded) {
    return (
      <EmptyState 
        title="No Dataset Uploaded" 
        message="Please upload a CSV dataset to view the Datatype Validation Report." 
        action={
          <Link to="/upload" className="btn btn-primary">
            Go to Upload Page
          </Link>
        }
      />
    );
  }

  if (reportStatus.datatype === 'error') {
    return (
      <EmptyState
        title="Unable to Load Datatype Validation Report"
        message="The report request failed. Please try again."
        action={<button className="btn btn-primary" onClick={() => loadReport('datatype')}>Retry</button>}
      />
    );
  }

  if (reportStatus.datatype === 'loading' || !reportData.datatype) {
    return <LoaderSkeleton message="Executing Schema Datatype & Pattern Validation..." />;
  }

  const report = reportData.datatype;
  const statusState = reportStatus.datatype === 'ready' ? 'Generated' : reportStatus.datatype === 'loading' ? 'Loading' : 'Not Generated';

  const tableColumns = [
    { header: 'Attribute Column', accessor: 'column_name', render: (val) => <code>{val}</code> },
    { header: 'Expected Schema Type', accessor: 'expected_type', render: (val) => <span style={{ color: 'var(--success)', fontWeight: 600 }}>{val}</span> },
    { header: 'Detected Format', accessor: 'detected_type', render: (val) => <span style={{ color: 'var(--text-muted)' }}>{val}</span> },
    { header: 'Non-Conforming Count', accessor: 'invalid_count', render: (val) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{val}</span> },
    { header: 'Issue Description', accessor: 'issue_description' },
    { header: 'Severity', accessor: 'severity', render: (val) => <SeverityBadge level={val} /> }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Datatype Validation Investigation"
        subtitle="Verification of schema compliance, pattern enforcement, and datatype integrity."
        icon={Binary}
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
          label="Total Invalid Values"
          value={report.total_invalid_types?.toLocaleString()}
          subtext="Non-conforming data values"
          icon={AlertTriangle}
          color="var(--danger)"
        />
        <StatCard 
          label="Columns Analyzed"
          value={report.columns_analyzed}
          subtext="Total schema attributes checked"
          icon={Columns}
          color="var(--primary)"
        />
        <StatCard 
          label="Pipeline Breaking Risk"
          value={report.overall_severity}
          subtext="Risk of unhandled downstream ETL crash"
          icon={Binary}
          color="var(--critical)"
        />
      </div>

      {/* Impact & Recommendation Callouts */}
      <BusinessImpactCard impact={report.business_impact} />
      <RecommendationCard recommendation={report.recommendation} />

      {/* Issues Table */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Non-Conforming Schema Attributes</h3>
        <CustomTable columns={tableColumns} data={report.issues || []} />
      </div>
    </div>
  );
};
