'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EggSale, PhysicalSale, CashSale, GocLibraSale, PaymentStatus } from '@/types';
import {
  History,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ArrowUpDown,
  Egg,
  Package,
  Layers,
  User,
  Filter,
  Sparkles,
  ShoppingBag,
  Coins,
  X,
  Check,
  Calendar,
} from 'lucide-react';

interface UnifiedSaleItem {
  id: string;
  sourceType:
    | 'EGG_ROC'
    | 'EGG_RO'
    | 'PHYSICAL_FIGURE'
    | 'PHYSICAL_KEYCAP_BOX'
    | 'PHYSICAL_KEYCAP_PIECE'
    | 'CASH_ITEM'
    | 'GOC_LIBRA';
  title: string;
  subTitle: string;
  customerName: string;
  quantityText: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  status: PaymentStatus;
  date: string;
  channelOrServer: string;
  note?: string;
  originalEgg?: EggSale;
  originalPhys?: PhysicalSale;
  originalCash?: CashSale;
  originalGoc?: GocLibraSale;
}

interface AllSalesHistoryProps {
  onEditEgg: (sale: EggSale) => void;
  onEditPhysical: (sale: PhysicalSale) => void;
  onEditCashSale?: (sale: CashSale) => void;
}

export const AllSalesHistory: React.FC<AllSalesHistoryProps> = ({
  onEditEgg,
  onEditPhysical,
  onEditCashSale,
}) => {
  const {
    isAdmin,
    eggSales,
    physicalSales,
    cashSales,
    gocLibraSales,
    deleteEggSale,
    deletePhysicalSale,
    deleteCashSale,
    deleteGocLibraSale,
    updateGocLibraSale,
    toggleEggSaleStatus,
    togglePhysicalSaleStatus,
    toggleCashSaleStatus,
    toggleGocLibraSaleStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<
    'ALL' | 'ROC' | 'RO' | 'FIGURE' | 'KEYCAP' | 'CASH_ITEM' | 'GOC_LIBRA'
  >('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Inline modal state for editing GOC & Libra sales from AllSalesHistory
  const [editingGocSale, setEditingGocSale] = useState<GocLibraSale | null>(null);
  const [gocCustomer, setGocCustomer] = useState('');
  const [gocQty, setGocQty] = useState(1);
  const [gocUnitPrice, setGocUnitPrice] = useState(100);
  const [gocTotal, setGocTotal] = useState('');
  const [gocStatus, setGocStatus] = useState<PaymentStatus>('Clear');
  const [gocDate, setGocDate] = useState('');
  const [gocNote, setGocNote] = useState('');

  const handleOpenEditGoc = (sale: GocLibraSale) => {
    setEditingGocSale(sale);
    setGocCustomer(sale.customerName);
    setGocQty(sale.quantity);
    setGocUnitPrice(sale.unitPrice);
    setGocTotal('');
    setGocStatus(sale.status);
    setGocDate(sale.date ? sale.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
    setGocNote(sale.note || '');
  };

  const handleSaveEditGoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGocSale) return;
    const calcTotal = gocTotal !== '' ? Number(gocTotal) || 0 : Number((gocQty * gocUnitPrice).toFixed(2));
    await updateGocLibraSale(editingGocSale.id, {
      customerName: gocCustomer.trim(),
      quantity: gocQty,
      unitPrice: gocUnitPrice,
      totalAmount: calcTotal,
      status: gocStatus,
      date: gocDate,
      note: gocNote.trim(),
    });
    setEditingGocSale(null);
  };

  // Map and combine all sales into unified list
  const unifiedSales: UnifiedSaleItem[] = useMemo(() => {
    const list: UnifiedSaleItem[] = [];

    // Egg Sales
    eggSales.forEach((egg) => {
      list.push({
        id: egg.id,
        sourceType: egg.server === 'ROC' ? 'EGG_ROC' : 'EGG_RO',
        title: egg.server === 'ROC' ? 'ไข่สุ่ม Classic (ROC)' : 'ไข่สุ่ม Online (RO)',
        subTitle: `Code ${egg.codeId}`,
        customerName: egg.customerName,
        quantityText: `${egg.quantity.toLocaleString()} ฟอง`,
        quantity: egg.quantity,
        pricePerUnit: egg.pricePerEgg,
        totalAmount: egg.totalAmount,
        status: egg.status,
        date: egg.date,
        channelOrServer: egg.server,
        note: egg.note,
        originalEgg: egg,
      });
    });

    // Physical Sales
    physicalSales.forEach((p) => {
      let st: UnifiedSaleItem['sourceType'] = 'PHYSICAL_FIGURE';
      let title = 'Alberta Figure';
      let qText = `${p.quantity} กล่อง`;

      if (p.category === 'KeycapBox') {
        st = 'PHYSICAL_KEYCAP_BOX';
        title = 'MVP Keycap (กล่อง)';
        qText = `${p.quantity} กล่อง`;
      } else if (p.category === 'KeycapPiece') {
        st = 'PHYSICAL_KEYCAP_PIECE';
        title = 'MVP Keycap (ชิ้นเดี่ยว)';
        qText = `${p.quantity} ชิ้น`;
      }

      list.push({
        id: p.id,
        sourceType: st,
        title,
        subTitle: p.itemName,
        customerName: p.customerName,
        quantityText: qText,
        quantity: p.quantity,
        pricePerUnit: p.unitPrice,
        totalAmount: p.totalAmount,
        status: p.status,
        date: p.date,
        channelOrServer: p.channel || 'Physical',
        note: p.note,
        originalPhys: p,
      });
    });

    // Cash Item & Point Stock (54k) Sales
    cashSales.forEach((cs) => {
      const isPoint = cs.category === 'CASH_POINT';
      list.push({
        id: cs.id,
        sourceType: 'CASH_ITEM',
        title: isPoint
          ? 'Cash Point (54k)'
          : cs.category === 'PROMO_FREEBIE'
          ? 'ของแถมโปร (54k)'
          : 'ซื้อพอยท์ (54k)',
        subTitle: `${cs.itemName} (${cs.server})`,
        customerName: cs.customerName,
        quantityText: isPoint
          ? `${cs.quantity.toLocaleString()} pts`
          : `${cs.quantity.toLocaleString()} ชิ้น`,
        quantity: cs.quantity,
        pricePerUnit: cs.unitPrice,
        totalAmount: cs.totalAmount,
        status: cs.status,
        date: cs.date,
        channelOrServer: cs.server,
        note: cs.note,
        originalCash: cs,
      });
    });

    // GOC & Libra Promo Sales
    gocLibraSales.forEach((g) => {
      list.push({
        id: g.id,
        sourceType: 'GOC_LIBRA',
        title: 'GOC & Libra Promo',
        subTitle: `${g.itemName} (${g.server})`,
        customerName: g.customerName,
        quantityText: `${g.quantity.toLocaleString()} ${
          g.category === 'SILVERVINE'
            ? 'กล่อง'
            : g.category === 'LIBRA_SCROLL'
            ? 'ฟอง'
            : 'ชิ้น'
        }`,
        quantity: g.quantity,
        pricePerUnit: g.unitPrice,
        totalAmount: g.totalAmount,
        status: g.status,
        date: g.date,
        channelOrServer: g.server,
        note: g.note,
        originalGoc: g,
      });
    });

    return list;
  }, [eggSales, physicalSales, cashSales, gocLibraSales]);

  // Filter & sort
  const filteredList = useMemo(() => {
    return unifiedSales
      .filter((item) => {
        if (typeFilter === 'ROC') return item.sourceType === 'EGG_ROC';
        if (typeFilter === 'RO') return item.sourceType === 'EGG_RO';
        if (typeFilter === 'FIGURE') return item.sourceType === 'PHYSICAL_FIGURE';
        if (typeFilter === 'KEYCAP')
          return (
            item.sourceType === 'PHYSICAL_KEYCAP_BOX' ||
            item.sourceType === 'PHYSICAL_KEYCAP_PIECE'
          );
        if (typeFilter === 'CASH_ITEM') return item.sourceType === 'CASH_ITEM';
        if (typeFilter === 'GOC_LIBRA') return item.sourceType === 'GOC_LIBRA';
        return true;
      })
      .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
      .filter((item) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          item.customerName.toLowerCase().includes(term) ||
          item.title.toLowerCase().includes(term) ||
          item.subTitle.toLowerCase().includes(term) ||
          (item.note && item.note.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [unifiedSales, typeFilter, statusFilter, searchTerm, sortOrder]);

  const totalAmount = filteredList.reduce((sum, i) => sum + i.totalAmount, 0);
  const clearedAmount = filteredList
    .filter((i) => i.status === 'Clear')
    .reduce((sum, i) => sum + i.totalAmount, 0);
  const pendingAmount = filteredList
    .filter((i) => i.status === 'Pending')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div className="space-y-4">
      {/* Filters and Search Bar */}
      <div className="rounded-2xl bg-[#12151f]/90 border border-white/[0.08] p-4 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">สมุดบันทึกประวัติการขายรวมทุกรายการ</h4>
            <p className="text-xs text-slate-400">
              รวมทุกรายการขายทั้งไข่ ROC/RO, Figure/Keycap, Cash Item & Point (54k), และ GOC & Libra (14.25k)
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, สินค้า, บันทึก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400/60"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400/60 cursor-pointer"
          >
            <option value="ALL">สินค้าทุกพอร์ต ({unifiedSales.length})</option>
            <option value="CASH_ITEM">💎 Cash Item & Point (54k)</option>
            <option value="ROC">🥚 ไข่สุ่ม ROC (Classic)</option>
            <option value="RO">🥚 ไข่สุ่ม RO (Class 3)</option>
            <option value="FIGURE">🧸 Alberta Figure</option>
            <option value="KEYCAP">⌨️ MVP Keycap</option>
            <option value="GOC_LIBRA">✨ GOC & Libra Promo (14.25k)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-black/40 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400/60 cursor-pointer"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="Clear">🟢 Clear (ชำระแล้ว)</option>
            <option value="Pending">🟡 Pending (รอโอน)</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#12151f]/90 border border-white/[0.08] overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#161a29]/90 text-slate-300 border-b border-white/[0.08] select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">ประเภท / รายการ</th>
                <th className="py-3 px-4 font-semibold">รายละเอียด / โค้ด</th>
                <th className="py-3 px-4 font-semibold">ชื่อลูกค้า</th>
                <th className="py-3 px-4 font-semibold text-right">จำนวน</th>
                <th className="py-3 px-4 font-semibold text-right">ราคา/หน่วย</th>
                <th className="py-3 px-4 font-semibold text-right">ยอดรวม (THB)</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะชำระเงิน</th>
                <th className="py-3 px-4 font-semibold">วันที่ / เวลา</th>
                <th className="py-3 px-4 font-semibold">หมายเหตุ</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบประวัติรายการขาย</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.025] transition-colors">
                    {/* Source / Type badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.sourceType === 'EGG_ROC' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          <Egg className="w-3 h-3" /> ไข่ ROC
                        </span>
                      ) : item.sourceType === 'EGG_RO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          <Egg className="w-3 h-3" /> ไข่ RO
                        </span>
                      ) : item.sourceType === 'PHYSICAL_FIGURE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Package className="w-3 h-3" /> Figure
                        </span>
                      ) : item.sourceType === 'CASH_ITEM' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <ShoppingBag className="w-3 h-3" /> {item.title}
                        </span>
                      ) : item.sourceType === 'GOC_LIBRA' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          <Sparkles className="w-3 h-3" /> GOC & Libra
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          <Layers className="w-3 h-3" /> Keycap
                        </span>
                      )}
                    </td>

                    {/* Sub title / Code */}
                    <td className="py-3 px-4 font-semibold text-slate-200 whitespace-nowrap">
                      {item.subTitle}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.customerName}</span>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-4 text-right font-bold text-slate-200 whitespace-nowrap font-mono">
                      {item.quantityText}
                    </td>

                    {/* Price / unit */}
                    <td className="py-3 px-4 text-right text-slate-300 whitespace-nowrap font-mono">
                      ฿{item.pricePerUnit.toLocaleString(undefined, { minimumFractionDigits: item.pricePerUnit % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm whitespace-nowrap font-mono">
                      ฿{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: item.totalAmount % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Button */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (item.originalEgg) toggleEggSaleStatus(item.originalEgg.id);
                          if (item.originalPhys) togglePhysicalSaleStatus(item.originalPhys.id);
                          if (item.originalCash) toggleCashSaleStatus(item.originalCash.id);
                          if (item.originalGoc) toggleGocLibraSaleStatus(item.originalGoc.id);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          item.status === 'Clear'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-emerald-glow'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                        title="คลิกเพื่อสลับสถานะทันที"
                      >
                        {item.status === 'Clear' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Clear</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {item.date ? new Date(item.date).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate" title={item.note}>
                      {item.note || '-'}
                    </td>

                    {/* Actions - Always Visible */}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        {/* ปุ่มแก้ไข */}
                        <button
                          onClick={() => {
                            if (item.originalEgg) onEditEgg(item.originalEgg);
                            else if (item.originalPhys) onEditPhysical(item.originalPhys);
                            else if (item.originalCash && onEditCashSale) onEditCashSale(item.originalCash);
                            else if (item.originalGoc) handleOpenEditGoc(item.originalGoc);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs border border-amber-500/20 cursor-pointer"
                          title="แก้ไขรายการ"
                        >
                          ✏️ แก้ไข
                        </button>
                        {/* ปุ่มลบ */}
                        <button
                          onClick={() => {
                            if (confirm('ต้องการยกเลิกรายการขายนี้หรือไม่?')) {
                              if (item.originalEgg) deleteEggSale(item.originalEgg.id);
                              if (item.originalPhys) deletePhysicalSale(item.originalPhys.id);
                              if (item.originalCash) deleteCashSale(item.originalCash.id);
                              if (item.originalGoc) deleteGocLibraSale(item.originalGoc.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs border border-rose-500/20 cursor-pointer"
                          title="ลบรายการ"
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Aggregates */}
        {filteredList.length > 0 && (
          <div className="p-3.5 bg-black/40 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              แสดง <strong className="text-white font-mono">{filteredList.length}</strong> รายการขายทั้งหมด
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-emerald-glow" />
                <span>ชำระแล้ว: ฿{clearedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>รอโอน: ฿{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-white bg-white/[0.06] px-3.5 py-1.5 rounded-xl border border-white/[0.1] font-bold font-mono shadow-sm">
                ยอดรวมหน้านี้: ฿{totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inline Edit Modal for GOC & Libra Promo Sales */}
      {editingGocSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white">
            <button
              onClick={() => setEditingGocSale(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-black text-white mb-1">
              ✏️ แก้ไขรายการขาย GOC & Libra
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {editingGocSale.itemName} ({editingGocSale.server})
            </p>

            <form onSubmit={handleSaveEditGoc} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อลูกค้า *</label>
                <input
                  type="text"
                  required
                  value={gocCustomer}
                  onChange={(e) => setGocCustomer(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">จำนวน *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={gocQty}
                    onChange={(e) => {
                      setGocQty(Number(e.target.value) || 1);
                      setGocTotal('');
                    }}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ราคา/หน่วย</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={gocUnitPrice}
                    onChange={(e) => {
                      setGocUnitPrice(Number(e.target.value) || 0);
                      setGocTotal('');
                    }}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">ยอดรวม (THB)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={gocTotal !== '' ? gocTotal : Number((gocQty * gocUnitPrice).toFixed(2))}
                    onChange={(e) => setGocTotal(e.target.value)}
                    className="w-full bg-dark-800 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">สถานะชำระเงิน</label>
                  <select
                    value={gocStatus}
                    onChange={(e) => setGocStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Clear">🟢 Clear (โอนแล้ว)</option>
                    <option value="Pending">🟡 Pending (รอโอน)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">วันที่ / เวลา</label>
                  <input
                    type="datetime-local"
                    value={gocDate}
                    onChange={(e) => setGocDate(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={gocNote}
                  onChange={(e) => setGocNote(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-dark-750">
                <button
                  type="button"
                  onClick={() => setEditingGocSale(null)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold text-dark-950 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 transition-all cursor-pointer"
                >
                  ✓ บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
