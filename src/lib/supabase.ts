import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  enabled: boolean;
}

export const DEFAULT_SUPABASE_URL = 'https://udvcayrzbrhatmhzpqiz.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Lk3_yjUrRqEMjU3eOhA9AQ_e3GdraGA';

const STORAGE_KEY_CONFIG = 'roc_supabase_config';

/**
 * อ่านค่าการตั้งค่า Supabase โดยให้ความสำคัญกับ process.env (ทั้งในเครื่อง .env.local และบน Vercel)
 * หากไม่มีหรือเปิดบนเครื่องเพื่อน จะมี default URL และ Anon Key ของโปรเจกต์รองรับเสมอ
 * ทำให้ทุกคนที่เปิดลิงก์ Vercel เชื่อมต่อฐานข้อมูล Supabase เดียวกันได้ทันทีแบบ Realtime
 */
export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const envKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  let url = envUrl;
  let anonKey = envKey;

  // 1. ถ้าไม่มีใน process.env หรือเป็น placeholder ให้ใช้ default ของโปรเจกต์
  if (!url || url.includes('your-project')) {
    url = DEFAULT_SUPABASE_URL;
  }
  if (!anonKey || anonKey.includes('your-anon-key')) {
    anonKey = DEFAULT_SUPABASE_ANON_KEY;
  }

  // 2. ฝั่ง Client: ถ้าผู้ใช้เคยตั้งค่า custom ไว้ใน localStorage
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.url && parsed.anonKey && !parsed.url.includes('your-project')) {
          url = parsed.url.trim();
          anonKey = parsed.anonKey.trim();
        }
      }
    } catch (e) {
      console.error('Failed to read stored supabase config from localStorage', e);
    }
  }

  return {
    url: url.trim(),
    anonKey: anonKey.trim(),
    enabled: true, // ปิดการใช้งาน LocalStorage Mode และเปิด Supabase Realtime เป็นโหมดหลักถาวร
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  // ล้างแคชไคลเอนต์เพื่อให้สร้าง connection ใหม่ด้วยการตั้งค่าล่าสุด
  cachedClient = null;
  cachedConfigHash = '';
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigHash = '';

/**
 * สร้างหรือดึง Supabase Client ตัวเดิม (Singleton)
 * พร้อมตั้งค่า Realtime เพื่อรองรับการอัปเดตแบบเรียลไทม์ข้ามเครื่อง/แท็บ
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.enabled || !config.url || !config.anonKey) {
    return null;
  }

  const configHash = `${config.url}::${config.anonKey}`;
  if (cachedClient && cachedConfigHash === configHash) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedConfigHash = configHash;
    return cachedClient;
  } catch (err) {
    console.error('Error initializing Supabase client:', err);
    return null;
  }
}

/**
 * ทดสอบการเชื่อมต่อกับ Supabase และตรวจสอบว่าตารางพร้อมใช้งานหรือไม่
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  missingTables?: string[];
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      message: 'ยังไม่ได้ระบุ Supabase URL หรือ Anon Key ใน .env.local',
    };
  }

  try {
    const requiredTables = ['egg_sales', 'physical_sales', 'cash_items', 'cash_sales'];
    const missingTables: string[] = [];

    for (const table of requiredTables) {
      const { error } = await supabase.from(table).select('id', { count: 'exact', head: true });
      if (error) {
        if (error.code === '42P01') {
          // Table does not exist
          missingTables.push(table);
        } else {
          console.warn(`Supabase check table ${table} warning:`, error.message);
        }
      }
    }

    if (missingTables.length > 0) {
      return {
        connected: false,
        message: `เชื่อมต่อสำเร็จ แต่ยังไม่พบตาราง: ${missingTables.join(', ')} กรุณารันไฟล์ supabase_schema.sql ใน Supabase SQL Editor`,
        missingTables,
      };
    }

    return {
      connected: true,
      message: 'เชื่อมต่อฐานข้อมูล Supabase และพบตารางครบถ้วน พร้อมใช้งาน Realtime!',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `ไม่สามารถเชื่อมต่อได้: ${err.message || err}`,
    };
  }
}

export const SUPABASE_SQL_SCHEMA = `-- ====================================================================
-- RAGNAROK PORTFOLIO MANAGER - SUPABASE DATABASE DDL SCHEMA
-- นำโค้ดนี้ไปวางและกด Run ใน Supabase SQL Editor
-- ====================================================================

-- 1. ตารางบันทึกการขายไข่สุ่ม (egg_sales)
CREATE TABLE IF NOT EXISTS public.egg_sales (
  id TEXT PRIMARY KEY,
  server TEXT NOT NULL,                     -- 'ROC' หรือ 'RO'
  code_id INTEGER NOT NULL,                 -- รหัสโค้ด 1 - 9
  customer_name TEXT NOT NULL,              -- ชื่อลูกค้า
  quantity NUMERIC NOT NULL DEFAULT 0,      -- จำนวนไข่ที่ซื้อ
  price_per_egg NUMERIC NOT NULL DEFAULT 0, -- ราคาต่อฟอง (THB)
  total_amount NUMERIC NOT NULL DEFAULT 0,  -- ยอดรวม (THB)
  status TEXT NOT NULL DEFAULT 'Pending',   -- 'Clear' หรือ 'Pending'
  date TEXT NOT NULL,                       -- วันที่ขาย (ISO String)
  note TEXT,                                -- หมายเหตุ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตารางบันทึกการขายสินค้า Physical Figures & Keycaps (physical_sales)
CREATE TABLE IF NOT EXISTS public.physical_sales (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,                   -- 'FIGURE' หรือ 'KEYCAP'
  item_name TEXT NOT NULL,                  -- ชื่อสินค้า
  customer_name TEXT NOT NULL,              -- ชื่อลูกค้า
  quantity NUMERIC NOT NULL DEFAULT 1,      -- จำนวน (กล่อง/ชิ้น)
  unit_price NUMERIC NOT NULL DEFAULT 0,    -- ราคาต่อหน่วย (THB)
  total_amount NUMERIC NOT NULL DEFAULT 0,  -- ยอดรวม (THB)
  status TEXT NOT NULL DEFAULT 'Pending',   -- 'Clear' หรือ 'Pending'
  channel TEXT,                             -- ช่องทางการขาย
  date TEXT NOT NULL,                       -- วันที่ขาย
  note TEXT,                                -- หมายเหตุ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตารางสต็อกสินค้า Cash Items & Promotion Freebies (cash_items)
CREATE TABLE IF NOT EXISTS public.cash_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                          -- ชื่อสินค้า
  category TEXT NOT NULL,                      -- 'PROMO_FREEBIE' หรือ 'POINT_PURCHASED'
  server TEXT NOT NULL,                        -- 'Baphomet', 'Moonlight', etc.
  total_qty NUMERIC DEFAULT 0,                 -- จำนวนทั้งหมด (PC)
  sold_qty NUMERIC DEFAULT 0,                  -- จำนวนที่ขายไปแล้ว
  stock_qty NUMERIC NOT NULL DEFAULT 0,        -- จำนวนคงเหลือ (Remain)
  total_sale NUMERIC DEFAULT 0,                -- ยอดเงินที่ขายได้แล้ว (THB)
  target_price_per_unit NUMERIC NOT NULL DEFAULT 0, -- ราคาประเมิน/คาดการณ์ต่อชิ้น (THB)
  remain_sale NUMERIC DEFAULT 0,               -- มูลค่าคงเหลือ (THB)
  note TEXT,                                   -- หมายเหตุ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ตารางบันทึกยอดขายสินค้า Cash Items (cash_sales - Sales Ledger 60 รายการ)
CREATE TABLE IF NOT EXISTS public.cash_sales (
  id TEXT PRIMARY KEY,
  cash_item_id TEXT,                        -- รหัสอ้างอิงสินค้าใน cash_items (ถ้ามี)
  item_name TEXT NOT NULL,                  -- ชื่อสินค้าที่ขาย
  category TEXT NOT NULL,                   -- 'PROMO_FREEBIE', 'POINT_PURCHASED', etc.
  customer_name TEXT NOT NULL,              -- ชื่อผู้ซื้อ
  quantity NUMERIC NOT NULL DEFAULT 1,      -- จำนวนที่ขาย
  unit_price NUMERIC NOT NULL DEFAULT 0,    -- ราคาขายต่อหน่วย (THB)
  total_amount NUMERIC NOT NULL DEFAULT 0,  -- ยอดเงินรวม (THB)
  server TEXT NOT NULL,                     -- 'Baphomet', 'Moonlight', etc.
  status TEXT NOT NULL DEFAULT 'Clear',     -- 'Clear' หรือ 'Pending'
  date TEXT NOT NULL,                       -- วันที่และเวลาขาย
  note TEXT,                                -- หมายเหตุ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ตารางตั้งค่าพอร์ตและเงินลงทุน (app_configs)
CREATE TABLE IF NOT EXISTS public.app_configs (
  key TEXT PRIMARY KEY,                     -- 'urgent_call_config' หรือ 'cash_portfolio_config'
  value JSONB NOT NULL,                     -- ค่าคอนฟิกในรูปแบบ JSON
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ตั้งค่า ROW LEVEL SECURITY (RLS) เพื่ออนุญาตให้ใช้งานแบบ Public/Anon
-- ====================================================================
ALTER TABLE public.egg_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physical_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configs ENABLE ROW LEVEL SECURITY;

-- นโยบาย RLS สำหรับ anon / public (อ่าน เขียน อัปเดต ลบ ได้อิสระ)
DROP POLICY IF EXISTS "Allow anon all on egg_sales" ON public.egg_sales;
CREATE POLICY "Allow anon all on egg_sales" ON public.egg_sales FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on physical_sales" ON public.physical_sales;
CREATE POLICY "Allow anon all on physical_sales" ON public.physical_sales FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on cash_items" ON public.cash_items;
CREATE POLICY "Allow anon all on cash_items" ON public.cash_items FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on cash_sales" ON public.cash_sales;
CREATE POLICY "Allow anon all on cash_sales" ON public.cash_sales FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all on app_configs" ON public.app_configs;
CREATE POLICY "Allow anon all on app_configs" ON public.app_configs FOR ALL TO public USING (true) WITH CHECK (true);

-- ====================================================================
-- เปิด REPLICA IDENTITY FULL (จำเป็นสำหรับการส่งข้อมูล UPDATE/DELETE Realtime)
-- ====================================================================
ALTER TABLE public.egg_sales REPLICA IDENTITY FULL;
ALTER TABLE public.physical_sales REPLICA IDENTITY FULL;
ALTER TABLE public.cash_items REPLICA IDENTITY FULL;
ALTER TABLE public.cash_sales REPLICA IDENTITY FULL;
ALTER TABLE public.app_configs REPLICA IDENTITY FULL;

-- ====================================================================
-- เปิด REALTIME REPLICATION สำหรับทุกตาราง
-- ====================================================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.egg_sales;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.physical_sales;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_items;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.cash_sales;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.app_configs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
`;
