import React from 'react';
import Legend from './Legend';

const LegendFloating = ({ open, setOpen }) => {
  return (
    <div style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 2500, maxWidth: 320 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            border: '1px solid var(--c-accent-border)',
            borderRadius: 10,
            background: 'linear-gradient(135deg, var(--c-bg-secondary) 0%, var(--c-bg-primary) 100%)',
            boxShadow: 'var(--c-shadow-card)',
            padding: '8px 18px',
            fontSize: 13,
            color: 'var(--c-text)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 100,
            transition: 'all 0.2s',
            fontFamily: 'Sarabun-Medium, sans-serif',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="3" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
            <rect x="4" y="4" width="3" height="3" rx="1" fill="#60a5fa"/>
            <line x1="9" y1="5.5" x2="13" y2="5.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
            <rect x="4" y="9" width="3" height="3" rx="1" fill="#60a5fa"/>
            <line x1="9" y1="10.5" x2="13" y2="10.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          คำอธิบายสัญลักษณ์
        </button>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, var(--c-bg-secondary) 0%, var(--c-bg-primary) 100%)',
          borderRadius: 12,
          border: '1px solid var(--c-accent-border)',
          boxShadow: 'var(--c-shadow-card)',
          padding: '16px',
          minWidth: 220,
          maxWidth: 320,
          minHeight: 80,
          position: 'relative',
        }}>
          <div style={{
            fontWeight: 600,
            fontSize: 14,
            marginBottom: 12,
            color: 'var(--c-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 10,
            borderBottom: '1px solid var(--c-border)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="14" height="14" rx="3" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
                <rect x="4" y="4" width="3" height="3" rx="1" fill="#60a5fa"/>
                <line x1="9" y1="5.5" x2="13" y2="5.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
                <rect x="4" y="9" width="3" height="3" rx="1" fill="#60a5fa"/>
                <line x1="9" y1="10.5" x2="13" y2="10.5" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              คำอธิบายสัญลักษณ์
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'var(--c-bg-icon)',
                border: '1px solid var(--c-border-input)',
                borderRadius: 6,
                width: 24,
                height: 24,
                fontSize: 14,
                color: 'var(--c-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                lineHeight: 1,
                transition: 'all 0.2s',
              }}
              aria-label="ปิด"
            >×</button>
          </div>
          <div style={{ maxHeight: 280, overflowY: 'auto', paddingRight: 2 }}>
            <Legend />
          </div>
        </div>
      )}
    </div>
  );
};

export default LegendFloating;
