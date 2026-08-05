import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export const QualityGaugeChart = ({ score = 65, rating = "Requires Attention", description = "Unified dataset reliability score based on missing value density, duplicates, schema mismatches, and outlier anomalies." }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  let gaugeColor = 'var(--warning)';
  let bgBadgeColor = 'var(--warning-light)';
  let borderColor = 'var(--warning-border)';
  if (score >= 80) {
    gaugeColor = 'var(--success)';
    bgBadgeColor = 'var(--success-light)';
    borderColor = 'var(--success-border)';
  }
  if (score < 50) {
    gaugeColor = 'var(--danger)';
    bgBadgeColor = 'var(--danger-light)';
    borderColor = 'var(--danger-border)';
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0.5rem 0' }}>
      {/* Status & Color Indicator Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.75rem',
        borderRadius: 'var(--radius-full)',
        backgroundColor: bgBadgeColor,
        border: `1px solid ${borderColor}`,
        marginBottom: '0.5rem'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: gaugeColor }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: gaugeColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {rating}
        </span>
      </div>

      {/* Radial Gauge */}
      <div style={{ position: 'relative', width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              dataKey="value"
            >
              <Cell key="score" fill={gaugeColor} />
              <Cell key="remaining" fill="var(--bg-hover)" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        <div style={{ position: 'absolute', bottom: '15px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-heading)', lineHeight: 1, letterSpacing: '-0.03em' }}>
            {score}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            out of 100
          </div>
        </div>
      </div>

      {/* Short Description */}
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.4', maxWidth: '280px' }}>
        {description}
      </p>
    </div>
  );
};
