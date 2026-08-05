import React from 'react';

export const SeverityBadge = ({ level = 'Low' }) => {
  const normalizedLevel = level.toLowerCase();

  let badgeClass = 'badge-low';
  if (normalizedLevel === 'medium') badgeClass = 'badge-medium';
  if (normalizedLevel === 'high') badgeClass = 'badge-high';
  if (normalizedLevel === 'critical') badgeClass = 'badge-critical';

  return (
    <span className={`badge ${badgeClass}`}>
      {level} Severity
    </span>
  );
};
