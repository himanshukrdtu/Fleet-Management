// src/components/LiveMap.jsx
import React from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 📍 Default red icon (same for start and end)
const redPinIcon = new L.Icon({
  iconUrl: 'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
  iconSize: [27, 43],
  iconAnchor: [13, 41],
  popupAnchor: [0, -41],
});

// 🔄 Auto-fit bounds to show full path
const FitBounds = ({ path }) => {
  const map = useMap();
  if (path.length > 1) {
    const bounds = path.map(p => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }
  return null;
};

const LiveMap = ({ path = [] }) => {
  const center = path.length > 0 ? path[path.length - 1] : { lat: 28.6139, lng: 77.2090 };

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <FitBounds path={path} />

      {/* Blue path line */}
      {path.length > 1 && (
        <Polyline
          positions={path.map(p => [p.lat, p.lng])}
          pathOptions={{ color: 'blue', weight: 5 }}
        />
      )}

      {/* Start marker with red pin */}
      {path[0] && (
        <Marker position={[path[0].lat, path[0].lng]} icon={redPinIcon}>
          <Popup>Start Point</Popup>
        </Marker>
      )}

      {/* End marker with red pin */}
      {path.length > 1 && (
        <Marker
          position={[path[path.length - 1].lat, path[path.length - 1].lng]}
          icon={redPinIcon}
        >
          <Popup>End Point</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LiveMap;
