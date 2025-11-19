import { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { PublicDashboard } from './components/PublicDashboard';
import { OfficerDashboard } from './components/OfficerDashboard';
import { api } from './lib/api';
import { toast, Toaster } from 'sonner';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Проверяем существующую сессию при загрузке приложения
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.auth.verify();
        if (response.success && response.user) {
          setIsAuthenticated(true);
          setUser(response.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Сессия невалидна, оставляем пользователя неавторизованным
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setLoginError(null); // Сбрасываем ошибку при новой попытке
    
    try {
      const response = await api.auth.login({ username, password });
      
      if (response.success && response.user) {
        setIsAuthenticated(true);
        setUser(response.user);
        setShowLogin(false);
        toast.success('Successfully logged in');
      } else {
        // Получаем понятное сообщение об ошибке от сервера
        const errorMessage = response.message || 'Login failed. Please check your credentials.';
        setLoginError(errorMessage);
        // Не показываем toast, так как ошибка уже отображается в форме
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Убираем офлайн-авторизацию и показываем понятные ошибки
      let errorMessage = 'Failed to connect to server. Please try again.';
      
      // Более специфичные сообщения об ошибках
      if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. Please check your credentials.';
      }
      
      setLoginError(errorMessage);
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
      setUser(null);
      setShowLogin(false);
      setLoginError(null);
      toast.success('Logged out successfully');
    }
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
    setLoginError(null);
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    setLoginError(null);
  };

  if (showLogin) {
    return (
      <LoginScreen 
        onLogin={handleLogin} 
        onClose={handleCloseLogin} 
        isLoading={isLoading}
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" richColors />
      {isAuthenticated && user ? (
        <OfficerDashboard onLogout={handleLogout} user={user} />
      ) : (
        <PublicDashboard onOpenLogin={handleOpenLogin} />
      )}
    </div>
  );
}