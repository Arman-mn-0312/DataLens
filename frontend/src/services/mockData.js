// Realistic DataLens Backend Payload Service

export const SAMPLE_PREVIEW_DATA = {
  filename: "customer_analytics_q3.csv",
  filesize: "4.8 MB",
  uploadedAt: new Date().toLocaleDateString(),
  columns: [
    { name: "customer_id", type: "integer" },
    { name: "full_name", type: "string" },
    { name: "email_address", type: "string" },
    { name: "age", type: "integer" },
    { name: "account_tier", type: "string" },
    { name: "monthly_spend", type: "float" },
    { name: "signup_date", type: "date" },
    { name: "churn_risk_score", type: "float" }
  ],
  rows: [
    { customer_id: 1001, full_name: "Eleanor Vance", email_address: "e.vance@apex.io", age: 34, account_tier: "Enterprise", monthly_spend: 1250.50, signup_date: "2023-01-15", churn_risk_score: 0.12 },
    { customer_id: 1002, full_name: "Marcus Holloway", email_address: "m.holloway@ctos.org", age: null, account_tier: "Pro", monthly_spend: 299.00, signup_date: "2023-02-01", churn_risk_score: 0.45 },
    { customer_id: 1003, full_name: "Sophia Martinez", email_address: "smartinez@gmail.com", age: 29, account_tier: "Enterprise", monthly_spend: 2450.00, signup_date: "2022-11-20", churn_risk_score: 0.05 },
    { customer_id: 1004, full_name: "David Chen", email_address: "invalid_email_format", age: 42, account_tier: "Standard", monthly_spend: 49.99, signup_date: "2023-04-10", churn_risk_score: 0.88 },
    { customer_id: 1005, full_name: "Eleanor Vance", email_address: "e.vance@apex.io", age: 34, account_tier: "Enterprise", monthly_spend: 1250.50, signup_date: "2023-01-15", churn_risk_score: 0.12 },
    { customer_id: 1006, full_name: "Aisha Patel", email_address: "apatel@technova.com", age: 51, account_tier: "Pro", monthly_spend: null, signup_date: "2021-08-05", churn_risk_score: 0.22 },
    { customer_id: 1007, full_name: "Liam O'Connor", email_address: "loconnor@dublin.ie", age: -5, account_tier: "Standard", monthly_spend: 99.00, signup_date: "2023-05-12", churn_risk_score: 0.65 },
    { customer_id: 1008, full_name: "Zoe Washington", email_address: "zwashington@gov.us", age: 38, account_tier: "Enterprise", monthly_spend: 98500.00, signup_date: "2020-03-30", churn_risk_score: 0.02 },
    { customer_id: 1009, full_name: "Benjamin Ray", email_address: "bray@startup.co", age: 27, account_tier: null, monthly_spend: 149.00, signup_date: "2023-06-18", churn_risk_score: 0.31 },
    { customer_id: 1010, full_name: "Hannah Abbott", email_address: "habbott@hogwarts.edu", age: 31, account_tier: "Pro", monthly_spend: 349.50, signup_date: "2022-09-01", churn_risk_score: 0.18 }
  ]
};

