import React from 'react';
import './Topbar.css';


// ...existing code...

const Topbar = ({ searchValue, onSearchChange, onSearchSubmit }) => {
  return (
    <div className="topbar-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <img src="/logo192.png" alt="logo" style={{ width: 40, height: 40, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', border: '2px solid rgba(255,255,255,0.2)' }} />
        <span className="topbar-title">ระบบแผนที่ฟาร์มปศุสัตว์</span>
      </div>
      <form
        style={{
          display: 'flex',
          alignItems: 'center',
          background: '#fff',
          borderRadius: 28,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '6px 20px',
          flex: '1',
          maxWidth: 500,
          minWidth: 300,
        }}
        onSubmit={e => { e.preventDefault(); onSearchSubmit && onSearchSubmit(); }}
      >
        <span style={{ fontSize: 18, marginRight: 10, color: '#9ca3af' }}>🔍</span>
        <input
          type="text"
          placeholder="ค้นหาชื่อฟาร์ม..."
          value={searchValue}
          onChange={e => onSearchChange && onSearchChange(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: 15,
            background: 'transparent',
            width: '100%',
            padding: '10px 8px',
            color: '#1f2937',
          }}
        />
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            borderRadius: 22,
            color: '#fff',
            fontWeight: 600,
            fontSize: 14,
            padding: '8px 20px',
            marginLeft: 12,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.25s ease',
          }}
          onMouseOver={(e) => {
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.boxShadow = '0 2px 6px rgba(59, 130, 246, 0.3)';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ค้นหา
        </button>
      </form>
    </div>
  );
};

export default Topbar;
