import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  PieChart,
  Pie,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Filter,
  Calendar,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  Layers,
  FileText,
  HelpCircle,
  FolderKanban,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  Lead,
  FinancialDoc,
  ServiceMeta,
  PROVEXA_SERVICES,
  ProvexaService,
  Project,
} from '../types';
import {
  calculateMonthlyAnalytics,
  calculateSummaryMetrics,
  calculateServiceRevenueBreakdown,
  calculateLeadFunnel,
  generateAnalyticsCsv,
  MonthlyAnalytics,
  MALAY_FULL_MONTHS,
  extractMonthKey,
} from '../utils/salesAnalytics';

interface SalesAnalyticsDashboardProps {
  leads: Lead[];
  financialDocs: FinancialDoc[];
  projects?: Project[];
  services?: Record<string, ServiceMeta>;
  onNavigateToLeads?: () => void;
  onNavigateToFinancialDocs?: () => void;
  onNavigateToDocs?: () => void;
}

export const SalesAnalyticsDashboard: React.FC<SalesAnalyticsDashboardProps> = ({
  leads,
  financialDocs,
  services,
  onNavigateToLeads,
  onNavigateToFinancialDocs,
  onNavigateToDocs,
}) => {
  const handleGoToDocs = onNavigateToFinancialDocs || onNavigateToDocs;
  // Filter States
  const [timeRange, setTimeRange] = useState<'all' | '6months' | '12months'>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [activeChartTab, setActiveChartTab] = useState<'both' | 'conversion' | 'revenue'>('both');
  const [revenueChartMode, setRevenueChartMode] = useState<'comparison' | 'growth'>('comparison');

  const catalog = services || PROVEXA_SERVICES;

  // Dynamically extract available years from both leads and financial documents
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    leads.forEach((l) => {
      const p = extractMonthKey(l.tarikhDicipta);
      if (p) yearsSet.add(String(p.year));
    });
    financialDocs.forEach((d) => {
      const p = extractMonthKey(d.tarikh || d.tarikhDicipta);
      if (p) yearsSet.add(String(p.year));
    });
    yearsSet.add('2026');
    yearsSet.add('2025');
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [leads, financialDocs]);

  // Monthly Analytics dataset
  const monthlyData = useMemo(() => {
    return calculateMonthlyAnalytics(leads, financialDocs, {
      filterYear: selectedYear,
      filterMonth: selectedMonth,
      filterService: selectedService,
      timeRange,
    });
  }, [leads, financialDocs, selectedYear, selectedMonth, selectedService, timeRange]);

  // Overall KPI Summary
  const summaryMetrics = useMemo(() => {
    return calculateSummaryMetrics(monthlyData);
  }, [monthlyData]);

  // Filter leads according to selected Year and Month for Funnel calculations
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (selectedService !== 'all') {
        const matchPrimary = l.servisMinat === selectedService;
        const matchExtra = l.servisTambahan?.includes(selectedService as any);
        if (!matchPrimary && !matchExtra) return false;
      }
      const parsed = extractMonthKey(l.tarikhDicipta);
      if (!parsed) return true;
      if (selectedYear !== 'all' && String(parsed.year) !== selectedYear) return false;
      if (selectedMonth !== 'all' && String(parsed.month + 1) !== selectedMonth) return false;
      return true;
    });
  }, [leads, selectedService, selectedYear, selectedMonth]);

  // Filter financial docs according to selected Year and Month for Service Revenue breakdown
  const filteredFinancialDocs = useMemo(() => {
    return financialDocs.filter((doc) => {
      if (selectedService !== 'all') {
        const hasServiceItem = doc.items.some((it) => it.servisKategori === selectedService);
        if (!hasServiceItem) return false;
      }
      const parsed = extractMonthKey(doc.tarikh || doc.tarikhDicipta);
      if (!parsed) return true;
      if (selectedYear !== 'all' && String(parsed.year) !== selectedYear) return false;
      if (selectedMonth !== 'all' && String(parsed.month + 1) !== selectedMonth) return false;
      return true;
    });
  }, [financialDocs, selectedService, selectedYear, selectedMonth]);

  // Service Breakdown for Pie/Donut Chart
  const serviceBreakdown = useMemo(() => {
    return calculateServiceRevenueBreakdown(filteredFinancialDocs, catalog);
  }, [filteredFinancialDocs, catalog]);

  // Lead Funnel Stages
  const leadFunnel = useMemo(() => {
    return calculateLeadFunnel(filteredLeads);
  }, [filteredLeads]);

  // Check if any filter is active
  const isAnyFilterActive =
    selectedMonth !== 'all' ||
    selectedYear !== 'all' ||
    selectedService !== 'all' ||
    timeRange !== 'all';

  const handleResetFilters = () => {
    setSelectedMonth('all');
    setSelectedYear('all');
    setSelectedService('all');
    setTimeRange('all');
  };

  // Handle CSV Download
  const handleExportCsv = () => {
    const csvContent = generateAnalyticsCsv(monthlyData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Provexa_Analitis_Jualan_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Best performing month by revenue
  const bestRevenueMonth = useMemo(() => {
    if (!monthlyData.length) return null;
    return [...monthlyData].sort((a, b) => b.collectedRevenue - a.collectedRevenue)[0];
  }, [monthlyData]);

  // Best conversion month
  const bestConversionMonth = useMemo(() => {
    if (!monthlyData.length) return null;
    return [...monthlyData]
      .filter((m) => m.totalLeads >= 2)
      .sort((a, b) => b.conversionRate - a.conversionRate)[0];
  }, [monthlyData]);

  return (
    <div className="space-y-6 sm:space-y-7 pb-10">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100">
              Provexa Solution
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Analitis &amp; Kecerdasan Perniagaan</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Analitis Jualan &amp; Prestasi Hasil
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualisasi kadar penukaran leads bulanan, aliran tunai invois/resit, dan agihan servis Provexa.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Muat Turun Laporan CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Penapis Analitis:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Time Range Pills */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Masa
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('6months')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === '6months'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Bulan Terkini
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('12months')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                timeRange === '12months'
                  ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Bulan
            </button>
          </div>

          {/* Year Filter */}
          <select
            id="filter-analytics-year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>

          {/* Month Filter */}
          <select
            id="filter-analytics-month"
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              if (e.target.value !== 'all') {
                setTimeRange('all');
              }
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${
              selectedMonth !== 'all'
                ? 'border-indigo-300 bg-indigo-50/70 text-indigo-800 font-semibold ring-1 ring-indigo-200'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <option value="all">Semua Bulan</option>
            {MALAY_FULL_MONTHS.map((mName, idx) => (
              <option key={mName} value={String(idx + 1)}>
                Bulan {mName}
              </option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            id="filter-analytics-service"
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none max-w-[190px] truncate"
          >
            <option value="all">Semua 8 Servis</option>
            {Object.entries(catalog).map(([key, meta]) => (
              <option key={key} value={key}>
                {(meta as ServiceMeta).title}
              </option>
            ))}
          </select>

          {/* Reset Filter Button (Shown when any filter is active) */}
          {isAnyFilterActive && (
            <button
              type="button"
              id="btn-reset-filters"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors shadow-2xs"
              title="Set semula semua tapisan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Month / Specific Filter Indicator Banner */}
      {selectedMonth !== 'all' && (
        <div
          id="banner-month-focus"
          className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-indigo-50/90 border border-indigo-200/80 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-950 shadow-2xs animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-900 flex flex-wrap items-center gap-2">
                <span>
                  Paparan Khusus:{' '}
                  <strong className="text-indigo-700 font-bold">
                    Bulan {MALAY_FULL_MONTHS[parseInt(selectedMonth, 10) - 1]}
                  </strong>
                </span>
                {selectedYear !== 'all' ? (
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100/90 text-indigo-800 text-[11px] font-bold border border-indigo-200/60">
                    Tahun {selectedYear}
                  </span>
                ) : (
                  <span className="text-slate-500 font-normal text-[11px]">(Semua Tahun)</span>
                )}
                {selectedService !== 'all' && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
                    Servis: {catalog[selectedService]?.title || selectedService}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200/60">
                  {monthlyData.length} rekod analitis bulan
                </span>
              </div>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Carta, statistik KPI, dan pecahan servis disegerakkan khusus mengikut data yang direkodkan pada bulan ini.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedMonth('all')}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Papar Semua Bulan</span>
          </button>
        </div>
      )}

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Total Revenue Collected */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hasil Dikutip</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            RM {summaryMetrics.totalRevenueCollected.toLocaleString('ms-MY')}
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Pertumbuhan MoM</span>
            <span
              className={`inline-flex items-center font-semibold text-[11px] px-1.5 py-0.5 rounded-md ${
                summaryMetrics.latestMonthRevenueGrowth >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {summaryMetrics.latestMonthRevenueGrowth >= 0 ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {summaryMetrics.latestMonthRevenueGrowth > 0 ? '+' : ''}
              {summaryMetrics.latestMonthRevenueGrowth}%
            </span>
          </div>
        </div>

        {/* KPI 2: Total Invoiced */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Invois Dikeluarkan</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            RM {summaryMetrics.totalRevenueInvoiced.toLocaleString('ms-MY')}
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Tertunggak:</span>
            <span className="font-semibold text-rose-600 font-mono">
              RM {summaryMetrics.totalOutstanding.toLocaleString('ms-MY')}
            </span>
          </div>
        </div>

        {/* KPI 3: Overall Conversion Rate */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Kadar Penukaran</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-700 tracking-tight">
            {summaryMetrics.overallConversionRate}%
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Won Deals:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {summaryMetrics.totalConvertedLeads} / {summaryMetrics.totalLeads}
            </span>
          </div>
        </div>

        {/* KPI 4: Average Deal Size */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Purata Nilai Deal</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            RM {summaryMetrics.averageDealSize.toLocaleString('ms-MY')}
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Purata Bulanan:</span>
            <span className="font-semibold text-slate-700 font-mono">
              RM {summaryMetrics.averageMonthlyRevenue.toLocaleString('ms-MY')}
            </span>
          </div>
        </div>

        {/* KPI 5: Pipeline Value */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Potensi Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
            RM {summaryMetrics.totalPipelineValue.toLocaleString('ms-MY')}
          </div>
          <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
            <span className="text-slate-400">Jumlah Leads:</span>
            <span className="font-semibold text-slate-700">{leads.length} prospek</span>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CHART 1: Monthly Lead Conversion Rate Visualizer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Kadar Penukaran Leads Bulanan
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Jumlah leads masuk vs lead berjaya ditutup (Won Deals)
                </p>
              </div>
            </div>

            {/* Recharts Composed Chart: Leads & Conversion Rate */}
            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="shortMonth"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  {/* Left Y Axis for Lead Count */}
                  <YAxis
                    yAxisId="left"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  {/* Right Y Axis for Conversion Rate % */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: '#4f46e5' }}
                    unit="%"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlyAnalytics;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs min-w-[190px] space-y-1.5">
                            <p className="font-semibold text-xs text-slate-300 border-b border-slate-800 pb-1">
                              {data.monthLabel}
                            </p>
                            <div className="flex justify-between items-center text-slate-300">
                              <span>Jumlah Leads:</span>
                              <span className="font-semibold text-white">{data.totalLeads}</span>
                            </div>
                            <div className="flex justify-between items-center text-emerald-400">
                              <span>Won Deals:</span>
                              <span className="font-semibold text-emerald-400">{data.convertedLeads}</span>
                            </div>
                            <div className="flex justify-between items-center text-indigo-300 font-semibold border-t border-slate-800 pt-1">
                              <span>Kadar Penukaran:</span>
                              <span className="font-mono text-xs">{data.conversionRate}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={32}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="totalLeads"
                    name="Jumlah Leads"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="convertedLeads"
                    name="Won Deals"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="conversionRate"
                    name="Penukaran (%)"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#4f46e5', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Minimalist Summary Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Purata: <strong className="text-slate-800 font-semibold">{monthlyData.length ? (summaryMetrics.totalLeads / monthlyData.length).toFixed(1) : 0} leads/bln</strong></span>
            <span>Won deals: <strong className="text-emerald-700 font-semibold">{summaryMetrics.totalConvertedLeads} projek</strong></span>
            <span>Kadar purata: <strong className="text-indigo-600 font-semibold">{summaryMetrics.overallConversionRate}%</strong></span>
          </div>
        </div>

        {/* CHART 2: Monthly Revenue & Cash Flow Visualizer */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-900 text-sm sm:text-base">
                  Prestasi Hasil &amp; Aliran Tunai
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nilai invois dikeluarkan dan kutipan tunai sebenar (RM)
                </p>
              </div>

              {/* Minimalist View Mode Toggle */}
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-[11px] self-start sm:self-auto border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setRevenueChartMode('comparison')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    revenueChartMode === 'comparison'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kutipan (RM)
                </button>
                <button
                  type="button"
                  onClick={() => setRevenueChartMode('growth')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    revenueChartMode === 'growth'
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Pertumbuhan (%)
                </button>
              </div>
            </div>

            {/* Recharts Chart: Simple Minimalist */}
            <div className="h-64 w-full pt-3">
              <ResponsiveContainer width="100%" height="100%">
                {revenueChartMode === 'comparison' ? (
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortMonth"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickFormatter={(val) => `RM${(val / 1000).toFixed(0)}k`}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as MonthlyAnalytics;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs min-w-[200px] space-y-1.5">
                              <p className="font-semibold text-xs text-slate-300 border-b border-slate-800 pb-1">
                                {data.monthLabel}
                              </p>
                              <div className="flex justify-between items-center text-slate-300">
                                <span>Invois Dikeluarkan:</span>
                                <span className="font-mono font-semibold">
                                  RM {data.invoicedRevenue.toLocaleString('ms-MY')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-emerald-400 font-semibold">
                                <span>Hasil Dikutip:</span>
                                <span className="font-mono">
                                  RM {data.collectedRevenue.toLocaleString('ms-MY')}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-1 text-[11px]">
                                <span>Pertumbuhan MoM:</span>
                                <span className={data.revenueGrowthRate >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                                  {data.revenueGrowthRate > 0 ? '+' : ''}{data.revenueGrowthRate}%
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={32}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px' }}
                    />
                    <Bar
                      dataKey="invoicedRevenue"
                      name="Invois"
                      fill="#cbd5e1"
                      radius={[4, 4, 0, 0]}
                      barSize={14}
                    />
                    <Bar
                      dataKey="collectedRevenue"
                      name="Hasil Dikutip"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={14}
                    />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={monthlyData}
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="shortMonth"
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      unit="%"
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload as MonthlyAnalytics;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg border border-slate-800 text-xs min-w-[180px] space-y-1">
                              <p className="font-semibold text-xs text-slate-300 border-b border-slate-800 pb-1">
                                {data.monthLabel}
                              </p>
                              <div className="flex justify-between items-center text-slate-200">
                                <span>Pertumbuhan MoM:</span>
                                <span className="font-bold text-emerald-400 font-mono">
                                  {data.revenueGrowthRate > 0 ? '+' : ''}{data.revenueGrowthRate}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                                <span>Hasil Dikutip:</span>
                                <span className="font-mono">RM {data.collectedRevenue.toLocaleString('ms-MY')}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenueGrowthRate"
                      name="Pertumbuhan MoM (%)"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      fill="url(#colorGrowth)"
                      dot={{ r: 3.5, fill: '#4f46e5', stroke: '#fff', strokeWidth: 1.5 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Minimalist Summary Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>Dikutip: <strong className="text-emerald-700 font-semibold font-mono">RM {summaryMetrics.totalRevenueCollected.toLocaleString('ms-MY')}</strong></span>
            <span>Invois: <strong className="text-slate-800 font-semibold font-mono">RM {summaryMetrics.totalRevenueInvoiced.toLocaleString('ms-MY')}</strong></span>
            <span>Tertunggak: <strong className="text-rose-600 font-semibold font-mono">RM {summaryMetrics.totalOutstanding.toLocaleString('ms-MY')}</strong></span>
          </div>
        </div>
      </div>

      {/* Secondary Row: Service Contribution & Lead Stage Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Visual 3: Revenue Distribution across 8 Provexa Services (Pie / Donut) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span>Agihan Hasil Mengikut Servis</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sumbangan aliran tunai servis Provexa
              </p>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {serviceBreakdown.filter((s) => s.revenue > 0).length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown.filter((s) => s.revenue > 0)}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {serviceBreakdown
                      .filter((s) => s.revenue > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any, item: any) => [
                      `RM ${Number(value).toLocaleString('ms-MY')} (${item.payload.percentage}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '11px',
                      border: 'none',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Tiada data hasil bagi servis yang ditapis.
              </div>
            )}
          </div>

          {/* Service contribution list */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
            {serviceBreakdown.slice(0, 5).map((srv) => (
              <div
                key={srv.key}
                className="flex items-center justify-between text-xs p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: srv.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">{srv.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-slate-900 font-semibold">
                    RM {srv.revenue.toLocaleString('ms-MY')}
                  </span>
                  <span className="text-[11px] text-slate-400 w-8 text-right">
                    {srv.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 4: Lead Stage Conversion Funnel (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Corong Peringkat Penukaran (Lead Funnel)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kadar pergerakan lead dari inkuiri baharu sehingga persetujuan projek
              </p>
            </div>
            {onNavigateToLeads && (
              <button
                type="button"
                onClick={onNavigateToLeads}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
              >
                <span>Urus Leads</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Funnel Progress Bars */}
          <div className="space-y-3 pt-1">
            {leadFunnel.map((stage) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-800">{stage.label}</span>
                    <span className="px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                      {stage.count}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-slate-500 text-[11px]">
                      RM {stage.value.toLocaleString('ms-MY')}
                    </span>
                    <span className="font-semibold font-mono text-slate-800 w-10 text-right">
                      {stage.percentage}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, stage.percentage)}%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600 flex items-start space-x-2.5 mt-3">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">Tip Penukaran: </span>
              Kadar pengesahan meningkat sebanyak 2.4x ganda apabila sebutharga dihantar dalam tempoh 24 jam selepas sesi discovery.
            </div>
          </div>
        </div>
      </div>

      {/* Visual 5: Detailed Monthly Analytics Data Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Jadual Prestasi Bulanan Lengkap</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data terperinci gabungan prospek, invois dikeluarkan, kutipan dana sebenar, dan kadar pertumbuhan
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Eksport CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3 rounded-l-xl">Bulan</th>
                <th className="py-2.5 px-3 text-center">Leads Masuk</th>
                <th className="py-2.5 px-3 text-center">Won Deals</th>
                <th className="py-2.5 px-3 text-center">Kadar Penukaran</th>
                <th className="py-2.5 px-3 text-right">Invois Dikeluarkan</th>
                <th className="py-2.5 px-3 text-right">Hasil Tunai Dikutip</th>
                <th className="py-2.5 px-3 text-right">Tertunggak</th>
                <th className="py-2.5 px-3 text-center rounded-r-xl">Pertumbuhan MoM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {monthlyData.length > 0 ? (
                monthlyData.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900">{row.monthLabel}</td>
                    <td className="py-3 px-3 text-center font-medium">{row.totalLeads}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {row.convertedLeads}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-bold font-mono text-cyan-800">
                      {row.conversionRate}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      RM {row.invoicedRevenue.toLocaleString('ms-MY')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                      RM {row.collectedRevenue.toLocaleString('ms-MY')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-600 font-medium">
                      {row.outstandingRevenue > 0
                        ? `RM ${row.outstandingRevenue.toLocaleString('ms-MY')}`
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          row.revenueGrowthRate >= 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {row.revenueGrowthRate > 0 ? '+' : ''}
                        {row.revenueGrowthRate}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tiada data dijumpai bagi kriteria tapisan semasa.
                  </td>
                </tr>
              )}
            </tbody>
            {monthlyData.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                  <td className="py-3 px-3 rounded-l-xl">Jumlah Keseluruhan</td>
                  <td className="py-3 px-3 text-center">{summaryMetrics.totalLeads}</td>
                  <td className="py-3 px-3 text-center text-emerald-700">
                    {summaryMetrics.totalConvertedLeads}
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-cyan-800">
                    {summaryMetrics.overallConversionRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono">
                    RM {summaryMetrics.totalRevenueInvoiced.toLocaleString('ms-MY')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-700">
                    RM {summaryMetrics.totalRevenueCollected.toLocaleString('ms-MY')}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600">
                    RM {summaryMetrics.totalOutstanding.toLocaleString('ms-MY')}
                  </td>
                  <td className="py-3 px-3 text-center rounded-r-xl">
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[11px]">
                      Purata: RM {summaryMetrics.averageMonthlyRevenue.toLocaleString('ms-MY')}/bln
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};
