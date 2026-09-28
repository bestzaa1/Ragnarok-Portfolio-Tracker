'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ServerType, PaymentStatus, EggSale, PhysicalSale } from '@/types';
import { calculateCodeSummaries } from '@/lib/calculations';
import {
  X,
  PlusCircle,
  Egg,
  Package,
  Layers,
  Calendar,
  User,
  DollarSign,
  AlertTriangle,
  Check,
} from 'lucide-react';

export type SaleModalType = 'EGG_ROC' | 'EGG_RO' | 'FIGURE' | 'KEYCAP_BOX' | 'KEYCAP_PIECE';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: SaleModalType;
  initialCodeId?: number;
  editingEggSale?: EggSale | null;
  editingPhysicalSale?: PhysicalSale | null;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  onClose,
  initialType = 'EGG_ROC',
  initialCodeId = 1,
  editingEggSale = null,
  editingPhysicalSale = null,
}) => {
  const {
    eggSales,
    physicalSales,
    config,
    summary,
    addEggSale,
    updateEggSale,
    addPhysicalSale,
    updatePhysicalSale,
  } = useApp();

  const isEditing = Boolean(editingEggSale || editingPhysicalSale);

  const [saleType, setSaleType] = useState<SaleModalType>(initialType);
  const [codeId, setCodeId] = useState<number>(initialCodeId);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(65);
  const [customTotal, setCustomTotal] = useState<string>('');
  const [status, setStatus] = useState<PaymentStatus>('Clear');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [channel, setChannel] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto populate if editing
  useEffect(() => {
    if (editingEggSale) {
      setSaleType(editingEggSale.server === 'ROC' ? 'EGG_ROC' : 'EGG_RO');
      setCodeId(editingEggSale.codeId);
      setCustomerName(editingEggSale.customerName);
      setQuantity(editingEggSale.quantity);
      setUnitPrice(editingEggSale.pricePerEgg);
      setCustomTotal(String(editingEggSale.totalAmount));
      setStatus(editingEggSale.status);
      setDate(editingEggSale.date ? editingEggSale.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setNote(editingEggSale.note || '');
      setChannel('');
    } else if (editingPhysicalSale) {
      if (editingPhysicalSale.category === 'Figure') setSaleType('FIGURE');
      else if (editingPhysicalSale.category === 'KeycapBox') setSaleType('KEYCAP_BOX');
      else setSaleType('KEYCAP_PIECE');

      setCustomerName(editingPhysicalSale.customerName);
      setQuantity(editingPhysicalSale.quantity);
      setUnitPrice(editingPhysicalSale.unitPrice);
      setCustomTotal(String(editingPhysicalSale.totalAmount));
      setStatus(editingPhysicalSale.status);
      setDate(editingPhysicalSale.date ? editingPhysicalSale.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setChannel(editingPhysicalSale.channel || '');
      setNote(editingPhysicalSale.note || '');
    } else {
      // Default reset
      setSaleType(initialType);
      setCodeId(initialCodeId);
      setCustomerName('');
      setStatus('Clear');
      setDate(new Date().toISOString().slice(0, 16));
      setChannel('');
      setNote('');
      setErrorMsg('');

      // Set default quantities and prices
      if (initialType === 'EGG_ROC' || initialType === 'EGG_RO') {
        setQuantity(10);
        setUnitPrice(65);
        setCustomTotal('');
      } else if (initialType === 'FIGURE') {
        setQuantity(1);
        setUnitPrice(4800);
        setCustomTotal('');
      } else if (initialType === 'KEYCAP_BOX') {
        setQuantity(1);
        setUnitPrice(3500);
        setCustomTotal('');
      } else {
        setQuantity(1);
        setUnitPrice(600);
        setCustomTotal('');
      }
    }
  }, [editingEggSale, editingPhysicalSale, initialType, initialCodeId, isOpen]);

  // When changing saleType in new sale mode
  const handleTypeChange = (newType: SaleModalType) => {
    setSaleType(newType);
    setErrorMsg('');
    setCustomTotal('');
    if (newType === 'EGG_ROC' || newType === 'EGG_RO') {
      setQuantity(10);
      setUnitPrice(65);
    } else if (newType === 'FIGURE') {
      setQuantity(1);
      setUnitPrice(4800);
    } else if (newType === 'KEYCAP_BOX') {
      setQuantity(1);
      setUnitPrice(3500);
    } else if (newType === 'KEYCAP_PIECE') {
      setQuantity(1);
      setUnitPrice(600);
    }
  };

  // Recent unique customers for quick chip selection
  const frequentCustomers = useMemo(() => {
    const names = new Set<string>();
    eggSales.forEach((s) => s.customerName && names.add(s.customerName));
    physicalSales.forEach((s) => s.customerName && names.add(s.customerName));
    return Array.from(names).slice(0, 8);
  }, [eggSales, physicalSales]);

  // Code summaries for active egg server
  const currentEggServer: ServerType = saleType === 'EGG_RO' ? 'RO' : 'ROC';
  const codeSummaries = useMemo(() => {
    return calculateCodeSummaries(eggSales, currentEggServer, config);
  }, [eggSales, currentEggServer, config]);

  // Remaining for selected code
  const currentCodeSummary = codeSummaries.find((c) => c.codeId === codeId);
  const remainingForCode = currentCodeSummary ? currentCodeSummary.remainingCount : 0;
  // If editing, add back the original quantity
  const effectiveRemainingForCode =
    remainingForCode + (editingEggSale && editingEggSale.codeId === codeId ? editingEggSale.quantity : 0);

  // Remaining physical
  const effectiveRemainingFigure =
    summary.figureRemaining + (editingPhysicalSale?.category === 'Figure' ? editingPhysicalSale.quantity : 0);
  const effectiveRemainingKeycapBoxes =
    summary.keycapRemainingBoxes + (editingPhysicalSale?.category === 'KeycapBox' ? editingPhysicalSale.quantity : 0);

  // Auto total calculation
  const calculatedTotal = quantity * unitPrice;
  const finalTotalAmount = customTotal !== '' ? Number(customTotal) || 0 : calculatedTotal;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName.trim()) {
      setErrorMsg('กรุณากรอกชื่อลูกค้า / ผู้ซื้อ');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('กรุณาระบุจำนวนที่มากกว่า 0');
      return;
    }

    // Stock validations
    if (saleType === 'EGG_ROC' || saleType === 'EGG_RO') {
      if (quantity > effectiveRemainingForCode) {
        setErrorMsg(
          `จำนวนไข่เกินโควตาคงเหลือของ Code ${codeId} (มีเหลือเพียง ${effectiveRemainingForCode} ฟอง)`
        );
        return;
      }

      if (editingEggSale) {
        await updateEggSale(editingEggSale.id, {
          server: currentEggServer,
          codeId,
          customerName: customerName.trim(),
          quantity,
          pricePerEgg: unitPrice,
          totalAmount: finalTotalAmount,
          status,
          date,
          note: note.trim(),
        });
      } else {
        await addEggSale({
          server: currentEggServer,
          codeId,
          customerName: customerName.trim(),
          quantity,
          pricePerEgg: unitPrice,
          totalAmount: finalTotalAmount,
          status,
          date,
          note: note.trim(),
        });
      }
    } else {
      // Physical sale
      let category: 'Figure' | 'KeycapBox' | 'KeycapPiece' = 'Figure';
      let itemName = 'Alberta Special Package (Figure)';

      if (saleType === 'FIGURE') {
        category = 'Figure';
        itemName = 'Alberta Special Package (Figure)';
        if (quantity > effectiveRemainingFigure) {
          setErrorMsg(`สินค้า Figure มีคงเหลือเพียง ${effectiveRemainingFigure} กล่อง`);
          return;
        }
      } else if (saleType === 'KEYCAP_BOX') {
        category = 'KeycapBox';
        itemName = 'MVP Special Package (Keycap กล่องเต็ม)';
        if (quantity > effectiveRemainingKeycapBoxes) {
          setErrorMsg(`สินค้า Keycap มีคงเหลือเพียง ${effectiveRemainingKeycapBoxes} กล่อง`);
          return;
        }
      } else {
        category = 'KeycapPiece';
        itemName = 'MVP Keycap (แยกชิ้นเดี่ยว)';
      }

      if (editingPhysicalSale) {
        await updatePhysicalSale(editingPhysicalSale.id, {
          category,
          itemName,
          customerName: customerName.trim(),
          quantity,
          unitPrice,
          totalAmount: finalTotalAmount,
          status,
          channel: channel.trim(),
          date,
          note: note.trim(),
        });
      } else {
        await addPhysicalSale({
          category,
          itemName,
          customerName: customerName.trim(),
          quantity,
          unitPrice,
          totalAmount: finalTotalAmount,
          status,
          channel: channel.trim(),
          date,
          note: note.trim(),
        });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {isEditing ? 'แก้ไขรายการขาย' : 'บันทึกการขายใหม่'}
            </h3>
            <p className="text-xs text-slate-400">
              หักลบสต็อกทันที และคำนวณกำไรสุทธิอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Item Type Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              เลือกหมวดหมู่สินค้าที่จะบันทึกการขาย *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('EGG_ROC')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  saleType === 'EGG_ROC'
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-rose-300 font-bold">
                  <Egg className="w-3.5 h-3.5" />
                  <span>ไข่สุ่ม ROC</span>
                </div>
                <span className="text-[10px] text-slate-400">Classic (140/โค้ด)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('EGG_RO')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  saleType === 'EGG_RO'
                    ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-sky-300 font-bold">
                  <Egg className="w-3.5 h-3.5" />
                  <span>ไข่สุ่ม RO</span>
                </div>
                <span className="text-[10px] text-slate-400">Class 3 (140/โค้ด)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('FIGURE')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  saleType === 'FIGURE'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
                  <Package className="w-3.5 h-3.5" />
                  <span>Alberta Figure</span>
                </div>
                <span className="text-[10px] text-slate-400">เหลือ {effectiveRemainingFigure} กล่อง</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('KEYCAP_BOX')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  saleType === 'KEYCAP_BOX'
                    ? 'bg-purple-500/20 border-purple-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-purple-300 font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Keycap ยกกล่อง</span>
                </div>
                <span className="text-[10px] text-slate-400">เหลือ {effectiveRemainingKeycapBoxes} กล่อง</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('KEYCAP_PIECE')}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all col-span-2 sm:col-span-1 ${
                  saleType === 'KEYCAP_PIECE'
                    ? 'bg-fuchsia-500/20 border-fuchsia-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs text-fuchsia-300 font-bold">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Keycap แยกชิ้น</span>
                </div>
                <span className="text-[10px] text-slate-400">ขายรายชิ้น (64 ชิ้น)</span>
              </button>
            </div>
          </div>

          {/* 2. If Egg: Select Code 1 - 9 */}
          {(saleType === 'EGG_ROC' || saleType === 'EGG_RO') && (
            <div className="p-3 bg-dark-850 rounded-2xl border border-dark-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold">
                  เลือกรหัสโค้ดที่ต้องการตัดสต็อก ({currentEggServer}) *
                </span>
                <span className="text-amber-400 font-bold">
                  Code {codeId}: เหลือ {effectiveRemainingForCode} ฟอง
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
                {codeSummaries.map((c) => {
                  const isSel = codeId === c.codeId;
                  const isZero = c.remainingCount === 0 && (!editingEggSale || editingEggSale.codeId !== c.codeId);
                  return (
                    <button
                      key={c.codeId}
                      type="button"
                      disabled={isZero}
                      onClick={() => setCodeId(c.codeId)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        isSel
                          ? 'bg-amber-400 text-dark-950 font-black border-amber-300 shadow-glow'
                          : isZero
                          ? 'bg-dark-900 border-dark-800 text-slate-600 cursor-not-allowed'
                          : 'bg-dark-800 border-dark-700 text-slate-200 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="text-[11px] font-bold">Code {c.codeId}</div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {isZero ? 'หมด' : `${c.remainingCount} ฟอง`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Customer Name with Suggestion Chips */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ชื่อลูกค้า / ผู้ซื้อ *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                placeholder="เช่น ฟลุ๊ค, นุกนิก, เบีย, Tee, มาส..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Quick Chips */}
            {frequentCustomers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                <span className="text-[10px] text-slate-500">เลือกด่วน:</span>
                {frequentCustomers.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setCustomerName(name)}
                    className="px-2 py-0.5 rounded-full bg-dark-800 text-[10px] text-slate-300 hover:text-amber-300 hover:bg-dark-700 border border-dark-700 transition-colors"
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Quantity and Unit Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                จำนวน (
                {saleType === 'EGG_ROC' || saleType === 'EGG_RO'
                  ? 'ฟอง'
                  : saleType === 'KEYCAP_PIECE'
                  ? 'ชิ้น'
                  : 'กล่อง'}
                ) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity || ''}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ราคาต่อหน่วย (THB) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={unitPrice || ''}
                onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ยอดเงินรวมจริง (THB)
              </label>
              <input
                type="number"
                min={0}
                placeholder={`฿${calculatedTotal.toLocaleString()}`}
                value={customTotal !== '' ? customTotal : calculatedTotal}
                onChange={(e) => setCustomTotal(e.target.value)}
                className="w-full bg-dark-800 border border-amber-400/50 rounded-xl px-3 py-2 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* 5. Payment Status & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                สถานะการชำระเงิน *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Clear')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                    status === 'Clear'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🟢 Clear (ชำระแล้ว)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('Pending')}
                  className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 font-bold transition-all ${
                    status === 'Pending'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🟡 Pending (รอโอน)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                วันที่ / เวลา ที่ทำรายการ
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 6. Channel & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ช่องทางการขาย (ถ้ามี)
              </label>
              <input
                type="text"
                placeholder="เช่น Discord, Facebook Group, Line, ในเกม..."
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                บันทึกช่วยจำ (Note)
              </label>
              <input
                type="text"
                placeholder="เช่น โอนเงินแล้วรอส่งรหัส, นัดรับ MRT..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-dark-750">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-dark-950 hover:brightness-110 active:scale-95 shadow-glow transition-all"
            >
              {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกการขาย'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
