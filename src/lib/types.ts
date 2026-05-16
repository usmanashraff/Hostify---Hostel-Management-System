export interface Student {
  id: string;
  name: string;
  father: string;
  cnic: string;
  phone: string;
  email: string;
  room: string;
  bed: string;
  join: string;
  status: 'paid' | 'unpaid' | 'partial';
  avatarHue: number;
  lastPayment?: Payment;
}

export interface Room {
  number: string;
  floor: string;
  capacity: number;
  type: string;
}

export interface Complaint {
  id: string;
  studentId: string;
  category: 'electricity' | 'water' | 'cleanliness' | 'other';
  desc: string;
  date: string;
  status: 'open' | 'in_progress' | 'resolved';
  note: string;
}

export interface Activity {
  who: string;
  what: string;
  target: string;
  when: string;
}

export interface Payment {
  studentId: string;
  amount: number;
  month: string;
  mode: 'cash' | 'bank' | 'online';
  notes: string;
  date: string;
}

export interface AppData {
  students: Student[];
  rooms: Room[];
  complaints: Complaint[];
}
