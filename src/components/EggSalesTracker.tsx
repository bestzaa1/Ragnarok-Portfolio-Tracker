'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ServerType, EggSale, PaymentStatus } from '@/types';
import { calculateCodeSummaries } from '@/lib/calculations';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Plus,
  Egg,
  TrendingUp,
  Tag,
  Calendar,
  User,
  ArrowUpDown,
  Flame,
} from 'lucide-react';

interface EggSalesTrackerProps {
  onOpenQuickSaleForCode: (server: ServerType, codeId: number) => void;
  onEditSale: (sale: EggSale) => void;
}

export const EggSalesTracker: React.FC<EggSalesTrackerProps> = ({
  onOpenQuickSaleForCode,
  onEditSale,
}) => {
  const {
    isAdmin,
    eggSales,
    config,
    activeServerTab,
    setActiveServerTab,
    deleteEggSale,
    toggleEggSaleStatus,
  } = useApp();

  const [selectedCodeFilter, setSelectedCodeFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'qty' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Compute code quota summaries for current active server
  const codeSummaries = useMemo(() => {
    return calculateCodeSummaries(eggSales, activeServerTab, config);
  }, [eggSales, activeServerTab, config]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return eggSales
      .filter((s) => s.server === activeServerTab)
      .filter((s) => (selectedCodeFilter === 'ALL' ? true : s.codeId === selectedCodeFilter))
      .filter((s) => (statusFilter === 'ALL' ? true : s.status === statusFilter))
      .filter((s) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          s.customerName.toLowerCase().includes(term) ||
          (s.note && s.note.toLowerCase().includes(term)) ||
          `code ${s.codeId}`.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'date') {
          comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === 'qty') {
          comp = a.quantity - b.quantity;
        } else if (sortBy === 'amount') {
          comp = a.totalAmount - b.totalAmount;
        }
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [eggSales, activeServerTab, selectedCodeFilter, statusFilter, searchTerm, sortBy, sortOrder]);

  // Aggregate stats for filtered rows
  const filteredTotalQty = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
  const filteredTotalAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const filteredClearedAmount = filteredSales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const filteredPendingAmount = filteredSales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const serverColors = activeServerTab === 'ROC' ? {
    accent: 'rose',
    badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    glow: 'shadow-rose-900/30',
    title: 'Ragnarok Classic (ROC)',
    quotaText: '140 ฟอง x 9 ชุด = 1,260 ฟอง',
  } : {
    accent: 'sky',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    glow: 'shadow-sky-900/30',
    title: 'Ragnarok Online (RO)',
    quotaText: '140 ฟอง x 9 ชุด = 1,260 ฟอง',
  };

  return (
    <div className="space-y-6">
      {/* 1. Server Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-850 p-2.5 rounded-2xl border border-dark-700">
        <div className="flex items-center gap-2">
          {/* ROC Tab */}
          <button
            onClick={() => {
              setActiveServerTab('ROC');
              setSelectedCodeFilter('ALL');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeServerTab === 'ROC'
                ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/50'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <span>⚔️ Ragnarok Classic (ROC)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-rose-200">
              140 ฟอง x 9
            </span>
          </button>

          {/* RO Tab */}
          <button
            onClick={() => {
              setActiveServerTab('RO');
              setSelectedCodeFilter('ALL');
            }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeServerTab === 'RO'
                ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-900/50'
                : 'text-slate-400 hover:text-white hover:bg-dark-800'
            }`}
          >
            <span>🛡️ Ragnarok Online (RO)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-sky-200">
              140 ฟอง x 9
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 px-3 py-1 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>ทั้ง 2 เซิร์ฟเวอร์ใช้สิทธิ์โค้ดแยกกันอย่างอิสระ (รวม 2,520 ฟอง)</span>
        </div>
      </div>

      {/* 2. Code 1 to Code 9 Inventory Quota Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Egg className="w-4 h-4 text-amber-400" />
              <span>โควตาสต็อกโค้ด 1 - 9 ({activeServerTab})</span>
            </h3>
            <span className="text-xs text-slate-400">คลิกที่กล่องเพื่อกรองดูรายการเฉพาะโค้ดนั้น</span>
          </div>

          {selectedCodeFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedCodeFilter('ALL')}
              className="text-xs text-amber-400 hover:underline font-semibold"
            >
              แสดงทุกโค้ด (รีเซ็ตตัวกรอง)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2.5">
          {codeSummaries.map((code) => {
            const isSelected = selectedCodeFilter === code.codeId;
            const percentSold = (code.soldCount / code.totalQuota) * 100;
            const isSoldOut = code.remainingCount === 0;

            return (
              <div
                key={code.codeId}
                onClick={() =>
                  setSelectedCodeFilter(selectedCodeFilter === code.codeId ? 'ALL' : code.codeId)
                }
                className={`relative cursor-pointer rounded-xl p-3 border transition-all text-left group ${
                  isSelected
                    ? 'bg-dark-750 border-amber-400 ring-2 ring-amber-400/30 shadow-glow'
                    : isSoldOut
                    ? 'bg-dark-900/80 border-dark-700 opacity-75 hover:opacity-100 hover:border-slate-500'
                    : 'bg-dark-850 border-dark-700 hover:border-slate-500 hover:bg-dark-800'
                }`}
              >
                {/* Header: Code Badge & Add button */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-black px-2 py-0.5 rounded-md ${
                      isSelected
                        ? 'bg-amber-400 text-dark-950 font-black'
                        : isSoldOut
                        ? 'bg-dark-700 text-slate-400'
                        : 'bg-dark-700 text-slate-200 group-hover:text-amber-300'
                    }`}
                  >
                    Code {code.codeId}
                  </span>

                  {/* Quick Add for this code - Admin Only */}
                  {isAdmin && !isSoldOut && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuickSaleForCode(activeServerTab, code.codeId);
                      }}
                      className="w-5 h-5 rounded-full bg-amber-500/10 hover:bg-amber-500 hover:text-dark-950 text-amber-400 flex items-center justify-center transition-colors"
                      title={`บันทึกการขายให้ Code ${code.codeId} ด่วน`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sold / Remaining count */}
                <div className="mb-2">
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>ขายแล้ว</span>
                    <strong className="text-white">
                      {code.soldCount}
                      <span className="text-slate-500 font-normal">/{code.totalQuota}</span>
                    </strong>
                  </div>

                  <div className="text-[11px] mt-0.5 flex justify-between items-center">
                    <span className="text-slate-500">คงเหลือ</span>
                    <span
                      className={`font-bold ${
                        isSoldOut ? 'text-slate-500' : code.remainingCount < 25 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {code.remainingCount} ฟอง
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-dark-700 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isSoldOut
                        ? 'bg-slate-600'
                        : percentSold > 75
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${percentSold}%` }}
                  />
                </div>

                {/* Revenue generated */}
                <div className="text-[10px] text-slate-400 pt-1 border-t border-dark-750 flex justify-between items-center">
                  <span>ยอดขาย:</span>
                  <span className="font-semibold text-slate-200">
                    ฿{code.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Filters, Search, and Sales Table */}
      <div className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <span>รายการบันทึกการขายไข่สุ่ม ({activeServerTab})</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-700 text-slate-300">
                {filteredSales.length} รายการ
              </span>
            </h4>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Search customer */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ซื้อ, บันทึก..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Code Filter */}
            <select
              value={selectedCodeFilter}
              onChange={(e) =>
                setSelectedCodeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">โควตาทุกโค้ด (Code 1 - 9)</option>
              {codeSummaries.map((c) => (
                <option key={c.codeId} value={c.codeId}>
                  Code {c.codeId} (เหลือ {c.remainingCount} ฟอง)
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="Clear">🟢 Clear (ชำระแล้ว)</option>
              <option value="Pending">🟡 Pending (รอโอน)</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 bg-dark-900 border border-dark-600 rounded-lg text-xs text-slate-300 hover:text-white flex items-center gap-1"
              title="สลับลำดับการแสดงผล"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900/80 text-slate-400 border-b border-dark-700 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">รหัสโค้ด</th>
                <th className="py-3 px-4 font-semibold">ชื่อลูกค้า / ผู้ซื้อ</th>
                <th className="py-3 px-4 font-semibold text-right">จำนวน (ฟอง)</th>
                <th className="py-3 px-4 font-semibold text-right">ราคา/ฟอง (THB)</th>
                <th className="py-3 px-4 font-semibold text-right">ยอดรวม (THB)</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะชำระเงิน</th>
                <th className="py-3 px-4 font-semibold">วันที่ / เวลา</th>
                <th className="py-3 px-4 font-semibold">หมายเหตุ</th>
                {isAdmin && <th className="py-3 px-4 font-semibold text-center">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="py-12 text-center text-slate-500">
                    <Egg className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบรายการขายที่ตรงกับเงื่อนไข</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {isAdmin ? (
                        <>สามารถกดปุ่ม <strong>"+ บันทึกการขายใหม่"</strong> ด้านบนเพื่อเริ่มบันทึก</>
                      ) : (
                        <>ยังไม่มีข้อมูลรายการขาย</>
                      )}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-dark-800/60 transition-colors group"
                  >
                    {/* Code Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-dark-700 text-amber-300 border border-dark-600">
                        Code {sale.codeId}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sale.customerName}</span>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {sale.quantity.toLocaleString()} ฟอง
                    </td>

                    {/* Price per egg */}
                    <td className="py-3 px-4 text-right text-slate-300">
                      ฿{sale.pricePerEgg.toLocaleString()}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                      ฿{sale.totalAmount.toLocaleString()}
                    </td>

                    {/* Status Badge (Toggle 1-Click for Admin, static for Viewer) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {isAdmin ? (
                        <button
                          onClick={() => toggleEggSaleStatus(sale.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            sale.status === 'Clear'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title="คลิกเพื่อสลับสถานะ Clear / Pending ทันที"
                        >
                          {sale.status === 'Clear' ? (
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
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            sale.status === 'Clear'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {sale.status === 'Clear' ? (
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
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {sale.date ? new Date(sale.date).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </td>

                    {/* Note */}
                    <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate" title={sale.note}>
                      {sale.note || '-'}
                    </td>

                    {/* Actions - Admin Only */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditSale(sale)}
                            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-dark-700 transition-colors"
                            title="แก้ไขรายการ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`ต้องการลบรายการขายของ "${sale.customerName}" หรือไม่?`)) {
                                deleteEggSale(sale.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-dark-700 transition-colors"
                            title="ลบรายการ"
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

        {/* Table Bottom Aggregates */}
        {filteredSales.length > 0 && (
          <div className="p-3 bg-dark-900 border-t border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              แสดง <strong>{filteredSales.length}</strong> รายการ | ขายรวม:{' '}
              <strong className="text-white">{filteredTotalQty.toLocaleString()} ฟอง</strong>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>ชำระแล้ว: ฿{filteredClearedAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>รอโอน: ฿{filteredPendingAmount.toLocaleString()}</span>
              </div>
              <div className="text-white bg-dark-800 px-3 py-1 rounded-lg border border-dark-600 font-bold">
                ยอดรวมหน้านี้: ฿{filteredTotalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
