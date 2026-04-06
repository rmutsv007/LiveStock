import React from 'react';
import './Legend.css';
import layers from './layers';

const LEGEND_OPTIONS = 'dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:40;symbolHeight:40';

const getLegendUrl = (layerName) =>
  `https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layerName)}&LEGEND_OPTIONS=${encodeURIComponent(LEGEND_OPTIONS)}&TRANSPARENT=true`;

const Legend = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {layers.map(layer => (
          <div key={layer.id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--c-bg-subtle)',
            borderRadius: 8,
            padding: '8px 10px',
            border: '1px solid var(--c-border)',
            transition: 'background 0.2s',
          }}>
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'var(--c-bg-icon)',
              border: '1px solid var(--c-bg-icon-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <img
                src={getLegendUrl(layer.name)}
                alt={layer.name}
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            </div>
            <span style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 500 }}>{layer.name}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Legend;