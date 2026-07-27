import React, { useState } from 'react';
import {
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Sparkles,
  Calendar as CalendarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  History,
  Info,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  Wrench,
  AlertTriangle,
} from 'lucide-react';
import { Room, RoomCategory, RoomStatus, Sale } from '../types';
import { formatCLP, formatDateES } from '../lib/utils';

interface RoomRackProps {
  rooms: Room[];
  sales?: Sale[];
  onAddRoom: (room: Omit<Room, 'id'>) => void;
  onUpdateRoom: (room: Room) => void;
  onDeleteRoom: (id: string) => void;
  onQuickCheckIn: (room: Room) => void;
}

export const RoomRack: React.FC<RoomRackProps> = ({
  rooms,
  sales = [],
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onQuickCheckIn,
}) => {
  const [activeViewMode, setActiveViewMode] = useState<'rack' | 'calendar'>('rack');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. HISTORICAL CALENDAR NAVIGATION STATE
  const [currentDateView, setCurrentDateView] = useState<Date>(new Date());
  const [calendarRangeDays, setCalendarRangeDays] = useState<number>(7); // 7 days (1 week) or 14 days
  const [selectedHistoricalStay, setSelectedHistoricalStay] = useState<Sale | null>(null);

  // Modal State for Add / Edit Room
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  // Form Fields
  const [roomNumber, setRoomNumber] = useState('');
  const [roomCategory, setRoomCategory] = useState<RoomCategory>('Simple');
  const [pricePerNight, setPricePerNight] = useState('45000');
  const [status, setStatus] = useState<RoomStatus>('available');
  const [notes, setNotes] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // ----------------------------------------------------
  // CALENDAR DATE NAVIGATION HELPERS
  // ----------------------------------------------------
  const handlePrevPeriod = () => {
    const newDate = new Date(currentDateView);
    newDate.setDate(newDate.getDate() - calendarRangeDays);
    setCurrentDateView(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDateView);
    newDate.setDate(newDate.getDate() + calendarRangeDays);
    setCurrentDateView(newDate);
  };

  const handleToday = () => {
    setCurrentDateView(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      setCurrentDateView(new Date(y, m - 1, d));
    }
  };

  // Generate Array of dates for the visible calendar period
  const getVisibleDates = (): Date[] => {
    const dates: Date[] = [];
    const start = new Date(currentDateView);
    // Align to start date
    for (let i = 0; i < calendarRangeDays; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const visibleDates = getVisibleDates();

  const startDateStr = visibleDates[0]?.toISOString().split('T')[0] || '';
  const endDateStr = visibleDates[visibleDates.length - 1]?.toISOString().split('T')[0] || '';

  // Format YYYY-MM-DD helper
  const toISODate = (d: Date) => d.toISOString().split('T')[0];

  // Get matching stay (sale) for a specific room number on a specific day string
  const getStayForRoomAndDate = (roomNum: string, dateStr: string): Sale | undefined => {
    return sales.find(
      (s) =>
        s.roomNumber === roomNum &&
        dateStr >= s.checkInDate &&
        dateStr <= (s.checkOutDate || s.checkInDate)
    );
  };

  // Compute Total Historical Occupancy Stats for the visible period
  const totalSlots = rooms.length * visibleDates.length;
  let occupiedSlotsCount = 0;
  let totalPeriodRevenue = 0;

  visibleDates.forEach((d) => {
    const dStr = toISODate(d);
    rooms.forEach((r) => {
      const stay = getStayForRoomAndDate(r.number, dStr);
      if (stay) {
        occupiedSlotsCount++;
      } else if (dStr === toISODate(new Date()) && r.status === 'occupied') {
        occupiedSlotsCount++;
      }
    });
  });

  // Calculate period sales total
  sales.forEach((s) => {
    if (
      (s.checkInDate >= startDateStr && s.checkInDate <= endDateStr) ||
      (s.checkOutDate >= startDateStr && s.checkOutDate <= endDateStr)
    ) {
      totalPeriodRevenue += s.grandTotal;
    }
  });

  const periodOccupancyPercent =
    totalSlots > 0 ? Math.round((occupiedSlotsCount / totalSlots) * 100) : 0;

  // ----------------------------------------------------
  // ROOM CRUD HANDLERS
  // ----------------------------------------------------
  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setRoomCategory('Simple');
    setPricePerNight('45000');
    setStatus('available');
    setNotes('');
    setMaintenanceNotes('');
    setShowModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setRoomNumber(room.number || '');
    setRoomCategory(room.category || 'Simple');
    setPricePerNight(Number((room as any).daily_rate || (room as any).price_per_night || room.pricePerNight || (room as any).price || 35000).toString());
    setStatus(room.status || 'available');
    setNotes(room.notes || '');
    setMaintenanceNotes(room.maintenanceNotes || '');
    setShowModal(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber) return;

    const price = parseInt(pricePerNight, 10) || 35000;

    if (editingRoom) {
      onUpdateRoom({
        ...editingRoom,
        number: roomNumber,
        category: roomCategory,
        pricePerNight: price,
        status,
        notes,
        maintenanceNotes: status === 'maintenance' ? maintenanceNotes : undefined,
      });
    } else {
      onAddRoom({
        number: roomNumber,
        category: roomCategory,
        pricePerNight: price,
        status,
        notes,
        maintenanceNotes: status === 'maintenance' ? maintenanceNotes : undefined,
      });
    }
    setShowModal(false);
  };

  const handleStatusToggle = (room: Room, newStatus: RoomStatus) => {
    if (newStatus === 'available') {
      onUpdateRoom({
        ...room,
        status: 'available',
        currentGuestName: undefined,
        currentGuestRut: undefined,
        currentGuestPhone: undefined,
        checkInDate: undefined,
        checkOutDate: undefined,
        maintenanceNotes: undefined,
      });
    } else {
      onUpdateRoom({
        ...room,
        status: newStatus,
      });
    }
  };

  // Filter Logic with null safety
  const filteredRooms = rooms.filter((r) => {
    const matchesCat = filterCategory === 'all' || r.category === filterCategory;
    const matchesStat = filterStatus === 'all' || r.status === filterStatus;
    const num = (r.number || '').toString().toLowerCase();
    const guest = (r.currentGuestName || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = num.includes(query) || guest.includes(query);
    return matchesCat && matchesStat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* TOP HEADER & MODE SWITCHER */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <BedDouble className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#E5E7EB]">Rack y Calendario de Habitaciones</h1>
              <p className="text-xs text-neutral-300 mt-0.5">
                Control gráfico en vivo y navegación hacia el historial de ocupación hotelera.
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs + Add Room */}
          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="bg-[#1C1C1E] p-1.5 rounded-xl border border-[#3A3A3C] flex items-center gap-1">
              <button
                onClick={() => setActiveViewMode('rack')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeViewMode === 'rack'
                    ? 'bg-[#C29F5C] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <BedDouble className="w-4 h-4" />
                <span>Rack en Vivo</span>
              </button>

              <button
                onClick={() => setActiveViewMode('calendar')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeViewMode === 'calendar'
                    ? 'bg-[#C29F5C] text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Calendario Histórico</span>
              </button>
            </div>

            <button
              onClick={openAddModal}
              className="px-5 py-2.5 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Habitación</span>
            </button>
          </div>
        </div>

        {/* CONTROLES DE NAVEGACIÓN HISTÓRICA CALENDARIO (When in Calendar Mode) */}
        {activeViewMode === 'calendar' && (
          <div className="bg-[#1C1C1E] p-5 rounded-xl border border-[#3A3A3C] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#3A3A3C] pb-4">
              {/* Range Navigation Controls */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  onClick={handlePrevPeriod}
                  className="px-3.5 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3A3A3C] text-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Navegar período anterior"
                >
                  <ChevronLeft className="w-4 h-4 text-[#C29F5C]" />
                  <span>Anterior ({calendarRangeDays}d)</span>
                </button>

                <button
                  onClick={handleToday}
                  className="px-3.5 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3A3A3C] text-[#C29F5C] font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Ir a Fecha Actual (Hoy)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Hoy</span>
                </button>

                <button
                  onClick={handleNextPeriod}
                  className="px-3.5 py-2 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3A3A3C] text-neutral-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  title="Navegar período siguiente"
                >
                  <span>Siguiente ({calendarRangeDays}d)</span>
                  <ChevronRight className="w-4 h-4 text-[#C29F5C]" />
                </button>

                {/* DatePicker Selector */}
                <div className="flex items-center gap-2 bg-[#2C2C2E] px-3 py-1.5 rounded-xl border border-[#3A3A3C]">
                  <CalendarIcon className="w-4 h-4 text-[#C29F5C]" />
                  <input
                    type="date"
                    value={toISODate(currentDateView)}
                    onChange={handleDateInputChange}
                    className="bg-transparent text-xs text-white outline-none cursor-pointer font-mono font-bold"
                  />
                </div>
              </div>

              {/* Range Days Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-semibold">Vista:</span>
                <button
                  onClick={() => setCalendarRangeDays(7)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    calendarRangeDays === 7
                      ? 'bg-[#C29F5C] text-white'
                      : 'bg-[#2C2C2E] text-neutral-400 hover:text-white'
                  }`}
                >
                  7 Días (Semana)
                </button>
                <button
                  onClick={() => setCalendarRangeDays(14)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    calendarRangeDays === 14
                      ? 'bg-[#C29F5C] text-white'
                      : 'bg-[#2C2C2E] text-neutral-400 hover:text-white'
                  }`}
                >
                  14 Días
                </button>
              </div>
            </div>

            {/* Historical Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-[#2C2C2E] rounded-xl border border-[#3A3A3C] flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Rango Consultado:</span>
                <span className="font-mono font-bold text-[#E5E7EB]">
                  {formatDateES(startDateStr)} → {formatDateES(endDateStr)}
                </span>
              </div>

              <div className="p-3 bg-[#2C2C2E] rounded-xl border border-[#3A3A3C] flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Ocupación del Período:</span>
                <span className="font-mono font-bold text-[#C29F5C] text-sm">
                  {periodOccupancyPercent}% ({occupiedSlotsCount} de {totalSlots} noche/hab)
                </span>
              </div>

              <div className="p-3 bg-[#2C2C2E] rounded-xl border border-[#3A3A3C] flex items-center justify-between">
                <span className="text-neutral-400 font-semibold">Ventas del Período:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCLP(totalPeriodRevenue)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar (When in Rack Mode) */}
        {activeViewMode === 'rack' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#3A3A3C]">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Buscar Nº Habitación o Huésped..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#3A3A3C] focus:border-[#C29F5C] rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>

            <div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#3A3A3C] focus:border-[#C29F5C] rounded-xl py-2.5 px-3 text-xs text-neutral-200 outline-none"
              >
                <option value="all">Todas las Categorías</option>
                <option value="Simple">Simple</option>
                <option value="Doble">Doble</option>
                <option value="Matrimonial">Matrimonial</option>
                <option value="Suite">Suite</option>
              </select>
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-[#1C1C1E] border border-[#3A3A3C] focus:border-[#C29F5C] rounded-xl py-2.5 px-3 text-xs text-neutral-200 outline-none"
              >
                <option value="all">Todos los Estados</option>
                <option value="available">Disponible (Verde)</option>
                <option value="occupied">Ocupada (Rojo)</option>
                <option value="cleaning">Limpieza (Ocre)</option>
                <option value="maintenance">⚙️ Fuera de Servicio / Mantenimiento (Gris)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* VISTA 1: CALENDARIO HISTÓRICO GANTT                  */}
      {/* ---------------------------------------------------- */}
      {activeViewMode === 'calendar' && (
        <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-6 rounded-2xl shadow-xl space-y-4 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#3A3A3C]">
            <h2 className="text-lg font-extrabold text-[#E5E7EB] flex items-center gap-2">
              <History className="w-5 h-5 text-[#C29F5C]" />
              <span>Matriz Histórica de Ocupación por Habitación</span>
            </h2>
            <span className="text-xs text-neutral-400">
              Haz clic en cualquier estada histórica para auditar los detalles del registro.
            </span>
          </div>

          {/* Timeline Grid Container */}
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[#3A3A3C]">
                  <th className="p-3 text-xs font-bold text-neutral-400 bg-[#1C1C1E] w-36 rounded-tl-xl">
                    Habitación
                  </th>
                  {visibleDates.map((dateObj) => {
                    const dateStr = toISODate(dateObj);
                    const isTodayStr = dateStr === toISODate(new Date());
                    const dayName = dateObj.toLocaleDateString('es-CL', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('es-CL', { month: 'short' });

                    return (
                      <th
                        key={dateStr}
                        className={`p-2.5 text-center text-xs font-bold border-l border-[#3A3A3C] min-w-[100px] ${
                          isTodayStr ? 'bg-[#C29F5C]/20 text-[#C29F5C]' : 'bg-[#1C1C1E] text-neutral-300'
                        }`}
                      >
                        <div className="capitalize">{dayName}</div>
                        <div className="font-mono text-sm font-extrabold">{dayNum} {monthName}</div>
                        {isTodayStr && (
                          <span className="text-[9px] uppercase tracking-wider bg-[#C29F5C] text-white px-1.5 py-0.2 rounded font-extrabold block mt-0.5">
                            HOY
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3A3A3C]">
                {rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-[#1C1C1E]/50 transition">
                    {/* Room Info Left Column */}
                    <td className="p-3 bg-[#1C1C1E] border-r border-[#3A3A3C]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-[#E5E7EB] text-sm">
                          Nº {room.number}
                        </span>
                        <span className="text-[10px] font-bold bg-[#2C2C2E] text-[#C29F5C] px-2 py-0.5 rounded border border-[#3A3A3C]">
                          {room.category}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-neutral-400 mt-1">
                        {formatCLP(Number((room as any).daily_rate || (room as any).price_per_night || room.pricePerNight || (room as any).price || 35000))}/noche
                      </div>
                    </td>

                    {/* Timeline Day Cells */}
                    {visibleDates.map((dateObj) => {
                      const dateStr = toISODate(dateObj);
                      const stay = getStayForRoomAndDate(room.number, dateStr);

                      const isLiveToday = dateStr === toISODate(new Date());
                      const isOccupiedToday = isLiveToday && room.status === 'occupied';
                      const isCleaningToday = isLiveToday && room.status === 'cleaning';

                      return (
                        <td
                          key={dateStr}
                          className="p-1.5 text-center border-l border-[#3A3A3C] vertical-top"
                        >
                          {stay ? (
                            <button
                              onClick={() => setSelectedHistoricalStay(stay)}
                              className="w-full text-left bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 p-2 rounded-lg text-[11px] text-rose-200 shadow-md transition cursor-pointer"
                              title="Ver detalle del registro de venta"
                            >
                              <div className="font-extrabold truncate text-white">{stay.guestName}</div>
                              <div className="text-[10px] font-mono text-rose-300 truncate">
                                RUT: {stay.guestRut}
                              </div>
                              <div className="text-[9px] font-mono text-amber-300 font-bold mt-1">
                                {formatCLP(stay.grandTotal)}
                              </div>
                            </button>
                          ) : isOccupiedToday ? (
                            <div className="bg-rose-950/80 border border-rose-500/50 p-2 rounded-lg text-[11px] text-rose-200 font-bold">
                              <div className="truncate">{room.currentGuestName || 'Huésped Actual'}</div>
                              <div className="text-[9px] uppercase text-rose-400">Ocupada Hoy</div>
                            </div>
                          ) : isCleaningToday ? (
                            <div className="bg-amber-950/80 border border-amber-500/50 p-2 rounded-lg text-[11px] text-amber-200 font-bold">
                              <div>Limpieza / Mant.</div>
                            </div>
                          ) : (
                            <div className="bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-lg text-[10px] text-emerald-400 font-medium">
                              Disponible
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* VISTA 2: RACK DE TARJETAS TRADICIONAL (EN VIVO)      */}
      {/* ---------------------------------------------------- */}
      {activeViewMode === 'rack' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredRooms.map((room) => {
            const isAvailable = room.status === 'available';
            const isOccupied = room.status === 'occupied';
            const isCleaning = room.status === 'cleaning';
            const isMaintenance = room.status === 'maintenance';

            return (
              <div
                key={room.id}
                className={`bg-[#2C2C2E] border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between transition-all duration-200 shadow-xl ${
                  isAvailable
                    ? 'border-emerald-500/40 hover:border-emerald-500/70'
                    : isOccupied
                    ? 'border-rose-500/40 hover:border-rose-500/70'
                    : isCleaning
                    ? 'border-amber-500/40 hover:border-amber-500/70'
                    : 'border-slate-500/50 bg-slate-900/30 hover:border-slate-400'
                }`}
              >
                {/* Header: Room Number & Category */}
                <div>
                  <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold font-mono text-[#E5E7EB]">
                        Hab. {room.number}
                      </span>
                      <span className="text-xs font-bold bg-[#1C1C1E] text-[#C29F5C] border border-[#C29F5C]/40 px-2.5 py-0.5 rounded-full">
                        {room.category}
                      </span>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(room)}
                        className="p-2 text-neutral-400 hover:text-[#C29F5C] rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                        title="Editar Habitación"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRoom(room.id)}
                        className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                        title="Eliminar Habitación"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price & Status Pill */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="text-sm font-mono font-extrabold text-[#E5E7EB]">
                      {formatCLP(Number((room as any).daily_rate || (room as any).price_per_night || room.pricePerNight || (room as any).price || 35000))}{' '}
                      <span className="text-xs text-neutral-400 font-normal">/ noche</span>
                    </div>

                    <div
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        isAvailable
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : isOccupied
                          ? 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                          : isCleaning
                          ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-600'
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isAvailable
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                            : isOccupied
                            ? 'bg-rose-400 shadow-sm shadow-rose-400'
                            : isCleaning
                            ? 'bg-amber-400 shadow-sm shadow-amber-400'
                            : 'bg-slate-400 shadow-sm shadow-slate-400'
                        }`}
                      />
                      <span>
                        {isAvailable
                          ? 'Disponible'
                          : isOccupied
                          ? 'Ocupada'
                          : isCleaning
                          ? 'Limpieza'
                          : '⚙️ Fuera de Servicio'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Occupant Detail (if occupied) */}
                {isOccupied && (
                  <div className="bg-[#1C1C1E] p-3.5 rounded-xl border border-rose-500/30 space-y-1.5 text-xs text-neutral-300">
                    <div className="flex items-center justify-between font-bold text-[#E5E7EB] text-sm">
                      <span>{room.currentGuestName || 'Huésped Hospedado'}</span>
                      <UserCheck className="w-4 h-4 text-rose-400" />
                    </div>
                    {room.currentGuestRut && (
                      <div className="text-xs text-neutral-400 font-mono">
                        RUT: {room.currentGuestRut}
                      </div>
                    )}
                    {room.checkInDate && (
                      <div className="text-xs text-neutral-400 flex items-center gap-1 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#C29F5C]" />
                        <span>
                          {formatDateES(room.checkInDate)} → {formatDateES(room.checkOutDate || '')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Maintenance Detail (if in maintenance) */}
                {isMaintenance && (
                  <div className="bg-[#1C1C1E] p-3.5 rounded-xl border border-slate-600/50 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2 font-bold text-slate-200 text-xs">
                      <Wrench className="w-4 h-4 text-slate-400" />
                      <span>Fuera de Servicio / Mantenimiento</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">
                      "{room.maintenanceNotes || 'Reparaciones generales en curso'}"
                    </p>
                  </div>
                )}

                {/* Notes if available or cleaning */}
                {!isOccupied && !isMaintenance && room.notes && (
                  <div className="text-xs text-neutral-300 italic bg-[#1C1C1E] p-3 rounded-xl border border-[#3A3A3C]">
                    "{room.notes}"
                  </div>
                )}

                {/* Action Bar */}
                <div className="pt-2 border-t border-[#3A3A3C] space-y-2">
                  {isAvailable && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <button
                        onClick={() => onQuickCheckIn(room)}
                        className="w-full py-2.5 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Check-In</span>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(room, 'maintenance')}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-600 cursor-pointer"
                        title="Bloquear para Mantenimiento"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mantención</span>
                      </button>
                    </div>
                  )}

                  {isOccupied && (
                    <button
                      onClick={() => handleStatusToggle(room, 'cleaning')}
                      className="w-full py-2.5 bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/40 text-amber-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                      <span>Check-Out (Pasar a Limpieza)</span>
                    </button>
                  )}

                  {isCleaning && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleStatusToggle(room, 'available')}
                        className="w-full py-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Disponible</span>
                      </button>
                      <button
                        onClick={() => handleStatusToggle(room, 'maintenance')}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-600 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-400" />
                        <span>Mantención</span>
                      </button>
                    </div>
                  )}

                  {isMaintenance && (
                    <button
                      onClick={() => handleStatusToggle(room, 'available')}
                      className="w-full py-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Habilitar (Volver a Disponible)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL AUDITORÍA DE REGISTRO HISTÓRICO                */}
      {/* ---------------------------------------------------- */}
      {selectedHistoricalStay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl text-xs text-neutral-200">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#C29F5C]" />
                <h3 className="font-extrabold text-[#E5E7EB] text-base">
                  Auditoría de Registro Histórico
                </h3>
              </div>
              <button
                onClick={() => setSelectedHistoricalStay(null)}
                className="text-neutral-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-2">
                <div className="flex justify-between font-mono font-bold text-[#C29F5C]">
                  <span>Código de Venta: {selectedHistoricalStay.saleCode}</span>
                  <span className="uppercase">{selectedHistoricalStay.paymentStatus}</span>
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-2 pt-1">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span>{selectedHistoricalStay.guestName}</span>
                  <span className="text-xs text-neutral-400 font-mono font-normal">
                    (RUT: {selectedHistoricalStay.guestRut})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1C1C1E] p-3 rounded-xl border border-[#3A3A3C] space-y-1">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                    Habitación Asignada
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    Habitación {selectedHistoricalStay.roomNumber} ({selectedHistoricalStay.roomCategory})
                  </span>
                </div>

                <div className="bg-[#1C1C1E] p-3 rounded-xl border border-[#3A3A3C] space-y-1">
                  <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                    Noches de Hospedaje
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {selectedHistoricalStay.nightsCount} Noches
                  </span>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-3 rounded-xl border border-[#3A3A3C] space-y-1">
                <span className="text-[10px] text-neutral-400 font-semibold uppercase block">
                  Período de Estada
                </span>
                <span className="font-mono font-bold text-white">
                  {formatDateES(selectedHistoricalStay.checkInDate)} → {formatDateES(selectedHistoricalStay.checkOutDate)}
                </span>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] flex justify-between items-center">
                <span className="font-bold text-neutral-300">Total Transaccionado:</span>
                <span className="font-mono font-extrabold text-emerald-400 text-lg">
                  {formatCLP(selectedHistoricalStay.grandTotal)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#3A3A3C]">
              <button
                onClick={() => setSelectedHistoricalStay(null)}
                className="px-5 py-2.5 bg-[#C29F5C] text-white font-bold rounded-xl hover:bg-[#B18E4B] cursor-pointer"
              >
                Cerrar Auditoría
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL EDITAR / CREAR HABITACIÓN                      */}
      {/* ---------------------------------------------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingRoom ? 'Editar Habitación' : 'Agregar Nueva Habitación'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Número / Nombre
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: 105"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Categoría
                  </label>
                  <select
                    value={roomCategory}
                    onChange={(e) => setRoomCategory(e.target.value as RoomCategory)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="Simple">Simple</option>
                    <option value="Doble">Doble</option>
                    <option value="Matrimonial">Matrimonial</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Precio por Noche (CLP)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Estado Actual
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="cleaning">Limpieza</option>
                    <option value="maintenance">⚙️ Fuera de Servicio / Mantenimiento</option>
                  </select>
                </div>
              </div>

              {status === 'maintenance' && (
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-600/60 space-y-1">
                  <label className="text-xs font-semibold text-slate-200 block mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nota / Motivo de Fuera de Servicio</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Fuga en baño, Pintura de paredes, Falla de A/C..."
                    value={maintenanceNotes}
                    onChange={(e) => setMaintenanceNotes(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-slate-600 rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Notas / Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de camas, equipamiento o ubicación..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#3A3A3C]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C29F5C] text-white font-bold text-xs rounded-xl hover:bg-[#B18E4B] cursor-pointer"
                >
                  {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
