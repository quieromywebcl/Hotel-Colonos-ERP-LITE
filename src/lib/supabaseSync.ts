import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Room,
  Guest,
  Sale,
  Expense,
  Debt,
  InventoryItem,
  ProfitGoal,
} from '../types';
import {
  INITIAL_ROOMS,
  INITIAL_GUESTS,
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_DEBTS,
  INITIAL_INVENTORY,
  INITIAL_PROFIT_GOAL,
} from './initialData';

/**
 * Generate a valid UUID v4 string if needed
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ----------------------------------------------------
// 1. MAPPER FUNCTIONS (DB <-> TypeScript)
// ----------------------------------------------------

export function mapDbToRoom(row: any): Room {
  return {
    id: row.id,
    number: row.number,
    category: row.category,
    pricePerNight: Number(row.price_per_night || 0),
    status: row.status || 'available',
    currentGuestName: row.current_guest_name || undefined,
    currentGuestRut: row.current_guest_rut || undefined,
    currentGuestPhone: row.current_guest_phone || undefined,
    checkInDate: row.check_in_date || undefined,
    checkOutDate: row.check_out_date || undefined,
    notes: row.notes || undefined,
    maintenanceNotes: row.maintenance_notes || undefined,
  };
}

export function mapRoomToDb(room: Room) {
  return {
    id: room.id,
    number: room.number,
    category: room.category,
    price_per_night: room.pricePerNight,
    status: room.status,
    current_guest_name: room.currentGuestName || null,
    current_guest_rut: room.currentGuestRut || null,
    current_guest_phone: room.currentGuestPhone || null,
    check_in_date: room.checkInDate || null,
    check_out_date: room.checkOutDate || null,
    notes: room.notes || null,
    maintenance_notes: room.maintenanceNotes || null,
    updated_at: new Date().toISOString(),
  };
}

export function mapDbToGuest(row: any): Guest {
  return {
    id: row.id,
    rut: row.rut,
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    email: row.email || '',
    phone: row.phone || '',
    totalVisits: Number(row.total_visits || 1),
    totalSpent: Number(row.total_spent || 0),
    isFrequent: Boolean(row.is_frequent),
    notes: row.notes || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function mapGuestToDb(guest: Guest) {
  return {
    id: guest.id,
    rut: guest.rut,
    first_name: guest.firstName,
    last_name: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    total_visits: guest.totalVisits,
    total_spent: guest.totalSpent,
    is_frequent: guest.isFrequent,
    notes: guest.notes || null,
    created_at: guest.createdAt || new Date().toISOString(),
  };
}

export function mapDbToSale(row: any): Sale {
  return {
    id: row.id,
    saleCode: row.sale_code || `VEN-${row.id.substring(0, 6)}`,
    guestId: row.guest_id || undefined,
    guestRut: row.guest_rut || '',
    guestName: row.guest_name || '',
    guestEmail: row.guest_email || undefined,
    guestPhone: row.guest_phone || undefined,
    vehiclePlate: row.vehicle_plate || undefined,
    invoiceNumber: row.invoice_number || undefined,
    isFrequentGuest: Boolean(row.is_frequent_guest),
    roomId: row.room_id || '',
    roomNumber: row.room_number || '',
    roomCategory: row.room_category || 'Simple',
    checkInDate: row.check_in_date || '',
    checkOutDate: row.check_out_date || '',
    nightsCount: Number(row.nights_count || 1),
    roomTotal: Number(row.room_total || 0),
    extraServices: Array.isArray(row.extra_services) ? row.extra_services : [],
    grandTotal: Number(row.grand_total || 0),
    paymentMethod: row.payment_method || 'efectivo',
    paymentStatus: row.payment_status || 'paid',
    pendingAmount: Number(row.pending_amount || 0),
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapSaleToDb(sale: Sale) {
  return {
    id: sale.id,
    sale_code: sale.saleCode,
    guest_id: sale.guestId || null,
    guest_rut: sale.guestRut,
    guest_name: sale.guestName,
    guest_email: sale.guestEmail || null,
    guest_phone: sale.guestPhone || null,
    vehicle_plate: sale.vehiclePlate || null,
    invoice_number: sale.invoiceNumber || null,
    is_frequent_guest: sale.isFrequentGuest,
    room_id: sale.roomId || null,
    room_number: sale.roomNumber,
    room_category: sale.roomCategory,
    check_in_date: sale.checkInDate,
    check_out_date: sale.checkOutDate,
    nights_count: sale.nightsCount,
    room_total: sale.roomTotal,
    extra_services: sale.extraServices || [],
    grand_total: sale.grandTotal,
    payment_method: sale.paymentMethod,
    payment_status: sale.paymentStatus,
    pending_amount: sale.pendingAmount,
    notes: sale.notes || null,
    created_at: sale.createdAt || new Date().toISOString(),
  };
}

export function mapDbToExpense(row: any): Expense {
  return {
    id: row.id,
    title: row.title,
    category: row.category || 'fixed',
    subcategory: row.subcategory || 'otro',
    amount: Number(row.amount || 0),
    vendor: row.vendor || undefined,
    expenseDate: row.expense_date || new Date().toISOString().split('T')[0],
    status: row.status || 'paid',
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapExpenseToDb(expense: Expense) {
  return {
    id: expense.id,
    title: expense.title,
    category: expense.category,
    subcategory: expense.subcategory,
    amount: expense.amount,
    vendor: expense.vendor || null,
    expense_date: expense.expenseDate,
    status: expense.status,
    notes: expense.notes || null,
    created_at: expense.createdAt || new Date().toISOString(),
  };
}

export function mapDbToDebt(row: any): Debt {
  return {
    id: row.id,
    type: row.type || 'receivable',
    entityName: row.entity_name,
    rutOrPhone: row.rut_or_phone || undefined,
    amount: Number(row.amount || 0),
    description: row.description || '',
    dueDate: row.due_date || new Date().toISOString().split('T')[0],
    status: row.status || 'pending',
    paidAt: row.paid_at || undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export function mapDebtToDb(debt: Debt) {
  return {
    id: debt.id,
    type: debt.type,
    entity_name: debt.entityName,
    rut_or_phone: debt.rutOrPhone || null,
    amount: debt.amount,
    description: debt.description,
    due_date: debt.dueDate,
    status: debt.status,
    paid_at: debt.paidAt || null,
    created_at: debt.createdAt || new Date().toISOString(),
  };
}

export function mapDbToInventory(row: any): InventoryItem {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    category: row.category || 'aseo_amenidades',
    currentStock: Number(row.current_stock || 0),
    minStockThreshold: Number(row.min_stock_threshold || 5),
    unit: row.unit || 'unidades',
    unitCost: Number(row.unit_cost || 0),
    supplier: row.supplier || undefined,
    lastRestocked: row.last_restocked || undefined,
    notes: row.notes || undefined,
  };
}

export function mapInventoryToDb(item: InventoryItem) {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    category: item.category,
    current_stock: item.currentStock,
    min_stock_threshold: item.minStockThreshold,
    unit: item.unit,
    unit_cost: item.unitCost,
    supplier: item.supplier || null,
    last_restocked: item.lastRestocked || new Date().toISOString().split('T')[0],
    notes: item.notes || null,
  };
}

// ----------------------------------------------------
// 2. FETCH ALL DATA FROM SUPABASE
// ----------------------------------------------------

export interface FullAppData {
  rooms?: Room[];
  guests?: Guest[];
  sales?: Sale[];
  expenses?: Expense[];
  debts?: Debt[];
  inventory?: InventoryItem[];
  profitGoal?: ProfitGoal;
  rentCost?: number;
  isRealSupabaseData: boolean;
}

export async function fetchAllDataFromSupabase(): Promise<FullAppData> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn('Supabase no está configurado. Conservando datos actuales sin sobrescribir.');
    return {
      isRealSupabaseData: false,
    };
  }

  try {
    // 1. Fetch settings (profit_goal, rent_cost) without .single() to avoid 404/406 errors
    let profitGoal: ProfitGoal | undefined = undefined;
    let rentCost: number | undefined = undefined;

    try {
      const settingsRes = await supabase.from('settings').select('*');
      if (!settingsRes.error && settingsRes.data) {
        const pgRow = settingsRes.data.find((item: any) => item.key === 'profit_goal');
        if (pgRow?.value) {
          profitGoal = {
            monthlyTarget: Number(pgRow.value.target || pgRow.value.monthlyTarget || INITIAL_PROFIT_GOAL.monthlyTarget),
          };
        }

        const rcRow = settingsRes.data.find((item: any) => item.key === 'rent_cost');
        if (rcRow?.value) {
          rentCost = Number(rcRow.value.amount || rcRow.value.rentCost || 3800000);
        }
      }
    } catch (e) {
      console.warn('Error al consultar tabla settings en Supabase:', e);
    }

    // 2. Fetch Rooms
    let rooms: Room[] | undefined = undefined;
    try {
      const roomsRes = await supabase.from('rooms').select('*').order('number', { ascending: true });
      if (!roomsRes.error && roomsRes.data && roomsRes.data.length > 0) {
        rooms = roomsRes.data.map(mapDbToRoom);
      }
    } catch (e) {
      console.warn('Error al consultar tabla rooms:', e);
    }

    // 3. Fetch Guests / Customers (Try guests first, fallback to customers)
    let guests: Guest[] | undefined = undefined;
    try {
      let guestsRes = await supabase.from('guests').select('*').order('created_at', { ascending: false });
      if (guestsRes.error || !guestsRes.data || guestsRes.data.length === 0) {
        guestsRes = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      }
      if (!guestsRes.error && guestsRes.data && guestsRes.data.length > 0) {
        guests = guestsRes.data.map(mapDbToGuest);
      }
    } catch (e) {
      console.warn('Error al consultar tabla guests/customers:', e);
    }

    // 4. Fetch Sales
    let sales: Sale[] | undefined = undefined;
    try {
      const salesRes = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (!salesRes.error && salesRes.data && salesRes.data.length > 0) {
        sales = salesRes.data.map(mapDbToSale);
      }
    } catch (e) {
      console.warn('Error al consultar tabla sales:', e);
    }

    // 5. Fetch Expenses / Expendies (Try expenses first, fallback to expendies)
    let expenses: Expense[] | undefined = undefined;
    try {
      let expensesRes = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
      if (expensesRes.error || !expensesRes.data || expensesRes.data.length === 0) {
        expensesRes = await supabase.from('expendies').select('*').order('created_at', { ascending: false });
      }
      if (!expensesRes.error && expensesRes.data && expensesRes.data.length > 0) {
        expenses = expensesRes.data.map(mapDbToExpense);
      }
    } catch (e) {
      console.warn('Error al consultar tabla expenses/expendies:', e);
    }

    // 6. Fetch Debts
    let debts: Debt[] | undefined = undefined;
    try {
      const debtsRes = await supabase.from('debts').select('*').order('created_at', { ascending: false });
      if (!debtsRes.error && debtsRes.data && debtsRes.data.length > 0) {
        debts = debtsRes.data.map(mapDbToDebt);
      }
    } catch (e) {
      console.warn('Error al consultar tabla debts:', e);
    }

    // 7. Fetch Inventory
    let inventory: InventoryItem[] | undefined = undefined;
    try {
      const inventoryRes = await supabase.from('inventory').select('*').order('code', { ascending: true });
      if (!inventoryRes.error && inventoryRes.data && inventoryRes.data.length > 0) {
        inventory = inventoryRes.data.map(mapDbToInventory);
      }
    } catch (e) {
      console.warn('Error al consultar tabla inventory:', e);
    }

    return {
      rooms,
      guests,
      sales,
      expenses,
      debts,
      inventory,
      profitGoal,
      rentCost,
      isRealSupabaseData: true,
    };
  } catch (error) {
    console.error('Error general al sincronizar con Supabase (manteniendo datos reales locales):', error);
    return {
      isRealSupabaseData: false,
    };
  }
}

/**
 * Seed initial database records into Supabase if empty
 */
