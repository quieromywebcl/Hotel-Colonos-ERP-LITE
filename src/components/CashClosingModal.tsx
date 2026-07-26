import React, { useState } from 'react';
import {
  X,
  Printer,
  DollarSign,
  CreditCard,
  Building2,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  Receipt,
  Wallet
} from 'lucide-react';
import { Sale, Expense } from '../types';
import { formatCLP, formatDateES } from '../lib/utils';

interface CashClosingModalProps {
  sales: Sale[];
  expenses: Expense[];
  onClose: () => void;
}

export const CashClosingModal: React.FC<CashClosingModalProps> = ({
  sales,
  expenses,
  onClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isSaved, setIsSaved] = useState(false);
  const [cashNotes, setCashNotes] = useState('');

  // Filter sales for the selected date (using createdAt date)
  const daySales = sales.filter((s) => {
    const saleDate = s.createdAt ? s.createdAt.split('T')[0] : s.checkInDate;
    return saleDate === selectedDate;
  });

  // Filter expenses for selected date
  const dayExpenses = expenses.filter((e) => {
    const expDate = e.expenseDate ? e.expenseDate.split('T')[0] : '';
    return expDate === selectedDate;
  });

  // Calculations
  const paidSales = daySales.filter((s) => s.paymentStatus === 'paid');
  const totalRevenueDay = paidSales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Breakdown by payment method
  const totalEfectivo = paidSales
    .filter((s) => s.paymentMethod === 'efectivo')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  const totalTransferencia = paidSales
    .filter((s) => s.paymentMethod === 'transferencia')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  const totalTarjetas = paidSales
    .filter((s) => ['debito', 'credito', 'tarjeta'].includes(s.paymentMethod))
    .reduce((acc, s) => acc + s.grandTotal, 0);

  const totalPendiente = daySales
    .filter((s) => s.paymentStatus === 'pending' || s.paymentMethod === 'pendiente')
    .reduce((acc, s) => acc + (s.pendingAmount || s.grandTotal), 0);

  // Expenses paid in cash
  const totalEgresosEfectivo = dayExpenses
    .filter((e) => e.status === 'paid')
    .reduce((acc, e) => acc + e.amount, 0);

  // Net Cash Box Balance = Cash Inflow - Cash Outflow
  const cajaChicaBalance = totalEfectivo - totalEgresosEfectivo;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveClosing = () => {
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* HEADER - NO PRINT */}
        <div className="p-4 sm:p-5 bg-[#1C1C1E] border-b border-[#3A3A3C] flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#E5E7EB] text-base sm:text-lg flex items-center gap-2">
                <span>Cierre de Caja Diario & Arqueo</span>
                <span className="text-xs font-mono font-normal text-[#C29F5C] bg-[#C29F5C]/10 border border-[#C29F5C]/20 px-2 py-0.5 rounded-full">
                  Hotel Colonos
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Resumen de ingresos, medios de pago y balance de caja chica.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-[#2C2C2E] border border-[#3A3A3C] px-3 py-1.5 rounded-xl">
              <Calendar className="w-3.5 h-3.5 text-[#C29F5C]" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer font-mono"
              />
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-900/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#3A3A3C] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-[#2C2C2E]">
          
          {/* PRINTABLE CONTAINER WRAPPER */}
          <div className="printable-voucher space-y-6">
            
            {/* AUDIT HEADER FOR PRINT */}
            <div className="hidden print:block border-b border-neutral-300 pb-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-black text-neutral-900 uppercase font-serif">HOTEL COLONOS</h1>
                  <p className="text-xs text-neutral-600">INFORME DE CIERRE Y ARQUEO DIARIO DE CAJA</p>
                </div>
                <div className="text-right font-mono text-xs">
                  <div><strong>FECHA DE CIERRE:</strong> {formatDateES(selectedDate)}</div>
                  <div><strong>IMPRESO:</strong> {new Date().toLocaleString('es-CL')}</div>
                </div>
              </div>
            </div>

            {/* NOTIFICATION TOAST IF SAVED */}
            {isSaved && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-3 text-emerald-200 text-xs no-print">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>¡Cierre Guardado Exitosamente!</strong> El arqueo de la jornada {formatDateES(selectedDate)} ha sido auditado y registrado.
                </span>
              </div>
            )}

            {/* KEY SUMMARY KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              
              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Total Recaudado
                  </span>
                  <div className="p-1.5 bg-amber-500/10 text-[#C29F5C] rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-mono font-black text-[#E5E7EB]">
                    {formatCLP(totalRevenueDay)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {paidSales.length} recepciones cobradas hoy
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Ingreso en Efectivo
                  </span>
                  <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-mono font-black text-emerald-400">
                    {formatCLP(totalEfectivo)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    Billete / Moneda en caja
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Egresos / Gastos
                  </span>
                  <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-mono font-black text-rose-400">
                    -{formatCLP(totalEgresosEfectivo)}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-1">
                    {dayExpenses.filter((e) => e.status === 'paid').length} pagos realizados hoy
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#C29F5C]/40 bg-gradient-to-b from-[#1C1C1E] to-[#C29F5C]/10 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-bold text-[#C29F5C] uppercase tracking-wider">
                    Caja Chica Neta
                  </span>
                  <div className="p-1.5 bg-[#C29F5C]/20 text-[#C29F5C] rounded-lg">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-mono font-black text-[#C29F5C]">
                    {formatCLP(cajaChicaBalance)}
                  </div>
                  <div className="text-[10px] text-neutral-300 mt-1">
                    Efectivo real para entrega de turno
                  </div>
                </div>
              </div>

            </div>

            {/* BREAKDOWN BY PAYMENT METHOD */}
            <div className="bg-[#1C1C1E] p-4 sm:p-5 rounded-xl border border-[#3A3A3C] space-y-4">
              <h4 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center gap-2 border-b border-[#3A3A3C] pb-2">
                <CreditCard className="w-4 h-4 text-[#C29F5C]" />
                <span>Desglose por Medio de Pago</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-[#2C2C2E] p-3 rounded-lg border border-[#3A3A3C]">
                  <span className="text-[10px] text-neutral-400 block font-semibold">💵 Efectivo en Recepción</span>
                  <span className="text-base font-mono font-bold text-white mt-1 block">
                    {formatCLP(totalEfectivo)}
                  </span>
                </div>

                <div className="bg-[#2C2C2E] p-3 rounded-lg border border-[#3A3A3C]">
                  <span className="text-[10px] text-neutral-400 block font-semibold">🏦 Transferencias</span>
                  <span className="text-base font-mono font-bold text-sky-400 mt-1 block">
                    {formatCLP(totalTransferencia)}
                  </span>
                </div>

                <div className="bg-[#2C2C2E] p-3 rounded-lg border border-[#3A3A3C]">
                  <span className="text-[10px] text-neutral-400 block font-semibold">💳 Débito / Crédito</span>
                  <span className="text-base font-mono font-bold text-indigo-400 mt-1 block">
                    {formatCLP(totalTarjetas)}
                  </span>
                </div>

                <div className="bg-[#2C2C2E] p-3 rounded-lg border border-[#3A3A3C]">
                  <span className="text-[10px] text-neutral-400 block font-semibold">⚠️ Cuentas por Cobrar</span>
                  <span className="text-base font-mono font-bold text-amber-400 mt-1 block">
                    {formatCLP(totalPendiente)}
                  </span>
                </div>
              </div>
            </div>

            {/* DETAILED TABLES GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* SALES OF THE DAY */}
              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-3">
                <h4 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center justify-between border-b border-[#3A3A3C] pb-2">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Ventas del Día ({daySales.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Subtotal: {formatCLP(totalRevenueDay)}
                  </span>
                </h4>

                {daySales.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">
                    No hay registro de ventas para la fecha seleccionada.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] font-bold text-neutral-400 uppercase border-b border-[#3A3A3C]">
                          <th className="pb-2">Folio / Huésped</th>
                          <th className="pb-2 text-center">Hab.</th>
                          <th className="pb-2">Medio</th>
                          <th className="pb-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A3A3C]">
                        {daySales.map((s) => (
                          <tr key={s.id} className="text-[#E5E7EB]">
                            <td className="py-2">
                              <div className="font-mono font-bold text-white text-[11px]">{s.saleCode}</div>
                              <div className="text-[10px] text-neutral-400 truncate max-w-[120px]">{s.guestName}</div>
                            </td>
                            <td className="py-2 text-center font-mono text-[11px]">
                              {s.roomNumber}
                            </td>
                            <td className="py-2 text-[10px]">
                              <span className="capitalize font-mono bg-[#2C2C2E] px-1.5 py-0.5 rounded border border-[#3A3A3C]">
                                {s.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2 text-right font-mono font-bold text-amber-300">
                              {formatCLP(s.grandTotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* EXPENSES OF THE DAY */}
              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-3">
                <h4 className="text-xs font-bold text-[#E5E7EB] uppercase tracking-wider flex items-center justify-between border-b border-[#3A3A3C] pb-2">
                  <span className="flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>Egresos del Día ({dayExpenses.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">
                    Subtotal: {formatCLP(totalEgresosEfectivo)}
                  </span>
                </h4>

                {dayExpenses.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-4 text-center">
                    No se registraron egresos o gastos en esta jornada.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-[10px] font-bold text-neutral-400 uppercase border-b border-[#3A3A3C]">
                          <th className="pb-2">Concepto</th>
                          <th className="pb-2">Proveedor</th>
                          <th className="pb-2 text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#3A3A3C]">
                        {dayExpenses.map((e) => (
                          <tr key={e.id} className="text-[#E5E7EB]">
                            <td className="py-2 font-medium">{e.title}</td>
                            <td className="py-2 text-neutral-400 text-[10px]">{e.vendor || '-'}</td>
                            <td className="py-2 text-right font-mono font-bold text-rose-300">
                              -{formatCLP(e.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* AUDIT OBSERVATIONS / SIGNATURES FOR PRINT */}
            <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-2 no-print">
              <label className="text-xs font-semibold text-neutral-300 block">
                Observaciones del Arqueo / Recepcionista de Turno
              </label>
              <textarea
                rows={2}
                placeholder="Ingresa notas opcionales para la administración (ej: Diferencia de sencilla, entregado a gerencia $200.000, etc)..."
                value={cashNotes}
                onChange={(e) => setCashNotes(e.target.value)}
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
              />
            </div>

            {/* PRINT SIGNATURE FOOTER */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-10 text-center text-xs">
              <div>
                <div className="border-b border-neutral-400 mb-2 w-3/4 mx-auto"></div>
                <div>Firma Recepcionista Saliente</div>
                <div className="text-[10px] text-neutral-500 font-mono">Entrega de Caja</div>
              </div>
              <div>
                <div className="border-b border-neutral-400 mb-2 w-3/4 mx-auto"></div>
                <div>Firma Recepcionista Entrante / Gerencia</div>
                <div className="text-[10px] text-neutral-500 font-mono">Conformidad de Arqueo</div>
              </div>
            </div>

          </div>

        </div>

        {/* MODAL FOOTER - NO PRINT */}
        <div className="p-4 bg-[#1C1C1E] border-t border-[#3A3A3C] flex items-center justify-between no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-neutral-300 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-[#C29F5C] border border-[#C29F5C]/40 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cierre</span>
            </button>

            <button
              onClick={handleSaveClosing}
              className="px-5 py-2 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-amber-900/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guardar Auditado</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
