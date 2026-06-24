import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Room, Tenant, Issue, Invoice, Contract, Expense, User, ElectricityRecord, CleaningSchedule, Task,
  INITIAL_ROOMS, INITIAL_TENANTS, INITIAL_ISSUES, INITIAL_TASKS, INITIAL_INVOICES, INITIAL_CONTRACTS, INITIAL_EXPENSES, INITIAL_USERS, INITIAL_ELECTRICITY, INITIAL_CLEANING_SCHEDULES,
  calculateRentForMonth
} from './utils';
import { calculateNextCleaningDate } from './scheduleHelper';

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
  electricityRecords: ElectricityRecord[];
  cleaningSchedules: CleaningSchedule[];
  tasks: Task[];
  isLoaded: boolean;
  appName: string;
  setAppName: (name: string) => void;
  customMonths: Record<string, string>;
  updateCustomMonth: (month: string, name: string) => Promise<void>;
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
  addElectricityRecord: (record: ElectricityRecord) => void;
  updateElectricityRecord: (id: string, updates: Partial<ElectricityRecord>) => void;
  deleteElectricityRecord: (id: string) => void;
  payElectricity: (id: string, paymentMethod?: 'cash' | 'transfer', paymentDate?: string) => void;
  addCleaningSchedule: (schedule: CleaningSchedule) => void;
  updateCleaningSchedule: (id: string, updates: Partial<CleaningSchedule>) => void;
  deleteCleaningSchedule: (id: string) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
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
  const [electricityRecords, setElectricityRecords] = useState<ElectricityRecord[]>(INITIAL_ELECTRICITY);
  const [cleaningSchedules, setCleaningSchedules] = useState<CleaningSchedule[]>(INITIAL_CLEANING_SCHEDULES);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [appName, setAppNameState] = useState<string>('Căn Hộ Nam Cầu Trần Thị Lý');
  const [customMonths, setCustomMonths] = useState<Record<string, string>>({});
 
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
          if (data.cleaningSchedules) setCleaningSchedules(data.cleaningSchedules);
          if (data.tasks) setTasks(data.tasks);
          if (data.appName) setAppNameState(data.appName);
          if (data.customMonths) setCustomMonths(data.customMonths);
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
          if (data.electricityRecords) {
            setElectricityRecords(data.electricityRecords.map((e: any) => ({
              ...e,
              month: safeStr(e.month),
              paymentDate: safeStr(e.paymentDate)
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
            electricityRecords: INITIAL_ELECTRICITY,
            contracts: INITIAL_CONTRACTS,
            expenses: INITIAL_EXPENSES,
            usersList: updatedUsers,
            tasks: INITIAL_TASKS
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

  const setAppName = (name: string) => {
    setAppNameState(name);
    syncToDb('appName', name);
  };

  const updateCustomMonth = async (month: string, name: string) => {
    const updated = { ...customMonths, [month]: name };
    setCustomMonths(updated);
    await syncToDb('customMonths', updated);
  };

  const syncToDb = async (key: string, data: any) => {
    try {
      // Remove undefined values from objects within arrays to prevent Firestore errors
      const sanitizedData = JSON.parse(JSON.stringify(data, (_, value) => 
        value === undefined ? null : value
      ));
      await setDoc(doc(db, 'state', 'global'), { [key]: sanitizedData }, { merge: true });
    } catch (e) {
      console.error(`Error syncing ${key} to DB:`, e);
      throw e;
    }
  };

  const addIssue = async (issue: Issue) => {
    const newItems = [issue, ...issues];
    setIssues(newItems);
    await syncToDb('issues', newItems);
  };
  const updateIssue = async (id: string, status: Issue['status']) => {
    const newItems = issues.map(i => i.id === id ? { ...i, status } : i);
    setIssues(newItems);
    await syncToDb('issues', newItems);
  };
  const editIssue = async (id: string, updates: Partial<Issue>) => {
    const newItems = issues.map(i => i.id === id ? { ...i, ...updates } : i);
    setIssues(newItems);
    await syncToDb('issues', newItems);
  };
  const deleteIssue = async (id: string) => {
    const newItems = issues.filter(i => i.id !== id);
    setIssues(newItems);
    await syncToDb('issues', newItems);
  };
  const payInvoice = async (id: string, paymentMethod?: 'cash' | 'transfer', paymentDate?: string) => {
    const newItems = invoices.map(i => i.id === id ? { 
      ...i, 
      status: 'paid' as const,
      paymentMethod: paymentMethod || 'cash',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0]
    } : i);
    setInvoices(newItems);
    await syncToDb('invoices', newItems);
  };
  const addInvoice = async (invoice: Invoice) => {
    const newItems = [invoice, ...invoices];
    setInvoices(newItems);
    await syncToDb('invoices', newItems);
  };
  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const newItems = invoices.map(i => i.id === id ? { ...i, ...updates } : i);
    setInvoices(newItems);
    await syncToDb('invoices', newItems);
  };
  const deleteInvoice = async (id: string) => {
    const newItems = invoices.filter(i => i.id !== id);
    setInvoices(newItems);
    await syncToDb('invoices', newItems);
  };

  const updateRoom = async (id: string, updates: Partial<Room>) => {
    let wasRecurringSettingAddedOrChanged = false;
    let newRecurringConfig = updates.recurringCleaning;

    const newItems = rooms.map(r => {
      if (r.id === id) {
         if (updates.recurringCleaning && JSON.stringify(r.recurringCleaning) !== JSON.stringify(updates.recurringCleaning)) {
            wasRecurringSettingAddedOrChanged = true;
         }
         return { ...r, ...updates };
      }
      return r;
    });

    if (wasRecurringSettingAddedOrChanged && newRecurringConfig && newRecurringConfig.daysOfWeek.length > 0) {
      // Create or update schedule
      const existingPending = cleaningSchedules.find(cs => cs.roomId === id && cs.status !== 'completed');
      if (!existingPending) {
         const nextDate = calculateNextCleaningDate(newRecurringConfig.daysOfWeek, newRecurringConfig.time);
         if (nextDate) {
            const nextSchedule: CleaningSchedule = {
               id: `cs-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
               roomId: id,
               scheduledDate: nextDate.date,
               scheduledTime: nextDate.time,
               status: 'pending',
               createdAt: new Date().toISOString()
            };
            const newSchedules = [nextSchedule, ...cleaningSchedules];
            setCleaningSchedules(newSchedules);
            await syncToDb('cleaningSchedules', newSchedules);
         }
      }
    }

    setRooms(newItems);
    await syncToDb('rooms', newItems);
  };

  const addRoom = async (room: Room) => {
    const newItems = [...rooms, room];
    setRooms(newItems);
    await syncToDb('rooms', newItems);
  };
  const deleteRoom = async (id: string) => {
    const newItems = rooms.filter(r => r.id !== id);
    setRooms(newItems);
    await syncToDb('rooms', newItems);
  };

  const checkoutRoom = async (id: string) => {
    const newRooms = rooms.map(r => r.id === id ? { 
      ...r, 
      status: 'available' as const, 
      leaseStart: null, 
      leaseEnd: null,
      isExtended: false
    } : r);
    setRooms(newRooms as any);
    await syncToDb('rooms', newRooms);
    
    // Also remove tenant from this room (but keep the tenant record)
    const newTenants = tenants.map(t => t.roomId === id ? { ...t, roomId: "" } : t);
    setTenants(newTenants);
    await syncToDb('tenants', newTenants);
  };

  const updateTenant = async (id: string, updates: Partial<Tenant>) => {
    const newItems = tenants.map(t => t.id === id ? { ...t, ...updates } : t);
    setTenants(newItems);
    await syncToDb('tenants', newItems);
  };

  const addTenant = async (tenant: Tenant) => {
    const newItems = [...tenants, tenant];
    setTenants(newItems);
    await syncToDb('tenants', newItems);
  };
  const deleteTenant = async (id: string) => {
    const newItems = tenants.filter(t => t.id !== id);
    setTenants(newItems);
    await syncToDb('tenants', newItems);
  };

  const addExpense = async (expense: Expense) => {
    const newItems = [expense, ...expenses];
    setExpenses(newItems);
    await syncToDb('expenses', newItems);
  };
  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    const newItems = expenses.map(e => e.id === id ? { ...e, ...updates } : e);
    setExpenses(newItems);
    await syncToDb('expenses', newItems);
  };
  const deleteExpense = async (id: string) => {
    const newItems = expenses.filter(e => e.id !== id);
    setExpenses(newItems);
    await syncToDb('expenses', newItems);
  };
  
  const addContract = async (contract: Contract) => {
    const newItems = [contract, ...contracts];
    setContracts(newItems);
    await syncToDb('contracts', newItems);
  };
  const updateContract = async (id: string, updates: Partial<Contract>) => {
    const newItems = contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    setContracts(newItems);
    await syncToDb('contracts', newItems);
  };
  const deleteContract = async (id: string) => {
    const newItems = contracts.filter(c => c.id !== id);
    setContracts(newItems);
    await syncToDb('contracts', newItems);
  };

  const checkMonthlyBilling = () => {
    const now = new Date();
    
    // Instead of a single 'currentMonth', we calculate target month per room based on leaseStart

    const getTargetMonthStr = (room: Room) => {
       let cycleDay = 1;
       if (room.leaseStart) {
          const lDate = new Date(room.leaseStart);
          if (!isNaN(lDate.getTime())) {
             cycleDay = lDate.getDate();
          }
       }
       
       let targetDate = new Date(now.getFullYear(), now.getMonth(), 1);
       if (now.getDate() < cycleDay) {
          targetDate.setMonth(targetDate.getMonth() - 1);
       }
       return `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
    };

    const pendingBillingRooms = rooms.filter(room => {
      if (room.status !== 'occupied') return false;
      const targetMonthStr = getTargetMonthStr(room);
      return !invoices.some(inv => inv.roomId === room.id && inv.month === targetMonthStr);
    });

    const generateAll = () => {
      const newInvoices: Invoice[] = pendingBillingRooms.map(room => {
        const tenant = tenants.find(t => t.roomId === room.id);
        const targetMonthStr = getTargetMonthStr(room);
        let calculatedRent = calculateRentForMonth(room.price, room.leaseStart, room.leaseEnd, targetMonthStr);

        let cycleDay = 1;
        if (room.leaseStart) {
           const lDate = new Date(room.leaseStart);
           if (!isNaN(lDate.getTime())) cycleDay = lDate.getDate();
        }

        const [y, m] = targetMonthStr.split('-');
        let due = new Date(parseInt(y), parseInt(m) - 1, cycleDay);
        due.setDate(due.getDate() + 5); // 5 days after cycle date

        return {
          id: `inv-${room.id}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          roomId: room.id,
          tenantId: tenant?.id || 'unknown',
          month: targetMonthStr,
          rent: calculatedRent,
          water: 0,
          other: 0,
          total: calculatedRent,
          status: 'pending',
          dueDate: due.toISOString().split('T')[0],
          issueDate: now.toISOString().split('T')[0]
        };
      });
      const newItems = [...newInvoices, ...invoices];
      setInvoices(newItems);
      syncToDb('invoices', newItems);
    };

    return { pendingRooms: pendingBillingRooms, generateAll };
  };

  const addElectricityRecord = async (record: ElectricityRecord) => {
    const newItems = [record, ...electricityRecords];
    setElectricityRecords(newItems);
    await syncToDb('electricityRecords', newItems);
  };
  const updateElectricityRecord = async (id: string, updates: Partial<ElectricityRecord>) => {
    const newItems = electricityRecords.map(e => e.id === id ? { ...e, ...updates } : e);
    setElectricityRecords(newItems);
    await syncToDb('electricityRecords', newItems);
  };
  const deleteElectricityRecord = async (id: string) => {
    const newItems = electricityRecords.filter(e => e.id !== id);
    setElectricityRecords(newItems);
    await syncToDb('electricityRecords', newItems);
  };
  const payElectricity = async (id: string, paymentMethod?: 'cash' | 'transfer', paymentDate?: string) => {
    const newItems = electricityRecords.map(e => e.id === id ? { 
      ...e, 
      status: 'paid' as const,
      paymentMethod: paymentMethod || 'cash',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0]
    } : e);
    setElectricityRecords(newItems);
    await syncToDb('electricityRecords', newItems);
  };

  const addCleaningSchedule = async (schedule: CleaningSchedule) => {
    const newItems = [schedule, ...cleaningSchedules];
    setCleaningSchedules(newItems);
    await syncToDb('cleaningSchedules', newItems);
  };

  const updateCleaningSchedule = async (id: string, updates: Partial<CleaningSchedule>) => {
    let newItems = cleaningSchedules.map(c => c.id === id ? { ...c, ...updates } : c);
    
    // Auto scheduling next clean if completed
    if (updates.status === 'completed') {
       const completedSchedule = cleaningSchedules.find(c => c.id === id);
       if (completedSchedule) {
          const room = rooms.find(r => r.id === completedSchedule.roomId);
          if (room && room.recurringCleaning && room.recurringCleaning.daysOfWeek.length > 0) {
             const nextDate = calculateNextCleaningDate(room.recurringCleaning.daysOfWeek, room.recurringCleaning.time, completedSchedule.scheduledDate);
             if (nextDate) {
                const nextSchedule: CleaningSchedule = {
                   id: `cs-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                   roomId: room.id,
                   scheduledDate: nextDate.date,
                   scheduledTime: nextDate.time,
                   status: 'pending',
                   createdAt: new Date().toISOString()
                };
                newItems = [nextSchedule, ...newItems];
             }
          }
       }
    }

    setCleaningSchedules(newItems);
    await syncToDb('cleaningSchedules', newItems);
  };

  const deleteCleaningSchedule = async (id: string) => {
    const newItems = cleaningSchedules.filter(c => c.id !== id);
    setCleaningSchedules(newItems);
    await syncToDb('cleaningSchedules', newItems);
  };

  const addTask = async (task: Task) => {
    const newItems = [task, ...tasks];
    setTasks(newItems);
    await syncToDb('tasks', newItems);
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    let clonedTask: Task | null = null;
    const newItems = tasks.map(t => {
      if (t.id === id) {
        const merged = { ...t, ...updates };
        // auto-detect if all items are checked and status was not updated explicitly
        if (merged.items.length > 0 && merged.items.every(item => item.isCompleted)) {
           if (merged.status !== 'completed') {
               merged.status = 'completed';
               if (merged.type === 'daily') {
                   clonedTask = {
                       ...merged,
                       id: `task-${Date.now()}`,
                       status: 'pending',
                       createdAt: new Date().toISOString(),
                       items: merged.items.map(i => ({ ...i, isCompleted: false }))
                   };
                   if (clonedTask.deadline && clonedTask.deadline.includes('T')) {
                       const [datePart, timePart] = clonedTask.deadline.split('T');
                       const [yr, mo, da] = datePart.split('-');
                       const localDate = new Date(Number(yr), Number(mo) - 1, Number(da) + 1);
                       const nextYr = localDate.getFullYear();
                       const nextMo = String(localDate.getMonth() + 1).padStart(2, '0');
                       const nextDa = String(localDate.getDate()).padStart(2, '0');
                       clonedTask.deadline = `${nextYr}-${nextMo}-${nextDa}T${timePart}`;
                   }
               }
           }
        } else if (merged.items.length > 0 && merged.items.some(item => item.isCompleted)) {
           if (merged.status !== 'in-progress') {
              merged.status = 'in-progress';
           }
        } else if (merged.items.length > 0) {
           merged.status = 'pending';
        }
        return merged;
      }
      return t;
    });

    if (clonedTask) {
        newItems.unshift(clonedTask);
    }
    
    setTasks(newItems);
    await syncToDb('tasks', newItems);
  };

  const deleteTask = async (id: string) => {
    const newItems = tasks.filter(t => t.id !== id);
    setTasks(newItems);
    await syncToDb('tasks', newItems);
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
      electricityRecords,
      cleaningSchedules,
      isLoaded,
      appName,
      setAppName,
      customMonths,
      updateCustomMonth,
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
      addElectricityRecord,
      updateElectricityRecord,
      deleteElectricityRecord,
      payElectricity,
      addCleaningSchedule,
      updateCleaningSchedule,
      deleteCleaningSchedule,
      tasks,
      addTask,
      updateTask,
      deleteTask,
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
