import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  MapPinIcon, ClockIcon, StarIcon, FlagIcon, ChatBubbleLeftIcon,
  PencilIcon, TrashIcon, ArrowLeftIcon, CheckCircleIcon, XCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid, HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { camerasAPI, commentsAPI, favoritesAPI, reportsAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import StreamPlayer from '../components/StreamPlayer';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { username: string; role: string };
}

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
  category: { name: string; color?: string; icon?: string };
  addedByUser: { username: string };
  comments: Comment[];
  _count: { reports: number; favorites: number };
}

export default function CameraDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [camera, setCamera] = useState<Camera | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchCamera();

    // Socket.io real-time comments
    socketRef.current = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current.emit('join-camera', id);
    socketRef.current.on('new-comment', (comment: Comment) => {
      setComments(prev => [comment, ...prev]);
    });

    return () => {
      socketRef.current?.emit('leave-camera', id);
      socketRef.current?.disconnect();
    };
  }, [id]);

  const fetchCamera = async () => {
    try {
      const [cameraRes, commentsRes] = await Promise.all([
        camerasAPI.getById(id!),
        commentsAPI.getByCamera(id!),
      ]);
      setCamera(cameraRes.data);
      setComments(commentsRes.data);

      if (user) {
        const favRes = await favoritesAPI.check(id!);
        setIsFavorited(favRes.data.favorited);
      }
    } catch {
      toast.error('Caméra introuvable');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) { toast.error('Connectez-vous pour ajouter aux favoris'); return; }
    try {
      const res = await favoritesAPI.toggle(id!);
      setIsFavorited(res.data.favorited);
      toast.success(res.data.favorited ? 'Ajouté aux favoris' : 'Retiré des favoris');
    } catch {
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Connectez-vous pour commenter'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await commentsAPI.create(id!, newComment);
      setNewComment('');
      toast.success('Commentaire ajouté');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors du commentaire');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsAPI.delete(id!, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Commentaire supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Connectez-vous pour signaler'); return; }
    if (!reportReason.trim()) return;
    setSubmitting(true);
    try {
      await reportsAPI.create({ reason: reportReason, cameraId: id! });
      setReportReason('');
      setShowReportForm(false);
      toast.success('Signalement envoyé, merci !');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!camera) return null;

  const statusMap: Record<string, { label: string; color: string }> = {
    ACTIVE: { label: 'Actif', color: 'bg-green-500' },
    OFFLINE: { label: 'Hors ligne', color: 'bg-red-500' },
    PENDING: { label: 'En attente', color: 'bg-yellow-500' },
    REPORTED: { label: 'Signalé', color: 'bg-orange-500' },
  };
  const statusInfo = statusMap[camera.status] || statusMap.ACTIVE;

  return (
    <>
      <Helmet>
        <title>{camera.name} - CamMap Fort-de-France</title>
        <meta name="description" content={camera.description || `Caméra ${camera.name} à Fort-de-France`} />
      </Helmet>

      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Retour</span>
          </button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Stream player */}
            <div className="card p-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase mb-3 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                <span>Flux en direct</span>
              </h2>
              <StreamPlayer
                streamUrl={camera.streamUrl || ''}
                name={camera.name}
                latitude={camera.latitude}
                longitude={camera.longitude}
                category={camera.category.name}
              />
            </div>

            {/* Header card */}
            <div className="card overflow-hidden">
              {camera.imageUrl && (
                <img
                  src={camera.imageUrl}
                  alt={camera.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${statusInfo.color}`} />
                      <span className="text-sm text-gray-400">{statusInfo.label}</span>
                      <span className="text-sm px-2 py-0.5 rounded-full bg-primary-600/20 text-primary-400">
                        {camera.category.name}
                      </span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{camera.name}</h1>
                    {camera.description && (
                      <p className="text-gray-300">{camera.description}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleFavorite}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-colors ${
                        isFavorited
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {isFavorited ? <HeartSolid className="w-5 h-5" /> : <StarIcon className="w-5 h-5" />}
                      <span>{isFavorited ? 'Favori' : 'Ajouter'}</span>
                    </button>

                    {(user?.role === 'ADMIN' || user?.role === 'MODERATOR') && (
                      <Link
                        to={`/edit-camera/${camera.id}`}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
                      >
                        <PencilIcon className="w-5 h-5" />
                        <span>Modifier</span>
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-dark-border">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <MapPinIcon className="w-4 h-4" />
                    <div>
                      <p className="text-xs">Coordonnées</p>
                      <p className="text-white text-sm">{camera.latitude.toFixed(4)}, {camera.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <div>
                      <p className="text-xs">Ajoutée le</p>
                      <p className="text-white text-sm">{new Date(camera.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <StarIcon className="w-4 h-4" />
                    <div>
                      <p className="text-xs">Favoris</p>
                      <p className="text-white text-sm">{camera._count.favorites}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <FlagIcon className="w-4 h-4" />
                    <div>
                      <p className="text-xs">Signalements</p>
                      <p className="text-white text-sm">{camera._count.reports}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-dark-border flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Source : <span className="text-gray-200">{camera.source}</span> •
                    Ajoutée par <span className="text-gray-200">{camera.addedByUser.username}</span>
                  </p>
                  {camera.streamUrl && (
                    <a
                      href={camera.streamUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300"
                    >
                      <span>Source officielle</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Report form */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <FlagIcon className="w-5 h-5 text-red-400" />
                  <span>Signaler un problème</span>
                </h2>
                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {showReportForm ? 'Annuler' : 'Signaler'}
                </button>
              </div>

              {showReportForm && (
                <form onSubmit={handleReport} className="space-y-3">
                  <textarea
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    placeholder="Décrivez le problème (flux hors ligne, informations incorrectes, etc.)"
                    rows={3}
                    className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !reportReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer le signalement'}
                  </button>
                </form>
              )}
            </div>

            {/* Comments */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white flex items-center space-x-2 mb-6">
                <ChatBubbleLeftIcon className="w-5 h-5 text-primary-400" />
                <span>Commentaires ({comments.length})</span>
              </h2>

              {user ? (
                <form onSubmit={handleComment} className="mb-6">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        rows={2}
                        maxLength={500}
                        className="w-full px-4 py-2.5 bg-dark-bg border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{newComment.length}/500</span>
                        <button
                          type="submit"
                          disabled={submitting || !newComment.trim()}
                          className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {submitting ? 'Envoi...' : 'Commenter'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <p className="text-gray-400 text-sm mb-6">
                  <Link to="/login" className="text-primary-400 hover:text-primary-300">Connectez-vous</Link> pour commenter.
                </p>
              )}

              <div className="space-y-4">
                {comments.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">Aucun commentaire pour le moment.</p>
                )}
                {comments.map(comment => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex space-x-3"
                  >
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {comment.user.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-white text-sm font-medium">{comment.user.username}</span>
                        {comment.user.role !== 'USER' && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            comment.user.role === 'ADMIN' ? 'bg-red-600' : 'bg-yellow-600'
                          } text-white`}>
                            {comment.user.role}
                          </span>
                        )}
                        <span className="text-gray-500 text-xs">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                    {(user?.id === comment.user.username || user?.role === 'ADMIN') && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
