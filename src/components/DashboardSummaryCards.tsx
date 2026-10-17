'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SparklineGraph } from './SparklineGraph';
import {
  Wallet,
  TrendingUp,
  Percent,
  Package,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const DashboardSummaryCards: React.FC = () => {
  const { summary, config } = useApp();

  const isProfit = summary.netProfit >= 0;
  const breakevenPercent = Math.min(100, Math.max(0, summary.isBreakeven));
  const isFullyBreakeven = summary.isBreakeven >= 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Cost */}
      <div className="stakent-card rounded-2xl p-5 relative overflow-hidden group hover:border-slate-600/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-white/[0.08] flex items-center justify-center text-slate-300">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              เงินลงทุนทั้งหมด
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400 border border-white/[0.06]">
            Total Cost
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
          ฿{summary.totalCost.toLocaleString()}
        </div>

        {/* Mini Sparkline Underneath */}
        <div className="mt-1">
          <SparklineGraph color="purple" trend="steady" height={36} />
        </div>

        <div className="mt-2 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Fig: ฿{config.figureCostTotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>Key: ฿{config.keycapCostTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Revenue */}
      <div className="stakent-card rounded-2xl p-5 relative overflow-hidden group hover:border-sky-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">
              รายรับทั้งหมด
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>Revenue</span>
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
          ฿{summary.totalRevenue.toLocaleString()}
        </div>

        {/* Mini Sparkline Underneath */}
        <div className="mt-1">
          <SparklineGraph color="blue" trend="up" height={36} />
        </div>

        <div className="mt-2 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>ชำระ: ฿{summary.clearedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Clock className="w-3 h-3" />
            <span>รอ: ฿{summary.pendingRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Net Profit & Breakeven */}
      <div
        className={`stakent-card rounded-2xl p-5 relative overflow-hidden transition-all ${
          isProfit
            ? 'border-emerald-500/30 hover:border-emerald-500/50 shadow-emerald-glow/20'
            : 'border-rose-500/30 hover:border-rose-500/50'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isProfit
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
              }`}
            >
              {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
              กำไร / ขาดทุนสุทธิ
            </span>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isProfit
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            ROI {summary.roiPercentage >= 0 ? '+' : ''}
            {summary.roiPercentage.toFixed(1)}%
          </span>
        </div>

        <div
          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
            isProfit ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {isProfit ? '+' : ''}฿{summary.netProfit.toLocaleString()}
        </div>

        {/* Mini Sparkline Underneath */}
        <div className="mt-1">
          <SparklineGraph color={isProfit ? 'emerald' : 'rose'} trend={isProfit ? 'up' : 'down'} height={36} />
        </div>

        <div className="mt-2 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-mono">
            {isFullyBreakeven ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> คืนทุน 100% แล้ว
              </span>
            ) : (
              <span>
                คืนทุน <strong className="text-white">{breakevenPercent.toFixed(1)}%</strong>
              </span>
            )}
          </span>
          <span className="text-slate-400 font-mono text-[10px]">
            {isFullyBreakeven
              ? `+฿${summary.netProfit.toLocaleString()}`
              : `ขาดอีก ฿${summary.remainingToBreakeven.toLocaleString()}`}
          </span>
        </div>
      </div>

      {/* Card 4: Stock Balance Overview */}
      <div className="stakent-card rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
              สต็อกไข่คงเหลือ
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
            Inventory
          </span>
        </div>

        <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 tracking-tight flex items-baseline gap-1.5">
          <span>{(summary.rocEggsRemaining + summary.roEggsRemaining).toLocaleString()}</span>
          <span className="text-xs font-sans text-slate-400 font-medium">ฟอง</span>
        </div>

        {/* Mini Sparkline Underneath */}
        <div className="mt-1">
          <SparklineGraph color="purple" trend="steady" height={36} />
        </div>

        <div className="mt-2 pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>ROC: {summary.rocEggsRemaining.toLocaleString()} ฟอง</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>RO: {summary.roEggsRemaining.toLocaleString()} ฟอง</span>
          </div>
        </div>
      </div>
    </div>
  );
};
