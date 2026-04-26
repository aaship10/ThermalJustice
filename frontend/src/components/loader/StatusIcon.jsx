import React from 'react';

export default function StatusIcon({ status }) {
  if (status === 'done') {
    return <div className="status-icon-done shrink-0" />;
  }
  if (status === 'loading') {
    return <div className="status-icon-loading shrink-0" />;
  }
  // pending
  return (
    <div className="shrink-0" style={{
      width: 20, height: 20,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.2)'
    }} />
  );
}
