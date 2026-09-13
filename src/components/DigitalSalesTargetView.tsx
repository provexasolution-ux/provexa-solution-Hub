import React, { useState, useMemo } from 'react';
import {
  Target,
  DollarSign,
  ShoppingBag,
  CreditCard,
  Copy,
  Check,
  Edit3,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid,
  Plus,
  Minus,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  DigitalProduct,
  DigitalRetailOrder,
  DigitalSalesTarget,
  DigitalRetailLead,
} from '../types';

interface DigitalSalesTargetViewProps {
  products: DigitalProduct[];
  orders: DigitalRetailOrder[];
  digitalLeads?: DigitalRetailLead[];
  salesTarget: DigitalSalesTarget;
  onSaveSalesTarget: (target: DigitalSalesTarget, silent?: boolean) => void;
  onSaveProduct?: (product: DigitalProduct, silent?: boolean) => void;
  onOpenPosForProduct: (product: DigitalProduct) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DigitalSalesTargetView: React.FC<DigitalSalesTargetViewProps> = ({
  products,
  orders,
  salesTarget,
  onSaveSalesTarget,
  onSaveProduct,
  onOpenPosForProduct,
  showToast,
}) => {
  // View mode: 'jadual' (table) or 'kad' (cards)
  const [viewMode, setViewMode] = useState<'jadual' | 'kad'>('jadual');

  // Filter for products
  const [productFilter, setProductFilter] = useState<'semua' | 'langganan' | 'one_off'>('semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isEditOverallOpen, setIsEditOverallOpen] = useState(false);
  const [editingTargetProduct, setEditingTargetProduct] = useState<DigitalProduct | null>(null);
  const [modalTargetUnit, setModalTargetUnit] = useState<number>(50);

  // Overall Edit Modal states
  const [tempBulanTahun, setTempBulanTahun] = useState(salesTarget.bulanTahun || '2026-03');
  const [tempSasaranRM, setTempSasaranRM] = useState(salesTarget.sasaranBulananRM || 15000);
  const [tempSasaranSubscribers, setTempSasaranSubscribers] = useState(
    salesTarget.sasaranSubscribers || 160
  );

  // Paid orders & revenue calculations
  const lunasOrders = useMemo(() => orders.filter((o) => o.statusBayaran === 'lunas'), [orders]);
  const actualTotalRevenue = useMemo(
    () => lunasOrders.reduce((sum, o) => sum + (o.jumlahBayaran || 0), 0),
    [lunasOrders]
  );
  const actualTotalUnits = useMemo(
    () => lunasOrders.reduce((sum, o) => sum + (o.kuantiti || 1), 0),
    [lunasOrders]
  );

  // Days in month calculation
  const now = new Date();
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(1, totalDaysInMonth - currentDay);

  // Per-product stats resolver
  const getProductStats = (product: DigitalProduct) => {
    const isSub = product.modelJualan === 'langganan';
    const prodOrders = lunasOrders.filter(
      (o) => o.produkId === product.id || o.skuProduk === product.sku
    );
    const unitsSold = prodOrders.reduce((sum, o) => sum + (o.kuantiti || 1), 0);
    const actualRevenue = prodOrders.reduce((sum, o) => sum + (o.jumlahBayaran || 0), 0);

    // Get per-product target from product object or fallback to salesTarget map
    const targetInfo = salesTarget.targetPerProduk?.[product.id];
    const targetUnit =
      product.targetUnit ||
      targetInfo?.targetUnit ||
      targetInfo?.targetSubscribers ||
      (isSub ? 70 : 40);

    const targetRM =
      product.targetRM ||
      targetInfo?.targetRM ||
      targetUnit * product.hargaRuncit;

    const currentCount = isSub
      ? Math.max(product.bilanganSubscribers || 0, unitsSold)
      : Math.max(product.jumlahTerjual || 0, unitsSold);

    const percent = Math.min(100, Math.round((currentCount / (targetUnit || 1)) * 100));
    const shortfall = Math.max(0, targetUnit - currentCount);
    const shortfallRM = shortfall * product.hargaRuncit;
    const isCompleted = shortfall === 0;

    return {
      isSub,
      targetUnit,
      targetRM,
      currentCount,
      actualRevenue,
      percent,
      shortfall,
      shortfallRM,
      isCompleted,
    };
  };

  // Aggregated targets from individual products
  const aggregatedStats = useMemo(() => {
    let totalTargetUnits = 0;
    let totalTargetRM = 0;
    let completedProducts = 0;

    products.forEach((p) => {
      const stats = getProductStats(p);
      totalTargetUnits += stats.targetUnit;
      totalTargetRM += stats.targetRM;
      if (stats.isCompleted) {
        completedProducts++;
      }
    });

    const targetRM = salesTarget.sasaranBulananRM || totalTargetRM || 15000;
    const percentRevenue = Math.min(100, Math.round((actualTotalRevenue / (targetRM || 1)) * 100));
    const percentUnits = Math.min(100, Math.round((actualTotalUnits / (totalTargetUnits || 1)) * 100));

    return {
      totalTargetUnits,
      totalTargetRM,
      targetRM,
      percentRevenue,
      percentUnits,
      completedProducts,
      shortfallRM: Math.max(0, targetRM - actualTotalRevenue),
      shortfallUnits: Math.max(0, totalTargetUnits - actualTotalUnits),
    };
  }, [products, lunasOrders, salesTarget, actualTotalRevenue, actualTotalUnits]);

  // Handle direct per-product target update (stepper or modal)
  const handleUpdateProductTarget = (productId: string, newTargetUnit: number) => {
    if (newTargetUnit < 1) return;
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newTargetRM = newTargetUnit * prod.hargaRuncit;
    const isSub = prod.modelJualan === 'langganan';

    // 1. Update product object silently to prevent double toast
    const updatedProd: DigitalProduct = {
      ...prod,
      targetUnit: newTargetUnit,
      targetRM: newTargetRM,
      targetSubscribers: isSub ? newTargetUnit : undefined,
      targetMRR: isSub ? newTargetRM : undefined,
    };
    if (onSaveProduct) {
      onSaveProduct(updatedProd, true);
    }

    // 2. Sync to salesTarget.targetPerProduk
    const updatedTargetPerProd = {
      ...(salesTarget.targetPerProduk || {}),
      [productId]: {
        targetUnit: newTargetUnit,
        targetRM: newTargetRM,
        targetSubscribers: isSub ? newTargetUnit : undefined,
        targetMRR: isSub ? newTargetRM : undefined,
        modelJualan: prod.modelJualan,
      },
    };

    // Recalculate total RM target
    let sumRM = 0;
    let sumSubs = 0;
    products.forEach((p) => {
      if (p.id === productId) {
        sumRM += newTargetRM;
        if (p.modelJualan === 'langganan') sumSubs += newTargetUnit;
      } else {
        const tUnit = p.targetUnit || updatedTargetPerProd[p.id]?.targetUnit || 40;
        sumRM += tUnit * p.hargaRuncit;
        if (p.modelJualan === 'langganan') sumSubs += tUnit;
      }
    });

    onSaveSalesTarget({
      ...salesTarget,
      sasaranBulananRM: sumRM,
      sasaranSubscribers: sumSubs > 0 ? sumSubs : salesTarget.sasaranSubscribers,
      targetPerProduk: updatedTargetPerProd,
    }, true);

    showToast(
      `Sasaran ${prod.nama} ditetapkan: ${newTargetUnit} ${isSub ? 'user' : 'unit'} (RM ${newTargetRM.toLocaleString('ms-MY')})`,
      'success'
    );
  };

  // Copy promo link
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Pautan promosi disalin ke papan keratan!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered product list for table/cards
  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      if (productFilter === 'langganan') return p.modelJualan === 'langganan';
      if (productFilter === 'one_off') return p.modelJualan !== 'langganan';
      return true;
    });
  }, [products, productFilter]);

  return (
    <div className="space-y-5">
      {/* ==================== 1. MINIMALIST OVERVIEW HEADER ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Sasaran Jualan Produk Digital
                </h2>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Target Berasingan Setiap Produk
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ubah sasaran unit atau pelanggan bagi setiap produk secara langsung dengan kalkulasi hasil automatik.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Bulan: <strong>{salesTarget.bulanTahun || '2026-03'}</strong> (Hari {currentDay}/{totalDaysInMonth})</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setTempBulanTahun(salesTarget.bulanTahun || '2026-03');
                setTempSasaranRM(aggregatedStats.targetRM);
                setTempSasaranSubscribers(salesTarget.sasaranSubscribers || 160);
                setIsEditOverallOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Ubah Sasaran Keseluruhan</span>
            </button>
          </div>
        </div>

        {/* Minimalist Key Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          {/* Card 1: Total Revenue Target */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                Jumlah Hasil Sasaran
              </span>
              <span className="font-bold text-blue-700 text-xs">{aggregatedStats.percentRevenue}%</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                RM {actualTotalRevenue.toLocaleString('ms-MY')}
              </span>
              <span className="text-xs text-slate-400">
                / RM {aggregatedStats.targetRM.toLocaleString('ms-MY')}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  aggregatedStats.percentRevenue >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${aggregatedStats.percentRevenue}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {aggregatedStats.shortfallRM === 0 ? (
                <span className="text-emerald-700 font-bold">✓ Sasaran Hasil Tercapai Penuh!</span>
              ) : (
                <span>Baki: <strong className="text-slate-800">RM {aggregatedStats.shortfallRM.toLocaleString('ms-MY')}</strong> ({remainingDays} hari baki)</span>
              )}
            </div>
          </div>

          {/* Card 2: Total Units / Subscribers Target */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
                Jumlah Unit / Users Sasaran
              </span>
              <span className="font-bold text-indigo-700 text-xs">{aggregatedStats.percentUnits}%</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                {actualTotalUnits} Unit
              </span>
              <span className="text-xs text-slate-400">
                / {aggregatedStats.totalTargetUnits} sasaran
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  aggregatedStats.percentUnits >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${aggregatedStats.percentUnits}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              {aggregatedStats.shortfallUnits === 0 ? (
                <span className="text-emerald-700 font-bold">✓ Sasaran Unit Lengkap!</span>
              ) : (
                <span>Baki: <strong className="text-indigo-700">+{aggregatedStats.shortfallUnits} unit</strong> lagi</span>
              )}
            </div>
          </div>

          {/* Card 3: Product Completion Rate */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Pencapaian Produk
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                {aggregatedStats.completedProducts} daripada {products.length} capai
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">
                {aggregatedStats.completedProducts} Produk
              </span>
              <span className="text-xs text-slate-400">
                / {products.length} jumlah produk
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((aggregatedStats.completedProducts / Math.max(1, products.length)) * 100)
                  )}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-2">
              Status: <strong className="text-slate-800">{products.length - aggregatedStats.completedProducts} produk</strong> masih dalam usaha sasaran
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. PER-PRODUCT TARGETS: LIST & CONTROLS ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        {/* Section Header with View Switcher & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Sasaran Terperinci Mengikut Setiap Produk
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Setiap produk digital mempunyai sasaran unit dan anggaran hasil berasingan. Ubah nilai secara terus di bawah.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
            {/* Filter by Model */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setProductFilter('semua')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  productFilter === 'semua'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({products.length})
              </button>
              <button
                type="button"
                onClick={() => setProductFilter('langganan')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  productFilter === 'langganan'
                    ? 'bg-white text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Langganan ({products.filter((p) => p.modelJualan === 'langganan').length})
              </button>
              <button
                type="button"
                onClick={() => setProductFilter('one_off')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  productFilter === 'one_off'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sekali Beli ({products.filter((p) => p.modelJualan !== 'langganan').length})
              </button>
            </div>

            {/* View Mode Toggle: Table vs Cards */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewMode('jadual')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'jadual'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Paparan Jadual"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Jadual</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kad')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'kad'
                    ? 'bg-white text-blue-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Paparan Kad"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kad</span>
              </button>
            </div>
          </div>
        </div>

        {/* ----------------- VIEW 1: INTERACTIVE TARGET TABLE ----------------- */}
        {viewMode === 'jadual' && (
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Produk Digital</th>
                  <th className="py-3 px-3">Model &amp; Harga</th>
                  <th className="py-3 px-3">Pencapaian Semasa</th>
                  <th className="py-3 px-3 min-w-[170px]">Sasaran (Unit/User)</th>
                  <th className="py-3 px-3">Anggaran Hasil Sasaran</th>
                  <th className="py-3 px-3 min-w-[160px]">Kemajuan</th>
                  <th className="py-3 px-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedProducts.map((product) => {
                  const stats = getProductStats(product);
                  const isSub = stats.isSub;
                  const unitLabel = isSub ? 'user' : 'unit';

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 line-clamp-1 max-w-[220px]">
                          {product.nama}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-mono">
                          <span>{product.sku}</span>
                          <span>•</span>
                          <span className="capitalize">{product.kategori.replace('_', ' ')}</span>
                        </div>
                      </td>

                      {/* Model & Price */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          RM {product.hargaRuncit}
                          {isSub && <span className="text-[10px] font-normal text-slate-500">/bln</span>}
                        </div>
                        <span
                          className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${
                            isSub
                              ? 'bg-indigo-50 text-indigo-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isSub ? 'Langganan SaaS' : 'Sekali Beli'}
                        </span>
                      </td>

                      {/* Actual Achievement */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {stats.currentCount} {unitLabel}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          RM {stats.actualRevenue.toLocaleString('ms-MY')}
                        </div>
                      </td>

                      {/* Interactive Target Stepper */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateProductTarget(product.id, Math.max(1, stats.targetUnit - 5))}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Kurang 5 unit"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingTargetProduct(product);
                              setModalTargetUnit(stats.targetUnit);
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-xs"
                            title="Klik untuk ubah sasaran"
                          >
                            {stats.targetUnit} {unitLabel}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateProductTarget(product.id, stats.targetUnit + 5)}
                            className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Tambah 5 unit"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Expected Target Revenue */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-extrabold text-blue-900">
                          RM {stats.targetRM.toLocaleString('ms-MY')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {stats.targetUnit} × RM{product.hargaRuncit}
                        </div>
                      </td>

                      {/* Progress Bar & Shortfall */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={`font-bold ${stats.isCompleted ? 'text-emerald-700' : 'text-blue-700'}`}>
                            {stats.percent}%
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {stats.isCompleted ? (
                              <span className="text-emerald-700 font-semibold">Tercapai!</span>
                            ) : (
                              <span>Baki: <strong>+{stats.shortfall}</strong></span>
                            )}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              stats.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${stats.percent}%` }}
                          />
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Set Target Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTargetProduct(product);
                              setModalTargetUnit(stats.targetUnit);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                            title="Ubah nilai sasaran produk"
                          >
                            Ubah
                          </button>

                          {/* Quick POS */}
                          <button
                            type="button"
                            onClick={() => onOpenPosForProduct(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-2xs cursor-pointer"
                            title="Buka POS Jualan"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Jual</span>
                          </button>

                          {/* Copy Promo Link */}
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                `🔥 Dapatkan ${product.nama}! ${product.peneranganRingkas} Harga: RM${product.hargaRuncit} 👉 ${product.pautanMuatTurun}`,
                                `promo-${product.id}`
                              )
                            }
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Salin pautan promosi"
                          >
                            {copiedId === `promo-${product.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ----------------- VIEW 2: PRODUCT CARDS ----------------- */}
        {viewMode === 'kad' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedProducts.map((product) => {
              const stats = getProductStats(product);
              const isSub = stats.isSub;
              const unitLabel = isSub ? 'user' : 'unit';

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-blue-300 p-4 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    {/* Top Bar: Model Badge & SKU */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isSub
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isSub ? 'Langganan SaaS' : 'Sekali Beli'}
                      </span>

                      <span className="text-[10px] text-slate-400 font-mono">
                        {product.sku}
                      </span>
                    </div>

                    {/* Title & Price */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                          {product.nama}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {product.peneranganRingkas}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-slate-900">
                          RM {product.hargaRuncit}
                          {isSub && <span className="text-[10px] text-slate-400 font-normal">/bln</span>}
                        </div>
                      </div>
                    </div>

                    {/* Dual Stats Grid: Actual vs Target */}
                    <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-50/90 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">
                          Pencapaian Semasa
                        </span>
                        <div className="mt-0.5 font-bold text-slate-900 flex items-baseline gap-1">
                          <span className="text-base text-blue-700">{stats.currentCount}</span>
                          <span className="text-slate-500 text-[11px]">{unitLabel}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Hasil: RM {stats.actualRevenue.toLocaleString('ms-MY')}
                        </span>
                      </div>

                      <div className="border-l border-slate-200/70 pl-3">
                        <span className="text-[10px] text-slate-500 block uppercase font-medium">
                          Sasaran Khusus
                        </span>
                        <div className="mt-0.5 font-bold text-slate-900 flex items-baseline gap-1">
                          <span className="text-base text-slate-900">{stats.targetUnit}</span>
                          <span className="text-slate-500 text-[11px]">{unitLabel}</span>
                        </div>
                        <span className="text-[10px] text-blue-600 font-medium">
                          Hasil: RM {stats.targetRM.toLocaleString('ms-MY')}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Shortfall */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-600 font-medium">Kemajuan:</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            stats.isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {stats.percent}% ({stats.currentCount}/{stats.targetUnit})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            stats.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] mt-1.5">
                        {stats.isCompleted ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sasaran Tercapai!
                          </span>
                        ) : (
                          <span className="text-amber-800 font-medium">
                            Baki: <strong>+{stats.shortfall} {unitLabel}</strong> (RM {stats.shortfallRM.toLocaleString('ms-MY')})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions: Stepper to adjust target + POS Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleUpdateProductTarget(product.id, Math.max(1, stats.targetUnit - 5))}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Kurangkan sasaran 5 unit"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTargetProduct(product);
                          setModalTargetUnit(stats.targetUnit);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        title="Klik untuk ubah nombor sasaran"
                      >
                        {stats.targetUnit} {unitLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProductTarget(product.id, stats.targetUnit + 5)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="Tambah sasaran 5 unit"
                      >
                        +5
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            `🔥 Dapatkan ${product.nama}! ${product.peneranganRingkas} Harga: RM${product.hargaRuncit} 👉 ${product.pautanMuatTurun}`,
                            `promo-${product.id}`
                          )
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Salin pautan promosi"
                      >
                        {copiedId === `promo-${product.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenPosForProduct(product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Jual</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ==================== 3. MODAL: UBAH SASARAN KHUSUS PRODUK ==================== */}
      {editingTargetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ubah Sasaran Produk</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {editingTargetProduct.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingTargetProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sasaran {editingTargetProduct.modelJualan === 'langganan' ? 'Pengguna / Subscribers' : 'Unit Jualan'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={modalTargetUnit}
                    onChange={(e) => setModalTargetUnit(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-base focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">
                    {editingTargetProduct.modelJualan === 'langganan' ? 'users' : 'unit'}
                  </span>
                </div>
              </div>

              {/* Quick adjustment buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Pilihan Cepat:</span>
                {[20, 50, 100, 150, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setModalTargetUnit(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      modalTargetUnit === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Calculated Expected Target Revenue */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Anggaran Hasil Sasaran:</span>
                <span className="font-extrabold text-blue-900 text-sm">
                  RM {(modalTargetUnit * editingTargetProduct.hargaRuncit).toLocaleString('ms-MY')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTargetProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateProductTarget(editingTargetProduct.id, modalTargetUnit);
                    setEditingTargetProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Sasaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 4. MODAL: UBAH SASARAN KESELURUHAN ==================== */}
      {isEditOverallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Ubah Sasaran Keseluruhan</h3>
                  <p className="text-[11px] text-slate-500">
                    Tetapkan bulan dan sasaran hasil bagi keseluruhan bisnes digital.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOverallOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveSalesTarget({
                  ...salesTarget,
                  bulanTahun: tempBulanTahun,
                  sasaranBulananRM: tempSasaranRM,
                  sasaranSubscribers: tempSasaranSubscribers,
                });
                showToast('Sasaran bulanan keseluruhan berjaya disimpan!', 'success');
                setIsEditOverallOpen(false);
              }}
              className="p-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bulan &amp; Tahun (YYYY-MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={tempBulanTahun}
                    onChange={(e) => setTempBulanTahun(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="2026-03"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sasaran Hasil RM
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">RM</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={tempSasaranRM}
                      onChange={(e) => setTempSasaranRM(parseInt(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sasaran Pengguna / Subscribers Keseluruhan
                </label>
                <input
                  type="number"
                  min="1"
                  value={tempSasaranSubscribers}
                  onChange={(e) => setTempSasaranSubscribers(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOverallOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
