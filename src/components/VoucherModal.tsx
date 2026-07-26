import React from 'react';
import { Printer, X, Building2, CheckCircle2, User, Car, Calendar, CreditCard, Receipt } from 'lucide-react';
import { Sale } from '../types';
import { formatCLP, formatDateES } from '../lib/utils';

interface VoucherModalProps {
  sale: Sale;
  onClose: () => void;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'efectivo':
        return 'Efectivo en Recepción';
      case 'transferencia':
        return 'Transferencia Bancaria';
      case 'debito':
        return 'Tarjeta de Débito';
      case 'credito':
        return 'Tarjeta de Crédito';
      case 'tarjeta':
        return 'Tarjeta Débito / Crédito (Transbank)';
      case 'pendiente':
        return 'Pendiente (Cuenta por Cobrar)';
      default:
        return method;
    }
  };

  const extraServicesTotal = (sale.extraServices || []).reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#2C2C2E] border border-[#3A3A3C] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* MODAL HEADER - NO PRINT */}
        <div className="p-4 sm:p-5 bg-[#1C1C1E] border-b border-[#3A3A3C] flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#C29F5C]/15 border border-[#C29F5C]/30 text-[#C29F5C] rounded-xl">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#E5E7EB] text-base sm:text-lg">
                Ficha de Estancia / Comprobante de Recepción
              </h3>
              <p className="text-xs text-neutral-400">
                Vista previa del documento para impresión física o guardado en PDF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-[#C29F5C] hover:bg-[#B18E4B] text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-[#3A3A3C] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT CONTAINER */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-neutral-900 flex-1">
          <div
            id="printable-voucher"
            className="printable-voucher bg-white text-neutral-900 p-8 sm:p-10 rounded-xl shadow-2xl max-w-2xl mx-auto border border-neutral-200 text-xs font-sans space-y-6"
          >
            {/* DOCUMENT HEADER */}
            <div className="border-b border-neutral-300 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#8B6E32]">
                  <Building2 className="w-6 h-6 shrink-0" />
                  <span className="text-2xl font-black tracking-tight uppercase font-serif">HOTEL COLONOS</span>
                </div>
                <p className="text-[11px] text-neutral-600 font-semibold mt-1">
                  Ficha de Registro y Comprobante de Estancia
                </p>
                <p className="text-[10px] text-neutral-500">
                  Av. Los Colonos 1234, Puerto Varas • Tel: +56 9 8765 4321 • hotelcolonos.la@gmail.com
                </p>
              </div>

              <div className="text-right sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto border-neutral-200">
                <div className="text-xs font-mono font-bold text-neutral-800">
                  FOLIO: <span className="text-[#8B6E32] text-sm">{sale.saleCode}</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono mt-0.5">
                  Emisión: {formatDateES(sale.createdAt)}
                </div>
                {sale.invoiceNumber && (
                  <div className="text-[11px] font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-300 mt-1 inline-block">
                    N° {sale.invoiceNumber}
                  </div>
                )}
              </div>
            </div>

            {/* GUEST & VEHICLE DETAILS GRID */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
              <h4 className="text-[11px] font-bold text-[#8B6E32] uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Información del Huésped & Vehículo</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Nombre Completo:</span>
                  <span className="font-bold text-neutral-900 text-sm">{sale.guestName}</span>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] block">RUT / Pasaporte:</span>
                  <span className="font-mono font-bold text-neutral-900 text-sm">{sale.guestRut}</span>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] block">Teléfono de Contacto:</span>
                  <span className="font-medium text-neutral-800">{sale.guestPhone || 'No informado'}</span>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] block">Correo Electrónico:</span>
                  <span className="font-medium text-neutral-800">{sale.guestEmail || 'No informado'}</span>
                </div>

                <div className="sm:col-span-2 pt-1 border-t border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Car className="w-4 h-4 text-[#8B6E32]" />
                    <span className="font-bold">Patente Vehículo:</span>
                    <span className="font-mono font-extrabold text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded uppercase">
                      {sale.vehiclePlate || 'Sin vehículo / No registrada'}
                    </span>
                  </div>

                  {sale.isFrequentGuest && (
                    <span className="text-[10px] font-bold text-[#8B6E32] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      ★ HUÉSPED FRECUENTE
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* STAY DETAILS */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-3">
              <h4 className="text-[11px] font-bold text-[#8B6E32] uppercase tracking-wider flex items-center gap-1.5 border-b border-neutral-200 pb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Detalle del Hospedaje</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2 bg-white rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Habitación</span>
                  <span className="font-mono font-black text-sm text-neutral-900">
                    Hab. {sale.roomNumber}
                  </span>
                  <span className="text-[9px] text-neutral-500 block">({sale.roomCategory})</span>
                </div>

                <div className="p-2 bg-white rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Noches</span>
                  <span className="font-mono font-bold text-sm text-neutral-900">
                    {sale.nightsCount} Noche(s)
                  </span>
                </div>

                <div className="p-2 bg-white rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Check-In</span>
                  <span className="font-mono font-bold text-xs text-neutral-900">
                    {formatDateES(sale.checkInDate)}
                  </span>
                </div>

                <div className="p-2 bg-white rounded border border-neutral-200">
                  <span className="text-[10px] text-neutral-500 block">Check-Out</span>
                  <span className="font-mono font-bold text-xs text-neutral-900">
                    {formatDateES(sale.checkOutDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* FINANCIAL BREAKDOWN TABLE */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-[#8B6E32] uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                <span>Desglose de Consumos & Total</span>
              </h4>

              <table className="w-full text-left border-collapse border border-neutral-200 text-xs">
                <thead>
                  <tr className="bg-neutral-100 text-neutral-700 font-bold border-b border-neutral-200">
                    <th className="p-2">Concepto / Ítem</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Unitario</th>
                    <th className="p-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="p-2 font-medium">
                      Alojamiento Hab. {sale.roomNumber} ({sale.roomCategory})
                    </td>
                    <td className="p-2 text-center font-mono">{sale.nightsCount} n.</td>
                    <td className="p-2 text-right font-mono">
                      {formatCLP(sale.roomTotal / (sale.nightsCount || 1))}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">{formatCLP(sale.roomTotal)}</td>
                  </tr>

                  {sale.extraServices &&
                    sale.extraServices.map((extra, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-neutral-700">• {extra.name}</td>
                        <td className="p-2 text-center font-mono">{extra.quantity}</td>
                        <td className="p-2 text-right font-mono">{formatCLP(extra.unitPrice)}</td>
                        <td className="p-2 text-right font-mono font-bold">
                          {formatCLP(extra.unitPrice * extra.quantity)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* TOTALS & PAYMENT METHOD SUMMARY BOX */}
              <div className="bg-neutral-100 p-3.5 rounded-lg border border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#8B6E32]" />
                    <span className="font-bold text-neutral-800">Medio de Pago:</span>
                    <span className="font-medium text-neutral-900">
                      {getPaymentMethodLabel(sale.paymentMethod)}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600">
                    Estado: <span className="font-bold uppercase text-emerald-800">{sale.paymentStatus === 'paid' ? 'Pagado Totalmente' : 'Pendiente / Parcial'}</span>
                    {sale.invoiceNumber && <span> | N° Documento: {sale.invoiceNumber}</span>}
                  </div>
                </div>

                <div className="text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto border-neutral-200">
                  <span className="text-[10px] text-neutral-500 uppercase font-bold block">TOTAL A PAGAR</span>
                  <span className="text-2xl font-mono font-black text-[#8B6E32]">
                    {formatCLP(sale.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* TERMS DECLARATION */}
            <div className="text-[9px] text-neutral-500 leading-tight border-t border-neutral-200 pt-3">
              Declaro estar en conocimiento y conformidad con el reglamento interno de estadía de Hotel Colonos, así como con los valores fijados por concepto de alojamiento, consumos de minibar y servicios adicionales contratados durante mi permanencia.
            </div>

            {/* SIGNATURES AREA */}
            <div className="pt-8 grid grid-cols-2 gap-8 text-center">
              <div>
                <div className="border-b border-neutral-400 mb-2 w-4/5 mx-auto"></div>
                <div className="font-bold text-neutral-800 text-xs">Firma del Huésped</div>
                <div className="text-[10px] text-neutral-500 font-mono">RUT: {sale.guestRut}</div>
              </div>

              <div>
                <div className="border-b border-neutral-400 mb-2 w-4/5 mx-auto"></div>
                <div className="font-bold text-neutral-800 text-xs">Firma Recepción / Timbre</div>
                <div className="text-[10px] text-neutral-500 font-mono">Hotel Colonos</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