export async function seedSupabaseDatabase() {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // Rooms
    const roomRows = INITIAL_ROOMS.map((r) => mapRoomToDb({ ...r, id: generateUUID() }));
    await supabase.from('rooms').insert(roomRows);

    // Expenses
    const expRows = INITIAL_EXPENSES.map((e) => mapExpenseToDb({ ...e, id: generateUUID() }));
    await supabase.from('expenses').insert(expRows);

    // Inventory
    const invRows = INITIAL_INVENTORY.map((i) => mapInventoryToDb({ ...i, id: generateUUID() }));
    await supabase.from('inventory').insert(invRows);

    // Debts
    const debtRows = INITIAL_DEBTS.map((d) => mapDebtToDb({ ...d, id: generateUUID() }));
    await supabase.from('debts').insert(debtRows);

    // Settings / Profit Goal
    await supabase.from('settings').upsert({
      key: 'profit_goal',
      value: { target: INITIAL_PROFIT_GOAL.monthlyTarget },
    });
  } catch (err) {
    console.warn('Failed seeding initial Supabase data:', err);
  }
}

// ----------------------------------------------------
// 3. REAL-TIME CRUD ASYNC SUPABASE MUTATIONS
// ----------------------------------------------------

// ROOMS
export async function dbUpsertRoom(room: Room) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapRoomToDb(room);
    await supabase.from('rooms').upsert(row);
  } catch (err) {
    console.error('dbUpsertRoom error:', err);
  }
}

