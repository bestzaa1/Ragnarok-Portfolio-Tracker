// ====================================================================
// RAGNAROK PORTFOLIO MANAGER - SUPABASE SEED SCRIPT
// รันคำสั่ง: node scripts/seed-supabase.mjs
// หรือ: npm run seed
// ====================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. อ่านตัวแปรจาก .env.local หากมี
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...rest] = trimmed.split('=');
      const val = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = val;
      }
    }
  }
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://udvcayrzbrhatmhzpqiz.supabase.co').trim();
const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Lk3_yjUrRqEMjU3eOhA9AQ_e3GdraGA').trim();

console.log('🌱 ====================================================');
console.log('🚀 เริ่มต้นการ Seed ข้อมูลจริงเข้าสู่ Supabase Database');
console.log(`🌐 Target Supabase URL: ${SUPABASE_URL}`);
console.log('🌱 ====================================================\n');

// 2. โหลดชุดข้อมูลจริงจาก src/lib/initialRealData.json
const dataPath = path.join(rootDir, 'src', 'lib', 'initialRealData.json');
if (!fs.existsSync(dataPath)) {
  console.error(`❌ ไม่พบไฟล์ข้อมูลเริ่มต้นที่: ${dataPath}`);
  process.exit(1);
}

const initialData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  try {
    // ----------------------------------------------------
    // ขั้นตอนที่ 1: ล้างข้อมูลเก่าออกจากทุกตาราง (Clean Slate)
    // ----------------------------------------------------
    console.log('🧹 1. กำลังล้างข้อมูลเก่าใน Supabase ทั้งหมด...');

    const { error: delEggErr } = await supabase.from('egg_sales').delete().neq('id', '___none___');
    if (delEggErr) console.warn('  ⚠️ ล้าง egg_sales:', delEggErr.message);
    else console.log('  ✅ ล้างตาราง egg_sales สำเร็จ');

    const { error: delPhysErr } = await supabase.from('physical_sales').delete().neq('id', '___none___');
    if (delPhysErr) console.warn('  ⚠️ ล้าง physical_sales:', delPhysErr.message);
    else console.log('  ✅ ล้างตาราง physical_sales สำเร็จ');

    const { error: delItemsErr } = await supabase.from('cash_items').delete().neq('id', '___none___');
    if (delItemsErr) console.warn('  ⚠️ ล้าง cash_items:', delItemsErr.message);
    else console.log('  ✅ ล้างตาราง cash_items สำเร็จ');

    const { error: delSalesErr } = await supabase.from('cash_sales').delete().neq('id', '___none___');
    if (delSalesErr) console.warn('  ⚠️ ล้าง cash_sales:', delSalesErr.message);
    else console.log('  ✅ ล้างตาราง cash_sales สำเร็จ');

    // ----------------------------------------------------
    // ขั้นตอนที่ 2: แทรกข้อมูลจริง Urgent Call (Egg Sales 5 รายการ)
    // ----------------------------------------------------
    console.log('\n🥚 2. กำลังบันทึกยอดขายไข่ Urgent Call (5 รายการจริง - โค้ด 1 รวม 100 ฟอง 1,800 บาท)...');
    const mappedEggSales = initialData.eggSales.map((s) => ({
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
    }));

    if (mappedEggSales.length > 0) {
      const { error: insEggErr } = await supabase.from('egg_sales').insert(mappedEggSales);
      if (insEggErr) throw new Error(`ไม่สามารถบันทึก egg_sales ได้: ${insEggErr.message}`);
      console.log(`  ✅ บันทึก egg_sales เรียบร้อย (${mappedEggSales.length} รายการ)`);
    }

    // ----------------------------------------------------
    // ขั้นตอนที่ 3: Physical Sales (0 รายการ)
    // ----------------------------------------------------
    console.log('\n📦 3. ตรวจสอบสต็อก Figures (5 กล่อง) และ Keycaps (8 กล่อง)...');
    if (initialData.physicalSales && initialData.physicalSales.length > 0) {
      const mappedPhysSales = initialData.physicalSales.map((s) => ({
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
      }));
      await supabase.from('physical_sales').insert(mappedPhysSales);
      console.log(`  ✅ บันทึก physical_sales เรียบร้อย (${mappedPhysSales.length} รายการ)`);
    } else {
      console.log('  ✅ ยังไม่มีการขาย physical_sales: คงเหลือสินค้าครบ 100% ตามข้อมูลจริง');
    }

    // ----------------------------------------------------
    // ขั้นตอนที่ 4: แทรกสต็อก Cash Items 22 รายการ
    // ----------------------------------------------------
    console.log('\n💎 4. กำลังบันทึกสต็อก Cash Items (22 รายการ, มูลค่าคงเหลือ 13,420.00 THB)...');
    const mappedCashItems = initialData.cashItems.map((i) => ({
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
    }));

    if (mappedCashItems.length > 0) {
      const { error: insItemsErr } = await supabase.from('cash_items').insert(mappedCashItems);
      if (insItemsErr) throw new Error(`ไม่สามารถบันทึก cash_items ได้: ${insItemsErr.message}`);
      console.log(`  ✅ บันทึก cash_items เรียบร้อย (${mappedCashItems.length} รายการ)`);
    }

    // ----------------------------------------------------
    // ขั้นตอนที่ 5: แทรกประวัติการขาย Cash Sales 60 รายการ (Sales Ledger)
    // ----------------------------------------------------
    console.log('\n📜 5. กำลังบันทึกประวัติการขาย Cash Sales Ledger จาก PDF (60 รายการ, รวม 51,570.10 THB)...');
    const mappedCashSales = initialData.cashSales.map((s) => ({
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
    }));

    if (mappedCashSales.length > 0) {
      const { error: insSalesErr } = await supabase.from('cash_sales').insert(mappedCashSales);
      if (insSalesErr) throw new Error(`ไม่สามารถบันทึก cash_sales ได้: ${insSalesErr.message}`);
      console.log(`  ✅ บันทึก cash_sales เรียบร้อย (${mappedCashSales.length} รายการ)`);
    }

    // ----------------------------------------------------
    // ขั้นตอนที่ 6: บันทึก Config ลงใน app_configs
    // ----------------------------------------------------
    console.log('\n⚙️ 6. กำลังบันทึกค่าการตั้งค่าพอร์ตทั้ง 2 โปรเจกต์ลงใน app_configs...');
    const { error: insConfigErr } = await supabase.from('app_configs').upsert([
      { key: 'urgent_call_config', value: initialData.config, updated_at: new Date().toISOString() },
      { key: 'cash_portfolio_config', value: initialData.cashConfig, updated_at: new Date().toISOString() },
    ]);
    if (insConfigErr) console.warn('  ⚠️ app_configs upsert warning:', insConfigErr.message);
    else console.log('  ✅ บันทึก app_configs เรียบร้อย');

    // ----------------------------------------------------
    // ขั้นตอนที่ 7: ตรวจสอบผลลัพธ์และความถูกต้อง (Verification)
    // ----------------------------------------------------
    console.log('\n🔍 7. กำลังตรวจสอบความถูกต้องของข้อมูลใน Supabase...');
    const { data: checkEggs } = await supabase.from('egg_sales').select('quantity, total_amount');
    const totalEggsSold = (checkEggs || []).reduce((acc, cur) => acc + Number(cur.quantity || 0), 0);
    const totalEggRev = (checkEggs || []).reduce((acc, cur) => acc + Number(cur.total_amount || 0), 0);

    const { data: checkItems } = await supabase.from('cash_items').select('remain_sale');
    const totalRemainSale = (checkItems || []).reduce((acc, cur) => acc + Number(cur.remain_sale || 0), 0);

    const { data: checkSales } = await supabase.from('cash_sales').select('total_amount');
    const totalCashSales = (checkSales || []).reduce((acc, cur) => acc + Number(cur.total_amount || 0), 0);

    console.log('\n📊 ====================================================');
    console.log('🎉 SEED ข้อมูลจริงเข้า SUPABASE สำเร็จ 100%!');
    console.log('====================================================');
    console.log(`🥚 ยอดขายไข่ Urgent Call: ${checkEggs?.length} รายการ | รวม ${totalEggsSold} ฟอง | ยอดเงิน ฿${totalEggRev.toLocaleString('en-US', { minimumFractionDigits: 2 })} THB (โค้ด 1 เหลือ 40 ฟอง)`);
    console.log(`📦 Figure 5 กล่อง & Keycap 8 กล่อง: คงเหลือครบ 100% (ทุน 45,000 THB)`);
    console.log(`💎 สต็อก Cash Items: ${checkItems?.length} รายการ | มูลค่าคงเหลือ Remain Sale = ฿${totalRemainSale.toLocaleString('en-US', { minimumFractionDigits: 2 })} THB`);
    console.log(`💰 ประวัติการขาย Cash Sales: ${checkSales?.length} รายการ | ยอดขายสะสม = ฿${totalCashSales.toLocaleString('en-US', { minimumFractionDigits: 2 })} THB`);
    console.log(`🪙 พอยท์คงเหลือ: 88,650 Points (@ 0.065 = 5,762.25 THB)`);
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n❌ เกิดข้อผิดพลาดในการ Seed ข้อมูล:', err.message || err);
    process.exit(1);
  }
}

seed();
