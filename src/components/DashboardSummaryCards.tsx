'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
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
} from 'lucide-react';

export const DashboardSummaryCards: React.FC = () => {
  const { summary, config } = useApp();

  const isProfit = summary.netProfit >= 0;
  const breakevenPercent = Math.min(100, Math.max(0, summary.isBreakeven));
  const isFullyBreakeven = summary.isBreakeven >= 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Cost */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg group hover:border-slate-500/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            เงินลงทุนทั้งหมด (Total Cost)
          </span>
          <div className="w-9 h-9 rounded-xl bg-slate-700/40 border border-slate-600/50 flex items-center justify-center text-slate-300">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ฿{summary.totalCost.toLocaleString()}
        </div>
        <div className="mt-3 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Figure: ฿{config.figureCostTotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Keycap: ฿{config.keycapCostTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card 2: Total Revenue */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg group hover:border-sky-500/50 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            รายรับทั้งหมด (Total Revenue)
          </span>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ฿{summary.totalRevenue.toLocaleString()}
        </div>
        <div className="mt-3 pt-3 border-t border-dark-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ชำระแล้ว: ฿{summary.clearedRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>รอโอน: ฿{summary.pendingRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Card 3: Net Profit & Breakeven */}
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border p-5 shadow-lg transition-all ${
          isProfit
            ? 'border-emerald-500/40 hover:border-emerald-400 shadow-green-glow'
            : 'border-rose-500/40 hover:border-rose-400'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            กำไร / ขาดทุนสุทธิ (Net P&L)
          </span>
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isProfit
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {isProfit ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}฿{summary.netProfit.toLocaleString()}
          </div>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isProfit
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}
          >
            ROI {summary.roiPercentage >= 0 ? '+' : ''}
            {summary.roiPercentage.toFixed(1)}%
          </span>
        </div>

        {/* Breakeven Indicator */}
        <div className="mt-3 pt-2">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-400 flex items-center gap-1">
              {isFullyBreakeven ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> คืนทุน 100% แล้ว!
                </span>
              ) : (
                <span>
                  คืนทุนไปแล้ว <strong className="text-white">{breakevenPercent.toFixed(1)}%</strong>
                </span>
              )}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {isFullyBreakeven
                ? `กำไรเกินทุน +฿${summary.netProfit.toLocaleString()}`
                : `ขาดอีก ฿${summary.remainingToBreakeven.toLocaleString()}`}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-dark-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFullyBreakeven
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${breakevenPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 4: Stock Balance Overview */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700/80 p-5 shadow-lg group hover:border-purple-500/50 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            สต็อกคงเหลือ (Stock Balance)
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Figure */}
          <div className="bg-dark-900/60 rounded-xl p-2 border border-dark-700/50">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <span>🧸 Figure</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              <span className={summary.figureRemaining === 0 ? 'text-slate-500 line-through' : 'text-amber-400'}>
                {summary.figureRemaining}
              </span>
              <span className="text-slate-400 font-normal text-xs"> / {summary.figureTotal} กล่อง</span>
            </div>
          </div>

          {/* Keycap */}
          <div className="bg-dark-900/60 rounded-xl p-2 border border-dark-700/50">
            <div className="text-slate-400 text-[11px] flex items-center gap-1">
              <span>⌨️ Keycap</span>
            </div>
            <div className="text-base font-bold text-white mt-0.5">
              <span className={summary.keycapRemainingBoxes === 0 ? 'text-slate-500 line-through' : 'text-purple-400'}>
                {summary.keycapRemainingBoxes}
              </span>
              <span className="text-slate-400 font-normal text-xs"> / {summary.keycapTotalBoxes} กล่อง</span>
            </div>
          </div>

          {/* ROC Eggs */}
          <div className="bg-dark-900/60 rounded-xl p-2 border border-dark-700/50">
            <div className="text-slate-400 text-[11px] flex items-center justify-between">
              <span className="text-rose-400 font-semibold">🥚 ไข่ ROC</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              <span className={summary.rocEggsRemaining === 0 ? 'text-slate-500' : 'text-emerald-400'}>
                {summary.rocEggsRemaining.toLocaleString()}
              </span>
              <span className="text-slate-400 font-normal text-[11px]"> / {summary.rocEggsTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* RO Eggs */}
          <div className="bg-dark-900/60 rounded-xl p-2 border border-dark-700/50">
            <div className="text-slate-400 text-[11px] flex items-center justify-between">
              <span className="text-sky-400 font-semibold">🥚 ไข่ RO</span>
            </div>
            <div className="text-sm font-bold text-white mt-0.5">
              <span className={summary.roEggsRemaining === 0 ? 'text-slate-500' : 'text-sky-400'}>
                {summary.roEggsRemaining.toLocaleString()}
              </span>
              <span className="text-slate-400 font-normal text-[11px]"> / {summary.roEggsTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
