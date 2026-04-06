import React from 'react';
import layers from './layers';

const FeatureDetail = ({ feature, onBack, onZoomToFeature }) => {
  if (!feature) return null;
  const p = feature.properties || {};

  const typeName = (p.Type || '').trim();
  const layer = layers.find(l => (l.name || '').trim() === typeName);

  let coords = feature.geometry?.coordinates;
  if (Array.isArray(coords) && Array.isArray(coords[0])) {
    coords = coords[0];
  }
  const lng = coords?.[0];
  const lat = coords?.[1];

  const fields = [
    { label: 'ชื่อฟาร์ม', value: p.Farm_name },
    { label: 'เจ้าของฟาร์ม', value: p.Operator_n },
    { label: 'ที่อยู่', value: p.Address },
    { label: 'จำนวน (ตัว)', value: p.Animal_qua },
    { label: 'สังกัด', value: p.Affiliatio },
    { label: 'สัตวแพทย์', value: p.Farm_veter },
  ];

  return (
    <div style={{
      background: '#e0f2fe',
      border: '1px solid #8bc5ff',
      borderRadius: 24,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Sarabun-Medium, sans-serif',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ height: 64, minHeight: 64, fontWeight: 700, fontSize: 18, color: '#2563eb', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '6px 16px',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'Sarabun-Medium, sans-serif',
          }}
        >
          ← กลับ
        </button>
        <span>ข้อมูลรายละเอียด</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }}>
        {/* Title with icon */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          {layer && (
            <img
              src={`https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layer.name)}&LEGEND_OPTIONS=${encodeURIComponent('dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:30;symbolHeight:30')}&TRANSPARENT=true`}
              alt={typeName}
              style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 8 }}
            />
          )}
          <div style={{ fontWeight: 700, fontSize: 22, color: '#1e40af' }}>
            {p.Farm_name || '-'}
          </div>
        </div>

        {/* Fields */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {fields.map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < fields.length - 1 ? '1px solid #e5e7eb' : 'none',
              fontSize: 15,
            }}>
              <span style={{ fontWeight: 600, color: '#374151' }}>{f.label}</span>
              <span style={{ color: '#555', textAlign: 'right', maxWidth: '60%' }}>{f.value || '-'}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        {lat && lng && (
          <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button
              onClick={() => onZoomToFeature?.(feature)}
              style={{
                display: 'inline-block',
                background: '#16a34a',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Sarabun-Medium, sans-serif',
              }}
            >
              ซูมไปตำแหน่ง
            </button>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#2563eb',
                color: '#fff',
                padding: '10px 24px',
                borderRadius: 10,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              แสดงการนำทาง Google Map
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureDetail;
