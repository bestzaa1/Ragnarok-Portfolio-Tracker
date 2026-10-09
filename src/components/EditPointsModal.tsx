'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Sparkles, Check, AlertCircle } from 'lucide-react';

interface EditPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  currentRate: number;
  onSave: (points: number, rate: number) => Promise<void> | void;
}

export const EditPointsModal: React.FC<EditPointsModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  currentRate,
  onSave,
}) => {
  const [points, setPoints] = useState<number>(currentPoints);
  const [rate, setRate] = useState<number>(currentRate || 0.065);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPoints(currentPoints);
      setRate(currentRate || 0.065);
      setIsSaving(false);
    }
  }, [isOpen, currentPoints, currentRate]);

  if (!isOpen) return null;

  const currentThbValue = points * rate;
  const pointDifference = points - currentPoints;
  const thbDifference = pointDifference * rate;

  const handleAdjustPoints = (delta: number) => {
    setPoints((prev) => Math.max(0, prev + delta));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(Math.max(0, points), rate > 0 ? rate : 0.065);
      onClose();
    } catch (err) {
      console.error('Save points error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white max-h-[92vh] overflow-y-auto">
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
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <span>แก้ไขยอดพอยท์คงเหลือ</span>
            </h3>
            <p className="text-xs text-slate-400">
              ปรับปรุงตัวเลขพอยท์ในระบบ และคำนวณมูลค่า THB อัตโนมัติ
            </p>
          </div>
        </div>

        {/* Current State Info */}
        <div className="p-3.5 rounded-2xl bg-dark-800/80 border border-dark-700 mb-4 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">ยอดพอยท์เดิมในระบบ:</span>
            <span className="font-bold text-sky-300 text-sm">
              {currentPoints.toLocaleString()} <span className="text-xs text-slate-400">pts</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">มูลค่าเดิม (@ {currentRate}):</span>
            <span className="font-bold text-emerald-400 text-sm">
              ฿{(currentPoints * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* New Points Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              ยอดพอยท์คงเหลือใหม่ (Points) *
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={points}
                onChange={(e) => setPoints(Number(e.target.value) || 0)}
                className="w-full bg-dark-800 border border-sky-500/50 rounded-xl px-3 py-2.5 text-base font-black text-sky-300 focus:outline-none focus:border-sky-400 pl-3 pr-16"
              />
              <span className="absolute right-3.5 top-3 text-xs font-semibold text-slate-400">
                pts
              </span>
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400">ปรับด่วน:</span>
              <button
                type="button"
                onClick={() => handleAdjustPoints(1000)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-sky-300 font-bold text-[10px] border border-sky-500/20 transition-colors"
              >
                +1,000
              </button>
              <button
                type="button"
                onClick={() => handleAdjustPoints(5000)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-sky-300 font-bold text-[10px] border border-sky-500/20 transition-colors"
              >
                +5,000
              </button>
              <button
                type="button"
                onClick={() => handleAdjustPoints(10000)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-sky-300 font-bold text-[10px] border border-sky-500/20 transition-colors"
              >
                +10,000
              </button>
              <button
                type="button"
                onClick={() => handleAdjustPoints(-1000)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-rose-300 font-bold text-[10px] border border-rose-500/20 transition-colors"
              >
                -1,000
              </button>
              <button
                type="button"
                onClick={() => handleAdjustPoints(-5000)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-rose-300 font-bold text-[10px] border border-rose-500/20 transition-colors"
              >
                -5,000
              </button>
              <button
                type="button"
                onClick={() => setPoints(88650)}
                className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-750 text-amber-300 font-bold text-[10px] border border-amber-500/20 transition-colors"
              >
                เริ่มต้น (88,650)
              </button>
            </div>
          </div>

          {/* Rate Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              อัตราแลกเปลี่ยน (THB / Point)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.001"
                step="0.001"
                required
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0.065)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 pl-3 pr-24"
              />
              <span className="absolute right-3 top-2 text-[11px] text-slate-400">
                THB / Point
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              เรทมาตรฐานพอร์ตเดิมคือ 0.065 บาทต่อพอยท์ (1,000 pts = 65 บาท)
            </p>
          </div>

          {/* Realtime THB Equivalent Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-dark-800 to-dark-850 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                มูลค่าประเมินเทียบเท่า THB
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                คำนวณสด
              </span>
            </div>

            <div className="text-2xl font-black text-emerald-400">
              ฿{currentThbValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs font-semibold text-slate-400 ml-1.5">THB</span>
            </div>

            {pointDifference !== 0 && (
              <div className="mt-2 pt-2 border-t border-dark-700/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">ส่วนต่างจากยอดเดิม:</span>
                <span className={`font-bold ${pointDifference > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {pointDifference > 0 ? '+' : ''}
                  {pointDifference.toLocaleString()} pts ({pointDifference > 0 ? '+' : ''}฿{thbDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-dark-750">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-sky-500 via-sky-400 to-teal-500 text-dark-950 hover:brightness-110 active:scale-95 shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกยอดพอยท์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
