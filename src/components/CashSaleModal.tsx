'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CashItem, CashSale, PaymentStatus, CashItemCategory } from '@/types';
import {
  X,
  ShoppingBag,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  Check,
  Package,
  Coins,
} from 'lucide-react';

interface CashSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  presetItem?: CashItem | null;
  editingSale?: CashSale | null;
}

export const CashSaleModal: React.FC<CashSaleModalProps> = ({
  isOpen,
  onClose,
  presetItem = null,
  editingSale = null,
}) => {
  const { cashItems, cashSales, cashConfig, addCashSale, updateCashSale } = useApp();

  const isEditing = Boolean(editingSale);

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<CashItemCategory>('PROMO_FREEBIE');
  const [server, setServer] = useState('Baphomet');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(100);
  const [customTotal, setCustomTotal] = useState<string>('');
  const [status, setStatus] = useState<PaymentStatus>('Clear');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected item object (if from inventory)
  const currentItem = useMemo(() => {
    if (selectedItemId === '__CASH_POINT__') return null;
    return cashItems.find((i) => i.id === selectedItemId);
  }, [cashItems, selectedItemId]);

  const isCashPointMode = selectedItemId === '__CASH_POINT__' || category === 'CASH_POINT';

  const maxAvailableStock = currentItem
    ? currentItem.stockQty + (editingSale?.cashItemId === currentItem.id ? editingSale.quantity : 0)
    : 99999;

  const maxAvailablePoints =
    cashConfig.remainingPoints +
    (isEditing && editingSale?.category === 'CASH_POINT' ? editingSale.quantity : 0);

  useEffect(() => {
    if (editingSale) {
      if (editingSale.category === 'CASH_POINT') {
        setSelectedItemId('__CASH_POINT__');
      } else {
        setSelectedItemId(editingSale.cashItemId || '');
      }
      setItemName(editingSale.itemName);
      setCategory(editingSale.category);
      setServer(editingSale.server);
      setCustomerName(editingSale.customerName);
      setQuantity(editingSale.quantity);
      setUnitPrice(editingSale.unitPrice);
      setCustomTotal(String(editingSale.totalAmount));
      setStatus(editingSale.status);
      setDate(editingSale.date ? editingSale.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setNote(editingSale.note || '');
    } else if (presetItem) {
      setSelectedItemId(presetItem.id);
      setItemName(presetItem.name);
      setCategory(presetItem.category);
      setServer(presetItem.server || 'Baphomet');
      setCustomerName('');
      setQuantity(1);
      setUnitPrice(presetItem.targetPricePerUnit);
      setCustomTotal('');
      setStatus('Clear');
      setDate(new Date().toISOString().slice(0, 16));
      setNote('');
    } else {
      setSelectedItemId(cashItems[0]?.id || '');
      if (cashItems[0]) {
        setItemName(cashItems[0].name);
        setCategory(cashItems[0].category);
        setServer(cashItems[0].server);
        setUnitPrice(cashItems[0].targetPricePerUnit);
      } else {
        setItemName('');
        setCategory('PROMO_FREEBIE');
        setServer('Baphomet');
        setUnitPrice(100);
      }
      setCustomerName('');
      setQuantity(1);
      setCustomTotal('');
      setStatus('Clear');
      setDate(new Date().toISOString().slice(0, 16));
      setNote('');
    }
    setErrorMsg('');
  }, [editingSale, presetItem, cashItems, isOpen]);

  // When changing selected item
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    if (itemId === '__CASH_POINT__') {
      setItemName('Cash Point');
      setCategory('CASH_POINT');
      setServer('All');
      setUnitPrice(cashConfig.pointExchangeRate || 0.065);
      setQuantity(1000);
      setCustomTotal('');
      return;
    }

    const item = cashItems.find((i) => i.id === itemId);
    if (item) {
      setItemName(item.name);
      setCategory(item.category);
      setServer(item.server);
      setUnitPrice(item.targetPricePerUnit);
      setQuantity(1);
      setCustomTotal('');
    } else {
      setItemName('');
      setCategory('PROMO_FREEBIE');
      setServer('Baphomet');
      setUnitPrice(100);
      setQuantity(1);
      setCustomTotal('');
    }
  };

  // Recent customer chips
  const frequentCustomers = useMemo(() => {
    const names = new Set<string>();
    cashSales.forEach((s) => s.customerName && names.add(s.customerName));
    return Array.from(names).slice(0, 6);
  }, [cashSales]);

  const calculatedTotal = quantity * unitPrice;
  const finalTotalAmount = customTotal !== '' ? Number(customTotal) || 0 : calculatedTotal;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setErrorMsg('กรุณาระบุชื่อสินค้า');
      return;
    }
    if (!customerName.trim()) {
      setErrorMsg('กรุณาระบุชื่อลูกค้า / ผู้ซื้อ');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('กรุณาระบุจำนวนที่มากกว่า 0');
      return;
    }

    if (isCashPointMode) {
      if (quantity > maxAvailablePoints) {
        setErrorMsg(
          `จำนวนพอยท์ที่ระบุ (${quantity.toLocaleString()} pts) เกินยอดพอยท์คงเหลือในพอร์ต (${maxAvailablePoints.toLocaleString()} pts)`
        );
        return;
      }
    } else if (selectedItemId && selectedItemId !== '__CASH_POINT__' && quantity > maxAvailableStock) {
      setErrorMsg(`จำนวนขายเกินสต็อกคงเหลือในคลัง (มีคงเหลือเพียง ${maxAvailableStock} ชิ้น)`);
      return;
    }

    if (editingSale) {
      await updateCashSale(editingSale.id, {
        cashItemId: isCashPointMode ? undefined : selectedItemId || undefined,
        itemName: itemName.trim(),
        category,
        customerName: customerName.trim(),
        quantity,
        unitPrice,
        totalAmount: finalTotalAmount,
        server: server.trim(),
        status,
        date,
        note: note.trim(),
      });
    } else {
      await addCashSale({
        cashItemId: isCashPointMode ? undefined : selectedItemId || undefined,
        itemName: itemName.trim(),
        category,
        customerName: customerName.trim(),
        quantity,
        unitPrice,
        totalAmount: finalTotalAmount,
        server: server.trim(),
        status,
        date,
        note: note.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
              isCashPointMode
                ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isCashPointMode ? <Coins className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {isEditing
                ? isCashPointMode
                  ? 'แก้ไขรายการขาย Cash Point'
                  : 'แก้ไขรายการขาย Cash Item'
                : isCashPointMode
                ? '💎 บันทึกการขาย Cash Point'
                : '🛒 บันทึกการขาย Cash Item'}
            </h3>
            <p className="text-xs text-slate-400">
              {isCashPointMode
                ? 'หักลดยอดพอยท์คงเหลืออัตโนมัติ และอัปเดตยอดขายสดสะสมทันที'
                : 'ตัดลดสต็อกสินค้าอัตโนมัติ และอัปเดตยอดขายสดสะสมทันที'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Item Selection from Inventory */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              เลือกสินค้าจากคลังสต็อก (ตัดสต็อกอัตโนมัติ)
            </label>
            <select
              value={selectedItemId}
              onChange={(e) => handleItemSelect(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">-- ระบุสินค้าเอง (ไม่ตัดสต็อกในคลัง) --</option>
              <option value="__CASH_POINT__" className="text-purple-300 font-bold bg-dark-900">
                💎 [Cash Point] ขายพอยท์ตรง / ดึงพอยท์ไปใช้ - เหลือ {cashConfig.remainingPoints.toLocaleString()} pts (฿{cashConfig.pointExchangeRate}/pt)
              </option>
              {cashItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.category === 'PROMO_FREEBIE' ? '🎁 [ของแถม]' : '🛒 [ซื้อพอยท์]'}{' '}
                  {item.name} ({item.server}) - เหลือ {item.stockQty} ชิ้น (฿{item.targetPricePerUnit})
                </option>
              ))}
            </select>
          </div>

          {/* Cash Point Mode Highlight Banner */}
          {isCashPointMode && (
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-400 shrink-0" />
                <span>
                  โหมดขายพอยท์ตรง (คงเหลือ <strong>{maxAvailablePoints.toLocaleString()}</strong> pts)
                </span>
              </div>
              <span className="font-bold text-emerald-400 text-xs">
                @ {unitPrice} ฿/pt
              </span>
            </div>
          )}

          {/* Item Name & Server */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ชื่อสินค้า *
              </label>
              <input
                type="text"
                required
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                เซิร์ฟเวอร์
              </label>
              <input
                type="text"
                value={server}
                onChange={(e) => setServer(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ชื่อลูกค้า / ผู้ซื้อ *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                required
                placeholder="เช่น กิลด์ Morroc, คุณป้อม, พี่เต้..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {frequentCustomers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
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

          {/* Quantity & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 font-semibold">
                  {isCashPointMode ? 'จำนวนพอยท์ (Points) *' : 'จำนวน *'}
                </label>
                {isCashPointMode ? (
                  <span
                    className={`text-[10px] font-bold ${
                      quantity > maxAvailablePoints ? 'text-rose-400' : 'text-purple-300'
                    }`}
                  >
                    เหลือ {maxAvailablePoints.toLocaleString()} pts
                  </span>
                ) : currentItem ? (
                  <span className="text-[10px] text-amber-400">สต็อก: {maxAvailableStock}</span>
                ) : null}
              </div>
              <input
                type="number"
                min={1}
                step={isCashPointMode ? '1' : 'any'}
                max={
                  isCashPointMode
                    ? maxAvailablePoints
                    : selectedItemId
                    ? maxAvailableStock
                    : undefined
                }
                required
                value={quantity}
                onChange={(e) => {
                  setQuantity(Number(e.target.value) || 0);
                  setCustomTotal('');
                }}
                className={`w-full bg-dark-800 border rounded-xl px-3 py-2 text-sm text-white focus:outline-none ${
                  isCashPointMode && quantity > maxAvailablePoints
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-dark-600 focus:border-amber-400'
                }`}
              />

              {/* Point Quick Preset Buttons */}
              {isCashPointMode && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2">
                  <span className="text-[10px] text-slate-400">ระบุด่วน:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(1000);
                      setCustomTotal('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-purple-300 font-bold text-[10px] border border-purple-500/30 transition-colors"
                  >
                    1,000 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(5000);
                      setCustomTotal('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-purple-300 font-bold text-[10px] border border-purple-500/30 transition-colors"
                  >
                    5,000 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(10000);
                      setCustomTotal('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-purple-300 font-bold text-[10px] border border-purple-500/30 transition-colors"
                  >
                    10,000 pts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(maxAvailablePoints);
                      setCustomTotal('');
                    }}
                    className="px-2 py-0.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-amber-300 font-bold text-[10px] border border-amber-500/30 transition-colors"
                  >
                    ทั้งหมด ({maxAvailablePoints.toLocaleString()} pts)
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {isCashPointMode ? 'ราคาต่อพอยท์ (฿/pt) *' : 'ราคาต่อหน่วย (THB) *'}
              </label>
              <input
                type="number"
                min={0}
                step="any"
                required
                value={unitPrice}
                onChange={(e) => {
                  setUnitPrice(Number(e.target.value) || 0);
                  setCustomTotal('');
                }}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
              {isCashPointMode && (
                <span className="text-[10px] text-slate-500 mt-1 block">
                  เรทมาตรฐาน @ {cashConfig.pointExchangeRate}
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ยอดเงินสดจริง (THB)
              </label>
              <input
                type="number"
                min={0}
                step="any"
                value={customTotal !== '' ? customTotal : calculatedTotal}
                onChange={(e) => setCustomTotal(e.target.value)}
                className="w-full bg-dark-800 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Status & Date */}
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
                      : 'bg-dark-800 border-dark-700 text-slate-400'
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
                      : 'bg-dark-800 border-dark-700 text-slate-400'
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

          {/* Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น รับของในมอ, โอนพร้อมเพย์แล้ว, ดึงพอยท์ไปใช้..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
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
              disabled={isCashPointMode && quantity > maxAvailablePoints}
              className={`px-6 py-2.5 rounded-xl font-bold text-dark-950 hover:brightness-110 active:scale-95 shadow-green-glow transition-all ${
                isCashPointMode && quantity > maxAvailablePoints
                  ? 'bg-slate-600 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500'
              }`}
            >
              {isEditing
                ? 'บันทึกการแก้ไข'
                : isCashPointMode
                ? 'ยืนยันการขาย & ตัดพอยท์'
                : 'ยืนยันการขาย & ตัดสต็อก'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
