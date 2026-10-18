'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MainNavModule } from './Sidebar';
import {
  Menu,
  Search,
  Download,
  Plus,
  ShoppingBag,
  Wallet,
  Settings,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Command,
} from 'lucide-react';

interface TopHeaderProps {
  activeModule: MainNavModule;
  onToggleMobileSidebar: () => void;
  onOpenQuickSaleUrgentCall: () => void;
  onOpenCashSale: () => void;
  onOpenAddCashItem: () => void;
  onOpenSettings: () => void;
  onOpenAdminLogin: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeModule,
  onToggleMobileSidebar,
  onOpenQuickSaleUrgentCall,
  onOpenCashSale,
  onOpenAddCashItem,
  onOpenSettings,
  onOpenAdminLogin,
  searchTerm = '',
  onSearchChange,
}) => {
  const {
    isAdmin,
    combinedCashFlow,
    triggerExportExcel,
    isSupabaseConnected,
  } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbTitle = () => {
    switch (activeModule) {
      case 'CASH_FLOW':
        return {
          category: 'Finance & Portfolio',
          title: 'ภาพรวมกระเป๋า & ทุนหมุนเวียน (Central Cash Flow)',
        };
      case 'URGENT_CALL':
        return {
          category: 'Pre-Order Tracker',
          title: 'Urgent Call Pre-Order (Alberta Figure, Keycap & Eggs)',
        };
      case 'CASH_ITEM':
        return {
          category: 'Stock & Point Ledger',
          title: 'Cash Item & Point Stock (พอร์ตเติมเงิน 54k)',
        };
      case 'ALL_SALES':
        return {
          category: 'Audit & Transactions',
          title: 'ประวัติการขายทั้งหมด (Sales History Ledger)',
        };
      case 'GOC_LIBRA':
        return {
          category: 'Promo Investment (18 Oct 2026)',
          title: '✨ GOC & Libra Promo (14.25k) — Silvervine, ไข่ Libra & ของแถมโปร',
        };
      default:
        return {
          category: 'Dashboard',
          title: 'Ragnarok Portfolio Manager',
        };
    }
  };

  const breadcrumb = getBreadcrumbTitle();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0a0b10]/85 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-white/[0.04] text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
          title="เปิดเมนู"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Portfolio</span>
            <span>/</span>
            <span className="text-violet-400">{breadcrumb.category}</span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
            {breadcrumb.title}
          </h2>
        </div>
      </div>

      {/* Right: Search, Balance Chip, Quick Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
        {/* Search Bar with Ctrl+K */}
        <div className="hidden md:flex items-center relative w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="ค้นหาไอเทม, ลูกค้า..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-9 pl-9 pr-12 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 focus:bg-white/[0.06] transition-all"
          />
          <div className="absolute right-2.5 top-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>⌘K</span>
          </div>
        </div>

        {/* Glassmorphic Net Cash Balance Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.035] border border-white/[0.07] backdrop-blur-md shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wallet className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">
              เงินสดในบัญชี
            </div>
            <div className="text-xs font-mono font-black text-emerald-400 mt-0.5 leading-none">
              ฿{combinedCashFlow.physicalCashInHand.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        {/* Export to Excel */}
        <button
          onClick={triggerExportExcel}
          className="h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.07] text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          title="ดาวน์โหลดสมุดบัญชี Excel ทุกชีต (.xlsx)"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline">Export Excel</span>
        </button>

        {/* Add Item Button (Admin Only) */}
        {isAdmin && (
          <button
            onClick={onOpenAddCashItem}
            className="hidden sm:flex h-9 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.07] text-xs font-medium items-center gap-1.5 transition-all shadow-sm"
            title="เพิ่มรายการสินค้าใหม่เข้าคลัง"
          >
            <Plus className="w-3.5 h-3.5 text-violet-400 stroke-[2.5]" />
            <span>+ เพิ่มสินค้า</span>
          </button>
        )}

        {/* Primary Action Button: Record Sale (Admin Only) */}
        {isAdmin && (
          <button
            onClick={() => {
              if (activeModule === 'URGENT_CALL') onOpenQuickSaleUrgentCall();
              else onOpenCashSale();
            }}
            className="h-9 px-3.5 sm:px-4 rounded-xl stakent-btn-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-violet-glow"
            title="บันทึกรายการขายใหม่"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ บันทึกการขาย</span>
          </button>
        )}

        {/* Admin Lock / Unlock Indicator on Mobile */}
        <button
          onClick={isAdmin ? undefined : onOpenAdminLogin}
          className={`sm:hidden p-2 rounded-xl border flex items-center justify-center ${
            isAdmin
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-white/[0.04] text-slate-400 border-white/[0.07]'
          }`}
          title={isAdmin ? 'Admin Mode (Active)' : 'เข้าสู่ระบบ Admin Mode'}
        >
          {isAdmin ? <ShieldCheck className="w-4 h-4 text-emerald-400" /> : <KeyRound className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
