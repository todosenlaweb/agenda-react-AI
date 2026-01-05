
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución para el problema del icono por defecto con Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationMapProps {
  lat: number;
  lng: number;
  cityName: string;
}

// Componente para re-centrar el mapa cuando las props cambian
const ChangeView = ({ center, zoom }: { center: L.LatLngExpression; zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const LocationMap: React.FC<LocationMapProps> = ({ lat, lng, cityName }) => {
  const position: L.LatLngExpression = [lat, lng];

  return (
    <div className="location-map border rounded-3" style={{ height: '250px', width: '100%' }}>
      <MapContainer 
        center={position} 
        zoom={10} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', borderRadius: '0.25rem' }}
        key={`${lat}-${lng}`}>

        <ChangeView center={position} zoom={10} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {cityName}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationMap;
