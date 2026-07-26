import React, { useState } from 'react';
import { Copy, Check, Database, ShieldAlert, Terminal, Layers } from 'lucide-react';

export const SUPABASE_SQL_SCRIPT = `-- ====================================================================
-- SCRIPT DE BASE DE DATOS HOTEL COLONOS ERP (SUPABASE / POSTGRESQL)
-- Ejecutar en: Supabase Dashboard -> SQL Editor -> New Query
-- IDs de tipo TEXT para compatibilidad total con UUIDs y string keys.
-- ====================================================================

-- 1. TABLA DE HABITACIONES (rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  number VARCHAR(20) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL,
  price_per_night NUMERIC(12, 0) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'available',
  current_guest_name VARCHAR(150),
  current_guest_rut VARCHAR(30),
  current_guest_phone VARCHAR(50),
  check_in_date DATE,
  check_out_date DATE,
  notes TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE CLIENTES Y HUÉSPEDES (customers / guests)
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  rut VARCHAR(30) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  total_visits INT DEFAULT 1,
  total_spent NUMERIC(12, 0) DEFAULT 0,
  is_frequent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.guests (
  id TEXT PRIMARY KEY,
  rut VARCHAR(30) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(50),
  total_visits INT DEFAULT 1,
  total_spent NUMERIC(12, 0) DEFAULT 0,
  is_frequent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE VENTAS Y CHECK-IN (sales)
CREATE TABLE IF NOT EXISTS public.sales (
  id TEXT PRIMARY KEY,
  sale_code VARCHAR(50) UNIQUE NOT NULL,
  guest_id TEXT,
  guest_rut VARCHAR(30) NOT NULL,
  guest_name VARCHAR(200) NOT NULL,
  guest_email VARCHAR(150),
  guest_phone VARCHAR(50),
  vehicle_plate VARCHAR(30),
  invoice_number VARCHAR(50),
  is_frequent_guest BOOLEAN DEFAULT false,
  room_id TEXT,
  room_number VARCHAR(20) NOT NULL,
  room_category VARCHAR(50) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights_count INT NOT NULL DEFAULT 1,
  room_total NUMERIC(12, 0) NOT NULL DEFAULT 0,
  extra_services JSONB DEFAULT '[]'::jsonb,
  grand_total NUMERIC(12, 0) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(50) NOT NULL,
  pending_amount NUMERIC(12, 0) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE GASTOS Y COSTOS (expenses / expendies)
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  vendor VARCHAR(150),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expendies (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  vendor VARCHAR(150),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE INVENTARIO (inventory)
CREATE TABLE IF NOT EXISTS public.inventory (
  id TEXT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock_threshold INT NOT NULL DEFAULT 5,
  unit VARCHAR(30) NOT NULL DEFAULT 'unidades',
  unit_cost NUMERIC(12, 0) DEFAULT 0,
  supplier VARCHAR(150),
  last_restocked DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABLA DE CONFIGURACIONES (settings - arriendo $1.200.000 editable y metas)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración por defecto del arriendo y meta
INSERT INTO public.settings (key, value) VALUES
  ('rent_cost', '{"amount": 1200000}'::jsonb),
  ('profit_goal', '{"target": 12000000}'::jsonb),
  ('authorized_emails', '{"emails": ["hotelcolonos.la@gmail.com", "emiliogalaz09@gmail.com", "quieromyweb.cl@gmail.com"]}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 7. TABLAS DE DEUDAS (accounts_receivable, accounts_payable, debts)
CREATE TABLE IF NOT EXISTS public.accounts_receivable (
  id TEXT PRIMARY KEY,
  entity_name VARCHAR(200) NOT NULL,
  rut_or_phone VARCHAR(50),
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.accounts_payable (
  id TEXT PRIMARY KEY,
  entity_name VARCHAR(200) NOT NULL,
  rut_or_phone VARCHAR(50),
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.debts (
  id TEXT PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  entity_name VARCHAR(200) NOT NULL,
  rut_or_phone VARCHAR(50),
  amount NUMERIC(12, 0) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- DESACTIVACIÓN DE RLS PARA CONEXIÓN DIRECTA Y TIEMPO REAL NATIVO
-- ====================================================================

ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expendies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_receivable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts_payable DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts DISABLE ROW LEVEL SECURITY;

-- ====================================================================
-- PUBLICACIÓN EN REALTIME SUPABASE
-- ====================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.expendies;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customers;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.guests;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts_receivable;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts_payable;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.debts;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tabla ya agregada o publicación no configurada en el proyecto.';
END $$;

-- ====================================================================
-- DATOS INICIALES DE PRUEBA (HABITACIONES Y ARRIENDO)
-- ====================================================================

INSERT INTO public.rooms (id, number, category, price_per_night, status, notes) VALUES
  ('room-101', '101', 'Simple', 45000, 'available', 'Primer piso, cama plaza y media'),
  ('room-102', '102', 'Simple', 45000, 'cleaning', 'Limpieza de salida'),
  ('room-201', '201', 'Doble', 65000, 'occupied', 'Dos camas de 1.5 plazas'),
  ('room-202', '202', 'Doble', 65000, 'available', 'Segundo piso baño remodelado'),
  ('room-301', '301', 'Matrimonial', 85000, 'occupied', 'Cama King incluye desayuno'),
  ('room-302', '302', 'Matrimonial', 85000, 'available', 'Tercer piso aire acondicionado'),
  ('room-401', '401', 'Suite', 140000, 'occupied', 'Suite Ejecutiva Jacuzzi'),
  ('room-402', '402', 'Suite', 140000, 'available', 'Suite De Lujo Vista Panorámica')
ON CONFLICT (number) DO NOTHING;

INSERT INTO public.expenses (id, title, category, subcategory, amount, vendor, notes) VALUES
  ('exp-rent-1', 'Arriendo de Local Comercial', 'fixed', 'arriendo', 1200000, 'Inmobiliaria Los Colonos SpA', 'Costo fijo mensual editable')
ON CONFLICT (id) DO NOTHING;
`;

