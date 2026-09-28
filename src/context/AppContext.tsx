'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AppCostConfig,
  DashboardSummary,
  EggSale,
  PhysicalSale,
  ServerType,
  PaymentStatus,
  CashItem,
  CashSale,
  CashPortfolioConfig,
  CashPortfolioSummary,
  CombinedCashFlowSummary,
} from '@/types';
import {
  DEFAULT_CONFIG,
  DEFAULT_CASH_PORTFOLIO_CONFIG,
  SAMPLE_EGG_SALES,
  SAMPLE_PHYSICAL_SALES,
  SAMPLE_CASH_ITEMS,
  SAMPLE_CASH_SALES,
} from '@/lib/constants';
import {
  calculateDashboardSummary,
  calculateCashPortfolioSummary,
  calculateCombinedCashFlowSummary,
} from '@/lib/calculations';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  getSupabaseClient,
  testSupabaseConnection,
  SupabaseConfig,
} from '@/lib/supabase';
import { exportToExcel, exportToJsonBackup } from '@/lib/exportUtils';

interface AppContextType {
  // Urgent Call State
  eggSales: EggSale[];
  physicalSales: PhysicalSale[];
  config: AppCostConfig;
  summary: DashboardSummary;
  activeServerTab: ServerType;
  setActiveServerTab: (tab: ServerType) => void;

  // Cash Item & Point Stock State
  cashItems: CashItem[];
  cashSales: CashSale[];
  cashConfig: CashPortfolioConfig;
  cashSummary: CashPortfolioSummary;

  // Combined Inter-Project Cash Flow
  combinedCashFlow: CombinedCashFlowSummary;

  // Supabase & App State
  supabaseConfig: SupabaseConfig;
  isSupabaseConnected: boolean;
  missingTables: string[];
  isLoading: boolean;

  // Urgent Call Actions
  addEggSale: (sale: Omit<EggSale, 'id' | 'createdAt'>) => Promise<boolean>;
  updateEggSale: (id: string, sale: Partial<EggSale>) => Promise<boolean>;
  deleteEggSale: (id: string) => Promise<boolean>;
  toggleEggSaleStatus: (id: string) => Promise<void>;

  addPhysicalSale: (sale: Omit<PhysicalSale, 'id' | 'createdAt'>) => Promise<boolean>;
  updatePhysicalSale: (id: string, sale: Partial<PhysicalSale>) => Promise<boolean>;
  deletePhysicalSale: (id: string) => Promise<boolean>;
  togglePhysicalSaleStatus: (id: string) => Promise<void>;

