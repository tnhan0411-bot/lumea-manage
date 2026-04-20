import React, { createContext, useContext, useState } from 'react';
import { 
  Room, Tenant, Issue, Invoice, Contract, Expense, 
  INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_ISSUES, INITIAL_INVOICES, INITIAL_CONTRACTS, INITIAL_EXPENSES 
} from './utils';

type Role = 'landlord' | 'tenant';

interface AppState {
  role: Role;
  currentTenantId: string | null;
  rooms: Room[];
  tenants: Tenant[];
  issues: Issue[];
  invoices: Invoice[];
  contracts: Contract[];
  expenses: Expense[];
  setRole: (role: Role) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, status: Issue['status']) => void;
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  addExpense: (expense: Expense) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('landlord');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);

  const addIssue = (issue: Issue) => setIssues([...issues, issue]);
  const updateIssue = (id: string, status: Issue['status']) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
  };
  const payInvoice = (id: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
  };
  const addInvoice = (invoice: Invoice) => setInvoices([...invoices, invoice]);

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
  
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  return (
    <AppContext.Provider value={{
      role,
      currentTenantId: role === 'tenant' ? 't1' : null,
      rooms,
      tenants,
      issues,
      invoices,
      contracts,
      expenses,
      setRole,
      addIssue,
      updateIssue,
      payInvoice,
      addInvoice,
      updateRoom,
      updateTenant,
      addExpense,
      updateContract
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
}
