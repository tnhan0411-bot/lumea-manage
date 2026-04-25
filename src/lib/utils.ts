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

export interface UtilityRecord {
  id: string;
  roomId: string;
  month: string; // YYYY-MM
  electricity: {
    index: number; // Meter reading
    pricePerUnit: number;
    amount: number;
  };
  water: {
    index: number;
    pricePerUnit: number;
    amount: number;
  };
  trash: number;
  total: number;
  recordedAt: string;
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

export const INITIAL_ROOMS: Room[] = Array.from({ length: 10 }, (_, i) => ({
  id: `r${i + 1}`,
  number: `10${i + 1}`,
  status: i < 7 ? 'occupied' : i === 7 ? 'maintenance' : 'available',
  price: 5000000 + (i % 3) * 500000,
  features: ['Điều hòa', 'Nóng lạnh', 'Giường tủ'],
  cleaningSchedule: ['2026-04-15', '2026-04-01'],
  attachments: [
    { id: `ra${i}`, name: 'Mặt bằng phòng.pdf', url: '#', type: 'other', uploadedAt: '2026-01-10' }
  ],
  leaseStart: i < 7 ? '2026-01-01' : undefined,
  leaseEnd: i < 7 ? '2027-01-01' : undefined,
}));

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Landlord Admin 1', email: 'admin1@lumea.vn', role: 'landlord', phone: '0911001100', password: 'password123' },
  { id: 'u2', name: 'Landlord Admin 2', email: 'admin2@lumea.vn', role: 'landlord', phone: '0911001122', password: 'password123' },
  { id: 'u3', name: 'Kỹ thuật viên Tùng', email: 'tech@lumea.vn', role: 'technician', phone: '0922002200', password: 'password123' },
  { id: 'u4', name: 'Nguyễn Văn A', email: 'tenant1@example.com', role: 'tenant', phone: '0933003300', password: 'password123' },
];

export const INITIAL_UTILITIES: UtilityRecord[] = [
  {
    id: 'ut1',
    roomId: 'r1',
    month: '2026-04',
    electricity: { index: 1250, pricePerUnit: 3500, amount: 350000 },
    water: { index: 85, pricePerUnit: 15000, amount: 150000 },
    trash: 50000,
    total: 550000,
    recordedAt: '2026-04-05'
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  { id: 't1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'nva@example.com', roomId: 'r1', contractStart: '2026-01-01', contractEnd: '2027-01-01', avatar: 'https://picsum.photos/seed/user1/100/100' },
  { id: 't2', name: 'Trần Thị B', phone: '0901234568', email: 'ttb@example.com', roomId: 'r2', contractStart: '2026-02-01', contractEnd: '2027-02-01' },
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'c1',
    roomId: 'r1',
    tenantId: 't1',
    startDate: '2026-01-01',
    endDate: '2027-01-01',
    deposit: 10000000,
    monthlyRent: 5000000,
    status: 'active',
    attachments: [
      { id: 'ca1', name: 'Hop_Dong_Thue_P101.pdf', url: '#', type: 'contract', uploadedAt: '2026-01-01' }
    ]
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'e1', title: 'Tiền điện tổng', amount: 2500000, category: 'electricity', date: '2026-04-05' },
  { id: 'e2', title: 'Sửa bồn cầu P106', amount: 500000, category: 'maintenance', date: '2026-04-12' },
  { id: 'e3', title: 'Lương bảo vệ', amount: 7000000, category: 'staff', date: '2026-04-01' },
];

export const INITIAL_ISSUES: Issue[] = [
  { id: 'i1', roomId: 'r1', title: 'Hỏng vòi nước', description: 'Vòi nước bồn rửa mặt bị rỉ', status: 'open', createdAt: '2026-04-20', type: 'repair' },
  { id: 'i2', roomId: 'r3', title: 'Đăng ký dọn phòng', description: 'Cần dọn phòng vào cuối tuần', status: 'resolved', createdAt: '2026-04-15', type: 'cleaning' },
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', roomId: 'r1', tenantId: 't1', month: '2026-04', rent: 5000000, electricity: 300000, water: 100000, other: 50000, total: 5450000, status: 'pending', dueDate: '2026-05-05' },
  { id: 'inv2', roomId: 'r2', tenantId: 't2', month: '2026-04', rent: 5500000, electricity: 250000, water: 100000, other: 0, total: 5850000, status: 'paid', dueDate: '2026-05-05' },
];
