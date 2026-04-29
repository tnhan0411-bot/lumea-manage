import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

// Mock Data Models
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type IssueStatus = 'open' | 'in-progress' | 'resolved';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';
export type UserRole = 'landlord' | 'tenant' | 'technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  password?: string; // For mock login
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'contract' | 'identity' | 'payment' | 'other';
  uploadedAt: string;
}

export interface Contract {
  id: string;
  roomId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  deposit: number;
  monthlyRent: number;
  status: 'active' | 'expired' | 'terminated';
  attachments: Attachment[];
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'electricity' | 'water' | 'maintenance' | 'staff' | 'cleaning' | 'tools' | 'operation' | 'other';
  date: string;
  description?: string;
}

export interface Room {
  id: string;
  number: string;
  status: RoomStatus;
  price: number;
  features: string[];
  cleaningSchedule: string[]; // Historical or upcoming cleaning dates
  attachments: Attachment[];
  leaseStart?: string;
  leaseEnd?: string;
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  contractStart: string;
  contractEnd: string;
  visaExpiry?: string;
  avatar?: string;
}

export interface Issue {
  id: string;
  roomId: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
  type: 'repair' | 'cleaning' | 'other';
}

export interface Invoice {
  id: string;
  roomId: string;
  tenantId: string;
  month: string; // YYYY-MM
  rent: number;
  electricity: number;
  water: number;
  other: number;
  total: number;
  status: InvoiceStatus;
  dueDate: string;
}

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', number: '101', status: 'available', price: 5000000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r2', number: '201', status: 'available', price: 5500000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r3', number: '202', status: 'available', price: 5500000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r4', number: '301', status: 'available', price: 6000000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r5', number: '302', status: 'available', price: 6000000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r6', number: '401', status: 'available', price: 6500000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r7', number: '402', status: 'available', price: 6500000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r8', number: '501', status: 'available', price: 7000000, features: [], cleaningSchedule: [], attachments: [] },
  { id: 'r9', number: '502', status: 'available', price: 7000000, features: [], cleaningSchedule: [], attachments: [] },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Landlord Admin 1', email: 'admin1@lumea.vn', role: 'landlord', phone: '0911001100', password: 'password123' },
  { id: 'u2', name: 'Landlord Admin 2', email: 'admin2@lumea.vn', role: 'landlord', phone: '0911001122', password: 'password123' },
  { id: 'u3', name: 'Kỹ thuật viên Tùng', email: 'tech@lumea.vn', role: 'technician', phone: '0922002200', password: 'password123' },
  { id: 'u4', name: 'Nguyễn Văn A', email: 'tenant1@example.com', role: 'tenant', phone: '0933003300', password: 'password123' },
];

export const INITIAL_UTILITIES: any[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_ISSUES: Issue[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
