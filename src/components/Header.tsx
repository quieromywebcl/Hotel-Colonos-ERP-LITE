import React from 'react';
import { LogOut, Database, Clock, RefreshCw, Radio, Download, Menu } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

interface HeaderProps {
  onLogout: () => void;
  onResetDemoData: () => void;
  onOpenSupaConnection?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  onResetDemoData,
  onOpenSupaConnection,
  onToggleMobileMenu,
}) => {
  const [now, setNow] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNow(
        new Intl.DateTimeFormat('es-CL', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }).format(d)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#2C2C2E] border-b border-[#3A3A3C] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left side: Mobile Menu Trigger & Title */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-neutral-300 hover:text-white bg-[#1C1C1E] rounded-xl border border-[#3A3A3C] shrink-0"
          title="Abrir Menú"
        >
          <Menu className="w-5 h-5 text-[#C29F5C]" />
        </button>

        <h2 className="text-sm sm:text-base font-extrabold text-[#E5E7EB] tracking-wide truncate max-w-[140px] sm:max-w-none">
          Hotel Colonos ERP
        </h2>
        
        <span className="text-[#3A3A3C] hidden sm:inline">|</span>
        
        <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-300 bg-[#1C1C1E] px-3.5 py-1.5 rounded-lg border border-[#3A3A3C]">
          <Clock className="w-4 h-4 text-[#C29F5C]" />
          <span className="capitalize font-semibold">{now || 'Santiago, Chile'}</span>
        </div>

        {/* Realtime Status Badge Button */}
        <button
          onClick={onOpenSupaConnection}
          className="flex items-center gap-1.5 text-[11px] sm:text-xs text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 px-2.5 sm:px-3 py-1.5 rounded-lg border border-emerald-500/40 transition cursor-pointer"
          title="Configurar Conexión Supabase Realtime"
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-emerald-300 hidden sm:inline">Conectado Realtime</span>
          <span className="font-bold text-emerald-300 sm:hidden">Realtime</span>
        </button>
      </div>

      {/* Right side: User & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA & Settings Quick Trigger */}
        <button
          onClick={onOpenSupaConnection}
          title="Instalar App PWA y Whitelist"
          className="hidden md:flex items-center gap-2 text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/80 px-3 py-1.5 rounded-lg border border-purple-500/40 transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-purple-300" />
          <span>App PWA</span>
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 bg-[#1C1C1E] px-2.5 sm:px-3.5 py-1.5 rounded-lg border border-[#3A3A3C]">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#C29F5C]/20 text-[#C29F5C] border border-[#C29F5C]/40 flex items-center justify-center font-bold text-xs shrink-0">
            HC
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-[#E5E7EB] leading-none">Hotel Colonos</div>
            <div className="text-[11px] text-emerald-400 font-mono leading-tight font-semibold">
              Admin
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-lg transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  );
};
