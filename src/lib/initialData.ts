import {
  Room,
  Guest,
  Sale,
  Expense,
  Debt,
  InventoryItem,
  ExtraServiceItem,
  ProfitGoal,
} from '../types';

export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-101',
    number: '101',
    category: 'Simple',
    pricePerNight: 35000,
    status: 'available',
    notes: 'Primer piso, habitación simple.',
  },
  {
    id: 'room-102',
    number: '102',
    category: 'Simple',
    pricePerNight: 35000,
    status: 'available',
    notes: 'Primer piso, habitación simple.',
  },
  {
    id: 'room-201',
    number: '201',
    category: 'Doble',
    pricePerNight: 55000,
    status: 'available',
    notes: 'Segundo piso, habitación doble.',
  },
  {
    id: 'room-202',
    number: '202',
    category: 'Doble',
    pricePerNight: 55000,
    status: 'available',
    notes: 'Segundo piso, habitación doble.',
  },
  {
    id: 'room-301',
    number: '301',
    category: 'Matrimonial',
    pricePerNight: 75000,
    status: 'available',
    notes: 'Tercer piso, habitación matrimonial.',
  },
  {
    id: 'room-302',
    number: '302',
    category: 'Matrimonial',
    pricePerNight: 75000,
    status: 'available',
    notes: 'Tercer piso, habitación matrimonial.',
  },
  {
    id: 'room-401',
    number: '401',
    category: 'Suite',
    pricePerNight: 140000,
    status: 'available',
    notes: 'Cuarto piso, Suite Ejecutiva.',
  },
  {
    id: 'room-402',
    number: '402',
    category: 'Suite',
    pricePerNight: 140000,
    status: 'available',
    notes: 'Cuarto piso, Suite De Lujo.',
  },
];

export const INITIAL_GUESTS: Guest[] = [];

export const EXTRA_SERVICES_CATALOG: ExtraServiceItem[] = [
  { id: 'srv-1', name: 'Consumo Minibar (Bebida/Cerveza/Snack)', category: 'minibar', unitPrice: 5000 },
  { id: 'srv-2', name: 'Servicio de Lavandería (Kilo)', category: 'lavanderia', unitPrice: 8000 },
  { id: 'srv-3', name: 'Desayuno Buffet Adicional', category: 'cafeteria', unitPrice: 10000 },
  { id: 'srv-4', name: 'Estacionamiento Privado (Día)', category: 'estacionamiento', unitPrice: 6000 },
  { id: 'srv-5', name: 'Late Check-out (Hasta las 16:00)', category: 'late_checkout', unitPrice: 20000 },
  { id: 'srv-6', name: 'Tabla de Quesos y Vino Bienvenida', category: 'cafeteria', unitPrice: 25000 },
];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_DEBTS: Debt[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_PROFIT_GOAL: ProfitGoal = {
  monthlyTarget: 12000000, // $12.000.000 CLP Meta Mensual de Utilidad Neta
};

export const INITIAL_RENT_COST = 1200000; // $1.200.000 CLP Arriendo