export async function dbDeleteRoom(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('rooms').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteRoom error:', err);
  }
}

// GUESTS
export async function dbUpsertGuest(guest: Guest) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapGuestToDb(guest);
    await supabase.from('guests').upsert(row);
  } catch (err) {
    console.error('dbUpsertGuest error:', err);
  }
}

export async function dbDeleteGuest(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('guests').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteGuest error:', err);
  }
}

// SALES
export async function dbUpsertSale(sale: Sale) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapSaleToDb(sale);
    await supabase.from('sales').upsert(row);
  } catch (err) {
    console.error('dbUpsertSale error:', err);
  }
}

export async function dbDeleteSale(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('sales').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteSale error:', err);
  }
}

// EXPENSES
export async function dbUpsertExpense(expense: Expense) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapExpenseToDb(expense);
    await supabase.from('expenses').upsert(row);
  } catch (err) {
    console.error('dbUpsertExpense error:', err);
  }
}

export async function dbDeleteExpense(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('expenses').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteExpense error:', err);
  }
}

// DEBTS
export async function dbUpsertDebt(debt: Debt) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapDebtToDb(debt);
    await supabase.from('debts').upsert(row);
  } catch (err) {
    console.error('dbUpsertDebt error:', err);
  }
}

export async function dbDeleteDebt(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('debts').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteDebt error:', err);
  }
}

// INVENTORY
export async function dbUpsertInventoryItem(item: InventoryItem) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const row = mapInventoryToDb(item);
    await supabase.from('inventory').upsert(row);
  } catch (err) {
    console.error('dbUpsertInventoryItem error:', err);
  }
}

export async function dbDeleteInventoryItem(id: string) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('inventory').delete().eq('id', id);
  } catch (err) {
    console.error('dbDeleteInventoryItem error:', err);
  }
}

// PROFIT GOAL & RENT COST / SETTINGS
export async function dbUpdateProfitGoal(target: number) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('settings').upsert({
      key: 'profit_goal',
      value: { target },
    });
  } catch (err) {
    console.error('dbUpdateProfitGoal error:', err);
  }
}

export async function dbUpdateRentCost(amount: number) {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase.from('settings').upsert({
      key: 'rent_cost',
      value: { amount },
    });
  } catch (err) {
    console.error('dbUpdateRentCost error:', err);
  }
}
