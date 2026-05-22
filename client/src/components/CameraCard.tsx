import { CameraIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Camera {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  streamUrl: string;
  source: string;
  status: string;
  category: {
    name: string;
    color?: string;
  };
  addedByUser: {
    username: string;
  };
  createdAt: string;
  _count: {
    reports: number;
    comments: number;
    favorites: number;
  };
}

interface CameraCardProps {
  camera: Camera;
  onClick?: () => void;
  onReport?: () => void;
  onFavorite?: () => void;
  isFavorited?: boolean;
}

export default function CameraCard({ 
  camera, 
  onClick, 
  onReport, 
  onFavorite,
  isFavorited = false 
}: CameraCardProps) {
  const statusColor = camera.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="card cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="relative">
        {camera.imageUrl ? (
          <img
            src={camera.imageUrl}
            alt={camera.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-48 bg-gray-700 rounded-t-lg flex items-center justify-center">
            <CameraIcon className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        <div className="absolute top-2 right-2">
          <span className={`inline-block w-3 h-3 rounded-full ${statusColor}`}></span>
        </div>
        
        <div className="absolute top-2 left-2">
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary-600 text-white">
            {camera.category.name}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{camera.name}</h3>
        
        {camera.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {camera.description}
          </p>
        )}

        <div className="flex items-center text-gray-400 text-sm mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span>{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</span>
        </div>

        <div className="flex items-center text-gray-400 text-sm mb-3">
          <ClockIcon className="w-4 h-4 mr-1" />
          <span>Ajoutée par {camera.addedByUser.username}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex space-x-3">
            <span>{camera._count.favorites} favoris</span>
            <span>{camera._count.comments} commentaires</span>
            {camera._count.reports > 0 && (
              <span className="text-red-400">{camera._count.reports} signalements</span>
            )}
          </div>
        </div>

        <div className="flex space-x-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite?.();
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors ${
              isFavorited
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {isFavorited ? 'Favori' : 'Ajouter'}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReport?.();
            }}
            className="flex-1 py-2 px-3 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Signaler
          </button>
        </div>
      </div>
    </motion.div>
  );
}