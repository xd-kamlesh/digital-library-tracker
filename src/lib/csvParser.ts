export interface Book {
  book_id: string;
  title: string;
  author: string;
  genre: string;
  available_copies: number;
  total_copies: number;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Transaction {
  transaction_id: string;
  book_id: string;
  user_id: string;
  issue_date: string;
  return_date: string | null;
  due_date: string;
  fine: number;
}

export function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      
      // Convert numeric fields
      if (['available_copies', 'total_copies', 'fine'].includes(header)) {
        obj[header] = value ? Number(value) : 0;
      } else if (value === '' || value === undefined) {
        obj[header] = null;
      } else {
        obj[header] = value;
      }
    });
    
    return obj as T;
  });
}

export function parseDateDDMMYYYY(dateStr: string): Date {
  if (!dateStr) return new Date();
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function isOverdue(dueDate: string, returnDate: string | null): boolean {
  if (returnDate) return false;
  const due = parseDateDDMMYYYY(dueDate);
  return due < new Date();
}
