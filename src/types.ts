export type RoomCategory = 'Simple' | 'Doble' | 'Matrimonial' | 'Suite';
export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance';

export interface Room {
  id: string;
  number: string;
  category: RoomCategory;
  pricePerNight: number; // CLP
  status: RoomStatus;
  currentGuestName?: string;
  currentGuestRut?: string;
  currentGuestPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
  notes?: string;
  maintenanceNotes?: string;
}

export interface Guest {
  id: string;
  rut: string; // Chilean DNI / RUT format (e.g. 12.345.678-9)
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalVisits: number;
  totalSpent: number; // CLP
  isFrequent: boolean;
  notes?: string;
  createdAt: string;
}

export interface ExtraServiceItem {
  id: string;
  name: string;
  category: 'minibar' | 'lavanderia' | 'cafeteria' | 'estacionamiento' | 'late_checkout' | 'otro';
  unitPrice: number;
}

export interface SaleServiceDetail {
  serviceId: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

export type PaymentMethod = 'efectivo' | 'transferencia' | 'debito' | 'credito' | 'tarjeta' | 'pendiente';
export type PaymentStatus = 'paid' | 'pending' | 'partially_paid';

export interface Sale {
  id: string;
  saleCode: string;
  guestId?: string;
  guestRut: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  vehiclePlate?: string;
  invoiceNumber?: string;
  isFrequentGuest: boolean;
  roomId: string;
  roomNumber: string;
  roomCategory: RoomCategory;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  roomTotal: number;
  extraServices: SaleServiceDetail[];
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  pendingAmount?: number;
  createdAt: string;
  notes?: string;
}

export type ExpenseCategory = 'fixed' | 'variable';
export type ExpenseSubcategory = 
  | 'arriendo' 
  | 'sueldos' 
  | 'luz' 
  | 'agua' 
  | 'internet' 
  | 'gas' 
  | 'mercaderia' 
  | 'reparaciones' 
  | 'impuestos' 
  | 'otro';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory; // Fixed vs Variable
  subcategory: ExpenseSubcategory;
  amount: number; // CLP
  vendor?: string;
  expenseDate: string;
  status: 'paid' | 'pending';
  notes?: string;
  createdAt: string;
}

export type DebtType = 'receivable' | 'payable'; // Cuentas por Cobrar vs Cuentas por Pagar

export interface Debt {
  id: string;
  type: DebtType;
  entityName: string; // Huésped o Proveedor
  rutOrPhone?: string;
  amount: number; // CLP
  description: string;
  dueDate: string;
  status: 'pending' | 'paid';
  createdAt: string;
  paidAt?: string;
}

export type InventoryCategory = 'aseo_amenidades' | 'alimentos_bebidas';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: InventoryCategory;
  currentStock: number;
  minStockThreshold: number;
  unit: 'unidades' | 'litros' | 'paquetes' | 'cajas' | 'kg' | 'botellas';
  unitCost: number; // CLP
  supplier?: string;
  lastRestocked: string;
  notes?: string;
}

export interface ProfitGoal {
  monthlyTarget: number; // CLP, e.g. 12000000
}

export interface AuthorizedUser {
  email: string;
  isAuthenticated: boolean;
}
