import { useState, useEffect } from 'react';
import { PlusCircle, Edit, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockPersons } from '../../lib/mockData';
import { api } from '../../lib/api';
import { toast } from 'sonner@2.0.3';
import type { Person } from '../../lib/types';

export function PersonsTab() {
  const [persons, setPersons] = useState<Person[]>(mockPersons);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    role: 'suspect' as 'suspect' | 'witness' | 'victim',
    phone: '',
    email: ''
  });

  // Fetch persons on mount
  useEffect(() => {
    const fetchPersons = async () => {
      setIsLoading(true);
      try {
        const fetchedPersons = await api.persons.getAll();
        setPersons(fetchedPersons);
      } catch (error) {
        console.error('Failed to fetch persons:', error);
        toast.error('Failed to load persons. Using offline mode.');
        // Fallback to mock data (already set in state)
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersons();
  }, []);

  const handleOpenSheet = (person?: Person) => {
    if (person) {
      setEditingPerson(person);
      setFormData({
        name: person.name,
        address: person.address,
        role: person.role,
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
      
      // Fallback: save locally
      if (editingPerson) {
        setPersons(persons.map(p => 
          p.id === editingPerson.id 
            ? { ...p, ...formData }
            : p
        ));
      } else {
        const newPerson: Person = {
          id: `person-${Date.now()}`,
          registrationNumber: `PR${Date.now().toString().slice(-6)}`,
          ...formData
        };
        setPersons([newPerson, ...persons]);
      }
      setIsSheetOpen(false);
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
                <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
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
        {persons.map((person) => (
          <Card key={person.id}>
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
                      <Badge variant="outline" className="text-xs">#{person.registrationNumber}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleOpenSheet(person)} className="h-8 px-2">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}