import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddCamera from './pages/AddCamera';
import CameraDetail from './pages/CameraDetail';
import Profile from './pages/Profile';

function AppRoutes() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar user={user} onLogout={logout} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/camera/:id" element={<CameraDetail />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/add-camera"
            element={user ? <AddCamera /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-camera/:id"
            element={user ? <AddCamera editMode /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={
              user?.role === 'ADMIN' || user?.role === 'MODERATOR'
                ? <Dashboard />
                : <Navigate to="/" />
            }
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e2330',
                color: '#fff',
                border: '1px solid #2d3748',
              },
              success: { iconTheme: { primary: '#3b82f6', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
