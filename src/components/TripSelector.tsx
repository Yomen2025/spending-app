import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Trip } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface TripSelectorProps {
  selectedTrip: Trip | null;
  onTripSelect: (trip: Trip) => void;
}

export const TripSelector = ({ selectedTrip, onTripSelect }: TripSelectorProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTripName, setNewTripName] = useState('');
  const [newTripDescription, setNewTripDescription] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error loading trips:', error);
      toast({
        title: "Error",
        description: "Failed to load trips",
        variant: "destructive",
      });
    }
  };

  const createTrip = async () => {
    if (!newTripName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('trips')
        .insert([{
          name: newTripName,
          description: newTripDescription,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTrips(prev => [data, ...prev]);
      onTripSelect(data);
      setNewTripName('');
      setNewTripDescription('');
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Trip created successfully",
      });
    } catch (error) {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Select Trip
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input
                    id="trip-name"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                    placeholder="Enter trip name"
                  />
                </div>
                <div>
                  <Label htmlFor="trip-description">Description (optional)</Label>
                  <Input
                    id="trip-description"
                    value={newTripDescription}
                    onChange={(e) => setNewTripDescription(e.target.value)}
                    placeholder="Enter trip description"
                  />
                </div>
                <Button onClick={createTrip} className="w-full">
                  Create Trip
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedTrip?.id || ''}
          onValueChange={(value) => {
            const trip = trips.find(t => t.id === value);
            if (trip) onTripSelect(trip);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a trip" />
          </SelectTrigger>
          <SelectContent>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id}>
                {trip.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};