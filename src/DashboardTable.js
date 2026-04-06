import React from 'react';
import layers from './layers';

const DashboardTable = ({ points, onSelectFeature }) => {
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [page, setPage] = React.useState(0);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter points by searchValue (Farm_name)
  const filteredPoints = !searchValue
    ? points
    : points.filter(f =>
        f.properties?.Farm_name?.toLowerCase().includes(searchValue.toLowerCase())
      );

  const totalRows = filteredPoints.length;
  const startIdx = page * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
  const pageRows = filteredPoints.slice(startIdx, endIdx);

  const handleRowsPerPageChange = e => {
    setRowsPerPage(Number(e.target.value));
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (endIdx < totalRows) setPage(page + 1);
  };

  return (
    /* ปรับ height จาก 580px เป็น 100% */
    <div className="dashboard-table-container" style={{ 
      background: '#e0f2fe',
      border: '1px solid #8bc5ff',
      borderRadius: 24,
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      fontFamily: 'Sarabun-Medium, sans-serif',
      overflow: 'hidden' // ป้องกันเนื้อหาล้นขอบโค้ง
    }}>
      <style>{`
        @font-face {
          font-family: 'Sarabun-Medium';
          src: url('/fonts/Sarabun-Medium.ttf') format('truetype');
          font-weight: 500;
          font-style: normal;
        }
        .dashboard-table-container, .dashboard-table-container table, .dashboard-table-container th, .dashboard-table-container td {
          font-family: 'Sarabun-Medium', sans-serif !important;
        }
        /* ตกแต่ง scrollbar ให้ดูทันสมัยเข้ากับดีไซน์ */
        .table-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 24px;
        }
        .dashboard-table-row {
          cursor: pointer;
          transition: background 0.18s ease;
        }
        .dashboard-table-row:hover {
          background: #eff6ff !important;
        }
      `}</style>

      {/* Header */}
      <div style={{ height: 64, minHeight: 64, fontWeight: 700, fontSize: 18, color: '#2563eb', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span role="img" aria-label="farm">🌽</span>
          ข้อมูลปศุสัตว์จังหวัดสงขลา
        </div>
        <input
          type="text"
          placeholder="ค้นหา..."
          value={searchValue}
          onChange={e => {
            setSearchValue(e.target.value);
            setPage(0);
          }}
          style={{
            fontSize: 14,
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            outline: 'none',
            fontFamily: 'Sarabun-Medium',
            minWidth: 180
          }}
        />
      </div>

      {/* Body Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {/* Table Scroll Area */}
        <div className="table-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ border: 'none', width: '100%', borderCollapse: 'collapse', background: 'transparent', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ background: '#8bc5ff', height: 64, fontSize: 16, color: '#1e40af' }}>
                <th style={{ padding: '8px', textAlign: 'center', width: 250, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>ชื่อ</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 100, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>ประเภท</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 100, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>ตำบล</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 100, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>อำเภอ</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 100, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>จังหวัด</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 100, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>จำนวน (ตัว)</th>
                <th style={{ padding: '8px', textAlign: 'center', width: 200, position: 'sticky', top: 0, zIndex: 2, background: '#8bc5ff' }}>สังกัด</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((f, idx) => (
                <tr
                  key={startIdx + idx}
                  className="dashboard-table-row"
                  onClick={() => onSelectFeature?.(f)}
                  style={{ background: '#fff', height: 64, borderBottom: '1px solid #e5e7eb' }}
                >
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Farm_name || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {(() => {
                      const typeName = (f.properties?.Type || '').trim();
                      const layer = layers.find(l => (l.name || '').trim() === typeName);
                      if (layer) {
                        return (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                              src={`https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layer.name)}&LEGEND_OPTIONS=${encodeURIComponent('dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:30;symbolHeight:30')}&TRANSPARENT=true`}
                              alt={typeName}
                              style={{ width: 26, height: 26, objectFit: 'contain', display: 'block', margin: '0 auto' }}
                            />
                          </span>
                        );
                      }
                      return typeName || '-';
                    })()}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Tambon || f.properties?.Tambon_T || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Amphoe || f.properties?.District_T || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Province || f.properties?.Province_T || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Animal_qua || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{f.properties?.Affiliatio || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination bar - ยึดติดด้านล่างเสมอ */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderRadius: '0 0 24px 24px',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)', // ปรับเงาให้ขึ้นด้านบน
          padding: '12px 32px',
          fontSize: 16,
          color: '#222',
          minHeight: 56,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>จำนวนแถวต่อหน้า</span>
            <select value={rowsPerPage} onChange={handleRowsPerPageChange} style={{ fontSize: 16, borderRadius: 6, padding: '2px 12px', border: '1px solid #ccc', background: '#fff' }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span>{totalRows > 0 ? startIdx + 1 : 0}-{endIdx} จาก {totalRows}</span>
            <button onClick={handlePrevPage} style={{ background: 'none', border: 'none', color: page === 0 ? '#ccc' : '#222', fontSize: 22, cursor: 'pointer' }} disabled={page === 0}>&lt;</button>
            <button onClick={handleNextPage} style={{ background: 'none', border: 'none', color: endIdx >= totalRows ? '#ccc' : '#222', fontSize: 22, cursor: 'pointer' }} disabled={endIdx >= totalRows}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTable;