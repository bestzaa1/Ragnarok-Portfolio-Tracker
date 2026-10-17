'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  Layers,
  Coins,
  Wallet,
} from 'lucide-react';

export const BreakEvenWidget: React.FC = () => {
  const { cashSummary, combinedCashFlow, triggerConfettiEffect } = useApp();

  const isUrgentRepaid = combinedCashFlow.urgentCallIsRepaid;
  const urgentRepaidPercent = Math.min(100, Math.max(0, combinedCashFlow.urgentCallRepaidPercent));

  const isCashBreakeven = cashSummary.isBreakeven;
  const cashBreakevenPercent = Math.min(100, Math.max(0, cashSummary.breakevenPercent));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6">
      {/* Widget 1: Investment Period & Loan Repayment (Inspired by Stakent Investment Period) */}
      <div className="lg:col-span-7 stakent-card rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div>
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Inter-Project Liquidity Pool
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  สถานะการคืนเงินยืมกองกลาง (Loan 45k)
                </h3>
              </div>
            </div>

            {isUrgentRepaid ? (
              <button
                onClick={triggerConfettiEffect}
                className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto hover:bg-emerald-500/25 transition-all shadow-emerald-glow/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>คืนครบ 100% แล้ว 🎉</span>
              </button>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold self-start sm:self-auto font-mono">
                รอคืนอีก ฿{combinedCashFlow.urgentCallRemainingToRepay.toLocaleString()}
              </span>
            )}
          </div>

          {/* Large Numbers Row */}
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <div className="text-xs text-slate-400 font-medium">ความคืบหน้าการชำระคืน</div>
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white mt-0.5">
                {urgentRepaidPercent.toFixed(1)}%
              </div>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              <span className="text-emerald-400 font-bold">
                ฿{combinedCashFlow.urgentCallClearedRevenue.toLocaleString()}
              </span>{' '}
              / ฿{combinedCashFlow.loanToUrgentCall.toLocaleString()} THB
            </div>
          </div>

          {/* Stakent Styled Progress Track with Waveform Nodes */}
          <div className="relative my-6">
            {/* Background track */}
            <div className="w-full h-3 rounded-full bg-white/[0.05] p-0.5 border border-white/[0.04] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isUrgentRepaid
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-emerald-glow'
                    : 'bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-400 shadow-violet-glow'
                }`}
                style={{ width: `${urgentRepaidPercent}%` }}
              />
            </div>

            {/* Milestones Indicator Pills */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2.5">
              <span className="text-slate-400">0% Start</span>
              <span className={urgentRepaidPercent >= 25 ? 'text-violet-400 font-bold' : ''}>25%</span>
              <span className={urgentRepaidPercent >= 50 ? 'text-violet-400 font-bold' : ''}>50% Half</span>
              <span className={urgentRepaidPercent >= 75 ? 'text-violet-400 font-bold' : ''}>75%</span>
              <span className={isUrgentRepaid ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                100% Repaid
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metric Pills at bottom */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-white/[0.06] text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-slate-500">เงินยืมซื้อของ</div>
            <div className="font-bold text-slate-200 mt-0.5">
              ฿{combinedCashFlow.loanToUrgentCall.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-emerald-400">รับคืนแล้ว</div>
            <div className="font-bold text-emerald-400 mt-0.5">
              ฿{combinedCashFlow.urgentCallClearedRevenue.toLocaleString()}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[10px] text-amber-400">คงเหลือต้องคืน</div>
            <div className="font-bold text-amber-300 mt-0.5">
              ฿{combinedCashFlow.urgentCallRemainingToRepay.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: Liquid Staking / Cash Portfolio 54k Breakeven Card */}
      <div className="lg:col-span-5 stakent-card-highlight rounded-3xl p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between">
        {/* Stakent Ambient Purple Flare at Bottom */}
        <div className="absolute bottom-0 right-0 left-0 h-32 bg-gradient-to-t from-violet-600/20 via-indigo-600/5 to-transparent pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="font-black text-xs text-white uppercase tracking-wider">
                Cash Portfolio 54k
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Liquid Capital
              </span>
            </div>
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
                isCashBreakeven
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-lg font-black text-white">
            สถานะคืนทุนพอร์ตเดิม (54,000 THB)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ยอดขายสดสะสมจากของแถมและพอยท์ เทียบเงินลงทุนเติมเงินเดิม
          </p>

          {/* Big Percentage Display */}
          <div className="my-5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                {cashSummary.breakevenPercent.toFixed(1)}%
              </span>
              {isCashBreakeven ? (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  กำไรเกินทุน
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400 font-mono">
                  ขาดอีก ฿{cashSummary.remainingToBreakeven.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              )}
            </div>

            <div className="text-right text-xs font-mono">
              <span className="text-slate-400 block text-[10px]">ยอดขายสดจริง</span>
              <span className="text-emerald-400 font-bold">
                ฿{cashSummary.clearedCashSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden border border-white/[0.05]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isCashBreakeven
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-glow'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(100, cashSummary.breakevenPercent)}%` }}
            />
          </div>
        </div>

        {/* Portfolio Valuation Summary Footnote */}
        <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Coins className="w-4 h-4 text-purple-400" />
            <span className="text-[11px]">มูลค่าสินทรัพย์รวม (Cash+Stock+Pts):</span>
          </div>
          <span className="text-sm font-black text-violet-300">
            ฿{cashSummary.totalAssetsValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} THB
          </span>
        </div>
      </div>
    </div>
  );
};
