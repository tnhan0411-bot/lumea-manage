import React, { createContext, useContext, useState } from 'react';
import { Room, Tenant, Issue, Invoice, INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_ISSUES, INITIAL_INVOICES } from './utils';

type Role = 'landlord' | 'tenant';

interface AppState {
  role: Role;
  currentTenantId: string | null; // t1's perspective when role is tenant
  rooms: Room[];
  tenants: Tenant[];
  issues: Issue[];
  invoices: Invoice[];
  setRole: (role: Role) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, status: Issue['status']) => void;
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>('landlord');
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  const addIssue = (issue: Issue) => setIssues([...issues, issue]);
  const updateIssue = (id: string, status: Issue['status']) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
  };
  const payInvoice = (id: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
  };
  const addInvoice = (invoice: Invoice) => setInvoices([...invoices, invoice]);

  return (
    <AppContext.Provider value={{
      role,
      currentTenantId: role === 'tenant' ? 't1' : null,
      rooms,
      tenants,
      issues,
      invoices,
      setRole,
      addIssue,
      updateIssue,
      payInvoice,
      addInvoice
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
