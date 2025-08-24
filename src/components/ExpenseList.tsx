import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, TrendingUp, Users, DollarSign } from "lucide-react";
import { Expense } from "./ExpenseForm";

interface ExpenseListProps {
  expenses: Expense[];
}

export const ExpenseList = ({ expenses }: ExpenseListProps) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const expensesByPerson = expenses.reduce((acc, expense) => {
    acc[expense.paidBy] = (acc[expense.paidBy] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-primary shadow-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-primary-foreground">{formatCurrency(totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-foreground/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-accent shadow-financial">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground/80 text-sm font-medium">Total Expenses</p>
                <p className="text-2xl font-bold text-accent-foreground">{expenses.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-accent-foreground/80" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-subtle shadow-financial">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Contributors</p>
                <p className="text-2xl font-bold text-foreground">{Object.keys(expensesByPerson).length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="shadow-financial border-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle>Recent Expenses</CardTitle>
          </div>
          <CardDescription>
            Track all your spending in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-2">No expenses yet</p>
              <p className="text-muted-foreground text-sm">Add your first expense above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{expense.description}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {expense.paidBy}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary by Person */}
      {Object.keys(expensesByPerson).length > 0 && (
        <Card className="shadow-financial border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Spending by Person
            </CardTitle>
            <CardDescription>
              See who's contributed how much
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(expensesByPerson)
                .sort(([, a], [, b]) => b - a)
                .map(([person, amount]) => (
                  <div key={person} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                    <span className="font-medium text-foreground">{person}</span>
                    <span className="font-bold text-primary">{formatCurrency(amount)}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};