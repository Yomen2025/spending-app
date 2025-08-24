import { useState } from "react";
import { ExpenseForm, Expense } from "@/components/ExpenseForm";
import { ExpenseList } from "@/components/ExpenseList";
import { Wallet, TrendingUp } from "lucide-react";

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'date'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    setExpenses(prev => [newExpense, ...prev]);
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
            <div>
              <h1 className="text-4xl font-bold text-foreground">ExpenseTracker</h1>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-muted-foreground">Smart expense management made simple</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <ExpenseForm onAddExpense={handleAddExpense} />
          </div>

          {/* List Section */}
          <div>
            <ExpenseList expenses={expenses} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
