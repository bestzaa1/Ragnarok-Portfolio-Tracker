'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Egg,
  Coins,
  History,
  ShieldCheck,
  KeyRound,
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
  X,
  Wallet,
  FileSpreadsheet,
} from 'lucide-react';

export type MainNavModule = 'CASH_FLOW' | 'URGENT_CALL' | 'CASH_ITEM' | 'ALL_SALES' | 'GOC_LIBRA';

interface SidebarProps {
  activeModule: MainNavModule;
  setActiveModule: (m: MainNavModule) => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  onOpenAdminLogin: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenSettings,
  onOpenAdminLogin,
}) => {
  const {
    isAdmin,
    logoutAdmin,
    isSupabaseConnected,
    summary,
    cashSummary,
    combinedCashFlow,
    triggerExportExcel,
  } = useApp();

  const navItems: {
    id: MainNavModule;
    label: string;
    subLabel: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'CASH_FLOW',
      label: 'ภาพรวม & ทุนหมุนเวียน',
      subLabel: 'Overview & Cash Flow',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: isSupabaseConnected ? 'Live' : undefined,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      id: 'URGENT_CALL',
      label: 'Urgent Call Pre-Order',
      subLabel: 'ไข่ ROC/RO, Figure, Keycap',
      icon: <Egg className="w-5 h-5" />,
      badge: '45k',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    {
      id: 'CASH_ITEM',
      label: 'Cash Item & Points',
      subLabel: 'พอร์ตเดิม 54k & พอยท์คงเหลือ',
      icon: <Coins className="w-5 h-5" />,
      badge: `${cashSummary.remainingPoints.toLocaleString()} pts`,
      badgeColor: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    },
    {
      id: 'ALL_SALES',
      label: 'ประวัติการขายทั้งหมด',
      subLabel: 'Sales History Ledger',
      icon: <History className="w-5 h-5" />,
      badge: `${summary.rocEggsSold + summary.roEggsSold + cashSummary.historicalSales > 0 ? 'All' : ''}`,
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    {
      id: 'GOC_LIBRA',
      label: '✨ GOC & Libra Promo (14.25k)',
      subLabel: 'Silvervine, ไข่ Libra & ของแถมโปร',
      icon: <Sparkles className="w-5 h-5 text-violet-400" />,
      badge: '14.25k',
      badgeColor: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    },
  ];

  const handleSelectNav = (id: MainNavModule) => {
    setActiveModule(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen flex flex-col justify-between bg-stakent-sidebar/95 border-r border-white/[0.06] backdrop-blur-xl transition-all duration-300 select-none ${
          isCollapsed ? 'w-[78px]' : 'w-[280px]'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleSelectNav('CASH_FLOW')}
              className="flex items-center gap-3 cursor-pointer group overflow-hidden"
            >
              {/* Logo Icon with Stakent Gradient */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 p-0.5 shadow-violet-glow flex-shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#0e1017] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                  <span className="text-lg">⚔️</span>
                </div>
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight text-white truncate">
                      Ragnarok Portfolio
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      PRO
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span className="truncate">
                      {isSupabaseConnected ? 'Supabase Realtime' : 'Offline Mode'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Segmented Status Chip */}
          {!isCollapsed && (
            <div className="mt-3.5 p-1 rounded-xl bg-black/40 border border-white/[0.05] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 text-slate-400 font-medium">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px]">เงินสดในบัญชี</span>
              </div>
              <div className="px-2 py-1 rounded-lg bg-white/[0.06] font-mono font-bold text-emerald-400 text-xs">
                ฿{combinedCashFlow.physicalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Main Menu
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectNav(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent text-white border border-violet-500/30 shadow-violet-glow/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-violet-glow" />
                )}

                <div
                  className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-slate-400 group-hover:text-white group-hover:bg-white/[0.06]'
                  }`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div>
                      <div className={`font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{item.subLabel}</div>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ml-1.5 ${
                          item.badgeColor || 'bg-white/[0.06] text-slate-300 border-white/[0.08]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Admin Mode Card & Settings */}
        <div className="p-3 border-t border-white/[0.05] space-y-2">
          {/* Admin Role Status Card */}
          {!isCollapsed ? (
            <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {isAdmin ? 'Admin Mode' : 'Viewer Mode'}
                  </span>
                </div>
                {isAdmin ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/[0.06]">
                    Read-Only
                  </span>
                )}
              </div>

              {isAdmin ? (
                <button
                  onClick={logoutAdmin}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 border border-white/[0.08] hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ Admin</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdminLogin}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-violet-glow/20"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>🔑 ปลดล็อก Admin</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={isAdmin ? logoutAdmin : onOpenAdminLogin}
              title={isAdmin ? 'ออกจากระบบ Admin' : 'เข้าสู่ระบบ Admin Mode'}
              className={`w-full p-2.5 rounded-xl flex items-center justify-center transition-colors border ${
                isAdmin
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white border-white/[0.06]'
              }`}
            >
              {isAdmin ? <ShieldCheck className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
            </button>
          )}

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              title="ตั้งค่าระบบ / Supabase"
              className={`flex-1 py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                isCollapsed ? 'p-2.5' : ''
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span>ตั้งค่าระบบ</span>}
            </button>

            {/* Desktop Collapse Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'ขยายแถบเมนู' : 'ย่อแถบเมนู'}
              className="hidden lg:flex p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.06] transition-colors items-center justify-center"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
