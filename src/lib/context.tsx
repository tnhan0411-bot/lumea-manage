import React, { createContext, useContext, useState } from 'react';
import { 
  Room, Tenant, Issue, Invoice, Contract, Expense, User, UtilityRecord,
  INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_ISSUES, INITIAL_INVOICES, INITIAL_CONTRACTS, INITIAL_EXPENSES, INITIAL_USERS, INITIAL_UTILITIES 
} from './utils';

interface AppState {
  user: User | null;
  role: User['role'] | null;
  currentTenantId: string | null;
  rooms: Room[];
  tenants: Tenant[];
  issues: Issue[];
  invoices: Invoice[];
  contracts: Contract[];
  expenses: Expense[];
  utilities: UtilityRecord[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, status: Issue['status']) => void;
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  addExpense: (expense: Expense) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  addUtility: (record: UtilityRecord) => void;
  updateUtility: (id: string, updates: Partial<UtilityRecord>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [utilities, setUtilities] = useState<UtilityRecord[]>(INITIAL_UTILITIES);

  const login = (email: string, pass: string) => {
    const foundUser = INITIAL_USERS.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

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

  const addRoom = (room: Room) => setRooms([...rooms, room]);
  const deleteRoom = (id: string) => setRooms(rooms.filter(r => r.id !== id));

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addExpense = (expense: Expense) => setExpenses([...expenses, expense]);
  
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addUtility = (record: UtilityRecord) => setUtilities([...utilities, record]);
  const updateUtility = (id: string, updates: Partial<UtilityRecord>) => {
    setUtilities(utilities.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  return (
    <AppContext.Provider value={{
      user,
      role: user?.role || null,
      currentTenantId: user?.role === 'tenant' ? 't1' : null,
      rooms,
      tenants,
      issues,
      invoices,
      contracts,
      expenses,
      utilities,
      login,
      logout,
      addIssue,
      updateIssue,
      payInvoice,
      addInvoice,
      updateRoom,
      addRoom,
      deleteRoom,
      updateTenant,
      addExpense,
      updateContract,
      addUtility,
      updateUtility,
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
