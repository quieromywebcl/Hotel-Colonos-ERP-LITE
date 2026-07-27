import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RoomRack } from './components/RoomRack';
import { Sales } from './components/Sales';
import { CRM } from './components/CRM';
import { Expenses } from './components/Expenses';
import { Inventory } from './components/Inventory';
import { SQLScriptView } from './components/SQLScript';
import { SupaConnectionView } from './components/SupaConnectionView';

import {
  Room,
  Guest,
  Sale,
  Expense,
  Debt,
  InventoryItem,
  ProfitGoal,
  AuthorizedUser,
} from './types';
import {
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_DEBTS,
  INITIAL_INVENTORY,
  INITIAL_PROFIT_GOAL,
} from './lib/initialData';
import { LOCAL_STORAGE_KEYS, supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { isAuthorizedEmail } from './lib/utils';
import {
  fetchAllDataFromSupabase,
  dbUpsertRoom,
  dbDeleteRoom,
  dbUpsertGuest,
  dbDeleteGuest,
  dbUpsertSale,
  dbDeleteSale,
  dbUpsertExpense,
  dbDeleteExpense,
  dbUpsertDebt,
  dbDeleteDebt,
  dbUpsertInventoryItem,
  dbDeleteInventoryItem,
  dbUpdateProfitGoal,
  dbUpdateRentCost,
  generateUUID,
} from './lib/supabaseSync';

export function App() {
  // 1. AUTHENTICATION STATE
  const [authUser, setAuthUser] = useState<AuthorizedUser | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // 2. ACTIVE TAB STATE
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // 3. CORE DOMAIN DATA STATES
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [guests, setGuests] = useState<Guest[]>(INITIAL_GUESTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [debts, setDebts] = useState<Debt[]>(INITIAL_DEBTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [profitGoal, setProfitGoal] = useState<ProfitGoal>(INITIAL_PROFIT_GOAL);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(true);

  // Preselected room for check-in bridge
  const [preselectedRoom, setPreselectedRoom] = useState<Room | null>(null);

  // LOAD REAL-TIME DATA FROM SUPABASE ON INITIAL MOUNT (DIRECT PUBLIC API)
  const refreshSupabaseData = async () => {
    setIsSyncingSupabase(true);
    try {
      const appData = await fetchAllDataFromSupabase();
      if (appData.isRealSupabaseData) {
        if (appData.rooms) setRooms(appData.rooms);
        if (appData.guests) setGuests(appData.guests);
        if (appData.sales) setSales(appData.sales);
        if (appData.expenses) {
          setExpenses(appData.expenses);
        } else if (appData.rentCost) {
          setExpenses((prev) => {
            const hasRent = prev.some((e) => e.subcategory === 'arriendo');
            if (hasRent) {
              return prev.map((e) => (e.subcategory === 'arriendo' ? { ...e, amount: appData.rentCost! } : e));
            } else {
              return [
                ...prev,
                {
                  id: generateUUID(),
                  title: 'Arriendo de Local Comercial',
                  category: 'fixed',
                  subcategory: 'arriendo',
                  amount: appData.rentCost!,
                  expenseDate: new Date().toISOString().split('T')[0],
                  status: 'paid',
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          });
        }
        if (appData.debts) setDebts(appData.debts);
        if (appData.inventory) setInventory(appData.inventory);
        if (appData.profitGoal) setProfitGoal(appData.profitGoal);
      }
    } catch (e) {
      console.warn('Error al actualizar datos de Supabase:', e);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    refreshSupabaseData();

    // Set up Realtime listener if supabase client is active
    if (supabase) {
      const channel = supabase
        .channel('public-schema-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            fetchAllDataFromSupabase().then((latest) => {
              if (latest.isRealSupabaseData && isMounted) {
                if (latest.rooms) setRooms(latest.rooms);
                if (latest.guests) setGuests(latest.guests);
                if (latest.sales) setSales(latest.sales);
                if (latest.expenses) setExpenses(latest.expenses);
                if (latest.debts) setDebts(latest.debts);
                if (latest.inventory) setInventory(latest.inventory);
                if (latest.profitGoal) setProfitGoal(latest.profitGoal);
              }
            });
          }
        )
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // AUTH HANDLERS
  const handleLoginSuccess = (user: AuthorizedUser) => {
    setAuthUser(user);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleLogout = () => {
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setAuthUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('¿Deseas restablecer las habitaciones e inventario en memoria?')) {
      setRooms(INITIAL_ROOMS);
      setGuests(INITIAL_GUESTS);
      setSales(INITIAL_SALES);
      setExpenses(INITIAL_EXPENSES);
      setDebts(INITIAL_DEBTS);
      setInventory(INITIAL_INVENTORY);
      setProfitGoal(INITIAL_PROFIT_GOAL);
    }
  };

  // ROOM CRUD HANDLERS (SUPABASE)
  const handleAddRoom = (newRoom: Omit<Room, 'id'>) => {
    const created: Room = {
      ...newRoom,
      id: generateUUID(),
    };
    setRooms((prev) => [...prev, created]);
    dbUpsertRoom(created);
  };

  const handleUpdateRoom = (updated: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    dbUpsertRoom(updated);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    dbDeleteRoom(id);
  };

  const handleQuickCheckInFromRoom = (room: Room) => {
    setPreselectedRoom(room);
    setActiveTab('sales');
  };

  // GUEST CRUD HANDLERS (SUPABASE)
  const handleAddGuest = (newGuest: Omit<Guest, 'id' | 'createdAt'>) => {
    const created: Guest = {
      ...newGuest,
      id: generateUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setGuests((prev) => [created, ...prev]);
    dbUpsertGuest(created);
  };

  const handleUpdateGuest = (updated: Guest) => {
    setGuests((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    dbUpsertGuest(updated);
  };

  const handleDeleteGuest = (id: string) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    dbDeleteGuest(id);
  };

  // SALE CRUD HANDLERS (SUPABASE)
  const handleAddSale = (newSale: Omit<Sale, 'id' | 'createdAt'>) => {
    const created: Sale = {
      ...newSale,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    setSales((prev) => [created, ...prev]);
    dbUpsertSale(created);

    // Update room status
    if (newSale.roomId) {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === newSale.roomId
            ? {
                ...r,
                status: 'occupied',
                currentGuestName: newSale.guestName,
                currentGuestRut: newSale.guestRut,
                currentGuestPhone: newSale.guestPhone,
                checkInDate: newSale.checkInDate,
                checkOutDate: newSale.checkOutDate,
              }
            : r
        )
      );
    }

    // Update or create Guest in CRM
    setGuests((prev) => {
      const existing = prev.find((g) => g.rut === newSale.guestRut);
      if (existing) {
        const updatedGuest: Guest = {
          ...existing,
          totalVisits: existing.totalVisits + 1,
          totalSpent: existing.totalSpent + newSale.grandTotal,
          isFrequent: existing.totalVisits + 1 >= 3,
        };
        dbUpsertGuest(updatedGuest);
        return prev.map((g) => (g.id === existing.id ? updatedGuest : g));
      } else {
        const parts = newSale.guestName.trim().split(' ');
        const firstName = parts[0] || 'Cliente';
        const lastName = parts.slice(1).join(' ') || 'General';
        const createdGuest: Guest = {
          id: generateUUID(),
          rut: newSale.guestRut,
          firstName,
          lastName,
          email: newSale.guestEmail || '',
          phone: newSale.guestPhone || '',
          totalVisits: 1,
          totalSpent: newSale.grandTotal,
          isFrequent: false,
          createdAt: new Date().toISOString().split('T')[0],
        };
        dbUpsertGuest(createdGuest);
        return [createdGuest, ...prev];
      }
    });
  };

  const handleUpdateSale = (updated: Sale) => {
    setSales((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    dbUpsertSale(updated);
  };

  const handleDeleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
    dbDeleteSale(id);
  };

  // EXPENSE CRUD HANDLERS (SUPABASE)
  const handleAddExpense = (newExp: Omit<Expense, 'id' | 'createdAt'>) => {
    const created: Expense = {
      ...newExp,
      id: generateUUID(),
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [created, ...prev]);
    dbUpsertExpense(created);

    if (newExp.subcategory === 'arriendo') {
      dbUpdateRentCost(newExp.amount);
    }
  };

  const handleUpdateExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    dbUpsertExpense(updated);

    if (updated.subcategory === 'arriendo') {
      dbUpdateRentCost(updated.amount);
    }
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    dbDeleteExpense(id);
  };

  // DEBT CRUD HANDLERS (SUPABASE)
  const handleAddDebt = (newDebt: Omit<Debt, 'id' | 'createdAt'>) => {
    const created: Debt = {
      ...newDebt,
      id: generateUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDebts((prev) => [created, ...prev]);
    dbUpsertDebt(created);
  };

  const handleUpdateDebt = (updated: Debt) => {
    setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    dbUpsertDebt(updated);
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    dbDeleteDebt(id);
  };

  // INVENTORY CRUD HANDLERS (SUPABASE)
  const handleAddInventoryItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const created: InventoryItem = {
      ...newItem,
      id: generateUUID(),
    };
    setInventory((prev) => [...prev, created]);
    dbUpsertInventoryItem(created);
  };

  const handleUpdateInventoryItem = (updated: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    dbUpsertInventoryItem(updated);
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory((prev) => prev.filter((i) => i.id !== id));
    dbDeleteInventoryItem(id);
  };

  // Profit Goal Handler
  const handleUpdateProfitGoal = (val: number) => {
    setProfitGoal({ monthlyTarget: val });
    dbUpdateProfitGoal(val);
  };

  // Derived counts for sidebar badges
  const criticalInventoryCount = inventory.filter(
    (i) => i.currentStock <= i.minStockThreshold
  ).length;

  const pendingDebtsCount = debts.filter((d) => d.status === 'pending').length;

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 4. UNAUTHENTICATED VIEW -> RENDER LOGIN
  if (!authUser || !authUser.isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 5. AUTHENTICATED ERP LAYOUT
  return (
    <div className="min-h-screen bg-[#1C1C1E] text-neutral-100 flex flex-row font-sans text-base antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalInventoryCount={criticalInventoryCount}
        pendingDebtsCount={pendingDebtsCount}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1C1C1E]">
        {/* Top App Header */}
        <Header
          onLogout={handleLogout}
          onResetDemoData={handleResetDemoData}
          onOpenSupaConnection={() => setActiveTab('supa_connection')}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* View Switcher Container */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto space-y-6 pb-24 md:pb-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              rooms={rooms}
              sales={sales}
              expenses={expenses}
              profitGoal={profitGoal}
              onUpdateProfitGoal={(val) => setProfitGoal({ monthlyTarget: val })}
              onNavigateTab={setActiveTab}
              onOpenQuickSaleModal={() => setActiveTab('sales')}
              onOpenQuickExpenseModal={() => setActiveTab('expenses')}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomRack
              rooms={rooms}
              sales={sales}
              onAddRoom={handleAddRoom}
              onUpdateRoom={handleUpdateRoom}
              onDeleteRoom={handleDeleteRoom}
              onQuickCheckIn={handleQuickCheckInFromRoom}
            />
          )}

          {activeTab === 'sales' && (
            <Sales
              sales={sales}
              rooms={rooms}
              guests={guests}
              expenses={expenses}
              onAddSale={handleAddSale}
              onUpdateSale={handleUpdateSale}
              onDeleteSale={handleDeleteSale}
              preselectedRoom={preselectedRoom}
              onClearPreselectedRoom={() => setPreselectedRoom(null)}
            />
          )}

          {activeTab === 'crm' && (
            <CRM
              guests={guests}
              onAddGuest={handleAddGuest}
              onUpdateGuest={handleUpdateGuest}
              onDeleteGuest={handleDeleteGuest}
            />
          )}

          {activeTab === 'expenses' && (
            <Expenses
              expenses={expenses}
              debts={debts}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddDebt={handleAddDebt}
              onUpdateDebt={handleUpdateDebt}
              onDeleteDebt={handleDeleteDebt}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              items={inventory}
              onAddItem={handleAddInventoryItem}
              onUpdateItem={handleUpdateInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
            />
          )}

          {activeTab === 'supa_connection' && (
            <SupaConnectionView
              onRefreshData={refreshSupabaseData}
              currentUserEmail={authUser?.email}
            />
          )}

          {activeTab === 'sql_script' && <SQLScriptView />}
        </main>
      </div>
    </div>
  );
}

export default App;
