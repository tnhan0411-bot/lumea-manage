import React, { createContext, useContext, useState, useEffect } from 'react';
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
  isLoaded: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, status: Issue['status']) => void;
  payInvoice: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  checkoutRoom: (id: string) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  addExpense: (expense: Expense) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
  addUtility: (record: UtilityRecord) => void;
  updateUtility: (id: string, updates: Partial<UtilityRecord>) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [utilities, setUtilities] = useState<UtilityRecord[]>(INITIAL_UTILITIES);

  // Persistence: Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('lumea_user');
    const savedRooms = localStorage.getItem('lumea_rooms');
    const savedTenants = localStorage.getItem('lumea_tenants');
    const savedIssues = localStorage.getItem('lumea_issues');
    const savedInvoices = localStorage.getItem('lumea_invoices');
    const savedContracts = localStorage.getItem('lumea_contracts');
    const savedExpenses = localStorage.getItem('lumea_expenses');
    const savedUtilities = localStorage.getItem('lumea_utilities');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedTenants) setTenants(JSON.parse(savedTenants));
    if (savedIssues) setIssues(JSON.parse(savedIssues));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedContracts) setContracts(JSON.parse(savedContracts));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedUtilities) setUtilities(JSON.parse(savedUtilities));
    
    setIsLoaded(true);
  }, []);

  // Persistence: Save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('lumea_user', JSON.stringify(user));
    localStorage.setItem('lumea_rooms', JSON.stringify(rooms));
    localStorage.setItem('lumea_tenants', JSON.stringify(tenants));
    localStorage.setItem('lumea_issues', JSON.stringify(issues));
    localStorage.setItem('lumea_invoices', JSON.stringify(invoices));
    localStorage.setItem('lumea_contracts', JSON.stringify(contracts));
    localStorage.setItem('lumea_expenses', JSON.stringify(expenses));
    localStorage.setItem('lumea_utilities', JSON.stringify(utilities));
  }, [user, rooms, tenants, issues, invoices, contracts, expenses, utilities, isLoaded]);

  const login = (email: string, pass: string) => {
    const foundUser = INITIAL_USERS.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumea_user');
  };

  const addIssue = (issue: Issue) => setIssues([issue, ...issues]);
  const updateIssue = (id: string, status: Issue['status']) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
  };
  const payInvoice = (id: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
  };
  const addInvoice = (invoice: Invoice) => setInvoices([invoice, ...invoices]);

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const addRoom = (room: Room) => setRooms([...rooms, room]);
  const deleteRoom = (id: string) => setRooms(rooms.filter(r => r.id !== id));

  const checkoutRoom = (id: string) => {
    setRooms(rooms.map(r => r.id === id ? { 
      ...r, 
      status: 'available', 
      leaseStart: undefined, 
      leaseEnd: undefined 
    } : r));
    // Also remove tenant from this room
    setTenants(tenants.map(t => t.roomId === id ? { ...t, roomId: undefined } : t));
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    setTenants(tenants.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addExpense = (expense: Expense) => setExpenses([expense, ...expenses]);
  
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addUtility = (record: UtilityRecord) => setUtilities([record, ...utilities]);
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
      isLoaded,
      login,
      logout,
      addIssue,
      updateIssue,
      payInvoice,
      addInvoice,
      updateRoom,
      addRoom,
      deleteRoom,
      checkoutRoom,
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
