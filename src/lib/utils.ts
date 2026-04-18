import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Data Models
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type IssueStatus = 'open' | 'in-progress' | 'resolved';
export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface Room {
  id: string;
  number: string;
  status: RoomStatus;
  tenantId?: string;
  price: number;
  features: string[];
}

export interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  roomId: string;
  contractStart: string;
  contractEnd: string;
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

export const INITIAL_ROOMS: Room[] = Array.from({ length: 10 }, (_, i) => ({
  id: `r${i + 1}`,
  number: `10${i + 1}`,
  status: i < 7 ? 'occupied' : i === 7 ? 'maintenance' : 'available', // 7 occupied, 1 maintenance, 2 available
  price: 5000000 + (i % 3) * 500000,
  features: ['Điều hòa', 'Nóng lạnh', 'Giường tủ'],
}));

export const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@example.com', roomId: 'r1', contractStart: '2023-01-01', contractEnd: '2024-01-01' },
  { id: 't2', name: 'Trần Thị B', phone: '0901234568', email: 'ttb@example.com', roomId: 'r2', contractStart: '2023-02-01', contractEnd: '2024-02-01' },
  { id: 't3', name: 'Lê Văn C', phone: '0901234569', email: 'lvc@example.com', roomId: 'r3', contractStart: '2023-03-01', contractEnd: '2024-03-01' },
  { id: 't4', name: 'Phạm Thị D', phone: '0901234570', email: 'ptd@example.com', roomId: 'r4', contractStart: '2023-04-01', contractEnd: '2024-04-01' },
  { id: 't5', name: 'Hoàng Văn E', phone: '0901234571', email: 'hve@example.com', roomId: 'r5', contractStart: '2023-05-01', contractEnd: '2024-05-01' },
  { id: 't6', name: 'Đỗ Thị F', phone: '0901234572', email: 'dtf@example.com', roomId: 'r6', contractStart: '2023-06-01', contractEnd: '2024-06-01' },
  { id: 't7', name: 'Vũ Văn G', phone: '0901234573', email: 'vvg@example.com', roomId: 'r7', contractStart: '2023-07-01', contractEnd: '2024-07-01' },
];

export const INITIAL_ISSUES: Issue[] = [
  { id: 'i1', roomId: 'r1', title: 'Hỏng vòi nước', description: 'Vòi nước bồn rửa mặt bị rỉ', status: 'open', createdAt: '2023-10-20', type: 'repair' },
  { id: 'i2', roomId: 'r3', title: 'Đăng ký dọn phòng', description: 'Cần dọn phòng vào cuối tuần', status: 'in-progress', createdAt: '2023-10-22', type: 'cleaning' },
  { id: 'i3', roomId: 'r8', title: 'Sửa điều hòa', description: 'Điều hòa không mát', status: 'open', createdAt: '2023-10-24', type: 'repair' },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', roomId: 'r1', tenantId: 't1', month: '2023-10', rent: 5000000, electricity: 300000, water: 100000, other: 50000, total: 5450000, status: 'pending', dueDate: '2023-11-05' },
  { id: 'inv2', roomId: 'r2', tenantId: 't2', month: '2023-10', rent: 5500000, electricity: 250000, water: 100000, other: 0, total: 5850000, status: 'paid', dueDate: '2023-11-05' },
  { id: 'inv3', roomId: 'r3', tenantId: 't3', month: '2023-10', rent: 6000000, electricity: 400000, water: 150000, other: 100000, total: 6650000, status: 'overdue', dueDate: '2023-10-05' },
];
