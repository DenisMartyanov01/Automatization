import { useState, useEffect } from 'react';
import { Search, Calendar, User, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { mockIncidents, mockPersons } from '../../lib/mockData';
import { Badge } from '../ui/badge';
import { api } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { Incident, Person } from '../../lib/types';

export function StatisticsTab() {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [persons, setPersons] = useState<Person[]>(mockPersons);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedIncidents, fetchedPersons] = await Promise.all([
          api.incidents.getAll(),
          api.persons.getAll()
        ]);
        setIncidents(fetchedIncidents);
        setPersons(fetchedPersons);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Fallback to mock data (already set in state)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateRangeSearch = async () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error('Please select both start and end dates');
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch from API
      const statistics = await api.statistics.getByPeriod({
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      // For now, we'll still use local filtering
      // In production, the backend should return filtered incidents
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      const filtered = incidents.filter(incident => {
        const incidentDate = new Date(incident.date);
        return incidentDate >= start && incidentDate <= end;
      });

      setSearchResults({
        type: 'dateRange',
        count: filtered.length,
        incidents: filtered,
        start: dateRange.start,
        end: dateRange.end
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      
      // Fallback: local filtering
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);

      const filtered = incidents.filter(incident => {
        const incidentDate = new Date(incident.date);
        return incidentDate >= start && incidentDate <= end;
      });

      setSearchResults({
        type: 'dateRange',
        count: filtered.length,
        incidents: filtered,
        start: dateRange.start,
        end: dateRange.end
      });
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
      // Try to fetch from API
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
      
      // Fallback: local filtering
      const person = persons.find(p => p.id === selectedPersonId);
      const filtered = incidents.filter(incident => 
        incident.involvedPersons.includes(selectedPersonId)
      );

      setSearchResults({
        type: 'person',
        count: filtered.length,
        incidents: filtered,
        person: person
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalIncidents = () => incidents.length;
  const getTotalPersons = () => persons.length;

  const getIncidentsByRole = (role: string) => {
    const personsWithRole = persons.filter(p => p.role === role).map(p => p.id);
    return incidents.filter(incident => 
      incident.involvedPersons.some(id => personsWithRole.includes(id))
    ).length;
  };

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
            <CardTitle className="text-gray-900">{getTotalIncidents()}</CardTitle>
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
            <CardTitle className="text-gray-900">{getTotalPersons()}</CardTitle>
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
            <CardDescription>Suspect Cases</CardDescription>
            <CardTitle className="text-gray-900">{getIncidentsByRole('suspect')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Witness Cases</CardDescription>
            <CardTitle className="text-gray-900">{getIncidentsByRole('witness')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-3.5 h-3.5" />
              <span>Recorded</span>
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
            <Button onClick={handleDateRangeSearch} className="w-full h-12 gap-2">
              <Search className="w-4 h-4" />
              Search by Date
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
                    {person.name} - {person.role}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handlePersonSearch} className="w-full h-12 gap-2">
              <Search className="w-4 h-4" />
              Search by Person
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
              <div className="text-gray-900">{searchResults.count}</div>
            </div>

            {searchResults.incidents.length > 0 && (
              <div className="space-y-3">
                <div className="text-gray-900">Incident Details:</div>
                {searchResults.incidents.map((incident: any) => (
                  <div key={incident.id} className="bg-white rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-gray-900">{incident.type}</span>
                      <Badge variant="outline" className="text-xs">#{incident.registrationNumber}</Badge>
                    </div>
                    <div className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(incident.date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-600 mt-1 break-words">{incident.location}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}