import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { QualityGaugeChart } from '../components/charts/QualityGaugeChart';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { FileSearch, Database, Columns, AlertTriangle, Copy, ArrowRight } from 'lucide-react';

export const Overview = () => {
  const { isUploaded, isAnalyzed, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isAnalyzed && reportStatus.overview !== 'ready') {
      loadReport('overview');
    }
  }, [isAnalyzed]);

  if (!isUploaded || !isAnalyzed) {
    return (
      <EmptyState 
        title="Dataset Analysis Pending"
        message="Please upload your CSV file and click 'Analyze Dataset' to view the Overview report."
        action={
          <Link to="/upload" className="btn btn-primary">
            Go to Upload Page
          </Link>
        }
      />
    );
  }

  if (reportStatus.overview === 'loading' || !reportData.overview) {
    return <LoaderSkeleton message="Loading Dataset Overview Report..." />;
  }

  const overview = reportData.overview;
  const statusState = reportStatus.overview === 'ready' ? 'Generated' : reportStatus.overview === 'loading' ? 'Loading' : 'Not Generated';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Dataset Overview"
        subtitle="High-level structural health summary and key volume metrics for your dataset."
        icon={FileSearch}
        badge={
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            Status: {statusState}
          </span>
        }
      />

      {/* Top Grid: Health Score + High Level Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Health Score Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Unified Dataset Health
          </h4>
          <QualityGaugeChart 
            score={overview.health_score} 
            rating={overview.health_rating || "Requires Attention"} 
            description="Base health score reflecting dataset missing density, duplicate rows, schema non-conformance, and outliers."
          />
        </div>

        {/* 4 Stat Cards */}
        <div className="grid-cols-2">
          <StatCard 
            label="Total Records (Rows)"
            value={overview.total_rows?.toLocaleString()}
            subtext="Primary sample observation size"
            icon={Database}
            color="var(--primary)"
          />
          <StatCard 
            label="Total Attributes (Columns)"
            value={overview.total_columns}
            subtext={`${overview.numeric_columns} Numeric • ${overview.categorical_columns} Categorical`}
            icon={Columns}
            color="var(--brand)"
          />
          <StatCard 
            label="Missing Cell Values"
            value={overview.total_missing_values?.toLocaleString()}
            subtext="Requires value imputation"
            icon={AlertTriangle}
            color="var(--warning)"
          />
          <StatCard 
            label="Duplicate Rows"
            value={overview.total_duplicate_records?.toLocaleString()}
            subtext="Target for deduplication filter"
            icon={Copy}
            color="var(--info)"
          />
        </div>
      </div>

      {/* Next Step Navigation Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Choose an Investigation Report</h3>
        <p style={{ marginBottom: '1.25rem' }}>
          Per the DataLens performance architecture, deep-dive reports are generated lazily on-demand. Click any report below to investigate risks and business impact.
        </p>

        <div className="grid-cols-2">
          <Link to="/missing" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.2rem' }}>Missing Value Report</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Investigate missing attributes & business risk</div>
            </div>
            <ArrowRight size={18} color="var(--primary)" />
          </Link>

          <Link to="/duplicate" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.2rem' }}>Duplicate Records Report</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Analyze record inflation & billing impact</div>
            </div>
            <ArrowRight size={18} color="var(--primary)" />
          </Link>

          <Link to="/datatype" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.2rem' }}>Datatype Validation Report</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Detect schema mismatches & malformed data</div>
            </div>
            <ArrowRight size={18} color="var(--primary)" />
          </Link>

          <Link to="/outlier" className="card" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.2rem' }}>Outlier Detection Report</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Identify extreme anomalies skewing metrics</div>
            </div>
            <ArrowRight size={18} color="var(--primary)" />
          </Link>
        </div>
      </div>
    </div>
  );
};
