import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, DollarSign } from "lucide-react";

export interface Expense {
  id: string;
  amount: number;
  description: string;
  paidBy: string;
  date: Date;
}

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'date'>) => void;
}

const people = [
  "Alice", "Bob", "Charlie", "Diana", "Eva", "Frank"
];

export const ExpenseForm = ({ onAddExpense }: ExpenseFormProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [paidBy, setPaidBy] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !paidBy) return;

    onAddExpense({
      amount: parseFloat(amount),
      description,
      paidBy,
    });

    // Reset form
    setAmount("");
    setDescription("");
    setPaidBy("");
  };

  return (
    <Card className="shadow-financial border-0 bg-gradient-subtle">
      <CardHeader className="space-y-1 pb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <PlusCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-xl">Add New Expense</CardTitle>
            <CardDescription className="text-muted-foreground">
              Track your spending with ease
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 h-11 text-lg font-medium border-border/50 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-11 border-border/50 focus:border-primary focus:ring-primary/20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy" className="text-sm font-medium">
              Paid by
            </Label>
            <Select value={paidBy} onValueChange={setPaidBy} required>
              <SelectTrigger className="h-11 border-border/50 focus:border-primary focus:ring-primary/20">
                <SelectValue placeholder="Select who paid" />
              </SelectTrigger>
              <SelectContent>
                {people.map((person) => (
                  <SelectItem key={person} value={person}>
                    {person}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-primary hover:opacity-90 shadow-primary transition-all duration-200 text-base font-medium"
          >
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};