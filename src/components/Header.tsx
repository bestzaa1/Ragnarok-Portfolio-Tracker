'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  PlusCircle,
  Download,
  Settings,
  Database,
  HardDrive,
  Sparkles,
  Egg,
  Coins,
  ArrowRightLeft,
  ShoppingBag,
  ShieldCheck,
  KeyRound,
  LogOut,
  Eye,
} from 'lucide-react';

export type MainModuleType = 'URGENT_CALL' | 'CASH_ITEM' | 'CASH_FLOW';

interface HeaderProps {
  activeModule: MainModuleType;
  setActiveModule: (m: MainModuleType) => void;
  onOpenQuickSaleUrgentCall: () => void;
  onOpenCashSale: () => void;
  onOpenAddCashItem: () => void;
  onOpenSettings: () => void;
  onOpenAdminLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  onOpenQuickSaleUrgentCall,
  onOpenCashSale,
  onOpenAddCashItem,
  onOpenSettings,
  onOpenAdminLogin,
}) => {
  const {
    isAdmin,
    logoutAdmin,
    isSupabaseConnected,
    supabaseConfig,
    summary,
    cashSummary,
    combinedCashFlow,
    triggerExportExcel,
    triggerConfettiEffect,
  } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-dark-700 bg-dark-900/95 backdrop-blur-md">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 shadow-glow text-dark-950 font-black text-xl border border-amber-300/40">
            <span>⚔️</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-900 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                  Ragnarok Portfolio
                </span>
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Manager
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Urgent Call Pre-Order & Cash Items & Central Funds</span>
              <span>•</span>
              {/* Sync Status Badge */}
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1.5 hover:underline cursor-pointer transition-colors"
                title="คลิกเพื่อจัดการและตรวจสอบการเชื่อมต่อ Supabase Realtime"
              >
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Supabase Realtime (Online)</span>
                </span>
              </button>
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Quick Bank Cash Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-800 border border-dark-600 text-xs">
            <span className="text-slate-400">เงินสดในบัญชี:</span>
            <span className="text-emerald-400 font-bold">
              ฿{combinedCashFlow.physicalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Export to Excel */}
          <button
            onClick={triggerExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-dark-800 text-slate-200 border border-dark-600 hover:border-slate-400 hover:bg-dark-700 transition-all"
            title="ส่งออกรายงาน Excel (.xlsx) ครบทุกแท็บและพอร์ต"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export</span> Excel
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-dark-800 text-slate-200 border border-dark-600 hover:border-amber-400/50 hover:bg-dark-700 transition-all"
            title="ตั้งค่าต้นทุน และการเชื่อมต่อ Supabase"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ตั้งค่า</span>
          </button>

          {/* Admin Role Status & Unlock Button */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold shadow-green-glow">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Admin Mode</span>
              </div>
              <button
                onClick={logoutAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-dark-800 text-rose-300 border border-rose-500/30 hover:bg-rose-500/10 hover:border-rose-500/50 transition-all"
                title="ออกจากระบบ Admin Mode (กลับเป็น Viewer)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-dark-800/90 border border-dark-600 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>Viewer (ดูอย่างเดียว)</span>
              </div>
              <button
                onClick={onOpenAdminLogin}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-dark-950 shadow-glow hover:brightness-110 active:scale-95 transition-all"
                title="คลิกเพื่อปลดล็อก Admin Mode สำหรับจัดการข้อมูลและสต็อก"
              >
                <KeyRound className="w-4 h-4 stroke-[2.5]" />
                <span>🔑 Admin Mode</span>
              </button>
            </div>
          )}

          {/* Adaptive Action Buttons - Only in Admin Mode */}
          {isAdmin && activeModule === 'URGENT_CALL' && (
            <button
              onClick={onOpenQuickSaleUrgentCall}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-dark-950 shadow-glow hover:shadow-amber-500/40 hover:brightness-110 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>+ บันทึกขาย Urgent Call</span>
            </button>
          )}

          {isAdmin && activeModule === 'CASH_ITEM' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAddCashItem}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-dark-750 text-sky-300 border border-sky-500/30 hover:bg-dark-700 transition-all"
              >
                <span>+ เพิ่มสินค้า</span>
              </button>
              <button
                onClick={onOpenCashSale}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-dark-950 shadow-green-glow hover:brightness-110 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                <span>+ บันทึกขาย Cash Item</span>
              </button>
            </div>
          )}

          {activeModule === 'CASH_FLOW' && (
            <button
              onClick={triggerConfettiEffect}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-glow hover:brightness-110 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>ความคืบหน้ารวม</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 3 Module Tabs Navigation Bar */}
      <div className="border-t border-dark-800 bg-dark-950/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto py-2">
          {/* Module Tab 1: Urgent Call */}
          <button
            onClick={() => setActiveModule('URGENT_CALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeModule === 'URGENT_CALL'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800 border border-transparent'
            }`}
          >
            <Egg className="w-4 h-4 text-amber-400" />
            <span>[1] 🥚 Ragnarok Urgent Call</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-900 text-slate-300 border border-dark-700">
              Pre-Order 45k
            </span>
          </button>

          {/* Module Tab 2: Cash Item & Point Stock */}
          <button
            onClick={() => setActiveModule('CASH_ITEM')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeModule === 'CASH_ITEM'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-blue-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800 border border-transparent'
            }`}
          >
            <Coins className="w-4 h-4 text-sky-400" />
            <span>[2] 💎 Cash Item & Point Stock</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-900 text-slate-300 border border-dark-700">
              พอร์ตเติมเงินเดิม 54k
            </span>
          </button>

          {/* Module Tab 3: Combined Cash Flow */}
          <button
            onClick={() => setActiveModule('CASH_FLOW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeModule === 'CASH_FLOW'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-green-glow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800 border border-transparent'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
            <span>[3] 💰 กระเป๋าเงินรวม & บริหารทุนหมุนเวียน</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-900 text-emerald-300 border border-emerald-500/30">
              Cash Flow & Funds
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
