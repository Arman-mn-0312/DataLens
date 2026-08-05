import React from 'react';

export const CustomTable = ({ columns, data, emptyMessage = 'No records found.' }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="table-container fade-in">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ textAlign: col.align || 'left' }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx}>
              {columns.map((col, cIdx) => (
                <td key={cIdx} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.accessor], row) : (row[col.accessor] ?? <span style={{ color: 'var(--text-dim)', italic: true }}>null</span>)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
