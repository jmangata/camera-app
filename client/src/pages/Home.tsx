import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Map from '../components/Map';
import CameraCard from '../components/CameraCard';
import { api } from '../lib/api';

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

interface Category {
  id: string;
  name: string;
  color?: string;
  _count: {
    cameras: number;
  };
}

export default function Home() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    try {
      const [camerasRes, categoriesRes] = await Promise.all([
        api.get('/cameras', {
          params: selectedCategory ? { category: selectedCategory } : {}
        }),
        api.get('/categories')
      ]);
      
      setCameras(camerasRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCameras = cameras.filter(camera =>
    camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camera.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="bg-dark-card border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white">CamMap Fort-de-France</h1>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher une caméra..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <button
                onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                {viewMode === 'map' ? 'Liste' : 'Carte'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-80 bg-dark-card border-r border-dark-border overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center mb-4">
              <FunnelIcon className="w-5 h-5 text-gray-400 mr-2" />
              <h2 className="text-lg font-semibold text-white">Filtres</h2>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedCategory === ''
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Toutes les catégories ({cameras.length})
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category.name} ({category._count.cameras})
                </button>
              ))}
            </div>
          </div>
          
          {selectedCamera && (
            <div className="p-4 border-t border-dark-border">
              <h3 className="text-lg font-semibold text-white mb-3">
                {selectedCamera.name}
              </h3>
              <CameraCard camera={selectedCamera} />
            </div>
          )}
        </aside>

        <main className="flex-1">
          {viewMode === 'map' ? (
            <Map
              cameras={filteredCameras}
              onCameraClick={setSelectedCamera}
            />
          ) : (
            <div className="p-6 overflow-y-auto h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCameras.map((camera) => (
                  <CameraCard
                    key={camera.id}
                    camera={camera}
                    onClick={() => setSelectedCamera(camera)}
                  />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}