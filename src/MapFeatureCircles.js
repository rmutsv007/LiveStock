import { Circle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import React from 'react';

function buildPopupContent(feature, lat, lng, onViewDetail) {
  const wrapper = document.createElement('div');
  wrapper.style.minWidth = '220px';
  wrapper.style.textAlign = 'left';
  wrapper.style.fontFamily = 'Sarabun-Medium, sans-serif';
  wrapper.style.color = 'var(--c-text)';

  // Farm name centered and bold
  const title = document.createElement('div');
  title.textContent = feature?.properties?.Farm_name || '-';
  title.style.fontWeight = 'bold';
  title.style.fontSize = '16px';
  title.style.textAlign = 'center';
  title.style.marginBottom = '8px';
  title.style.color = 'var(--c-text-heading)';
  title.style.paddingBottom = '8px';
  title.style.borderBottom = '1px solid var(--c-border)';
  wrapper.appendChild(title);

  // Address
  const addressDiv = document.createElement('div');
  addressDiv.style.marginBottom = '4px';
  addressDiv.style.fontSize = '13px';
  addressDiv.style.color = 'var(--c-text-secondary)';
  const addressLabel = document.createElement('span');
  addressLabel.textContent = 'ที่อยู่ :';
  addressLabel.style.fontWeight = '600';
  addressLabel.style.color = 'var(--c-text)';
  addressDiv.appendChild(addressLabel);
  addressDiv.appendChild(document.createTextNode(' ' + (feature?.properties?.Address || '-')));
  wrapper.appendChild(addressDiv);

  // Actions (centered)
  const actions = document.createElement('div');
  actions.style.marginTop = '12px';
  actions.style.textAlign = 'center';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.justifyContent = 'center';

  // ปุ่มดูข้อมูล
  const viewBtn = document.createElement('button');
  viewBtn.textContent = 'ดูข้อมูล';
  viewBtn.style.display = 'inline-flex';
  viewBtn.style.alignItems = 'center';
  viewBtn.style.background = 'var(--c-green-bg)';
  viewBtn.style.color = 'var(--c-green)';
  viewBtn.style.padding = '6px 14px';
  viewBtn.style.borderRadius = '8px';
  viewBtn.style.border = '1px solid var(--c-green-border)';
  viewBtn.style.fontWeight = '600';
  viewBtn.style.fontSize = '13px';
  viewBtn.style.cursor = 'pointer';
  viewBtn.style.fontFamily = 'Sarabun-Medium, sans-serif';
  viewBtn.style.transition = 'all 0.2s';
  viewBtn.addEventListener('mouseenter', () => { viewBtn.style.background = 'var(--c-green-bg-hover)'; });
  viewBtn.addEventListener('mouseleave', () => { viewBtn.style.background = 'var(--c-green-bg)'; });
  viewBtn.addEventListener('click', () => {
    if (onViewDetail) onViewDetail(feature);
  });
  actions.appendChild(viewBtn);

  const link = document.createElement('a');
  link.href = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = 'นำทาง Google Map';
  link.style.display = 'inline-flex';
  link.style.alignItems = 'center';
  link.style.background = 'var(--c-accent-bg)';
  link.style.color = 'var(--c-accent-light)';
  link.style.padding = '6px 14px';
  link.style.borderRadius = '8px';
  link.style.border = '1px solid var(--c-accent-border)';
  link.style.textDecoration = 'none';
  link.style.fontWeight = '600';
  link.style.fontSize = '13px';
  link.style.fontFamily = 'Sarabun-Medium, sans-serif';
  link.style.transition = 'all 0.2s';
  link.addEventListener('mouseenter', () => { link.style.background = 'var(--c-accent-bg-hover)'; });
  link.addEventListener('mouseleave', () => { link.style.background = 'var(--c-accent-bg)'; });

  actions.appendChild(link);
  wrapper.appendChild(actions);

  return wrapper;
}

function getFeatureKey(feature, fallbackKey) {
  if (feature?.id != null) {
    return String(feature.id);
  }

  const coords = feature?.geometry?.coordinates;
  const keyFromCoords = Array.isArray(coords)
    ? JSON.stringify(coords)
    : '';

  return `${feature?.properties?.Farm_name || 'feature'}:${keyFromCoords || fallbackKey}`;
}

// จุดเดียวรับ props feature
export function MapFeatureCircle({ feature, featureKey, onViewDetail }) {
  const map = useMap();
  const popupRef = React.useRef(null);
  const [zoom, setZoom] = React.useState(map.getZoom());
  let coords = feature.geometry?.coordinates;

  if (Array.isArray(coords) && Array.isArray(coords[0])) {
    coords = coords[0];
  }

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  React.useEffect(() => {
    return () => {
      if (popupRef.current) {
        map.removeLayer(popupRef.current);
        popupRef.current = null;
      }
    };
  }, [map]);

  if (!coords || coords.length < 2) {
    return null;
  }
  // Leaflet GeoJSON: [lng, lat]
  const [lng, lat] = coords;
  const center = [lat, lng];
  const baseRadius = 200; // ปรับค่าเริ่มต้นตามต้องการ
  const radius = baseRadius * Math.pow(2, 13 - zoom);

  const handleClick = event => {
    event.originalEvent?.stopPropagation?.();

    if (popupRef.current) {
      map.removeLayer(popupRef.current);
      popupRef.current = null;
    }


    const popup = L.popup({
      autoClose: true,
      closeOnClick: false,
      autoPan: true,
      offset: [0, -8], // move popup up by 8px
    })
      .setLatLng(center)
      .setContent(buildPopupContent(feature, lat, lng, onViewDetail));

    popupRef.current = popup;
    popup.openOn(map);
  };

  return (
    <Circle
      center={center}
      radius={radius}
      bubblingMouseEvents={false}
      pathOptions={{ color: '#f8717100', fillColor: 'rgba(252, 165, 165, 0)', fillOpacity: 0.6 }}
      eventHandlers={{
        click: handleClick,
      }}
    >
      <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false} sticky>
        {feature.properties?.Farm_name || '-'}
      </Tooltip>
    </Circle>
  );
}

// วาดหลายจุด
export function MapFeatureCircles({ features, onViewDetail }) {
  return (
    <>
      {features.map((feature, idx) => {
        const featureKey = getFeatureKey(feature, idx);

        return (
          <MapFeatureCircle
            key={featureKey}
            feature={feature}
            featureKey={featureKey}
            onViewDetail={onViewDetail}
          />
        );
      })}
    </>
  );
}
