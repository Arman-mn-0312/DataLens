import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export const IssueDistributionChart = () => {
  const data = [
    { name: 'Missing Values', count: 1845, color: '#f59e0b' },
    { name: 'Duplicates', count: 312, color: '#3b82f6' },
    { name: 'Invalid Types', count: 148, color: '#8b5cf6' },
    { name: 'Outliers', count: 215, color: '#ef4444' }
  ];

  return (
    <div style={{ width: '100%', height: '240px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }}
            itemStyle={{ color: 'var(--text-heading)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DatatypeDonutChart = () => {
  const data = [
    { name: 'Numeric (Float/Int)', value: 4, color: '#3b82f6' },
    { name: 'Categorical (String)', value: 4, color: '#10b981' }
  ];

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={75}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
