import { BookOpen, AlertCircle, DollarSign, Package, BookCheck, Download, TrendingUp } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { calculateDashboardStats } from "@/lib/analytics";
import { Book, Transaction, User } from "@/lib/csvParser";
import { Button } from "./ui/button";
import { exportLibraryDataToExcel } from "@/lib/excelExport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

interface DashboardProps {
  books: Book[];
  transactions: Transaction[];
  users: User[];
}

export function Dashboard({ books, transactions, users }: DashboardProps) {
  const stats = calculateDashboardStats(books, transactions);

  const handleExportExcel = () => {
    exportLibraryDataToExcel(books, transactions, users);
  };

  const returnedBooks = transactions.filter(t => t.return_date).length;
  const returnRate = transactions.length > 0 ? ((returnedBooks / transactions.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Library overview and key metrics</p>
        </div>
        <Button onClick={handleExportExcel} size="lg" className="gap-2 shadow-sm">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Complete Report</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatsCard
          title="Total Books"
          value={stats.totalBooks}
          icon={Package}
          description="Total copies in library"
          variant="default"
        />
        <StatsCard
          title="Available"
          value={stats.availableBooks}
          icon={BookCheck}
          description="Ready to be issued"
          variant="success"
        />
        <StatsCard
          title="Currently Issued"
          value={stats.totalIssued}
          icon={BookOpen}
          description="Books in circulation"
          variant="default"
        />
        <StatsCard
          title="Overdue"
          value={stats.totalOverdue}
          icon={AlertCircle}
          description="Needs attention"
          variant="destructive"
        />
        <StatsCard
          title="Total Fines"
          value={`₹${stats.totalFines}`}
          icon={DollarSign}
          description="Accumulated fines"
          variant="warning"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Book Circulation</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{transactions.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Total transactions recorded</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <span className="text-muted-foreground">{returnedBooks} returned</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-warning"></div>
                <span className="text-muted-foreground">{stats.totalIssued} active</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-success/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Return Rate</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <BookCheck className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{returnRate}%</div>
            <p className="text-xs text-muted-foreground mt-2">Books returned on time</p>
            <div className="mt-4 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-success h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${returnRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold tracking-tight">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-2">Registered library members</p>
            <div className="mt-4 text-sm">
              <span className="font-medium text-primary">
                {new Set(transactions.map(t => t.user_id)).size}
              </span>
              <span className="text-muted-foreground"> active borrowers</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
