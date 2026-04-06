import React from 'react';
import Legend from './Legend';

const LegendFloating = ({ open, setOpen }) => {
  return (
    <div style={{ position: 'fixed', left: 20, bottom: 20, zIndex: 2500, maxWidth: 340 }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{
            border: 'none',
            borderRadius: 18,
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.13)',
            padding: '8px 22px 8px 18px',
            fontSize: 16,
            color: '#222',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            minWidth: 120,
          }}
        >
          <span>คำอธิบาย/เกณฑ์สี</span>
          <span style={{ fontSize: 18, marginLeft: 2, color: '#888' }}>▼</span>
        </button>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 18,
          boxShadow: '0 4px 24px rgba(0,0,0,0.16)',
          padding: '18px 18px 12px 18px',
          minWidth: 220,
          maxWidth: 340,
          minHeight: 80,
          position: 'relative',
        }}>
          <div style={{ fontWeight: 600, fontSize: 17, marginBottom: 10, color: '#222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>คำอธิบาย/เกณฑ์สี</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 20,
                color: '#888',
                cursor: 'pointer',
                marginLeft: 8,
                padding: 0,
                lineHeight: 1,
              }}
              aria-label="ปิด"
            >×</button>
          </div>
          <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
            <Legend />
          </div>
        </div>
      )}
    </div>
  );
};

export default LegendFloating;
