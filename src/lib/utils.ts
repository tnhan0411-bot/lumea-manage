import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
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
  category: 'electricity' | 'water' | 'maintenance' | 'staff' | 'cleaning' | 'tools' | 'operation' | 'other' | 'interest';
  date: string;
  description?: string;
}

export interface Room {
  id: string;
  number: string;
  status: RoomStatus;
  cleanStatus?: 'clean' | 'dirty' | 'cleaning';
  isExtended?: boolean;
  price: number;
  features: string[];
  cleaningSchedule: { date: string; note?: string }[]; 
  attachments: Attachment[];
  leaseStart?: string;
  leaseEnd?: string;
  recurringCleaning?: { daysOfWeek: number[], time: string }; // 0 = Sunday, 1 = Monday...
  initialElectricityMeter?: number;
  note?: string;
}

export interface CleaningSchedule {
  id: string;
  roomId: string;
  scheduledDate: string;
  scheduledTime: string;
  assignedTo?: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
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
  passportNumber?: string;
  visaHandled?: boolean;
  secondaryName?: string;
  secondaryVisaExpiry?: string;
  secondaryPassportNumber?: string;
  secondaryVisaHandled?: boolean;
  avatar?: string;
  residenceRegistered?: boolean;
  secondaryResidenceRegistered?: boolean;
}

export interface RentCalculationResult {
  checkInDate: string;
  checkOutDate: string;
  billingEndDate: string;
  months: number;
  oddDays: number;
  monthlyRate: number;
  dailyRate: number;
  totalRent: number;
}

export function calculateRentDetails(
  pricePerMonth: number,
  checkIn: string,
  checkOut: string
): RentCalculationResult {
  const checkInDate = new Date(checkIn);
  let checkOutDate = new Date(checkOut);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return {
      checkInDate: checkIn,
      checkOutDate: checkOut,
      billingEndDate: '',
      months: 0,
      oddDays: 0,
      monthlyRate: pricePerMonth,
      dailyRate: 0,
      totalRent: 0
    };
  }

  checkInDate.setHours(0, 0, 0, 0);
  checkOutDate.setHours(0, 0, 0, 0);

  const billingEndDateObj = new Date(checkOutDate.getTime() - 24 * 60 * 60 * 1000);
  const billingEndDate = billingEndDateObj.toISOString().split('T')[0];

  let months = 0;
  let currentCycleStart = new Date(checkInDate);
  while (true) {
    let nextStart = new Date(currentCycleStart);
    nextStart.setMonth(nextStart.getMonth() + 1);
    let cycleEnd = new Date(nextStart.getTime() - 24 * 60 * 60 * 1000);
    
    if (cycleEnd <= billingEndDateObj) {
      months++;
      currentCycleStart = nextStart;
    } else {
      break;
    }
  }

  let oddDays = 0;
  if (currentCycleStart <= billingEndDateObj) {
    const diffTime = billingEndDateObj.getTime() - currentCycleStart.getTime();
    oddDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  const dailyRate = Math.round(pricePerMonth / 30);
  const totalRent = (months * pricePerMonth) + (oddDays * dailyRate);

  return {
    checkInDate: checkIn,
    checkOutDate: checkOut,
    billingEndDate,
    months,
    oddDays,
    monthlyRate: pricePerMonth,
    dailyRate,
    totalRent
  };
}

export function calculateRentForMonth(price: number, leaseStart: string | undefined | null, leaseEnd: string | undefined | null, currentMonth: string): number {
  if (!leaseStart) return price;
  
  const getCycleDate = (year: number, month0: number, day: number) => {
    let d = new Date(year, month0, day);
    const expectedMonth = (month0 % 12 + 12) % 12;
    if (d.getMonth() !== expectedMonth) {
      d = new Date(year, month0 + 1, 0);
    }
    return d;
  };

  const lStart = new Date(leaseStart);
  if (isNaN(lStart.getTime())) return price;
  
  const cycleDay = lStart.getDate();
  const [curYear, curMonthNum] = currentMonth.split('-').map(Number);
  
  const cycleStart = getCycleDate(curYear, curMonthNum - 1, cycleDay);
  const nextCycleStart = getCycleDate(curYear, curMonthNum, cycleDay);
  
  cycleStart.setHours(0,0,0,0);
  nextCycleStart.setHours(0,0,0,0);
  
  const cycleEnd = new Date(nextCycleStart.getTime() - 24 * 60 * 60 * 1000);
  
  if (leaseEnd) {
    const lEnd = new Date(leaseEnd);
    lEnd.setHours(0,0,0,0);
    
    if (!isNaN(lEnd.getTime())) {
      const billingEndDateObj = new Date(lEnd.getTime() - 24 * 60 * 60 * 1000);
      
      if (billingEndDateObj < cycleStart) return 0;
      
      if (billingEndDateObj <= cycleEnd) {
        if (billingEndDateObj.getTime() === cycleEnd.getTime()) {
          return price;
        }
        const diffTime = billingEndDateObj.getTime() - cycleStart.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return Math.round((price / 30) * diffDays);
      }
    }
  }
  
  return price;
}

