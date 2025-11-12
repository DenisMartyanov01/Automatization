import { useState, useEffect } from 'react';
import { AlertTriangle, Search, LogIn, MapPin, User, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { mockIncidents, mockPersons } from '../lib/mockData';
import { api } from '../lib/api';
import type { Incident, Person } from '../lib/types';

interface PublicDashboardProps {
  onOpenLogin: () => void;
}

export function PublicDashboard({ onOpenLogin }: PublicDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [persons, setPersons] = useState<Person[]>(mockPersons);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch public incidents on mount
  useEffect(() => {
    const fetchPublicData = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from API
        const publicIncidents = await api.incidents.getPublic();
        // Note: Public API returns limited data, so we need to fetch full incidents
        // This is a workaround - in real implementation, backend should handle this
        console.log('Fetched public incidents:', publicIncidents);
      } catch (error) {
        console.error('Failed to fetch public data:', error);
        // Fallback to mock data (already set in state)
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const filteredIncidents = incidents.filter(incident =>
    incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPersonInfo = (personId: string) => {
    return persons.find(p => p.id === personId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const toggleIncident = (incidentId: string) => {
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-blue-900">Emergency Nearby</h1>
                <p className="text-gray-600">Public Registry</p>
              </div>
            </div>
            <Button onClick={onOpenLogin} size="sm" variant="outline" className="gap-1.5">
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search incidents..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4">
        {/* Info Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-blue-900">
            View incident information including registration numbers and addresses of involved persons.
          </p>
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-900">Recent Incidents</h2>
            <span className="text-gray-500">{filteredIncidents.length} total</span>
          </div>
          
          {filteredIncidents.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No incidents found</p>
              </CardContent>
            </Card>
          ) : (
            filteredIncidents.map((incident) => {
              const isExpanded = expandedIncident === incident.id;
              return (
                <Card key={incident.id} className="overflow-hidden">
                  <div
                    onClick={() => toggleIncident(incident.id)}
                    className="cursor-pointer active:bg-gray-50"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSeverityColor(incident.severity)}`} />
                            <CardTitle className="text-gray-900 truncate">
                              {incident.type}
                            </CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {new Date(incident.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            #{incident.registrationNumber}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0 space-y-3">
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{incident.location}</span>
                        </div>

                        <div>
                          <p className="text-gray-900 mb-1">Description:</p>
                          <p className="text-gray-600">{incident.description}</p>
                        </div>

                        {incident.involvedPersons.length > 0 && (
                          <div className="border-t pt-3 mt-3">
                            <p className="text-gray-900 mb-2">Involved Persons:</p>
                            <div className="space-y-2">
                              {incident.involvedPersons.map((personId) => {
                                const person = getPersonInfo(personId);
                                if (!person) return null;
                                return (
                                  <div
                                    key={person.id}
                                    className="bg-gray-50 rounded-lg p-3"
                                  >
                                    <div className="flex items-start gap-2">
                                      <div className="bg-gray-200 p-1.5 rounded-full flex-shrink-0">
                                        <User className="w-3.5 h-3.5 text-gray-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                          <span className="text-gray-900">{person.name}</span>
                                          <Badge variant="secondary" className="text-xs">
                                            {person.role}
                                          </Badge>
                                        </div>
                                        <p className="text-gray-600 truncate">
                                          Reg. #{person.registrationNumber}
                                        </p>
                                        <p className="text-gray-600 flex items-start gap-1 mt-1">
                                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                          <span>{person.address}</span>
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}