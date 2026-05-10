import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Room, Tenant, Issue, Invoice, Contract, Expense, User, 
  INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_ISSUES, INITIAL_INVOICES, INITIAL_CONTRACTS, INITIAL_EXPENSES, INITIAL_USERS 
} from './utils';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
}, firebaseConfig.firestoreDatabaseId);


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
  usersList: User[];
  isLoaded: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, status: Issue['status']) => void;
  editIssue: (id: string, updates: Partial<Issue>) => void;
  payInvoice: (id: string, paymentMethod?: 'cash' | 'transfer', paymentDate?: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  addRoom: (room: Room) => void;
  deleteRoom: (id: string) => void;
  checkoutRoom: (id: string) => void;
  updateTenant: (id: string, updates: Partial<Tenant>) => void;
  addExpense: (expense: Expense) => void;
  updateContract: (id: string, updates: Partial<Contract>) => void;
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
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
 
  // Persistence: Load from Firestore on mount
  useEffect(() => {
    // Attempt to restore user from localStorage immediately to prevent flicker
    const savedUser = localStorage.getItem('lumea_user_v2');
    if (savedUser && savedUser !== "null") {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) setUser(parsed);
      } catch (e) {
        console.error("Error parsing saved user", e);
      }
    }

    const unsub = onSnapshot(doc(db, 'state', 'global'), (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Sanitization function
          const safeStr = (v: any) => (typeof v === 'string' ? v : '');

          if (data.rooms) setRooms(data.rooms);
          if (data.tenants) setTenants(data.tenants);
          if (data.issues) {
            setIssues(data.issues.map((i: any) => ({
              ...i,
              createdAt: safeStr(i.createdAt),
              dueDate: safeStr(i.dueDate)
            })));
          }
          if (data.invoices) {
            setInvoices(data.invoices.map((i: any) => ({
              ...i,
              month: safeStr(i.month),
              issueDate: safeStr(i.issueDate),
              dueDate: safeStr(i.dueDate),
              paymentDate: safeStr(i.paymentDate)
            })));
          }
          if (data.contracts) setContracts(data.contracts);
          if (data.expenses) {
            setExpenses(data.expenses.map((e: any) => ({
              ...e,
              date: safeStr(e.date)
            })));
          }
          if (data.usersList) {
            const updatedUsers = data.usersList.map((u: User) => ({
              ...u,
              password: u.password === 'password123' ? '123456' : u.password
            }));
            setUsersList(updatedUsers);
          }
        } else {
          // Init remote document first time
          const updatedUsers = INITIAL_USERS.map(u => ({
            ...u,
            password: '123456'
          }));
          setDoc(doc(db, 'state', 'global'), {
            rooms: INITIAL_ROOMS,
            tenants: INITIAL_TENANTS,
            issues: INITIAL_ISSUES,
            invoices: INITIAL_INVOICES,
            contracts: INITIAL_CONTRACTS,
            expenses: INITIAL_EXPENSES,
            usersList: updatedUsers
          });
        }
      } catch (e) {
        console.error("Error loading initial data", e);
      } finally {
        setIsLoaded(true);
      }
    }, (error) => {
      console.error("Snapshot error:", error);
      setIsLoaded(true);
    });

    return () => unsub();
  }, []);

  // Sync current user to local storage
  useEffect(() => {
    if (!isLoaded) return;
    
    if (user) {
      localStorage.setItem('lumea_user_v2', JSON.stringify(user));
      
      // Sync current user if it changed in usersList (only essential fields)
      const latestUser = usersList.find(u => u.id === user.id);
      if (latestUser) {
        const hasChanged = 
          latestUser.name !== user.name || 
          latestUser.email !== user.email || 
          latestUser.role !== user.role ||
          latestUser.password !== user.password;
          
        if (hasChanged) {
          setUser(latestUser);
        }
      }
    } else {
      localStorage.removeItem('lumea_user_v2');
    }
  }, [user, usersList, isLoaded]);
 
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
    localStorage.removeItem('lumea_user_v2');
  };

  const addUser = (u: User) => {
    const newItems = [...usersList, u];
    setUsersList(newItems);
    syncToDb('usersList', newItems);
  };
  const updateUser = (id: string, updates: Partial<User>) => {
    const newItems = usersList.map(u => u.id === id ? { ...u, ...updates } : u);
    setUsersList(newItems);
    syncToDb('usersList', newItems);
    if (user?.id === id) {
      setUser({ ...user, ...updates });
    }
  };
  const deleteUser = (id: string) => {
    const newItems = usersList.filter(u => u.id !== id);
    setUsersList(newItems);
    syncToDb('usersList', newItems);
  };

  const syncToDb = (key: string, data: any) => {
    setDoc(doc(db, 'state', 'global'), { [key]: data }, { merge: true }).catch(console.error);
  };

  const addIssue = (issue: Issue) => {
    const newItems = [issue, ...issues];
    setIssues(newItems);
    syncToDb('issues', newItems);
  };
  const updateIssue = (id: string, status: Issue['status']) => {
    const newItems = issues.map(i => i.id === id ? { ...i, status } : i);
    setIssues(newItems);
    syncToDb('issues', newItems);
  };
  const editIssue = (id: string, updates: Partial<Issue>) => {
    const newItems = issues.map(i => i.id === id ? { ...i, ...updates } : i);
    setIssues(newItems);
    syncToDb('issues', newItems);
  };
  const deleteIssue = (id: string) => {
    const newItems = issues.filter(i => i.id !== id);
    setIssues(newItems);
    syncToDb('issues', newItems);
  };
  const payInvoice = (id: string, paymentMethod?: 'cash' | 'transfer', paymentDate?: string) => {
    const newItems = invoices.map(i => i.id === id ? { 
      ...i, 
      status: 'paid' as const,
      paymentMethod: paymentMethod || 'cash',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0]
    } : i);
    setInvoices(newItems);
    syncToDb('invoices', newItems);
  };
  const addInvoice = (invoice: Invoice) => {
    const newItems = [invoice, ...invoices];
    setInvoices(newItems);
    syncToDb('invoices', newItems);
  };
  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const newItems = invoices.map(i => i.id === id ? { ...i, ...updates } : i);
    setInvoices(newItems);
    syncToDb('invoices', newItems);
  };
  const deleteInvoice = (id: string) => {
    const newItems = invoices.filter(i => i.id !== id);
    setInvoices(newItems);
    syncToDb('invoices', newItems);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    const newItems = rooms.map(r => r.id === id ? { ...r, ...updates } : r);
    setRooms(newItems);
    syncToDb('rooms', newItems);
  };

  const addRoom = (room: Room) => {
    const newItems = [...rooms, room];
    setRooms(newItems);
    syncToDb('rooms', newItems);
  };
  const deleteRoom = (id: string) => {
    const newItems = rooms.filter(r => r.id !== id);
    setRooms(newItems);
    syncToDb('rooms', newItems);
  };

  const checkoutRoom = (id: string) => {
    const newRooms = rooms.map(r => r.id === id ? { 
      ...r, 
      status: 'available', 
      leaseStart: undefined, 
      leaseEnd: undefined 
    } : r);
    setRooms(newRooms as any);
    syncToDb('rooms', newRooms);
    
    // Also remove tenant from this room
    const newTenants = tenants.map(t => t.roomId === id ? { ...t, roomId: undefined } : t);
    setTenants(newTenants);
    syncToDb('tenants', newTenants);
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    const newItems = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
    setTenants(newItems);
    syncToDb('tenants', newItems);
  };

  const addTenant = (tenant: Tenant) => {
    const newItems = [...tenants, tenant];
    setTenants(newItems);
    syncToDb('tenants', newItems);
  };
  const deleteTenant = (id: string) => {
    const newItems = tenants.filter(t => t.id !== id);
    setTenants(newItems);
    syncToDb('tenants', newItems);
  };

  const addExpense = (expense: Expense) => {
    const newItems = [expense, ...expenses];
    setExpenses(newItems);
    syncToDb('expenses', newItems);
  };
  const updateExpense = (id: string, updates: Partial<Expense>) => {
    const newItems = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
    setExpenses(newItems);
    syncToDb('expenses', newItems);
  };
  const deleteExpense = (id: string) => {
    const newItems = expenses.filter(e => e.id !== id);
    setExpenses(newItems);
    syncToDb('expenses', newItems);
  };
  
  const addContract = (contract: Contract) => {
    const newItems = [contract, ...contracts];
    setContracts(newItems);
    syncToDb('contracts', newItems);
  };
  const updateContract = (id: string, updates: Partial<Contract>) => {
    const newItems = contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContracts(newItems);
    syncToDb('contracts', newItems);
  };
  const deleteContract = (id: string) => {
    const newItems = contracts.filter(c => c.id !== id);
    setContracts(newItems);
    syncToDb('contracts', newItems);
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
          initialElectricityMeter: room.initialElectricityMeter,
          water: 0,
          other: 0,
          total: room.price,
          status: 'pending',
          dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`,
          issueDate: now.toISOString().split('T')[0]
        };
      });
      const newItems = [...newInvoices, ...invoices];
      setInvoices(newItems);
      syncToDb('invoices', newItems);
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
      usersList,
      isLoaded,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addIssue,
      updateIssue,
      editIssue,
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
