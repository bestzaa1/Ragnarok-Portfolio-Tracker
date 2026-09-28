'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SUPABASE_SQL_SCHEMA, saveStoredSupabaseConfig, SupabaseConfig } from '@/lib/supabase';
import {
  X,
  Settings,
  Database,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Coins,
  CloudUpload,
  Wifi,
  WifiOff,
  Server,
  FileCode2,
  ExternalLink,
  Loader2,
  Sprout,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    isAdmin,
    config,
    updateConfig,
    cashConfig,
    updateCashConfig,
    supabaseConfig,
    updateSupabaseConfig,
    isSupabaseConnected,
    uploadLocalToSupabase,
    testConnection,
    resetToSampleData,
    seedInitialDataToSupabase,
    clearAllData,
    triggerExportBackup,
    importFromJson,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DATABASE' | 'COSTS' | 'CASH_PORTFOLIO' | 'BACKUP'>('DATABASE');

  // Supabase states
  const [supaUrl, setSupaUrl] = useState(supabaseConfig.url || '');
  const [supaKey, setSupaKey] = useState(supabaseConfig.anonKey || '');
  const [supaEnabled, setSupaEnabled] = useState(supabaseConfig.enabled);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Test & Upload states
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Urgent Call Cost states
  const [figureCost, setFigureCost] = useState(config.figureCostTotal);
  const [figureBoxes, setFigureBoxes] = useState(config.figureBoxCount);
  const [keycapCost, setKeycapCost] = useState(config.keycapCostTotal);
  const [keycapBoxes, setKeycapBoxes] = useState(config.keycapBoxCount);
  const [codesCount, setCodesCount] = useState(config.codesCount);
  const [eggsPerCode, setEggsPerCode] = useState(config.eggsPerCode);
  const [costSavedMsg, setCostSavedMsg] = useState(false);

  // Cash Portfolio states
  const [cashInvestment, setCashInvestment] = useState(cashConfig.initialInvestment);
  const [cashSalesInit, setCashSalesInit] = useState(cashConfig.initialCashSales);
  const [remPoints, setRemPoints] = useState(cashConfig.remainingPoints);
  const [pointRate, setPointRate] = useState(cashConfig.pointExchangeRate);
  const [loanAmount, setLoanAmount] = useState(cashConfig.loanToUrgentCall);
  const [cashSavedMsg, setCashSavedMsg] = useState(false);

  // ซิงก์ค่าการตั้งค่า Supabase และสถานะสวิตช์ทุกครั้งที่เปิด Modal หรือ config มีการเปลี่ยนแปลง
  useEffect(() => {
    if (isOpen) {
      setSupaUrl(supabaseConfig.url || '');
      setSupaKey(supabaseConfig.anonKey || '');
      // ถ้าตรวจพบว่าเชื่อมต่อ Supabase Realtime สำเร็จ (Online) หรือ config เปิดอยู่ ให้สวิตช์เปิด (ON) สีเขียวโดยอัตโนมัติ
      const isOnlineOrEnabled = isSupabaseConnected || supabaseConfig.enabled;
      setSupaEnabled(isOnlineOrEnabled);
    }
  }, [isOpen, supabaseConfig.url, supabaseConfig.anonKey, supabaseConfig.enabled, isSupabaseConnected]);

  if (!isOpen) return null;

  const handleToggleSupabase = async (checked: boolean) => {
    setSupaEnabled(checked);
    const updatedConfig: SupabaseConfig = {
      url: supaUrl.trim() || supabaseConfig.url,
      anonKey: supaKey.trim() || supabaseConfig.anonKey,
      enabled: checked,
    };
    // บันทึกค่านั้นลงใน localStorage ทันที เพื่อให้จำสถานะการเปิด/ปิดไว้เสมอ ไม่เด้งกลับ
    saveStoredSupabaseConfig(updatedConfig);
    await updateSupabaseConfig(updatedConfig);
  };

  const handleSaveSupabase = async () => {
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อบันทึกการตั้งค่าฐานข้อมูล');
      return;
    }
    setSaveStatus('กำลังบันทึกและเชื่อมต่อ...');
    const updatedConfig: SupabaseConfig = {
      url: supaUrl.trim(),
      anonKey: supaKey.trim(),
      enabled: supaEnabled,
    };
    saveStoredSupabaseConfig(updatedConfig);
    await updateSupabaseConfig(updatedConfig);
    setSaveStatus('บันทึกการตั้งค่าแล้ว! กำลังเชื่อมต่อ Realtime...');
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const handleTestSupabase = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection();
      if (res.connected) {
        setTestResult({
          type: 'success',
          message: 'เชื่อมต่อฐานข้อมูล Supabase สำเร็จเรียบร้อย! พร้อมใช้งาน Realtime ทุกตาราง',
        });
      } else if (res.missingTables && res.missingTables.length > 0) {
        setTestResult({
          type: 'warning',
          message: `เชื่อมต่อ Supabase ได้แล้ว แต่ยังไม่พบบางตาราง: [${res.missingTables.join(', ')}] กรุณานำคำสั่ง SQL ด้านล่างไปรันใน Supabase SQL Editor`,
        });
      } else {
        setTestResult({
          type: 'error',
          message: `เชื่อมต่อไม่สำเร็จ: ${res.message}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: `เกิดข้อผิดพลาด: ${err.message || err}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleUploadToCloud = async () => {
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่ออัปโหลดข้อมูล');
      return;
    }
    if (
      !confirm(
        'ต้องการนำข้อมูลที่อยู่ในเบราว์เซอร์ปัจจุบัน (ยอดขายไข่, สต็อก 22 รายการ, ยอดขาย 60 รายการ) อัปโหลดขึ้น Supabase ใช่หรือไม่?'
      )
    ) {
      return;
    }
    setIsUploading(true);
    setUploadResult(null);
    try {
      const res = await uploadLocalToSupabase();
      if (res.success) {
        setUploadResult({ type: 'success', message: res.message });
      } else {
        setUploadResult({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setUploadResult({ type: 'error', message: `เกิดข้อผิดพลาด: ${err.message || err}` });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeedRealData = async () => {
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อกู้คืน/ซิงก์ข้อมูลเริ่มต้นเข้า Supabase');
      return;
    }
    if (
      !confirm(
        '🌱 ยืนยันการกู้คืนและซิงก์ข้อมูลเริ่มต้นจริงเข้า Supabase Database หรือไม่?\n\n' +
        '• ยอดขายไข่ Urgent Call: 5 รายการจริง โค้ด 1 (100 ฟอง, 1,800฿, โค้ด 1 เหลือ 40 ฟอง)\n' +
        '• Figures (5 กล่อง) และ Keycaps (8 กล่อง): คงเหลือ 100% (ทุน 45,000฿)\n' +
        '• สต็อกสินค้า Cash Items: 22 รายการ (มูลค่าคงเหลือ 13,420฿)\n' +
        '• ประวัติการขาย Cash Sales: 60 รายการตาม PDF (51,570.10฿)\n' +
        '• พอยท์คงเหลือ: 88,650 Points (@ 0.065 = 5,762.25฿)\n\n' +
        '*ข้อมูลเก่าใน Supabase ทั้งหมดจะถูกล้างและแทนที่ด้วยชุดข้อมูลจริงนี้*'
      )
    ) {
      return;
    }

    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedInitialDataToSupabase();
      if (res.success) {
        setSeedResult({ type: 'success', message: res.message });
      } else {
        setSeedResult({ type: 'error', message: res.message });
      }
    } catch (err: any) {
      setSeedResult({ type: 'error', message: `เกิดข้อผิดพลาด: ${err.message || err}` });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveCosts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อบันทึกโครงสร้างต้นทุน');
      return;
    }
    updateConfig({
      figureCostTotal: Number(figureCost),
      figureBoxCount: Number(figureBoxes),
      keycapCostTotal: Number(keycapCost),
      keycapBoxCount: Number(keycapBoxes),
      totalInitialCost: Number(figureCost) + Number(keycapCost),
      codesCount: Number(codesCount),
      eggsPerCode: Number(eggsPerCode),
    });
    setCostSavedMsg(true);
    setTimeout(() => setCostSavedMsg(false), 2500);
  };

  const handleSaveCashPortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อบันทึกพอร์ตเติมเงิน');
      return;
    }
    updateCashConfig({
      initialInvestment: Number(cashInvestment),
      initialCashSales: Number(cashSalesInit),
      remainingPoints: Number(remPoints),
      pointExchangeRate: Number(pointRate),
      loanToUrgentCall: Number(loanAmount),
    });
    setCashSavedMsg(true);
    setTimeout(() => setCashSavedMsg(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อนำเข้าข้อมูลสำรอง');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const res = await importFromJson(json);
        alert(res?.message || 'นำเข้าข้อมูลสำรองและซิงก์เข้าฐานข้อมูลสำเร็จเรียบร้อย!');
        onClose();
      } catch (err) {
        alert('ไฟล์สำรองไม่ถูกต้อง กรุณาตรวจสอบไฟล์ JSON');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-dark-900 border border-dark-700 shadow-2xl p-6 text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">ตั้งค่าระบบ & บริหารจัดการข้อมูล</h3>
            <p className="text-xs text-slate-400">
              จัดการฐานข้อมูล Supabase, โครงสร้างต้นทุน Urgent Call (45k), และพอร์ตเติมเงินเดิม (54k)
            </p>
          </div>
        </div>

        {/* Viewer Mode Notice Banner */}
        {!isAdmin && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>โหมด Viewer (ดูได้อย่างเดียว): สามารถดูข้อมูลและทดสอบการเชื่อมต่อได้ แต่การบันทึกแก้ไขต้นทุนและรีเซ็ตข้อมูลต้องเข้าสู่ระบบผ่าน 🔑 Admin Mode ก่อน</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-dark-750 mb-5 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'DATABASE'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Realtime</span>
          </button>

          <button
            onClick={() => setActiveTab('CASH_PORTFOLIO')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'CASH_PORTFOLIO'
                ? 'border-sky-400 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>พอร์ตเติมเงินเดิม (54k)</span>
          </button>

          <button
            onClick={() => setActiveTab('COSTS')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'COSTS'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>ต้นทุน Urgent Call (45k)</span>
          </button>

          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'BACKUP'
                ? 'border-purple-400 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>สำรอง & รีเซ็ตข้อมูล</span>
          </button>
        </div>

        {/* TAB 1: Supabase */}
        {activeTab === 'DATABASE' && (
          <div className="space-y-4 text-xs">
            {/* Status Card */}
            <div className="p-3.5 rounded-2xl bg-dark-850 border border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${
                    supabaseConfig.enabled && isSupabaseConnected
                      ? 'bg-emerald-400 animate-ping'
                      : 'bg-slate-500'
                  }`}
                />
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    {supabaseConfig.enabled && isSupabaseConnected ? (
                      <span className="text-emerald-400">🟢 เชื่อมต่อ Supabase Realtime สำเร็จ (Online)</span>
                    ) : (
                      <span className="text-slate-300">💾 โหมด LocalStorage (Offline Cache)</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {supabaseConfig.enabled && isSupabaseConnected
                      ? 'ข้อมูลจะบันทึกและซิงค์ Realtime ทุกเครื่องที่เปิดใช้งานทันที'
                      : 'ข้อมูลจะถูกบันทึกในเบราว์เซอร์อัตโนมัติแม้ยังไม่ได้เชื่อมต่อ Supabase'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-[11px] text-slate-400">เปิดใช้ Supabase</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={supaEnabled}
                    onChange={(e) => handleToggleSupabase(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Quick Setup Instructions Callout */}
            <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-slate-300 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <Server className="w-4 h-4" />
                <span>คำแนะนำการเชื่อมต่อ Supabase (3 ขั้นตอนง่ายๆ)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                <li>
                  <strong className="text-white">รัน SQL Schema:</strong> กดปุ่มคัดลอก SQL ด้านล่าง ไปรันที่ Supabase Dashboard &gt; SQL Editor (หรือใช้ไฟล์ <code className="text-amber-300 bg-dark-900 px-1 py-0.5 rounded">supabase_schema.sql</code>)
                </li>
                <li>
                  <strong className="text-white">ระบุการเชื่อมต่อ:</strong> ใส่ Project URL และ Anon Key ในไฟล์ <code className="text-amber-300 bg-dark-900 px-1 py-0.5 rounded">.env.local</code> หรือกรอกในช่องด้านล่าง
                </li>
                <li>
                  <strong className="text-white">โอนข้อมูลขึ้น Cloud:</strong> กดปุ่ม <em>"⚡ ทดสอบการเชื่อมต่อ"</em> แล้วกด <em>"📤 อัปโหลดข้อมูลปัจจุบันขึ้น Supabase"</em> เพื่อย้ายสต็อกและยอดขายทั้งหมดขึ้น Cloud
                </li>
              </ol>
            </div>

            {/* Connection Inputs */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Supabase Anon / Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
                className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveSupabase}
                className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกการตั้งค่า</span>
              </button>

              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTesting}
                className="px-4 py-2 rounded-xl font-bold bg-dark-750 hover:bg-dark-700 text-sky-300 border border-sky-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังทดสอบ...</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>⚡ ทดสอบการเชื่อมต่อ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleUploadToCloud}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl font-bold bg-dark-750 hover:bg-dark-700 text-amber-300 border border-amber-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                title="นำข้อมูลยอดขายและสต็อกปัจจุบันทั้งหมดในเครื่อง อัปโหลดขึ้น Supabase"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>กำลังอัปโหลด...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 text-amber-400" />
                    <span>📤 อัปโหลดข้อมูลปัจจุบันขึ้น Supabase</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSeedRealData}
                disabled={isSeeding}
                className="px-4 py-2 rounded-xl font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                title="ล้างและซิงก์ข้อมูลเริ่มต้นจริงเข้า Supabase (ยอดขายไข่ 5 บิล 1,800฿, สต็อก 22 รายการ 13,420฿, ยอดขาย 60 รายการ 51,570.10฿)"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>กำลังซิงก์ข้อมูลจริง...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🌱 ซิงก์ข้อมูลเริ่มต้นจริง (Seed Real Data)</span>
                  </>
                )}
              </button>
            </div>

            {/* Save Status Banner */}
            {saveStatus && (
              <div className="p-2.5 rounded-xl bg-dark-800 border border-slate-600 text-slate-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{saveStatus}</span>
              </div>
            )}

            {/* Seed Result Banner */}
            {seedResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  seedResult.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {seedResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 leading-relaxed">{seedResult.message}</div>
              </div>
            )}

            {/* Test Result Banner */}
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  testResult.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : testResult.type === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {testResult.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />}
                {testResult.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />}
                {testResult.type === 'error' && <WifiOff className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />}
                <div className="flex-1 leading-relaxed">{testResult.message}</div>
              </div>
            )}

            {/* Upload Result Banner */}
            {uploadResult && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  uploadResult.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {uploadResult.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 leading-relaxed">{uploadResult.message}</div>
              </div>
            )}

            {/* SQL Schema Preview & 1-Click Copy */}
            <div className="mt-4 p-4 rounded-2xl bg-dark-850 border border-dark-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-amber-400" />
                  <span>คำสั่ง SQL สำหรับรันใน Supabase (DDL Schema)</span>
                  <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    ไฟล์ supabase_schema.sql
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600 flex items-center gap-1.5 transition-colors text-xs font-medium"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">คัดลอกสำเร็จ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>คัดลอก SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                นำโค้ดด้านล่างนี้ไปวางใน <strong>Supabase Dashboard &gt; SQL Editor &gt; New Query</strong> แล้วกด <strong>RUN</strong> เพื่อสร้างตารางและเปิดสิทธิ์ Realtime ทั้งหมด
              </p>
              <pre className="p-3 rounded-xl bg-dark-950 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-40 border border-dark-800">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: Cash Portfolio Config */}
        {activeTab === 'CASH_PORTFOLIO' && (
          <form onSubmit={handleSaveCashPortfolio} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-dark-850 border border-dark-700 text-slate-300 text-xs">
              ตั้งค่าตัวเลขตั้งต้นสำหรับ <strong>พอร์ตเติมเงินเดิม (54k)</strong> และอัตราแปลงพอยท์
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  เงินลงทุนเติมเงินเดิม (THB)
                </label>
                <input
                  type="number"
                  value={cashInvestment}
                  onChange={(e) => setCashInvestment(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ยอดขายสดสะสมเดิม (THB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cashSalesInit}
                  onChange={(e) => setCashSalesInit(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  พอยท์คงเหลือ (Points)
                </label>
                <input
                  type="number"
                  value={remPoints}
                  onChange={(e) => setRemPoints(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  อัตราแปลงพอยท์เป็นเงินบาท (THB / Point)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={pointRate}
                  onChange={(e) => setPointRate(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  เงินสดที่โอนยืมไปซื้อไข่ Urgent Call (THB)
                </label>
                <input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  เงินที่ดึงออกจากพอร์ตเติมเงินไปจ่ายค่าของ Urgent Call (ปกติ 45,000 THB)
                </span>
              </div>
            </div>

            <div className="p-3 bg-dark-950 rounded-xl border border-dark-750 flex items-center justify-between">
              <span className="text-slate-400">มูลค่าพอยท์คำนวณได้:</span>
              <span className="text-base font-bold text-sky-400">
                ฿{(remPoints * pointRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} THB
              </span>
            </div>

            {cashSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกการตั้งค่าพอร์ตเติมเงินเรียบร้อยแล้ว!</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-sky-500 hover:bg-sky-400 text-dark-950 transition-colors"
            >
              บันทึกการตั้งค่าพอร์ตเติมเงิน
            </button>
          </form>
        )}

        {/* TAB 3: Urgent Call Cost Structure */}
        {activeTab === 'COSTS' && (
          <form onSubmit={handleSaveCosts} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-dark-850 border border-dark-700 text-slate-300 text-xs">
              คำนวณต้นทุนเริ่มต้นงาน Urgent Call: <strong>45,000 THB</strong>
              (Figure 5 กล่อง @ 4,200 = 21,000 THB | Keycap 8 กล่อง @ 3,000 = 24,000 THB)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ต้นทุนรวม Alberta Figure (THB)
                </label>
                <input
                  type="number"
                  value={figureCost}
                  onChange={(e) => setFigureCost(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  จำนวนกล่อง Figure (โควตา)
                </label>
                <input
                  type="number"
                  value={figureBoxes}
                  onChange={(e) => setFigureBoxes(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  ต้นทุนรวม MVP Keycap (THB)
                </label>
                <input
                  type="number"
                  value={keycapCost}
                  onChange={(e) => setKeycapCost(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  จำนวนกล่อง Keycap (โควตา)
                </label>
                <input
                  type="number"
                  value={keycapBoxes}
                  onChange={(e) => setKeycapBoxes(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  จำนวนชุดสิทธิ์โค้ดไอเทม (Code 1 ถึง 9)
                </label>
                <input
                  type="number"
                  value={codesCount}
                  onChange={(e) => setCodesCount(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  จำนวนไข่ต่อโค้ด (ฟอง)
                </label>
                <input
                  type="number"
                  value={eggsPerCode}
                  onChange={(e) => setEggsPerCode(Number(e.target.value))}
                  className="w-full bg-dark-800 border border-dark-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="p-3 bg-dark-950 rounded-xl border border-dark-750 flex items-center justify-between">
              <span className="text-slate-400 font-medium">เงินลงทุน Urgent Call คำนวณได้:</span>
              <span className="text-lg font-black text-amber-400">
                ฿{(Number(figureCost) + Number(keycapCost)).toLocaleString()} THB
              </span>
            </div>

            {costSavedMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกโครงสร้างต้นทุนเรียบร้อยแล้ว!</span>
              </div>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-dark-950 transition-colors"
            >
              บันทึกโครงสร้างต้นทุน
            </button>
          </form>
        )}

        {/* TAB 4: Backup & Reset */}
        {activeTab === 'BACKUP' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-white text-sm">ดาวน์โหลดไฟล์สำรองข้อมูลครบทุกพอร์ต (JSON Backup)</h5>
                <p className="text-slate-400 text-[11px]">
                  ส่งออกข้อมูลการขาย Urgent Call, สต็อก Cash Items, และประวัติการขายทั้งหมด
                </p>
              </div>
              <button
                type="button"
                onClick={triggerExportBackup}
                className="px-4 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-200 border border-dark-600 flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-sky-400" />
                <span>ส่งออก JSON</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-white text-sm">นำเข้าข้อมูลจากไฟล์สำรอง (Restore Backup)</h5>
                <p className="text-slate-400 text-[11px]">
                  กู้คืนข้อมูลทั้งหมดจากไฟล์ JSON ที่เคยสำรองไว้ และซิงก์กลับขึ้น Supabase โดยอัตโนมัติ
                </p>
              </div>
              <label className="px-4 py-2 rounded-xl bg-dark-750 hover:bg-dark-700 text-slate-200 border border-dark-600 flex items-center gap-2 cursor-pointer transition-colors font-medium whitespace-nowrap">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>เลือกไฟล์ JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Seed Real Data Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-dark-850 to-dark-850 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Real Data Migration</span>
                  </span>
                  <h5 className="font-bold text-emerald-300 text-sm">กู้คืน & ซิงก์ข้อมูลเริ่มต้นจริงเข้า Supabase (Seed Real Data)</h5>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  ล้างและแทนที่ด้วยชุดข้อมูลจริงเริ่มต้น: 🥚 ไข่ ROC 5 บิล (100 ฟอง 1,800฿ โค้ด 1 เหลือ 40 ฟอง), Figures (5 กล่อง) & Keycaps (8 กล่อง) คงเหลือ 100%, 💎 สต็อก Cash Items 22 รายการ (13,420฿), 📜 ประวัติการขาย Cash Sales 60 รายการตาม PDF (51,570.10฿) และพอยท์ 88,650
                </p>
              </div>
              <button
                type="button"
                onClick={handleSeedRealData}
                disabled={isSeeding}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-emerald-500/25 whitespace-nowrap disabled:opacity-50"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>กำลังซิงก์...</span>
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4 text-emerald-200" />
                    <span>🌱 ซิงก์ข้อมูลจริง</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-dark-850 border border-dark-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-white text-sm">โหลดข้อมูลตัวอย่างครบชุด (Sample Data)</h5>
                <p className="text-slate-400 text-[11px]">
                  รีเซ็ตและโหลดข้อมูลตัวอย่าง Urgent Call + Cash Items + รายการขายสมจริง
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) {
                    alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อโหลดข้อมูลตัวอย่าง');
                    return;
                  }
                  if (confirm('ต้องการโหลดข้อมูลตัวอย่างสำหรับทดสอบระบบหรือไม่? (ข้อมูลปัจจุบันจะถูกแทนที่)')) {
                    resetToSampleData();
                    alert('โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว!');
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>โหลดตัวอย่าง</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h5 className="font-bold text-rose-300 text-sm">ล้างข้อมูลการขายทั้งหมด (Clear All Sales)</h5>
                <p className="text-slate-400 text-[11px]">
                  ล้างประวัติการขายทั้งหมดเพื่อเริ่มต้นใหม่
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isAdmin) {
                    alert('จำเป็นต้องเข้าสู่ระบบ 🔑 Admin Mode ก่อนเพื่อล้างข้อมูล');
                    return;
                  }
                  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลการขายทั้งหมด? (ไม่สามารถกู้คืนได้)')) {
                    clearAllData();
                    alert('ล้างข้อมูลการขายทั้งหมดเรียบร้อยแล้ว');
                    onClose();
                  }
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-2 transition-colors font-medium whitespace-nowrap"
              >
                <Trash2 className="w-4 h-4" />
                <span>ล้างข้อมูลทั้งหมด</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
