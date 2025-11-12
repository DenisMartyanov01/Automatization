import { useState, useEffect } from 'react';
import { PlusCircle, Edit, MapPin, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockIncidents, mockPersons } from '../../lib/mockData';
import { api } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { Incident, Person } from '../../lib/types';

export function IncidentsTab() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [persons, setPersons] = useState<Person[]>(mockPersons);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: '',
    description: '',
    location: '',
    severity: 'medium' as 'low' | 'medium' | 'high',
    involvedPersons: [] as string[]
  });

  // Fetch incidents and persons on mount
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
        toast.error('Failed to load data. Using offline mode.');
        // Fallback to mock data (already set in state)
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenSheet = (incident?: Incident) => {
    if (incident) {
      setEditingIncident(incident);
      setFormData({
        type: incident.type,
        description: incident.description,
        location: incident.location,
        severity: incident.severity,
        involvedPersons: incident.involvedPersons
      });
    } else {
      setEditingIncident(null);
      setFormData({
        type: '',
        description: '',
        location: '',
        severity: 'medium',
        involvedPersons: []
      });
    }
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingIncident) {
        // Update existing incident
        const updated = await api.incidents.update(editingIncident.id, formData);
        setIncidents(incidents.map(inc => 
          inc.id === editingIncident.id ? updated : inc
        ));
        toast.success('Incident updated successfully');
      } else {
        // Create new incident
        const newIncident = await api.incidents.create(formData);
        setIncidents([newIncident, ...incidents]);
        toast.success('Incident created successfully');
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Failed to save incident:', error);
      toast.error('Failed to save incident. Please try again.');
      
      // Fallback: save locally
      if (editingIncident) {
        setIncidents(incidents.map(inc => 
          inc.id === editingIncident.id 
            ? { ...inc, ...formData }
            : inc
        ));
      } else {
        const newIncident: Incident = {
          id: `inc-${Date.now()}`,
          registrationNumber: `RN${Date.now().toString().slice(-6)}`,
          date: new Date().toISOString(),
          ...formData
        };
        setIncidents([newIncident, ...incidents]);
      }
      setIsSheetOpen(false);
    }
  };

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

  const togglePersonSelection = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: prev.involvedPersons.includes(personId)
        ? prev.involvedPersons.filter(id => id !== personId)
        : [...prev.involvedPersons, personId]
    }));
  };

  const toggleIncident = (incidentId: string) => {
    setExpandedIncident(expandedIncident === incidentId ? null : incidentId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Incident Management</h2>
          <p className="text-gray-600">Total: {incidents.length}</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpenSheet()} size="sm" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Add
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editingIncident ? 'Edit Incident' : 'Add New Incident'}</SheetTitle>
              <SheetDescription>
                {editingIncident ? 'Modify the incident details' : 'Enter incident details'}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Incident Type</Label>
                <Input
                  id="type"
                  placeholder="e.g., Theft, Assault"
                  className="h-12"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Enter full address"
                  className="h-12"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Involved Persons</Label>
                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {persons.map(person => (
                    <div key={person.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={`person-${person.id}`}
                        checked={formData.involvedPersons.includes(person.id)}
                        onChange={() => togglePersonSelection(person.id)}
                        className="w-5 h-5"
                      />
                      <label htmlFor={`person-${person.id}`} className="flex-1 cursor-pointer">
                        <div className="text-gray-900">{person.name}</div>
                        <div className="text-gray-500">({person.role})</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleSave} className="h-12">
                  {editingIncident ? 'Update Incident' : 'Create Incident'}
                </Button>
                <Button variant="outline" onClick={() => setIsSheetOpen(false)} className="h-12">
                  Cancel
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-3">
        {incidents.map((incident) => {
          const isExpanded = expandedIncident === incident.id;
          return (
            <Card key={incident.id}>
              <div
                onClick={() => toggleIncident(incident.id)}
                className="cursor-pointer active:bg-gray-50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSeverityColor(incident.severity)}`} />
                        <CardTitle className="text-gray-900 truncate">{incident.type}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          #{incident.registrationNumber}
                        </Badge>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(incident.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSheet(incident);
                        }}
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
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
                      <div className="border-t pt-3">
                        <p className="text-gray-900 mb-2">Involved Persons:</p>
                        <div className="space-y-2">
                          {incident.involvedPersons.map((personId) => {
                            const person = getPersonInfo(personId);
                            if (!person) return null;
                            return (
                              <div key={person.id} className="bg-gray-50 rounded p-3 flex items-center gap-2">
                                <div className="bg-gray-200 p-1.5 rounded-full">
                                  <User className="w-3.5 h-3.5 text-gray-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-gray-900">{person.name}</span>
                                    <Badge variant="secondary" className="text-xs">{person.role}</Badge>
                                  </div>
                                  <p className="text-gray-600 truncate">Reg. #{person.registrationNumber}</p>
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
        })}
      </div>
    </div>
  );
}