import { useState } from 'react';
import { ArrowTopRightOnSquareIcon, PlayIcon } from '@heroicons/react/24/outline';

interface StreamPlayerProps {
  streamUrl: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
  return match ? match[1] : null;
}

function getPlayerType(streamUrl: string, category: string): 'youtube' | 'windy_webcam' | 'windy_weather' | 'meteofrance' | 'external' {
  if (!streamUrl) return 'windy_weather';
  if (streamUrl.includes('youtube.com') || streamUrl.includes('youtu.be')) return 'youtube';
  if (streamUrl.includes('meteofrance.com') || streamUrl.includes('meteo-france')) return 'meteofrance';
  if (category === 'Météo') return 'windy_weather';
  return 'windy_webcam';
}

export default function StreamPlayer({ streamUrl, name, latitude, longitude, category }: StreamPlayerProps) {
  const [showEmbed, setShowEmbed] = useState(false);
  const playerType = getPlayerType(streamUrl, category);
  const ytId = streamUrl ? getYouTubeId(streamUrl) : null;

  // ── YouTube embed ──────────────────────────────────────────────────────
  if (playerType === 'youtube' && ytId) {
    return (
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1`}
          title={name}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // ── Météo-France : carte météo interactive via Windy ───────────────────
  if (playerType === 'meteofrance' || playerType === 'windy_weather') {
    return (
      <div className="space-y-3">
        <div className="w-full rounded-lg overflow-hidden border border-dark-border" style={{ height: '380px' }}>
          <iframe
            src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=11&overlay=wind&product=ecmwf&level=surface&lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&detail=true`}
            title={`Météo en temps réel - ${name}`}
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Carte météo temps réel via Windy.com • Données ECMWF</p>
          <a
            href={streamUrl || `https://meteofrance.com/previsions-meteo-france/fort-de-france/97200`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300"
          >
            <span>Météo-France</span>
            <ArrowTopRightOnSquareIcon className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }

  // ── Windy webcam map : carte avec marqueurs webcams proches ───────────
  if (playerType === 'windy_webcam') {
    if (!showEmbed) {
      return (
        <div className="w-full rounded-lg overflow-hidden border border-dark-border bg-gray-800/50" style={{ height: '280px' }}>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center px-4">
              <p className="text-white font-medium mb-1">Flux vidéo non disponible publiquement</p>
              <p className="text-gray-400 text-sm">
                Cette caméra n'a pas de flux public en streaming direct.
                Consultez la source officielle ou explorez les webcams proches.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowEmbed(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
              >
                Voir les webcams proches
              </button>
              <a
                href={streamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-colors flex items-center space-x-1"
              >
                <span>Source officielle</span>
                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="w-full rounded-lg overflow-hidden border border-dark-border" style={{ height: '380px' }}>
          <iframe
            src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=13&overlay=webcams&product=ecmwf&level=surface&lat=${latitude}&lon=${longitude}`}
            title={`Webcams proches - ${name}`}
            className="w-full h-full"
            frameBorder="0"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Webcams publiques proches via Windy.com • Cliquez sur un marqueur pour voir le flux
          </p>
          <button
            onClick={() => setShowEmbed(false)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Réduire
          </button>
        </div>
      </div>
    );
  }

  // ── Fallback : lien externe ────────────────────────────────────────────
  return (
    <div className="w-full rounded-lg border border-dark-border bg-gray-800/50 p-6 flex flex-col items-center justify-center space-y-3">
      <p className="text-gray-400 text-sm text-center">Pas de flux embarqué disponible pour cette caméra.</p>
      <a
        href={streamUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
      >
        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        <span>Voir la source officielle</span>
      </a>
    </div>
  );
}
