import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Camera {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  status: string;
  source: string;
  category: { name: string; color?: string };
  _count: { comments: number; favorites: number; reports: number };
}

interface MapProps {
  cameras: Camera[];
  showHeatmap?: boolean;
  onCameraClick?: (camera: Camera) => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  OFFLINE: '#ef4444',
  PENDING: '#eab308',
  REPORTED: '#f97316',
};

function createCameraIcon(camera: Camera) {
  const color = statusColors[camera.status] || '#22c55e';
  return L.divIcon({
    html: `
      <div style="
        width: 36px; height: 36px;
        background: #1e2330;
        border: 2px solid ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">
        <svg width="18" height="18" fill="${color}" viewBox="0 0 24 24">
          <path d="M12 9a3 3 0 100 6 3 3 0 000-6zM2 9a10 10 0 1120 0H2z" opacity="0"/>
          <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
        </svg>
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createUserIcon() {
  return L.divIcon({
    html: `
      <div style="
        width: 20px; height: 20px;
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(59,130,246,0.4);
      "></div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export default function Map({ cameras, showHeatmap = false, onCameraClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<any>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [14.6037, -61.0693],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Dark tile layer option
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when cameras change
  useEffect(() => {
    if (!mapRef.current) return;

    if (clusterRef.current) {
      mapRef.current.removeLayer(clusterRef.current);
    }

    const cluster = (L as any).markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: (cluster: any) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `
            <div style="
              width: 44px; height: 44px;
              background: rgba(59,130,246,0.9);
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            ">${count}</div>
          `,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });
      },
    });

    cameras.forEach(camera => {
      const marker = L.marker([camera.latitude, camera.longitude], {
        icon: createCameraIcon(camera),
      });

      const statusLabel: Record<string, string> = {
        ACTIVE: 'Actif', OFFLINE: 'Hors ligne', PENDING: 'En attente', REPORTED: 'Signalé',
      };

      marker.bindPopup(`
        <div style="
          background: #1e2330;
          color: white;
          border-radius: 8px;
          min-width: 200px;
          font-family: sans-serif;
        ">
          <div style="padding: 12px 12px 8px;">
            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
              <span style="
                width: 8px; height: 8px; border-radius: 50%;
                background: ${statusColors[camera.status] || '#22c55e'};
                display: inline-block;
              "></span>
              <span style="font-size:11px; color:#9ca3af;">${statusLabel[camera.status] || 'Actif'}</span>
              <span style="font-size:11px; color:#60a5fa; margin-left:auto;">${camera.category.name}</span>
            </div>
            <h3 style="font-size:14px; font-weight:600; margin:0 0 4px;">${camera.name}</h3>
            ${camera.description ? `<p style="font-size:12px; color:#9ca3af; margin:0 0 8px;">${camera.description}</p>` : ''}
            <p style="font-size:11px; color:#6b7280; margin:0 0 10px;">Source: ${camera.source}</p>
            <div style="display:flex; gap:8px; font-size:11px; color:#9ca3af; margin-bottom:10px;">
              <span>❤️ ${camera._count.favorites}</span>
              <span>💬 ${camera._count.comments}</span>
              ${camera._count.reports > 0 ? `<span style="color:#f87171;">⚠️ ${camera._count.reports}</span>` : ''}
            </div>
            <button
              onclick="window.location.href='/camera/${camera.id}'"
              style="
                width: 100%;
                padding: 7px;
                background: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
              "
            >Voir la fiche →</button>
          </div>
        </div>
      `, {
        maxWidth: 250,
        className: 'custom-popup',
      });

      marker.on('click', () => onCameraClick?.(camera));
      cluster.addLayer(marker);
    });

    clusterRef.current = cluster;
    mapRef.current.addLayer(cluster);
  }, [cameras]);

  // Geolocation
  useEffect(() => {
    if (!mapRef.current) return;

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (userMarkerRef.current) {
            mapRef.current?.removeLayer(userMarkerRef.current);
          }
          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: createUserIcon(),
          })
            .bindPopup('<div style="color:#333; font-size:13px;">📍 Votre position</div>')
            .addTo(mapRef.current!);
        },
        () => {}, // Silently fail if denied
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border-radius: 8px;
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: #1e2330;
        }
        .leaflet-control-zoom a {
          background: #1e2330 !important;
          color: white !important;
          border-color: #2d3748 !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2d3748 !important;
        }
      `}</style>
    </div>
  );
}
