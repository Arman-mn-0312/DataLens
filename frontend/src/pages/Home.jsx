import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  FileCheck,
  BarChart2,
  AlertTriangle,
  Layers,
  Database,
  CheckCircle2,
  TrendingUp,
  Search,
  Sparkles,
  SlidersHorizontal,
  FileText,
  Activity,
  ChevronRight,
  LogIn
} from 'lucide-react';

export const Home = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  // Investigation Workflow Scenarios
  const scenarios = [
    {
      title: 'Missing Customer Email Addresses',
      category: 'Missing Values',
      problem: '14.2% (1,420 rows) missing customer email values in sales pipeline dataset.',
      severity: 'HIGH',
      severityClass: 'badge-high',
      impact: 'Drives marketing automation failures, drops campaign deliverability, and risks $42,000/mo in lost re-engagement revenue.',
      recommendation: 'Impute missing contacts from CRM cross-reference table; enforce mandatory email validation at signup API endpoint.',
    },
    {
      title: 'Extreme Order Amount Outlier Spike',
      category: 'Outlier Detection',
      problem: 'Order value $9,999,999.00 detected in transaction record #48102.',
      severity: 'CRITICAL',
      severityClass: 'badge-critical',
      impact: 'Skews average order metric (AOV) by +340%, inflating executive revenue forecasts and corrupting quarterly financial reports.',
      recommendation: 'Truncate outlier at 99.9th percentile ($12,500) or quarantine test transaction ID before loading into BI warehouse.',
    },
    {
      title: 'Duplicate Transaction Ref IDs',
      category: 'Duplicate Records',
      problem: '312 identical reference IDs discovered across payment settlement batch.',
      severity: 'HIGH',
      severityClass: 'badge-high',
      impact: 'Triggers double-billing in accounting pipeline and inflates total reported sales volume by $18,400.',
      recommendation: 'Deduplicate on unique `(transaction_id, timestamp)` composite key and reject duplicate webhook events.',
    },
    {
      title: 'Mixed Datatype in Financial Columns',
      category: 'Schema Validation',
      problem: 'String placeholders ("N/A", "NONE") detected in numeric currency column `tax_paid`.',
      severity: 'MEDIUM',
      severityClass: 'badge-medium',
      impact: 'Causes downstream pandas & SQL ETL pipeline crashes during daily automated financial consolidation.',
      recommendation: 'Cast non-numeric strings to NULL float representation and enforce strict float schema validation.',
    },
  ];

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="landing-container hero-grid">
          <div className="hero-content animate-fade-in">
            <div className="section-eyebrow">
              <ShieldCheck size={15} /> AI-Powered Data Quality Impact Engine
            </div>
            
            <h1 className="hero-headline">
              Turn messy data into <span className="highlight">confident decisions</span>.
            </h1>

            <p className="hero-description">
              DataLens goes beyond surface-level profiling. Instantly discover missing values, duplicates, schema errors, and outliers — and measure their exact financial & operational business impact.
            </p>

            <div className="hero-actions">
              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="btn btn-primary hero-btn-primary">
                    Go to Workspace <ArrowRight size={18} />
                  </Link>
                  <Link to="/dashboard" className="btn btn-secondary hero-btn-secondary">
                    View Quality Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary hero-btn-primary">
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary hero-btn-secondary">
                    <LogIn size={16} /> Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="hero-trust-badges">
              <div className="hero-trust-item">
                <CheckCircle2 size={16} /> Zero DB Setup Required
              </div>
              <div className="hero-trust-item">
                <CheckCircle2 size={16} /> Instant Automated Health Score
              </div>
              <div className="hero-trust-item">
                <CheckCircle2 size={16} /> Enterprise Grade
              </div>
            </div>
          </div>

          {/* Hero Visual Live Preview Window */}
          <div className="hero-visual animate-fade-in">
            <div className="mockup-window">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="mockup-dot red" />
                  <span className="mockup-dot yellow" />
                  <span className="mockup-dot green" />
                </div>
                <div className="mockup-title">
                  <Activity size={13} color="var(--primary)" /> DataLens Investigation Dashboard • live_sales_q3.csv
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>
                  ● Analysis Ready
                </div>
              </div>

              <div className="mockup-body">
                {/* Score & Health Header */}
                <div className="mockup-score-banner">
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Dataset Health Score
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-heading)' }}>
                      84 / 100 <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>(Needs Attention)</span>
                    </div>
                  </div>
                  <div className="score-circle">
                    84
                    <span className="score-label">SCORE</span>
                  </div>
                </div>

                {/* Metric Summary Stat Pills */}
                <div className="mockup-stat-rows">
                  <div className="mockup-stat-pill">
                    <strong>12,450</strong>
                    <span>Total Rows</span>
                  </div>
                  <div className="mockup-stat-pill">
                    <strong>1,420</strong>
                    <span>Null Values</span>
                  </div>
                  <div className="mockup-stat-pill">
                    <strong>312</strong>
                    <span>Duplicates</span>
                  </div>
                </div>

                {/* Live Detected Issue Card */}
                <div className="mockup-issue-card">
                  <div className="mockup-issue-header">
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertTriangle size={14} /> Critical Business Impact Alert
                    </span>
                    <span className="badge badge-high">HIGH SEVERITY</span>
                  </div>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-main)', margin: '0.3rem 0 0.5rem 0', fontWeight: 500 }}>
                    14.2% Missing Emails in Customer Cohort
                  </p>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <strong>Risk Exposure:</strong> Estimated $42,000/mo churn risk due to un-deliverable receipts & billing notifications.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="works-section">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Zap size={15} /> Simple 5-Step Process
            </div>
            <h2 className="section-title">How DataLens Works</h2>
            <p className="section-subtitle">
              From raw un-audited CSV files to automated executive-level remediation advice in seconds.
            </p>
          </div>

          <div className="works-grid">
            <div className="works-step-card">
              <div className="step-num">01</div>
              <h3>Upload Dataset</h3>
              <p>Drag and drop your raw tabular CSV or data export file. No configuration or pre-formatting needed.</p>
            </div>

            <div className="works-step-card">
              <div className="step-num">02</div>
              <h3>Analyze Data Quality</h3>
              <p>Algorithmic multi-vector scan evaluates missing fields, duplicates, type mismatches, and numerical outliers.</p>
            </div>

            <div className="works-step-card">
              <div className="step-num">03</div>
              <h3>Understand Impact</h3>
              <p>Translates raw data anomalies into contextual enterprise risk ratings and financial exposure metrics.</p>
            </div>

            <div className="works-step-card">
              <div className="step-num">04</div>
              <h3>Get Recommendations</h3>
              <p>Receive step-by-step remediation advice tailored for data engineers, analysts, and business owners.</p>
            </div>

            <div className="works-step-card">
              <div className="step-num">05</div>
              <h3>Take Action</h3>
              <p>Export clean datasets, share executive summary reports, and fix pipeline issues before production.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KEY FEATURES SECTION */}
      <section className="features-section">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <SlidersHorizontal size={15} /> Comprehensive Toolkit
            </div>
            <h2 className="section-title">Built for Modern Data Teams</h2>
            <p className="section-subtitle">
              Everything you need to audit, diagnose, and fix data quality issues across your enterprise stack.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Search size={22} />
              </div>
              <h3>Missing Value Detection</h3>
              <p>Pinpoint null, blank, and dummy placeholder strings across all columns with exact percentage breakdowns.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <Layers size={22} />
              </div>
              <h3>Duplicate Record Audit</h3>
              <p>Identify full and partial row duplications that skew reporting metrics and double-count customer transactions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
                <FileCheck size={22} />
              </div>
              <h3>Data Type Validation</h3>
              <p>Flag schema drift, mixed string/numeric values, and un-parsed timestamp fields before pipeline failure.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                <Activity size={22} />
              </div>
              <h3>Outlier Detection</h3>
              <p>Detect extreme numerical anomalies, z-score deviations, and erroneous data entry values automatically.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--brand-light)', color: 'var(--brand)' }}>
                <ShieldCheck size={22} />
              </div>
              <h3>Severity Assessment</h3>
              <p>Automated risk grading engine categorizes anomalies into Low, Medium, High, and Critical triage tiers.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                <TrendingUp size={22} />
              </div>
              <h3>Business Impact Analysis</h3>
              <p>Quantify potential financial exposure, model bias, and operational friction caused by bad data.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Sparkles size={22} />
              </div>
              <h3>Actionable Guidance</h3>
              <p>Get immediate step-by-step remediation recipes: imputation rules, schema casting, and constraint definitions.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <BarChart2 size={22} />
              </div>
              <h3>Unified Dashboard</h3>
              <p>Single-pane view combining overall Dataset Health Score (0-100) with drill-down quality breakdowns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DATA QUALITY INVESTIGATION WORKFLOW */}
      <section className="investigation-section">
        <div className="landing-container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Database size={15} /> Investigation Workflow
            </div>
            <h2 className="section-title">Beyond Basic Error Detection</h2>
            <p className="section-subtitle">
              DataLens connects raw technical flaws directly to real-world business risks and solutions.
            </p>
          </div>

          {/* Interactive Scenario Selector Tabs */}
          <div className="workflow-tabs-nav">
            {scenarios.map((scenario, index) => (
              <button
                key={index}
                className={`workflow-tab-btn ${activeTab === index ? 'active' : ''}`}
                onClick={() => setActiveTab(index)}
              >
                {scenario.category}
              </button>
            ))}
          </div>

          {/* Selected Scenario Chain Display */}
          <div className="workflow-chain-grid">
            <div className="workflow-node-card highlight">
              <div className="workflow-node-label">1. Problem Detected</div>
              <h4>{scenarios[activeTab].title}</h4>
              <p>{scenarios[activeTab].problem}</p>
            </div>

            <div className="workflow-node-card highlight">
              <div className="workflow-node-label">2. Severity Rating</div>
              <div style={{ margin: '0.2rem 0 0.6rem 0' }}>
                <span className={`badge ${scenarios[activeTab].severityClass}`}>
                  {scenarios[activeTab].severity}
                </span>
              </div>
              <p>Automated impact algorithm flags this issue for immediate engineering prioritization.</p>
            </div>

            <div className="workflow-node-card highlight">
              <div className="workflow-node-label">3. Business Impact</div>
              <h4>Enterprise Exposure</h4>
              <p>{scenarios[activeTab].impact}</p>
            </div>

            <div className="workflow-node-card highlight">
              <div className="workflow-node-label">4. Recommendation</div>
              <h4>Remediation Recipe</h4>
              <p>{scenarios[activeTab].recommendation}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS SECTION */}
      <section className="benefits-section">
        <div className="landing-container benefits-grid">
          <div>
            <div className="section-eyebrow">
              <Sparkles size={15} /> Why Data Quality Matters
            </div>
            <h2 className="section-title" style={{ textAlign: 'left' }}>
              Why Leading Data Teams Rely on DataLens
            </h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              Bad data costs organisations millions in flawed decisions, customer churn, and wasted engineering hours. DataLens gives you clarity.
            </p>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <Search size={20} />
                </div>
                <div>
                  <h4>Expose Hidden Data Quality Problems</h4>
                  <p>Catch subtle corruptions, missing records, and outlier anomalies buried deep in large datasets before they hit production.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4>Quantify Real Business Impact</h4>
                  <p>Speak the language of business leadership by translating technical data metrics into clear revenue risk assessments.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4>Prioritize What Matters Most</h4>
                  <p>Focus engineering bandwidth on critical data flaws that impact operations, rather than spending hours on minor cosmetic issues.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon-box">
                  <FileText size={20} />
                </div>
                <div>
                  <h4>Eliminate Hours of Manual Inspection</h4>
                  <p>Automate tedious pandas profiling scripts and manual spreadsheet checks with instant unified dataset auditing.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Graphic Display Card */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 color="var(--primary)" size={24} /> Data Quality Checklist
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Null & Missing Value Scan</span>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>Automated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Duplicate Row Identification</span>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>Automated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Data Type Schema Drift</span>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>Automated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Statistical Outlier Audit</span>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>Automated</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-border)' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>Business Risk & Remediation</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem' }}>DataLens Core</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="cta-section">
        <div className="landing-container">
          <div className="cta-card">
            <h2>Start Investigating Data Quality Today</h2>
            <p>
              Upload your dataset and discover hidden quality problems, business risks, and remediation advice in seconds.
            </p>

            <div className="cta-actions">
              {isAuthenticated ? (
                <Link to="/upload" className="btn btn-primary hero-btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--text-heading)' }}>
                  Go to Workspace <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary hero-btn-primary" style={{ backgroundColor: '#ffffff', color: 'var(--text-heading)' }}>
                    Get Started Free <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary hero-btn-secondary" style={{ backgroundColor: 'transparent', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)' }}>
                    Sign In to DataLens
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
