import { useState, useEffect } from 'react';
import { PlusCircle, Edit, MapPin, User, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import type { Person, Incident } from '../../lib/types';

export function PersonsTab() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    role: 'suspect' as 'suspect' | 'witness' | 'victim',
    phone: '',
    email: ''
  });

  // Fetch persons and incidents on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [fetchedPersons, fetchedIncidents] = await Promise.all([
          api.persons.getAll(),
          api.incidents.getAll()
        ]);
        setPersons(fetchedPersons);
        setIncidents(fetchedIncidents);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load data from server.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Функция для получения инцидентов по ID персоны
  const getIncidentsByPersonId = (personId: string): Incident[] => {
    return incidents.filter(incident => 
      incident.involvedPersons.includes(personId)
    );
  };

  const handleOpenSheet = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name,
        address: person.address,
        role: person.role as 'suspect' | 'witness' | 'victim',
        phone: person.phone,
        email: person.email
      });
    } else {
      setEditingPerson(null);
      setFormData({
        name: '',
        address: '',
        role: 'suspect',
        phone: '',
        email: ''
      });
    }
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPerson) {
        // Update existing person
        const updated = await api.persons.update(editingPerson.id, formData);
        setPersons(persons.map(p => 
          p.id === editingPerson.id ? updated : p
        ));
        toast.success('Person updated successfully');
      } else {
        // Create new person
        const newPerson = await api.persons.create(formData);
        setPersons([newPerson, ...persons]);
        toast.success('Person created successfully');
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Failed to save person:', error);
      toast.error('Failed to save person. Please try again.');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'suspect':
        return 'destructive';
      case 'witness':
        return 'secondary';
      case 'victim':
        return 'outline';
      default:
        return 'default';
    }
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

  const togglePersonExpansion = (personId: string) => {
    setExpandedPerson(expandedPerson === personId ? null : personId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Person Management</h2>
          <p className="text-gray-600">Total: {persons.length}</p>
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
              <SheetTitle>{editingPerson ? 'Edit Person' : 'Add New Person'}</SheetTitle>
              <SheetDescription>
                {editingPerson ? 'Modify the person details' : 'Enter person details'}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  className="h-12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value: 'suspect' | 'witness' | 'victim') => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suspect">Suspect</SelectItem>
                    <SelectItem value="witness">Witness</SelectItem>
                    <SelectItem value="victim">Victim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Enter full address"
                  className="h-12"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  className="h-12"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  className="h-12"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-2 pt-4">
                <Button onClick={handleSave} className="h-12">
                  {editingPerson ? 'Update Person' : 'Add Person'}
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
        {persons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No persons found</p>
              <Button 
                onClick={() => handleOpenSheet()} 
                className="mt-4 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Create First Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          persons.map((person) => {
            const personIncidents = getIncidentsByPersonId(person.id);
            const isExpanded = expandedPerson === person.id;
            
            return (
              <Card key={person.id}>
                <div
                  onClick={() => togglePersonExpansion(person.id)}
                  className="cursor-pointer active:bg-gray-50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2.5 rounded-full flex-shrink-0">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-gray-900 truncate">{person.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant={getRoleBadgeVariant(person.role)} className="text-xs">
                              {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">#{person.registration_number}</Badge>
                            {personIncidents.length > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {personIncidents.length} incident(s)
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSheet(person);
                        }} 
                        className="h-8 px-2"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="space-y-4 pt-0">
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2 text-gray-700">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span className="break-words">{person.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span>{person.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="w-4 h-4 flex-shrink-0" />
                          <span className="break-all">{person.email}</span>
                        </div>
                      </div>

                      {personIncidents.length > 0 && (
                        <div className="border-t pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4 text-gray-600" />
                            <h3 className="text-gray-900 font-medium">Involved in Incidents</h3>
                          </div>
                          <div className="space-y-2">
                            {personIncidents.map((incident) => (
                              <div key={incident.id} className="bg-gray-50 rounded-lg p-3 border">
                                <div className="flex items-start gap-2 mb-2">
                                  <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${getSeverityColor(incident.severity)}`} />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-medium text-gray-900">{incident.type}</span>
                                      <Badge variant="outline" className="text-xs">
                                        #{incident.registration_number}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(incident.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm">{incident.description}</p>
                                <div className="flex items-start gap-1 text-gray-500 text-sm mt-2">
                                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{incident.location}</span>
                                </div>
                              </div>
                            ))}
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
    </div>
  );
}