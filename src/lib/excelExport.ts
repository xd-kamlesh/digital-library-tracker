import * as XLSX from 'xlsx';
import { Book, Transaction, User } from './csvParser';
import { calculateDashboardStats, getGenreDistribution, getTopBorrowers, getOverdueTransactions } from './analytics';

export function exportLibraryDataToExcel(
  books: Book[],
  transactions: Transaction[],
  users: User[]
) {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 1. Dashboard Summary Sheet
  const stats = calculateDashboardStats(books, transactions);
  const summaryData = [
    ['Digital Library Access Tracker - Summary Report'],
    ['Generated on:', new Date().toLocaleString()],
    [''],
    ['Metric', 'Value'],
    ['Total Books (All Copies)', stats.totalBooks],
    ['Available Books', stats.availableBooks],
    ['Currently Issued', stats.totalIssued],
    ['Overdue Books', stats.totalOverdue],
    ['Total Fines Accumulated', `₹${stats.totalFines}`],
    [''],
    ['Additional Statistics'],
    ['Unique Book Titles', books.length],
    ['Total Users', users.length],
    ['Total Transactions', transactions.length],
    ['Books Returned', transactions.filter(t => t.return_date).length],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ width: 30 }, { width: 20 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // 2. Books Catalog Sheet
  const booksData = [
    ['Book ID', 'Title', 'Author', 'Genre', 'Available Copies', 'Total Copies', 'Status'],
    ...books.map(book => [
      book.book_id,
      book.title,
      book.author,
      book.genre,
      book.available_copies,
      book.total_copies,
      book.available_copies === 0 ? 'Not Available' : 
        book.available_copies < book.total_copies / 2 ? 'Low Stock' : 'Available'
    ])
  ];
  const booksSheet = XLSX.utils.aoa_to_sheet(booksData);
  booksSheet['!cols'] = [
    { width: 10 },
    { width: 35 },
    { width: 25 },
    { width: 20 },
    { width: 15 },
    { width: 12 },
    { width: 15 }
  ];
  XLSX.utils.book_append_sheet(workbook, booksSheet, 'Books Catalog');

  // 3. Transactions Sheet
  const transactionsData = [
    ['Transaction ID', 'Book ID', 'Book Title', 'User ID', 'User Name', 'Issue Date', 'Due Date', 'Return Date', 'Fine', 'Status'],
    ...transactions.map(t => {
      const book = books.find(b => b.book_id === t.book_id);
      const user = users.find(u => u.user_id === t.user_id);
      return [
        t.transaction_id,
        t.book_id,
        book?.title || 'N/A',
        t.user_id,
        user?.name || 'N/A',
        t.issue_date,
        t.due_date,
        t.return_date || 'Not Returned',
        `₹${t.fine}`,
        t.return_date ? 'Returned' : t.fine > 0 ? 'Overdue' : 'Issued'
      ];
    })
  ];
  const transactionsSheet = XLSX.utils.aoa_to_sheet(transactionsData);
  transactionsSheet['!cols'] = [
    { width: 15 },
    { width: 10 },
    { width: 35 },
    { width: 10 },
    { width: 20 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'Transactions');

  // 4. Top Borrowers Sheet
  const topBorrowers = getTopBorrowers(transactions, users, 20);
  const borrowersData = [
    ['Rank', 'User ID', 'Name', 'Books Borrowed', 'Total Fines'],
    ...topBorrowers.map((borrower, index) => [
      index + 1,
      borrower.user_id,
      borrower.name,
      borrower.borrowCount,
      `₹${borrower.totalFines}`
    ])
  ];
  const borrowersSheet = XLSX.utils.aoa_to_sheet(borrowersData);
  borrowersSheet['!cols'] = [
    { width: 8 },
    { width: 10 },
    { width: 25 },
    { width: 15 },
    { width: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, borrowersSheet, 'Top Borrowers');

  // 5. Genre Distribution Sheet
  const genreData = getGenreDistribution(books, transactions);
  const genreDistData = [
    ['Genre', 'Times Borrowed', 'Percentage'],
    ...genreData.map(g => {
      const total = genreData.reduce((sum, item) => sum + item.count, 0);
      return [
        g.genre,
        g.count,
        `${((g.count / total) * 100).toFixed(2)}%`
      ];
    })
  ];
  const genreSheet = XLSX.utils.aoa_to_sheet(genreDistData);
  genreSheet['!cols'] = [{ width: 25 }, { width: 15 }, { width: 12 }];
  XLSX.utils.book_append_sheet(workbook, genreSheet, 'Genre Distribution');

  // 6. Overdue Books Sheet
  const overdueList = getOverdueTransactions(transactions, books, users);
  const overdueData = [
    ['Transaction ID', 'Book Title', 'Author', 'Borrower Name', 'User ID', 'Issue Date', 'Due Date', 'Days Overdue', 'Fine'],
    ...overdueList.map(t => {
      const dueDate = new Date(t.due_date.split('-').reverse().join('-'));
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return [
        t.transaction_id,
        t.book?.title || 'N/A',
        t.book?.author || 'N/A',
        t.user?.name || 'N/A',
        t.user_id,
        t.issue_date,
        t.due_date,
        daysOverdue > 0 ? daysOverdue : 0,
        `₹${t.fine}`
      ];
    })
  ];
  const overdueSheet = XLSX.utils.aoa_to_sheet(overdueData);
  overdueSheet['!cols'] = [
    { width: 15 },
    { width: 35 },
    { width: 25 },
    { width: 20 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 10 }
  ];
  XLSX.utils.book_append_sheet(workbook, overdueSheet, 'Overdue Books');

  // 7. Users Sheet
  const usersData = [
    ['User ID', 'Name', 'Email', 'Phone', 'Books Borrowed', 'Total Fines'],
    ...users.map(user => {
      const userTransactions = transactions.filter(t => t.user_id === user.user_id);
      const totalFines = userTransactions.reduce((sum, t) => sum + t.fine, 0);
      return [
        user.user_id,
        user.name,
        user.email,
        user.phone,
        userTransactions.length,
        `₹${totalFines}`
      ];
    })
  ];
  const usersSheet = XLSX.utils.aoa_to_sheet(usersData);
  usersSheet['!cols'] = [
    { width: 10 },
    { width: 20 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 12 }
  ];
  XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');

  // Generate and download the file
  const fileName = `Library_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
