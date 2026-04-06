import React, { useState } from 'react';
import layers from './layers';

const Sidebar = ({ onLayerChange, collapsed, onCollapseChange }) => {
      const sidebarContentRef = React.useRef();
      // Custom smooth scroll with cubic easing
      const smoothScroll = (target, delta) => {
        const duration = 50; // ms
        const start = target.scrollTop;
        const maxScroll = target.scrollHeight - target.clientHeight;
        let end = start + delta;
        // Clamp scroll range
        if (end < 0) end = 0;
        if (end > maxScroll) end = maxScroll;
        // If already at top/bottom, do not animate
        if ((start === 0 && delta < 0) || (start === maxScroll && delta > 0)) return;
        const startTime = performance.now();
        function animateScroll(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
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
  // flatten layers (รองรับทั้งแบบเดิมและแบบหมวดหมู่)
  const flatLayers = Array.isArray(layers)
    ? (Array.isArray(layers[0]?.items)
        ? layers.flatMap(cat => cat.items)
        : layers)
    : [];

  const [selectedLayerIds, setSelectedLayerIds] = useState(flatLayers.length > 0 ? [flatLayers[0].id] : []);

  // Notify parent when layer selection changes
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
    <div
      className="sidebar-container"
      style={{
        height: '100%',
        background: '#e0f2fe', // ฟ้าอ่อน
        border: 'none',
        borderRadius: 0,
        boxShadow: '0 2px 8px rgba(34,139,34,0.08)',
        padding: 0,
        minWidth: collapsed ? 80 : 180,
        width: collapsed ? 80 : 180,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflowY: 'hidden',
        alignItems: 'center',
      }}
    >
      <button
        onClick={toggleSidebar}
        style={{
          width: '100%',
          height: 42,
          background: '#0099ff', // ฟ้าอ่อน,
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 4,
          letterSpacing: 1,
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? '▶' : '◀'}
      </button>
      <div
        className="sidebar-content"
        ref={sidebarContentRef}
        onWheel={handleSidebarWheel}
        style={{
          border: 'none',
          flex: 1,
          height: '100%',
          overflowY: 'hidden',
          borderRadius: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {flatLayers.map(layer => (
          <div
            key={layer.id}
            className="layer-item"
            onClick={() => handleLayerToggle(layer)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: 4,
              cursor: 'pointer',
              border: 'none',
              borderRadius: 14,
              marginBottom: 4,
              width: '80%',
              height: 40,
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: selectedLayerIds.includes(layer.id) ? '#8bc5ff' : '#e0f2fe',
              transition: 'background 0.2s',
            }}
          >
            <img
              src={`https://map.surveywms.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=LiveStock:${encodeURIComponent(layer.name)}&LEGEND_OPTIONS=${encodeURIComponent('dpi:2400;antialiasing:on;fontAntiAliasing:on;forceRule:True;symbolWidth:40;symbolHeight:40')}&TRANSPARENT=true`}
              alt="icon"
              style={{ width: 30, height: 30, marginRight: collapsed ? 0 : 8 }}
            />
            {!collapsed && (
              <span
                style={{
                  fontSize: 15,
                  color: selectedLayerIds.includes(layer.id) ? '#fff' : '#000000',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  flex: 1,
                  userSelect: 'none',
                  marginLeft: 12,
                }}
              >
                {layer.name}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;