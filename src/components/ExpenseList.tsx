import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, User, Receipt, DollarSign, Users, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Trip, Expense, Contributor } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ExpenseListProps {
  selectedTrip: Trip | null;
  refreshTrigger: number;
}

export const ExpenseList = ({ selectedTrip, refreshTrigger }: ExpenseListProps) => {
  const [expenses, setExpenses] = useState<(Expense & { contributors: Contributor })[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', paid_by_contributor_id: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTrip) {
      loadExpenses();
      loadContributors();
    }
  }, [selectedTrip, refreshTrigger]);

  const loadExpenses = async () => {
    if (!selectedTrip) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          contributors (
            id,
            name,
            email,
            trip_id,
            created_at
          )
        `)
        .eq('trip_id', selectedTrip.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    }
  };

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

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      amount: expense.amount.toString(),
      description: expense.description,
      paid_by_contributor_id: expense.paid_by_contributor_id
    });
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          amount: parseFloat(editForm.amount),
          description: editForm.description,
          paid_by_contributor_id: editForm.paid_by_contributor_id
        })
        .eq('id', editingExpense.id);

      if (error) throw error;

      setEditingExpense(null);
      loadExpenses();
      
      toast({
        title: "Success",
        description: "Expense updated successfully",
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      loadExpenses();
      
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const spendingByPerson = expenses.reduce((acc, expense) => {
    const contributorName = expense.contributors?.name || 'Unknown';
    acc[contributorName] = (acc[contributorName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  if (!selectedTrip) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please select a trip to view expenses</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-subtle border-b border-border/50">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <div className="p-2 rounded-lg bg-gradient-primary shadow-primary">
            <Receipt className="h-5 w-5 text-primary-foreground" />
          </div>
          Expense Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-xl bg-gradient-primary shadow-primary">
            <DollarSign className="h-6 w-6 text-primary-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-foreground">{formatCurrency(totalAmount)}</div>
            <div className="text-sm text-primary-foreground/80">Total Spent</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted">
            <Receipt className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{expenses.length}</div>
            <div className="text-sm text-muted-foreground">Expenses</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-muted">
            <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{Object.keys(spendingByPerson).length}</div>
            <div className="text-sm text-muted-foreground">Contributors</div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Expenses List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Expenses</h3>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No expenses yet</p>
              <p className="text-sm text-muted-foreground">Add your first expense to get started</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-elegant group">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-gradient-primary shadow-primary group-hover:shadow-glow transition-all duration-300">
                    <Receipt className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {expense.description}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{expense.contributors?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(expense.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-bold text-primary">
                    {formatCurrency(expense.amount)}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditExpense(expense)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Spending by Person */}
        {Object.keys(spendingByPerson).length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Spending by Person</h3>
              <div className="space-y-2">
                {Object.entries(spendingByPerson)
                  .sort(([,a], [,b]) => b - a)
                  .map(([person, amount]) => (
                    <div key={person} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <span className="font-medium text-foreground">{person}</span>
                      <Badge variant="secondary" className="font-semibold">
                        {formatCurrency(amount)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editingExpense !== null} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-contributor">Paid By</Label>
              <Select
                value={editForm.paid_by_contributor_id}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, paid_by_contributor_id: value }))}
              >
                <SelectTrigger>
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
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateExpense} className="flex-1">
                Update Expense
              </Button>
              <Button variant="outline" onClick={() => setEditingExpense(null)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};