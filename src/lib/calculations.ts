import {
  AppCostConfig,
  CodeSummary,
  DashboardSummary,
  EggSale,
  PhysicalSale,
  ServerType,
  CashItem,
  CashSale,
  CashPortfolioConfig,
  CashPortfolioSummary,
  CombinedCashFlowSummary,
  GocLibraItem,
  GocLibraSale,
  GocLibraConfig,
  GocLibraSummary,
} from '@/types';
import {
  DEFAULT_CONFIG,
  DEFAULT_CASH_PORTFOLIO_CONFIG,
  DEFAULT_GOC_LIBRA_CONFIG,
} from './constants';

export function calculateDashboardSummary(
  eggSales: EggSale[],
  physicalSales: PhysicalSale[],
  config: AppCostConfig = DEFAULT_CONFIG
): DashboardSummary {
  const eggRevenueTotal = eggSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const eggRevenueCleared = eggSales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const eggRevenuePending = eggSales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  const physRevenueTotal = physicalSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const physRevenueCleared = physicalSales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const physRevenuePending = physicalSales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  const totalRevenue = eggRevenueTotal + physRevenueTotal;
  const clearedRevenue = eggRevenueCleared + physRevenueCleared;
  const pendingRevenue = eggRevenuePending + physRevenuePending;
  const netProfit = totalRevenue - config.totalInitialCost;
  const roiPercentage = config.totalInitialCost > 0 ? (netProfit / config.totalInitialCost) * 100 : 0;
  const isBreakeven = config.totalInitialCost > 0 ? (totalRevenue / config.totalInitialCost) * 100 : 100;
  const remainingToBreakeven = Math.max(0, config.totalInitialCost - totalRevenue);

  // Figure stock
  const figureSold = physicalSales
    .filter((s) => s.category === 'Figure')
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const figureRemaining = Math.max(0, config.figureBoxCount - figureSold);

  // Keycap stock
  const keycapSoldBoxes = physicalSales
    .filter((s) => s.category === 'KeycapBox')
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const keycapSoldPieces = physicalSales
    .filter((s) => s.category === 'KeycapPiece')
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const keycapSoldBoxesEquivalent = keycapSoldBoxes + keycapSoldPieces / config.keycapPiecesPerBox;
  const keycapRemainingBoxes = Math.max(0, config.keycapBoxCount - Math.ceil(keycapSoldBoxesEquivalent));

  // Egg stock
  const rocEggsTotal = config.codesCount * config.eggsPerCode;
  const rocEggsSold = eggSales
    .filter((s) => s.server === 'ROC')
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const rocEggsRemaining = Math.max(0, rocEggsTotal - rocEggsSold);

  const roEggsTotal = config.codesCount * config.eggsPerCode;
  const roEggsSold = eggSales
    .filter((s) => s.server === 'RO')
    .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  const roEggsRemaining = Math.max(0, roEggsTotal - roEggsSold);

  return {
    totalCost: config.totalInitialCost,
    totalRevenue,
    clearedRevenue,
    pendingRevenue,
    netProfit,
    roiPercentage,
    isBreakeven,
    remainingToBreakeven,
    figureTotal: config.figureBoxCount,
    figureSold,
    figureRemaining,
    keycapTotalBoxes: config.keycapBoxCount,
    keycapSoldBoxesEquivalent,
    keycapSoldBoxes,
    keycapSoldPieces,
    keycapRemainingBoxes,
    rocEggsTotal,
    rocEggsSold,
    rocEggsRemaining,
    roEggsTotal,
    roEggsSold,
    roEggsRemaining,
  };
}

