import type {
  ApiResponse, PaginatedResponse,
  ApiStudent, ApiRoom, ApiFee, ApiComplaint, ApiVisitor, ApiNotice, User,
  DashboardStats, ActivityLog,
  CreateStudentInput, UpdateStudentInput,
  CreateRoomInput,
  RecordPaymentInput,
  CreateComplaintInput, UpdateComplaintInput,
  CreateVisitorInput, ExitVisitorInput,
  CreateNoticeInput, UpdateNoticeInput,
  CreateUserInput, UpdateUserInput,
} from '@/types';

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

function qs(params?: Record<string, string | undefined>) {
  if (!params) return '';
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) p.set(k, v); });
  const s = p.toString();
  return s ? '?' + s : '';
}

// Dashboard
export const getDashboard = () =>
  apiFetch<ApiResponse<{ stats: DashboardStats; activityFeed: ActivityLog[] }>>('/api/dashboard');

// Students
export const getStudents = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiStudent>>(`/api/students${qs(params)}`);

export const getStudent = (id: string) =>
  apiFetch<ApiResponse<ApiStudent>>(`/api/students/${id}`);

export const createStudent = (data: CreateStudentInput) =>
  apiFetch<ApiResponse<ApiStudent>>('/api/students', { method: 'POST', body: JSON.stringify(data) });

export const updateStudent = (id: string, data: UpdateStudentInput) =>
  apiFetch<ApiResponse<ApiStudent>>(`/api/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteStudent = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/students/${id}`, { method: 'DELETE' });

// Rooms
export const getRooms = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiRoom>>(`/api/rooms${qs(params)}`);

export const createRoom = (data: CreateRoomInput) =>
  apiFetch<ApiResponse<ApiRoom>>('/api/rooms', { method: 'POST', body: JSON.stringify(data) });

export const deleteRoom = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/rooms/${id}`, { method: 'DELETE' });

// Fees
export const getFees = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiFee>>(`/api/fees${qs(params)}`);

export const recordPayment = (data: RecordPaymentInput) =>
  apiFetch<ApiResponse<ApiFee>>('/api/fees', { method: 'POST', body: JSON.stringify(data) });

// Complaints
export const getComplaints = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiComplaint>>(`/api/complaints${qs(params)}`);

export const createComplaint = (data: CreateComplaintInput) =>
  apiFetch<ApiResponse<ApiComplaint>>('/api/complaints', { method: 'POST', body: JSON.stringify(data) });

export const updateComplaint = (id: string, data: UpdateComplaintInput) =>
  apiFetch<ApiResponse<ApiComplaint>>(`/api/complaints/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteComplaint = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/complaints/${id}`, { method: 'DELETE' });

// Visitors
export const getVisitors = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiVisitor>>(`/api/visitors${qs(params)}`);

export const createVisitor = (data: CreateVisitorInput) =>
  apiFetch<ApiResponse<ApiVisitor>>('/api/visitors', { method: 'POST', body: JSON.stringify(data) });

export const exitVisitor = (id: string, data?: ExitVisitorInput) =>
  apiFetch<ApiResponse<ApiVisitor>>(`/api/visitors/${id}`, { method: 'PATCH', body: JSON.stringify(data ?? {}) });

// Notices
export const getNotices = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<ApiNotice>>(`/api/notices${qs(params)}`);

export const createNotice = (data: CreateNoticeInput) =>
  apiFetch<ApiResponse<ApiNotice>>('/api/notices', { method: 'POST', body: JSON.stringify(data) });

export const updateNotice = (id: string, data: UpdateNoticeInput) =>
  apiFetch<ApiResponse<ApiNotice>>(`/api/notices/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteNotice = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/notices/${id}`, { method: 'DELETE' });

// Users
export const getUsers = (params?: Record<string, string | undefined>) =>
  apiFetch<PaginatedResponse<User>>(`/api/users${qs(params)}`);

export const createUser = (data: CreateUserInput) =>
  apiFetch<ApiResponse<User>>('/api/users', { method: 'POST', body: JSON.stringify(data) });

export const updateUser = (id: string, data: UpdateUserInput & { password?: string }) =>
  apiFetch<ApiResponse<User>>(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteUser = (id: string) =>
  apiFetch<ApiResponse<null>>(`/api/users/${id}`, { method: 'DELETE' });
