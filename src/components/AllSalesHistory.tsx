'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EggSale, PhysicalSale, GocLibraSale, PaymentStatus } from '@/types';
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
} from 'lucide-react';

interface UnifiedSaleItem {
  id: string;
  sourceType: 'EGG_ROC' | 'EGG_RO' | 'PHYSICAL_FIGURE' | 'PHYSICAL_KEYCAP_BOX' | 'PHYSICAL_KEYCAP_PIECE' | 'GOC_LIBRA';
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
  originalGoc?: GocLibraSale;
}

interface AllSalesHistoryProps {
  onEditEgg: (sale: EggSale) => void;
  onEditPhysical: (sale: PhysicalSale) => void;
}

export const AllSalesHistory: React.FC<AllSalesHistoryProps> = ({
  onEditEgg,
  onEditPhysical,
}) => {
  const {
    isAdmin,
    eggSales,
    physicalSales,
    gocLibraSales,
    deleteEggSale,
    deletePhysicalSale,
    deleteGocLibraSale,
    toggleEggSaleStatus,
    togglePhysicalSaleStatus,
    toggleGocLibraSaleStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ROC' | 'RO' | 'FIGURE' | 'KEYCAP' | 'GOC_LIBRA'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

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

    // GOC & Libra Promo Sales
    gocLibraSales.forEach((g) => {
      list.push({
        id: g.id,
        sourceType: 'GOC_LIBRA',
        title: 'GOC & Libra Promo',
        subTitle: g.itemName,
        customerName: g.customerName,
        quantityText: `${g.quantity.toLocaleString()} ${g.category === 'SILVERVINE' ? 'กล่อง' : g.category === 'LIBRA_SCROLL' ? 'ฟอง' : 'ชิ้น'}`,
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
  }, [eggSales, physicalSales, gocLibraSales]);

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
              รวมทุกรายการขายทั้งไข่ ROC, ไข่ RO, Figure, และ Keycap ตามลำดับเวลา
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
            <option value="ALL">สินค้าทุกประเภท</option>
            <option value="ROC">🥚 ไข่สุ่ม ROC (Classic)</option>
            <option value="RO">🥚 ไข่สุ่ม RO (Class 3)</option>
            <option value="FIGURE">🧸 Alberta Figure</option>
            <option value="KEYCAP">⌨️ MVP Keycap</option>
            <option value="GOC_LIBRA">✨ GOC & Libra Promo</option>
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
                {isAdmin && <th className="py-3 px-4 font-semibold text-center">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 10 : 9} className="py-12 text-center text-slate-500">
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
                      ฿{item.pricePerUnit.toLocaleString()}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm whitespace-nowrap font-mono">
                      ฿{item.totalAmount.toLocaleString()}
                    </td>

                    {/* Status (Toggle 1-Click for Admin, static for Viewer) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <button
                          onClick={() => {
                            if (item.originalEgg) toggleEggSaleStatus(item.originalEgg.id);
                            if (item.originalPhys) togglePhysicalSaleStatus(item.originalPhys.id);
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
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Clear'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-emerald-glow'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {item.status === 'Clear' ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Clear</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>Pending</span>
                            </>
                          )}
                        </div>
                      )}
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

                    {/* Actions - Admin Only */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {(item.originalEgg || item.originalPhys) && (
                            <button
                              onClick={() => {
                                if (item.originalEgg) onEditEgg(item.originalEgg);
                                if (item.originalPhys) onEditPhysical(item.originalPhys);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/[0.06] transition-colors cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`ต้องการลบรายการของ "${item.customerName}" หรือไม่?`)) {
                                if (item.originalEgg) deleteEggSale(item.originalEgg.id);
                                if (item.originalPhys) deletePhysicalSale(item.originalPhys.id);
                                if (item.originalGoc) deleteGocLibraSale(item.originalGoc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] transition-colors cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
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
                <span>ชำระแล้ว: ฿{clearedAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>รอโอน: ฿{pendingAmount.toLocaleString()}</span>
              </div>
              <div className="text-white bg-white/[0.06] px-3.5 py-1.5 rounded-xl border border-white/[0.1] font-bold font-mono shadow-sm">
                ยอดรวมหน้านี้: ฿{totalAmount.toLocaleString()} THB
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
