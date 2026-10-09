'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Header, MainModuleType } from '@/components/Header';
import { DashboardSummaryCards } from '@/components/DashboardSummaryCards';
import { EggSalesTracker } from '@/components/EggSalesTracker';
import { PhysicalSalesTracker } from '@/components/PhysicalSalesTracker';
import { AllSalesHistory } from '@/components/AllSalesHistory';
import { CashItemTracker } from '@/components/CashItemTracker';
import { CombinedCashFlowTracker } from '@/components/CombinedCashFlowTracker';
import { QuickSaleModal, SaleModalType } from '@/components/QuickSaleModal';
import { AddEditCashItemModal } from '@/components/AddEditCashItemModal';
import { CashSaleModal } from '@/components/CashSaleModal';
import { EditPointsModal } from '@/components/EditPointsModal';
import { SettingsModal } from '@/components/SettingsModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { EggSale, PhysicalSale, ServerType, CashItem, CashSale } from '@/types';
import {
  Egg,
  Package,
  History,
  PlusCircle,
  FileSpreadsheet,
  Settings,
  Coins,
  ArrowRightLeft,
  ShoppingBag,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

export default function HomePage() {
  const {
    summary,
    cashSummary,
    cashConfig,
    updateCashConfig,
    combinedCashFlow,
    triggerExportExcel,
    missingTables,
    isAdmin,
  } = useApp();

  // Top Module Selection
  const [activeModule, setActiveModule] = useState<MainModuleType>('URGENT_CALL');

  // Admin Login Modal
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Urgent Call Sub-Navigation tabs
  const [activeUrgentTab, setActiveUrgentTab] = useState<'EGGS' | 'PHYSICAL' | 'ALL_SALES'>('EGGS');

  // Urgent Call Modals
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [quickSaleType, setQuickSaleType] = useState<SaleModalType>('EGG_ROC');
  const [quickSaleCodeId, setQuickSaleCodeId] = useState<number>(1);
  const [editingEggSale, setEditingEggSale] = useState<EggSale | null>(null);
  const [editingPhysicalSale, setEditingPhysicalSale] = useState<PhysicalSale | null>(null);

  // Cash Item Modals
  const [isAddEditCashItemOpen, setIsAddEditCashItemOpen] = useState(false);
  const [editingCashItem, setEditingCashItem] = useState<CashItem | null>(null);

  const [isCashSaleOpen, setIsCashSaleOpen] = useState(false);
  const [presetSellItem, setPresetSellItem] = useState<CashItem | null>(null);
  const [editingCashSale, setEditingCashSale] = useState<CashSale | null>(null);

  const [isEditPointsOpen, setIsEditPointsOpen] = useState(false);

  // Global Settings Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handlers for Urgent Call
  const handleOpenGeneralQuickSale = () => {
    setEditingEggSale(null);
    setEditingPhysicalSale(null);
    setQuickSaleType('EGG_ROC');
    setQuickSaleCodeId(1);
    setIsQuickSaleOpen(true);
  };

  const handleOpenQuickSaleForCode = (server: ServerType, codeId: number) => {
    setEditingEggSale(null);
    setEditingPhysicalSale(null);
    setQuickSaleType(server === 'ROC' ? 'EGG_ROC' : 'EGG_RO');
    setQuickSaleCodeId(codeId);
    setIsQuickSaleOpen(true);
  };

  const handleOpenQuickSaleForPhysical = (category: 'Figure' | 'KeycapBox' | 'KeycapPiece') => {
    setEditingEggSale(null);
    setEditingPhysicalSale(null);
    if (category === 'Figure') setQuickSaleType('FIGURE');
    else if (category === 'KeycapBox') setQuickSaleType('KEYCAP_BOX');
    else setQuickSaleType('KEYCAP_PIECE');
    setIsQuickSaleOpen(true);
  };

  const handleEditEggSale = (sale: EggSale) => {
    setEditingPhysicalSale(null);
    setEditingEggSale(sale);
    setIsQuickSaleOpen(true);
  };

  const handleEditPhysicalSale = (sale: PhysicalSale) => {
    setEditingEggSale(null);
    setEditingPhysicalSale(sale);
    setIsQuickSaleOpen(true);
  };

  // Handlers for Cash Items
  const handleOpenAddCashItem = () => {
    setEditingCashItem(null);
    setIsAddEditCashItemOpen(true);
  };

  const handleOpenEditCashItem = (item: CashItem) => {
    setEditingCashItem(item);
    setIsAddEditCashItemOpen(true);
  };

  const handleOpenSellItem = (item?: CashItem) => {
    setEditingCashSale(null);
    setPresetSellItem(item || null);
    setIsCashSaleOpen(true);
  };

  const handleOpenEditCashSale = (sale: CashSale) => {
    setPresetSellItem(null);
    setEditingCashSale(sale);
    setIsCashSaleOpen(true);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      {/* Header with 3 Main Module Tabs */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        onOpenQuickSaleUrgentCall={handleOpenGeneralQuickSale}
        onOpenCashSale={() => handleOpenSellItem()}
        onOpenAddCashItem={handleOpenAddCashItem}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      {/* Missing Tables Notice Banner */}
      {missingTables && missingTables.length > 0 && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-200 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-white">ยังไม่พบตารางในฐานข้อมูล Supabase: </span>
                <span>
                  ตาราง [{missingTables.join(', ')}] ยังไม่ได้ถูกสร้าง กรุณานำ SQL ไปรันใน Supabase SQL Editor เพื่อเปิดใช้งานระบบ Realtime ให้เพื่อนๆ ซิงก์ข้อมูลตรงกัน
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-dark-950 font-bold hover:bg-amber-400 transition-colors"
              >
                ดูโค้ด SQL & คัดลอก
              </button>
              <a
                href="https://supabase.com/dashboard/project/udvcayrzbrhatmhzpqiz/sql/new"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-dark-800 text-amber-300 font-bold hover:bg-dark-700 border border-amber-500/30 transition-colors flex items-center gap-1"
              >
                <span>เปิด Supabase SQL Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ========================================================= */}
        {/* MODULE 1: 🥚 Ragnarok Urgent Call (Pre-Order Tracker 45k)  */}
        {/* ========================================================= */}
        {activeModule === 'URGENT_CALL' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Top Summary Cards */}
            <DashboardSummaryCards />

            {/* Sub-Navigation Tabs */}
            <div className="flex border-b border-dark-700 mb-6 gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveUrgentTab('EGGS')}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeUrgentTab === 'EGGS'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Egg className="w-4 h-4" />
                <span>🥚 จัดการขายไข่สุ่ม (ROC / RO)</span>
              </button>

              <button
                onClick={() => setActiveUrgentTab('PHYSICAL')}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeUrgentTab === 'PHYSICAL'
                    ? 'border-purple-400 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>🧸 สินค้า Physical (Figure & Keycap)</span>
              </button>

              <button
                onClick={() => setActiveUrgentTab('ALL_SALES')}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeUrgentTab === 'ALL_SALES'
                    ? 'border-sky-400 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <History className="w-4 h-4" />
                <span>📋 สมุดประวัติการขายรวม (Urgent Call)</span>
              </button>
            </div>

            {/* Sub-Tab Content */}
            {activeUrgentTab === 'EGGS' && (
              <EggSalesTracker
                onOpenQuickSaleForCode={handleOpenQuickSaleForCode}
                onEditSale={handleEditEggSale}
              />
            )}

            {activeUrgentTab === 'PHYSICAL' && (
              <PhysicalSalesTracker
                onOpenQuickSaleForPhysical={handleOpenQuickSaleForPhysical}
                onEditSale={handleEditPhysicalSale}
              />
            )}

            {activeUrgentTab === 'ALL_SALES' && (
              <AllSalesHistory
                onEditEgg={handleEditEggSale}
                onEditPhysical={handleEditPhysicalSale}
              />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 2: 💎 Cash Item & Point Stock (พอร์ตเติมเงินเดิม 54k)*/}
        {/* ========================================================= */}
        {activeModule === 'CASH_ITEM' && (
          <div className="animate-fadeIn">
            <CashItemTracker
              onOpenAddItem={handleOpenAddCashItem}
              onOpenEditItem={handleOpenEditCashItem}
              onOpenSellItem={handleOpenSellItem}
              onOpenEditSale={handleOpenEditCashSale}
              onOpenEditPoints={() => setIsEditPointsOpen(true)}
            />
          </div>
        )}

        {/* ========================================================= */}
        {/* MODULE 3: 💰 กระเป๋าเงินรวม & บริหารทุนหมุนเวียน (Cash Flow)  */}
        {/* ========================================================= */}
        {activeModule === 'CASH_FLOW' && (
          <div className="animate-fadeIn">
            <CombinedCashFlowTracker />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-dark-800 bg-dark-900/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Ragnarok Multi-Portfolio & Cash Flow Manager</span>
            <span>•</span>
            <span className="text-slate-400">
              เงินสดในบัญชี: ฿
              {combinedCashFlow.physicalCashInHand.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{' '}
              THB
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={triggerExportExcel}
              className="text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด Excel ทุกพอร์ต</span>
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>ตั้งค่าระบบ / Supabase</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Action Button for Mobile - Admin Only */}
      {isAdmin && (
        <button
          onClick={() => {
            if (activeModule === 'URGENT_CALL') handleOpenGeneralQuickSale();
            else if (activeModule === 'CASH_ITEM') handleOpenSellItem();
            else handleOpenGeneralQuickSale();
          }}
          className="sm:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow flex items-center justify-center font-bold"
          title="บันทึกด่วน"
        >
          <PlusCircle className="w-7 h-7 stroke-[2.5]" />
        </button>
      )}

      {/* Modals */}
      <QuickSaleModal
        isOpen={isQuickSaleOpen}
        onClose={() => {
          setIsQuickSaleOpen(false);
          setEditingEggSale(null);
          setEditingPhysicalSale(null);
        }}
        initialType={quickSaleType}
        initialCodeId={quickSaleCodeId}
        editingEggSale={editingEggSale}
        editingPhysicalSale={editingPhysicalSale}
      />

      <AddEditCashItemModal
        isOpen={isAddEditCashItemOpen}
        onClose={() => {
          setIsAddEditCashItemOpen(false);
          setEditingCashItem(null);
        }}
        editingItem={editingCashItem}
      />

      <CashSaleModal
        isOpen={isCashSaleOpen}
        onClose={() => {
          setIsCashSaleOpen(false);
          setPresetSellItem(null);
          setEditingCashSale(null);
        }}
        presetItem={presetSellItem}
        editingSale={editingCashSale}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Edit Points Modal */}
      <EditPointsModal
        isOpen={isEditPointsOpen}
        onClose={() => setIsEditPointsOpen(false)}
        currentPoints={cashConfig.remainingPoints}
        currentRate={cashConfig.pointExchangeRate}
        onSave={async (newPoints, newRate) => {
          updateCashConfig({ remainingPoints: newPoints, pointExchangeRate: newRate });
        }}
      />
    </div>
  );
}