export function calculateCodeSummaries(
  eggSales: EggSale[],
  server: ServerType,
  config: AppCostConfig = DEFAULT_CONFIG
): CodeSummary[] {
  const summaries: CodeSummary[] = [];

  for (let codeId = 1; codeId <= config.codesCount; codeId++) {
    const codeSales = eggSales.filter((s) => s.server === server && Number(s.codeId) === codeId);
    const soldCount = codeSales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
    const clearedRevenue = codeSales
      .filter((s) => s.status === 'Clear')
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const pendingRevenue = codeSales
      .filter((s) => s.status === 'Pending')
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const totalRevenue = clearedRevenue + pendingRevenue;

    summaries.push({
      codeId,
      server,
      totalQuota: config.eggsPerCode,
      soldCount,
      remainingCount: Math.max(0, config.eggsPerCode - soldCount),
      clearedRevenue,
      pendingRevenue,
      totalRevenue,
      salesCount: codeSales.length,
    });
  }

  return summaries;
}

// ===============================================
// Calculations for Cash Items & Point Stock Module
// ===============================================

export function calculateCashPortfolioSummary(
  cashItems: CashItem[],
  cashSales: CashSale[],
  config: CashPortfolioConfig = DEFAULT_CASH_PORTFOLIO_CONFIG
): CashPortfolioSummary {
  const initialInvestment = config.initialInvestment; // 54,000

  const newSalesTotal = cashSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const newSalesCleared = cashSales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const newSalesPending = cashSales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  // If cashSales contains transactions, the ledger records all sales directly (including 60 PDF sales).
  // Baseline initialCashSales is only used if cashSales list is empty.
  const baselineSales =
    cashSales.length > 0
      ? 0
      : (Number(config.initialCashSales) || 0);

  const clearedCashSales = baselineSales + newSalesCleared;
  const pendingCashSales = newSalesPending;
  const totalCashSales = clearedCashSales + pendingCashSales;
  const historicalSales = 51570.10; // ยอดขายตาม PDF 60 รายการ (51,570.10 THB)

  // Points conversion: e.g. 88,650 Points @ 0.065 = 5,762.25 THB
  const remainingPoints = config.remainingPoints;
  const pointExchangeRate = config.pointExchangeRate;
  const pointValueThb = remainingPoints * pointExchangeRate;

  // Inventory value
  let promoInventoryValue = 0;
  let pointPurchasedInventoryValue = 0;

  cashItems.forEach((item) => {
    const val = (Number(item.stockQty) || 0) * (Number(item.targetPricePerUnit) || 0);
    if (item.category === 'PROMO_FREEBIE') {
      promoInventoryValue += val;
    } else {
      pointPurchasedInventoryValue += val;
    }
  });

  const totalInventoryValue = promoInventoryValue + pointPurchasedInventoryValue;

  // Breakeven based on actual cash collected:
  // e.g. 51,570.10 / 54,000 = 95.5% (ขาดอีก 2,429.90 THB จะคืนทุน 54k)
  const breakevenPercent =
    initialInvestment > 0 ? (clearedCashSales / initialInvestment) * 100 : 100;
  const remainingToBreakeven = Math.max(0, initialInvestment - clearedCashSales);
  const isBreakeven = clearedCashSales >= initialInvestment;
  const netCashProfit = clearedCashSales - initialInvestment;

  // Total Assets: Cash collected + Points value + Stock value
  const totalAssetsValue = clearedCashSales + pointValueThb + totalInventoryValue;

  return {
    initialInvestment,
    historicalSales,
    newSalesTotal,
    totalCashSales,
    clearedCashSales,
    pendingCashSales,
    remainingPoints,
    pointExchangeRate,
    pointValueThb,
    totalInventoryValue,
    promoInventoryValue,
    pointPurchasedInventoryValue,
    breakevenPercent,
    remainingToBreakeven,
    isBreakeven,
    netCashProfit,
    totalAssetsValue,
  };
}

// ===============================================
// Calculations for GOC & Libra Promo (14.25k)
// ===============================================

