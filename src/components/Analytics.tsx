import { Book, Transaction, User } from "@/lib/csvParser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getGenreDistribution, getTopBorrowers, getOverdueTransactions } from "@/lib/analytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportLibraryDataToExcel } from "@/lib/excelExport";

interface AnalyticsProps {
  books: Book[];
  transactions: Transaction[];
  users: User[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

export function Analytics({ books, transactions, users }: AnalyticsProps) {
  const genreData = getGenreDistribution(books, transactions);
  const topBorrowers = getTopBorrowers(transactions, users, 10);
  const overdueList = getOverdueTransactions(transactions, books, users);

  const exportToCSV = () => {
    const headers = ['User', 'Book', 'Issue Date', 'Due Date', 'Fine'];
    const rows = overdueList.map(t => [
      t.user?.name || 'N/A',
      t.book?.title || 'N/A',
      t.issue_date,
      t.due_date,
      `₹${t.fine}`
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overdue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportExcel = () => {
    exportLibraryDataToExcel(books, transactions, users);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground mt-1">Insights and data analysis</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" className="shadow-sm">
            <Download className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Overdue CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
          <Button onClick={handleExportExcel} className="shadow-sm">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Full Excel Report</span>
            <span className="sm:hidden">Excel</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Most Borrowed Genres</CardTitle>
            <CardDescription>Distribution of book borrowings by genre</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={genreData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="genre" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>Pie chart of genre popularity</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genreData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.genre}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {genreData.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Top Borrowers</CardTitle>
          <CardDescription>Most active library users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-center">Books Borrowed</TableHead>
                  <TableHead className="text-right">Total Fines</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topBorrowers.map((borrower, index) => (
                  <TableRow key={borrower.user_id}>
                    <TableCell>
                      <Badge variant={index < 3 ? "default" : "outline"}>#{index + 1}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{borrower.name}</TableCell>
                    <TableCell className="font-mono text-sm">{borrower.user_id}</TableCell>
                    <TableCell className="text-center">{borrower.borrowCount}</TableCell>
                    <TableCell className="text-right">
                      {borrower.totalFines > 0 ? (
                        <span className="font-semibold text-warning">₹{borrower.totalFines}</span>
                      ) : (
                        <span className="text-muted-foreground">₹0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Overdue Books</CardTitle>
          <CardDescription>Books that need immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No overdue books
                    </TableCell>
                  </TableRow>
                ) : (
                  overdueList.map((t) => (
                    <TableRow key={t.transaction_id}>
                      <TableCell className="font-medium">{t.book?.title || "N/A"}</TableCell>
                      <TableCell>{t.user?.name || "N/A"}</TableCell>
                      <TableCell>{t.issue_date}</TableCell>
                      <TableCell>{t.due_date}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-destructive">₹{t.fine}</span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
