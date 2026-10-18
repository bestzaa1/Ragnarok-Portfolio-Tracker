'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { GocLibraCategory, GocLibraItem, GocLibraSale, PaymentStatus } from '@/types';
import { SparklineGraph } from './SparklineGraph';
import {
  Sparkles,
  Package,
  Egg,
  Gift,
  Plus,
  Minus,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  RotateCcw,
  Calendar,
  ShieldCheck,
  Award,
  Search,
  Filter,
  X,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';

type SubTabType = 'ALL' | 'SILVERVINE' | 'LIBRA_SCROLL' | 'PROMO_GOODIE';

export default function GocLibraTracker() {
  const {
    gocLibraItems,
    gocLibraSales,
    gocLibraConfig,
    gocLibraSummary,
    isAdmin,
    adjustGocLibraItemStock,
    updateGocLibraItem,
    addGocLibraItem,
    deleteGocLibraItem,
    addGocLibraSale,
    updateGocLibraSale,
    deleteGocLibraSale,
    toggleGocLibraSaleStatus,
    resetGocLibraDefault,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<SubTabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL');

  // Sale Modal State
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<GocLibraSale | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [saleCustomer, setSaleCustomer] = useState('');
  const [saleQty, setSaleQty] = useState<number>(1);
  const [saleUnitPrice, setSaleUnitPrice] = useState<number>(150);
  const [saleServer, setSaleServer] = useState('Baphomet / RO');
  const [saleStatus, setSaleStatus] = useState<PaymentStatus>('Clear');
  const [saleDate, setSaleDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [saleNote, setSaleNote] = useState('');

  // Item Edit / Forecast Price Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GocLibraItem | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<GocLibraCategory>('PROMO_GOODIE');
  const [itemServer, setItemServer] = useState('RO / ROC');
  const [itemTotalQty, setItemTotalQty] = useState<number>(1);
  const [itemStockQty, setItemStockQty] = useState<number>(1);
  const [itemTargetPrice, setItemTargetPrice] = useState<number>(1000);
  const [itemUnitLabel, setItemUnitLabel] = useState('ชิ้น');
  const [itemNote, setItemNote] = useState('');

  const silvervineItem = useMemo(
    () => gocLibraItems.find((i) => i.category === 'SILVERVINE') || gocLibraItems[0],
    [gocLibraItems]
  );
  const libraItem = useMemo(
    () => gocLibraItems.find((i) => i.category === 'LIBRA_SCROLL') || gocLibraItems[1],
    [gocLibraItems]
  );
  const promoGoodies = useMemo(
    () => gocLibraItems.filter((i) => i.category === 'PROMO_GOODIE'),
    [gocLibraItems]
  );

  // Open Sale Modal helper
  const handleOpenNewSale = (preselectItem?: GocLibraItem) => {
    if (!isAdmin) return;
    setEditingSale(null);
    const targetItem = preselectItem || silvervineItem || gocLibraItems[0];
    if (targetItem) {
      setSelectedItemId(targetItem.id);
      setSaleUnitPrice(
        targetItem.category === 'SILVERVINE'
          ? 150
          : targetItem.category === 'LIBRA_SCROLL'
          ? 55
          : targetItem.targetPricePerUnit || 500
      );
      setSaleServer(targetItem.server || 'Baphomet / RO');
    }
    setSaleCustomer('');
    setSaleQty(1);
    setSaleStatus('Clear');
    setSaleDate(new Date().toISOString().slice(0, 16));
    setSaleNote('');
    setSaleModalOpen(true);
  };

  const handleOpenEditSale = (sale: GocLibraSale) => {
    if (!isAdmin) return;
    setEditingSale(sale);
    setSelectedItemId(sale.itemId);
    setSaleCustomer(sale.customerName);
    setSaleQty(sale.quantity);
    setSaleUnitPrice(sale.unitPrice);
    setSaleServer(sale.server);
    setSaleStatus(sale.status);
    setSaleDate(sale.date.slice(0, 16));
    setSaleNote(sale.note || '');
    setSaleModalOpen(true);
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const item = gocLibraItems.find((i) => i.id === selectedItemId);
    const totalAmount = (Number(saleQty) || 0) * (Number(saleUnitPrice) || 0);

    if (editingSale) {
      await updateGocLibraSale(editingSale.id, {
        itemId: selectedItemId,
        itemName: item ? item.name : editingSale.itemName,
        category: item ? item.category : editingSale.category,
        customerName: saleCustomer.trim() || 'ลูกค้าทั่วไป',
        quantity: Number(saleQty) || 1,
        unitPrice: Number(saleUnitPrice) || 0,
        totalAmount,
        server: saleServer,
        status: saleStatus,
        date: saleDate,
        note: saleNote,
      });
    } else {
      await addGocLibraSale({
        itemId: selectedItemId,
        itemName: item ? item.name : 'สินค้าโปรโมชั่น',
        category: item ? item.category : 'PROMO_GOODIE',
        customerName: saleCustomer.trim() || 'ลูกค้าทั่วไป',
        quantity: Number(saleQty) || 1,
        unitPrice: Number(saleUnitPrice) || 0,
        totalAmount,
        server: saleServer,
        status: saleStatus,
        date: saleDate,
        note: saleNote,
      });
    }
    setSaleModalOpen(false);
  };

  // Open Item Edit / Add Modal helper
  const handleOpenEditItem = (item: GocLibraItem) => {
    if (!isAdmin) return;
    setEditingItem(item);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemServer(item.server);
    setItemTotalQty(item.totalQty);
    setItemStockQty(item.stockQty);
    setItemTargetPrice(item.targetPricePerUnit);
    setItemUnitLabel(item.unitLabel || 'ชิ้น');
    setItemNote(item.note || '');
    setItemModalOpen(true);
  };

  const handleOpenAddItem = () => {
    if (!isAdmin) return;
    setEditingItem(null);
    setItemName('');
    setItemCategory('PROMO_GOODIE');
    setItemServer('RO / ROC');
    setItemTotalQty(1);
    setItemStockQty(1);
    setItemTargetPrice(1000);
    setItemUnitLabel('ชิ้น');
    setItemNote('ของแถมโปรโมชั่น GOC & Libra');
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (editingItem) {
      await updateGocLibraItem(editingItem.id, {
        name: itemName.trim() || editingItem.name,
        category: itemCategory,
        server: itemServer,
        totalQty: Number(itemTotalQty) || 1,
        stockQty: Number(itemStockQty) || 0,
        targetPricePerUnit: Number(itemTargetPrice) || 0,
        unitLabel: itemUnitLabel || 'ชิ้น',
        note: itemNote,
      });
    } else {
      await addGocLibraItem({
        name: itemName.trim() || 'ของแถมโปรโมชั่นใหม่',
        category: itemCategory,
        server: itemServer,
        totalQty: Number(itemTotalQty) || 1,
        soldQty: 0,
        stockQty: Number(itemStockQty) || 1,
        pointsUsed: 0,
        avgCostPerUnit: 0,
        targetPricePerUnit: Number(itemTargetPrice) || 0,
        unitLabel: itemUnitLabel || 'ชิ้น',
        note: itemNote,
      });
    }
    setItemModalOpen(false);
  };

  // Filtered sales for ledger
  const filteredSales = useMemo(() => {
    return gocLibraSales.filter((s) => {
      if (activeSubTab !== 'ALL' && s.category !== activeSubTab) return false;
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.customerName.toLowerCase().includes(q) ||
          s.itemName.toLowerCase().includes(q) ||
          (s.note && s.note.toLowerCase().includes(q)) ||
          s.server.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [gocLibraSales, activeSubTab, statusFilter, searchQuery]);

  const breakevenClamped = Math.min(100, Math.max(0, gocLibraSummary.breakevenPercent));

  return (
    <div className="space-y-6">
      {/* Project Hero Banner */}
      <div className="stakent-card relative overflow-hidden rounded-2xl p-5 sm:p-6">
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #8B5CF6 0%, #06B6D4 60%, transparent 100%)',
          }}
        />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-300">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                PROJECT ID: promo_oct_14k
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                <Calendar className="h-3.5 w-3.5 text-amber-400" />
                รอบลงทุน 18 ต.ค. 2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                150,000 GOC Pay Points (@0.095 บ.)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              ✨ GOC & Libra Promo (14.25k) — Silvervine, ไข่ Libra & ของแถมโปร
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              ยืมเงินสดจากกองกลาง (Inter-project Loan){' '}
              <span className="font-semibold text-amber-300">฿14,250</span> • แบ่งซื้อ{' '}
              <span className="text-cyan-300 font-medium">Silvervine 105 กล่อง (105k pts)</span> +{' '}
              <span className="text-violet-300 font-medium">ไข่ Libra 100 ฟอง (45k pts)</span> + ของแถมโปรโมชั่น
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleOpenNewSale(silvervineItem)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  บันทึกการขายใหม่
                </button>
                <button
                  onClick={handleOpenAddItem}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-[#161B26] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-violet-500/40 hover:text-white transition-all cursor-pointer"
                >
                  <Gift className="h-4 w-4 text-amber-400" />
                  + เพิ่มของแถม
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs text-slate-400">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                โหมดดูอย่างเดียว (ปลดล็อก Admin เพื่อแก้ไข)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row A: 4 Metric KPI Cards (Stakent Dark Style + SparklineGraph) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Total Cost */}
        <div className="stakent-card relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                เงินทุนโปรเจกต์ (Total Cost)
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white tabular-nums">
                  ฿{gocLibraSummary.totalCost.toLocaleString()}
                </span>
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                  ยืมกองกลาง
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                150,000 GOC Points • เรท{' '}
                <span className="text-slate-200 font-semibold">0.095 บ./พอยท์</span>
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400">
              SV: <span className="text-slate-200 font-medium">105k pts</span> | Libra:{' '}
              <span className="text-slate-200 font-medium">45k pts</span>
            </div>
            <div className="w-20">
              <SparklineGraph color="amber" trend="steady" height={26} />
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="stakent-card relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                รายรับรวม (Total Revenue)
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-400 tabular-nums">
                  ฿{gocLibraSummary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  {gocLibraSales.length} รายการ
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3 text-xs">
                <span className="text-emerald-400 font-medium">
                  รับแล้ว: ฿{gocLibraSummary.clearedRevenue.toLocaleString()}
                </span>
                {gocLibraSummary.pendingRevenue > 0 && (
                  <span className="text-amber-400 font-medium">
                    ค้างรับ: ฿{gocLibraSummary.pendingRevenue.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400">
              มูลค่าสต็อกคงเหลือประเมิน:{' '}
              <span className="text-cyan-300 font-semibold">
                ฿{gocLibraSummary.estimatedRemainingStockValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-20">
              <SparklineGraph color="emerald" trend="up" height={26} />
            </div>
          </div>
        </div>

        {/* Card 3: Net P&L & ROI */}
        <div className="stakent-card relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                กำไร/ขาดทุนสุทธิ (Net P&L)
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                    gocLibraSummary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {gocLibraSummary.netProfit >= 0 ? '+' : '-'}฿
                  {Math.abs(gocLibraSummary.netProfit).toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
                    gocLibraSummary.roiPercentage >= 0
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {gocLibraSummary.roiPercentage >= 0 ? '+' : ''}
                  {gocLibraSummary.roiPercentage.toFixed(1)}% ROI
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-400">
                คิดจากรายรับรวม - ทุน ฿14,250
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="text-[11px] text-slate-400">
              ถ้ารวมขายสต็อกที่เหลือ:{' '}
              <span className="text-emerald-300 font-semibold">
                +฿
                {Math.max(
                  0,
                  gocLibraSummary.totalRevenue +
                    gocLibraSummary.estimatedRemainingStockValue -
                    gocLibraSummary.totalCost
                ).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="w-20">
              <SparklineGraph
                color={gocLibraSummary.netProfit >= 0 ? 'emerald' : 'purple'}
                trend="up"
                height={26}
              />
            </div>
          </div>
        </div>

        {/* Card 4: Breakeven Progress */}
        <div className="stakent-card relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-full">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  ความคืบหน้าคืนทุน (Breakeven)
                </p>
                <span className="text-xs font-extrabold text-cyan-400 tabular-nums">
                  {gocLibraSummary.breakevenPercent.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                {gocLibraSummary.isBreakeven ? (
                  <span className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                    🎉 คืนทุนครบ 100% แล้ว!
                  </span>
                ) : (
                  <span className="text-xl sm:text-2xl font-extrabold text-white tabular-nums">
                    ขาดอีก ฿{gocLibraSummary.remainingToBreakeven.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-400">
                คืนเงินยืมกองกลางแล้ว{' '}
                <span className="text-emerald-300 font-semibold">
                  ฿{Math.min(gocLibraSummary.clearedRevenue, gocLibraSummary.totalCost).toLocaleString()}
                </span>{' '}
                / ฿14,250
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800/90 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${breakevenClamped}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>0%</span>
              <span>เป้าหมายคืนทุน ฿14,250</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row B: 2 Hero Inventory Cards (Silvervine 105 Boxes & Libra Scroll 100 Eggs) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* 1. หมวด Silvervine (105 กล่อง) */}
        {silvervineItem && (
          <div className="stakent-card relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-cyan-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-inner">
                  <Package className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      1. หมวด Silvervine (105 กล่อง)
                    </h3>
                    <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                      105,000 Pts
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    ต้นทุนพอยท์ ~฿95/กล่อง (หรือคิดเทียบทุนรวม ~฿135.71/กล่อง)
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenNewSale(silvervineItem)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-blue-500 transition-all cursor-pointer shrink-0"
                >
                  <ShoppingCart className="h-4 w-4" />
                  ขาย Silvervine
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#0B0E14]/90 border border-slate-800/80 p-3.5">
                <p className="text-[11px] text-slate-400">โควตาเริ่มต้น</p>
                <p className="mt-1 text-xl font-extrabold text-white tabular-nums">
                  {silvervineItem.totalQty}{' '}
                  <span className="text-xs font-normal text-slate-400">กล่อง</span>
                </p>
              </div>

              <div className="rounded-xl bg-[#0B0E14]/90 border border-slate-800/80 p-3.5">
                <p className="text-[11px] text-slate-400">ขายไปแล้ว</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-400 tabular-nums">
                  {silvervineItem.soldQty}{' '}
                  <span className="text-xs font-normal text-slate-400">กล่อง</span>
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  รวม ฿{gocLibraSummary.silvervineRevenue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-950/20 border border-cyan-500/30 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-cyan-300">คงเหลือ (REMAIN)</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditItem(silvervineItem)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="แก้ไขราคาประเมิน/จำนวน"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-2xl font-extrabold text-cyan-300 tabular-nums">
                    {silvervineItem.stockQty}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustGocLibraItemStock(silvervineItem.id, -1)}
                        disabled={silvervineItem.stockQty <= 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40 transition-all cursor-pointer"
                        title="ลดสต็อก 1 กล่อง"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => adjustGocLibraItemStock(silvervineItem.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer"
                        title="เพิ่มสต็อก 1 กล่อง"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>ความคืบหน้าการระบายสต็อก Silvervine</span>
                <span className="text-cyan-300 font-bold">
                  {silvervineItem.totalQty > 0
                    ? (((silvervineItem.totalQty - silvervineItem.stockQty) / silvervineItem.totalQty) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{
                    width: `${
                      silvervineItem.totalQty > 0
                        ? Math.min(
                            100,
                            ((silvervineItem.totalQty - silvervineItem.stockQty) /
                              silvervineItem.totalQty) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. หมวด Libra Scroll (100 ฟอง) */}
        {libraItem && (
          <div className="stakent-card relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-violet-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-400 shadow-inner">
                  <Egg className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base sm:text-lg font-extrabold text-white">
                      2. หมวด Libra Scroll (100 ฟอง)
                    </h3>
                    <span className="rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[11px] font-bold text-violet-300">
                      45,000 Pts
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    ต้นทุนเฉลี่ย ~฿42.75/ฟอง • ราคาเป้าหมายประเมิน ฿{libraItem.targetPricePerUnit}/ฟอง
                  </p>
                </div>
              </div>

              {isAdmin && (
                <button
                  onClick={() => handleOpenNewSale(libraItem)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-600/20 hover:from-violet-500 hover:to-fuchsia-500 transition-all cursor-pointer shrink-0"
                >
                  <ShoppingCart className="h-4 w-4" />
                  ขายไข่ Libra
                </button>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#0B0E14]/90 border border-slate-800/80 p-3.5">
                <p className="text-[11px] text-slate-400">โควตาเริ่มต้น</p>
                <p className="mt-1 text-xl font-extrabold text-white tabular-nums">
                  {libraItem.totalQty}{' '}
                  <span className="text-xs font-normal text-slate-400">ฟอง</span>
                </p>
              </div>

              <div className="rounded-xl bg-[#0B0E14]/90 border border-slate-800/80 p-3.5">
                <p className="text-[11px] text-slate-400">ขายไปแล้ว</p>
                <p className="mt-1 text-xl font-extrabold text-emerald-400 tabular-nums">
                  {libraItem.soldQty}{' '}
                  <span className="text-xs font-normal text-slate-400">ฟอง</span>
                </p>
                <p className="text-[11px] text-emerald-400/80 mt-0.5">
                  รวม ฿{gocLibraSummary.libraRevenue.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-violet-950/20 border border-violet-500/30 p-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-violet-300">คงเหลือ (REMAIN)</p>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEditItem(libraItem)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="แก้ไขราคาประเมิน/จำนวน"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-2xl font-extrabold text-violet-300 tabular-nums">
                    {libraItem.stockQty}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => adjustGocLibraItemStock(libraItem.id, -1)}
                        disabled={libraItem.stockQty <= 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40 transition-all cursor-pointer"
                        title="ลดสต็อก 1 ฟอง"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => adjustGocLibraItemStock(libraItem.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all cursor-pointer"
                        title="เพิ่มสต็อก 1 ฟอง"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>ความคืบหน้าการระบายสต็อกไข่ Libra</span>
                <span className="text-violet-300 font-bold">
                  {libraItem.totalQty > 0
                    ? (((libraItem.totalQty - libraItem.stockQty) / libraItem.totalQty) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-all duration-300"
                  style={{
                    width: `${
                      libraItem.totalQty > 0
                        ? Math.min(
                            100,
                            ((libraItem.totalQty - libraItem.stockQty) / libraItem.totalQty) * 100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: หมวดของแถม & Physical Goodies (Promotion Rewards) */}
      <div className="stakent-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                3. หมวดของแถมโปรโมชั่น & Physical Goodies (ต้นทุน 0 บาท)
              </h3>
              <p className="text-xs text-slate-400">
                ปฏิทิน 2026 + Item Code, ตั๋ว Ancient Guarantee, เข็มกลัดที่ระลึก และ Tier Spending Rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">
              ยอดขายของแถม: ฿{gocLibraSummary.goodiesRevenue.toLocaleString()}
            </span>
            {isAdmin && (
              <button
                onClick={handleOpenAddItem}
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/15 px-3 py-1.5 text-xs font-bold text-violet-300 hover:bg-violet-500/25 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                เพิ่มรายการของแถม
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-3">รายการของแถม / รางวัลโปรโมชั่น</th>
                <th className="py-3 px-3">Server / ประเภท</th>
                <th className="py-3 px-3 text-center">จำนวนรวม</th>
                <th className="py-3 px-3 text-center">คงเหลือ (REMAIN)</th>
                <th className="py-3 px-3 text-right">ราคาประเมิน/ชิ้น (Forecast)</th>
                <th className="py-3 px-3 text-right">มูลค่าคงเหลือประเมิน</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {promoGoodies.map((item) => {
                const remainValue = (Number(item.stockQty) || 0) * (Number(item.targetPricePerUnit) || 0);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{item.name}</div>
                      {item.note && <div className="text-[11px] text-slate-400 mt-0.5">{item.note}</div>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {item.server}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-300 tabular-nums">
                      {item.totalQty} {item.unitLabel}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-2">
                        {isAdmin && (
                          <button
                            onClick={() => adjustGocLibraItemStock(item.id, -1)}
                            disabled={item.stockQty <= 0}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                        <span
                          className={`min-w-[2.5rem] text-center font-extrabold tabular-nums px-2 py-0.5 rounded-md ${
                            item.stockQty > 0
                              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800/70 text-slate-500'
                          }`}
                        >
                          {item.stockQty}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => adjustGocLibraItemStock(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-amber-300 tabular-nums">
                      ฿{item.targetPricePerUnit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-cyan-300 tabular-nums">
                      ฿{remainValue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {isAdmin ? (
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenNewSale(item)}
                            disabled={item.stockQty <= 0}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 disabled:opacity-40 transition-all cursor-pointer"
                          >
                            <ShoppingCart className="h-3 w-3" />
                            ขาย
                          </button>
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white hover:border-slate-600 cursor-pointer"
                            title="ตั้งราคาประเมิน / แก้ไข"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`ยืนยันการลบรายการ "${item.name}" ?`)) {
                                deleteGocLibraItem(item.id);
                              }
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: ตารางบันทึกยอดขายโปรเจกต์ GOC & Libra Promo (Sales Ledger) */}
      <div className="stakent-card rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-violet-400" />
              ประวัติการขายในโปรเจกต์ GOC & Libra Promo ({filteredSales.length} รายการ)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ยอดขายที่สถานะเป็น <span className="text-emerald-400 font-semibold">Clear</span> จะถูกโอนกลับเข้าบัญชีเงินสดกองกลางอัตโนมัติ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Pills */}
            {(
              [
                { id: 'ALL', label: 'ทั้งหมด' },
                { id: 'SILVERVINE', label: 'Silvervine' },
                { id: 'LIBRA_SCROLL', label: 'ไข่ Libra' },
                { id: 'PROMO_GOODIE', label: 'ของแถมโปร' },
              ] as { id: SubTabType; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === t.id
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/25'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}

            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อลูกค้า / ไอเทม..."
                className="rounded-xl border border-slate-700/80 bg-[#0B0E14] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {filteredSales.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0B0E14]/50 p-10 text-center">
            <ShoppingCart className="mx-auto h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm font-bold text-slate-300">ยังไม่มีรายการบันทึกยอดขายในหมวดนี้</p>
            <p className="text-xs text-slate-500 mt-1">
              เมื่อขาย Silvervine, ไข่ Libra หรือของแถมโปรโมชั่น กดปุ่ม &ldquo;บันทึกการขายใหม่&rdquo; ด้านบนเพื่อตัดสต็อกและรับเงินเข้าพอร์ตได้เลย
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">วันที่</th>
                  <th className="py-3 px-3">หมวดหมู่</th>
                  <th className="py-3 px-3">รายการสินค้า</th>
                  <th className="py-3 px-3">ชื่อลูกค้า</th>
                  <th className="py-3 px-3 text-center">จำนวน</th>
                  <th className="py-3 px-3 text-right">ราคา/หน่วย</th>
                  <th className="py-3 px-3 text-right">ยอดรวมสุทธิ</th>
                  <th className="py-3 px-3 text-center">สถานะ</th>
                  <th className="py-3 px-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-xs text-slate-400 whitespace-nowrap">
                      {sale.date.replace('T', ' ').slice(0, 16)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          sale.category === 'SILVERVINE'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : sale.category === 'LIBRA_SCROLL'
                            ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {sale.category === 'SILVERVINE'
                          ? 'Silvervine'
                          : sale.category === 'LIBRA_SCROLL'
                          ? 'Libra Scroll'
                          : 'Promo Goodie'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      {sale.itemName}
                      {sale.note && (
                        <span className="block text-[11px] font-normal text-slate-400">
                          {sale.note}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-200">{sale.customerName}</td>
                    <td className="py-3 px-3 text-center font-bold text-white tabular-nums">
                      {sale.quantity}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                      ฿{sale.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-emerald-400 tabular-nums">
                      ฿{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => isAdmin && toggleGocLibraSaleStatus(sale.id)}
                        disabled={!isAdmin}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all ${
                          sale.status === 'Clear'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                      >
                        {sale.status === 'Clear' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {sale.status}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isAdmin ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditSale(sale)}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:text-white cursor-pointer"
                            title="แก้ไขรายการขาย"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `ยืนยันการลบรายการขาย "${sale.itemName}" ของคุณ ${sale.customerName} (จำนวน ${sale.quantity} ชิ้นจะถูกคืนเข้าสต็อก)?`
                                )
                              ) {
                                deleteGocLibraSale(sale.id);
                              }
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="ลบรายการขายและคืนสต็อก"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Modal */}
      {saleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/80 bg-[#12161F] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-violet-400" />
                {editingSale ? 'แก้ไขรายการขาย (GOC & Libra)' : 'บันทึกการขาย (GOC & Libra Promo)'}
              </h3>
              <button
                onClick={() => setSaleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  เลือกสินค้าที่จะขาย (ตัดสต็อกอัตโนมัติ)
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedItemId(id);
                    const found = gocLibraItems.find((i) => i.id === id);
                    if (found) {
                      setSaleUnitPrice(
                        found.category === 'SILVERVINE'
                          ? 150
                          : found.category === 'LIBRA_SCROLL'
                          ? 55
                          : found.targetPricePerUnit || 500
                      );
                      setSaleServer(found.server);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                >
                  {gocLibraItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (คงเหลือ {item.stockQty} {item.unitLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ชื่อลูกค้า / ผู้ซื้อ
                  </label>
                  <input
                    type="text"
                    required
                    value={saleCustomer}
                    onChange={(e) => setSaleCustomer(e.target.value)}
                    placeholder="เช่น คุณบอย / ตี้กิลด์"
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    เซิร์ฟเวอร์ / ช่องทาง
                  </label>
                  <input
                    type="text"
                    value={saleServer}
                    onChange={(e) => setSaleServer(e.target.value)}
                    placeholder="Baphomet / RO / ROC"
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    จำนวนที่ขาย
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={saleQty}
                    onChange={(e) => setSaleQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm font-bold text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ราคาขายต่อหน่วย (บาท)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={saleUnitPrice}
                    onChange={(e) => setSaleUnitPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm font-bold text-emerald-400 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300">ยอดเงินรวมสุทธิ:</span>
                <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
                  ฿{((Number(saleQty) || 0) * (Number(saleUnitPrice) || 0)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    สถานะการชำระเงิน
                  </label>
                  <select
                    value={saleStatus}
                    onChange={(e) => setSaleStatus(e.target.value as PaymentStatus)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="Clear">✅ Clear (โอนเงินแล้ว)</option>
                    <option value="Pending">⏳ Pending (รอโอน/ค้างชำระ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    วันที่ขาย
                  </label>
                  <input
                    type="datetime-local"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  หมายเหตุเพิ่มเติม (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={saleNote}
                  onChange={(e) => setSaleNote(e.target.value)}
                  placeholder="เช่น โอนเข้ากสิกร / แบ่งจ่าย"
                  className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSaleModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500 cursor-pointer"
                >
                  {editingSale ? 'บันทึกการแก้ไข' : 'ยืนยันการขาย'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Edit / Add Modal */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#12161F] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-400" />
                {editingItem ? 'แก้ไขข้อมูลสินค้า / ราคาประเมิน' : 'เพิ่มรายการของแถมโปรโมชั่น'}
              </h3>
              <button
                onClick={() => setItemModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  ชื่อไอเทม / ของแถม
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Server / ประเภท
                  </label>
                  <input
                    type="text"
                    value={itemServer}
                    onChange={(e) => setItemServer(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    หน่วยนับ
                  </label>
                  <input
                    type="text"
                    value={itemUnitLabel}
                    onChange={(e) => setItemUnitLabel(e.target.value)}
                    placeholder="กล่อง / ฟอง / เซ็ต / ใบ"
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    โควตารวม
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={itemTotalQty}
                    onChange={(e) => setItemTotalQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    คงเหลือ
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={itemStockQty}
                    onChange={(e) => setItemStockQty(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3 py-2 text-sm font-bold text-cyan-300 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    ราคาประเมิน (บ.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={itemTargetPrice}
                    onChange={(e) => setItemTargetPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3 py-2 text-sm font-bold text-amber-300 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  รายละเอียด / หมายเหตุ
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B0E14] px-3.5 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-500 cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
