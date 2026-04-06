import React, { useState } from 'react';
import layers from './layers';
import './Sidebar.css';

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Sidebar = ({ onLayerChange, collapsed, onCollapseChange }) => {
  const sidebarContentRef = React.useRef();

  const smoothScroll = (target, delta) => {
    const duration = 50;
    const start = target.scrollTop;
    const maxScroll = target.scrollHeight - target.clientHeight;
    let end = start + delta;
    if (end < 0) end = 0;
    if (end > maxScroll) end = maxScroll;
    if ((start === 0 && delta < 0) || (start === maxScroll && delta > 0)) return;
    const startTime = performance.now();
    function animateScroll(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      target.scrollTop = start + (end - start) * ease;
      if (progress < 1) requestAnimationFrame(animateScroll);
    }
    requestAnimationFrame(animateScroll);
  };

  const handleSidebarWheel = e => {
    if (sidebarContentRef.current) {
      smoothScroll(sidebarContentRef.current, e.deltaY);
    }
  };

  const toggleSidebar = () => {
    if (onCollapseChange) onCollapseChange(!collapsed);
  };

  const flatLayers = Array.isArray(layers)
    ? (Array.isArray(layers[0]?.items)
        ? layers.flatMap(cat => cat.items)
        : layers)
    : [];

  const [selectedLayerIds, setSelectedLayerIds] = useState(flatLayers.length > 0 ? [flatLayers[0].id] : []);

  React.useEffect(() => {
    if (onLayerChange) onLayerChange(selectedLayerIds);
  }, [selectedLayerIds, onLayerChange]);

  const handleLayerToggle = layer => {
    let newIds;
    if (selectedLayerIds.includes(layer.id)) {
      newIds = selectedLayerIds.filter(id => id !== layer.id);
    } else {
      newIds = [...selectedLayerIds, layer.id];
    }
    setSelectedLayerIds(newIds);
  };

  return (
    <div className={`sidebar-container${collapsed ? ' collapsed' : ''}`}>
      {/* Toggle Button */}
      <button
        className="sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ExpandIcon /> : <><CollapseIcon /> {!collapsed && <span>ย่อเมนู</span>}</>}
      </button>

      {/* Header */}
      {!collapsed && (
        <div className="sidebar-header">
          <p className="sidebar-header-title">ชั้นข้อมูล</p>
        </div>
      )}

      {/* Layer List */}
      <div
        className="sidebar-content"
        ref={sidebarContentRef}
        onWheel={handleSidebarWheel}
      >
        {flatLayers.map(layer => {
          const isActive = selectedLayerIds.includes(layer.id);
          return (
            <div
              key={layer.id}
              className={`layer-item${isActive ? ' active' : ''}`}
              onClick={() => handleLayerToggle(layer)}
              title={layer.name}
            >
              <div className="layer-icon-wrapper">
                <img
                  src={`https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layer.name)}&LEGEND_OPTIONS=${encodeURIComponent('dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:40;symbolHeight:40')}&TRANSPARENT=true`}
                  alt={layer.name}
                />
              </div>
              {!collapsed && (
                <>
                  <span className="layer-name">{layer.name}</span>
                  <div className="layer-check">
                    <CheckIcon />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">กรมปศุสัตว์ จ.สงขลา</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;