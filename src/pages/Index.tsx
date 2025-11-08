import { useState } from "react";
import { useLibraryData } from "@/hooks/useLibraryData";
import { Dashboard } from "@/components/Dashboard";
import { BooksTable } from "@/components/BooksTable";
import { TransactionsTable } from "@/components/TransactionsTable";
import { Analytics } from "@/components/Analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, BarChart3, List, FileText } from "lucide-react";

const Index = () => {
  const { books, users, transactions, loading } = useLibraryData();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading library data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Library Access Tracker</h1>
                <p className="text-xs text-muted-foreground">College Library Management</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{books.length} Books</p>
                <p className="text-xs text-muted-foreground">{users.length} Members</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="books" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Books</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <List className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard books={books} transactions={transactions} users={users} />
          </TabsContent>

          <TabsContent value="books">
            <BooksTable books={books} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTable transactions={transactions} books={books} users={users} />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics books={books} transactions={transactions} users={users} />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t mt-16 py-8 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Digital Library Access Tracker © 2025
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Campus Utility System
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
