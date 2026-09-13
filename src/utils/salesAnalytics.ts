import { Lead, FinancialDoc, ServiceMeta, PROVEXA_SERVICES, ProvexaService } from '../types';

export interface MonthlyAnalytics {
  monthKey: string; // '2026-03'
  monthLabel: string; // 'Mac 2026'
  shortMonth: string; // 'Mac'
  year: number;
  monthIndex: number; // 0-11

  // Lead metrics
  totalLeads: number;
  convertedLeads: number; // status === 'berjaya'
  lostLeads: number; // status === 'gagal'
  activeLeads: number; // in progress
  conversionRate: number; // % (0-100)
  totalPipelineValue: number; // RM
  wonPipelineValue: number; // RM

  // Revenue metrics based on financial docs
  invoicedRevenue: number; // RM from 'invois'
  collectedRevenue: number; // RM from 'resit' or 'invois.jumlahDibayar'
  outstandingRevenue: number; // RM invoiced but not collected
  quotationsValue: number; // RM from 'sebutharga'

  // MoM Growth metrics
  revenueGrowthRate: number; // % MoM change
  leadGrowthRate: number; // % MoM change
  cumulativeRevenue: number; // running total
}

export interface ServiceRevenueItem {
  key: string;
  name: string;
  color: string;
  revenue: number;
  invoiced: number;
  projectCount: number;
  percentage: number;
}

export interface LeadFunnelStage {
  stage: string;
  label: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
}

export interface SummarySalesMetrics {
  totalRevenueCollected: number;
  totalRevenueInvoiced: number;
  totalOutstanding: number;
  averageMonthlyRevenue: number;
  latestMonthRevenueGrowth: number;
  totalLeads: number;
  totalConvertedLeads: number;
  overallConversionRate: number;
  averageDealSize: number;
  totalPipelineValue: number;
}

export const MALAY_MONTHS = [
  'Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'
];

export const MALAY_FULL_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
];

export const formatMonthYear = (year: number, monthIndex: number): string => {
  return `${MALAY_MONTHS[monthIndex]} ${year}`;
};

export const formatFullMonthYear = (year: number, monthIndex: number): string => {
  return `${MALAY_FULL_MONTHS[monthIndex]} ${year}`;
};

/**
 * Extract YYYY-MM from an ISO date string or YYYY-MM-DD
 */
export const extractMonthKey = (dateStr?: string): { key: string; year: number; month: number } | null => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      // Fallback regex match for YYYY-MM
      const m = dateStr.match(/^(\d{4})-(\d{2})/);
      if (m) {
        return {
          key: `${m[1]}-${m[2]}`,
          year: parseInt(m[1], 10),
          month: parseInt(m[2], 10) - 1,
        };
      }
      return null;
    }
    const year = d.getFullYear();
    const month = d.getMonth();
    const key = `${year}-${String(month + 1).padStart(2, '0')}`;
    return { key, year, month };
  } catch {
    return null;
  }
};

/**
 * Compute monthly analytics joining Leads and Financial Documents
 */
