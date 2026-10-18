export type ServerType = 'ROC' | 'RO';

export type PaymentStatus = 'Clear' | 'Pending';

export type PhysicalCategory = 'Figure' | 'KeycapBox' | 'KeycapPiece';

export interface EggSale {
  id: string;
  server: ServerType;
  codeId: number; // 1 to 9
  customerName: string;
  quantity: number;
  pricePerEgg: number;
  totalAmount: number;
  status: PaymentStatus;
  date: string;
  note?: string;
  createdAt: string;
}

export interface PhysicalSale {
  id: string;
  category: PhysicalCategory;
  itemName: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: PaymentStatus;
  channel?: string;
  date: string;
  note?: string;
  createdAt: string;
}

export interface AppCostConfig {
  figureCostTotal: number; // 21,000
  figureBoxCount: number; // 5
  keycapCostTotal: number; // 24,000
  keycapBoxCount: number; // 8
  keycapPiecesPerBox: number; // 8 (total 64)
  totalInitialCost: number; // 45,000
  codesCount: number; // 9
  eggsPerCode: number; // 140
}

export interface CodeSummary {
  codeId: number;
  server: ServerType;
  totalQuota: number;
  soldCount: number;
  remainingCount: number;
  clearedRevenue: number;
  pendingRevenue: number;
  totalRevenue: number;
  salesCount: number;
}

export interface DashboardSummary {
  totalCost: number;
  totalRevenue: number;
  clearedRevenue: number;
  pendingRevenue: number;
  netProfit: number;
  roiPercentage: number;
  isBreakeven: number; // 0 to 100+ percent
  remainingToBreakeven: number;
  
  // Stock
  figureTotal: number;
  figureSold: number;
  figureRemaining: number;

  keycapTotalBoxes: number;
  keycapSoldBoxesEquivalent: number;
  keycapSoldBoxes: number;
  keycapSoldPieces: number;
  keycapRemainingBoxes: number;

  rocEggsTotal: number;
  rocEggsSold: number;
  rocEggsRemaining: number;

  roEggsTotal: number;
  roEggsSold: number;
  roEggsRemaining: number;
}

// ============================================
// Types for Cash Items & Point Stock Module
// ============================================

export type CashItemCategory = 'PROMO_FREEBIE' | 'POINT_PURCHASED' | 'DIRECT_POINT' | 'CASH_POINT';

export interface CashItem {
  id: string;
  name: string;
  category: 'PROMO_FREEBIE' | 'POINT_PURCHASED';
  server: string; // e.g. 'Baphomet', 'Moonlight', etc.
  totalQty?: number; // จำนวนทั้งหมด (PC)
  soldQty?: number; // ขายไปแล้ว
  stockQty: number; // คงเหลือ (Remain)
  totalSale?: number; // Total Sale (ยอดขายที่ขายได้แล้ว THB)
  targetPricePerUnit: number; // Forecast price (ราคาประเมินต่อชิ้น THB)
  remainSale?: number; // Remain Sale (มูลค่าคงเหลือ THB = stockQty * targetPricePerUnit)
  note?: string;
  createdAt: string;
}

export interface CashSale {
  id: string;
  cashItemId?: string; // Optional link to CashItem
  itemName: string;
  category: CashItemCategory;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  server: string;
  status: PaymentStatus;
  date: string;
  note?: string;
  createdAt: string;
}

export interface CashPortfolioConfig {
  initialInvestment: number; // 54,000 THB
  initialCashSales: number; // 51,570.10 THB
  remainingPoints: number; // 88,650 Points
  pointExchangeRate: number; // 0.065 THB / Point
  loanToUrgentCall: number; // 45,000 THB
}

export interface CashPortfolioSummary {
  initialInvestment: number; // 54,000
  historicalSales: number; // 51,570.10
  newSalesTotal: number;
  totalCashSales: number; // 51,570.10 + new sales
  clearedCashSales: number; // Cleared only
  pendingCashSales: number; // Pending only
  remainingPoints: number; // 88,650
  pointExchangeRate: number; // 0.065
  pointValueThb: number; // 88,650 * 0.065 = 5,762.25 THB
  totalInventoryValue: number; // Remain Sale total (13,420.00 THB)
  promoInventoryValue: number;
  pointPurchasedInventoryValue: number;
  breakevenPercent: number; // (totalCashSales / initialInvestment) * 100
  remainingToBreakeven: number;
  isBreakeven: boolean;
  netCashProfit: number;
  totalAssetsValue: number; // Cash + Points + Stock
}