export const SQLScriptView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#C29F5C]/15 text-[#C29F5C] rounded-xl border border-[#C29F5C]/30">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#E5E7EB] flex items-center gap-2">
                Script SQL para Supabase (PostgreSQL)
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Generador de esquema multi-compatible con IDs <span className="text-[#C29F5C] font-mono">TEXT</span>, 
                desactivación de RLS para sincronización directa y publicación en Realtime.
              </p>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C29F5C] hover:bg-[#b08e4d] text-neutral-950 font-extrabold rounded-xl transition shadow-lg whitespace-nowrap active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-950" />
                <span>¡Copiado al Portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copiar Script SQL</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl flex items-start gap-3">
          <div className="p-2.5 bg-blue-500/15 text-blue-400 rounded-lg shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#E5E7EB] text-xs">1. Abre el Editor SQL</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ingresa a tu proyecto de Supabase, ve al menú lateral y abre <span className="text-neutral-200 font-semibold">SQL Editor</span>.
            </p>
          </div>
        </div>

        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl flex items-start gap-3">
          <div className="p-2.5 bg-[#C29F5C]/15 text-[#C29F5C] rounded-lg shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#E5E7EB] text-xs">2. Pega & Ejecuta</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Pega este script completo y presiona el botón <span className="text-[#C29F5C] font-bold">Run</span> para preparar las tablas.
            </p>
          </div>
        </div>

        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#E5E7EB] text-xs">3. RLS Disabled & Realtime</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Desactiva RLS e inserta las tablas en la publicación <span className="text-emerald-400 font-mono text-[11px]">supabase_realtime</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Code Editor Preview */}
      <div className="bg-[#1C1C1E] border border-[#3A3A3C] rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#2C2C2E] border-b border-[#3A3A3C]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-neutral-300 font-mono ml-2">hotel_colonos_schema.sql</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-[#C29F5C] hover:underline flex items-center gap-1.5 bg-[#C29F5C]/10 px-3 py-1.5 rounded-lg border border-[#C29F5C]/30 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Copiar todo'}</span>
          </button>
        </div>
        <pre className="p-6 text-xs font-mono text-neutral-300 overflow-x-auto max-h-[520px] leading-relaxed select-all">
          {SUPABASE_SQL_SCRIPT}
        </pre>
      </div>
    </div>
  );
};
