import React from 'react';
import './Legend.css';
import layers from './layers';

const LEGEND_OPTIONS = 'dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:40;symbolHeight:40';

const getLegendUrl = (layerName) =>
  `https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layerName)}&LEGEND_OPTIONS=${encodeURIComponent(LEGEND_OPTIONS)}&TRANSPARENT=true`;

const Legend = () => {
  return (
    <>
      <div style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 16, color: '#1a237e' }}>คำอธิบายสัญลักษณ์</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {layers.map(layer => (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2, background: '#f6f9f3', borderRadius: 6, padding: '6px 10px' }}>
            <img
              src={getLegendUrl(layer.name)}
              alt={layer.name}
              style={{ width: 28, height: 28, background: '#fff', borderRadius: 4, border: '1px solid #ccc', objectFit: 'contain', marginRight: 4 }}
            />
            <span style={{ fontSize: 15, color: '#222', fontWeight: 500 }}>{layer.name}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Legend;