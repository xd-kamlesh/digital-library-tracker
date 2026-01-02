import { useState } from "react";
import { Book, Transaction, User } from "@/lib/csvParser";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransactionsTableProps {
  transactions: Transaction[];
  books: Book[];
  users: User[];
}

export function TransactionsTable({ transactions, books, users }: TransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const enrichedTransactions = transactions.map((t) => ({
    ...t,
    book: books.find((b) => b.book_id === t.book_id),
    user: users.find((u) => u.user_id === t.user_id),
  }));

  const filteredTransactions = enrichedTransactions.filter((t) => {
    const matchesSearch =
      t.book?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "issued" && !t.return_date) ||
      (statusFilter === "returned" && t.return_date) ||
      (statusFilter === "overdue" && !t.return_date && t.fine > 0);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground mt-1">Track all book issues and returns</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="issued">Currently Issued</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Book Title</TableHead>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Fine</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((t) => (
                    <TableRow key={t.transaction_id}>
                      <TableCell className="font-mono text-sm">{t.transaction_id}</TableCell>
                      <TableCell className="font-medium">{t.book?.title || "N/A"}</TableCell>
                      <TableCell>{t.user?.name || "N/A"}</TableCell>
                      <TableCell>{t.issue_date}</TableCell>
                      <TableCell>{t.due_date}</TableCell>
                      <TableCell>{t.return_date || "-"}</TableCell>
                      <TableCell>
                        {t.fine > 0 ? (
                          <span className="font-semibold text-warning">₹{t.fine}</span>
                        ) : (
                          "₹0"
                        )}
                      </TableCell>
                      <TableCell>
                        {t.return_date ? (
                          <Badge className="bg-success text-success-foreground">Returned</Badge>
                        ) : t.fine > 0 ? (
                          <Badge variant="destructive">Overdue</Badge>
                        ) : (
                          <Badge variant="secondary">Issued</Badge>
                        )}
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
