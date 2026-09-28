'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
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

  const isRepaid = combinedCashFlow.urgentCallIsRepaid;
  const progressPercent = Math.min(100, Math.max(0, combinedCashFlow.urgentCallRepaidPercent));

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. Highlight Card: เงินสดจริงในบัญชีธนาคาร (Net Cash in Hand) */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-800 via-dark-850 to-dark-900 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl shadow-emerald-950/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                บัญชีธนาคารรวม (Central Bank Account)
              </span>
              <span className="text-xs text-slate-400">• อัปเดต Realtime</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white">
              เงินสดจริงคงเหลือในบัญชีธนาคาร (Net Physical Cash in Hand)
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              คำนวณจากยอดขายสดที่ได้รับโอนเข้าบัญชีจริงแล้วของทั้ง 2 โปรเจกต์
              หักลบด้วยเงินสด 45,000 THB ที่จ่ายซื้อของ Urgent Call ไป
            </p>
          </div>

          <div className="text-left lg:text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
              ยอดเงินสดคงเหลือปัจจุบัน
            </div>
            <div className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight flex items-baseline lg:justify-end gap-1.5">
              <span>
                ฿
                {combinedCashFlow.physicalCashInHand.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-base text-slate-300 font-semibold">THB</span>
            </div>
          </div>
        </div>

        {/* Breakdown Equation Explanation */}
        <div className="mt-6 pt-6 border-t border-dark-700/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-dark-750">
            <div className="text-slate-400 flex items-center justify-between">
              <span>1. ยอดขายสด Cash Item</span>
              <span className="text-emerald-400 font-bold">บวกเข้า (+)</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              +฿{combinedCashFlow.cashItemClearedSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              (ยอดเดิม 51,570.10 + ขายใหม่)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-dark-750">
            <div className="text-slate-400 flex items-center justify-between">
              <span>2. โอนยืมไปซื้อไข่ Urgent Call</span>
              <span className="text-rose-400 font-bold">หักออก (-)</span>
            </div>
            <div className="text-lg font-black text-rose-400 mt-1">
              -฿{combinedCashFlow.loanToUrgentCall.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              (Figure 21k + Keycap 24k)
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-dark-900/80 border border-dark-750">
            <div className="text-slate-400 flex items-center justify-between">
              <span>3. ยอดขายสดโปรเจกต์ไข่ที่รับแล้ว</span>
              <span className="text-emerald-400 font-bold">บวกคืน (+)</span>
            </div>
            <div className="text-lg font-black text-white mt-1">
              +฿{combinedCashFlow.urgentCallClearedRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              (ยอดชำระแล้วจากงาน Urgent Call)
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. กล่องสรุปสถานะการยืมทุน (Inter-Project Transfer Tracker) */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-dark-850 border border-dark-700 p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black text-white flex items-center gap-2">
                <span>กล่องสรุปสถานะการยืมทุนข้ามโปรเจกต์ (Inter-Project Transfer)</span>
                {isRepaid && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    คืนทุนครบ 100% แล้ว 🎉
                  </span>
                )}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                ติดตามการคืนเงินทุน 45,000 THB ที่ยืมจากพอร์ต Cash Item มาลงทุนซื้อไข่ Urgent Call
              </p>
            </div>
          </div>

          {isRepaid && (
            <button
              onClick={triggerConfettiEffect}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>จุดพลุฉลองคืนทุน</span>
            </button>
          )}
        </div>

        {/* Progress & Status Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-xs text-slate-400">เงินทุนที่โอนยืมไปซื้อของ</div>
            <div className="text-2xl font-black text-white mt-1">
              ฿{combinedCashFlow.loanToUrgentCall.toLocaleString()} THB
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              พอร์ต Cash Item จ่ายออก
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>คืนทุนกลับเข้ากองกลางแล้ว</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              ฿{combinedCashFlow.urgentCallClearedRevenue.toLocaleString()} THB
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              คิดเป็น <strong>{progressPercent.toFixed(1)}%</strong> ของเงินยืม
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>คงเหลือต้องคืนเข้าบัญชีกองกลาง</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">
              ฿{combinedCashFlow.urgentCallRemainingToRepay.toLocaleString()} THB
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isRepaid ? 'คืนครบแล้ว ไม่มีค้างชำระ' : 'รอรับยอดขายไข่เพิ่มเติม'}
            </div>
          </div>
        </div>

        {/* Large Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-bold">
              ความคืบหน้าการคืนทุนเข้ากองกลาง:{' '}
              <span className={isRepaid ? 'text-emerald-400' : 'text-amber-400'}>
                {progressPercent.toFixed(1)}%
              </span>
            </span>
            <span className="text-slate-400">
              {combinedCashFlow.urgentCallClearedRevenue.toLocaleString()} /{' '}
              {combinedCashFlow.loanToUrgentCall.toLocaleString()} THB
            </span>
          </div>

          <div className="w-full h-3.5 rounded-full bg-dark-950 overflow-hidden p-0.5 border border-dark-700">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isRepaid
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-green-glow'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. ภาพรวมทรัพย์สินรวมทั้งหมด (Combined Portfolio Assets)   */}
      {/* ========================================================= */}
      <div className="rounded-3xl bg-dark-850 border border-dark-700 p-6 sm:p-7 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
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

          <div className="text-right">
            <span className="text-xs text-slate-400">มูลค่ารวมประเมิน:</span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">
              ฿
              {combinedCashFlow.totalCombinedAssets.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{' '}
              THB
            </div>
          </div>
        </div>

        {/* Asset Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* 1. Cash in Hand */}
          <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-slate-400 flex items-center gap-1">
              <span>💵 เงินสดในบัญชี</span>
            </div>
            <div className="text-base font-bold text-emerald-400 mt-1">
              ฿{combinedCashFlow.physicalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">พร้อมใช้งาน</div>
          </div>

          {/* 2. Remaining Points */}
          <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-slate-400 flex items-center gap-1">
              <span>💎 มูลค่าพอยท์</span>
            </div>
            <div className="text-base font-bold text-sky-400 mt-1">
              ฿{cashSummary.pointValueThb.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              88,650 pts @ 0.065
            </div>
          </div>

          {/* 3. Cash Items Stock */}
          <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-slate-400 flex items-center gap-1">
              <span>🎁 สต็อก Cash Items</span>
            </div>
            <div className="text-base font-bold text-amber-400 mt-1">
              ฿{cashSummary.totalInventoryValue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ของแถม + ซื้อด้วยพอยท์
            </div>
          </div>

          {/* 4. Pending Receivables */}
          <div className="p-3.5 rounded-2xl bg-dark-900 border border-dark-750">
            <div className="text-slate-400 flex items-center gap-1">
              <span>⏳ ลูกหนี้รอโอน</span>
            </div>
            <div className="text-base font-bold text-amber-300 mt-1">
              ฿{combinedCashFlow.totalPendingReceivables.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              ยอด Pending รวม 2 โปรเจกต์
            </div>
          </div>
        </div>

        {/* Combined Profit Summary Footer */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-dark-900 to-dark-800 border border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
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
              className={`text-xl sm:text-2xl font-black ${
                combinedCashFlow.totalCombinedNetProfit >= 0
                  ? 'text-emerald-400'
                  : 'text-rose-400'
              }`}
            >
              {combinedCashFlow.totalCombinedNetProfit >= 0 ? '+' : ''}฿
              {combinedCashFlow.totalCombinedNetProfit.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{' '}
              THB
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