  // Cash Item Actions
  addCashItem: (item: Omit<CashItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updateCashItem: (id: string, item: Partial<CashItem>) => Promise<boolean>;
  deleteCashItem: (id: string) => Promise<boolean>;
  adjustCashItemStock: (id: string, delta: number) => Promise<boolean>;

  // Cash Sale Actions
  addCashSale: (sale: Omit<CashSale, 'id' | 'createdAt'>) => Promise<boolean>;
  updateCashSale: (id: string, sale: Partial<CashSale>) => Promise<boolean>;
  deleteCashSale: (id: string) => Promise<boolean>;
  toggleCashSaleStatus: (id: string) => Promise<void>;

  // Settings & Utilities
  syncFromPromotionSheet: () => Promise<void>;
  syncFromSalesLedgerPdf: () => Promise<void>;
  uploadLocalToSupabase: () => Promise<{ success: boolean; message: string }>;
  testConnection: () => Promise<{ connected: boolean; message: string; missingTables?: string[] }>;
  updateConfig: (newConfig: Partial<AppCostConfig>) => void;
  updateCashConfig: (newConfig: Partial<CashPortfolioConfig>) => void;
  updateSupabaseConfig: (newConfig: SupabaseConfig) => Promise<boolean>;
  resetToSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  importFromJson: (jsonData: any) => void;
  triggerExportExcel: () => void;
  triggerExportBackup: () => void;
  triggerConfettiEffect: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_EGG_SALES = 'roc_egg_sales_v1';
const LOCAL_STORAGE_PHYSICAL_SALES = 'roc_physical_sales_v1';
const LOCAL_STORAGE_CONFIG = 'roc_app_config_v1';

const LOCAL_STORAGE_CASH_ITEMS = 'roc_cash_items_v1';
const LOCAL_STORAGE_CASH_SALES = 'roc_cash_sales_v1';
const LOCAL_STORAGE_CASH_CONFIG = 'roc_cash_config_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Urgent Call States
  const [eggSales, setEggSales] = useState<EggSale[]>([]);
  const [physicalSales, setPhysicalSales] = useState<PhysicalSale[]>([]);
  const [config, setConfig] = useState<AppCostConfig>(DEFAULT_CONFIG);
  const [activeServerTab, setActiveServerTab] = useState<ServerType>('ROC');

  // Cash Items & Portfolio States
  const [cashItems, setCashItems] = useState<CashItem[]>([]);
  const [cashSales, setCashSales] = useState<CashSale[]>([]);
  const [cashConfig, setCashConfig] = useState<CashPortfolioConfig>(DEFAULT_CASH_PORTFOLIO_CONFIG);

  // Supabase & App State
  const [supabaseConfig, setSupabaseConfigState] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    enabled: false,
  });
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Confetti effect
  const triggerConfettiEffect = useCallback(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#10b981'],
      });
    } catch {
      // ignore
    }
  }, []);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      // Supabase Config
      const supaConf = getStoredSupabaseConfig();
      setSupabaseConfigState(supaConf);

      // Urgent Call Config
      const savedConfig = localStorage.getItem(LOCAL_STORAGE_CONFIG);
      if (savedConfig) setConfig(JSON.parse(savedConfig));

      // Cash Config
      const savedCashConfig = localStorage.getItem(LOCAL_STORAGE_CASH_CONFIG);
      if (savedCashConfig) {
        try {
          const parsed = JSON.parse(savedCashConfig);
          // If stored config had the old unitemized initialCashSales (51,570.10), reset to 0 so it doesn't double-count with 60 PDF sales
          if (parsed && (parsed.initialCashSales === 51570.10 || parsed.initialCashSales === 51570)) {
            parsed.initialCashSales = 0;
            localStorage.setItem(LOCAL_STORAGE_CASH_CONFIG, JSON.stringify(parsed));
          }
          setCashConfig(parsed);
        } catch {
          setCashConfig(DEFAULT_CASH_PORTFOLIO_CONFIG);
        }
      } else {
        setCashConfig(DEFAULT_CASH_PORTFOLIO_CONFIG);
      }

      // Egg Sales
      const savedEgg = localStorage.getItem(LOCAL_STORAGE_EGG_SALES);
      if (savedEgg) {
        setEggSales(JSON.parse(savedEgg));
      } else {
        setEggSales(SAMPLE_EGG_SALES);
        localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(SAMPLE_EGG_SALES));
      }

      // Physical Sales
      const savedPhys = localStorage.getItem(LOCAL_STORAGE_PHYSICAL_SALES);
      if (savedPhys) {
        setPhysicalSales(JSON.parse(savedPhys));
      } else {
        setPhysicalSales(SAMPLE_PHYSICAL_SALES);
        localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(SAMPLE_PHYSICAL_SALES));
      }

      // Cash Items
      const savedCashItems = localStorage.getItem(LOCAL_STORAGE_CASH_ITEMS);
      if (savedCashItems) {
        try {
          const parsed = JSON.parse(savedCashItems);
          if (Array.isArray(parsed)) {
            setCashItems(parsed);
          } else {
            setCashItems(SAMPLE_CASH_ITEMS);
            localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(SAMPLE_CASH_ITEMS));
          }
        } catch {
          setCashItems(SAMPLE_CASH_ITEMS);
          localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(SAMPLE_CASH_ITEMS));
        }
      } else {
        setCashItems(SAMPLE_CASH_ITEMS);
        localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(SAMPLE_CASH_ITEMS));
      }

      // Cash Sales (Full 60 Transactions from PDF)
      const savedCashSales = localStorage.getItem(LOCAL_STORAGE_CASH_SALES);
      if (savedCashSales) {
        try {
          const parsed = JSON.parse(savedCashSales);
          if (Array.isArray(parsed)) {
            // Only upgrade if it's the old 3 dummy items from the initial mock version
            if (parsed.some((s: any) => s.id === 'cs-sample-1' || s.id === 'cs-sample-2')) {
              setCashSales(SAMPLE_CASH_SALES);
              localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));
            } else {
              setCashSales(parsed);
            }
          } else {
            setCashSales(SAMPLE_CASH_SALES);
            localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));
          }
        } catch {
          setCashSales(SAMPLE_CASH_SALES);
          localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));
        }
      } else {
        setCashSales(SAMPLE_CASH_SALES);
        localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));
      }
    } catch (e) {
      console.error('Failed reading initial state from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Handle Supabase Sync & Realtime if connected
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !supabaseConfig.enabled) {
      setIsSupabaseConnected(false);
      return;
    }

    let isMounted = true;

    async function initSupabase() {
      if (!supabase) return;
      try {
        const [
          { data: remoteEggs, error: eggErr },
          { data: remotePhys, error: physErr },
          { data: remoteCashItems, error: itemsErr },
          { data: remoteCashSales, error: salesErr },
          { data: remoteConfigs },
        ] = await Promise.all([
          supabase.from('egg_sales').select('*').order('created_at', { ascending: false }),
          supabase.from('physical_sales').select('*').order('created_at', { ascending: false }),
          supabase.from('cash_items').select('*').order('created_at', { ascending: true }),
          supabase.from('cash_sales').select('*').order('date', { ascending: false }),
          supabase.from('app_configs').select('*'),
        ]);

        const missing: string[] = [];
        if (eggErr && (eggErr.code === 'PGRST205' || eggErr.code === '42P01' || eggErr.message?.includes('not find'))) {
          missing.push('egg_sales');
        }
        if (physErr && (physErr.code === 'PGRST205' || physErr.code === '42P01' || physErr.message?.includes('not find'))) {
          missing.push('physical_sales');
        }
        if (itemsErr && (itemsErr.code === 'PGRST205' || itemsErr.code === '42P01' || itemsErr.message?.includes('not find'))) {
          missing.push('cash_items');
        }
        if (salesErr && (salesErr.code === 'PGRST205' || salesErr.code === '42P01' || salesErr.message?.includes('not find'))) {
          missing.push('cash_sales');
        }

        if (missing.length > 0) {
          if (isMounted) {
            setMissingTables(missing);
            setIsSupabaseConnected(false);
          }
          console.warn('⚠️ Supabase tables missing:', missing);
          return;
        }

        if (isMounted) {
          setMissingTables([]);
          setIsSupabaseConnected(true);
        }

        const isSupabaseEmpty =
          (!remoteEggs || remoteEggs.length === 0) &&
          (!remotePhys || remotePhys.length === 0) &&
          (!remoteCashItems || remoteCashItems.length === 0) &&
          (!remoteCashSales || remoteCashSales.length === 0);

        if (isSupabaseEmpty) {
          // First time connecting to a fresh database: auto-seed from local data
            console.log('⚡ Supabase database is empty. Auto-seeding initial data to Supabase...');
            const localEgg = localStorage.getItem(LOCAL_STORAGE_EGG_SALES);
            const currentEggs: EggSale[] = localEgg ? JSON.parse(localEgg) : SAMPLE_EGG_SALES;
            const localPhys = localStorage.getItem(LOCAL_STORAGE_PHYSICAL_SALES);
            const currentPhys: PhysicalSale[] = localPhys ? JSON.parse(localPhys) : SAMPLE_PHYSICAL_SALES;
            const localItems = localStorage.getItem(LOCAL_STORAGE_CASH_ITEMS);
            const currentItems: CashItem[] = localItems ? JSON.parse(localItems) : SAMPLE_CASH_ITEMS;
            const localSales = localStorage.getItem(LOCAL_STORAGE_CASH_SALES);
            const currentSales: CashSale[] = localSales ? JSON.parse(localSales) : SAMPLE_CASH_SALES;

            if (currentEggs.length > 0) {
              await supabase.from('egg_sales').upsert(
                currentEggs.map((s) => ({
                  id: s.id,
                  server: s.server,
                  code_id: s.codeId,
                  customer_name: s.customerName,
                  quantity: s.quantity,
                  price_per_egg: s.pricePerEgg,
                  total_amount: s.totalAmount,
                  status: s.status,
                  date: s.date,
                  note: s.note || '',
                }))
              );
            }
            if (currentPhys.length > 0) {
              await supabase.from('physical_sales').upsert(
                currentPhys.map((s) => ({
                  id: s.id,
                  category: s.category,
                  item_name: s.itemName,
                  customer_name: s.customerName,
                  quantity: s.quantity,
                  unit_price: s.unitPrice,
                  total_amount: s.totalAmount,
                  status: s.status,
                  channel: s.channel || '',
                  date: s.date,
                  note: s.note || '',
                }))
              );
            }
            if (currentItems.length > 0) {
              await supabase.from('cash_items').upsert(
                currentItems.map((i) => ({
                  id: i.id,
                  name: i.name,
                  category: i.category,
                  server: i.server,
                  total_qty: i.totalQty ?? 0,
                  sold_qty: i.soldQty ?? 0,
                  stock_qty: i.stockQty,
                  total_sale: i.totalSale ?? 0,
                  target_price_per_unit: i.targetPricePerUnit,
                  remain_sale: i.remainSale ?? i.stockQty * i.targetPricePerUnit,
                  note: i.note || '',
                }))
              );
            }
            if (currentSales.length > 0) {
              await supabase.from('cash_sales').upsert(
                currentSales.map((s) => ({
                  id: s.id,
                  cash_item_id: s.cashItemId || null,
                  item_name: s.itemName,
                  category: s.category,
                  customer_name: s.customerName,
                  quantity: s.quantity,
                  unit_price: s.unitPrice,
                  total_amount: s.totalAmount,
                  server: s.server,
                  status: s.status,
                  date: s.date,
                  note: s.note || '',
                }))
              );
            }
          } else {
            // Load existing cloud data as single source of truth
            if (remoteEggs && remoteEggs.length > 0) {
              const mappedEggs: EggSale[] = remoteEggs.map((r: any) => ({
                id: r.id,
                server: r.server,
                codeId: Number(r.code_id),
                customerName: r.customer_name,
                quantity: Number(r.quantity),
                pricePerEgg: Number(r.price_per_egg),
                totalAmount: Number(r.total_amount),
                status: r.status,
                date: r.date,
                note: r.note || '',
                createdAt: r.created_at || new Date().toISOString(),
              }));
              setEggSales(mappedEggs);
              localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(mappedEggs));
            }

            if (remotePhys && remotePhys.length > 0) {
              const mappedPhys: PhysicalSale[] = remotePhys.map((r: any) => ({
                id: r.id,
                category: r.category,
                itemName: r.item_name,
                customerName: r.customer_name,
                quantity: Number(r.quantity),
                unitPrice: Number(r.unit_price),
                totalAmount: Number(r.total_amount),
                status: r.status,
                channel: r.channel || '',
                date: r.date,
                note: r.note || '',
                createdAt: r.created_at || new Date().toISOString(),
              }));
              setPhysicalSales(mappedPhys);
              localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(mappedPhys));
            }

            if (remoteCashItems && remoteCashItems.length > 0) {
              const mappedItems: CashItem[] = remoteCashItems.map((r: any) => ({
                id: r.id,
                name: r.name,
                category: r.category,
                server: r.server,
                totalQty: r.total_qty != null ? Number(r.total_qty) : undefined,
                soldQty: r.sold_qty != null ? Number(r.sold_qty) : undefined,
                stockQty: Number(r.stock_qty) || 0,
                totalSale: r.total_sale != null ? Number(r.total_sale) : undefined,
                targetPricePerUnit: Number(r.target_price_per_unit) || 0,
                remainSale:
                  r.remain_sale != null
                    ? Number(r.remain_sale)
                    : (Number(r.stock_qty) || 0) * (Number(r.target_price_per_unit) || 0),
                note: r.note || '',
                createdAt: r.created_at || new Date().toISOString(),
              }));
              setCashItems(mappedItems);
              localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(mappedItems));
            }

            if (remoteCashSales && remoteCashSales.length > 0) {
              const mappedSales: CashSale[] = remoteCashSales.map((r: any) => ({
                id: r.id,
                cashItemId: r.cash_item_id || undefined,
                itemName: r.item_name,
                category: r.category,
                customerName: r.customer_name,
                quantity: Number(r.quantity),
                unitPrice: Number(r.unit_price),
                totalAmount: Number(r.total_amount),
                server: r.server,
                status: r.status,
                date: r.date,
                note: r.note || '',
                createdAt: r.created_at || new Date().toISOString(),
              }));
              setCashSales(mappedSales);
              localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(mappedSales));
            }

            if (remoteConfigs && remoteConfigs.length > 0) {
              const urgentConf = remoteConfigs.find((c: any) => c.key === 'urgent_call_config');
              if (urgentConf?.value) {
                setConfig(urgentConf.value);
                localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(urgentConf.value));
              }
              const cashConf = remoteConfigs.find((c: any) => c.key === 'cash_portfolio_config');
              if (cashConf?.value) {
                setCashConfig(cashConf.value);
                localStorage.setItem(LOCAL_STORAGE_CASH_CONFIG, JSON.stringify(cashConf.value));
              }
            }
          }
      } catch (err) {
        console.warn('Supabase connect check warning:', err);
        if (isMounted) setIsSupabaseConnected(false);
      }
    }

    initSupabase();

    // -------------------------------------------------------------
    // Full Realtime Subscriptions (INSERT, UPDATE, DELETE for all tables)
    // -------------------------------------------------------------
    const channel = supabase
      .channel('db-realtime-all-changes')
      // 1. egg_sales realtime
      .on('postgres_changes', { event: '*', schema: 'public', table: 'egg_sales' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as any;
          const mapped: EggSale = {
            id: r.id,
            server: r.server,
            codeId: Number(r.code_id),
            customerName: r.customer_name,
            quantity: Number(r.quantity),
            pricePerEgg: Number(r.price_per_egg),
            totalAmount: Number(r.total_amount),
            status: r.status,
            date: r.date,
            note: r.note || '',
            createdAt: r.created_at || new Date().toISOString(),
          };
          setEggSales((prev) => {
            if (prev.some((x) => x.id === mapped.id)) return prev;
            const updated = [mapped, ...prev];
            localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new as any;
          setEggSales((prev) => {
            const updated = prev.map((x) =>
              x.id === r.id
                ? {
                    ...x,
                    server: r.server,
                    codeId: Number(r.code_id),
                    customerName: r.customer_name,
                    quantity: Number(r.quantity),
                    pricePerEgg: Number(r.price_per_egg),
                    totalAmount: Number(r.total_amount),
                    status: r.status,
                    date: r.date,
                    note: r.note || '',
                  }
                : x
            );
            localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as any;
          if (oldRow?.id) {
            setEggSales((prev) => {
              const updated = prev.filter((item) => item.id !== oldRow.id);
              localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      // 2. physical_sales realtime
      .on('postgres_changes', { event: '*', schema: 'public', table: 'physical_sales' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as any;
          const mapped: PhysicalSale = {
            id: r.id,
            category: r.category,
            itemName: r.item_name,
            customerName: r.customer_name,
            quantity: Number(r.quantity),
            unitPrice: Number(r.unit_price),
            totalAmount: Number(r.total_amount),
            status: r.status,
            channel: r.channel || '',
            date: r.date,
            note: r.note || '',
            createdAt: r.created_at || new Date().toISOString(),
          };
          setPhysicalSales((prev) => {
            if (prev.some((x) => x.id === mapped.id)) return prev;
            const updated = [mapped, ...prev];
            localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new as any;
          setPhysicalSales((prev) => {
            const updated = prev.map((x) =>
              x.id === r.id
                ? {
                    ...x,
                    category: r.category,
                    itemName: r.item_name,
                    customerName: r.customer_name,
                    quantity: Number(r.quantity),
                    unitPrice: Number(r.unit_price),
                    totalAmount: Number(r.total_amount),
                    status: r.status,
                    channel: r.channel || '',
                    date: r.date,
                    note: r.note || '',
                  }
                : x
            );
            localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as any;
          if (oldRow?.id) {
            setPhysicalSales((prev) => {
              const updated = prev.filter((item) => item.id !== oldRow.id);
              localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      // 3. cash_items realtime
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_items' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as any;
          const mapped: CashItem = {
            id: r.id,
            name: r.name,
            category: r.category,
            server: r.server,
            totalQty: r.total_qty != null ? Number(r.total_qty) : undefined,
            soldQty: r.sold_qty != null ? Number(r.sold_qty) : undefined,
            stockQty: Number(r.stock_qty) || 0,
            totalSale: r.total_sale != null ? Number(r.total_sale) : undefined,
            targetPricePerUnit: Number(r.target_price_per_unit) || 0,
            remainSale:
              r.remain_sale != null
                ? Number(r.remain_sale)
                : (Number(r.stock_qty) || 0) * (Number(r.target_price_per_unit) || 0),
            note: r.note || '',
            createdAt: r.created_at || new Date().toISOString(),
          };
          setCashItems((prev) => {
            if (prev.some((x) => x.id === mapped.id)) return prev;
            const updated = [...prev, mapped];
            localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new as any;
          setCashItems((prev) => {
            const updated = prev.map((x) =>
              x.id === r.id
                ? {
                    ...x,
                    name: r.name,
                    category: r.category,
                    server: r.server,
                    totalQty: r.total_qty != null ? Number(r.total_qty) : x.totalQty,
                    soldQty: r.sold_qty != null ? Number(r.sold_qty) : x.soldQty,
                    stockQty: Number(r.stock_qty) || 0,
                    totalSale: r.total_sale != null ? Number(r.total_sale) : x.totalSale,
                    targetPricePerUnit: Number(r.target_price_per_unit) || 0,
                    remainSale:
                      r.remain_sale != null
                        ? Number(r.remain_sale)
                        : (Number(r.stock_qty) || 0) * (Number(r.target_price_per_unit) || 0),
                    note: r.note || '',
                  }
                : x
            );
            localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as any;
          if (oldRow?.id) {
            setCashItems((prev) => {
              const updated = prev.filter((item) => item.id !== oldRow.id);
              localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      // 4. cash_sales realtime
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cash_sales' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new as any;
          const mapped: CashSale = {
            id: r.id,
            cashItemId: r.cash_item_id || undefined,
            itemName: r.item_name,
            category: r.category,
            customerName: r.customer_name,
            quantity: Number(r.quantity),
            unitPrice: Number(r.unit_price),
            totalAmount: Number(r.total_amount),
            server: r.server,
            status: r.status,
            date: r.date,
            note: r.note || '',
            createdAt: r.created_at || new Date().toISOString(),
          };
          setCashSales((prev) => {
            if (prev.some((x) => x.id === mapped.id)) return prev;
            const updated = [mapped, ...prev];
            localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'UPDATE') {
          const r = payload.new as any;
          setCashSales((prev) => {
            const updated = prev.map((x) =>
              x.id === r.id
                ? {
                    ...x,
                    cashItemId: r.cash_item_id || undefined,
                    itemName: r.item_name,
                    category: r.category,
                    customerName: r.customer_name,
                    quantity: Number(r.quantity),
                    unitPrice: Number(r.unit_price),
                    totalAmount: Number(r.total_amount),
                    server: r.server,
                    status: r.status,
                    date: r.date,
                    note: r.note || '',
                  }
                : x
            );
            localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updated));
            return updated;
          });
        } else if (payload.eventType === 'DELETE') {
          const oldRow = payload.old as any;
          if (oldRow?.id) {
            setCashSales((prev) => {
              const updated = prev.filter((item) => item.id !== oldRow.id);
              localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updated));
              return updated;
            });
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseConnected(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn('Realtime channel status:', status);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [supabaseConfig]);

  // Synchronize localStorage between tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_EGG_SALES && e.newValue) setEggSales(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_PHYSICAL_SALES && e.newValue) setPhysicalSales(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_CONFIG && e.newValue) setConfig(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_CASH_ITEMS && e.newValue) setCashItems(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_CASH_SALES && e.newValue) setCashSales(JSON.parse(e.newValue));
      if (e.key === LOCAL_STORAGE_CASH_CONFIG && e.newValue) setCashConfig(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Compute Summaries
  const summary = useMemo(() => {
    return calculateDashboardSummary(eggSales, physicalSales, config);
  }, [eggSales, physicalSales, config]);

  const cashSummary = useMemo(() => {
    return calculateCashPortfolioSummary(cashItems, cashSales, cashConfig);
  }, [cashItems, cashSales, cashConfig]);

  const combinedCashFlow = useMemo(() => {
    return calculateCombinedCashFlowSummary(summary, cashSummary, cashConfig);
  }, [summary, cashSummary, cashConfig]);

  // ----------------------------------------
  // Actions: Urgent Call Egg Sales
  // ----------------------------------------
  const addEggSale = useCallback(
    async (newSaleData: Omit<EggSale, 'id' | 'createdAt'>): Promise<boolean> => {
      const newSale: EggSale = {
        ...newSaleData,
        id: `egg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newSale, ...eggSales];
      setEggSales(updated);
      localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('egg_sales').insert([
            {
              id: newSale.id,
              server: newSale.server,
              code_id: newSale.codeId,
              customer_name: newSale.customerName,
              quantity: newSale.quantity,
              price_per_egg: newSale.pricePerEgg,
              total_amount: newSale.totalAmount,
              status: newSale.status,
              date: newSale.date,
              note: newSale.note || '',
            },
          ]);
        } catch (e) {
          console.error('Supabase egg insert error:', e);
        }
      }

      const newSummary = calculateDashboardSummary(updated, physicalSales, config);
      if (newSummary.isBreakeven >= 100 && summary.isBreakeven < 100) {
        triggerConfettiEffect();
      }

      return true;
    },
    [eggSales, physicalSales, config, summary.isBreakeven, triggerConfettiEffect]
  );

  const updateEggSale = useCallback(
    async (id: string, partial: Partial<EggSale>): Promise<boolean> => {
      const updated = eggSales.map((s) => (s.id === id ? { ...s, ...partial } : s));
      setEggSales(updated);
      localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const mapped: any = {};
          if (partial.server !== undefined) mapped.server = partial.server;
          if (partial.codeId !== undefined) mapped.code_id = partial.codeId;
          if (partial.customerName !== undefined) mapped.customer_name = partial.customerName;
          if (partial.quantity !== undefined) mapped.quantity = partial.quantity;
          if (partial.pricePerEgg !== undefined) mapped.price_per_egg = partial.pricePerEgg;
          if (partial.totalAmount !== undefined) mapped.total_amount = partial.totalAmount;
          if (partial.status !== undefined) mapped.status = partial.status;
          if (partial.date !== undefined) mapped.date = partial.date;
          if (partial.note !== undefined) mapped.note = partial.note;

          await supabase.from('egg_sales').update(mapped).eq('id', id);
        } catch (e) {
          console.error('Supabase update egg error:', e);
        }
      }
      return true;
    },
    [eggSales]
  );

  const deleteEggSale = useCallback(
    async (id: string): Promise<boolean> => {
      const updated = eggSales.filter((s) => s.id !== id);
      setEggSales(updated);
      localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('egg_sales').delete().eq('id', id);
        } catch (e) {
          console.error('Supabase delete egg error:', e);
        }
      }
      return true;
    },
    [eggSales]
  );

  const toggleEggSaleStatus = useCallback(
    async (id: string) => {
      const target = eggSales.find((s) => s.id === id);
      if (!target) return;
      const nextStatus: PaymentStatus = target.status === 'Clear' ? 'Pending' : 'Clear';
      await updateEggSale(id, { status: nextStatus });
    },
    [eggSales, updateEggSale]
  );

  // ----------------------------------------
  // Actions: Urgent Call Physical Sales
  // ----------------------------------------
  const addPhysicalSale = useCallback(
    async (newSaleData: Omit<PhysicalSale, 'id' | 'createdAt'>): Promise<boolean> => {
      const newSale: PhysicalSale = {
        ...newSaleData,
        id: `phys-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newSale, ...physicalSales];
      setPhysicalSales(updated);
      localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('physical_sales').insert([
            {
              id: newSale.id,
              category: newSale.category,
              item_name: newSale.itemName,
              customer_name: newSale.customerName,
              quantity: newSale.quantity,
              unit_price: newSale.unitPrice,
              total_amount: newSale.totalAmount,
              status: newSale.status,
              channel: newSale.channel || '',
              date: newSale.date,
              note: newSale.note || '',
            },
          ]);
        } catch (e) {
          console.error('Supabase physical insert error:', e);
        }
      }

      const newSummary = calculateDashboardSummary(eggSales, updated, config);
      if (newSummary.isBreakeven >= 100 && summary.isBreakeven < 100) {
        triggerConfettiEffect();
      }

      return true;
    },
    [eggSales, physicalSales, config, summary.isBreakeven, triggerConfettiEffect]
  );

  const updatePhysicalSale = useCallback(
    async (id: string, partial: Partial<PhysicalSale>): Promise<boolean> => {
      const updated = physicalSales.map((s) => (s.id === id ? { ...s, ...partial } : s));
      setPhysicalSales(updated);
      localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const mapped: any = {};
          if (partial.category !== undefined) mapped.category = partial.category;
          if (partial.itemName !== undefined) mapped.item_name = partial.itemName;
          if (partial.customerName !== undefined) mapped.customer_name = partial.customerName;
          if (partial.quantity !== undefined) mapped.quantity = partial.quantity;
          if (partial.unitPrice !== undefined) mapped.unit_price = partial.unitPrice;
          if (partial.totalAmount !== undefined) mapped.total_amount = partial.totalAmount;
          if (partial.status !== undefined) mapped.status = partial.status;
          if (partial.channel !== undefined) mapped.channel = partial.channel;
          if (partial.date !== undefined) mapped.date = partial.date;
          if (partial.note !== undefined) mapped.note = partial.note;

          await supabase.from('physical_sales').update(mapped).eq('id', id);
        } catch (e) {
          console.error('Supabase update physical error:', e);
        }
      }
      return true;
    },
    [physicalSales]
  );

  const deletePhysicalSale = useCallback(
    async (id: string): Promise<boolean> => {
      const updated = physicalSales.filter((s) => s.id !== id);
      setPhysicalSales(updated);
      localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('physical_sales').delete().eq('id', id);
        } catch (e) {
          console.error('Supabase delete physical error:', e);
        }
      }
      return true;
    },
    [physicalSales]
  );

  const togglePhysicalSaleStatus = useCallback(
    async (id: string) => {
      const target = physicalSales.find((s) => s.id === id);
      if (!target) return;
      const nextStatus: PaymentStatus = target.status === 'Clear' ? 'Pending' : 'Clear';
      await updatePhysicalSale(id, { status: nextStatus });
    },
    [physicalSales, updatePhysicalSale]
  );

  // ----------------------------------------
  // Actions: Cash Items (Inventory Management)
  // ----------------------------------------
  const addCashItem = useCallback(
    async (newItemData: Omit<CashItem, 'id' | 'createdAt'>): Promise<boolean> => {
      const newItem: CashItem = {
        ...newItemData,
        id: `ci-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      const updated = [newItem, ...cashItems];
      setCashItems(updated);
      localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('cash_items').insert([
            {
              id: newItem.id,
              name: newItem.name,
              category: newItem.category,
              server: newItem.server,
              total_qty: newItem.totalQty ?? 0,
              sold_qty: newItem.soldQty ?? 0,
              stock_qty: newItem.stockQty,
              total_sale: newItem.totalSale ?? 0,
              target_price_per_unit: newItem.targetPricePerUnit,
              remain_sale: newItem.remainSale ?? newItem.stockQty * newItem.targetPricePerUnit,
              note: newItem.note || '',
            },
          ]);
        } catch (e) {
          console.error('Supabase cash_items insert error:', e);
        }
      }

      return true;
    },
    [cashItems]
  );

  const updateCashItem = useCallback(
    async (id: string, partial: Partial<CashItem>): Promise<boolean> => {
      let updatedItem: CashItem | undefined;
      setCashItems((prev) => {
        const next = prev.map((item) => {
          if (item.id === id) {
            const merged = { ...item, ...partial };
            if (partial.stockQty !== undefined || partial.targetPricePerUnit !== undefined) {
              const q = partial.stockQty !== undefined ? partial.stockQty : item.stockQty;
              const p = partial.targetPricePerUnit !== undefined ? partial.targetPricePerUnit : item.targetPricePerUnit;
              merged.remainSale = q * p;
            }
            updatedItem = merged;
            return merged;
          }
          return item;
        });
        localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(next));
        return next;
      });

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const mapped: any = {};
          if (partial.name !== undefined) mapped.name = partial.name;
          if (partial.category !== undefined) mapped.category = partial.category;
          if (partial.server !== undefined) mapped.server = partial.server;
          if (partial.stockQty !== undefined) mapped.stock_qty = partial.stockQty;
          if (partial.totalQty !== undefined) mapped.total_qty = partial.totalQty;
          if (partial.soldQty !== undefined) mapped.sold_qty = partial.soldQty;
          if (partial.totalSale !== undefined) mapped.total_sale = partial.totalSale;
          if (partial.targetPricePerUnit !== undefined)
            mapped.target_price_per_unit = partial.targetPricePerUnit;
          if (updatedItem && updatedItem.remainSale !== undefined) {
            mapped.remain_sale = updatedItem.remainSale;
          }
          if (partial.note !== undefined) mapped.note = partial.note;

          const { error } = await supabase.from('cash_items').update(mapped).eq('id', id);
          if (error) {
            console.error('Supabase update cash_item error:', error.message);
          }
        } catch (e) {
          console.error('Supabase cash_items update error:', e);
        }
      }
      return true;
    },
    []
  );

  const deleteCashItem = useCallback(
    async (id: string): Promise<boolean> => {
      const updated = cashItems.filter((i) => i.id !== id);
      setCashItems(updated);
      localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('cash_items').delete().eq('id', id);
        } catch (e) {
          console.error('Supabase cash_items delete error:', e);
        }
      }
      return true;
    },
    [cashItems]
  );

  const adjustCashItemStock = useCallback(
    async (id: string, delta: number): Promise<boolean> => {
      const target = cashItems.find((i) => i.id === id);
      if (!target) return false;
      const nextQty = Math.max(0, target.stockQty + delta);
      const nextRemainSale = nextQty * target.targetPricePerUnit;

      // 1. อัปเดต state ในเครื่องทันที (Optimistic Update)
      setCashItems((prev) => {
        const next = prev.map((i) =>
          i.id === id
            ? {
                ...i,
                stockQty: nextQty,
                remainSale: nextRemainSale,
              }
            : i
        );
        localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(next));
        return next;
      });

      // 2. ส่งค่าอัปเดตตรงไปยังตาราง cash_items ใน Supabase ทันที
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const { error } = await supabase
            .from('cash_items')
            .update({
              stock_qty: nextQty,
              remain_sale: nextRemainSale,
            })
            .eq('id', id);

          if (error) {
            console.error('Supabase adjustCashItemStock error:', error.message);
          }
        } catch (e) {
          console.error('Supabase adjustCashItemStock exception:', e);
        }
      }
      return true;
    },
    [cashItems]
  );

  // ----------------------------------------
  // Actions: Cash Item Sales
  // ----------------------------------------
  const addCashSale = useCallback(
    async (newSaleData: Omit<CashSale, 'id' | 'createdAt'>): Promise<boolean> => {
      const newSale: CashSale = {
        ...newSaleData,
        id: `cs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      // 1. Add to sales
      const updatedSales = [newSale, ...cashSales];
      setCashSales(updatedSales);
      localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updatedSales));

      // 2. Automatically deduct item stock if tied to cashItemId
      if (newSale.cashItemId) {
        const item = cashItems.find((i) => i.id === newSale.cashItemId);
        if (item) {
          const nextStock = Math.max(0, item.stockQty - newSale.quantity);
          const nextRemainSale = nextStock * item.targetPricePerUnit;
          setCashItems((prev) => {
            const next = prev.map((i) =>
              i.id === item.id ? { ...i, stockQty: nextStock, remainSale: nextRemainSale } : i
            );
            localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(next));
            return next;
          });

          const supabase = getSupabaseClient();
          if (supabase) {
            try {
              await supabase
                .from('cash_items')
                .update({ stock_qty: nextStock, remain_sale: nextRemainSale })
                .eq('id', item.id);
            } catch (e) {
              console.error('Supabase stock deduction error:', e);
            }
          }
        }
      }

      // 3. Supabase insert sale
      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('cash_sales').insert([
            {
              id: newSale.id,
              cash_item_id: newSale.cashItemId || null,
              item_name: newSale.itemName,
              category: newSale.category,
              customer_name: newSale.customerName,
              quantity: newSale.quantity,
              unit_price: newSale.unitPrice,
              total_amount: newSale.totalAmount,
              server: newSale.server,
              status: newSale.status,
              date: newSale.date,
              note: newSale.note || '',
            },
          ]);
        } catch (e) {
          console.error('Supabase cash_sales insert error:', e);
        }
      }

      return true;
    },
    [cashSales, cashItems]
  );

  const updateCashSale = useCallback(
    async (id: string, partial: Partial<CashSale>): Promise<boolean> => {
      const updated = cashSales.map((s) => (s.id === id ? { ...s, ...partial } : s));
      setCashSales(updated);
      localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          const mapped: any = {};
          if (partial.itemName !== undefined) mapped.item_name = partial.itemName;
          if (partial.category !== undefined) mapped.category = partial.category;
          if (partial.customerName !== undefined) mapped.customer_name = partial.customerName;
          if (partial.quantity !== undefined) mapped.quantity = partial.quantity;
          if (partial.unitPrice !== undefined) mapped.unit_price = partial.unitPrice;
          if (partial.totalAmount !== undefined) mapped.total_amount = partial.totalAmount;
          if (partial.server !== undefined) mapped.server = partial.server;
          if (partial.status !== undefined) mapped.status = partial.status;
          if (partial.date !== undefined) mapped.date = partial.date;
          if (partial.note !== undefined) mapped.note = partial.note;

          await supabase.from('cash_sales').update(mapped).eq('id', id);
        } catch (e) {
          console.error('Supabase cash_sales update error:', e);
        }
      }
      return true;
    },
    [cashSales]
  );

  const deleteCashSale = useCallback(
    async (id: string): Promise<boolean> => {
      const updated = cashSales.filter((s) => s.id !== id);
      setCashSales(updated);
      localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(updated));

      const supabase = getSupabaseClient();
      if (supabase) {
        try {
          await supabase.from('cash_sales').delete().eq('id', id);
        } catch (e) {
          console.error('Supabase cash_sales delete error:', e);
        }
      }
      return true;
    },
    [cashSales]
  );

  const toggleCashSaleStatus = useCallback(
    async (id: string) => {
      const target = cashSales.find((s) => s.id === id);
      if (!target) return;
      const nextStatus: PaymentStatus = target.status === 'Clear' ? 'Pending' : 'Clear';
      await updateCashSale(id, { status: nextStatus });
    },
    [cashSales, updateCashSale]
  );

  // ----------------------------------------
  // Settings & Utilities
  // ----------------------------------------
  const updateConfig = useCallback(async (newConfig: Partial<AppCostConfig>) => {
    setConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(merged));

      const supabase = getSupabaseClient();
      if (supabase) {
        supabase
          .from('app_configs')
          .upsert({ key: 'urgent_call_config', value: merged, updated_at: new Date().toISOString() })
          .then();
      }

      return merged;
    });
  }, []);

  const updateCashConfig = useCallback(async (newConfig: Partial<CashPortfolioConfig>) => {
    setCashConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      localStorage.setItem(LOCAL_STORAGE_CASH_CONFIG, JSON.stringify(merged));

      const supabase = getSupabaseClient();
      if (supabase) {
        supabase
          .from('app_configs')
          .upsert({ key: 'cash_portfolio_config', value: merged, updated_at: new Date().toISOString() })
          .then();
      }

      return merged;
    });
  }, []);

  const testConnection = useCallback(async () => {
    return await testSupabaseConnection();
  }, []);

  const updateSupabaseConfig = useCallback(async (newConfig: SupabaseConfig): Promise<boolean> => {
    saveStoredSupabaseConfig(newConfig);
    setSupabaseConfigState(newConfig);
    if (!newConfig.enabled || !newConfig.url || !newConfig.anonKey) {
      setIsSupabaseConnected(false);
      return false;
    }
    const res = await testSupabaseConnection();
    setIsSupabaseConnected(res.connected);
    return res.connected;
  }, []);

  const uploadLocalToSupabase = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    const supabase = getSupabaseClient();
    if (!supabase || !supabaseConfig.enabled) {
      return { success: false, message: 'กรุณาระบุและเปิดใช้งาน Supabase ใน .env.local หรือหน้าตั้งค่าก่อน' };
    }

    try {
      if (eggSales.length > 0) {
        await supabase.from('egg_sales').upsert(
          eggSales.map((s) => ({
            id: s.id,
            server: s.server,
            code_id: s.codeId,
            customer_name: s.customerName,
            quantity: s.quantity,
            price_per_egg: s.pricePerEgg,
            total_amount: s.totalAmount,
            status: s.status,
            date: s.date,
            note: s.note || '',
          }))
        );
      }

      if (physicalSales.length > 0) {
        await supabase.from('physical_sales').upsert(
          physicalSales.map((s) => ({
            id: s.id,
            category: s.category,
            item_name: s.itemName,
            customer_name: s.customerName,
            quantity: s.quantity,
            unit_price: s.unitPrice,
            total_amount: s.totalAmount,
            status: s.status,
            channel: s.channel || '',
            date: s.date,
            note: s.note || '',
          }))
        );
      }

      if (cashItems.length > 0) {
        await supabase.from('cash_items').upsert(
          cashItems.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            server: i.server,
            total_qty: i.totalQty ?? 0,
            sold_qty: i.soldQty ?? 0,
            stock_qty: i.stockQty,
            total_sale: i.totalSale ?? 0,
            target_price_per_unit: i.targetPricePerUnit,
            remain_sale: i.remainSale ?? i.stockQty * i.targetPricePerUnit,
            note: i.note || '',
          }))
        );
      }

      if (cashSales.length > 0) {
        await supabase.from('cash_sales').upsert(
          cashSales.map((s) => ({
            id: s.id,
            cash_item_id: s.cashItemId || null,
            item_name: s.itemName,
            category: s.category,
            customer_name: s.customerName,
            quantity: s.quantity,
            unit_price: s.unitPrice,
            total_amount: s.totalAmount,
            server: s.server,
            status: s.status,
            date: s.date,
            note: s.note || '',
          }))
        );
      }

      await supabase.from('app_configs').upsert([
        { key: 'urgent_call_config', value: config, updated_at: new Date().toISOString() },
        { key: 'cash_portfolio_config', value: cashConfig, updated_at: new Date().toISOString() },
      ]);

      return {
        success: true,
        message: `อัปโหลดขึ้น Supabase สำเร็จเรียบร้อย! (ยอดไข่ ${eggSales.length}, สต็อก ${cashItems.length}, ยอดขาย ${cashSales.length} รายการ)`,
      };
    } catch (err: any) {
      console.error('Upload local to Supabase error:', err);
      return { success: false, message: `อัปโหลดไม่สำเร็จ: ${err.message || err}` };
    }
  }, [eggSales, physicalSales, cashItems, cashSales, config, cashConfig, supabaseConfig.enabled]);

  const syncFromPromotionSheet = useCallback(async () => {
    setCashItems(SAMPLE_CASH_ITEMS);
    localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(SAMPLE_CASH_ITEMS));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('cash_items').upsert(
          SAMPLE_CASH_ITEMS.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            server: i.server,
            total_qty: i.totalQty ?? 0,
            sold_qty: i.soldQty ?? 0,
            stock_qty: i.stockQty,
            total_sale: i.totalSale ?? 0,
            target_price_per_unit: i.targetPricePerUnit,
            remain_sale: i.remainSale ?? i.stockQty * i.targetPricePerUnit,
            note: i.note || '',
          }))
        );
      } catch (e) {
        console.error('Supabase sync cash items error:', e);
      }
    }
  }, []);

  const syncFromSalesLedgerPdf = useCallback(async () => {
    setCashSales(SAMPLE_CASH_SALES);
    localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('cash_sales').upsert(
          SAMPLE_CASH_SALES.map((s) => ({
            id: s.id,
            cash_item_id: s.cashItemId || null,
            item_name: s.itemName,
            category: s.category,
            customer_name: s.customerName,
            quantity: s.quantity,
            unit_price: s.unitPrice,
            total_amount: s.totalAmount,
            server: s.server,
            status: s.status,
            date: s.date,
            note: s.note || '',
          }))
        );
      } catch (e) {
        console.error('Supabase sync cash sales error:', e);
      }
    }
  }, []);

  const resetToSampleData = useCallback(async () => {
    setEggSales(SAMPLE_EGG_SALES);
    setPhysicalSales(SAMPLE_PHYSICAL_SALES);
    setConfig(DEFAULT_CONFIG);
    setCashItems(SAMPLE_CASH_ITEMS);
    setCashSales(SAMPLE_CASH_SALES);
    setCashConfig(DEFAULT_CASH_PORTFOLIO_CONFIG);

    localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(SAMPLE_EGG_SALES));
    localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(SAMPLE_PHYSICAL_SALES));
    localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(SAMPLE_CASH_ITEMS));
    localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(SAMPLE_CASH_SALES));
    localStorage.setItem(LOCAL_STORAGE_CASH_CONFIG, JSON.stringify(DEFAULT_CASH_PORTFOLIO_CONFIG));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await uploadLocalToSupabase();
      } catch (e) {
        console.error('Supabase reset sample error:', e);
      }
    }
  }, [uploadLocalToSupabase]);

  const clearAllData = useCallback(async () => {
    setEggSales([]);
    setPhysicalSales([]);
    setCashSales([]);
    localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify([]));
    localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify([]));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('egg_sales').delete().neq('id', '___none___');
        await supabase.from('physical_sales').delete().neq('id', '___none___');
        await supabase.from('cash_sales').delete().neq('id', '___none___');
      } catch (e) {
        console.error('Supabase clear error:', e);
      }
    }
  }, []);

  const importFromJson = useCallback((jsonData: any) => {
    if (jsonData.eggSales && Array.isArray(jsonData.eggSales)) {
      setEggSales(jsonData.eggSales);
      localStorage.setItem(LOCAL_STORAGE_EGG_SALES, JSON.stringify(jsonData.eggSales));
    }
    if (jsonData.physicalSales && Array.isArray(jsonData.physicalSales)) {
      setPhysicalSales(jsonData.physicalSales);
      localStorage.setItem(LOCAL_STORAGE_PHYSICAL_SALES, JSON.stringify(jsonData.physicalSales));
    }
    if (jsonData.config) {
      setConfig(jsonData.config);
      localStorage.setItem(LOCAL_STORAGE_CONFIG, JSON.stringify(jsonData.config));
    }
    if (jsonData.cashItems && Array.isArray(jsonData.cashItems)) {
      setCashItems(jsonData.cashItems);
      localStorage.setItem(LOCAL_STORAGE_CASH_ITEMS, JSON.stringify(jsonData.cashItems));
    }
    if (jsonData.cashSales && Array.isArray(jsonData.cashSales)) {
      setCashSales(jsonData.cashSales);
      localStorage.setItem(LOCAL_STORAGE_CASH_SALES, JSON.stringify(jsonData.cashSales));
    }
    if (jsonData.cashConfig) {
      setCashConfig(jsonData.cashConfig);
      localStorage.setItem(LOCAL_STORAGE_CASH_CONFIG, JSON.stringify(jsonData.cashConfig));
    }
  }, []);

  const triggerExportExcel = useCallback(() => {
    const rocSales = eggSales.filter((s) => s.server === 'ROC');
    const roSales = eggSales.filter((s) => s.server === 'RO');
    exportToExcel(
      summary,
      rocSales,
      roSales,
      physicalSales,
      cashSummary,
      cashItems,
      cashSales,
      combinedCashFlow
    );
  }, [summary, eggSales, physicalSales, cashSummary, cashItems, cashSales, combinedCashFlow]);

  const triggerExportBackup = useCallback(() => {
    exportToJsonBackup({
      eggSales,
      physicalSales,
      cashItems,
      cashSales,
      config,
      cashConfig,
      exportedAt: new Date().toISOString(),
    });
  }, [eggSales, physicalSales, cashItems, cashSales, config, cashConfig]);

  return (
    <AppContext.Provider
      value={{
        // Urgent Call
        eggSales,
        physicalSales,
        config,
        summary,
        activeServerTab,
        setActiveServerTab,

        // Cash Items & Portfolio
        cashItems,
        cashSales,
        cashConfig,
        cashSummary,
        combinedCashFlow,

        // Supabase & App
        supabaseConfig,
        isSupabaseConnected,
        missingTables,
        isLoading,

        // Urgent Call Actions
        addEggSale,
        updateEggSale,
        deleteEggSale,
        toggleEggSaleStatus,
        addPhysicalSale,
        updatePhysicalSale,
        deletePhysicalSale,
        togglePhysicalSaleStatus,

        // Cash Item Actions
        addCashItem,
        updateCashItem,
        deleteCashItem,
        adjustCashItemStock,
        addCashSale,
        updateCashSale,
        deleteCashSale,
        toggleCashSaleStatus,

        // Settings & Utilities
        syncFromPromotionSheet,
        syncFromSalesLedgerPdf,
        uploadLocalToSupabase,
        testConnection,
        updateConfig,
        updateCashConfig,
        updateSupabaseConfig,
        resetToSampleData,
        clearAllData,
        importFromJson,
        triggerExportExcel,
        triggerExportBackup,
        triggerConfettiEffect,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
