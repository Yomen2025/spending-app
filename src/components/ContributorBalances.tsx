import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ContributorBalance } from '@/lib/supabase';

interface ContributorBalancesProps {
  balances: ContributorBalance[];
}

export const ContributorBalances = ({ balances }: ContributorBalancesProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (balances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contributor Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No contributors yet</p>
        </CardContent>
      </Card>
    );
  }

  const totalExpenses = balances.reduce((sum, balance) => sum + balance.totalPaid, 0);
  const averagePerPerson = totalExpenses / balances.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contributor Balances</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Expenses:</span>
              <div className="font-semibold">{formatCurrency(totalExpenses)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Average per Person:</span>
              <div className="font-semibold">{formatCurrency(averagePerPerson)}</div>
            </div>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contributor</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {balances.map((balance) => (
              <TableRow key={balance.contributor.id}>
                <TableCell className="font-medium">
                  {balance.contributor.name}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(balance.totalPaid)}
                </TableCell>
                <TableCell className={`text-right font-semibold ${
                  balance.balance > 0 
                    ? 'text-green-600' 
                    : balance.balance < 0 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
                }`}>
                  {balance.balance > 0 && '+'}
                  {formatCurrency(balance.balance)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p>• Positive balance: Person is owed money</p>
          <p>• Negative balance: Person owes money</p>
        </div>
      </CardContent>
    </Card>
  );
};