export function calculateGocLibraSummary(
  items: GocLibraItem[],
  sales: GocLibraSale[],
  config: GocLibraConfig = DEFAULT_GOC_LIBRA_CONFIG
): GocLibraSummary {
  const totalCost = config.initialCapital; // 14,250 THB
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const clearedRevenue = sales
    .filter((s) => s.status === 'Clear')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  const pendingRevenue = sales
    .filter((s) => s.status === 'Pending')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  const netProfit = totalRevenue - totalCost;
  const clearedNetProfit = clearedRevenue - totalCost;
  const roiPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const breakevenPercent = totalCost > 0 ? (clearedRevenue / totalCost) * 100 : 100;
  const totalBreakevenPercent = totalCost > 0 ? (totalRevenue / totalCost) * 100 : 100;
  const remainingToBreakeven = Math.max(0, totalCost - clearedRevenue);
  const isBreakeven = clearedRevenue >= totalCost;

  // Silvervine metrics
  const svItems = items.filter((i) => i.category === 'SILVERVINE');
  const silvervineTotal = svItems.reduce((sum, i) => sum + (Number(i.totalQty) || 0), 0);
  const silvervineRemaining = svItems.reduce((sum, i) => sum + (Number(i.stockQty) || 0), 0);
  const silvervineSold = svItems.reduce((sum, i) => sum + (Number(i.soldQty) || 0), 0);
  const silvervineRevenue = sales
    .filter((s) => s.category === 'SILVERVINE')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  // Libra Scroll metrics
  const libraItems = items.filter((i) => i.category === 'LIBRA_SCROLL');
  const libraTotal = libraItems.reduce((sum, i) => sum + (Number(i.totalQty) || 0), 0);
  const libraRemaining = libraItems.reduce((sum, i) => sum + (Number(i.stockQty) || 0), 0);
  const libraSold = libraItems.reduce((sum, i) => sum + (Number(i.soldQty) || 0), 0);
  const libraRevenue = sales
    .filter((s) => s.category === 'LIBRA_SCROLL')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  // Goodies metrics
  const goodieItems = items.filter((i) => i.category === 'PROMO_GOODIE');
  const goodiesTotalCount = goodieItems.reduce((sum, i) => sum + (Number(i.totalQty) || 0), 0);
  const goodiesRemainingCount = goodieItems.reduce((sum, i) => sum + (Number(i.stockQty) || 0), 0);
  const goodiesRevenue = sales
    .filter((s) => s.category === 'PROMO_GOODIE')
    .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);

  const estimatedRemainingStockValue = items.reduce(
    (sum, i) => sum + (Number(i.stockQty) || 0) * (Number(i.targetPricePerUnit) || 0),
    0
  );

  return {
    totalCost,
    totalPoints: config.totalPoints,
    costPerPoint: config.costPerPoint,
    totalRevenue,
    clearedRevenue,
    pendingRevenue,
    netProfit,
    clearedNetProfit,
    roiPercentage,
    breakevenPercent,
    totalBreakevenPercent,
    remainingToBreakeven,
    isBreakeven,
    silvervineTotal,
    silvervineSold,
    silvervineRemaining,
    silvervineRevenue,
    libraTotal,
    libraSold,
    libraRemaining,
    libraRevenue,
    goodiesTotalCount,
    goodiesRemainingCount,
    goodiesRevenue,
    estimatedRemainingStockValue,
  };
}

// ===============================================
// Combined Cross-Project Cash Flow Calculations
// ===============================================

