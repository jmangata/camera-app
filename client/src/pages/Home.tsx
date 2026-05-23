import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  MagnifyingGlassIcon, FunnelIcon, PlusIcon,
  Squares2X2Icon, MapIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import Map from '../components/Map';
import CameraCard from '../components/CameraCard';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Camera {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  streamUrl?: string;
  source: string;
  status: string;
  createdAt: string;
  category: { name: string; color?: string };
  addedByUser: { username: string };
  _count: { reports: number; comments: number; favorites: number };
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  _count: { cameras: number };
}

export default function Home() {
  const { user } = useAuth();
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus]);

  const fetchData = async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const [camerasRes, categoriesRes] = await Promise.all([
        api.get('/cameras', { params }),
        api.get('/categories'),
      ]);
      setCameras(camerasRes.data);
      setCategories(categoriesRes.data);
    } catch {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filteredCameras = cameras.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.source?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Nom', 'Description', 'Catégorie', 'Statut', 'Source', 'Latitude', 'Longitude', 'Date ajout'];
    const rows = filteredCameras.map(c => [
      `"${c.name}"`,
      `"${c.description || ''}"`,
      `"${c.category.name}"`,
      c.status,
      `"${c.source}"`,
      c.latitude,
      c.longitude,
      new Date(c.createdAt).toLocaleDateString('fr-FR'),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cammap-cameras-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredCameras.length} caméras exportées`);
  };

  const statuses = [
    { value: '', label: 'Tous statuts' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'OFFLINE', label: 'Hors ligne' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'REPORTED', label: 'Signalé' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>CamMap Fort-de-France - Carte des caméras publiques</title>
        <meta name="description" content="Carte interactive des caméras publiques et webcams de Fort-de-France, Martinique." />
        <meta property="og:title" content="CamMap Fort-de-France" />
        <meta property="og:description" content="Visualisez les caméras publiques de Fort-de-France en temps réel." />
      </Helmet>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-dark-card border-r border-dark-border overflow-y-auto flex-shrink-0"
            >
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Add camera button */}
                {user && (
                  <Link
                    to="/add-camera"
                    className="flex items-center justify-center space-x-2 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Ajouter une caméra</span>
                  </Link>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-dark-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{filteredCameras.length}</p>
                    <p className="text-xs text-gray-400">Caméras</p>
                  </div>
                  <div className="bg-dark-bg rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {filteredCameras.filter(c => c.status === 'ACTIVE').length}
                    </p>
                    <p className="text-xs text-gray-400">Actives</p>
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Statut</p>
                  <div className="space-y-1">
                    {statuses.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedStatus(s.value)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          selectedStatus === s.value
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category filter */}
                <div>
                  <div className="flex items-center space-x-1 mb-2">
                    <FunnelIcon className="w-4 h-4 text-gray-400" />
                    <p className="text-xs text-gray-400 uppercase font-semibold">Catégories</p>
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === ''
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Toutes ({cameras.length})
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          selectedCategory === cat.id
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span>{cat.icon} {cat.name}</span>
                        <span className="text-xs opacity-70">{cat._count.cameras}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Export CSV */}
                <button
                  onClick={exportCSV}
                  className="flex items-center justify-center space-x-2 w-full py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Exporter CSV</span>
                </button>
              </div>

              {/* Selected camera preview */}
              <AnimatePresence>
                {selectedCamera && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-t border-dark-border p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-white">Sélectionnée</h3>
                      <button onClick={() => setSelectedCamera(null)} className="text-gray-500 hover:text-white text-xs">
                        ✕
                      </button>
                    </div>
                    <CameraCard camera={selectedCamera} />
                    <Link
                      to={`/camera/${selectedCamera.id}`}
                      className="mt-3 block text-center py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                    >
                      Voir la fiche complète →
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="bg-dark-card border-b border-dark-border px-4 py-2 flex items-center space-x-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Toggle sidebar"
            >
              <FunnelIcon className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center bg-dark-bg border border-dark-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1.5 text-sm flex items-center space-x-1 transition-colors ${
                  viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-4 h-4" />
                <span>Carte</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-sm flex items-center space-x-1 transition-colors ${
                  viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
                <span>Liste</span>
              </button>
            </div>
          </div>

          {/* Map or List */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'map' ? (
              <Map
                cameras={filteredCameras}
                onCameraClick={setSelectedCamera}
              />
            ) : (
              <div className="h-full overflow-y-auto p-4">
                {filteredCameras.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-lg">Aucune caméra trouvée</p>
                    <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCameras.map(camera => (
                      <Link key={camera.id} to={`/camera/${camera.id}`}>
                        <CameraCard
                          camera={camera}
                          onClick={() => setSelectedCamera(camera)}
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
