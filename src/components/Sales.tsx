import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  UserCheck,
  Calendar,
  CreditCard,
  Trash2,
  Edit2,
  DollarSign,
  Coffee,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  Car,
  FileText,
  FileSpreadsheet,
  Wallet,
  Download,
} from 'lucide-react';
import { Sale, Room, Guest, ExtraServiceItem, SaleServiceDetail, PaymentMethod, PaymentStatus, Expense } from '../types';
import { EXTRA_SERVICES_CATALOG } from '../lib/initialData';
import { formatCLP, formatDateES, formatRUT, calculateNights } from '../lib/utils';
import { exportSalesToCSV } from '../lib/exportCsv';
import { VoucherModal } from './VoucherModal';
import { CashClosingModal } from './CashClosingModal';

interface SalesProps {
  sales: Sale[];
  rooms: Room[];
  guests: Guest[];
  expenses?: Expense[];
  onAddSale: (sale: Omit<Sale, 'id' | 'saleCode' | 'createdAt'>) => void;
  onUpdateSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  preselectedRoom?: Room | null;
  onClearPreselectedRoom?: () => void;
}

export const Sales: React.FC<SalesProps> = ({
  sales,
  rooms,
  guests,
  expenses = [],
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  preselectedRoom,
  onClearPreselectedRoom,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCashClosingModal, setShowCashClosingModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [guestRut, setGuestRut] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isFrequentGuest, setIsFrequentGuest] = useState(false);

  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default check out tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow.toISOString().split('T')[0]);

  const [extraServices, setExtraServices] = useState<SaleServiceDetail[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debito');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [notes, setNotes] = useState('');

  // Voucher print modal state
  const [selectedVoucherSale, setSelectedVoucherSale] = useState<Sale | null>(null);

  // Preselected room hook from RoomRack
  useEffect(() => {
    if (preselectedRoom) {
      setSelectedRoomId(preselectedRoom.id);
      setShowModal(true);
    }
  }, [preselectedRoom]);

  // SMART CRM AUTO-RECOGNITION BY RUT OR PHONE
  const handleRutOrPhoneChange = (inputVal: string) => {
    const formatted = formatRUT(inputVal);
    setGuestRut(formatted);

    // Look up in CRM database
    const matchedGuest = guests.find(
      (g) =>
        g.rut.toLowerCase() === formatted.toLowerCase() ||
        (inputVal.length > 6 && g.phone.includes(inputVal))
    );

    if (matchedGuest) {
      setGuestName(`${matchedGuest.firstName} ${matchedGuest.lastName}`);
      setGuestEmail(matchedGuest.email);
      setGuestPhone(matchedGuest.phone);
      setIsFrequentGuest(matchedGuest.isFrequent || matchedGuest.totalVisits >= 2);
    }
  };

  const openAddModal = () => {
    setEditingSale(null);
    setGuestRut('');
    setGuestName('');
    setGuestEmail('');
    setGuestPhone('');
    setVehiclePlate('');
    setInvoiceNumber('');
    setIsFrequentGuest(false);
    setSelectedRoomId(rooms.find((r) => r.status === 'available')?.id || rooms[0]?.id || '');
    setExtraServices([]);
    setPaymentMethod('debito');
    setPaymentStatus('paid');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (sale: Sale) => {
    setEditingSale(sale);
    setGuestRut(sale.guestRut);
    setGuestName(sale.guestName);
    setGuestEmail(sale.guestEmail);
    setGuestPhone(sale.guestPhone);
    setVehiclePlate(sale.vehiclePlate || '');
    setInvoiceNumber(sale.invoiceNumber || '');
    setIsFrequentGuest(sale.isFrequentGuest);
    setSelectedRoomId(sale.roomId);
    setCheckInDate(sale.checkInDate);
    setCheckOutDate(sale.checkOutDate);
    setExtraServices(sale.extraServices || []);
    setPaymentMethod(sale.paymentMethod);
    setPaymentStatus(sale.paymentStatus);
    setNotes(sale.notes || '');
    setShowModal(true);
  };

  const handleAddExtraService = (item: ExtraServiceItem) => {
    const existing = extraServices.find((s) => s.serviceId === item.id);
    if (existing) {
      setExtraServices(
        extraServices.map((s) =>
          s.serviceId === item.id ? { ...s, quantity: s.quantity + 1 } : s
        )
      );
    } else {
      setExtraServices([
        ...extraServices,
        {
          serviceId: item.id,
          name: item.name,
          unitPrice: item.unitPrice,
          quantity: 1,
        },
      ]);
    }
  };

  const handleRemoveExtraService = (serviceId: string) => {
    setExtraServices(extraServices.filter((s) => s.serviceId !== serviceId));
  };

  // Calculations for current form
  const selectedRoomObj = rooms.find((r) => r.id === selectedRoomId);
  const nightsCount = calculateNights(checkInDate, checkOutDate);
  const roomPricePerNight = selectedRoomObj
    ? Number((selectedRoomObj as any).daily_rate || (selectedRoomObj as any).price_per_night || selectedRoomObj.pricePerNight || (selectedRoomObj as any).price || 35000)
    : 35000;
  const roomTotal = roomPricePerNight * nightsCount;
  const extraServicesTotal = extraServices.reduce(
    (sum, s) => sum + s.unitPrice * s.quantity,
    0
  );
  const grandTotal = roomTotal + extraServicesTotal;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestRut || !guestName || !selectedRoomObj) return;

    setIsSubmitting(true);
    try {
      if (editingSale) {
        await onUpdateSale({
          ...editingSale,
          guestRut,
          guestName,
          guestEmail,
          guestPhone,
          vehiclePlate: vehiclePlate.trim() ? vehiclePlate.toUpperCase() : undefined,
          invoiceNumber: invoiceNumber.trim() ? invoiceNumber : undefined,
          isFrequentGuest,
          roomId: selectedRoomObj.id,
          roomNumber: selectedRoomObj.number,
          roomCategory: selectedRoomObj.category,
          checkInDate,
          checkOutDate,
          nightsCount,
          roomTotal,
          extraServices,
          grandTotal,
          paymentMethod,
          paymentStatus,
          notes,
        });
      } else {
        await onAddSale({
          guestRut,
          guestName,
          guestEmail,
          guestPhone,
          vehiclePlate: vehiclePlate.trim() ? vehiclePlate.toUpperCase() : undefined,
          invoiceNumber: invoiceNumber.trim() ? invoiceNumber : undefined,
          isFrequentGuest,
          roomId: selectedRoomObj.id,
          roomNumber: selectedRoomObj.number,
          roomCategory: selectedRoomObj.category,
          checkInDate,
          checkOutDate,
          nightsCount,
          roomTotal,
          extraServices,
          grandTotal,
          paymentMethod,
          paymentStatus,
          notes,
        });
      }
      setShowModal(false);
      if (onClearPreselectedRoom) onClearPreselectedRoom();
    } catch (error) {
      console.error('Error al guardar venta:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Sales list with strict null-safety
  const filteredSales = sales.filter((s) => {
    const query = searchQuery.toLowerCase();
    const code = (s.saleCode || (s as any).sale_code || '').toLowerCase();
    const name = (s.guestName || (s as any).guest_name || '').toLowerCase();
    const rut = (s.guestRut || (s as any).guest_rut || '').toLowerCase();
    const room = (s.roomNumber || (s as any).room_number || '').toString().toLowerCase();
    const plate = (s.vehiclePlate || (s as any).vehicle_plate || '').toLowerCase();
    const invoice = (s.invoiceNumber || (s as any).invoice_number || '').toLowerCase();

    return (
      code.includes(query) ||
      name.includes(query) ||
      rut.includes(query) ||
      room.includes(query) ||
      plate.includes(query) ||
      invoice.includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#E5E7EB]">Ventas y Registro de Estadas</h1>
            <p className="text-xs text-neutral-300 mt-0.5">
              Check-in inteligente con autocompletado CRM y desglose de servicios adicionales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setShowCashClosingModal(true)}
            className="px-4 py-2.5 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-[#C29F5C] border border-[#C29F5C]/40 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Arqueo y Cierre de Caja del Día"
          >
            <Wallet className="w-4 h-4 text-[#C29F5C]" />
            <span>Cierre de Caja Diario</span>
          </button>

          <button
            onClick={() => exportSalesToCSV(filteredSales)}
            className="px-4 py-2.5 bg-[#1C1C1E] hover:bg-[#3A3A3C] text-emerald-400 border border-emerald-500/40 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            title="Exportar ventas filtradas a formato Excel CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Exportar Excel / CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-5 py-2.5 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta / Check-In</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar venta por Código, Nombre de Huésped, RUT o Nº Habitación..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
        />
      </div>

      {/* SALES TABLE */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#1C1C1E] border-b border-[#3A3A3C] text-[11px] font-bold text-[#E5E7EB] uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4">Código / Fecha</th>
                <th className="py-4 px-4">Huésped & CRM</th>
                <th className="py-4 px-4">Habitación</th>
                <th className="py-4 px-4">Fechas Estada</th>
                <th className="py-4 px-4">Servicios Extra</th>
                <th className="py-4 px-4">Total General</th>
                <th className="py-4 px-4">Pago</th>
                <th className="py-4 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A3A3C]">
              {filteredSales.map((sale) => {
                const sCode = sale.saleCode || (sale as any).sale_code || `VEN-${sale.id.slice(0, 6)}`;
                const gName = sale.guestName || (sale as any).guest_name || 'Sin asignar';
                const gRut = sale.guestRut || (sale as any).guest_rut || 'Sin RUT';
                const rNumber = sale.roomNumber || (sale as any).room_number || 'S/A';
                const rCategory = sale.roomCategory || (sale as any).room_category || 'Simple';
                const cIn = sale.checkInDate || (sale as any).check_in_date || '';
                const cOut = sale.checkOutDate || (sale as any).check_out_date || '';
                const gTotal = Number(sale.grandTotal || (sale as any).grand_total || 0);
                const extraSrvs = Array.isArray(sale.extraServices) ? sale.extraServices : Array.isArray((sale as any).extra_services) ? (sale as any).extra_services : [];
                const invNum = sale.invoiceNumber || (sale as any).invoice_number;
                const vPlate = sale.vehiclePlate || (sale as any).vehicle_plate;

                return (
                  <tr key={sale.id} className="hover:bg-[#3A3A3C]/40 transition">
                    <td className="py-4 px-4 font-mono">
                      <div className="font-extrabold text-[#C29F5C] text-sm">{sCode}</div>
                      <div className="text-[10px] text-neutral-400">{formatDateES(sale.createdAt)}</div>
                      {invNum && (
                        <div className="text-[10px] text-amber-300 font-semibold mt-0.5">
                          Doc: {invNum}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-[#E5E7EB] text-sm flex items-center gap-1.5">
                        <span>{gName}</span>
                        {sale.isFrequentGuest && (
                          <span className="bg-[#C29F5C]/20 text-[#C29F5C] border border-[#C29F5C]/40 text-[9px] px-2 py-0.5 font-mono font-bold rounded">
                            VIP FRECUENTE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>RUT: {gRut}</span>
                        {vPlate && (
                          <span className="text-[10px] bg-neutral-800 text-amber-200 px-1.5 py-0.5 rounded border border-neutral-700 flex items-center gap-1">
                            <Car className="w-3 h-3 text-[#C29F5C]" />
                            {vPlate}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-extrabold text-[#E5E7EB] text-sm">
                      Hab. {rNumber} ({rCategory})
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-neutral-200 font-medium">
                        {formatDateES(cIn)} → {formatDateES(cOut)}
                      </div>
                      <div className="text-xs text-neutral-400 font-mono">
                        {sale.nightsCount || 1} Noche(s)
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {extraSrvs.length > 0 ? (
                        <div className="space-y-0.5">
                          {extraSrvs.map((srv, idx) => (
                            <div key={idx} className="text-xs text-neutral-300">
                              • {srv.name} (x{srv.quantity})
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500 italic">Sin extras</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono font-extrabold text-[#E5E7EB] text-base">
                      {formatCLP(gTotal)}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-block text-xs font-bold uppercase px-2.5 py-1 rounded border ${
                          sale.paymentStatus === 'paid'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : sale.paymentStatus === 'partially_paid'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {sale.paymentMethod || 'efectivo'} ({sale.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'})
                      </span>
                    </td>

                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedVoucherSale(sale)}
                        className="p-2 text-neutral-400 hover:text-[#C29F5C] hover:bg-[#3A3A3C] rounded-lg transition cursor-pointer"
                        title="Imprimir / PDF Comprobante de Estancia"
                      >
                        <Printer className="w-4 h-4 text-[#C29F5C]" />
                      </button>
                      <button
                        onClick={() => openEditModal(sale)}
                        className="p-2 text-neutral-400 hover:text-[#C29F5C] hover:bg-[#3A3A3C] rounded-lg transition cursor-pointer"
                        title="Editar Registro"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteSale(sale.id)}
                        className="p-2 text-neutral-400 hover:text-rose-400 hover:bg-[#3A3A3C] rounded-lg transition cursor-pointer"
                        title="Eliminar Venta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW / EDIT SALE MODAL WITH SMART CRM AUTOCOMPLETE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-2xl rounded-2xl p-6 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingSale ? 'Editar Venta' : 'Registro de Venta y Check-In'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white p-1 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* SECTION 1: CRM AUTO-RECOGNITION */}
              <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#C29F5C] flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    1. Datos del Huésped (Auto-reconocimiento CRM)
                  </span>
                  {isFrequentGuest && (
                    <span className="bg-[#C29F5C] text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce">
                      ★ CLIENTE FRECUENTE
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      RUT / DNI (Ingresa para buscar en BD)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="12.345.678-9"
                      value={guestRut}
                      onChange={(e) => handleRutOrPhoneChange(e.target.value)}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="cliente@correo.cl"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Teléfono de Contacto
                    </label>
                    <input
                      type="text"
                      placeholder="+56 9 1234 5678"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1 flex items-center gap-1">
                      <Car className="w-3.5 h-3.5 text-[#C29F5C]" />
                      <span>Patente del Vehículo (Opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ABCD-12 (Estacionamiento)"
                      value={vehiclePlate}
                      onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: HABITACIÓN Y DÍAS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Seleccionar Habitación
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    {rooms.map((r) => {
                      const isMaintenance = r.status === 'maintenance';
                      return (
                        <option
                          key={r.id}
                          value={r.id}
                          disabled={isMaintenance}
                        >
                          Hab. {r.number} ({r.category}) - {formatCLP(r.pricePerNight)}{' '}
                          {isMaintenance ? '⚙️ [FUERA DE SERVICIO]' : r.status === 'occupied' ? '(Ocupada)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Fecha Check-In
                  </label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Fecha Check-Out
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              </div>

              {/* SECTION 3: SERVICIOS EXTRA (MINIBAR, LAVANDERIA, DESAYUNO) */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Servicios Adicionales (Minibar, Lavandería, Desayunos)
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXTRA_SERVICES_CATALOG.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleAddExtraService(srv)}
                      className="px-3 py-2 bg-[#1C1C1E] hover:bg-[#3A3A3C] border border-[#3A3A3C] hover:border-[#C29F5C] text-xs text-neutral-200 rounded-lg transition flex items-center gap-1.5 cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C29F5C]" />
                      <span>{srv.name}</span>
                      <span className="font-mono text-[#C29F5C] font-bold">({formatCLP(srv.unitPrice)})</span>
                    </button>
                  ))}
                </div>

                {/* Selected extras list */}
                {extraServices.length > 0 && (
                  <div className="bg-[#1C1C1E] p-3.5 rounded-xl border border-[#3A3A3C] space-y-2">
                    {extraServices.map((item) => (
                      <div
                        key={item.serviceId}
                        className="flex items-center justify-between text-xs text-neutral-200"
                      >
                        <span>
                          • {item.name} x{item.quantity}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#C29F5C] font-bold">
                            {formatCLP(item.unitPrice * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtraService(item.serviceId)}
                            className="text-rose-400 hover:text-rose-300 text-xs font-bold px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 4: PAYMENT METHOD & TOTAL SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C]">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Medio de Pago
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                      >
                        <option value="efectivo">Efectivo en Recepción</option>
                        <option value="transferencia">Transferencia Bancaria</option>
                        <option value="debito">Tarjeta de Débito</option>
                        <option value="credito">Tarjeta de Crédito</option>
                        <option value="tarjeta">Tarjeta Débito / Crédito (Transbank)</option>
                        <option value="pendiente">Pendiente (Fiado / Cuentas por Cobrar)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Estado del Pago
                      </label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                        className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                      >
                        <option value="paid">Pagado Totalmente</option>
                        <option value="partially_paid">Abonado / Parcial</option>
                        <option value="pending">Pendiente por Pagar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#C29F5C]" />
                      <span>Número de Boleta / Factura (Folio emitido)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: BOL-10495 o FAC-00812"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-between p-3.5 bg-[#2C2C2E] border border-[#3A3A3C] rounded-xl">
                  <div className="space-y-1 text-xs text-neutral-300">
                    <div className="flex justify-between">
                      <span>Habitación ({nightsCount} noches):</span>
                      <span className="font-mono text-white font-bold">{formatCLP(roomTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Servicios Extras:</span>
                      <span className="font-mono text-white font-bold">{formatCLP(extraServicesTotal)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#3A3A3C] flex items-center justify-between mt-2">
                    <span className="font-extrabold text-[#E5E7EB] text-sm">TOTAL GENERAL</span>
                    <span className="font-mono font-extrabold text-[#C29F5C] text-xl">
                      {formatCLP(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-[#3A3A3C]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-neutral-400 hover:text-white font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C29F5C] text-white font-bold text-xs rounded-xl hover:bg-[#B18E4B] cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  {editingSale ? 'Actualizar Venta' : 'Confirmar Check-In & Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOUCHER / PRINT MODAL */}
      {selectedVoucherSale && (
        <VoucherModal
          sale={selectedVoucherSale}
          onClose={() => setSelectedVoucherSale(null)}
        />
      )}

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
