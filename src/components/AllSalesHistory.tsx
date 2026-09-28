'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { EggSale, PhysicalSale, PaymentStatus } from '@/types';
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
} from 'lucide-react';

interface UnifiedSaleItem {
  id: string;
  sourceType: 'EGG_ROC' | 'EGG_RO' | 'PHYSICAL_FIGURE' | 'PHYSICAL_KEYCAP_BOX' | 'PHYSICAL_KEYCAP_PIECE';
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
    eggSales,
    physicalSales,
    deleteEggSale,
    deletePhysicalSale,
    toggleEggSaleStatus,
    togglePhysicalSaleStatus,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'ROC' | 'RO' | 'FIGURE' | 'KEYCAP'>('ALL');
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

    return list;
  }, [eggSales, physicalSales]);

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
      <div className="rounded-2xl bg-dark-850 border border-dark-700 p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
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
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหาชื่อลูกค้า, สินค้า, บันทึก..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">สินค้าทุกประเภท</option>
            <option value="ROC">🥚 ไข่สุ่ม ROC (Classic)</option>
            <option value="RO">🥚 ไข่สุ่ม RO (Class 3)</option>
            <option value="FIGURE">🧸 Alberta Figure</option>
            <option value="KEYCAP">⌨️ MVP Keycap</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="Clear">🟢 Clear (ชำระแล้ว)</option>
            <option value="Pending">🟡 Pending (รอโอน)</option>
          </select>

          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="px-2.5 py-1.5 bg-dark-900 border border-dark-600 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'desc' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900/80 text-slate-400 border-b border-dark-700 select-none uppercase tracking-wider text-[11px]">
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
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <History className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบประวัติรายการขาย</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-800/60 transition-colors">
                    {/* Source / Type badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.sourceType === 'EGG_ROC' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                          <Egg className="w-3 h-3" /> ไข่ ROC
                        </span>
                      ) : item.sourceType === 'EGG_RO' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          <Egg className="w-3 h-3" /> ไข่ RO
                        </span>
                      ) : item.sourceType === 'PHYSICAL_FIGURE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Package className="w-3 h-3" /> Figure
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
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
                    <td className="py-3 px-4 text-right font-bold text-slate-200 whitespace-nowrap">
                      {item.quantityText}
                    </td>

                    {/* Price / unit */}
                    <td className="py-3 px-4 text-right text-slate-300 whitespace-nowrap">
                      ฿{item.pricePerUnit.toLocaleString()}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm whitespace-nowrap">
                      ฿{item.totalAmount.toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (item.originalEgg) toggleEggSaleStatus(item.originalEgg.id);
                          if (item.originalPhys) togglePhysicalSaleStatus(item.originalPhys.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          item.status === 'Clear'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                        title="คลิกเพื่อสลับสถานะทันที"
                      >
                        {item.status === 'Clear' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
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
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
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

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            if (item.originalEgg) onEditEgg(item.originalEgg);
                            if (item.originalPhys) onEditPhysical(item.originalPhys);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-dark-700 transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบรายการของ "${item.customerName}" หรือไม่?`)) {
                              if (item.originalEgg) deleteEggSale(item.originalEgg.id);
                              if (item.originalPhys) deletePhysicalSale(item.originalPhys.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-dark-700 transition-colors"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="p-3 bg-dark-900 border-t border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              แสดง <strong>{filteredList.length}</strong> รายการขายทั้งหมด
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ชำระแล้ว: ฿{clearedAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>รอโอน: ฿{pendingAmount.toLocaleString()}</span>
              </div>
              <div className="text-white bg-dark-800 px-3 py-1 rounded-lg border border-dark-600 font-bold">
                ยอดรวมหน้านี้: ฿{totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
