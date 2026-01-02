import { Book, Transaction, User } from './csvParser';

export interface DashboardStats {
  totalBooks: number;
  totalIssued: number;
  totalOverdue: number;
  totalFines: number;
  availableBooks: number;
}

export interface GenreData {
  genre: string;
  count: number;
}

export interface TopBorrower {
  user_id: string;
  name: string;
  borrowCount: number;
  totalFines: number;
}

export function calculateDashboardStats(
  books: Book[],
  transactions: Transaction[]
): DashboardStats {
  const totalBooks = books.reduce((sum, book) => sum + book.total_copies, 0);
  const availableBooks = books.reduce((sum, book) => sum + book.available_copies, 0);
  const totalIssued = transactions.filter(t => !t.return_date).length;
  const totalOverdue = transactions.filter(t => !t.return_date && t.fine > 0).length;
  const totalFines = transactions.reduce((sum, t) => sum + t.fine, 0);

  return {
    totalBooks,
    totalIssued,
    totalOverdue,
    totalFines,
    availableBooks,
  };
}

export function getGenreDistribution(
  books: Book[],
  transactions: Transaction[]
): GenreData[] {
  const genreMap = new Map<string, number>();

  transactions.forEach(transaction => {
    const book = books.find(b => b.book_id === transaction.book_id);
    if (book) {
      genreMap.set(book.genre, (genreMap.get(book.genre) || 0) + 1);
    }
  });

  return Array.from(genreMap.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTopBorrowers(
  transactions: Transaction[],
  users: User[],
  limit: number = 10
): TopBorrower[] {
  const borrowerMap = new Map<string, { count: number; fines: number }>();

  transactions.forEach(transaction => {
    const current = borrowerMap.get(transaction.user_id) || { count: 0, fines: 0 };
    borrowerMap.set(transaction.user_id, {
      count: current.count + 1,
      fines: current.fines + transaction.fine,
    });
  });

  return Array.from(borrowerMap.entries())
    .map(([user_id, data]) => {
      const user = users.find(u => u.user_id === user_id);
      return {
        user_id,
        name: user?.name || 'Unknown',
        borrowCount: data.count,
        totalFines: data.fines,
      };
    })
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, limit);
}

export function getOverdueTransactions(
  transactions: Transaction[],
  books: Book[],
  users: User[]
) {
  return transactions
    .filter(t => !t.return_date && t.fine > 0)
    .map(t => ({
      ...t,
      book: books.find(b => b.book_id === t.book_id),
      user: users.find(u => u.user_id === t.user_id),
    }))
    .sort((a, b) => b.fine - a.fine);
}
