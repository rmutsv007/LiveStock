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
  
  const mapRef = useRef();

  // 1. ปรับแต่ง Body ให้รองรับ Full Height
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden'; 
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: '#faf5f5' }}>
      
      {/* HEADER */}
      <header style={{ height: '64px', minHeight: '64px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '0 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 1000 }}>
        <img
          src={process.env.PUBLIC_URL + '/assets/logo.png'}
          alt="logo"
          style={{ position: 'absolute', left: 10, height: 64, width: 180, objectFit: 'contain' }}
        />
        <h1 style={{ fontSize: '20px', margin: 0, color: '#1e293b', fontFamily: 'Sarabun-Medium', textAlign: 'center', display: 'flex', alignItems: 'center', gap: 16 }}>
          ระบบฐานข้อมูลเกษตรกรผู้เลี้ยงปศุสัตว์จังหวัดสงขลา
        </h1>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', gap: '20px', minHeight: 0 }}>
        
        {/* SIDEBAR (ซ้าย) */}

        <aside style={{
          width: sidebarCollapsed ? 80 : 180,
          minWidth: sidebarCollapsed ? 80 : 180,
          height: '100%',
          overflowY: 'auto',
          transition: 'width 0.2s',
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
          paddingTop: 24,
          paddingBottom: 24,
          transition: 'flex 0.2s',
        }}>
          <div style={{ height: '100%', borderRadius: '24px', overflow: 'hidden', boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.50)'}}>
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
        <section style={{ flex: 1.5, height: '100%', minWidth: '700px',paddingTop: 24, paddingBottom: 24, paddingRight: 24 }}>
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