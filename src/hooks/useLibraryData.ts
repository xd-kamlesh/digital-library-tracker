import { useState, useEffect } from 'react';
import { Book, User, Transaction, parseCSV } from '@/lib/csvParser';
import booksCSV from '@/assets/books.csv?raw';
import usersCSV from '@/assets/users.csv?raw';
import transactionsCSV from '@/assets/transactions.csv?raw';

export function useLibraryData() {
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const parsedBooks = parseCSV<Book>(booksCSV);
      const parsedUsers = parseCSV<User>(usersCSV);
      const parsedTransactions = parseCSV<Transaction>(transactionsCSV);

      setBooks(parsedBooks);
      setUsers(parsedUsers);
      setTransactions(parsedTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Error parsing CSV data:', error);
      setLoading(false);
    }
  }, []);

  return { books, users, transactions, loading };
}
