import { Sale, Expense } from '../types';
import { formatDateES } from './utils';

/**
 * Downloads a string payload as a .csv file with UTF-8 BOM encoding
 * so Microsoft Excel opens special characters (ñ, á, é, °) seamlessly.
 */
export function downloadCSV(filename: string, csvContent: string) {
  const bom = '\uFEFF'; // Byte Order Mark for UTF-8 in Excel
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Sales array to Excel compatible CSV
 */
export function exportSalesToCSV(sales: Sale[], filename = 'Ventas_Hotel_Colonos.csv') {
  const headers = [
    'Folio Venta',
    'Fecha Registro',
    'RUT Huésped',
    'Nombre Huésped',
    'Teléfono',
    'Email',
    'Patente Vehículo',
    'N° Boleta / Factura',
    'Habitación',
    'Categoría Hab.',
    'Noches',
    'Check-In',
    'Check-Out',
    'Monto Habitación ($)',
    'Servicios Extras ($)',
    'Monto Total ($)',
    'Medio de Pago',
    'Estado Pago',
  ];

  const rows = sales.map((s) => {
    const extraServicesTotal = (s.extraServices || []).reduce(
      (acc, item) => acc + item.unitPrice * item.quantity,
      0
    );

    return [
      `"${s.saleCode || ''}"`,
      `"${formatDateES(s.createdAt)}"`,
      `"${s.guestRut || ''}"`,
      `"${s.guestName || ''}"`,
      `"${s.guestPhone || ''}"`,
      `"${s.guestEmail || ''}"`,
      `"${s.vehiclePlate || 'Sin Vehículo'}"`,
      `"${s.invoiceNumber || 'Sin Folio'}"`,
      `"Hab. ${s.roomNumber || ''}"`,
      `"${s.roomCategory || ''}"`,
      s.nightsCount || 1,
      `"${s.checkInDate || ''}"`,
      `"${s.checkOutDate || ''}"`,
      s.roomTotal || 0,
      extraServicesTotal,
      s.grandTotal || 0,
      `"${s.paymentMethod || ''}"`,
      `"${s.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}"`,
    ];
  });

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  downloadCSV(filename, csvContent);
}

/**
 * Export Expenses array to Excel compatible CSV
 */
export function exportExpensesToCSV(expenses: Expense[], filename = 'Gastos_Hotel_Colonos.csv') {
  const headers = [
    'ID / Código',
    'Concepto / Título',
    'Categoría',
    'Subcategoría',
    'Proveedor',
    'Monto ($)',
    'Fecha Gasto',
    'Estado',
    'Notas',
  ];

  const rows = expenses.map((e) => [
    `"${e.id.slice(0, 8)}"`,
    `"${e.title || ''}"`,
    `"${e.category === 'fixed' ? 'Fijo' : 'Variable'}"`,
    `"${e.subcategory || ''}"`,
    `"${e.vendor || ''}"`,
    e.amount || 0,
    `"${formatDateES(e.expenseDate)}"`,
    `"${e.status === 'paid' ? 'Pagado' : 'Pendiente'}"`,
    `"${e.notes || ''}"`,
  ]);

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  downloadCSV(filename, csvContent);
}
