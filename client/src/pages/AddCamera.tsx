import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPinIcon, CameraIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { camerasAPI, categoriesAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface AddCameraProps {
  editMode?: boolean;
}

export default function AddCamera({ editMode = false }: AddCameraProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
    streamUrl: '',
    source: '',
    categoryId: '',
    status: 'PENDING',
  });

  useEffect(() => {
    categoriesAPI.getAll().then(res => setCategories(res.data));

    if (editMode && id) {
      camerasAPI.getById(id).then(res => {
        const c = res.data;
        setForm({
          name: c.name,
          description: c.description || '',
          latitude: String(c.latitude),
          longitude: String(c.longitude),
          imageUrl: c.imageUrl || '',
          streamUrl: c.streamUrl || '',
          source: c.source,
          categoryId: c.categoryId || c.category?.id || '',
          status: c.status,
        });
      });
    }
  }, [editMode, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Géolocalisation non disponible');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        toast.success('Position détectée');
      },
      () => toast.error('Impossible de détecter la position')
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.categoryId) { toast.error('Sélectionnez une catégorie'); return; }

    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || isNaN(lng)) { toast.error('Coordonnées invalides'); return; }

    setLoading(true);
    try {
      const data = {
        name: form.name,
        description: form.description,
        latitude: lat,
        longitude: lng,
        imageUrl: form.imageUrl || undefined,
        streamUrl: form.streamUrl,
        source: form.source,
        categoryId: form.categoryId,
        ...(user?.role !== 'USER' && { status: form.status }),
      };

      if (editMode && id) {
        await camerasAPI.update(id, data);
        toast.success('Caméra mise à jour !');
        navigate(`/camera/${id}`);
      } else {
        const res = await camerasAPI.create(data);
        toast.success('Caméra ajoutée ! En attente de validation.');
        navigate(`/camera/${res.data.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette caméra définitivement ?')) return;
    try {
      await camerasAPI.delete(id!);
      toast.success('Caméra supprimée');
      navigate('/');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Helmet>
        <title>{editMode ? 'Modifier' : 'Ajouter'} une caméra - CamMap Fort-de-France</title>
      </Helmet>

      <div className="min-h-screen bg-dark-bg py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <CameraIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {editMode ? 'Modifier la caméra' : 'Ajouter une caméra'}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {editMode ? 'Mettez à jour les informations' : 'Uniquement des caméras publiques légalement accessibles'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom de la caméra *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Webcam Plage de l'Anse Mitan"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Décrivez ce que montre cette caméra..."
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Catégorie *</label>
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Coordinates */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-300">Coordonnées GPS *</label>
                    <button
                      type="button"
                      onClick={handleLocate}
                      className="flex items-center space-x-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      <span>Utiliser ma position</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        required
                        step="any"
                        placeholder="14.6037"
                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Latitude</p>
                    </div>
                    <div>
                      <input
                        type="number"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        required
                        step="any"
                        placeholder="-61.0693"
                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Longitude</p>
                    </div>
                  </div>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Source officielle *</label>
                  <input
                    type="text"
                    name="source"
                    value={form.source}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Mairie de Fort-de-France, Météo France..."
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Stream URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">URL du flux public</label>
                  <input
                    type="url"
                    name="streamUrl"
                    value={form.streamUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/stream.m3u8"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">URL de l'image miniature</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Status (admin/moderator only) */}
                {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Statut</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="ACTIVE">Actif</option>
                      <option value="PENDING">En attente</option>
                      <option value="OFFLINE">Hors ligne</option>
                      <option value="REPORTED">Signalé</option>
                    </select>
                  </div>
                )}

                <div className="flex space-x-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {loading ? 'Sauvegarde...' : editMode ? 'Mettre à jour' : 'Soumettre la caméra'}
                  </button>

                  {editMode && user?.role === 'ADMIN' && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {!editMode && (
                  <p className="text-xs text-gray-500 text-center">
                    Les caméras soumises sont examinées par nos modérateurs avant publication.
                  </p>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
