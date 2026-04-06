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
  const [points, setPoints] = useState([]);
  const [filteredPoints, setFilteredPoints] = useState([]);
  const searchValue = "";
  const [selectedLayerIds, setSelectedLayerIds] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState(null);
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

  const toggleTheme = (e) => {
    const btn = toggleBtnRef.current;
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Capture current page as screenshot overlay
    const overlay = document.createElement('div');
    overlay.className = 'theme-reveal-overlay';
    overlay.style.setProperty('--reveal-x', `${x}px`);
    overlay.style.setProperty('--reveal-y', `${y}px`);
    overlay.style.background = getComputedStyle(document.documentElement).getPropertyValue('--c-bg-app');

    // Clone the current page visuals into the overlay
    const clone = document.getElementById('root').cloneNode(true);
    clone.style.pointerEvents = 'none';
    overlay.appendChild(clone);
    document.body.appendChild(overlay);

    // Switch theme underneath
    setTheme(t => t === 'dark' ? 'light' : 'dark');

    // Remove overlay after animation
    overlay.addEventListener('animationend', () => overlay.remove());
  };

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
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
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
        <section style={{ flex: 1.5, height: '100%', minWidth: '700px', padding: '16px 16px 16px 0' }}>
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
        </section>

      </main>
    </div>
  );
}

export default App;