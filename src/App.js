import React, { useRef, useState, useEffect } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import { MapFeatureCircles } from './MapFeatureCircles';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Components
import DashboardTable from './DashboardTable';
import FeatureDetail from './FeatureDetail';
import Sidebar from './Sidebar';
import layers from './layers';

// CSS
import './MapOverrides.css';
import './sarabun-font.css';

const BASEMAPS = [
  { id: 'osm',        label: 'OpenStreetMap',  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  { id: 'carto-dark',  label: 'Dark',           url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png' },
  { id: 'carto-light', label: 'Light',          url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
  { id: 'carto-voyager', label: 'Voyager',      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png' },
  { id: 'esri-satellite', label: 'Satellite',   url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  { id: 'esri-topo',  label: 'Topo',            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}' },
];

function getFeatureViewTarget(feature) {
  if (!feature) {
    return null;
  }

  try {
    const layer = L.geoJSON(feature);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      return {
        center: bounds.getCenter(),
        bounds,
      };
    }
  } catch {
    // Fall back to raw coordinates below.
  }

  let coords = feature?.geometry?.coordinates;

  while (Array.isArray(coords) && Array.isArray(coords[0])) {
    coords = coords[0];
  }

  if (!coords || coords.length < 2) {
    return null;
  }

  return {
    center: L.latLng(coords[1], coords[0]),
    bounds: null,
  };
}

function MapInstanceBridge({ mapRef }) {
  const map = useMap();

  useEffect(() => {
    mapRef.current = map;

    return () => {
      if (mapRef.current === map) {
        mapRef.current = null;
      }
    };
  }, [map, mapRef]);

  return null;
}

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardCollapsed, setDashboardCollapsed] = useState(false);
  const [points, setPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const searchValue = "";
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [basemapId, setBasemapId] = useState(() => localStorage.getItem('basemap') || 'osm');
  const [basemapOpen, setBasemapOpen] = useState(false);
  const basemapManualRef = useRef(false);
  const [mapCenter] = useState([7.4, 100.3]); // พิกัดสงขลา
  const [mapZoom] = useState(9);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  const toggleBtnRef = useRef();
  const mapRef = useRef();

  // 1. ปรับแต่ง Body ให้รองรับ Full Height
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden'; 
  }, []);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const btn = toggleBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Solid-color overlay with circular reveal
    const overlay = document.createElement('div');
    overlay.className = 'theme-reveal-overlay';
    overlay.style.setProperty('--reveal-x', `${x}px`);
    overlay.style.setProperty('--reveal-y', `${y}px`);
    // Get the NEXT theme's background color
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    overlay.style.background = getComputedStyle(document.documentElement).getPropertyValue('--c-bg-app');
    // Revert temporarily
    document.documentElement.setAttribute('data-theme', nextTheme === 'light' ? 'dark' : 'light');

    document.body.appendChild(overlay);

    // Switch theme after a brief moment so overlay is visible first
    requestAnimationFrame(() => {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
    });

    // Remove overlay after animation
    overlay.addEventListener('animationend', () => overlay.remove());
  };

  // Basemap persistence
  useEffect(() => {
    localStorage.setItem('basemap', basemapId);
  }, [basemapId]);

  // Auto-switch basemap on theme change (only if user hasn't manually picked)
  useEffect(() => {
    if (!basemapManualRef.current) {
      setBasemapId(theme === 'dark' ? 'carto-dark' : 'osm');
    }
  }, [theme]);

  // Invalidate map size when dashboard or sidebar collapses/expands
  useEffect(() => {
    const timer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [dashboardCollapsed, sidebarCollapsed]);

  const selectedBasemap = BASEMAPS.find(b => b.id === basemapId) || BASEMAPS[0];

  // 2. ค้นหาข้อมูล
  useEffect(() => {
    if (!searchValue) {
      setFilteredPoints(points);
    } else {
      setFilteredPoints(
        points.filter(f =>
          f.properties?.Farm_name?.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [points, searchValue]);

  // 3. ดึงข้อมูลจาก WFS เมื่อเลือก Layer
  useEffect(() => {
    const flatLayers = layers.flatMap(cat => cat.items || [cat]);
    const selectedLayers = flatLayers.filter(l => selectedLayerIds.includes(l.id));

    if (!selectedLayers.length) {
      setPoints([]);
      mapRef.current?.closePopup();
      return;
    }

    let allFeatures = [];
    let fetchCount = 0;

    selectedLayers.forEach(layer => {
      const wfsUrl = `https://map.surveywms.com/geoserver/LiveStock/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=LiveStock:${encodeURIComponent(layer.name)}&outputFormat=application/json&maxFeatures=100`;
      
      fetch(wfsUrl)
        .then(res => res.json())
        .then(data => {
          if (data.features) allFeatures = [...allFeatures, ...data.features];
        })
        .catch(err => console.error("Fetch error:", err))
        .finally(() => {
          fetchCount++;
          if (fetchCount === selectedLayers.length) setPoints(allFeatures);
        });
    });
  }, [selectedLayerIds]);

  const handleZoomToFeature = feature => {
    mapRef.current?.closePopup();

    const target = getFeatureViewTarget(feature);
    if (!target || !mapRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      mapRef.current.invalidateSize();

      if (target.bounds) {
        mapRef.current.fitBounds(target.bounds, {
          padding: [40, 40],
          maxZoom: 15,
        });
        return;
      }

      mapRef.current.setView(target.center, Math.max(mapRef.current.getZoom(), 15), {
        animate: true,
      });
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--c-bg-app)' }}>
      
      {/* HEADER */}
      <header style={{
        height: '56px',
        minHeight: '56px',
        background: 'linear-gradient(135deg, var(--c-header-start) 0%, var(--c-header-end) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        padding: '0 24px',
        borderBottom: '1px solid var(--c-border)',
        boxShadow: 'var(--c-shadow)',
        zIndex: 1000,
      }}>
        <img
          src={process.env.PUBLIC_URL + '/assets/logo.png'}
          alt="logo"
          style={{ position: 'absolute', left: 16, height: 40, width: 160, objectFit: 'contain', filter: 'var(--c-logo-filter)' }}
        />
        <h1 style={{
          fontSize: '17px',
          margin: 0,
          color: 'var(--c-text)',
          fontFamily: 'Sarabun-Medium',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}>
          ระบบฐานข้อมูลเกษตรกรผู้เลี้ยงปศุสัตว์จังหวัดสงขลา
        </h1>
        <button
          ref={toggleBtnRef}
          onClick={toggleTheme}
          style={{
            position: 'absolute',
            right: 16,
            background: 'var(--c-bg-icon)',
            border: '1px solid var(--c-border)',
            borderRadius: 8,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--c-accent-light)',
            transition: 'all 0.2s',
          }}
          aria-label={theme === 'dark' ? 'สลับเป็นธีมสว่าง' : 'สลับเป็นธีมมืด'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M15 10.5A6.5 6.5 0 017.5 3a6.5 6.5 0 107.5 7.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', gap: 0, minHeight: 0 }}>
        
        {/* SIDEBAR (ซ้าย) */}

        <aside style={{
          width: sidebarCollapsed ? 64 : 220,
          minWidth: sidebarCollapsed ? 64 : 220,
          height: '100%',
          overflowY: 'auto',
          transition: 'width 0.25s ease, min-width 0.25s ease',
        }}>
          <Sidebar
            onLayerChange={ids => {
              setSelectedLayerIds(ids);
              mapRef.current?.closePopup();
            }}
            collapsed={sidebarCollapsed}
            onCollapseChange={setSidebarCollapsed}
          />
        </aside>

        {/* MAP (กลาง) */}
        <section style={{
          flex: sidebarCollapsed ? 2.7 : 2,
          height: '100%',
          padding: 16,
          transition: 'flex 0.2s',
        }}>
          <div style={{
            height: '100%',
            borderRadius: 12,
            overflow: 'hidden',
            boxShadow: 'var(--c-shadow-card)',
            border: '1px solid var(--c-border)',
          }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              closePopupOnClick={false}
              style={{ height: '100%', width: '100%' }}
            >
              <MapInstanceBridge mapRef={mapRef} />
              <TileLayer url={selectedBasemap.url} />

              {/* Basemap Picker */}
              <div style={{
                position: 'absolute', top: 10, right: 10, zIndex: 1000,
                fontFamily: 'Sarabun-Medium, sans-serif',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}>
                <button
                  onClick={() => setBasemapOpen(v => !v)}
                  style={{
                    background: 'var(--c-bg-primary)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--c-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: 'var(--c-shadow)',
                    fontFamily: 'inherit',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                  {selectedBasemap.label}
                </button>
                {basemapOpen && (
                  <div style={{
                    marginTop: 4,
                    background: 'var(--c-bg-primary)',
                    border: '1px solid var(--c-border)',
                    borderRadius: 8,
                    padding: 4,
                    boxShadow: 'var(--c-shadow-lg)',
                    minWidth: 140,
                  }}>
                    {BASEMAPS.map(b => (
                      <div
                        key={b.id}
                        onClick={() => { basemapManualRef.current = true; setBasemapId(b.id); setBasemapOpen(false); }}
                        style={{
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: b.id === basemapId ? 700 : 500,
                          color: b.id === basemapId ? 'var(--c-accent-light)' : 'var(--c-text)',
                          background: b.id === basemapId ? 'var(--c-accent-bg)' : 'transparent',
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => { if (b.id !== basemapId) e.currentTarget.style.background = 'var(--c-bg-hover)'; }}
                        onMouseOut={e => { if (b.id !== basemapId) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {b.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* WMS Layers */}
              {layers.flatMap(cat => cat.items || [cat])
                .filter(l => selectedLayerIds.includes(l.id))
                .map(layer => (
                  <WMSTileLayer
                    key={layer.id}
                    url="https://map.surveywms.com/geoserver/LiveStock/wms"
                    layers={`LiveStock:${layer.name}`}
                    format="image/png"
                    transparent={true}
                    version="1.1.1"
                  />
                ))}

              {/* Data Points: วาด Circle และเปิด popup เมื่อคลิก */}
              <MapFeatureCircles
                features={filteredPoints}
                onViewDetail={feature => {
                  setSelectedFeature(feature);
                  mapRef.current?.closePopup();
                }}
              />
            </MapContainer>
          </div>
        </section>

        {/* TABLE / DETAIL (ขวา) */}
        <section style={{
          display: 'flex',
          flex: dashboardCollapsed ? 'none' : '0 0 45%',
          width: dashboardCollapsed ? 24 : '100%',
          height: '100%',
          transition: 'flex 0.25s ease, width 0.25s ease',
          overflow: 'hidden',
        }}>
          {/* Toggle button */}
          <button
            onClick={() => setDashboardCollapsed(v => !v)}
            style={{
              width: 24,
              minWidth: 24,
              height: '100%',
              background: 'var(--c-bg-secondary)',
              border: 'none',
              borderLeft: '1px solid var(--c-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--c-text-secondary)',
              fontSize: 14,
              padding: 0,
              transition: 'all 0.25s ease',
              flexShrink: 0,
            }}
            aria-label={dashboardCollapsed ? 'ขยายแดชบอร์ด' : 'ย่อแดชบอร์ด'}
          >
            {dashboardCollapsed ? '‹' : '›'}
          </button>
          {!dashboardCollapsed && (
            <div style={{ flex: 1, width: '100%', padding: '16px 16px 16px 8px', height: '100%' }}>
              {selectedFeature ? (
                <FeatureDetail
                  feature={selectedFeature}
                  onBack={() => setSelectedFeature(null)}
                  onZoomToFeature={handleZoomToFeature}
                />
              ) : (
                <DashboardTable
                  points={filteredPoints}
                  onSelectFeature={feature => {
                    setSelectedFeature(feature);
                    handleZoomToFeature(feature);
                  }}
                />
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;