export interface Issue {
  id: string;
  roomId: string;
  title: string;
  description: string;
  status: IssueStatus;
  createdAt: string;
  dueDate?: string;
  type: 'repair' | 'cleaning' | 'other';
}

export interface Invoice {
  id: string;
  roomId: string;
  tenantId: string;
  month: string; // YYYY-MM
  rent: number;
  water: number;
  other: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: 'cash' | 'transfer';
  paymentDate?: string;
  dueDate: string;
  issueDate?: string; // Add issueDate to determine exact time
}

export interface ElectricityRecord {
  id: string;
  roomId: string;
  month: string; // YYYY-MM
  initialMeter: number;
  finalMeter?: number;
  usage: number;
  cost: number;
  status: 'pending' | 'paid';
  paymentDate?: string;
  paymentMethod?: 'cash' | 'transfer';
}

export const INITIAL_ROOMS: Room[] = [
  { id: 'r1', number: '101', status: 'available', cleanStatus: 'clean', price: 5000000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [1, 4], time: '09:00' } },
  { id: 'r2', number: '201', status: 'available', cleanStatus: 'clean', price: 5500000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [2, 5], time: '09:30' } },
  { id: 'r3', number: '202', status: 'available', cleanStatus: 'clean', price: 5500000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [2, 5], time: '10:00' } },
  { id: 'r4', number: '301', status: 'available', cleanStatus: 'clean', price: 6000000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [3, 6], time: '09:00' } },
  { id: 'r5', number: '302', status: 'available', cleanStatus: 'clean', price: 6000000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [3, 6], time: '09:30' } },
  { id: 'r6', number: '401', status: 'available', cleanStatus: 'clean', price: 6500000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [0, 4], time: '10:00' } },
  { id: 'r7', number: '402', status: 'available', cleanStatus: 'clean', price: 6500000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [0, 4], time: '10:30' } },
  { id: 'r8', number: '501', status: 'available', cleanStatus: 'clean', price: 7000000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [1, 5], time: '11:00' } },
  { id: 'r9', number: '502', status: 'available', cleanStatus: 'clean', price: 7000000, features: [], cleaningSchedule: [], attachments: [], recurringCleaning: { daysOfWeek: [2, 6], time: '11:30' } },
];

import { calculateNextCleaningDate } from './scheduleHelper';

export const INITIAL_CLEANING_SCHEDULES: CleaningSchedule[] = INITIAL_ROOMS.map(room => {
  if (room.recurringCleaning) {
    const nextDate = calculateNextCleaningDate(room.recurringCleaning.daysOfWeek, room.recurringCleaning.time);
    if (nextDate) {
      return {
        id: `cs-init-${room.id}`,
        roomId: room.id,
        scheduledDate: nextDate.date,
        scheduledTime: nextDate.time,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
    }
  }
  return null;
}).filter(Boolean) as CleaningSchedule[];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Quản lý', email: 'admin1@lumea.vn', role: 'landlord', phone: '0911001100', password: '123456' },
  { id: 'u2', name: 'Quản lý 2', email: 'admin2@lumea.vn', role: 'landlord', phone: '0911001122', password: '123456' },
  { id: 'u3', name: 'Kỹ thuật', email: 'tech@lumea.vn', role: 'technician', phone: '0922002200', password: '123456' },
  { id: 'u4', name: 'Người thuê', email: 'tenant1@example.com', role: 'tenant', phone: '0933003300', password: '123456' },
];

export const INITIAL_UTILITIES: any[] = [];
export const INITIAL_TENANTS: Tenant[] = [];
export const INITIAL_CONTRACTS: Contract[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_ISSUES: Issue[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ELECTRICITY: ElectricityRecord[] = [];
export interface TodoTask {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
  dueDate?: string;
}

export const INITIAL_TASKS: TodoTask[] = [];

