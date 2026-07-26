import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Target,
  PieChart,
  BedDouble,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { Room, Sale, Expense, ProfitGoal, RoomCategory } from '../types';
import { formatCLP } from '../lib/utils';
import { CashClosingModal } from './CashClosingModal';

interface DashboardProps {
  rooms: Room[];
  sales: Sale[];
  expenses: Expense[];
  profitGoal: ProfitGoal;
  onUpdateProfitGoal: (newGoal: number) => void;
  onNavigateTab: (tab: any) => void;
  onOpenQuickSaleModal: () => void;
  onOpenQuickExpenseModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  rooms,
  sales,
  expenses,
  profitGoal,
  onUpdateProfitGoal,
  onNavigateTab,
  onOpenQuickSaleModal,
  onOpenQuickExpenseModal,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoalInput, setTempGoalInput] = useState(profitGoal.monthlyTarget.toString());
  const [showCashClosingModal, setShowCashClosingModal] = useState(false);

  // 1. REVENUE CALCULATIONS (Diario, Semanal, Mensual, Anual)
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Daily Revenue
  const dailyRevenue = sales
    .filter((s) => s.createdAt.startsWith(todayStr))
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // Weekly Revenue (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);
  const weeklyRevenue = sales
    .filter((s) => new Date(s.createdAt) >= sevenDaysAgo)
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // Monthly Revenue (current month)
  const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyRevenue = sales
    .filter((s) => s.createdAt.startsWith(currentMonthYear))
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // Annual Revenue (current year)
  const currentYear = `${now.getFullYear()}`;
  const annualRevenue = sales
    .filter((s) => s.createdAt.startsWith(currentYear))
    .reduce((sum, s) => sum + s.grandTotal, 0);

  // 2. EXPENSES CALCULATIONS (Fixed vs Variable)
  const fixedExpensesTotal = expenses
    .filter((e) => e.category === 'fixed' && e.createdAt.startsWith(currentMonthYear))
    .reduce((sum, e) => sum + e.amount, 0);

  const variableExpensesTotal = expenses
    .filter((e) => e.category === 'variable' && e.createdAt.startsWith(currentMonthYear))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalMonthlyExpenses = fixedExpensesTotal + variableExpensesTotal;

  // 3. NET PROFIT & PROFIT GOAL ANALYSIS
  const netMonthlyProfit = monthlyRevenue - totalMonthlyExpenses;
  const goalTarget = profitGoal.monthlyTarget || 12000000;
  const profitProgressPercent = Math.min(
    100,
    Math.max(0, Math.round((netMonthlyProfit / goalTarget) * 100))
  );

  // 4. BREAK-EVEN POINT ANALYSIS (Punto de Equilibrio)
  // Break-even Sales = Total Operating Expenses required to cover costs before making profit.
  const breakEvenPoint = totalMonthlyExpenses;
  const breakEvenMarginCLP = monthlyRevenue - breakEvenPoint;
  const breakEvenRatioPercent =
    breakEvenPoint > 0 ? Math.round((monthlyRevenue / breakEvenPoint) * 100) : 0;

  // 5. ROOM RACK SUMMARY (4 Main Categories: Simple, Doble, Matrimonial, Suite)
  const categories: RoomCategory[] = ['Simple', 'Doble', 'Matrimonial', 'Suite'];

  const categoryRack = categories.map((cat) => {
    const catRooms = rooms.filter((r) => r.category === cat);
    const available = catRooms.filter((r) => r.status === 'available').length;
    const occupied = catRooms.filter((r) => r.status === 'occupied').length;
    const cleaning = catRooms.filter((r) => r.status === 'cleaning').length;
    return {
      category: cat,
      total: catRooms.length,
      available,
      occupied,
      cleaning,
      roomsList: catRooms,
    };
  });

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(tempGoalInput, 10);
    if (!isNaN(val) && val > 0) {
      onUpdateProfitGoal(val);
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#C29F5C]/15 text-[#C29F5C] border border-[#C29F5C]/30 text-xs font-bold rounded-full uppercase tracking-wider">
              Control General ERP
            </span>
            <span className="text-sm text-neutral-400 font-semibold">• Hotel Colonos</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#E5E7EB] mt-2 tracking-wide">Dashboard Estratégico</h1>
          <p className="text-sm text-neutral-300 mt-1">
            Monitoreo en tiempo real de ventas, utilidad neta, costos fijos y ocupación hotelera.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCashClosingModal(true)}
            className="px-4 py-3 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-[#C29F5C] font-bold text-xs rounded-xl transition border border-[#C29F5C]/40 flex items-center gap-2 cursor-pointer shadow-sm"
            title="Arqueo y Cierre de Caja del Día"
          >
            <Wallet className="w-4.5 h-4.5 text-[#C29F5C]" />
            <span>Cierre de Caja Diario</span>
          </button>
          <button
            onClick={onOpenQuickSaleModal}
            className="px-5 py-3 bg-[#C29F5C] hover:bg-[#B18E4B] active:scale-95 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Registrar Venta / Check-In</span>
          </button>
          <button
            onClick={onOpenQuickExpenseModal}
            className="px-5 py-3 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-neutral-200 font-semibold text-xs rounded-xl transition border border-[#3A3A3C] flex items-center gap-2 cursor-pointer"
          >
            <DollarSign className="w-4.5 h-4.5 text-rose-400" />
            <span>Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* 1. RESUMEN DE INGRESOS (Diario, Semanal, Mensual, Anual) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Diario */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-4 relative overflow-hidden group hover:border-[#C29F5C]/50 transition shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ingresos Hoy</span>
            <span className="p-2.5 bg-[#C29F5C]/15 text-[#C29F5C] rounded-xl border border-[#C29F5C]/30">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#E5E7EB] font-mono tracking-tight">{formatCLP(dailyRevenue)}</div>
          <div className="text-xs text-neutral-300 flex items-center gap-1 font-medium pt-1 border-t border-[#3A3A3C]">
            <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Ventas registradas hoy</span>
          </div>
        </div>

        {/* Semanal */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-4 relative overflow-hidden group hover:border-[#C29F5C]/50 transition shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ingresos Semanales</span>
            <span className="p-2.5 bg-blue-500/15 text-blue-400 rounded-xl border border-blue-500/30">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#E5E7EB] font-mono tracking-tight">{formatCLP(weeklyRevenue)}</div>
          <div className="text-xs text-neutral-300 font-medium pt-1 border-t border-[#3A3A3C]">Últimos 7 días corridos</div>
        </div>

        {/* Mensual */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-4 relative overflow-hidden group hover:border-[#C29F5C]/50 transition shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ingresos del Mes</span>
            <span className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">{formatCLP(monthlyRevenue)}</div>
          <div className="text-xs text-neutral-300 font-medium pt-1 border-t border-[#3A3A3C]">Mes en curso acumulado</div>
        </div>

        {/* Anual */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-4 relative overflow-hidden group hover:border-[#C29F5C]/50 transition shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ingresos Anuales</span>
            <span className="p-2.5 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#E5E7EB] font-mono tracking-tight">{formatCLP(annualRevenue)}</div>
          <div className="text-xs text-neutral-300 font-medium pt-1 border-t border-[#3A3A3C]">Año {now.getFullYear()} Total</div>
        </div>
      </div>

      {/* 2. META DE UTILIDAD Y PUNTO DE EQUILIBRIO (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card A: Meta de Utilidad */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#E5E7EB] text-lg">Meta de Utilidad Neta Mensual</h3>
                <p className="text-xs text-neutral-400 font-medium">Comparativa Utilidad Neta vs. Meta Definida</p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="text-xs text-[#C29F5C] hover:underline font-bold"
            >
              {isEditingGoal ? 'Cancelar' : 'Ajustar Meta'}
            </button>
          </div>

          {/* Form to Edit Goal */}
          {isEditingGoal && (
            <form onSubmit={handleSaveGoal} className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex items-center gap-3">
              <input
                type="number"
                value={tempGoalInput}
                onChange={(e) => setTempGoalInput(e.target.value)}
                placeholder="Meta en CLP ($)"
                className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-lg px-4 py-2 text-sm text-white focus:border-[#C29F5C] outline-none font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#C29F5C] text-white font-bold text-xs rounded-lg hover:bg-[#B18E4B] whitespace-nowrap cursor-pointer"
              >
                Guardar
              </button>
            </form>
          )}

          {/* Values */}
          <div className="grid grid-cols-2 gap-4 bg-[#1C1C1E] p-5 rounded-xl border border-[#3A3A3C]">
            <div>
              <span className="text-xs text-neutral-400 block font-semibold">Utilidad Neta Actual</span>
              <span
                className={`text-2xl lg:text-3xl font-extrabold font-mono mt-1 block ${
                  netMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCLP(netMonthlyProfit)}
              </span>
            </div>
            <div>
              <span className="text-xs text-neutral-400 block font-semibold">Meta Mensual Objetivo</span>
              <span className="text-2xl lg:text-3xl font-extrabold font-mono text-[#C29F5C] mt-1 block">
                {formatCLP(goalTarget)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-neutral-300">Cumplimiento de Meta</span>
              <span className="text-[#C29F5C] font-mono text-base">{profitProgressPercent}%</span>
            </div>

            <div className="w-full h-3.5 bg-[#1C1C1E] border border-[#3A3A3C] rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-[#C29F5C] rounded-full transition-all duration-500"
                style={{ width: `${profitProgressPercent}%` }}
              />
            </div>

            <p className="text-xs text-neutral-400 font-medium leading-relaxed">
              Faltan <span className="text-[#E5E7EB] font-mono font-bold">{formatCLP(Math.max(0, goalTarget - netMonthlyProfit))}</span> para alcanzar la meta establecida para Hotel Colonos este mes.
            </p>
          </div>
        </div>

        {/* Card B: Análisis de Punto de Equilibrio */}
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/15 border border-blue-500/30 text-blue-400 rounded-xl">
                <PieChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#E5E7EB] text-lg">Análisis de Punto de Equilibrio</h3>
                <p className="text-xs text-neutral-400 font-medium">Ingresos Totales vs (Gastos Fijos + Gastos Variables)</p>
              </div>
            </div>
          </div>

          {/* Break-even Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm p-3.5 bg-[#1C1C1E] rounded-xl border border-[#3A3A3C]">
              <span className="text-neutral-300 font-semibold">Punto de Equilibrio Requerido (Gastos Totales)</span>
              <span className="font-mono font-bold text-[#E5E7EB] text-base">{formatCLP(breakEvenPoint)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#3A3A3C]">
                <span className="text-neutral-400 text-xs uppercase font-bold block">Gastos Fijos (Arriendo, etc)</span>
                <span className="font-mono font-bold text-rose-400 text-lg mt-1 block">{formatCLP(fixedExpensesTotal)}</span>
              </div>
              <div className="p-4 bg-[#1C1C1E] rounded-xl border border-[#3A3A3C]">
                <span className="text-neutral-400 text-xs uppercase font-bold block">Gastos Variables</span>
                <span className="font-mono font-bold text-amber-500 text-lg mt-1 block">{formatCLP(variableExpensesTotal)}</span>
              </div>
            </div>

            {/* Status indicator */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
                breakEvenMarginCLP >= 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
              }`}
            >
              {breakEvenMarginCLP >= 0 ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                {breakEvenMarginCLP >= 0 ? (
                  <div>
                    ¡Hotel superó el Punto de Equilibrio! Margen de Seguridad de{' '}
                    <span className="font-mono font-bold underline">{formatCLP(breakEvenMarginCLP)}</span>.
                  </div>
                ) : (
                  <div>
                    Por debajo del Punto de Equilibrio en{' '}
                    <span className="font-mono font-bold underline">{formatCLP(Math.abs(breakEvenMarginCLP))}</span> para cubrir costos.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RACK DE HABITACIONES VISUAL (PANEL DE 4 TARJETAS PRINCIPALES) */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#3A3A3C] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#E5E7EB]">Rack de Habitaciones Principal</h2>
              <p className="text-xs text-neutral-400 font-medium">
                Estado en tiempo real por categoría (Disponible / Ocupada / Limpieza-Mantenimiento)
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-sm text-[#C29F5C] hover:underline font-bold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver Rack Completo Interactivo</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 CATEGORY CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {categoryRack.map((item) => (
            <div
              key={item.category}
              className="bg-[#1C1C1E] border border-[#3A3A3C] p-6 rounded-xl space-y-4 hover:border-[#C29F5C]/40 transition shadow-sm"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
                <span className="font-extrabold text-[#E5E7EB] text-lg tracking-wide">{item.category}</span>
                <span className="text-xs font-mono font-bold text-neutral-300 bg-[#2C2C2E] px-2.5 py-1 rounded border border-[#3A3A3C]">
                  {item.total} Total
                </span>
              </div>

              {/* Status Badges Counts */}
              <div className="space-y-2.5 text-xs font-bold">
                {/* Disponible (Verde) */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span>Disponible</span>
                  </div>
                  <span className="font-mono font-extrabold text-lg">{item.available}</span>
                </div>

                {/* Ocupada (Rojo) */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                    <span>Ocupada</span>
                  </div>
                  <span className="font-mono font-extrabold text-lg">{item.occupied}</span>
                </div>

                {/* Limpieza / Mantenimiento (Ocre/Amber) */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                    <span>Limpieza / Mant.</span>
                  </div>
                  <span className="font-mono font-extrabold text-lg">{item.cleaning}</span>
                </div>
              </div>

              {/* Room numbers list pill badges */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {item.roomsList.map((r) => (
                  <span
                    key={r.id}
                    className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded border ${
                      r.status === 'available'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : r.status === 'occupied'
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    Nº {r.number}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CASH CLOSING MODAL */}
      {showCashClosingModal && (
        <CashClosingModal
          sales={sales}
          expenses={expenses}
          onClose={() => setShowCashClosingModal(false)}
        />
      )}
    </div>
  );
};
