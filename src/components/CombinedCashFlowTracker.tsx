'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { BreakEvenWidget } from '@/components/BreakEvenWidget';
import {
  Wallet,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Coins,
  Package,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Building,
  HelpCircle,
  Clock,
} from 'lucide-react';

export const CombinedCashFlowTracker: React.FC = () => {
  const { summary, cashSummary, cashConfig, combinedCashFlow, triggerConfettiEffect } = useApp();

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. Highlight Card: เงินสดจริงในบัญชีธนาคาร (Net Cash in Hand) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-[#12151f]/90 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                บัญชีธนาคารรวม (Central Bank Account)
              </span>
              <span className="text-xs text-slate-400">• อัปเดต Realtime</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              เงินสดจริงคงเหลือในบัญชีธนาคาร (Net Physical Cash in Hand)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              คำนวณจากยอดขายสดที่ได้รับโอนเข้าบัญชีจริงแล้วของทั้ง 2 โปรเจกต์
              หักลบด้วยเงินสด 45,000 THB ที่จ่ายซื้อของ Urgent Call ไป
            </p>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
              ยอดเงินสดคงเหลือปัจจุบัน
            </div>
            <div className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight flex items-baseline lg:justify-end gap-1.5 font-mono">
              <span>
                ฿
                {combinedCashFlow.physicalCashInHand.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-base text-slate-300 font-sans font-semibold">THB</span>
            </div>
          </div>
        </div>

        {/* Breakdown Equation Explanation */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="text-slate-400 flex items-center justify-between">
              <span>1. ยอดขายสด Cash Item</span>
              <span className="text-emerald-400 font-bold">บวกเข้า (+)</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">
              +฿{combinedCashFlow.cashItemClearedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (ยอดเดิม 51,570.10 + ขายใหม่)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-rose-500/30 transition-all">
            <div className="text-slate-400 flex items-center justify-between">
              <span>2. โอนยืมไปซื้อไข่ Urgent Call</span>
              <span className="text-rose-400 font-bold">หักออก (-)</span>
            </div>
            <div className="text-xl font-black text-rose-400 mt-1 font-mono">
              -฿{combinedCashFlow.loanToUrgentCall.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (Figure 21k + Keycap 24k)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="text-slate-400 flex items-center justify-between">
              <span>3. ยอดขายสดโปรเจกต์ไข่ที่รับแล้ว</span>
              <span className="text-emerald-400 font-bold">บวกคืน (+)</span>
            </div>
            <div className="text-xl font-black text-white mt-1 font-mono">
              +฿{combinedCashFlow.urgentCallClearedRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              (ยอดชำระแล้วจากงาน Urgent Call)
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Stakent Break-Even & Liquidity Pool Widget               */}
      {/* ========================================================= */}
      <BreakEvenWidget />

      {/* ========================================================= */}
      {/* 3. ภาพรวมทรัพย์สินรวมทั้งหมด (Combined Portfolio Assets)   */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-[#12151f]/90 border border-white/[0.08] p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                มูลค่าทรัพย์สินและสต็อกรวมทั้งหมด (Combined Total Net Worth)
              </h4>
              <p className="text-xs text-slate-400">
                รวมเงินสดจริง + มูลค่าพอยท์คงเหลือ + มูลค่าสต็อกของแถม + มูลค่าสต็อกสินค้า
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">มูลค่ารวมประเมิน:</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              ฿
              {combinedCashFlow.totalCombinedAssets.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{' '}
              <span className="text-sm font-sans font-semibold text-slate-300">THB</span>
            </div>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Cash in Hand */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-all">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span>💵 เงินสดในบัญชี</span>
            </div>
            <div className="text-base font-bold text-emerald-400 mt-1 font-mono">
              ฿{combinedCashFlow.physicalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">พร้อมใช้งาน</div>
          </div>

          {/* 2. Remaining Points */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-sky-500/30 transition-all">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span>💎 มูลค่าพอยท์</span>
            </div>
            <div className="text-base font-bold text-sky-400 mt-1 font-mono">
              ฿{cashSummary.pointValueThb.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
              88,650 pts @ 0.065
            </div>
          </div>

          {/* 3. Cash Items Stock */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-amber-500/30 transition-all">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span>🎁 สต็อก Cash Items</span>
            </div>
            <div className="text-base font-bold text-amber-400 mt-1 font-mono">
              ฿{cashSummary.totalInventoryValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ของแถม + ซื้อด้วยพอยท์
            </div>
          </div>

          {/* 4. Pending Receivables */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] hover:border-amber-500/30 transition-all">
            <div className="text-slate-400 flex items-center gap-1.5">
              <span>⏳ ลูกหนี้รอโอน</span>
            </div>
            <div className="text-base font-bold text-amber-300 mt-1 font-mono">
              ฿{combinedCashFlow.totalPendingReceivables.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ยอด Pending รวม 2 โปรเจกต์
            </div>
          </div>
        </div>

        {/* Combined Profit Summary Footer */}
        <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white text-sm">
                สรุปกำไรสุทธิรวมจริง (Total Combined Net Profit):
              </span>
              <p className="text-slate-400 text-[11px]">
                เทียบจากเงินลงทุนภายนอกเริ่มต้นเพียง 54,000 THB
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span
              className={`text-xl sm:text-2xl font-black font-mono ${
                combinedCashFlow.totalCombinedNetProfit >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {combinedCashFlow.totalCombinedNetProfit >= 0 ? '+' : ''}฿
              {combinedCashFlow.totalCombinedNetProfit.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              <span className="text-xs font-sans font-semibold text-slate-400">THB</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

