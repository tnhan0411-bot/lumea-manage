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
  usersList: User[];
  isLoaded: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
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
  addTenant: (tenant: Tenant) => void;
  deleteTenant: (id: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addContract: (contract: Contract) => void;
  deleteContract: (id: string) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  deleteIssue: (id: string) => void;
  checkMonthlyBilling: () => { pendingRooms: Room[], generateAll: () => void };
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
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
 
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
    const savedUsersList = localStorage.getItem('lumea_users_list');
 
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedTenants) setTenants(JSON.parse(savedTenants));
    if (savedIssues) setIssues(JSON.parse(savedIssues));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedContracts) setContracts(JSON.parse(savedContracts));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedUtilities) setUtilities(JSON.parse(savedUtilities));
    if (savedUsersList) setUsersList(JSON.parse(savedUsersList));
    
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
    localStorage.setItem('lumea_users_list', JSON.stringify(usersList));
  }, [user, rooms, tenants, issues, invoices, contracts, expenses, utilities, usersList, isLoaded]);
 
  const login = (email: string, pass: string) => {
    const foundUser = usersList.find(u => u.email === email && u.password === pass);
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

  const addUser = (u: User) => setUsersList([...usersList, u]);
  const updateUser = (id: string, updates: Partial<User>) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, ...updates } : u));
    if (user?.id === id) {
      setUser({ ...user, ...updates });
    }
  };
  const deleteUser = (id: string) => setUsersList(usersList.filter(u => u.id !== id));

  const addIssue = (issue: Issue) => setIssues([issue, ...issues]);
  const updateIssue = (id: string, status: Issue['status']) => {
    setIssues(issues.map(i => i.id === id ? { ...i, status } : i));
  };
  const deleteIssue = (id: string) => {
    setIssues(issues.filter(i => i.id !== id));
  };
  const payInvoice = (id: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status: 'paid' as const } : i));
  };
  const addInvoice = (invoice: Invoice) => setInvoices([invoice, ...invoices]);
  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, ...updates } : i));
  };
  const deleteInvoice = (id: string) => {
    setInvoices(invoices.filter(i => i.id !== id));
  };

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

  const addTenant = (tenant: Tenant) => setTenants([...tenants, tenant]);
  const deleteTenant = (id: string) => setTenants(tenants.filter(t => t.id !== id));

  const addExpense = (expense: Expense) => setExpenses([expense, ...expenses]);
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
  };
  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  
  const addContract = (contract: Contract) => setContracts([contract, ...contracts]);
  const updateContract = (id: string, updates: Partial<Contract>) => {
    setContracts(contracts.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteContract = (id: string) => setContracts(contracts.filter(c => c.id !== id));

  const addUtility = (record: UtilityRecord) => setUtilities([record, ...utilities]);
  const updateUtility = (id: string, updates: Partial<UtilityRecord>) => {
    setUtilities(utilities.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const checkMonthlyBilling = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const pendingBillingRooms = rooms.filter(room => {
      if (room.status !== 'occupied') return false;
      return !invoices.some(inv => inv.roomId === room.id && inv.month === currentMonth);
    });

    const generateAll = () => {
      const newInvoices: Invoice[] = pendingBillingRooms.map(room => {
        const tenant = tenants.find(t => t.roomId === room.id);
        return {
          id: `inv-${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          roomId: room.id,
          tenantId: tenant?.id || 'unknown',
          month: currentMonth,
          rent: room.price,
          electricity: 0,
          water: 0,
          other: 0,
          total: room.price,
          status: 'pending',
          dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`
        };
      });
      setInvoices([...newInvoices, ...invoices]);
    };

    return { pendingRooms: pendingBillingRooms, generateAll };
  };

  const role = user?.role || null;

  useEffect(() => {
    // Initial check for monthly billing
    if (isLoaded && role === 'landlord') {
      const { pendingRooms } = checkMonthlyBilling();
      if (pendingRooms.length > 0) {
        // We could auto-show a notification or just rely on the dashboard
        console.log(`There are ${pendingRooms.length} rooms pending billing for this month.`);
      }
    }
  }, [isLoaded, role, rooms.length, invoices.length]);

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
      usersList,
      isLoaded,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addIssue,
      updateIssue,
      deleteIssue,
      payInvoice,
      addInvoice,
      updateRoom,
      addRoom,
      deleteRoom,
      checkoutRoom,
      updateTenant,
      addTenant,
      deleteTenant,
      addExpense,
      updateExpense,
      deleteExpense,
      addContract,
      updateContract,
      deleteContract,
      addUtility,
      updateUtility,
      updateInvoice,
      deleteInvoice,
      checkMonthlyBilling,
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
