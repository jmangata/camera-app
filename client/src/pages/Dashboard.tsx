import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CameraIcon, 
  UserGroupIcon, 
  FlagIcon, 
  ChartBarIcon,
  EyeIcon,
  UsersIcon 
} from '@heroicons/react/24/outline';
import { adminAPI, reportsAPI } from '../lib/api';

interface Stats {
  overview: {
    totalCameras: number;
    activeCameras: number;
    totalUsers: number;
    totalReports: number;
    pendingReports: number;
    totalCategories: number;
  };
  recentCameras: any[];
  camerasByCategory: any[];
}

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  _count: {
    cameras: number;
    reports: number;
    comments: number;
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse.data);
      } else if (activeTab === 'users') {
        const usersResponse = await adminAPI.getUsers();
        setUsers(usersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      fetchData();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleReportStatus = async (reportId: string, status: string) => {
    try {
      await reportsAPI.updateStatus(reportId, status);
      fetchData();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  if (loading && !stats) {
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
            <h1 className="text-2xl font-bold text-white">Tableau de bord Admin</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-1 mb-8">
          {(['overview', 'users', 'reports'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab === 'overview' && 'Aperçu'}
              {tab === 'users' && 'Utilisateurs'}
              {tab === 'reports' && 'Signalements'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-primary-600 rounded-lg">
                    <CameraIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total caméras</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.totalCameras}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-green-600 rounded-lg">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Caméras actives</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.activeCameras}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Total utilisateurs</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-600 rounded-lg">
                    <FlagIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Signalements</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.totalReports}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-red-600 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">En attente</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.pendingReports}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-600 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-400">Catégories</p>
                    <p className="text-2xl font-bold text-white">{stats.overview.totalCategories}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Caméras récentes</h3>
                <div className="space-y-3">
                  {stats.recentCameras.map((camera) => (
                    <div key={camera.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{camera.name}</p>
                        <p className="text-gray-400 text-sm">
                          {camera.category.name} • par {camera.addedByUser.username}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        camera.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {camera.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-white mb-4">Caméras par catégorie</h3>
                <div className="space-y-3">
                  {stats.camerasByCategory.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{category.name}</p>
                        <p className="text-gray-400 text-sm">{category.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">
                        {category._count.cameras}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Gestion des utilisateurs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left py-3 px-4 text-gray-400">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-gray-400">Rôle</th>
                    <th className="text-left py-3 px-4 text-gray-400">Inscrit le</th>
                    <th className="text-left py-3 px-4 text-gray-400">Contributions</th>
                    <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-dark-border">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-white font-medium">{user.username}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="px-2 py-1 bg-gray-700 text-white rounded border border-dark-border focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="USER">Utilisateur</option>
                          <option value="MODERATOR">Modérateur</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        <div className="text-sm">
                          <p>{user._count.cameras} caméras</p>
                          <p>{user._count.reports} signalements</p>
                          <p>{user._count.comments} commentaires</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-primary-400 hover:text-primary-300 text-sm">
                          Voir détails
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}