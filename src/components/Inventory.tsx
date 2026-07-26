import React, { useState } from 'react';
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  Edit2,
  Trash2,
  Coffee,
  Sparkles,
  CheckCircle2,
  Box,
  Layers,
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';
import { formatCLP, formatDateES } from '../lib/utils';

interface InventoryProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('aseo_amenidades');
  const [currentStock, setCurrentStock] = useState('10');
  const [minStockThreshold, setMinStockThreshold] = useState('5');
  const [unit, setUnit] = useState<any>('unidades');
  const [unitCost, setUnitCost] = useState('0');
  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingItem(null);
    setCode(`INV-${Math.floor(100 + Math.random() * 900)}`);
    setName('');
    setCategory('aseo_amenidades');
    setCurrentStock('10');
    setMinStockThreshold('5');
    setUnit('unidades');
    setUnitCost('5000');
    setSupplier('');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setCategory(item.category);
    setCurrentStock(item.currentStock.toString());
    setMinStockThreshold(item.minStockThreshold.toString());
    setUnit(item.unit);
    setUnitCost(item.unitCost.toString());
    setSupplier(item.supplier || '');
    setNotes(item.notes || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const stock = parseInt(currentStock, 10) || 0;
    const thresh = parseInt(minStockThreshold, 10) || 5;
    const cost = parseInt(unitCost, 10) || 0;

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        code,
        name,
        category,
        currentStock: stock,
        minStockThreshold: thresh,
        unit,
        unitCost: cost,
        supplier,
        notes,
        lastRestocked: new Date().toISOString().split('T')[0],
      });
    } else {
      onAddItem({
        code,
        name,
        category,
        currentStock: stock,
        minStockThreshold: thresh,
        unit,
        unitCost: cost,
        supplier,
        notes,
        lastRestocked: new Date().toISOString().split('T')[0],
      });
    }

    setShowModal(false);
  };

  const handleStockAdjustment = (item: InventoryItem, delta: number) => {
    const newStock = Math.max(0, item.currentStock + delta);
    onUpdateItem({
      ...item,
      currentStock: newStock,
      lastRestocked: delta > 0 ? new Date().toISOString().split('T')[0] : item.lastRestocked,
    });
  };

  // Critical alert items count
  const criticalItems = items.filter((i) => i.currentStock <= i.minStockThreshold);

  // Filter items
  const filteredItems = items.filter((i) => {
    const matchesCat = filterCategory === 'all' || i.category === filterCategory;
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCritical = !showCriticalOnly || i.currentStock <= i.minStockThreshold;
    return matchesCat && matchesSearch && matchesCritical;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] p-7 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#E5E7EB]">Inventario de Suministros Hotel Colonos</h1>
              <p className="text-xs text-neutral-300 mt-0.5">
                Control de Stock para Insumos de Aseo/Amenidades y Alimentos/Cafetería con Alertas de Stock Crítico.
              </p>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="px-5 py-3 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Suministro al Inventario</span>
          </button>
        </div>

        {/* CRITICAL ALERT BANNER */}
        {criticalItems.length > 0 && (
          <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
              <span>
                <span className="font-bold text-amber-400">¡Alerta de Stock Crítico!</span> Hay{' '}
                <span className="font-bold underline">{criticalItems.length} producto(s)</span> por debajo del umbral mínimo de seguridad.
              </span>
            </div>
            <button
              onClick={() => setShowCriticalOnly(!showCriticalOnly)}
              className="text-xs text-amber-400 font-bold underline cursor-pointer"
            >
              {showCriticalOnly ? 'Ver Todo el Inventario' : 'Filtrar Solo Críticos'}
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#3A3A3C]">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por nombre de insumo o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#3A3A3C] focus:border-[#C29F5C] rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none"
            />
          </div>

          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#3A3A3C] focus:border-[#C29F5C] rounded-xl py-2 px-3 text-xs text-neutral-200 outline-none"
            >
              <option value="all">Todas las Categorías de Suministro</option>
              <option value="aseo_amenidades">1. Insumos de Aseo y Amenidades</option>
              <option value="alimentos_bebidas">2. Alimentos y Cafetería</option>
            </select>
          </div>
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => {
          const isCritical = item.currentStock <= item.minStockThreshold;

          return (
            <div
              key={item.id}
              className={`bg-[#2C2C2E] border rounded-2xl p-5 space-y-4 relative flex flex-col justify-between transition-all duration-200 shadow-lg ${
                isCritical
                  ? 'border-amber-500/70 bg-amber-950/20'
                  : 'border-[#3A3A3C]'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-[#3A3A3C] pb-3">
                  <div>
                    <span className="text-xs font-mono text-[#C29F5C] font-extrabold block">
                      {item.code}
                    </span>
                    <h3 className="font-extrabold text-[#E5E7EB] text-base leading-snug">{item.name}</h3>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${
                      item.category === 'aseo_amenidades'
                        ? 'bg-blue-950/80 text-blue-300 border-blue-500/40'
                        : 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    }`}
                  >
                    {item.category === 'aseo_amenidades' ? 'Aseo / Amenidad' : 'Alimento / Bebida'}
                  </span>
                </div>

                {/* Stock Gauge */}
                <div className="bg-[#1C1C1E] p-4 rounded-xl border border-[#3A3A3C] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-300 font-semibold">Stock Actual:</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xl font-extrabold font-mono ${
                          isCritical ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                        }`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-[#3A3A3C] pt-2">
                    <span>Mínimo Requerido:</span>
                    <span className="font-mono font-bold text-neutral-200">
                      {item.minStockThreshold} {item.unit}
                    </span>
                  </div>

                  {/* Stock Quick Adjustment (+ / -) */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-semibold">Ajuste Rápido:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleStockAdjustment(item, -1)}
                        className="w-8 h-8 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3A3A3C] text-white font-bold rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        title="Descontar Stock"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleStockAdjustment(item, 1)}
                        className="w-8 h-8 bg-[#2C2C2E] hover:bg-[#3A3A3C] border border-[#3A3A3C] text-[#C29F5C] font-bold rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        title="Ingresar Stock"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleStockAdjustment(item, 10)}
                        className="px-2.5 h-8 bg-[#C29F5C]/20 hover:bg-[#C29F5C]/30 border border-[#C29F5C]/40 text-[#C29F5C] font-extrabold rounded-lg text-xs flex items-center justify-center cursor-pointer"
                        title="Reabastecer 10"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-neutral-300">
                  {item.supplier && (
                    <div className="text-xs flex justify-between">
                      <span>Proveedor:</span>
                      <span className="text-white font-medium">{item.supplier}</span>
                    </div>
                  )}
                  {item.unitCost > 0 && (
                    <div className="text-xs flex justify-between">
                      <span>Costo Unitario:</span>
                      <span className="font-mono text-[#C29F5C] font-bold">{formatCLP(item.unitCost)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-[#3A3A3C] flex items-center justify-between text-xs">
                <span className="text-xs text-neutral-400">
                  Reposición: {formatDateES(item.lastRestocked)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-neutral-400 hover:text-[#C29F5C] rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-neutral-400 hover:text-rose-400 rounded-lg hover:bg-[#3A3A3C] transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT ITEM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#3A3A3C] pb-3">
              <h3 className="font-extrabold text-[#E5E7EB] text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C29F5C]" />
                <span>{editingItem ? 'Editar Suministro' : 'Agregar Nuevo Suministro'}</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-neutral-400 hover:text-white font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="aseo_amenidades">1. Aseo y Amenidades</option>
                    <option value="alimentos_bebidas">2. Alimentos y Cafetería</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="ej: Detergente Industrial 20L / Coca-Cola 350ml"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Stock Actual</label>
                  <input
                    type="number"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Umbral Mínimo Crítico</label>
                  <input
                    type="number"
                    required
                    value={minStockThreshold}
                    onChange={(e) => setMinStockThreshold(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Unidad de Medida</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none"
                  >
                    <option value="unidades">Unidades</option>
                    <option value="litros">Litros</option>
                    <option value="paquetes">Paquetes</option>
                    <option value="cajas">Cajas</option>
                    <option value="botellas">Botellas</option>
                    <option value="kg">Kilos (kg)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">Costo Unitario (CLP)</label>
                  <input
                    type="number"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    className="w-full bg-[#1C1C1E] border border-[#3A3A3C] rounded-xl p-2.5 text-xs text-white focus:border-[#C29F5C] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">Proveedor Habituado</label>
                <input
                  type="text"
                  placeholder="ej: Distribuidora Aseo Limpio"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
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
                  {editingItem ? 'Guardar Cambios' : 'Crear Suministro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
