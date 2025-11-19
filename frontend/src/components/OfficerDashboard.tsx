import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  UserPlus, 
  FileText, 
  LogOut, 
  Shield,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { IncidentsTab } from './officer/IncidentsTab';
import { PersonsTab } from './officer/PersonsTab';
import { StatisticsTab } from './officer/StatisticsTab';
import { api } from '../lib/api';

interface OfficerDashboardProps {
  onLogout: () => void;
  user: {
    id: string;
    username: string;
    email?: string;
    role?: string;
  } | null;
}

export function OfficerDashboard({ onLogout, user }: OfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'incidents' | 'persons' | 'statistics'>('incidents');
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Проверяем наличие пользователя
        if (!user) {
          setError('User information not available');
          setIsLoading(false);
          return;
        }

        // Verify user session and load initial data
        await api.auth.verify();
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        setError('Failed to load dashboard data');
        // Если session is invalid, trigger logout после показа ошибки
        setTimeout(() => onLogout(), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();
  }, [onLogout, user]);

  const handleTabChange = (tab: 'incidents' | 'persons' | 'statistics') => {
    setActiveTab(tab);
    setShowMenu(false);
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      onLogout();
    }
  };

  // Показываем ошибку если есть
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-2">Redirecting to login...</p>
          </div>
          <Button onClick={onLogout} variant="outline">
            Return to Login Now
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-700 p-2 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-white font-semibold">Emergency Nearby</h1>
                {/* Безопасный доступ к username */}
                <p className="text-blue-200 text-sm">
                  Officer Portal • {user?.username || 'Unknown User'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowMenu(!showMenu)} 
                size="sm"
                variant="ghost" 
                className="text-white hover:bg-blue-800 p-2"
              >
                {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="mt-3 bg-blue-800 rounded-lg overflow-hidden">
              <button
                onClick={() => handleTabChange('incidents')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                  activeTab === 'incidents' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Incidents</span>
              </button>
              <button
                onClick={() => handleTabChange('persons')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                  activeTab === 'persons' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <UserPlus className="w-5 h-5" />
                <span>Persons</span>
              </button>
              <button
                onClick={() => handleTabChange('statistics')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                  activeTab === 'statistics' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Statistics</span>
              </button>
              <div className="border-t border-blue-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {!dataLoaded ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'incidents' && <IncidentsTab />}
            {activeTab === 'persons' && <PersonsTab />}
            {activeTab === 'statistics' && <StatisticsTab />}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="grid grid-cols-3">
          <button
            onClick={() => handleTabChange('incidents')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'incidents' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 active:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Incidents</span>
          </button>
          <button
            onClick={() => handleTabChange('persons')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'persons' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 active:bg-gray-100'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-xs">Persons</span>
          </button>
          <button
            onClick={() => handleTabChange('statistics')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'statistics' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 active:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs">Statistics</span>
          </button>
        </div>
      </nav>
    </div>
  );
}