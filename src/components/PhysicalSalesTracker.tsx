'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { PhysicalSale, PaymentStatus } from '@/types';
import {
  Package,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  Plus,
  ArrowUpDown,
  User,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

interface PhysicalSalesTrackerProps {
  onOpenQuickSaleForPhysical: (category: 'Figure' | 'KeycapBox' | 'KeycapPiece') => void;
  onEditSale: (sale: PhysicalSale) => void;
}

export const PhysicalSalesTracker: React.FC<PhysicalSalesTrackerProps> = ({
  onOpenQuickSaleForPhysical,
  onEditSale,
}) => {
  const { physicalSales, config, summary, deletePhysicalSale, togglePhysicalSaleStatus } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'Figure' | 'KeycapBox' | 'KeycapPiece'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filtered physical sales
  const filteredSales = useMemo(() => {
    return physicalSales
      .filter((s) => (categoryFilter === 'ALL' ? true : s.category === categoryFilter))
      .filter((s) => (statusFilter === 'ALL' ? true : s.status === statusFilter))
      .filter((s) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        return (
          s.customerName.toLowerCase().includes(term) ||
          s.itemName.toLowerCase().includes(term) ||
          (s.channel && s.channel.toLowerCase().includes(term)) ||
          (s.note && s.note.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        const comp = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [physicalSales, categoryFilter, statusFilter, searchTerm, sortOrder]);

  const filteredTotalAmount = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
  const filteredClearedAmount = filteredSales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + s.totalAmount, 0);
  const filteredPendingAmount = filteredSales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* 1. Inventory Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Alberta Figure Stock Card */}
        <div className="rounded-2xl bg-dark-850 border border-dark-700 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Alberta Special Package (Figure)</h4>
                  <p className="text-xs text-slate-400">
                    ต้นทุนกล่องละ ฿4,200 (รวม ฿{config.figureCostTotal.toLocaleString()})
                  </p>
                </div>
              </div>

              <button
                onClick={() => onOpenQuickSaleForPhysical('Figure')}
                disabled={summary.figureRemaining <= 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                  summary.figureRemaining > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-dark-950 shadow-glow'
                    : 'bg-dark-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ ขายฟิกเกอร์</span>
              </button>
            </div>

            {/* Numbers */}
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-3xl font-black text-white">{summary.figureRemaining}</span>
                <span className="text-slate-400 text-sm font-medium"> / {summary.figureTotal} กล่องคงเหลือ</span>
              </div>
              <div className="text-xs text-right">
                <div className="text-emerald-400 font-semibold">ขายแล้ว {summary.figureSold} กล่อง</div>
                <div className="text-slate-500">
                  {summary.figureRemaining === 0 ? 'หมดสต็อกแล้ว' : `พร้อมส่ง ${summary.figureRemaining} ตัว`}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500"
                style={{ width: `${(summary.figureSold / summary.figureTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* MVP Keycap Stock Card */}
        <div className="rounded-2xl bg-dark-850 border border-dark-700 p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">MVP Special Package (Keycap)</h4>
                  <p className="text-xs text-slate-400">
                    ต้นทุนกล่องละ ฿3,000 (รวม ฿{config.keycapCostTotal.toLocaleString()} | 8 กล่อง = 64 ชิ้น)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenQuickSaleForPhysical('KeycapBox')}
                  disabled={summary.keycapRemainingBoxes <= 0}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    summary.keycapRemainingBoxes > 0
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-dark-700 text-slate-500 cursor-not-allowed'
                  }`}
                  title="ขายยกกล่อง"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ ขายยกกล่อง</span>
                </button>
                <button
                  onClick={() => onOpenQuickSaleForPhysical('KeycapPiece')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-dark-750 hover:bg-dark-700 text-purple-300 border border-purple-500/30 transition-all"
                  title="ขายแยกรายชิ้น"
                >
                  <span>+ ขายแยกชิ้น</span>
                </button>
              </div>
            </div>

            {/* Numbers */}
            <div className="flex items-baseline justify-between mt-2">
              <div>
                <span className="text-3xl font-black text-white">{summary.keycapRemainingBoxes}</span>
                <span className="text-slate-400 text-sm font-medium"> / {summary.keycapTotalBoxes} กล่องคงเหลือ</span>
              </div>
              <div className="text-xs text-right">
                <div className="text-purple-300 font-semibold">
                  ขายแล้ว {summary.keycapSoldBoxes} กล่อง + {summary.keycapSoldPieces} ชิ้นเดี่ยว
                </div>
                <div className="text-slate-500">
                  (เทียบเท่า {summary.keycapSoldBoxesEquivalent.toFixed(1)} กล่อง)
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden mt-3">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, (summary.keycapSoldBoxesEquivalent / summary.keycapTotalBoxes) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Physical Sales Table */}
      <div className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg">
        {/* Table Top Controls */}
        <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              <span>ประวัติการขายสินค้า Physical (Figure & Keycap)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-700 text-slate-300">
                {filteredSales.length} รายการ
              </span>
            </h4>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อผู้ซื้อ, สินค้า, ช่องทาง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="ALL">สินค้าทุกหมวดหมู่</option>
              <option value="Figure">🧸 Alberta Figure</option>
              <option value="KeycapBox">⌨️ Keycap (ยกกล่อง)</option>
              <option value="KeycapPiece">⌨️ Keycap (แยกชิ้น)</option>
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
              title="สลับลำดับเวลา"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? 'ล่าสุดก่อน' : 'เก่าสุดก่อน'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900/80 text-slate-400 border-b border-dark-700 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="py-3 px-4 font-semibold">รายการสินค้า</th>
                <th className="py-3 px-4 font-semibold">ชื่อลูกค้า</th>
                <th className="py-3 px-4 font-semibold text-right">จำนวน</th>
                <th className="py-3 px-4 font-semibold text-right">ราคาขายต่อหน่วย</th>
                <th className="py-3 px-4 font-semibold text-right">ยอดเงินรวม (THB)</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะชำระเงิน</th>
                <th className="py-3 px-4 font-semibold">ช่องทางการขาย</th>
                <th className="py-3 px-4 font-semibold">วันที่ / เวลา</th>
                <th className="py-3 px-4 font-semibold">หมายเหตุ</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบรายการขายสินค้า Physical</p>
                    <p className="text-xs text-slate-600 mt-1">
                      สามารถกดปุ่ม "+ ขายฟิกเกอร์" หรือ "+ ขายยกกล่อง" ด้านบนเพื่อบันทึก
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-dark-800/60 transition-colors">
                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sale.category === 'Figure' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          🧸 Figure
                        </span>
                      ) : sale.category === 'KeycapBox' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                          ⌨️ Keycap กล่อง
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/30">
                          ⌨️ Keycap แยกชิ้น
                        </span>
                      )}
                    </td>

                    {/* Item Name */}
                    <td className="py-3 px-4 font-semibold text-white max-w-[200px] truncate" title={sale.itemName}>
                      {sale.itemName}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-medium text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sale.customerName}</span>
                      </div>
                    </td>

                    {/* Qty */}
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {sale.quantity} {sale.category === 'KeycapPiece' ? 'ชิ้น' : 'กล่อง'}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-4 text-right text-slate-300">
                      ฿{sale.unitPrice.toLocaleString()}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-amber-400 text-sm">
                      ฿{sale.totalAmount.toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => togglePhysicalSaleStatus(sale.id)}
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
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {sale.channel ? (
                        <span className="px-2 py-0.5 rounded bg-dark-750 text-slate-300 border border-dark-600">
                          {sale.channel}
                        </span>
                      ) : (
                        '-'
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
                    <td className="py-3 px-4 text-slate-400 max-w-[150px] truncate" title={sale.note}>
                      {sale.note || '-'}
                    </td>

                    {/* Actions */}
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
                              deletePhysicalSale(sale.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-dark-700 transition-colors"
                          title="ลบรายการ"
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

        {/* Table Bottom Aggregates */}
        {filteredSales.length > 0 && (
          <div className="p-3 bg-dark-900 border-t border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-400">
              แสดง <strong>{filteredSales.length}</strong> รายการ
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
