// ─── User ──────────────────────────────────────────────────────────────────
export type UserRole = "admin" | "warden" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserInput {
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ─── Student ───────────────────────────────────────────────────────────────
export interface Student {
  id: string;
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  email?: string;
  roomId: string;
  bedNo: number;
  joiningDate: string;
  photoUrl?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentInput {
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  email?: string;
  roomId: string;
  bedNo: number;
  joiningDate: string;
  photoUrl?: string;
}

export interface UpdateStudentInput extends Partial<CreateStudentInput> {
  status?: "active" | "inactive";
}

// ─── Room ──────────────────────────────────────────────────────────────────
export interface Bed {
  bedNo: number;
  isOccupied: boolean;
  studentId?: string;
  studentName?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: "2-bed" | "4-bed" | "6-bed";
  capacity: number;
  occupied: number;
  beds: Bed[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomInput {
  roomNumber: string;
  floor: number;
  type: "2-bed" | "4-bed" | "6-bed";
}

// ─── Fee ───────────────────────────────────────────────────────────────────
export type FeeStatus = "paid" | "unpaid" | "partial";
export type PaymentMode = "cash" | "bank_transfer" | "online";

export interface Fee {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomNumber: string;
  amount: number;
  month: string;
  status: FeeStatus;
  paymentMode?: PaymentMode;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPaymentInput {
  studentId: string;
  amount: number;
  month: string;
  paymentMode: PaymentMode;
  notes?: string;
}

// ─── Complaint ─────────────────────────────────────────────────────────────
export type ComplaintCategory = "electricity" | "water" | "cleanliness" | "other";
export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  roomId: string;
  roomNumber: string;
  category: ComplaintCategory;
  description: string;
  status: ComplaintStatus;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintInput {
  studentId: string;
  roomId: string;
  category: ComplaintCategory;
  description: string;
}

export interface UpdateComplaintInput {
  status: ComplaintStatus;
  resolutionNote?: string;
}

// ─── Visitor ───────────────────────────────────────────────────────────────
export type VisitorStatus = "inside" | "exited";

export interface Visitor {
  id: string;
  visitorName: string;
  visitorPhone?: string;
  cnic?: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  status: VisitorStatus;
  remarks?: string;
  studentId?: string;
  studentName?: string;
  loggedById: string;
  loggedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVisitorInput {
  visitorName: string;
  visitorPhone?: string;
  cnic?: string;
  purpose: string;
  studentId?: string;
  remarks?: string;
}

export interface ExitVisitorInput {
  exitTime?: string;
  remarks?: string;
}

// ─── Notice ────────────────────────────────────────────────────────────────
export type Priority = "low" | "normal" | "high" | "urgent";

export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: Priority;
  isActive: boolean;
  publishedAt: string;
  expiresAt?: string;
  postedById: string;
  postedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticeInput {
  title: string;
  content: string;
  priority?: Priority;
  expiresAt?: string;
}

export interface UpdateNoticeInput extends Partial<CreateNoticeInput> {
  isActive?: boolean;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalStudents: number;
  occupiedBeds: number;
  vacantBeds: number;
  totalCapacity: number;
  pendingFees: number;
  openComplaints: number;
  visitorsInside: number;
  activeNotices: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: string;
}

// ─── API Response ──────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
