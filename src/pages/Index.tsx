import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { TripSelector } from "@/components/TripSelector";
import { ContributorBalances } from "@/components/ContributorBalances";
import { Wallet, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Trip, ContributorBalance } from "@/lib/supabase";
/*import { useAuth } from "@/hooks/useAuth";*/

const Index = () => {
  /*const { user, loading, signOut } = useAuth();*/
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [contributorBalances, setContributorBalances] = useState<ContributorBalance[]>([]);

  /*// Redirect to auth if not authenticated
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }*/

  useEffect(() => {
    if (selectedTrip) {
      loadContributorBalances();
    }
  }, [selectedTrip, refreshTrigger]);

  const loadContributorBalances = async () => {
    if (!selectedTrip) return;

    try {
      // Get all contributors for the trip
      const { data: contributors, error: contributorsError } = await supabase
        .from('contributors')
        .select('*')
        .eq('trip_id', selectedTrip.id);

      if (contributorsError) throw contributorsError;

      // Get all expenses for the trip
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', selectedTrip.id);

      if (expensesError) throw expensesError;

      // Calculate balances
      const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      const contributorCount = contributors?.length || 1;
      const averagePerPerson = totalExpenses / contributorCount;

      const balances: ContributorBalance[] = (contributors || []).map(contributor => {
        const totalPaid = expenses?.filter(e => e.paid_by_contributor_id === contributor.id)
          .reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
        
        return {
          contributor,
          totalPaid,
          balance: totalPaid - averagePerPerson
        };
      });

      setContributorBalances(balances);
    } catch (error) {
      console.error('Error loading contributor balances:', error);
    }
  };

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-subtle border-b border-border/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-primary">
              <Wallet className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-foreground">ExpenseTracker</h1>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-muted-foreground">Smart expense management made simple</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Welcome! 
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                /*onClick={signOut}*/
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Trip & Form Section */}
          <div className="space-y-6">
            <TripSelector 
              selectedTrip={selectedTrip} 
              onTripSelect={setSelectedTrip} 
            />
            <ExpenseForm 
              selectedTrip={selectedTrip} 
              onExpenseAdded={handleExpenseAdded} 
            />
          </div>

          {/* List Section */}
          <div>
            <ExpenseList 
              selectedTrip={selectedTrip} 
              refreshTrigger={refreshTrigger} 
            />
          </div>

          {/* Balances Section */}
          <div>
            <ContributorBalances balances={contributorBalances} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;