export const MOCK_REPORTS = {
  overview: {
    dataset_name: "customer_analytics_q3.csv",
    total_rows: 15420,
    total_columns: 8,
    memory_usage_mb: 4.82,
    numeric_columns: 4,
    categorical_columns: 4,
    total_missing_values: 1845,
    total_duplicate_records: 312,
    health_score: 65,
    health_rating: "Fair",
    analyzed_at: "Just now"
  },
  missing: {
    total_missing_values: 1845,
    percentage_missing_rows: 11.96,
    overall_severity: "High",
    business_impact: "Missing values in 'age' and 'monthly_spend' can severely skew customer lifetime value calculations and bias revenue projections in predictive churn models.",
    recommendation: "Impute numerical missing values using median segment strategies for financial metrics, and flag missing account tiers for operational remediation before downstream ETL jobs.",
    columns: [
      { column_name: "age", missing_count: 820, missing_pct: 5.31, datatype: "integer", severity: "Medium" },
      { column_name: "monthly_spend", missing_count: 540, missing_pct: 3.50, datatype: "float", severity: "High" },
      { column_name: "account_tier", missing_count: 315, missing_pct: 2.04, datatype: "string", severity: "Medium" },
      { column_name: "email_address", missing_count: 170, missing_pct: 1.10, datatype: "string", severity: "Low" }
    ]
  },
  duplicate: {
    total_duplicate_rows: 312,
    percentage_duplicates: 2.02,
    overall_severity: "Medium",
    business_impact: "Duplicate customer profiles cause artificial inflation of active user counts, leading to double-counting in billing reports and wasted marketing campaign spend.",
    recommendation: "Execute record deduplication filtering based on unique natural key 'customer_id' and 'email_address' prior to aggregating quarterly business metrics.",
    duplicate_samples: [
      { customer_id: 1001, full_name: "Eleanor Vance", email_address: "e.vance@apex.io", duplicate_count: 2 },
      { customer_id: 1044, full_name: "Robert Langdon", email_address: "rlangdon@harvard.edu", duplicate_count: 3 },
      { customer_id: 1189, full_name: "Claire Underwood", email_address: "cunderwood@dc.gov", duplicate_count: 2 }
    ]
  },
  datatype: {
    total_invalid_types: 148,
    columns_analyzed: 8,
    overall_severity: "High",
    business_impact: "Invalid datatypes (such as malformed email addresses and negative age values) prevent automated data validation pipelines from executing cleanly, resulting in silent pipeline failures.",
    recommendation: "Enforce strict schema validation rules at the ingestion gate to drop or quarantine non-conforming rows before data lake landing.",
    issues: [
      { column_name: "email_address", expected_type: "email", detected_type: "string", invalid_count: 94, severity: "High", issue_description: "Contains string values lacking valid domain syntax (e.g. 'invalid_email_format')." },
      { column_name: "age", expected_type: "positive_integer", detected_type: "integer", invalid_count: 38, severity: "High", issue_description: "Contains negative numbers (e.g. -5, -12) violating domain logic." },
      { column_name: "signup_date", expected_type: "ISO8601_date", detected_type: "string", invalid_count: 16, severity: "Medium", issue_description: "Contains non-standard date string formats." }
    ]
  },
  outlier: {
    total_outliers: 215,
    columns_analyzed: 4,
    overall_severity: "Critical",
    business_impact: "Extreme anomalies in 'monthly_spend' (values > $90,000/mo) distort mean revenue statistics by over 340%, leading executives to overestimate baseline customer profitability.",
    recommendation: "Apply robust IQR trimming or log transformation to financial metrics to prevent extreme values from distorting regression models.",
    summary: [
      { column_name: "monthly_spend", outlier_count: 142, percentage: 0.92, lower_bound: 0.00, upper_bound: 3500.00, min_val: 0.00, max_val: 98500.00, severity: "Critical" },
      { column_name: "churn_risk_score", outlier_count: 45, percentage: 0.29, lower_bound: 0.00, upper_bound: 0.95, min_val: 0.00, max_val: 1.00, severity: "Medium" },
      { column_name: "age", outlier_count: 28, percentage: 0.18, lower_bound: 18, upper_bound: 85, min_val: -5, max_val: 142, severity: "High" }
    ]
  },
  dashboard: {
    summary: {
      health_score: 65,
      status: "Requires Attention",
      highest_priority: "Extreme Outliers in Monthly Spend",
      total_issues: 2520,
      critical_issues: 142,
      high_issues: 952
    },
    score_breakdown: {
      "Missing Values": -12,
      "Duplicate Records": -8,
      "Datatype Mismatches": -5,
      "Outlier Anomalies": -10
    },
    quick_insights: [
      "Dataset overall health is 65/100 (Fair). Primary risk stems from un-trimmed financial outliers.",
      "11.96% of rows contain at least one missing attribute.",
      "312 exact duplicate customer records detected, representing ~2.02% artificial record inflation.",
      "Invalid emails and negative ages represent schema validation risks."
    ]
  }
};

// Simulated delay helper for lazy loading report inspection
export const fetchReportData = (reportKey) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_REPORTS[reportKey] || null);
    }, 600); // 600ms realistic network load simulation
  });
};
