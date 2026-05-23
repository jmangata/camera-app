import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserIcon, CameraIcon, StarIcon, FlagIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { favoritesAPI } from '../lib/api';
import CameraCard from '../components/CameraCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.getAll()
      .then(res => setFavorites(res.data))
      .catch(() => toast.error('Erreur lors du chargement des favoris'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnfavorite = async (cameraId: string) => {
    try {
      await favoritesAPI.toggle(cameraId);
      setFavorites(prev => prev.filter(c => c.id !== cameraId));
      toast.success('Retiré des favoris');
    } catch {
      toast.error('Erreur');
    }
  };

  if (!user) return null;

  const roleColor = user.role === 'ADMIN' ? 'bg-red-600' : user.role === 'MODERATOR' ? 'bg-yellow-600' : 'bg-gray-600';

  return (
    <>
      <Helmet>
        <title>Mon profil - CamMap Fort-de-France</title>
      </Helmet>
      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Profile card */}
            <div className="card">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{user.username}</h1>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full text-white ${roleColor}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/add-camera" className="card hover:bg-gray-700/50 transition-colors flex items-center space-x-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <CameraIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-medium">Ajouter une caméra</span>
              </Link>
              {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                <Link to="/dashboard" className="card hover:bg-gray-700/50 transition-colors flex items-center space-x-3">
                  <div className="p-2 bg-yellow-600 rounded-lg">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Dashboard admin</span>
                </Link>
              )}
            </div>

            {/* Favorites */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2 mb-4">
                <StarIcon className="w-5 h-5 text-primary-400" />
                <span>Mes favoris ({favorites.length})</span>
              </h2>

              {loading ? (
                <p className="text-gray-400 text-sm">Chargement...</p>
              ) : favorites.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun favori pour le moment.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favorites.map(camera => (
                    <CameraCard
                      key={camera.id}
                      camera={camera}
                      isFavorited={true}
                      onFavorite={() => handleUnfavorite(camera.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
