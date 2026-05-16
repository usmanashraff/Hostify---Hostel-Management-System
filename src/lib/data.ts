import type { Student, Room, Complaint, Activity } from './types';

export const STUDENTS_SEED: Student[] = [
  { id: 'STU-001', name: 'Ahmed Raza',   father: 'Muhammad Raza',  cnic: '35202-1234567-1', phone: '+92 300 1234567', email: 'ahmed.raza@uni.edu.pk',   room: '101', bed: 'A', join: '2025-08-14', status: 'paid',    avatarHue: 210 },
  { id: 'STU-002', name: 'Bilal Hussain',father: 'Sajjad Hussain', cnic: '35202-2233445-3', phone: '+92 311 2233445', email: 'bilal.h@uni.edu.pk',       room: '101', bed: 'B', join: '2025-08-14', status: 'unpaid',  avatarHue: 22 },
  { id: 'STU-003', name: 'Hamza Iqbal',  father: 'Naveed Iqbal',   cnic: '35202-9988776-5', phone: '+92 321 9988776', email: 'hamza.iqbal@uni.edu.pk',   room: '102', bed: 'A', join: '2025-09-01', status: 'paid',    avatarHue: 145 },
  { id: 'STU-004', name: 'Usman Tariq',  father: 'Tariq Mehmood',  cnic: '35202-5566778-9', phone: '+92 333 5566778', email: 'usman.tariq@uni.edu.pk',   room: '102', bed: 'B', join: '2025-09-01', status: 'partial', avatarHue: 280 },
  { id: 'STU-005', name: 'Zain Abbas',   father: 'Ghulam Abbas',   cnic: '42101-1122334-7', phone: '+92 345 1122334', email: 'zain.abbas@uni.edu.pk',    room: '103', bed: 'A', join: '2025-07-22', status: 'paid',    avatarHue: 340 },
  { id: 'STU-006', name: 'Fawad Khan',   father: 'Asif Khan',      cnic: '42201-4455667-1', phone: '+92 301 4455667', email: 'fawad.khan@uni.edu.pk',    room: '103', bed: 'B', join: '2025-07-22', status: 'unpaid',  avatarHue: 188 },
  { id: 'STU-007', name: 'Saad Mehmood', father: 'Khalid Mehmood', cnic: '35202-7788990-2', phone: '+92 312 7788990', email: 'saad.m@uni.edu.pk',        room: '103', bed: 'C', join: '2025-09-15', status: 'paid',    avatarHue: 50 },
  { id: 'STU-008', name: 'Talha Saleem', father: 'Saleem Akhtar',  cnic: '35202-3344556-4', phone: '+92 322 3344556', email: 'talha.saleem@uni.edu.pk',  room: '103', bed: 'D', join: '2025-10-02', status: 'partial', avatarHue: 95 },
  { id: 'STU-009', name: 'Hassan Javed', father: 'Javed Akram',    cnic: '42101-6677889-6', phone: '+92 344 6677889', email: 'hassan.javed@uni.edu.pk',  room: '104', bed: 'A', join: '2025-08-30', status: 'paid',    avatarHue: 0 },
  { id: 'STU-010', name: 'Mubashir Ali', father: 'Liaqat Ali',     cnic: '35202-9090909-3', phone: '+92 308 9090909', email: 'mubashir.ali@uni.edu.pk',  room: '105', bed: 'A', join: '2025-08-10', status: 'unpaid',  avatarHue: 240 },
];

export const ROOMS_SEED: Room[] = [
  { number: '101', floor: 'Ground', capacity: 2, type: '2-bed' },
  { number: '102', floor: 'Ground', capacity: 2, type: '2-bed' },
  { number: '103', floor: 'First',  capacity: 4, type: '4-bed' },
  { number: '104', floor: 'First',  capacity: 4, type: '4-bed' },
  { number: '105', floor: 'Second', capacity: 6, type: '6-bed' },
];

export const COMPLAINTS_SEED: Complaint[] = [
  { id: 'CMP-101', studentId: 'STU-002', category: 'electricity', desc: 'Ceiling fan not working since two days, getting very hot at night.',                date: '2026-05-10', status: 'open',        note: '' },
  { id: 'CMP-102', studentId: 'STU-005', category: 'water',       desc: 'No hot water in shared washroom since morning.',                                    date: '2026-05-12', status: 'in_progress', note: 'Plumber visit scheduled for tomorrow.' },
  { id: 'CMP-103', studentId: 'STU-008', category: 'cleanliness', desc: 'Common corridor not swept for three days. Trash bin overflowing.',                  date: '2026-05-13', status: 'resolved',    note: 'Cleaning staff reassigned, schedule fixed.' },
  { id: 'CMP-104', studentId: 'STU-001', category: 'other',       desc: 'WiFi extremely slow in Room 101 — barely loading lecture videos.',                  date: '2026-05-14', status: 'open',        note: '' },
  { id: 'CMP-105', studentId: 'STU-010', category: 'electricity', desc: 'Power socket near study desk sparking when phone charger plugged in.',              date: '2026-05-15', status: 'in_progress', note: 'Electrician notified — to be checked today evening.' },
];

export const ACTIVITY_SEED: Activity[] = [
  { who: 'Admin',       what: 'recorded payment of Rs. 12,000 for', target: 'Ahmed Raza',           when: '15 min ago' },
  { who: 'Warden Asif', what: 'updated complaint',                  target: 'CMP-102 → In Progress', when: '1 hr ago' },
  { who: 'Admin',       what: 'added new student',                  target: 'Mubashir Ali',          when: '3 hr ago' },
  { who: 'Warden Asif', what: 'marked bed vacant',                  target: 'Room 104 — Bed B',       when: 'Yesterday' },
  { who: 'Admin',       what: 'closed complaint',                   target: 'CMP-103 (Cleanliness)', when: 'Yesterday' },
];

export const FEE_AMOUNT = 12000;

export const STATUS_BADGE = {
  paid:    { tone: 'green',  label: 'Paid' },
  unpaid:  { tone: 'red',    label: 'Unpaid' },
  partial: { tone: 'orange', label: 'Partial' },
} as const;

export function formatPKR(n: number | string): string {
  return 'Rs. ' + Number(n).toLocaleString('en-PK');
}

export function formatDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