export function calculateCombinedCashFlowSummary(
  urgentCallSummary: DashboardSummary,
  cashSummary: CashPortfolioSummary,
  cashConfig: CashPortfolioConfig = DEFAULT_CASH_PORTFOLIO_CONFIG,
  gocLibraSummary?: GocLibraSummary
): CombinedCashFlowSummary {
  const loanToUrgentCall = cashConfig.loanToUrgentCall; // 45,000 THB

  const urgentCallTotalRevenue = urgentCallSummary.totalRevenue;
  const urgentCallClearedRevenue = urgentCallSummary.clearedRevenue;
  const urgentCallPendingRevenue = urgentCallSummary.pendingRevenue;

  // Repayment progress of the 45,000 THB borrowed from the Cash Item pool
  const urgentCallRepaidToPool = Math.min(urgentCallClearedRevenue, loanToUrgentCall);
  const urgentCallRepaidPercent =
    loanToUrgentCall > 0 ? (urgentCallClearedRevenue / loanToUrgentCall) * 100 : 100;
  const urgentCallRemainingToRepay = Math.max(0, loanToUrgentCall - urgentCallClearedRevenue);
  const urgentCallIsRepaid = urgentCallClearedRevenue >= loanToUrgentCall;

  // GOC & Libra Promo (14,250 THB loan from Central Cash Pool)
  const loanToGocLibra = gocLibraSummary ? gocLibraSummary.totalCost : 14250;
  const gocLibraTotalRevenue = gocLibraSummary ? gocLibraSummary.totalRevenue : 0;
  const gocLibraClearedRevenue = gocLibraSummary ? gocLibraSummary.clearedRevenue : 0;
  const gocLibraPendingRevenue = gocLibraSummary ? gocLibraSummary.pendingRevenue : 0;
  const gocLibraRepaidToPool = Math.min(gocLibraClearedRevenue, loanToGocLibra);
  const gocLibraRepaidPercent =
    loanToGocLibra > 0 ? (gocLibraClearedRevenue / loanToGocLibra) * 100 : 100;
  const gocLibraRemainingToRepay = Math.max(0, loanToGocLibra - gocLibraClearedRevenue);
  const gocLibraIsRepaid = gocLibraClearedRevenue >= loanToGocLibra;

  // Physical Cash In Hand (เงินสดจริงในบัญชี):
  // (Cash Item cleared sales - 45,000 loan - 14,250 GOC Libra loan) + Urgent Call cleared sales + GOC Libra cleared sales
  const physicalCashInHand =
    cashSummary.clearedCashSales -
    loanToUrgentCall -
    loanToGocLibra +
    urgentCallClearedRevenue +
    gocLibraClearedRevenue;

  const totalPendingReceivables =
    cashSummary.pendingCashSales + urgentCallPendingRevenue + gocLibraPendingRevenue;

  // Net combined invested = 54,000 (since both 45k and 14.25k are internal transfers from the central pool)
  const totalCombinedInvested = cashSummary.initialInvestment;

  // Total combined profit across all 3 projects:
  const totalCombinedNetProfit =
    cashSummary.clearedCashSales -
    cashSummary.initialInvestment +
    (urgentCallClearedRevenue - loanToUrgentCall) +
    (gocLibraClearedRevenue - loanToGocLibra);

  // Combined assets: Physical cash + Cash Points + Cash Items Stock + Estimated remaining Urgent Call items + GOC Libra remaining stock
  const urgentCallRemainingFigureValue = urgentCallSummary.figureRemaining * 4500;
  const urgentCallRemainingKeycapValue = urgentCallSummary.keycapRemainingBoxes * 3200;
  const urgentCallRemainingEggValue =
    (urgentCallSummary.rocEggsRemaining + urgentCallSummary.roEggsRemaining) * 55;
  const urgentCallTotalStockValue =
    urgentCallRemainingFigureValue + urgentCallRemainingKeycapValue + urgentCallRemainingEggValue;

  const gocLibraStockValue = gocLibraSummary ? gocLibraSummary.estimatedRemainingStockValue : 0;

  const totalCombinedAssets =
    physicalCashInHand +
    cashSummary.pointValueThb +
    cashSummary.totalInventoryValue +
    urgentCallTotalStockValue +
    gocLibraStockValue;

  return {
    loanToUrgentCall,
    urgentCallTotalRevenue,
    urgentCallClearedRevenue,
    urgentCallPendingRevenue,
    urgentCallRepaidToPool,
    urgentCallRepaidPercent,
    urgentCallRemainingToRepay,
    urgentCallIsRepaid,
    loanToGocLibra,
    gocLibraTotalRevenue,
    gocLibraClearedRevenue,
    gocLibraPendingRevenue,
    gocLibraRepaidToPool,
    gocLibraRepaidPercent,
    gocLibraRemainingToRepay,
    gocLibraIsRepaid,
    cashItemClearedSales: cashSummary.clearedCashSales,
    cashItemPendingSales: cashSummary.pendingCashSales,
    physicalCashInHand,
    totalPendingReceivables,
    totalCombinedInvested,
    totalCombinedNetProfit,
    totalCombinedAssets,
  };
}

