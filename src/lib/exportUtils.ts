import * as XLSX from 'xlsx';
import {
  EggSale,
  PhysicalSale,
  DashboardSummary,
  CashItem,
  CashSale,
  CashPortfolioSummary,
  CombinedCashFlowSummary,
  CashPortfolioConfig,
} from '@/types';

export function exportToExcel(
  summary: DashboardSummary,
  rocSales: EggSale[],
  roSales: EggSale[],
  physicalSales: PhysicalSale[],
  cashSummary?: CashPortfolioSummary,
  cashItems?: CashItem[],
  cashSales?: CashSale[],
  combinedFlow?: CombinedCashFlowSummary
) {
  const wb = XLSX.utils.book_new();

  // 1. Combined Cash Flow & Fund Summary
  if (combinedFlow && cashSummary) {
    const cashFlowData = [
      ['ระบบบริหารกระแสเงินสด & กระเป๋าเงินรวม (Cross-Project Cash Flow)', ''],
      ['วันที่ออกรายงาน', new Date().toLocaleString('th-TH')],
      ['', ''],
      ['รายการกระแสเงินสดในบัญชีธนาคาร', 'จำนวนเงิน (บาท)'],
      ['เงินลงทุนเริ่มต้นพอร์ตเติมเงินเดิม (Initial Capital)', cashSummary.initialInvestment],
      ['ยอดขายสดสะสม Cash Item ทั้งหมด (Cleared Sales)', cashSummary.clearedCashSales],
      ['เงินสดที่โอนยืมไปซื้อไข่ Urgent Call (-45,000 THB)', -combinedFlow.loanToUrgentCall],
      ['ยอดขายสดที่ได้รับคืนจากโปรเจกต์ไข่ Urgent Call', combinedFlow.urgentCallClearedRevenue],
      ['----------------------------------------', '------------------'],
      ['⭐ เงินสดจริงคงเหลือในบัญชีธนาคาร (Net Cash in Hand)', combinedFlow.physicalCashInHand],
      ['', ''],
      ['สถานะการคืนทุนเข้ากองกลาง (Urgent Call -> Main Pool)', ''],
      ['เงินทุนที่โอนยืมไป', combinedFlow.loanToUrgentCall],
      ['คืนทุนกลับเข้ากองกลางแล้ว', `${combinedFlow.urgentCallClearedRevenue} บาท (${combinedFlow.urgentCallRepaidPercent.toFixed(1)}%)`],
      ['คงเหลือที่ต้องคืนเข้าบัญชีกองกลาง', `${combinedFlow.urgentCallRemainingToRepay} บาท`],
      ['สถานะการคืนทุน', combinedFlow.urgentCallIsRepaid ? 'คืนทุนครบ 45k แล้ว!' : 'กำลังทยอยคืนทุน'],
      ['', ''],
      ['มูลค่าทรัพย์สินและสต็อกรวมทั้งหมด (Combined Total Assets)', ''],
      ['เงินสดจริงในบัญชี', combinedFlow.physicalCashInHand],
      ['มูลค่าพอยท์คงเหลือ (88,650 pts @ 0.065)', cashSummary.pointValueThb],
      ['มูลค่าสต็อก Cash Items คงเหลือ', cashSummary.totalInventoryValue],
      ['ยอดลูกหนี้รอชำระ (Pending Receivables รวม 2 โปรเจกต์)', combinedFlow.totalPendingReceivables],
    ];
    const wsCashFlow = XLSX.utils.aoa_to_sheet(cashFlowData);
    XLSX.utils.book_append_sheet(wb, wsCashFlow, 'กระเป๋าเงินรวม & Cash Flow');
  }

  // 2. Urgent Call Summary Sheet
  const summaryData = [
    ['สรุปภาพรวมรายรับ-รายจ่าย & สต็อก Ragnarok Urgent Call Pre-Order', ''],
    ['วันที่ออกรายงาน', new Date().toLocaleString('th-TH')],
    ['', ''],
    ['รายการการเงิน', 'มูลค่า (บาท)'],
    ['เงินลงทุนทั้งหมด (Total Cost)', summary.totalCost],
    ['รายรับทั้งหมด (Total Revenue)', summary.totalRevenue],
    ['ยอดชำระแล้ว (Clear Revenue)', summary.clearedRevenue],
    ['ยอดค้างชำระ (Pending Revenue)', summary.pendingRevenue],
    ['กำไร / ขาดทุนสุทธิ (Net Profit)', summary.netProfit],
    ['ผลตอบแทนจากการลงทุน (ROI %)', `${summary.roiPercentage.toFixed(2)}%`],
    ['สถานะการคืนทุน (Breakeven)', summary.isBreakeven >= 100 ? 'คืนทุนและกำไรแล้ว' : `ขาดอีก ${summary.remainingToBreakeven.toLocaleString()} บาท`],
    ['', ''],
    ['สถานะสต็อกสินค้า', 'ยอดคงเหลือ'],
    ['Alberta Figure', `${summary.figureRemaining} / ${summary.figureTotal} กล่อง (ขายแล้ว ${summary.figureSold})`],
    ['MVP Keycap', `${summary.keycapRemainingBoxes} / ${summary.keycapTotalBoxes} กล่อง (ขายแล้ว ${summary.keycapSoldBoxes} กล่อง, ${summary.keycapSoldPieces} ชิ้น)`],
    ['ไข่สุ่ม Ragnarok Classic (ROC)', `${summary.rocEggsRemaining} / ${summary.rocEggsTotal} ฟอง (ขายแล้ว ${summary.rocEggsSold})`],
    ['ไข่สุ่ม Ragnarok Online (RO)', `${summary.roEggsRemaining} / ${summary.roEggsTotal} ฟอง (ขายแล้ว ${summary.roEggsSold})`],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Urgent Call สรุป');

  // 3. ROC Sales Sheet
  const rocHeaders = [
    'วันที่-เวลา',
    'เซิร์ฟเวอร์',
    'รหัสโค้ด',
    'ชื่อลูกค้า',
    'จำนวนฟอง (Qty)',
    'ราคาต่อฟอง (บาท)',
    'ยอดเงินรวม (บาท)',
    'สถานะชำระเงิน',
    'หมายเหตุ',
  ];
  const rocRows = rocSales.map((s) => [
    s.date ? new Date(s.date).toLocaleString('th-TH') : '',
    s.server,
    `Code ${s.codeId}`,
    s.customerName,
    s.quantity,
    s.pricePerEgg,
    s.totalAmount,
    s.status,
    s.note || '',
  ]);
  const wsROC = XLSX.utils.aoa_to_sheet([rocHeaders, ...rocRows]);
  XLSX.utils.book_append_sheet(wb, wsROC, 'ไข่สุ่ม ROC');

  // 4. RO Sales Sheet
  const roRows = roSales.map((s) => [
    s.date ? new Date(s.date).toLocaleString('th-TH') : '',
    s.server,
    `Code ${s.codeId}`,
    s.customerName,
    s.quantity,
    s.pricePerEgg,
    s.totalAmount,
    s.status,
    s.note || '',
  ]);
  const wsRO = XLSX.utils.aoa_to_sheet([rocHeaders, ...roRows]);
  XLSX.utils.book_append_sheet(wb, wsRO, 'ไข่สุ่ม RO');

  // 5. Physical Sales Sheet
  const physHeaders = [
    'วันที่-เวลา',
    'หมวดหมู่',
    'รายการสินค้า',
    'ชื่อลูกค้า',
    'จำนวน',
    'ราคาต่อหน่วย (บาท)',
    'ยอดเงินรวม (บาท)',
    'สถานะชำระเงิน',
    'ช่องทางการขาย',
    'หมายเหตุ',
  ];
  const physRows = physicalSales.map((s) => [
    s.date ? new Date(s.date).toLocaleString('th-TH') : '',
    s.category === 'Figure' ? 'Alberta Figure' : s.category === 'KeycapBox' ? 'MVP Keycap (กล่อง)' : 'MVP Keycap (ชิ้น)',
    s.itemName,
    s.customerName,
    s.quantity,
    s.unitPrice,
    s.totalAmount,
    s.status,
    s.channel || '',
    s.note || '',
  ]);
  const wsPhys = XLSX.utils.aoa_to_sheet([physHeaders, ...physRows]);
  XLSX.utils.book_append_sheet(wb, wsPhys, 'สินค้า Figure & Keycap');

  // 6. Cash Items Stock Sheet
  if (cashItems && cashItems.length > 0) {
    const itemHeaders = [
      'ชื่อไอเทม',
      'หมวดหมู่',
      'เซิร์ฟเวอร์',
      'จำนวนคงเหลือ',
      'ราคาประเมิน/ชิ้น (บาท)',
      'มูลค่ารวมคงเหลือ (บาท)',
      'หมายเหตุ',
    ];
    const itemRows = cashItems.map((i) => [
      i.name,
      i.category === 'PROMO_FREEBIE' ? 'ของแถมโปรโมชั่น' : 'ซื้อด้วยพอยท์',
      i.server,
      i.stockQty,
      i.targetPricePerUnit,
      i.stockQty * i.targetPricePerUnit,
      i.note || '',
    ]);
    const wsItems = XLSX.utils.aoa_to_sheet([itemHeaders, ...itemRows]);
    XLSX.utils.book_append_sheet(wb, wsItems, 'สต็อก Cash Items คงเหลือ');
  }

  // 7. Cash Sales Sheet
  if (cashSales && cashSales.length > 0) {
    const csHeaders = [
      'วันที่-เวลา',
      'รายการไอเทม',
      'หมวดหมู่',
      'เซิร์ฟเวอร์',
      'ชื่อลูกค้า',
      'จำนวน',
      'ราคาต่อหน่วย (บาท)',
      'ยอดเงินรวม (บาท)',
      'สถานะชำระเงิน',
      'หมายเหตุ',
    ];
    const csRows = cashSales.map((s) => [
      s.date ? new Date(s.date).toLocaleString('th-TH') : '',
      s.itemName,
      s.category === 'PROMO_FREEBIE'
        ? 'ของแถมโปรโมชั่น'
        : s.category === 'POINT_PURCHASED'
        ? 'ซื้อด้วยพอยท์'
        : s.category === 'CASH_POINT'
        ? 'ขายพอยท์ตรง'
        : 'พอยท์สด',
      s.server,
      s.customerName,
      s.quantity,
      s.unitPrice,
      s.totalAmount,
      s.status,
      s.note || '',
    ]);
    const wsCS = XLSX.utils.aoa_to_sheet([csHeaders, ...csRows]);
    XLSX.utils.book_append_sheet(wb, wsCS, 'ประวัติการขาย Cash Items');
  }

  // Trigger file download
  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `RO_PreOrder_CashFlow_Report_${dateStr}.xlsx`);
}

export function exportToJsonBackup(data: {
  eggSales: EggSale[];
  physicalSales: PhysicalSale[];
  cashItems?: CashItem[];
  cashSales?: CashSale[];
  config?: any;
  cashConfig?: any;
  exportedAt: string;
}) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RO_Tracker_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
