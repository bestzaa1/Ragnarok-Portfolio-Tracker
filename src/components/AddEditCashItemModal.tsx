'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CashItem } from '@/types';
import { X, Package, PlusCircle, Edit2, AlertCircle } from 'lucide-react';

interface AddEditCashItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: CashItem | null;
}

export const AddEditCashItemModal: React.FC<AddEditCashItemModalProps> = ({
  isOpen,
  onClose,
  editingItem = null,
}) => {
  const { addCashItem, updateCashItem } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'PROMO_FREEBIE' | 'POINT_PURCHASED'>('PROMO_FREEBIE');
  const [server, setServer] = useState('Baphomet');
  const [stockQty, setStockQty] = useState(1);
  const [targetPrice, setTargetPrice] = useState(100);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setCategory(editingItem.category);
      setServer(editingItem.server || 'Baphomet');
      setStockQty(editingItem.stockQty);
      setTargetPrice(editingItem.targetPricePerUnit);
      setNote(editingItem.note || '');
    } else {
      setName('');
      setCategory('PROMO_FREEBIE');
      setServer('Baphomet');
      setStockQty(1);
      setTargetPrice(100);
      setNote('');
    }
    setErrorMsg('');
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('กรุณาระบุชื่อไอเทม');
      return;
    }
    if (stockQty < 0) {
      setErrorMsg('จำนวนสต็อกต้องไม่ติดลบ');
      return;
    }

    if (editingItem) {
      await updateCashItem(editingItem.id, {
        name: name.trim(),
        category,
        server: server.trim(),
        stockQty,
        targetPricePerUnit: targetPrice,
        note: note.trim(),
      });
    } else {
      await addCashItem({
        name: name.trim(),
        category,
        server: server.trim(),
        stockQty,
        targetPricePerUnit: targetPrice,
        note: note.trim(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            {editingItem ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white">
              {editingItem ? 'แก้ไขข้อมูลสินค้า' : '+ เพิ่มรายการสินค้าใหม่ (Add Item)'}
            </h3>
            <p className="text-xs text-slate-400">
              จัดการสต็อกสินค้าของแถมโปรโมชั่น หรือสินค้าที่กดซื้อด้วยพอยท์
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
          {/* Category Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              หมวดหมู่สินค้า *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('PROMO_FREEBIE')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  category === 'PROMO_FREEBIE'
                    ? 'bg-amber-500/20 border-amber-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-amber-300 font-bold">🎁 ของแถมโปรโมชั่น</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  เช่น +9 Armor, +9 Weapon, BSB, Ancient Hero
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('POINT_PURCHASED')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  category === 'POINT_PURCHASED'
                    ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                    : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs text-sky-300 font-bold">🛒 ซื้อด้วย Point มาสต็อก</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  เช่น Silvervine, God Hammer, Furnace, กล่องสุ่ม
                </div>
              </button>
            </div>
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ชื่อสินค้า / ไอเทม *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น +9 Armor Refine Ticket, Silvervine Box..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Server */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              เซิร์ฟเวอร์ (Server)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Baphomet', 'Moonlight', 'All Servers'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setServer(s)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    server === s
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="หรือระบุเซิร์ฟเวอร์อื่น..."
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className="w-full mt-1.5 bg-dark-800 border border-dark-600 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stock Qty & Target Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                จำนวนคงเหลือเริ่มต้น (ชิ้น/กล่อง) *
              </label>
              <input
                type="number"
                min={0}
                step="any"
                required
                value={stockQty}
                onChange={(e) => setStockQty(Number(e.target.value) || 0)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                ราคาเป้าหมาย/ราคาประเมินต่อชิ้น (THB) *
              </label>
              <input
                type="number"
                min={0}
                step="any"
                required
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="p-3 bg-dark-950 rounded-xl border border-dark-750 flex items-center justify-between">
            <span className="text-slate-400">มูลค่ารวมประเมินของสต็อกรายการนี้:</span>
            <span className="text-base font-bold text-amber-400">
              ฿{(stockQty * targetPrice).toLocaleString()} THB
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              หมายเหตุเพิ่มเติม
            </label>
            <input
              type="text"
              placeholder="เช่น เก็บไว้ขายช่วงกิลด์วอร์, ราคาตลาดกำลังขึ้น..."
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
              className="px-6 py-2.5 rounded-xl font-bold bg-gradient-to-r from-sky-500 via-sky-400 to-blue-500 text-dark-950 hover:brightness-110 active:scale-95 shadow-blue-glow transition-all"
            >
              {editingItem ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้าลงคลัง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
