import { useState } from 'react';
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

interface OfficerDashboardProps {
  onLogout: () => void;
}

export function OfficerDashboard({ onLogout }: OfficerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'incidents' | 'persons' | 'statistics'>('incidents');
  const [showMenu, setShowMenu] = useState(false);

  const handleTabChange = (tab: 'incidents' | 'persons' | 'statistics') => {
    setActiveTab(tab);
    setShowMenu(false);
  };

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
                <h1 className="text-white">Emergency Nearby</h1>
                <p className="text-blue-200">Officer Portal</p>
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
                  onClick={onLogout}
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
        {activeTab === 'incidents' && <IncidentsTab />}
        {activeTab === 'persons' && <PersonsTab />}
        {activeTab === 'statistics' && <StatisticsTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-10">
        <div className="grid grid-cols-3">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'incidents' 
                ? 'text-blue-600' 
                : 'text-gray-500 active:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-xs">Incidents</span>
          </button>
          <button
            onClick={() => setActiveTab('persons')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'persons' 
                ? 'text-blue-600' 
                : 'text-gray-500 active:bg-gray-100'
            }`}
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-xs">Persons</span>
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`flex flex-col items-center gap-1 py-3 ${
              activeTab === 'statistics' 
                ? 'text-blue-600' 
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
