import { useState } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PublicDashboard } from './components/PublicDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { api } from './lib/api';
import { toast, Toaster } from 'sonner@2.0.3';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login({ username, password });
      
      if (response.success) {
        setIsAuthenticated(true);
        setShowLogin(false);
        toast.success('Successfully logged in');
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to connect to server. Using offline mode.');
      // Fallback: allow login in offline mode for development
      if (username && password) {
        setIsAuthenticated(true);
        setShowLogin(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setShowLogin(false);
      toast.success('Logged out successfully');
    }
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
  };

  if (showLogin) {
    return <LoginScreen onLogin={handleLogin} onClose={handleCloseLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {isAuthenticated ? (
        <OfficerDashboard onLogout={handleLogout} />
      ) : (
        <PublicDashboard onOpenLogin={handleOpenLogin} />
      )}
    </div>
  );
}