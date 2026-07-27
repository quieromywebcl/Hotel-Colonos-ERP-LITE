import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Receipt,
  Users,
  Wallet,
  Package,
  Code2,
  Hotel,
  ChevronRight,
  ShieldCheck,
  Radio,
  X,
  Menu,
} from 'lucide-react';
import { REQUIRED_ADMIN_EMAIL } from '../lib/utils';

export type TabType =
  | 'dashboard'
  | 'rooms'
  | 'sales'
  | 'crm'
  | 'expenses'
  | 'inventory'
  | 'supa_connection'
  | 'sql_script';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  criticalInventoryCount: number;
  pendingDebtsCount: number;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  criticalInventoryCount,
  pendingDebtsCount,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
  onOpenMobileMenu,
}) => {
  const navItems = [
    {
      id: 'dashboard' as TabType,
      label: 'Dashboard Estratégico',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'rooms' as TabType,
      label: 'Habitaciones',
      icon: BedDouble,
      badge: null,
    },
    {
      id: 'sales' as TabType,
      label: 'Ventas y Recepción',
      icon: Receipt,
      badge: null,
    },
    {
      id: 'crm' as TabType,
      label: 'CRM de Clientes',
      icon: Users,
      badge: null,
    },
    {
      id: 'expenses' as TabType,
      label: 'Control Financiero',
      icon: Wallet,
      badge: pendingDebtsCount > 0 ? `${pendingDebtsCount} Pend.` : null,
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
    {
      id: 'inventory' as TabType,
      label: 'Inventario Suministros',
      icon: Package,
      badge: criticalInventoryCount > 0 ? `! ${criticalInventoryCount}` : null,
      badgeColor: 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30 animate-pulse',
    },
    {
      id: 'supa_connection' as TabType,
      label: 'Conexión Realtime & PWA',
      icon: Radio,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-950 text-emerald-400 border-emerald-500/40',
    },
    {
      id: 'sql_script' as TabType,
      label: 'Script SQL Supabase',
      icon: Code2,
      badge: 'SQL',
      badgeColor: 'bg-zinc-800 text-zinc-400 border-zinc-700',
    },
  ];

  const handleSelectTab = (id: TabType) => {
    setActiveTab(id);
    if (onCloseMobileMenu) onCloseMobileMenu();
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Visible on md screens and up)            */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-72 bg-[#222224] border-r border-[#3A3A3C] flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-20">
        <div className="p-6 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-11 h-11 bg-[#C29F5C] rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <Hotel className="w-6 h-6 text-[#1C1C1E]" />
            </div>
            <div>
              <h1 className="font-extrabold text-[#E5E7EB] tracking-wider text-base leading-tight">
                Hotel Colonos
              </h1>
              <p className="text-xs uppercase tracking-widest text-[#C29F5C] font-bold">
                Admin ERP v2.5
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-[#C29F5C]/15 text-[#C29F5C] font-bold border border-[#C29F5C]/40 shadow-sm'
                      : 'text-neutral-300 hover:text-white hover:bg-[#3A3A3C]/70 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#C29F5C]' : 'text-neutral-400'}`} />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-md border font-mono font-bold ${
                          isActive ? 'bg-[#C29F5C]/25 text-[#C29F5C] border-[#C29F5C]/40' : item.badgeColor
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-4 h-4 text-[#C29F5C]" />}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Info Box */}
        <div className="p-5 border-t border-[#3A3A3C] bg-[#1C1C1E]">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400 uppercase tracking-wider font-bold">
                Cuenta Autorizada
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs font-mono font-bold text-[#C29F5C] truncate">
              {REQUIRED_ADMIN_EMAIL}
            </p>
            <div className="text-xs text-neutral-400 pt-1 flex items-center justify-between">
              <span>Versión 2.5 (SaaS)</span>
              <span className="text-emerald-400 font-bold">• Activo</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE SLIDE-OVER DRAWER (For mobile screens)             */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobileMenu}
          />

          {/* Drawer Panel */}
          <div className="relative w-80 max-w-[85vw] bg-[#222224] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto z-10 border-r border-[#3A3A3C]">
            <div className="space-y-6">
              {/* Header & Close Button */}
              <div className="flex items-center justify-between pb-4 border-b border-[#3A3A3C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#C29F5C] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <Hotel className="w-5 h-5 text-[#1C1C1E]" />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-[#E5E7EB] text-sm">Hotel Colonos</h1>
                    <p className="text-[10px] uppercase text-[#C29F5C] font-bold">ERP Móvil</p>
                  </div>
                </div>
                <button
                  onClick={onCloseMobileMenu}
                  className="p-2 text-neutral-400 hover:text-white bg-[#1C1C1E] rounded-xl border border-[#3A3A3C]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#C29F5C]/20 text-[#C29F5C] font-bold border border-[#C29F5C]/40'
                          : 'text-neutral-300 hover:text-white hover:bg-[#3A3A3C]/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#C29F5C]' : 'text-neutral-400'}`} />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs rounded-md border font-bold ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-[#3A3A3C]">
              <div className="bg-[#1C1C1E] p-3.5 rounded-xl border border-[#3A3A3C] space-y-1">
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Sistemas Supabase</p>
                <p className="text-xs font-mono font-bold text-[#C29F5C] truncate">{REQUIRED_ADMIN_EMAIL}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Smartphone touch bar)       */}
      {/* ========================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#222224]/95 backdrop-blur-md border-t border-[#3A3A3C] z-30 px-2 py-2 flex justify-around items-center">
        <button
          onClick={() => handleSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-[#C29F5C] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          onClick={() => handleSelectTab('rooms')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition cursor-pointer ${
            activeTab === 'rooms' ? 'text-[#C29F5C] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BedDouble className="w-5 h-5" />
          <span className="text-[10px]">Piezas</span>
        </button>

        <button
          onClick={() => handleSelectTab('sales')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition cursor-pointer ${
            activeTab === 'sales' ? 'text-[#C29F5C] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Receipt className="w-5 h-5" />
          <span className="text-[10px]">Ventas</span>
        </button>

        <button
          onClick={() => handleSelectTab('expenses')}
          className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs transition relative cursor-pointer ${
            activeTab === 'expenses' ? 'text-[#C29F5C] font-bold' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Gastos</span>
          {pendingDebtsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500" />
          )}
        </button>

        <button
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-lg text-xs text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
        >
          <Menu className="w-5 h-5 text-[#C29F5C]" />
          <span className="text-[10px] font-bold text-[#C29F5C]">Menú</span>
        </button>
      </div>
    </>
  );
};

