import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Trip, Contributor } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ExpenseFormProps {
  selectedTrip: Trip | null;
  onExpenseAdded: () => void;
}

export const ExpenseForm = ({ selectedTrip, onExpenseAdded }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedContributor, setSelectedContributor] = useState("");
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isAddContributorOpen, setIsAddContributorOpen] = useState(false);
  const [newContributorName, setNewContributorName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTrip) {
      loadContributors();
    }
  }, [selectedTrip]);

  const loadContributors = async () => {
    if (!selectedTrip) return;

    try {
      const { data, error } = await supabase
        .from('contributors')
        .select('*')
        .eq('trip_id', selectedTrip.id)
        .order('name');

      if (error) throw error;
      setContributors(data || []);
    } catch (error) {
      console.error('Error loading contributors:', error);
    }
  };

  const addContributor = async () => {
    if (!newContributorName.trim() || !selectedTrip) return;

    try {
      const { data, error } = await supabase
        .from('contributors')
        .insert([{
          name: newContributorName,
          trip_id: selectedTrip.id
        }])
        .select()
        .single();

      if (error) throw error;

      setContributors(prev => [...prev, data]);
      setNewContributorName('');
      setIsAddContributorOpen(false);
      
      toast({
        title: "Success",
        description: "Contributor added successfully",
      });
    } catch (error) {
      console.error('Error adding contributor:', error);
      toast({
        title: "Error",
        description: "Failed to add contributor",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !selectedContributor || !selectedTrip) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select a trip",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('expenses')
        .insert([{
          amount: parseFloat(amount),
          description,
          trip_id: selectedTrip.id,
          paid_by_contributor_id: selectedContributor,
          created_by: user.id
        }]);

      if (error) throw error;

      // Reset form
      setAmount("");
      setDescription("");
      setSelectedContributor("");
      
      toast({
        title: "Success",
        description: "Expense added successfully",
      });
      
      onExpenseAdded();
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  if (!selectedTrip) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select a trip to add expenses</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-subtle border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-lg bg-gradient-primary shadow-primary">
            <DollarSign className="h-5 w-5 text-primary-foreground" />
          </div>
          Add New Expense
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-foreground">
              Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 transition-all duration-300 focus:shadow-glow"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="transition-all duration-300 focus:shadow-glow"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy" className="text-sm font-medium text-foreground">
              Paid By
            </Label>
            <div className="flex gap-2">
              <Select value={selectedContributor} onValueChange={setSelectedContributor} required>
                <SelectTrigger className="transition-all duration-300 focus:shadow-glow">
                  <SelectValue placeholder="Select who paid" />
                </SelectTrigger>
                <SelectContent>
                  {contributors.map((contributor) => (
                    <SelectItem key={contributor.id} value={contributor.id}>
                      {contributor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isAddContributorOpen} onOpenChange={setIsAddContributorOpen}>
                <DialogTrigger asChild>
                  <Button type="button" size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Contributor</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contributor-name">Name</Label>
                      <Input
                        id="contributor-name"
                        value={newContributorName}
                        onChange={(e) => setNewContributorName(e.target.value)}
                        placeholder="Enter contributor name"
                      />
                    </div>
                    <Button onClick={addContributor} className="w-full">
                      Add Contributor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 shadow-primary"
            size="lg"
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};