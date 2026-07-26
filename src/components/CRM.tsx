import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Award,
  Phone,
  Mail,
  FileText,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { Guest } from '../types';
import { formatCLP, formatDateES, formatRUT } from '../lib/utils';

interface CRMProps {
  guests: Guest[];
  onAddGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => void;
  onUpdateGuest: (guest: Guest) => void;
  onDeleteGuest: (id: string) => void;
}

export const CRM: React.FC<CRMProps> = ({
  guests,
  onAddGuest,
  onUpdateGuest,
  onDeleteGuest,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form
  const [rut, setRut] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [totalVisits, setTotalVisits] = useState('1');
  const [totalSpent, setTotalSpent] = useState('0');
  const [isFrequent, setIsFrequent] = useState(false);
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingGuest(null);
    setRut('');
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setTotalVisits('1');
    setTotalSpent('0');
    setIsFrequent(false);
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (guest: Guest) => {
    setEditingGuest(guest);
    setRut(guest.rut);
    setFirstName(guest.firstName);
    setLastName(guest.lastName);
    setEmail(guest.email);
    setPhone(guest.phone);
    setTotalVisits(guest.totalVisits.toString());
    setTotalSpent(guest.totalSpent.toString());
    setIsFrequent(guest.isFrequent);
    setNotes(guest.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rut || !firstName || !lastName) return;

    const visits = parseInt(totalVisits, 10) || 1;
    const spent = parseInt(totalSpent, 10) || 0;

    if (editingGuest) {
      onUpdateGuest({
        ...editingGuest,
        rut,
        firstName,
        lastName,
        email,
        phone,
        totalVisits: visits,
        totalSpent: spent,
        isFrequent: isFrequent || visits >= 2,
        notes,
      });
    } else {
      onAddGuest({
        rut,
        firstName,
        lastName,
        email,
        phone,
        totalVisits: visits,
        totalSpent: spent,
        isFrequent: isFrequent || visits >= 2,
        notes,
      });
    }

    setShowModal(false);
  };

  // Filter Guests
  const filteredGuests = guests.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.rut.toLowerCase().includes(query) ||
      g.firstName.toLowerCase().includes(query) ||
      g.lastName.toLowerCase().includes(query) ||
      g.email.toLowerCase().includes(query) ||
      g.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#E5E7EB]">CRM Inteligente de Clientes</h1>
            <p className="text-xs text-neutral-300 mt-0.5">
              Base de datos de huéspedes con etiquetado automático "CLIENTE FRECUENTE" e historial de visitas.
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Cliente a CRM</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-4 rounded-xl flex items-center gap-3 shadow-md">
        <Search className="w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar cliente por RUT, Nombre, Apellido, Correo o Teléfono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs text-white placeholder-neutral-500 outline-none"
        />
      </div>

      {/* GUESTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuests.map((guest) => {
          const isVip = guest.isFrequent || guest.totalVisits >= 2;

          return (
            <div
              key={guest.id}
              className={`bg-[#2C2C2E] border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between transition-all duration-200 shadow-lg ${
                isVip ? 'border-[#C29F5C]/60 bg-[#2C2C2E]' : 'border-[#3A3A3C]'
              }`}
            >
              <div className="space-y-3">
                {/* Header Name & Frequent Badge */}
                <div className="flex items-start justify-between border-b border-[#3A3A3C] pb-3">
                  <div>
                    <h3 className="font-extrabold text-[#E5E7EB] text-base leading-snug flex items-center gap-1.5">
                      <span>
                        {guest.firstName} {guest.lastName}
                      </span>
                    </h3>
                    <span className="text-xs text-neutral-400 font-mono">RUT: {guest.rut}</span>
                  </div>

                  {isVip && (
                    <span className="bg-[#C29F5C] text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-900/20">
                      <Award className="w-3 h-3" />
                      <span>CLIENTE FRECUENTE</span>
                    </span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Mail className="w-3.5 h-3.5 text-[#C29F5C] shrink-0" />
                    <span className="truncate">{guest.email || 'Sin correo'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <Phone className="w-3.5 h-3.5 text-[#C29F5C] shrink-0" />
                    <span>{guest.phone || 'Sin teléfono'}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 bg-[#1C1C1E] p-3.5 rounded-xl border border-[#3A3A3C] text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Visitas Totales</span>
                    <span className="font-mono font-bold text-white text-sm">{guest.totalVisits} Estadas</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Gasto Acumulado</span>
                    <span className="font-mono font-bold text-[#C29F5C] text-sm">{formatCLP(guest.totalSpent)}</span>
                  </div>
                </div>

                {/* Notes */}
                {guest.notes && (
                  <div className="text-xs text-neutral-300 italic bg-[#1C1C1E] p-3 rounded-lg border border-[#3A3A3C]">
                    "{guest.notes}"
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#3A3A3C] flex items-center justify-between text-xs">
                <span className="text-xs text-neutral-400">
                  Registrado: {formatDateES(guest.createdAt)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(guest)}
                    className="p-2 text-neutral-400 hover:text-[#C29F5C] rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteGuest(guest.id)}
                    className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                    title="Eliminar Cliente"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT GUEST MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingGuest ? 'Editar Cliente CRM' : 'Agregar Nuevo Cliente CRM'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  RUT / DNI (Identificador Único)
                </label>
                <input
                  type="text"
                  required
                  placeholder="12.345.678-9"
                  value={rut}
                  onChange={(e) => setRut(formatRUT(e.target.value))}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Francisco"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Apellido</label>
                  <input
                    type="text"
                    required
                    placeholder="Morales"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="f.morales@empresa.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+56 9 8765 4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Visitas Históricas</label>
                  <input
                    type="number"
                    value={totalVisits}
                    onChange={(e) => setTotalVisits(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Gasto Acumulado (CLP)</label>
                  <input
                    type="number"
                    value={totalSpent}
                    onChange={(e) => setTotalSpent(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="frequentCheck"
                  checked={isFrequent}
                  onChange={(e) => setIsFrequent(e.target.checked)}
                  className="rounded bg-[#1C1C1E] border-[#3A3A3C] text-[#C29F5C] focus:ring-[#C29F5C]"
                />
                <label htmlFor="frequentCheck" className="text-xs font-semibold text-[#C29F5C] cursor-pointer">
                  Marcar explícitamente como CLIENTE FRECUENTE (VIP)
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Notas / Preferencias</label>
                <textarea
                  rows={2}
                  placeholder="Preferencias de habitación, alergias o solicitudes especiales..."
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
                  className="px-5 py-2.5 bg-[#C29F5C] text-white font-bold text-xs rounded-xl hover:bg-[#B18E4B] cursor-pointer shadow-lg shadow-amber-900/20"
                >
                  {editingGuest ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
