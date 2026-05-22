import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Camera {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: string;
  category: {
    name: string;
    color?: string;
  };
}

interface MapProps {
  cameras: Camera[];
  onCameraClick?: (camera: Camera) => void;
  center?: [number, number];
  zoom?: number;
}

function MapController({ cameras }: { cameras: Camera[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (cameras.length > 0) {
      const bounds = new LatLngBounds(
        cameras.map(c => [c.latitude, c.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cameras, map]);

  return null;
}

export default function Map({ cameras, onCameraClick, center = [14.6065, -61.0719], zoom = 13 }: MapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
        <div className="text-gray-400">Chargement de la carte...</div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController cameras={cameras} />
      
      {cameras.map((camera) => (
        <Marker
          key={camera.id}
          position={[camera.latitude, camera.longitude]}
          icon={customIcon}
          eventHandlers={{
            click: () => onCameraClick?.(camera),
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-gray-900">{camera.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{camera.description}</p>
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                  {camera.category.name}
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ml-1 ${
                  camera.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {camera.status}
                </span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}