export interface CombinedCashFlowSummary {
  loanToUrgentCall: number; // 45,000 THB
  urgentCallTotalRevenue: number;
  urgentCallClearedRevenue: number;
  urgentCallPendingRevenue: number;
  urgentCallRepaidToPool: number;
  urgentCallRepaidPercent: number;
  urgentCallRemainingToRepay: number;
  urgentCallIsRepaid: boolean;

  // New Project: GOC & Libra Promo (14.25k) - Oct 18, 2026
  loanToGocLibra: number; // 14,250 THB
  gocLibraTotalRevenue: number;
  gocLibraClearedRevenue: number;
  gocLibraPendingRevenue: number;
  gocLibraRepaidToPool: number;
  gocLibraRepaidPercent: number;
  gocLibraRemainingToRepay: number;
  gocLibraIsRepaid: boolean;
  
  cashItemClearedSales: number;
  cashItemPendingSales: number;
  
  // Real Net Cash in Bank Account:
  // (Cash item cleared sales - 45,000 loan - 14,250 loan) + Urgent call cleared sales + GOC Libra cleared sales
  physicalCashInHand: number;
  
  totalPendingReceivables: number;
  totalCombinedInvested: number; // 54,000
  totalCombinedNetProfit: number;
  totalCombinedAssets: number;
}

// ====================================================
// Types for GOC & Libra Promo (14.25k) - promo_oct_14k
// ====================================================

export type GocLibraCategory = 'SILVERVINE' | 'LIBRA_SCROLL' | 'PROMO_GOODIE';

export interface GocLibraItem {
  id: string;
  projectId: 'promo_oct_14k';
  name: string;
  category: GocLibraCategory;
  server: string; // e.g., 'RO / ROC', 'Baphomet', 'Real Item'
  totalQty: number;
  soldQty: number;
  stockQty: number;
  pointsUsed?: number; // e.g., 105,000 for Silvervine, 45,000 for Libra
  avgCostPerUnit: number; // e.g., 135.71 for Silvervine, 42.75 for Libra, 0 for freebies
  targetPricePerUnit: number; // Forecast price per unit (THB)
  unitLabel: string; // 'กล่อง', 'ฟอง', 'เซ็ต', 'ใบ', 'ชิ้น'
  note?: string;
  createdAt: string;
}

export interface GocLibraSale {
  id: string;
  projectId: 'promo_oct_14k';
  itemId: string;
  itemName: string;
  category: GocLibraCategory;
  customerName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  server: string;
  status: PaymentStatus;
  date: string;
  note?: string;
  createdAt: string;
}

export interface GocLibraConfig {
  projectId: 'promo_oct_14k';
  initialCapital: number; // 14,250 THB
  totalPoints: number; // 150,000 Points
  costPerPoint: number; // 0.095 THB / Point
  silvervinePointsUsed: number; // 105,000 Points
  libraPointsUsed: number; // 45,000 Points
}

export interface GocLibraSummary {
  totalCost: number; // 14,250 THB
  totalPoints: number; // 150,000
  costPerPoint: number; // 0.095
  totalRevenue: number;
  clearedRevenue: number;
  pendingRevenue: number;
  netProfit: number; // totalRevenue - 14,250
  clearedNetProfit: number; // clearedRevenue - 14,250
  roiPercentage: number;
  breakevenPercent: number; // (clearedRevenue / 14250) * 100
  totalBreakevenPercent: number; // (totalRevenue / 14250) * 100
  remainingToBreakeven: number;
  isBreakeven: boolean;

  // Inventory metrics
  silvervineTotal: number;
  silvervineSold: number;
  silvervineRemaining: number;
  silvervineRevenue: number;

  libraTotal: number;
  libraSold: number;
  libraRemaining: number;
  libraRevenue: number;

  goodiesTotalCount: number;
  goodiesRemainingCount: number;
  goodiesRevenue: number;
  estimatedRemainingStockValue: number;
}

