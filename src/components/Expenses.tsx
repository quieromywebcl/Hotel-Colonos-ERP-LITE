import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  ShieldAlert,
  FileSpreadsheet,
} from 'lucide-react';
import { Expense, Debt, ExpenseCategory, ExpenseSubcategory, DebtType } from '../types';
import { formatCLP, formatDateES } from '../lib/utils';
import { exportExpensesToCSV } from '../lib/exportCsv';

interface ExpensesProps {
  expenses: Expense[];
  debts: Debt[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onUpdateDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
}

export const Expenses: React.FC<ExpensesProps> = ({
  expenses,
  debts,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts'>('expenses');

  // Expense Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Expense Form
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('fixed');
  const [expSubcategory, setExpSubcategory] = useState<ExpenseSubcategory>('arriendo');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expStatus, setExpStatus] = useState<'paid' | 'pending'>('paid');
  const [expNotes, setExpNotes] = useState('');

  // Debt Modal state
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  // Debt Form
  const [debtType, setDebtType] = useState<DebtType>('receivable');
  const [debtEntityName, setDebtEntityName] = useState('');
  const [debtRutOrPhone, setDebtRutOrPhone] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [debtDescription, setDebtDescription] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [debtStatus, setDebtStatus] = useState<'pending' | 'paid'>('pending');

  // Open Expense Modal
  const openAddExpenseModal = (category: ExpenseCategory = 'fixed', subcat: ExpenseSubcategory = 'arriendo') => {
    setEditingExpense(null);
    setExpTitle(subcat === 'arriendo' ? 'Arriendo del Local Hotel Colonos' : '');
    setExpCategory(category);
    setExpSubcategory(subcat);
    setExpAmount('');
    setExpVendor('');
    setExpDate(new Date().toISOString().split('T')[0]);
    setExpStatus('paid');
    setExpNotes('');
    setShowExpenseModal(true);
  };

  const openEditExpenseModal = (e: Expense) => {
    setEditingExpense(e);
    setExpTitle(e.title);
    setExpCategory(e.category);
    setExpSubcategory(e.subcategory);
    setExpAmount(e.amount.toString());
    setExpVendor(e.vendor || '');
    setExpDate(e.expenseDate);
    setExpStatus(e.status);
    setExpNotes(e.notes || '');
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle || !expAmount) return;

    const amt = parseInt(expAmount, 10) || 0;

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        title: expTitle,
        category: expCategory,
        subcategory: expSubcategory,
        amount: amt,
        vendor: expVendor,
        expenseDate: expDate,
        status: expStatus,
        notes: expNotes,
      });
    } else {
      onAddExpense({
        title: expTitle,
        category: expCategory,
        subcategory: expSubcategory,
        amount: amt,
        vendor: expVendor,
        expenseDate: expDate,
        status: expStatus,
        notes: expNotes,
      });
    }
    setShowExpenseModal(false);
  };

  // Open Debt Modal
  const openAddDebtModal = (type: DebtType) => {
    setEditingDebt(null);
    setDebtType(type);
    setDebtEntityName('');
    setDebtRutOrPhone('');
    setDebtAmount('');
    setDebtDescription('');
    setDebtDueDate('');
    setDebtStatus('pending');
    setShowDebtModal(true);
  };

  const openEditDebtModal = (d: Debt) => {
    setEditingDebt(d);
    setDebtType(d.type);
    setDebtEntityName(d.entityName);
    setDebtRutOrPhone(d.rutOrPhone || '');
    setDebtAmount(d.amount.toString());
    setDebtDescription(d.description);
    setDebtDueDate(d.dueDate);
    setDebtStatus(d.status);
    setShowDebtModal(true);
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtEntityName || !debtAmount) return;

    const amt = parseInt(debtAmount, 10) || 0;

    if (editingDebt) {
      onUpdateDebt({
        ...editingDebt,
        type: debtType,
        entityName: debtEntityName,
        rutOrPhone: debtRutOrPhone,
        amount: amt,
        description: debtDescription,
        dueDate: debtDueDate,
        status: debtStatus,
      });
    } else {
      onAddDebt({
        type: debtType,
        entityName: debtEntityName,
        rutOrPhone: debtRutOrPhone,
        amount: amt,
        description: debtDescription,
        dueDate: debtDueDate,
        status: debtStatus,
      });
    }
    setShowDebtModal(false);
  };

  // Helper to confirm & delete a debt
  const handleDeleteDebtClick = (d: Debt) => {
    const isReceivable = d.type === 'receivable';
    const label = isReceivable ? 'Cuenta por Cobrar' : 'Cuenta por Pagar';
    if (
      window.confirm(
        `¿Está seguro de eliminar la ${label} de "${d.entityName}" por ${formatCLP(d.amount)}?\n\nEsta acción eliminará permanentemente el registro de la base de datos.`
      )
    ) {
      onDeleteDebt(d.id);
    }
  };

  // Helper to quick toggle debt status
  const handleToggleDebtStatus = (d: Debt) => {
    const nextStatus = d.status === 'paid' ? 'pending' : 'paid';
    onUpdateDebt({
      ...d,
      status: nextStatus,
      paidAt: nextStatus === 'paid' ? new Date().toISOString() : undefined,
    });
  };

  // Find active fixed rent expense or default
  const rentExpense = expenses.find((e) => e.subcategory === 'arriendo');
  const rentAmount = rentExpense ? rentExpense.amount : 3800000;

  const totalFixedExpenses = expenses
    .filter((e) => e.category === 'fixed')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalVariableExpenses = expenses
    .filter((e) => e.category === 'variable')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalReceivables = debts
    .filter((d) => d.type === 'receivable' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalPayables = debts
    .filter((d) => d.type === 'payable' && d.status === 'pending')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#E5E7EB]">Control Financiero - Egresos y Deudas</h1>
              <p className="text-xs text-neutral-300 mt-0.5">
                Separación de Gastos Fijos (Arriendo, Sueldos), Gastos Variables, Cuentas por Cobrar y Pagar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => exportExpensesToCSV(expenses)}
              className="px-4 py-3 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-emerald-400 border border-emerald-500/40 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
              title="Exportar egresos a formato Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Excel / CSV</span>
            </button>

            <button
              onClick={() => openAddExpenseModal('fixed', 'arriendo')}
              className="px-5 py-3 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Gasto</span>
            </button>
            <button
              onClick={() => openAddDebtModal('receivable')}
              className="px-4 py-3 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-neutral-200 font-semibold text-xs rounded-xl transition border border-[#3A3A3C] flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Registrar Deuda / Fiado</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-[#3A3A3C]">
          {/* Gastos Fijos */}
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-rose-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-300 font-bold uppercase tracking-wider">
              <span>Gastos Fijos Totales</span>
              <Building className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 font-mono">
              {formatCLP(totalFixedExpenses)}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium">
              ¡Incluye Arriendo ($3.8M) y Sueldos!
            </div>
          </div>

          {/* Gastos Variables */}
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#C29F5C]/40 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-300 font-bold uppercase tracking-wider">
              <span>Gastos Variables</span>
              <DollarSign className="w-4 h-4 text-[#C29F5C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#C29F5C] font-mono">
              {formatCLP(totalVariableExpenses)}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium">Mercadería, reparaciones e insumos</div>
          </div>

          {/* Cuentas por Cobrar */}
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-emerald-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-300 font-bold uppercase tracking-wider">
              <span>Cuentas por Cobrar</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono">
              {formatCLP(totalReceivables)}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium">Saldos pendientes a favor de Hotel</div>
          </div>

          {/* Cuentas por Pagar */}
          <div className="bg-[#1C1C1E] p-4 rounded-xl border border-purple-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-300 font-bold uppercase tracking-wider">
              <span>Cuentas por Pagar</span>
              <ArrowDownRight className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-extrabold text-purple-400 font-mono">
              {formatCLP(totalPayables)}
            </div>
            <div className="text-[11px] text-neutral-400 font-medium">Facturas y servicios pendientes</div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-[#3A3A3C] pb-2">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'expenses'
              ? 'bg-[#C29F5C] text-white shadow-md'
              : 'text-neutral-300 hover:text-white bg-[#2C2C2E] border border-[#3A3A3C]'
          }`}
        >
          Egresos y Gastos ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('debts')}
          className={`px-5 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'debts'
              ? 'bg-[#C29F5C] text-white shadow-md'
              : 'text-neutral-300 hover:text-white bg-[#2C2C2E] border border-[#3A3A3C]'
          }`}
        >
          Cuentas por Cobrar y Pagar ({debts.length})
        </button>
      </div>

      {/* TAB 1: EXPENSES LIST */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* PRIORITY HIGH LIGHT CARD: ARRIENDO DEL LOCAL */}
          <div className="bg-[#2C2C2E] border-2 border-[#C29F5C]/60 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-[#C29F5C]/20 text-[#C29F5C] rounded-xl border border-[#C29F5C]/40 shrink-0">
                <Building className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-[#C29F5C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase font-mono tracking-wider">
                    ¡COSTO FIJO EDITABLE DE ARRIENDO!
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#E5E7EB] mt-1.5">
                  Arriendo del Local Hotel Colonos
                </h3>
                <p className="text-xs text-neutral-300 mt-0.5">
                  Compromiso contractual mensual. Modifica el monto para recalcular automáticamente el punto de equilibrio.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 font-mono shrink-0">
              <div className="text-xs text-neutral-300 font-medium">Monto Mensual Fijo</div>
              <div className="text-3xl font-extrabold text-[#C29F5C]">
                {formatCLP(rentAmount)}
              </div>
              <button
                onClick={() => {
                  if (rentExpense) {
                    openEditExpenseModal(rentExpense);
                  } else {
                    openAddExpenseModal('fixed', 'arriendo');
                  }
                }}
                className="px-4 py-2 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Costo de Arriendo</span>
              </button>
            </div>
          </div>

          {/* TABLE OF EXPENSES */}
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead className="bg-[#1C1C1E] border-b border-[#3A3A3C] text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Concepto / Proveedor</th>
                    <th className="py-4 px-4">Categoría</th>
                    <th className="py-4 px-4">Subcategoría</th>
                    <th className="py-4 px-4">Monto (CLP)</th>
                    <th className="py-4 px-4">Fecha</th>
                    <th className="py-4 px-4">Estado</th>
                    <th className="py-4 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3C]">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-[#3A3A3C]/40 transition">
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#E5E7EB] text-sm flex items-center gap-1.5">
                          <span>{e.title}</span>
                          {e.subcategory === 'arriendo' && (
                            <span className="bg-[#C29F5C] text-white font-extrabold text-[9px] px-2 py-0.5 rounded font-mono">
                              PRIORIDAD
                            </span>
                          )}
                        </div>
                        {e.vendor && <div className="text-xs text-neutral-400 mt-0.5">{e.vendor}</div>}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
                            e.category === 'fixed'
                              ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {e.category === 'fixed' ? 'Gasto Fijo' : 'Gasto Variable'}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-mono uppercase text-xs text-neutral-200">
                        {e.subcategory}
                      </td>

                      <td className="py-4 px-4 font-mono font-extrabold text-[#E5E7EB] text-base">
                        {formatCLP(e.amount)}
                      </td>

                      <td className="py-4 px-4 font-mono text-neutral-300">
                        {formatDateES(e.expenseDate)}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded border ${
                            e.status === 'paid'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {e.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditExpenseModal(e)}
                            className="p-2 text-neutral-400 hover:text-[#C29F5C] hover:bg-[#3A3A3C] rounded-lg transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(e.id)}
                            className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-[#3A3A3C] rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DEBTS (CUENTAS POR COBRAR Y POR PAGAR) */}
      {activeTab === 'debts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Cuentas por Cobrar (Huéspedes) */}
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-[#E5E7EB] text-lg">Cuentas por Cobrar (Huéspedes)</h3>
              </div>
              <button
                onClick={() => openAddDebtModal('receivable')}
                className="px-3.5 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 text-xs font-bold rounded-lg cursor-pointer"
              >
                + Por Cobrar
              </button>
            </div>

            <div className="space-y-3">
              {debts
                .filter((d) => d.type === 'receivable')
                .map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="font-extrabold text-[#E5E7EB] text-sm flex items-center gap-2">
                        <span>{d.entityName}</span>
                        {d.rutOrPhone && (
                          <span className="text-[10px] bg-[#2C2C2E] text-neutral-400 px-2 py-0.5 rounded font-mono">
                            {d.rutOrPhone}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-300">{d.description}</div>
                      <div className="text-xs text-neutral-400 font-mono">
                        Vence: {formatDateES(d.dueDate)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="font-mono font-extrabold text-emerald-400 text-base">
                        {formatCLP(d.amount)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => openEditDebtModal(d)}
                          className="px-2.5 py-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-neutral-200 border border-[#3A3A3C] font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Editar monto, fecha o descripción"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#C29F5C]" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDebtClick(d)}
                          className="px-2 py-1 bg-[#2C2C2E] hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Eliminar de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Eliminar</span>
                        </button>
                        <button
                          onClick={() => handleToggleDebtStatus(d)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                            d.status === 'paid'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {d.status === 'paid' ? 'Pagado' : 'Marcar Pagado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Cuentas por Pagar (Proveedores) */}
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-5 h-5 text-purple-400" />
                <h3 className="font-extrabold text-[#E5E7EB] text-lg">Cuentas por Pagar (Proveedores)</h3>
              </div>
              <button
                onClick={() => openAddDebtModal('payable')}
                className="px-3.5 py-1.5 bg-purple-950/80 text-purple-300 border border-purple-500/40 hover:bg-purple-900 text-xs font-bold rounded-lg cursor-pointer"
              >
                + Por Pagar
              </button>
            </div>

            <div className="space-y-3">
              {debts
                .filter((d) => d.type === 'payable')
                .map((d) => (
                  <div
                    key={d.id}
                    className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="font-extrabold text-[#E5E7EB] text-sm flex items-center gap-2">
                        <span>{d.entityName}</span>
                        {d.rutOrPhone && (
                          <span className="text-[10px] bg-[#2C2C2E] text-neutral-400 px-2 py-0.5 rounded font-mono">
                            {d.rutOrPhone}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-300">{d.description}</div>
                      <div className="text-xs text-neutral-400 font-mono">
                        Vence: {formatDateES(d.dueDate)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="font-mono font-extrabold text-purple-400 text-base">
                        {formatCLP(d.amount)}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => openEditDebtModal(d)}
                          className="px-2.5 py-1 bg-[#2C2C2E] hover:bg-[#3A3A3C] text-neutral-200 border border-[#3A3A3C] font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Editar monto, fecha o descripción"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#C29F5C]" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDebtClick(d)}
                          className="px-2 py-1 bg-[#2C2C2E] hover:bg-rose-950/60 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="Eliminar de la base de datos"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>Eliminar</span>
                        </button>
                        <button
                          onClick={() => handleToggleDebtStatus(d)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                            d.status === 'paid'
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {d.status === 'paid' ? 'Pagado' : 'Marcar Pagado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingExpense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}</span>
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-neutral-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Concepto del Gasto</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Arriendo del local / Sueldos / Luz"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Tipo de Gasto</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="fixed">Gasto Fijo (Prioridad)</option>
                    <option value="variable">Gasto Variable</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Subcategoría</label>
                  <select
                    value={expSubcategory}
                    onChange={(e) => setExpSubcategory(e.target.value as ExpenseSubcategory)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="arriendo">Arriendo del Local (Alta Prioridad)</option>
                    <option value="sueldos">Sueldos y Nómina</option>
                    <option value="luz">Luz y Energía</option>
                    <option value="agua">Agua Potable</option>
                    <option value="internet">Internet + TV</option>
                    <option value="gas">Gas Industrial</option>
                    <option value="mercaderia">Mercadería e Insumos</option>
                    <option value="reparaciones">Reparaciones Mantenimiento</option>
                    <option value="otro">Otro Gasto</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Monto (CLP)</label>
                  <input
                    type="number"
                    required
                    placeholder="3800000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Proveedor / Beneficiario</label>
                  <input
                    type="text"
                    placeholder="ej: Inmobiliaria Los Colonos"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Estado</label>
                  <select
                    value={expStatus}
                    onChange={(e) => setExpStatus(e.target.value as any)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente por Pagar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A3A3C]">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C29F5C] text-white font-bold text-xs rounded-xl hover:bg-[#B18E4B] cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  {editingExpense ? 'Guardar Cambios' : 'Registrar Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT DEBT MODAL */}
      {showDebtModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingDebt ? 'Editar Cuenta' : 'Registrar Cuenta / Deuda'}</span>
              </h3>
              <button onClick={() => setShowDebtModal(false)} className="text-neutral-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleDebtSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Tipo de Deuda</label>
                <select
                  value={debtType}
                  onChange={(e) => setDebtType(e.target.value as DebtType)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                >
                  <option value="receivable">Cuenta por Cobrar (Huésped / Cliente debe a Hotel)</option>
                  <option value="payable">Cuenta por Pagar (Hotel debe a Proveedor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre Entidad / Persona</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Empresas Turísticas / Carlos Mendoza"
                  value={debtEntityName}
                  onChange={(e) => setDebtEntityName(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Monto (CLP)</label>
                  <input
                    type="number"
                    required
                    placeholder="450000"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Fecha Vencimiento</label>
                  <input
                    type="date"
                    required
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Descripción / Glosa</label>
                <textarea
                  rows={2}
                  placeholder="Detalle de la cuenta o servicio pendiente..."
                  value={debtDescription}
                  onChange={(e) => setDebtDescription(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Estado</label>
                <select
                  value={debtStatus}
                  onChange={(e) => setDebtStatus(e.target.value as any)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                >
                  <option value="pending">Pendiente por Cobrar/Pagar</option>
                  <option value="paid">Saldado / Pagado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A3A3C]">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C29F5C] text-white font-bold text-xs rounded-xl hover:bg-[#B18E4B] cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  {editingDebt ? 'Guardar Cambios' : 'Registrar Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