export const calculateMonthlyAnalytics = (
  leads: Lead[],
  financialDocs: FinancialDoc[],
  options?: {
    filterYear?: string;
    filterMonth?: string;
    filterService?: string;
    timeRange?: 'all' | '6months' | '12months';
  }
): MonthlyAnalytics[] => {
  const { filterYear = 'all', filterMonth = 'all', filterService = 'all', timeRange = 'all' } = options || {};

  // Filter leads by service if selected
  const filteredLeads = leads.filter((l) => {
    if (filterService !== 'all') {
      const matchPrimary = l.servisMinat === filterService;
      const matchExtra = l.servisTambahan?.includes(filterService as ProvexaService);
      if (!matchPrimary && !matchExtra) return false;
    }
    return true;
  });

  // Filter financial docs by service if selected
  const filteredDocs = financialDocs.filter((doc) => {
    if (filterService !== 'all') {
      const hasServiceItem = doc.items.some(
        (it) => it.servisKategori === filterService
      );
      if (!hasServiceItem) return false;
    }
    return true;
  });

  // Collect all unique month keys from both datasets
  const monthMap = new Map<
    string,
    {
      year: number;
      monthIndex: number;
      leads: Lead[];
      invoices: FinancialDoc[];
      receipts: FinancialDoc[];
      quotations: FinancialDoc[];
    }
  >();

  // Aggregate leads
  filteredLeads.forEach((lead) => {
    const parsed = extractMonthKey(lead.tarikhDicipta);
    if (!parsed) return;
    if (!monthMap.has(parsed.key)) {
      monthMap.set(parsed.key, {
        year: parsed.year,
        monthIndex: parsed.month,
        leads: [],
        invoices: [],
        receipts: [],
        quotations: [],
      });
    }
    monthMap.get(parsed.key)!.leads.push(lead);
  });

  // Aggregate financial documents
  filteredDocs.forEach((doc) => {
    const parsed = extractMonthKey(doc.tarikh || doc.tarikhDicipta);
    if (!parsed) return;
    if (!monthMap.has(parsed.key)) {
      monthMap.set(parsed.key, {
        year: parsed.year,
        monthIndex: parsed.month,
        leads: [],
        invoices: [],
        receipts: [],
        quotations: [],
      });
    }
    const bucket = monthMap.get(parsed.key)!;
    if (doc.jenis === 'invois') bucket.invoices.push(doc);
    else if (doc.jenis === 'resit') bucket.receipts.push(doc);
    else if (doc.jenis === 'sebutharga') bucket.quotations.push(doc);
  });

  // If no records exist at all, populate past 6 months as empty baseline
  if (monthMap.size === 0) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const k = `${y}-${String(m + 1).padStart(2, '0')}`;
      monthMap.set(k, {
        year: y,
        monthIndex: m,
        leads: [],
        invoices: [],
        receipts: [],
        quotations: [],
      });
    }
  } else {
    // Fill in intermediate gaps between earliest and latest recorded months so timeline is continuous
    const keys = Array.from(monthMap.keys()).sort();
    const minKey = keys[0];
    const maxKey = keys[keys.length - 1];
    const [minY, minM] = minKey.split('-').map(Number);
    const [maxY, maxM] = maxKey.split('-').map(Number);

    let curDate = new Date(minY, minM - 1, 1);
    const endDate = new Date(maxY, maxM - 1, 1);

    while (curDate <= endDate) {
      const y = curDate.getFullYear();
      const m = curDate.getMonth();
      const k = `${y}-${String(m + 1).padStart(2, '0')}`;
      if (!monthMap.has(k)) {
        monthMap.set(k, {
          year: y,
          monthIndex: m,
          leads: [],
          invoices: [],
          receipts: [],
          quotations: [],
        });
      }
      curDate.setMonth(curDate.getMonth() + 1);
    }
  }

  // Sort month keys chronologically
  const sortedKeys = Array.from(monthMap.keys()).sort();

  // Compute metrics with running values
  let runningCumulativeRevenue = 0;
  let previousCollectedRevenue = 0;
  let previousTotalLeads = 0;

  const allMonthsList: MonthlyAnalytics[] = [];

  sortedKeys.forEach((key) => {
    const bucket = monthMap.get(key)!;

    const totalLeads = bucket.leads.length;
    const convertedLeads = bucket.leads.filter((l) => l.status === 'berjaya').length;
    const lostLeads = bucket.leads.filter((l) => l.status === 'gagal').length;
    const activeLeads = totalLeads - convertedLeads - lostLeads;

    const conversionRate = totalLeads > 0
      ? Number(((convertedLeads / totalLeads) * 100).toFixed(1))
      : 0;

    const totalPipelineValue = bucket.leads.reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);
    const wonPipelineValue = bucket.leads
      .filter((l) => l.status === 'berjaya')
      .reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);

    // Invoices issued in month
    const invoicedRevenue = bucket.invoices.reduce(
      (sum, inv) => sum + (inv.jumlahKeseluruhan || 0),
      0
    );

    // Receipts / payments collected in month
    // Priority: 'resit' records represent verified money received.
    // In addition, if invoices have 'jumlahDibayar' that aren't represented in receipts, account for them.
    const receiptsCollected = bucket.receipts.reduce(
      (sum, rec) => sum + (rec.jumlahKeseluruhan || rec.jumlahDibayar || 0),
      0
    );

    // Fallback: If no receipts exist for this month but invoices show payments received
    const invoicePaidAmount = bucket.invoices.reduce(
      (sum, inv) => sum + (inv.jumlahDibayar || 0),
      0
    );

    // Total collected revenue for this month
    const collectedRevenue = Math.max(receiptsCollected, invoicePaidAmount);

    const outstandingRevenue = Math.max(0, invoicedRevenue - collectedRevenue);

    const quotationsValue = bucket.quotations.reduce(
      (sum, q) => sum + (q.jumlahKeseluruhan || 0),
      0
    );

    // Month-over-month growth calculations
    let revenueGrowthRate = 0;
    if (previousCollectedRevenue > 0) {
      revenueGrowthRate = Number(
        (((collectedRevenue - previousCollectedRevenue) / previousCollectedRevenue) * 100).toFixed(1)
      );
    } else {
      revenueGrowthRate = 0;
    }

    let leadGrowthRate = 0;
    if (previousTotalLeads > 0) {
      leadGrowthRate = Number(
        (((totalLeads - previousTotalLeads) / previousTotalLeads) * 100).toFixed(1)
      );
    }

    runningCumulativeRevenue += collectedRevenue;
    previousCollectedRevenue = collectedRevenue;
    previousTotalLeads = totalLeads;

    allMonthsList.push({
      monthKey: key,
      monthLabel: formatMonthYear(bucket.year, bucket.monthIndex),
      shortMonth: MALAY_MONTHS[bucket.monthIndex],
      year: bucket.year,
      monthIndex: bucket.monthIndex,
      totalLeads,
      convertedLeads,
      lostLeads,
      activeLeads,
      conversionRate,
      totalPipelineValue,
      wonPipelineValue,
      invoicedRevenue,
      collectedRevenue,
      outstandingRevenue,
      quotationsValue,
      revenueGrowthRate,
      leadGrowthRate,
      cumulativeRevenue: runningCumulativeRevenue,
    });
  });

  // Apply Year Filter
  let filtered = allMonthsList;
  if (filterYear !== 'all') {
    filtered = filtered.filter((m) => String(m.year) === filterYear);
  }

  // Apply Month Filter (1 to 12)
  if (filterMonth && filterMonth !== 'all') {
    const targetMonthIdx = parseInt(filterMonth, 10) - 1;
    filtered = filtered.filter((m) => m.monthIndex === targetMonthIdx);
  }

  // Apply Time Range Filter if specified and no single month is filtered
  if ((!filterMonth || filterMonth === 'all') && timeRange === '6months' && filtered.length > 6) {
    return filtered.slice(-6);
  }
  if ((!filterMonth || filterMonth === 'all') && timeRange === '12months' && filtered.length > 12) {
    return filtered.slice(-12);
  }

  return filtered;
};

