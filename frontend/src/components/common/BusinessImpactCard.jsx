import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const BusinessImpactCard = ({ impact }) => {
  return (
    <div className="impact-card fade-in">
      <div className="card-callout-header">
        <AlertCircle size={18} />
        <span>Business Impact Investigation</span>
      </div>
      <p style={{ color: 'var(--text-main)', fontSize: '0.925rem', lineHeight: '1.6' }}>
        {impact}
      </p>
    </div>
  );
};

export const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="recommendation-card fade-in">
      <div className="card-callout-header">
        <CheckCircle size={18} />
        <span>Actionable Engineering Recommendation</span>
      </div>
      <p style={{ color: 'var(--text-main)', fontSize: '0.925rem', lineHeight: '1.6' }}>
        {recommendation}
      </p>
    </div>
  );
};
