import { useState, useEffect } from 'react';
import { Search, Calendar, User, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { Incident, Person, Statistics } from '../../lib/types';

export function StatisticsTab() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedIncidents, fetchedPersons, fetchedStats] = await Promise.all([
          api.incidents.getAll(),
          api.persons.getAll(),
          api.statistics.getOverall()
        ]);
        setIncidents(fetchedIncidents);
        setPersons(fetchedPersons);
        setStatistics(fetchedStats);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data from server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для подсчета инцидентов по ролям персон
  const getIncidentsCountByRole = (role: string): number => {
    return incidents.filter(incident => {
      // Для каждого инцидента проверяем, есть ли среди involvedPersons персона с указанной ролью
      return incident.involvedPersons.some(personId => {
        const person = persons.find(p => p.id === personId);
        return person?.role === role;
      });
    }).length;
  };

  // Функция для подсчета персон по ролям
  const getPersonsCountByRole = (role: string): number => {
    return persons.filter(person => person.role === role).length;
  };

  const handleDateRangeSearch = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsLoading(true);
    try {
      const statistics = await api.statistics.getByPeriod({
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      // Use backend statistics data
      setSearchResults({
        type: 'dateRange',
        count: statistics.totalIncidents,
        statistics: statistics,
        start: dateRange.start,
        end: dateRange.end
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      toast.error('Failed to fetch statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonSearch = async () => {
    if (!selectedPersonId) {
      toast.error('Please select a person');
      return;
    }

    setIsLoading(true);
    try {
      const filtered = await api.incidents.getByPersonId(selectedPersonId);
      const person = persons.find(p => p.id === selectedPersonId);

      setSearchResults({
        type: 'person',
        count: filtered.length,
        incidents: filtered,
        person: person
      });
    } catch (error) {
      console.error('Failed to fetch incidents by person:', error);
      toast.error('Failed to fetch incidents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !searchResults) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-gray-900">Statistics & Reports</h2>
        <p className="text-gray-600">Analyze incident data</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Incidents</CardDescription>
            <CardTitle className="text-gray-900">
              {statistics?.totalIncidents || incidents.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>All time</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Persons</CardDescription>
            <CardTitle className="text-gray-900">{persons.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span>Registered</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Suspect Incidents</CardDescription>
            <CardTitle className="text-gray-900">
              {getIncidentsCountByRole('suspect')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{getPersonsCountByRole('suspect')} suspects</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Witness Incidents</CardDescription>
            <CardTitle className="text-gray-900">
              {getIncidentsCountByRole('witness')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span>{getPersonsCountByRole('witness')} witnesses</span>
            </div>
          </CardContent>
        </Card>

        {/* Добавим карточку для жертв */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Victim Incidents</CardDescription>
            <CardTitle className="text-gray-900">
              {getIncidentsCountByRole('victim')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span>{getPersonsCountByRole('victim')} victims</span>
            </div>
          </CardContent>
        </Card>

        {/* Карточка для отображения распределения по severity */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>High Severity</CardDescription>
            <CardTitle className="text-gray-900">
              {statistics?.bySeverity?.high || incidents.filter(i => i.severity === 'high').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span>Critical cases</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search by Date Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Search by Date Range</CardTitle>
          <CardDescription>Calculate incidents in a time period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                className="h-12"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                className="h-12"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <Button 
              onClick={handleDateRangeSearch} 
              className="w-full h-12 gap-2"
              disabled={isLoading}
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Searching...' : 'Search by Date'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search by Person */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">Search by Person</CardTitle>
          <CardDescription>Get incidents for a specified person</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="person-select">Select Person</Label>
              <select
                id="person-select"
                className="w-full h-12 px-3 border border-gray-200 rounded-md bg-white"
                value={selectedPersonId}
                onChange={(e) => setSelectedPersonId(e.target.value)}
              >
                <option value="">Choose a person...</option>
                {persons.map(person => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.role} (Reg. #{person.registration_number})
                  </option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handlePersonSearch} 
              className="w-full h-12 gap-2"
              disabled={isLoading}
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Searching...' : 'Search by Person'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchResults && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-gray-900">Search Results</CardTitle>
            {searchResults.type === 'dateRange' ? (
              <CardDescription>
                {new Date(searchResults.start).toLocaleDateString()} - {new Date(searchResults.end).toLocaleDateString()}
              </CardDescription>
            ) : (
              <CardDescription>
                Involving {searchResults.person?.name}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-blue-600 mb-2">Total Incidents Found</div>
              <div className="text-gray-900 text-2xl font-bold">{searchResults.count}</div>
            </div>

            {searchResults.type === 'dateRange' && searchResults.statistics && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-gray-600 text-xs">High Severity</div>
                    <div className="text-red-600 font-bold">{searchResults.statistics.bySeverity?.high || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-gray-600 text-xs">Medium Severity</div>
                    <div className="text-yellow-600 font-bold">{searchResults.statistics.bySeverity?.medium || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-gray-600 text-xs">Low Severity</div>
                    <div className="text-green-600 font-bold">{searchResults.statistics.bySeverity?.low || 0}</div>
                  </div>
                </div>
                
                {searchResults.statistics.byType && Object.keys(searchResults.statistics.byType).length > 0 && (
                  <div>
                    <div className="text-gray-900 mb-2">Incidents by Type:</div>
                    <div className="space-y-2">
                      {Object.entries(searchResults.statistics.byType).map(([type, count]) => (
                        <div key={type} className="bg-white rounded-lg p-3 flex justify-between items-center">
                          <span className="text-gray-700 capitalize">{type}</span>
                          <Badge variant="outline">{count as number}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchResults.type === 'person' && searchResults.incidents.length > 0 && (
              <div className="space-y-3">
                <div className="text-gray-900">Incident Details:</div>
                {searchResults.incidents.map((incident: Incident) => (
                  <div key={incident.id} className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-gray-900 font-medium">{incident.type}</span>
                      <Badge variant="outline" className="text-xs">#{incident.registration_number}</Badge>
                      <Badge 
                        className={`text-xs ${
                          incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                    <div className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(incident.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-600 mt-1 break-words">{incident.location}</div>
                    <div className="text-gray-600 mt-2 text-sm">{incident.description}</div>
                  </div>
                ))}
              </div>
            )}

            {searchResults.count === 0 && (
              <div className="text-center text-gray-500 py-4">
                No incidents found for the selected criteria.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}