/**
 * Compute summary KPI metrics across the filtered timeline
 */
export const calculateSummaryMetrics = (monthlyData: MonthlyAnalytics[]): SummarySalesMetrics => {
  if (monthlyData.length === 0) {
    return {
      totalRevenueCollected: 0,
      totalRevenueInvoiced: 0,
      totalOutstanding: 0,
      averageMonthlyRevenue: 0,
      latestMonthRevenueGrowth: 0,
      totalLeads: 0,
      totalConvertedLeads: 0,
      overallConversionRate: 0,
      averageDealSize: 0,
      totalPipelineValue: 0,
    };
  }

  const totalRevenueCollected = monthlyData.reduce((sum, m) => sum + m.collectedRevenue, 0);
  const totalRevenueInvoiced = monthlyData.reduce((sum, m) => sum + m.invoicedRevenue, 0);
  const totalOutstanding = Math.max(0, totalRevenueInvoiced - totalRevenueCollected);

  const monthsWithRevenue = monthlyData.filter((m) => m.collectedRevenue > 0);
  const averageMonthlyRevenue = monthlyData.length > 0
    ? Math.round(totalRevenueCollected / monthlyData.length)
    : 0;

  const latestMonth = monthlyData[monthlyData.length - 1];
  const latestMonthRevenueGrowth = latestMonth ? latestMonth.revenueGrowthRate : 0;

  const totalLeads = monthlyData.reduce((sum, m) => sum + m.totalLeads, 0);
  const totalConvertedLeads = monthlyData.reduce((sum, m) => sum + m.convertedLeads, 0);

  const overallConversionRate = totalLeads > 0
    ? Number(((totalConvertedLeads / totalLeads) * 100).toFixed(1))
    : 0;

  const averageDealSize = totalConvertedLeads > 0
    ? Math.round(totalRevenueCollected / totalConvertedLeads)
    : 0;

  const totalPipelineValue = monthlyData.reduce((sum, m) => sum + m.totalPipelineValue, 0);

  return {
    totalRevenueCollected,
    totalRevenueInvoiced,
    totalOutstanding,
    averageMonthlyRevenue,
    latestMonthRevenueGrowth,
    totalLeads,
    totalConvertedLeads,
    overallConversionRate,
    averageDealSize,
    totalPipelineValue,
  };
};

/**
 * Compute revenue distribution by service category based on financial document items
 */
