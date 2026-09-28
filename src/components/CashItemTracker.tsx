'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CashItem, CashSale, PaymentStatus } from '@/types';
import {
  Wallet,
  Coins,
  Sparkles,
  TrendingUp,
  Package,
  Layers,
  Plus,
  Minus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ShoppingBag,
  ArrowUpDown,
  Filter,
  User,
  Check,
  AlertCircle,
  RefreshCw,
  Table,
} from 'lucide-react';

interface CashItemTrackerProps {
  onOpenAddItem: () => void;
  onOpenEditItem: (item: CashItem) => void;
  onOpenSellItem: (item?: CashItem) => void;
  onOpenEditSale: (sale: CashSale) => void;
}

export const CashItemTracker: React.FC<CashItemTrackerProps> = ({
  onOpenAddItem,
  onOpenEditItem,
  onOpenSellItem,
  onOpenEditSale,
}) => {
  const {
    cashItems,
    cashSales,
    cashConfig,
    cashSummary,
    adjustCashItemStock,
    deleteCashItem,
    deleteCashSale,
    toggleCashSaleStatus,
    syncFromPromotionSheet,
    syncFromSalesLedgerPdf,
  } = useApp();

  // Stock table filters
  const [stockServerFilter, setStockServerFilter] = useState<'ALL' | 'Baphomet' | 'Moonlight'>('ALL');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [stockSearchTerm, setStockSearchTerm] = useState('');

  // Sales table filters
  const [salesStatusFilter, setSalesStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [salesServerFilter, setSalesServerFilter] = useState<'ALL' | 'Baphomet' | 'Moonlight'>('ALL');
  const [salesSearchTerm, setSalesSearchTerm] = useState('');

  // Filtered Stock Items
  const filteredStockItems = useMemo(() => {
    return cashItems
      .filter((i) => (stockServerFilter === 'ALL' ? true : i.server.toLowerCase() === stockServerFilter.toLowerCase()))
      .filter((i) => (onlyInStock ? i.stockQty > 0 : true))
      .filter((i) => {
        if (!stockSearchTerm.trim()) return true;
        const term = stockSearchTerm.toLowerCase();
        return (
          i.name.toLowerCase().includes(term) ||
          i.server.toLowerCase().includes(term) ||
          (i.note && i.note.toLowerCase().includes(term))
        );
      });
  }, [cashItems, stockServerFilter, onlyInStock, stockSearchTerm]);

  // Totals for the Stock Table
  const totalStockRemainSale = useMemo(() => {
    return cashItems.reduce(
      (sum, i) => sum + (i.remainSale !== undefined ? i.remainSale : i.stockQty * i.targetPricePerUnit),
      0
    );
  }, [cashItems]);

  const filteredRemainSaleSum = useMemo(() => {
    return filteredStockItems.reduce(
      (sum, i) => sum + (i.remainSale !== undefined ? i.remainSale : i.stockQty * i.targetPricePerUnit),
      0
    );
  }, [filteredStockItems]);

  const filteredTotalSaleSum = useMemo(() => {
    return filteredStockItems.reduce((sum, i) => sum + (Number(i.totalSale) || 0), 0);
  }, [filteredStockItems]);

  // Server breakdown
  const baphometRemainSum = useMemo(() => {
    return cashItems
      .filter((i) => i.server.toLowerCase().includes('bapho'))
      .reduce((sum, i) => sum + (i.remainSale !== undefined ? i.remainSale : i.stockQty * i.targetPricePerUnit), 0);
  }, [cashItems]);

  const moonlightRemainSum = useMemo(() => {
    return cashItems
      .filter((i) => i.server.toLowerCase().includes('moon'))
      .reduce((sum, i) => sum + (i.remainSale !== undefined ? i.remainSale : i.stockQty * i.targetPricePerUnit), 0);
  }, [cashItems]);

  // Filtered Cash Sales
  const filteredSales = useMemo(() => {
    return cashSales
      .filter((s) => (salesStatusFilter === 'ALL' ? true : s.status === salesStatusFilter))
      .filter((s) => (salesServerFilter === 'ALL' ? true : s.server.toLowerCase().includes(salesServerFilter.toLowerCase())))
      .filter((s) => {
        if (!salesSearchTerm.trim()) return true;
        const term = salesSearchTerm.toLowerCase();
        return (
          s.customerName.toLowerCase().includes(term) ||
          s.itemName.toLowerCase().includes(term) ||
          s.server.toLowerCase().includes(term) ||
          (s.note && s.note.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [cashSales, salesStatusFilter, salesServerFilter, salesSearchTerm]);

  const filteredSalesTotal = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. Summary Cards: สรุปภาพรวมพอร์ตเติมเงินเดิม 54,000 THB */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: เงินลงทุนเติมเงินเดิม */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              เงินลงทุนเติมเงินเดิม
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-700/40 border border-slate-600/50 flex items-center justify-center text-slate-300">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ฿{cashSummary.initialInvestment.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs text-slate-400">
            <span>ต้นทุนพอร์ตเริ่มต้นเดิม</span>
            <span className="text-slate-300 font-semibold">100% Cash</span>
          </div>
        </div>

        {/* Card 2: ยอดขายสดสะสม (Total Cash Sales) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              ยอดขายสดสะสม (Total Cash Sales)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ฿{cashSummary.clearedCashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-3 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {cashSales.length} รายการ (ตาม Sales Ledger)
            </span>
            {cashSummary.pendingCashSales > 0 ? (
              <span className="text-amber-400 font-semibold">
                (รอโอน ฿{cashSummary.pendingCashSales.toLocaleString()})
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">
                ชำระครบถ้วน 100%
              </span>
            )}
          </div>
        </div>

        {/* Card 3: พอยท์คงเหลือ (Remaining Points) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg hover:border-sky-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
              พอยท์คงเหลือ (Points)
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-300 tracking-tight flex items-baseline gap-1.5">
            <span>{cashSummary.remainingPoints.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-400">pts</span>
          </div>
          <div className="mt-3 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
            <span className="text-slate-400">ตีเป็นเงิน @ 0.065</span>
            <span className="text-emerald-400 font-bold">
              ฿{cashSummary.pointValueThb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 4: สถานะพอร์ต & คืนทุน */}
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border p-5 shadow-lg transition-all ${
            cashSummary.isBreakeven
              ? 'border-emerald-500/40 shadow-green-glow'
              : 'border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              สถานะพอร์ต (Breakeven)
            </span>
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                cashSummary.isBreakeven
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {cashSummary.breakevenPercent.toFixed(1)}%
            </div>
            <span className="text-xs text-slate-400">
              {cashSummary.isBreakeven
                ? '🎉 คืนทุนแล้ว'
                : `ขาดอีก ฿${cashSummary.remainingToBreakeven.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden mt-3">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                cashSummary.isBreakeven
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(100, cashSummary.breakevenPercent)}%` }}
            />
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex justify-between">
            <span>มูลค่าสต็อกคงเหลือ (ตามชีต):</span>
            <span className="text-amber-300 font-bold">
              ฿{totalStockRemainSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. ตารางคลังของแถมคงเหลือ (แยก Server) - 1:1 กับชีต        */}
      {/* ========================================================= */}
      <div className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-xl">
        {/* Banner Style Header Matching User Sheet */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-dark-950">
          <div className="flex items-center gap-2.5">
            <Table className="w-6 h-6 text-dark-950 stroke-[2.5]" />
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                1. ตารางคลังของแถมคงเหลือ (แยก Server)
              </h3>
              <p className="text-xs font-semibold text-dark-950/80">
                ตารางคลังสินค้า 4 | สรุปยอดขายแล้ว, สต็อกคงเหลือ และราคาประเมิน (Remain Sale)
              </p>
            </div>
          </div>

          {/* Top Right Remain Sale Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('ต้องการซิงค์ข้อมูลให้ตรงตามชีตของแถมคงเหลือ (ยอดรวม ฿13,420.00) หรือไม่?')) {
                  syncFromPromotionSheet();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-dark-950/20 hover:bg-dark-950/40 text-dark-950 font-bold text-xs flex items-center gap-1.5 transition-colors border border-dark-950/20"
              title="รีเซ็ต/ซิงค์ข้อมูลให้ตรงตามชีต 100%"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ซิงค์ตามชีต (13,420)</span>
            </button>

            <div className="px-4 py-1.5 rounded-xl bg-dark-950 text-white font-black text-sm sm:text-base border border-amber-300/40 shadow-md">
              <span className="text-amber-400 mr-1.5 text-xs font-semibold uppercase">Remain Sale:</span>
              <span>฿{totalStockRemainSale.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-3.5 bg-dark-900 border-b border-dark-750 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center flex-wrap gap-2">
            {/* Server tabs */}
            <button
              onClick={() => setStockServerFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                stockServerFilter === 'ALL'
                  ? 'bg-dark-700 text-white border border-dark-600'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทุกเซิร์ฟเวอร์ ({cashItems.length})
            </button>
            <button
              onClick={() => setStockServerFilter('Baphomet')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                stockServerFilter === 'Baphomet'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Baphomet</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-dark-800 text-amber-400">
                ฿{baphometRemainSum.toLocaleString()}
              </span>
            </button>
            <button
              onClick={() => setStockServerFilter('Moonlight')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                stockServerFilter === 'Moonlight'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Moonlight</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-dark-800 text-sky-400">
                ฿{moonlightRemainSum.toLocaleString()}
              </span>
            </button>

            {/* Toggle Only in stock */}
            <label className="flex items-center gap-1.5 ml-2 cursor-pointer text-slate-300 select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded bg-dark-800 border-dark-600 text-amber-500 focus:ring-0"
              />
              <span>เฉพาะที่ยังเหลือของ (Remain &gt; 0)</span>
            </label>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Search */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อไอเทม..."
                value={stockSearchTerm}
                onChange={(e) => setStockSearchTerm(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* + Add New Custom Item */}
            <button
              onClick={onOpenAddItem}
              className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600 font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>เพิ่มแถวใหม่</span>
            </button>
          </div>
        </div>

        {/* The Exact Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#1b3d2f] text-slate-100 border-b border-dark-700 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-bold border-r border-[#265340]">Server</th>
                <th className="py-2.5 px-3 font-bold border-r border-[#265340]">รายการไอเทมแถม</th>
                <th className="py-2.5 px-3 font-bold text-right border-r border-[#265340]">
                  จำนวนทั้งหมด (PC)
                </th>
                <th className="py-2.5 px-3 font-bold text-right border-r border-[#265340]">
                  ขายไปแล้ว
                </th>
                <th className="py-2.5 px-3 font-bold text-center border-r border-[#265340]">
                  คงเหลือ (Remain)
                </th>
                <th className="py-2.5 px-3 font-bold text-right border-r border-[#265340]">
                  Total Sale
                </th>
                <th className="py-2.5 px-3 font-bold text-right border-r border-[#265340]">
                  Forecast price
                </th>
                <th className="py-2.5 px-3 font-bold text-right border-r border-[#265340]">
                  Remain Sale
                </th>
                <th className="py-2.5 px-3 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {filteredStockItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
                  </td>
                </tr>
              ) : (
                filteredStockItems.map((item) => {
                  const remainSaleVal =
                    item.remainSale !== undefined
                      ? item.remainSale
                      : item.stockQty * item.targetPricePerUnit;
                  const isRemainPositive = item.stockQty > 0;
                  const isTotalSaleZero = (item.totalSale || 0) === 0;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-dark-800/70 transition-colors group"
                    >
                      {/* Server */}
                      <td className="py-2.5 px-3 whitespace-nowrap border-r border-dark-750">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.server.toLowerCase().includes('bapho')
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                          }`}
                        >
                          {item.server}
                        </span>
                      </td>

                      {/* Item Name */}
                      <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap border-r border-dark-750">
                        <span className={item.stockQty <= 0 && !isRemainPositive ? 'text-slate-400' : ''}>
                          {item.name}
                        </span>
                        {item.note && (
                          <span className="text-[10px] text-slate-500 block font-normal">
                            {item.note}
                          </span>
                        )}
                      </td>

                      {/* Total Qty (PC) */}
                      <td className="py-2.5 px-3 text-right text-slate-300 font-semibold border-r border-dark-750">
                        {item.totalQty !== undefined ? item.totalQty : item.stockQty + (item.soldQty || 0)}
                      </td>

                      {/* Sold Qty */}
                      <td className="py-2.5 px-3 text-right text-slate-300 border-r border-dark-750">
                        {item.soldQty !== undefined ? item.soldQty : 0}
                      </td>

                      {/* Remain with Quick +/- adjust */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center border-r border-dark-750">
                        <div className="inline-flex items-center gap-1.5 bg-dark-900 border border-dark-700 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => adjustCashItemStock(item.id, -1)}
                            disabled={item.stockQty <= 0}
                            className="w-4 h-4 rounded bg-dark-750 hover:bg-rose-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors disabled:opacity-30"
                            title="ลดสต็อก 1"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>

                          <span
                            className={`font-black min-w-[24px] text-center text-xs ${
                              item.stockQty > 0 ? 'text-white' : 'text-slate-500'
                            }`}
                          >
                            {item.stockQty}
                          </span>

                          <button
                            onClick={() => adjustCashItemStock(item.id, 1)}
                            className="w-4 h-4 rounded bg-dark-750 hover:bg-emerald-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors"
                            title="เพิ่มสต็อก 1"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </td>

                      {/* Total Sale (Yellow highlight if zero like in sheet) */}
                      <td
                        className={`py-2.5 px-3 text-right font-semibold border-r border-dark-750 whitespace-nowrap ${
                          isTotalSaleZero
                            ? 'bg-yellow-400/10 text-yellow-300 font-normal'
                            : 'text-white'
                        }`}
                      >
                        {item.totalSale !== undefined ? item.totalSale.toLocaleString() : '0'}
                      </td>

                      {/* Forecast price (Pink/soft red highlight if has value like in sheet) */}
                      <td
                        className={`py-2.5 px-3 text-right font-medium border-r border-dark-750 whitespace-nowrap ${
                          item.targetPricePerUnit > 0
                            ? 'bg-pink-500/10 text-pink-200'
                            : 'text-slate-500'
                        }`}
                      >
                        {item.targetPricePerUnit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Remain Sale (Soft green background if 0, bright green if has value like in sheet) */}
                      <td
                        className={`py-2.5 px-3 text-right font-bold border-r border-dark-750 whitespace-nowrap ${
                          remainSaleVal > 0
                            ? 'bg-emerald-500/20 text-emerald-300 font-black'
                            : 'bg-[#2d4739]/30 text-slate-500'
                        }`}
                      >
                        {remainSaleVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenSellItem(item)}
                            disabled={item.stockQty <= 0}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                              item.stockQty > 0
                                ? 'bg-emerald-500/20 hover:bg-emerald-500 hover:text-dark-950 text-emerald-300 border border-emerald-500/40'
                                : 'bg-dark-750 text-slate-600 cursor-not-allowed'
                            }`}
                            title="ตัดขายรายการนี้"
                          >
                            ขาย
                          </button>

                          <button
                            onClick={() => onOpenEditItem(item)}
                            className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-dark-700 transition-colors"
                            title="แก้ไข"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`ต้องการลบรายการ "${item.name}" หรือไม่?`)) {
                                deleteCashItem(item.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-dark-700 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Aggregates matching sheet summary */}
        <div className="p-3.5 bg-dark-900 border-t border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            แสดง <strong>{filteredStockItems.length}</strong> รายการ | ยอดขายแล้วรวม:{' '}
            <strong className="text-white">฿{filteredTotalSaleSum.toLocaleString()} THB</strong>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold">ยอดรวมมูลค่าคงเหลือ (Remain Sale):</span>
            <span className="text-base font-black text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              ฿{filteredRemainSaleSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ตารางบันทึกยอดขาย (Sales Ledger) - 1:1 กับไฟล์ PDF     */}
      {/* ========================================================= */}
      <div className="rounded-2xl bg-dark-850 border border-dark-700 overflow-hidden shadow-lg">
        <div className="p-4 border-b border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h4 className="font-bold text-white text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>3. ตารางบันทึกยอดขาย (Sales Ledger)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-700 text-slate-300">
                {filteredSales.length} รายการ
              </span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              ยอดขายสดสะสมตามสมุดบัญชี ฿{cashSummary.clearedCashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
              {cashSummary.pendingCashSales > 0 ? (
                <span className="text-amber-400 ml-1 font-semibold">
                  (รอโอน ฿{cashSummary.pendingCashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              ) : (
                <span className="text-emerald-400 ml-1 font-semibold">
                  (ชำระครบถ้วนแล้ว 100%)
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Sync from PDF Button */}
            <button
              onClick={() => {
                if (confirm('ต้องการรีเซ็ต/ซิงค์ประวัติการขายให้ตรงตามไฟล์ PDF (60 รายการ, รวม ฿51,570.10) หรือไม่?')) {
                  syncFromSalesLedgerPdf();
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-dark-600 transition-colors shadow-sm"
              title="รีเซ็ต/ซิงค์ข้อมูลยอดขายให้ตรงกับไฟล์ PDF 60 รายการ 100%"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>ซิงค์ตาม PDF (60 รายการ)</span>
            </button>

            <button
              onClick={() => onOpenSellItem()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-green-glow"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ บันทึกการขาย Cash Item</span>
            </button>

            {/* Server Filter */}
            <select
              value={salesServerFilter}
              onChange={(e) => setSalesServerFilter(e.target.value as any)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">เซิร์ฟเวอร์ทั้งหมด</option>
              <option value="Baphomet">Baphomet</option>
              <option value="Moonlight">Moonlight</option>
            </select>

            {/* Status Filter */}
            <select
              value={salesStatusFilter}
              onChange={(e) => setSalesStatusFilter(e.target.value as any)}
              className="bg-dark-900 border border-dark-600 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="Clear">🟢 Clear (ชำระแล้ว)</option>
              <option value="Pending">🟡 Pending (รอโอน)</option>
            </select>

            {/* Search */}
            <div className="relative min-w-[170px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="ค้นหาชื่อลูกค้า, สินค้า..."
                value={salesSearchTerm}
                onChange={(e) => setSalesSearchTerm(e.target.value)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900/90 text-slate-400 border-b border-dark-700 select-none uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 font-semibold">รายการไอเทม</th>
                <th className="py-3 px-4 font-semibold">หมวดหมู่</th>
                <th className="py-3 px-4 font-semibold">เซิร์ฟเวอร์</th>
                <th className="py-3 px-4 font-semibold">ชื่อลูกค้า</th>
                <th className="py-3 px-4 font-semibold text-right">จำนวน</th>
                <th className="py-3 px-4 font-semibold text-right">ราคาต่อหน่วย</th>
                <th className="py-3 px-4 font-semibold text-right">ยอดรวม (THB)</th>
                <th className="py-3 px-4 font-semibold text-center">สถานะชำระเงิน</th>
                <th className="py-3 px-4 font-semibold">วันที่ / เวลา</th>
                <th className="py-3 px-4 font-semibold">หมายเหตุ</th>
                <th className="py-3 px-4 font-semibold text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-750">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500">
                    <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                    <p className="text-sm">ไม่พบรายการขายตามเงื่อนไขที่เลือก</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-dark-800/60 transition-colors">
                    {/* Item Name */}
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {sale.itemName}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {sale.category === 'PROMO_FREEBIE' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          🎁 ของแถม
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/30">
                          🛒 ซื้อพอยท์
                        </span>
                      )}
                    </td>

                    {/* Server */}
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {sale.server}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-medium text-white whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{sale.customerName}</span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-right font-bold text-slate-200">
                      {sale.quantity.toLocaleString()}
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-4 text-right text-slate-300">
                      ฿{sale.unitPrice.toLocaleString(undefined, { minimumFractionDigits: sale.unitPrice % 1 !== 0 ? 2 : 0, maximumFractionDigits: 2 })}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 text-right font-black text-emerald-400 text-sm">
                      ฿{sale.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Status Button (Toggle 1-Click) */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleCashSaleStatus(sale.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          sale.status === 'Clear'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                        }`}
                        title="คลิกเพื่อสลับสถานะทันที"
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
                          onClick={() => onOpenEditSale(sale)}
                          className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-dark-700 transition-colors"
                          title="แก้ไข"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบรายการขายของ "${sale.customerName}" หรือไม่?`)) {
                              deleteCashSale(sale.id);
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

        {/* Sales Table Bottom Aggregate */}
        <div className="p-3.5 bg-dark-900 border-t border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            แสดง <strong className="text-white">{filteredSales.length}</strong> จากทั้งหมด {cashSales.length} รายการ
            {cashSales.length === 60 && <span className="ml-1 text-emerald-400 font-medium">(ครบถ้วนตามไฟล์ PDF)</span>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300 font-semibold">ยอดขายรวมตามรายการที่แสดง:</span>
            <span className="text-base font-black text-emerald-400 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              ฿{filteredSalesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
