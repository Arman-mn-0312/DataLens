import React, { useEffect } from 'react';
import { useDataLens } from '../context/DataLensContext';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { QualityGaugeChart } from '../components/charts/QualityGaugeChart';
import { IssueDistributionChart } from '../components/charts/IssueDistributionChart';
import { LoaderSkeleton } from '../components/common/LoaderSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { BarChart3, ShieldAlert, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

export const Dashboard = () => {
  const { isUploaded, isAnalyzed, reportData, reportStatus, loadReport } = useDataLens();

  useEffect(() => {
    if (isAnalyzed && reportStatus.dashboard !== 'ready') {
      loadReport('dashboard');
    }
  }, [isAnalyzed]);

  if (!isUploaded || !isAnalyzed) {
    return <EmptyState title="Dataset Analysis Pending" message="Upload a CSV dataset and click 'Analyze Dataset' to view the Executive Master Dashboard." />;
  }

  if (reportStatus.dashboard === 'loading' || !reportData.dashboard) {
    return <LoaderSkeleton message="Aggregating Master Data Quality Dashboard..." />;
  }

  const dash = reportData.dashboard;
  const summary = dash.summary;
  const statusState = reportStatus.dashboard === 'ready' ? 'Generated' : reportStatus.dashboard === 'loading' ? 'Loading' : 'Not Generated';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader 
        title="Executive Data Quality Dashboard"
        subtitle="Unified quality score breakdown, issue distribution, and priority triage for stakeholders."
        icon={BarChart3}
        badge={
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', backgroundColor: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            Status: {statusState}
          </span>
        }
      />

      {/* Top Banner: Priority Focus */}
      <div className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '1.5rem', backgroundColor: 'var(--danger-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>
          <ShieldAlert size={20} />
          <span>Highest Priority Action Item</span>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
          {summary.highest_priority}
        </div>
        <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Requires immediate intervention before presenting reports or pushing dataset into production analytical models.
        </p>
      </div>

      {/* Grid: Health Score Card + Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Executive Quality Score
          </h4>
          <QualityGaugeChart 
            score={summary.health_score} 
            rating={summary.status} 
            description="Composite executive health score evaluating dataset reliability and business risks."
          />
        </div>

        <div className="grid-cols-3">
          <StatCard 
            label="Total Quality Anomalies"
            value={summary.total_issues?.toLocaleString()}
            subtext="Combined issue count across dataset"
            icon={AlertTriangle}
            color="var(--warning)"
          />
          <StatCard 
            label="Critical Severity Defects"
            value={summary.critical_issues?.toLocaleString()}
            subtext="Highest business impact risks"
            icon={ShieldAlert}
            color="var(--critical)"
          />
          <StatCard 
            label="High Severity Defects"
            value={summary.high_issues?.toLocaleString()}
            subtext="Action required before production"
            icon={CheckCircle}
            color="var(--danger)"
          />
        </div>
      </div>

      {/* Grid: Chart + Score Breakdown */}
      <div className="grid-cols-2" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Issue Type Distribution</h3>
          <IssueDistributionChart />
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Deduction Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(dash.score_breakdown || {}).map(([key, score]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{key}</span>
                <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '1rem' }}>
                  {score} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights Section */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>
          <Lightbulb size={20} color="var(--primary)" />
          <span>Executive Investigation Insights</span>
        </div>
        <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {dash.quick_insights?.map((insight, idx) => (
            <li key={idx} style={{ color: 'var(--text-main)', fontSize: '0.925rem' }}>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