export const calculateServiceRevenueBreakdown = (
  financialDocs: FinancialDoc[],
  catalog?: Record<string, ServiceMeta>
): ServiceRevenueItem[] => {
  const serviceCatalog = catalog || PROVEXA_SERVICES;
  const serviceMap = new Map<string, { revenue: number; invoiced: number; count: number }>();

  // Initialize with all catalog services
  Object.entries(serviceCatalog).forEach(([key]) => {
    serviceMap.set(key, { revenue: 0, invoiced: 0, count: 0 });
  });

  // Calculate from financial documents
  financialDocs.forEach((doc) => {
    const isCollected = doc.jenis === 'resit' || doc.statusBayaran === 'lunas';
    const isPartial = doc.statusBayaran === 'sebahagian';

    doc.items.forEach((item) => {
      const sKey = item.servisKategori || 'website';
      if (!serviceMap.has(sKey)) {
        serviceMap.set(sKey, { revenue: 0, invoiced: 0, count: 0 });
      }
      const entry = serviceMap.get(sKey)!;
      entry.invoiced += item.jumlah || 0;
      entry.count += 1;

      if (isCollected) {
        entry.revenue += item.jumlah || 0;
      } else if (isPartial && doc.jumlahKeseluruhan > 0) {
        const ratio = (doc.jumlahDibayar || 0) / doc.jumlahKeseluruhan;
        entry.revenue += Math.round((item.jumlah || 0) * ratio);
      }
    });
  });

  const totalRevenue = Array.from(serviceMap.values()).reduce((sum, s) => sum + s.revenue, 0);

  const colors = [
    '#4F46E5', '#06B6D4', '#10B981', '#F59E0B',
    '#EC4899', '#8B5CF6', '#3B82F6', '#14B8A6',
    '#F97316', '#6366F1'
  ];

  let colorIdx = 0;
  const result: ServiceRevenueItem[] = [];

  serviceMap.forEach((data, key) => {
    const meta = serviceCatalog[key as ProvexaService];
    const name = meta?.title || key;
    const percentage = totalRevenue > 0 ? Number(((data.revenue / totalRevenue) * 100).toFixed(1)) : 0;

    result.push({
      key,
      name,
      color: colors[colorIdx % colors.length],
      revenue: data.revenue,
      invoiced: data.invoiced,
      projectCount: data.count,
      percentage,
    });
    colorIdx++;
  });

  // Sort by highest revenue
  return result.sort((a, b) => b.revenue - a.revenue);
};

/**
 * Compute lead funnel stages from initial enquiry to deal won
 */
export const calculateLeadFunnel = (leads: Lead[]): LeadFunnelStage[] => {
  const stages: { stage: string; label: string; color: string; statuses: string[] }[] = [
    { stage: 'baru', label: '1. Inkuiri Baharu', color: '#3B82F6', statuses: ['baru'] },
    { stage: 'dihubungi', label: '2. Telah Dihubungi', color: '#6366F1', statuses: ['dihubungi'] },
    { stage: 'sesi_discovery', label: '3. Sesi Discovery', color: '#8B5CF6', statuses: ['sesi_discovery'] },
    { stage: 'sebutharga_dihantar', label: '4. Sebutharga Dihantar', color: '#F59E0B', statuses: ['sebutharga_dihantar'] },
    { stage: 'tunggu_deposit', label: '5. Tunggu Deposit', color: '#14B8A6', statuses: ['tunggu_deposit'] },
    { stage: 'berjaya', label: '6. Berjaya (Deal Won)', color: '#10B981', statuses: ['berjaya'] },
  ];

  const total = leads.length;

  return stages.map((st) => {
    const matchingLeads = leads.filter((l) => st.statuses.includes(l.status));
    const count = matchingLeads.length;
    const value = matchingLeads.reduce((acc, l) => acc + (l.anggaranBajet || 0), 0);
    const percentage = total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0;

    return {
      stage: st.stage,
      label: st.label,
      count,
      value,
      percentage,
      color: st.color,
    };
  });
};

/**
 * Generate CSV string from monthly analytics for download
 */
export const generateAnalyticsCsv = (data: MonthlyAnalytics[]): string => {
  const headers = [
    'Bulan',
    'Jumlah Leads',
    'Lead Berjaya',
    'Kadar Penukaran (%)',
    'Nilai Pipeline (RM)',
    'Invois Dikeluarkan (RM)',
    'Hasil Dikutip (RM)',
    'Baki Tertunggak (RM)',
    'Pertumbuhan Hasil MoM (%)',
    'Hasil Terkumpul (RM)',
  ];

  const rows = data.map((d) => [
    `"${d.monthLabel}"`,
    d.totalLeads,
    d.convertedLeads,
    d.conversionRate,
    d.totalPipelineValue,
    d.invoicedRevenue,
    d.collectedRevenue,
    d.outstandingRevenue,
    d.revenueGrowthRate,
    d.cumulativeRevenue,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};
