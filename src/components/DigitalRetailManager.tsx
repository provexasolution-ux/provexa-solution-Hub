import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Send,
  Download,
  Copy,
  Edit,
  Trash2,
  QrCode,
  CreditCard,
  Wallet,
  Check,
  Receipt,
  BookOpen,
  Cpu,
  Share2,
  GraduationCap,
  FolderKanban,
  ExternalLink,
  DollarSign,
  X,
  Phone,
  Printer,
  Target,
  Users,
  UserPlus,
  Repeat,
  Sparkles,
} from 'lucide-react';
import {
  DigitalProduct,
  DigitalRetailOrder,
  DigitalProductCategory,
  DigitalDeliveryFormat,
  RetailPaymentMethod,
  RetailOrderStatus,
  RetailFulfillmentStatus,
  DigitalSalesTarget,
  DigitalRetailLead,
  DocType,
} from '../types';
import { DigitalProductModal } from './DigitalProductModal';
import { DigitalSalesTargetView } from './DigitalSalesTargetView';
import { DigitalLeadsView } from './DigitalLeadsView';

interface DigitalRetailManagerProps {
  products: DigitalProduct[];
  orders: DigitalRetailOrder[];
  digitalLeads?: DigitalRetailLead[];
  salesTarget?: DigitalSalesTarget;
  onSaveSalesTarget?: (target: DigitalSalesTarget, silent?: boolean) => void;
  onSaveProduct: (product: Omit<DigitalProduct, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'> & { id?: string }, silent?: boolean) => void;
  onDeleteProduct: (id: string) => void;
  onSaveOrder: (order: Omit<DigitalRetailOrder, 'id' | 'noResit' | 'tarikhPesanan'> & { id?: string }) => void;
  onUpdateOrderStatus: (orderId: string, statusBayaran: RetailOrderStatus, statusPenghantaran?: RetailFulfillmentStatus) => void;
  onDeleteOrder: (id: string) => void;
  onConvertToLead?: (order: DigitalRetailOrder) => void;
  onSaveDigitalLead?: (lead: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'> & { id?: string }) => void;
  onBulkSaveDigitalLeads?: (leads: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'>[]) => void;
  onDeleteDigitalLead?: (id: string) => void;
  onConvertDigitalLeadToAgencyLead?: (lead: DigitalRetailLead) => void;
  onGenerateDocForProduct?: (product: DigitalProduct, type?: DocType) => void;
  onGenerateDocForOrder?: (order: DigitalRetailOrder, type?: DocType) => void;
  onNavigateToPromotions?: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

type MainTab = 'katalog' | 'sasaran' | 'pesanan' | 'leads';

export const DigitalRetailManager: React.FC<DigitalRetailManagerProps> = ({
  products,
  orders,
  digitalLeads = [],
  salesTarget,
  onSaveSalesTarget,
  onSaveProduct,
  onDeleteProduct,
  onSaveOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onConvertToLead,
  onSaveDigitalLead,
  onBulkSaveDigitalLeads,
  onDeleteDigitalLead,
  onConvertDigitalLeadToAgencyLead,
  onGenerateDocForProduct,
  onGenerateDocForOrder,
  showToast,
}) => {
  // Navigation: 4 clear, focused tabs
  const [activeTab, setActiveTab] = useState<MainTab>('katalog');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('semua');

  // Product Add/Edit Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);

  // Quick Sale / POS Modal
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [selectedProductForSale, setSelectedProductForSale] = useState<DigitalProduct | null>(null);
  const [saleBuyerName, setSaleBuyerName] = useState('');
  const [saleBuyerPhone, setSaleBuyerPhone] = useState('');
  const [salePaymentMethod, setSalePaymentMethod] = useState<RetailPaymentMethod>('duitnow_qr');
  const [saleDiscount, setSaleDiscount] = useState<number>(0);
  const [saleAutoWhatsApp, setSaleAutoWhatsApp] = useState(true);

  // Receipt Modal
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<DigitalRetailOrder | null>(null);

  // Quick Target Modal for individual product
  const [quickTargetProduct, setQuickTargetProduct] = useState<DigitalProduct | null>(null);
  const [quickTargetInput, setQuickTargetInput] = useState<number>(50);

  // In-app Delete Confirmation Modals (prevents browser alert/confirm blocking in iframe)
  const [productToDelete, setProductToDelete] = useState<DigitalProduct | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<DigitalRetailOrder | null>(null);

  // Copy indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Helper to save per-product target from quick modal
  const handleSaveQuickTarget = (productId: string, newTargetUnit: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || newTargetUnit < 1) return;
    const newTargetRM = newTargetUnit * prod.hargaRuncit;
    const isSub = prod.modelJualan === 'langganan';

    const updatedProduct: DigitalProduct = {
      ...prod,
      targetUnit: newTargetUnit,
      targetRM: newTargetRM,
      targetSubscribers: isSub ? newTargetUnit : undefined,
      targetMRR: isSub ? newTargetRM : undefined,
    };
    onSaveProduct(updatedProduct, true);

    if (onSaveSalesTarget && salesTarget) {
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
      let totalRM = 0;
      let totalSubs = 0;
      products.forEach((p) => {
        if (p.id === productId) {
          totalRM += newTargetRM;
          if (p.modelJualan === 'langganan') totalSubs += newTargetUnit;
        } else {
          const tUnit = p.targetUnit || updatedTargetPerProd[p.id]?.targetUnit || 40;
          totalRM += tUnit * p.hargaRuncit;
          if (p.modelJualan === 'langganan') totalSubs += tUnit;
        }
      });

      onSaveSalesTarget({
        ...salesTarget,
        sasaranBulananRM: totalRM,
        sasaranSubscribers: totalSubs > 0 ? totalSubs : salesTarget.sasaranSubscribers,
        targetPerProduk: updatedTargetPerProd,
      }, true);
    }

    showToast(
      `Sasaran untuk "${prod.nama}" dikemaskini: ${newTargetUnit} ${isSub ? 'user' : 'unit'} (RM ${newTargetRM.toLocaleString('ms-MY')})`,
      'success'
    );
    setQuickTargetProduct(null);
  };

  // Calculated Metrics
  const metrics = useMemo(() => {
    const lunasOrders = orders.filter((o) => o.statusBayaran === 'lunas');
    const totalRevenue = lunasOrders.reduce((sum, o) => sum + (o.jumlahBayaran || 0), 0);
    const totalUnitsSold = lunasOrders.reduce((sum, o) => sum + (o.kuantiti || 1), 0);
    const pendingFulfillment = orders.filter(
      (o) => o.statusBayaran === 'lunas' && o.statusPenghantaran === 'belum_dihantar'
    ).length;

    return {
      totalRevenue,
      totalUnitsSold,
      pendingFulfillment,
      totalOrders: orders.length,
    };
  }, [orders]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.peneranganRingkas.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'semua' || p.kategori === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        o.namaPembeli.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.telefonPembeli.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.noResit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.namaProduk.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        orderStatusFilter === 'semua' ||
        o.statusBayaran === orderStatusFilter ||
        (orderStatusFilter === 'belum_dihantar' && o.statusPenghantaran === 'belum_dihantar');
      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, orderStatusFilter]);

  // Copy helper
  const handleCopy = (text: string, id: string, label = 'Pautan') => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast(`${label} disalin ke papan keratan!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp 1-Click Delivery
  const handleSendWhatsAppDelivery = (order: DigitalRetailOrder) => {
    const product = products.find((p) => p.id === order.produkId);
    let message = '';

    if (product?.mesejPenghantaranWhatsApp) {
      message = product.mesejPenghantaranWhatsApp;
    } else {
      message = `Salam ${order.namaPembeli},\n\nTerima kasih atas pembelian *${order.namaProduk}*!\n\nBerikut pautan akses fail digital anda:\n🔗 ${order.pautanAksesDiberi}\n\n${order.kunciLesenDiberi ? `🔑 Kod Lesen / Akses: *${order.kunciLesenDiberi}*\n\n` : ''}Hubungi kami sekiranya perlukan sebarang bantuan.\n- Provexa Solution`;
    }

    let phoneClean = order.telefonPembeli.replace(/[^0-9]/g, '');
    if (phoneClean.startsWith('0')) {
      phoneClean = '60' + phoneClean.slice(1);
    }

    const waUrl = `https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    if (order.statusPenghantaran === 'belum_dihantar') {
      onUpdateOrderStatus(order.id, order.statusBayaran, 'dihantar');
      showToast('Status penghantaran dikemaskini kepada "Dihantar".');
    }
  };

  // WhatsApp Share Product to Lead or Prospect
  const handleShareProductWhatsApp = (product: DigitalProduct) => {
    const text = `Salam, berminat dengan *${product.nama}* dari Provexa Solution?\n\n${product.peneranganRingkas}\n\nHarga: RM ${product.hargaRuncit} ${product.hargaAsal ? `(Harga Asal RM ${product.hargaAsal})` : ''}\nFormat: ${product.formatPenghantaran}\n\nAkses segera di sini:\n🔗 ${product.pautanMuatTurun}\n\nHubungi kami jika berminat!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Open Quick Sale Modal for specific product
  const handleOpenSaleForProduct = (product: DigitalProduct) => {
    setSelectedProductForSale(product);
    setSaleBuyerName('');
    setSaleBuyerPhone('');
    setSaleDiscount(0);
    setIsQuickSaleOpen(true);
  };

  // Process Quick Sale
  const handleProcessSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForSale) return;
    if (!saleBuyerName.trim() || !saleBuyerPhone.trim()) {
      showToast('Sila masukkan nama dan nombor WhatsApp pembeli.', 'error');
      return;
    }

    const calculatedTotal = Math.max(0, selectedProductForSale.hargaRuncit - saleDiscount);

    const newOrderData: Omit<DigitalRetailOrder, 'id' | 'noResit' | 'tarikhPesanan'> = {
      produkId: selectedProductForSale.id,
      skuProduk: selectedProductForSale.sku,
      namaProduk: selectedProductForSale.nama,
      kategoriProduk: selectedProductForSale.kategori,
      formatPenghantaran: selectedProductForSale.formatPenghantaran,
      hargaUnit: selectedProductForSale.hargaRuncit,
      kuantiti: 1,
      diskaun: saleDiscount,
      jumlahBayaran: calculatedTotal,
      namaPembeli: saleBuyerName.trim(),
      telefonPembeli: saleBuyerPhone.trim(),
      kaedahBayaran: salePaymentMethod,
      statusBayaran: 'lunas',
      statusPenghantaran: saleAutoWhatsApp ? 'dihantar' : 'belum_dihantar',
      tarikhPenghantaran: saleAutoWhatsApp ? new Date().toISOString() : undefined,
      pautanAksesDiberi: selectedProductForSale.pautanMuatTurun,
      kunciLesenDiberi: selectedProductForSale.kunciAksesAtauLesen,
      notaPesanan: 'Jualan pantas produk digital.',
    };

    onSaveOrder(newOrderData);

    if (saleAutoWhatsApp) {
      let phoneClean = saleBuyerPhone.replace(/[^0-9]/g, '');
      if (phoneClean.startsWith('0')) {
        phoneClean = '60' + phoneClean.slice(1);
      }
      const message = selectedProductForSale.mesejPenghantaranWhatsApp
        ? selectedProductForSale.mesejPenghantaranWhatsApp
        : `Hai ${saleBuyerName}, terima kasih atas pembelian *${selectedProductForSale.nama}*!\n\nPautan muat turun / akses anda:\n🔗 ${selectedProductForSale.pautanMuatTurun}\n\n- Provexa Solution`;
      window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(message)}`, '_blank');
    }

    showToast(`Jualan ${selectedProductForSale.nama} berjaya direkodkan!`);
    setIsQuickSaleOpen(false);
  };

  // Category badge & label formatter
  const getCategoryLabel = (cat: DigitalProductCategory, product?: DigitalProduct) => {
    // If BrandUp4U or SaaS subscription, categorize cleanly as Sistem SaaS
    if (product && (product.id === 'PRX-EBK-01' || product.sku.includes('BRANDUP4U') || (product.modelJualan === 'langganan' && cat === 'ebook'))) {
      return { label: 'Sistem SaaS', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }

    switch (cat) {
      case 'sistem':
        return { label: 'Sistem SaaS', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'ai_prompt':
        return { label: 'AI Prompt', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'template':
        return { label: 'Templat', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'ebook':
        return { label: 'E-Book', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'source_code':
        return { label: 'Source Code', color: 'bg-violet-50 text-violet-700 border-violet-200' };
      case 'mini_course':
        return { label: 'Video Kursus', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'lisensi':
        return { label: 'Lesen Perisian', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        if (product?.modelJualan === 'langganan') {
          return { label: 'Langganan SaaS', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
        }
        return { label: 'Produk Digital', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  // Helper to format clean, concise badge labels without line breaks
  const formatCleanBadge = (badge?: string) => {
    if (!badge) return '';
    if (badge.includes('Flagship') || badge.includes('Bulanan / Flagship')) return 'Flagship';
    if (badge.includes('Subscription Base') || badge.includes('Langganan AI')) return 'Langganan AI';
    if (badge.includes('Tinggi Permintaan')) return 'Best Seller';
    if (badge.includes('Edisi AI 2026')) return 'Edisi 2026';
    return badge;
  };

  const getFormatIcon = (fmt: DigitalDeliveryFormat) => {
    switch (fmt) {
      case 'PDF':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'ZIP':
      case 'Web Portal':
        return <Cpu className="w-3.5 h-3.5" />;
      case 'Canva':
      case 'Figma':
        return <Share2 className="w-3.5 h-3.5" />;
      case 'Video':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Notion':
      default:
        return <FolderKanban className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* ==================== CLEAN MINIMALIST HEADER ==================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Produk Digital
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Katalog produk sedia jual, pautan akses terus & rekod jualan pelanggan pantas.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-quick-sale"
              onClick={() => {
                setSelectedProductForSale(products[0] || null);
                setSaleBuyerName('');
                setSaleBuyerPhone('');
                setSaleDiscount(0);
                setIsQuickSaleOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5 text-slate-600" />
              <span>Rekod Jualan</span>
            </button>

            <button
              id="btn-add-product"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Produk</span>
            </button>
          </div>
        </div>

        {/* Minimalist Summary Strip */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Jumlah Produk</div>
              <div className="text-base font-bold text-slate-900">{products.length} Item</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Unit Terjual</div>
              <div className="text-base font-bold text-slate-900">{metrics.totalUnitsSold} Unit</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500">Hasil Jualan</div>
              <div className="text-base font-bold text-slate-900">
                RM {metrics.totalRevenue.toLocaleString('ms-MY')}
              </div>
            </div>
          </div>
        </div>

        {/* Streamlined Tabs Navigation */}
        <div className="flex items-center gap-1 mt-5 border-b border-slate-100 overflow-x-auto">
          <button
            id="tab-digital-katalog"
            onClick={() => setActiveTab('katalog')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'katalog'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>Katalog Produk</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px]">
              {products.length}
            </span>
          </button>

          <button
            id="tab-digital-sasaran"
            onClick={() => setActiveTab('sasaran')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'sasaran'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Sasaran Jualan (Per Produk)</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[10px] font-bold">
              Target
            </span>
          </button>

          <button
            id="tab-digital-pesanan"
            onClick={() => setActiveTab('pesanan')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'pesanan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Rekod Jualan &amp; Pesanan</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                {orders.length}
              </span>
            )}
            {metrics.pendingFulfillment > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold" title="Pesanan perlu hantar pautan">
                {metrics.pendingFulfillment}
              </span>
            )}
          </button>

          <button
            id="tab-digital-leads"
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'leads'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Prospek &amp; Leads</span>
            {digitalLeads.length > 0 && (
              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-full text-[10px]">
                {digitalLeads.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: KATALOG PRODUK (MINIMALIST) ==================== */}
      {activeTab === 'katalog' && (
        <div className="space-y-4">
          {/* Simple Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama produk digital atau kata kunci..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="semua">Semua Kategori</option>
              <option value="sistem">Sistem SaaS</option>
              <option value="ai_prompt">AI Prompt</option>
              <option value="template">Templat &amp; Kit</option>
              <option value="ebook">E-Book</option>
              <option value="source_code">Source Code</option>
              <option value="mini_course">Video Kursus</option>
              <option value="lisensi">Lesen Perisian</option>
            </select>
          </div>

          {/* Product Cards Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">Tiada Produk Dijumpai</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {products.length === 0
                  ? 'Belum ada produk digital didaftarkan. Klik butang Tambah Produk di atas.'
                  : 'Tiada produk sepadan dengan carian anda.'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="mt-3 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  + Tambah Produk Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const catBadge = getCategoryLabel(product.kategori, product);
                const cleanBadge = formatCleanBadge(product.badgeLabel);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-5">
                      {/* Top Badges & SKU */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-md border whitespace-nowrap leading-none shrink-0 ${catBadge.color}`}
                          >
                            {catBadge.label}
                          </span>

                          {cleanBadge && (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 whitespace-nowrap leading-none shrink-0">
                              {cleanBadge}
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono tracking-wide whitespace-nowrap shrink-0 ml-auto">
                          {product.sku}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {product.nama}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.peneranganRingkas}
                      </p>

                      {/* Price & Format */}
                      <div className="mt-3.5 flex items-baseline justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-slate-900">
                            RM {product.hargaRuncit}
                          </span>
                          {product.modelJualan === 'langganan' && (
                            <span className="text-xs text-slate-500">/bln</span>
                          )}
                          {product.hargaAsal && product.hargaAsal > product.hargaRuncit && (
                            <span className="text-xs text-slate-400 line-through">
                              RM {product.hargaAsal}
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {getFormatIcon(product.formatPenghantaran)}
                          <span>{product.formatPenghantaran}</span>
                        </span>
                      </div>

                      {/* Download Link Bar */}
                      <div className="mt-3 px-3 py-2 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                          <Download className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Akses Fail Digital</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(product.pautanMuatTurun, `link-${product.id}`, 'Pautan muat turun')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          title="Salin Pautan Muat Turun"
                        >
                          {copiedId === `link-${product.id}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Pautan</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Sasaran Jualan Khusus Produk Ini (Per-Product Target) */}
                      {(() => {
                        const isSub = product.modelJualan === 'langganan';
                        const targetUnit = product.targetUnit || (isSub ? 70 : 40);
                        const actualCount = isSub
                          ? Math.max(product.bilanganSubscribers || 0, product.jumlahTerjual || 0)
                          : (product.jumlahTerjual || 0);
                        const percent = Math.min(100, Math.round((actualCount / (targetUnit || 1)) * 100));
                        const shortfall = Math.max(0, targetUnit - actualCount);
                        const unitLabel = isSub ? 'user' : 'unit';

                        return (
                          <div className="mt-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/90">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-[11px]">
                                <Target className="w-3.5 h-3.5 text-blue-600" />
                                <span>Sasaran Jualan:</span>
                                <strong className="text-slate-900">{actualCount} / {targetUnit} {unitLabel}</strong>
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${percent >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                {percent}%
                              </span>
                            </div>

                            <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${percent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                              <span>
                                {shortfall > 0 ? (
                                  <span>Baki: <strong className="text-amber-800 font-semibold">+{shortfall} {unitLabel}</strong> (RM {(shortfall * product.hargaRuncit).toLocaleString('ms-MY')})</span>
                                ) : (
                                  <span className="text-emerald-700 font-bold">✓ Sasaran tercapai!</span>
                                )}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setQuickTargetProduct(product);
                                  setQuickTargetInput(targetUnit);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                <Target className="w-3 h-3" />
                                <span>Ubah Target</span>
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Minimalist Card Footer */}
                    <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="shrink-0">
                        {product.modelJualan === 'langganan' ? (
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                            Langganan SaaS
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                            Sekali Beli
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* WhatsApp Share */}
                        <button
                          type="button"
                          onClick={() => handleShareProductWhatsApp(product)}
                          className="p-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Kongsi info produk ke WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Invoice Generator */}
                        {onGenerateDocForProduct && (
                          <button
                            type="button"
                            onClick={() => onGenerateDocForProduct(product, 'invois')}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Jana Invois / Sebutharga"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setProductToDelete(product)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Padam Produk"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Quick Sell Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenSaleForProduct(product)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors ml-1 cursor-pointer"
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
      )}

      {/* ==================== TAB 2: REKOD JUALAN & PESANAN ==================== */}
      {activeTab === 'pesanan' && (
        <div className="space-y-4">
          {/* Orders Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama pembeli, nombor telefon, atau no resit..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="semua">Semua Status</option>
                <option value="lunas">Bayaran Lunas</option>
                <option value="menunggu">Menunggu Bayaran</option>
                <option value="belum_dihantar">Perlu Hantar Pautan</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSelectedProductForSale(products[0] || null);
                  setSaleBuyerName('');
                  setSaleBuyerPhone('');
                  setSaleDiscount(0);
                  setIsQuickSaleOpen(true);
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Rekod Jualan Baru</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">No. Resit / Tarikh</th>
                    <th className="py-3 px-4">Pembeli &amp; WhatsApp</th>
                    <th className="py-3 px-4">Produk Digital</th>
                    <th className="py-3 px-4">Kaedah</th>
                    <th className="py-3 px-4">Jumlah (RM)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                        Tiada rekod pesanan atau jualan dijumpai.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const isDelivered = order.statusPenghantaran === 'dihantar';
                      const isPaid = order.statusBayaran === 'lunas';

                      return (
                        <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-blue-700 block">
                              {order.noResit}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(order.tarikhPesanan).toLocaleDateString('ms-MY', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{order.namaPembeli}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{order.telefonPembeli}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 line-clamp-1">
                              {order.namaProduk}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {order.formatPenghantaran}
                            </span>
                          </td>

                          <td className="py-3 px-4 uppercase text-[11px] font-semibold text-slate-600">
                            {order.kaedahBayaran === 'duitnow_qr' ? 'DuitNow QR' : order.kaedahBayaran.replace('_', ' ')}
                          </td>

                          <td className="py-3 px-4 font-bold text-slate-900">
                            RM {order.jumlahBayaran}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${
                                  isPaid
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {isPaid ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                <span>{isPaid ? 'Lunas' : 'Menunggu'}</span>
                              </span>

                              <span
                                className={`text-[10px] font-medium px-1.5 py-0.2 rounded w-fit ${
                                  isDelivered
                                    ? 'bg-slate-100 text-slate-600'
                                    : 'bg-amber-100 text-amber-800 font-bold'
                                }`}
                              >
                                {isDelivered ? 'Dihantar' : 'Belum Hantar'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click WhatsApp Delivery */}
                              <button
                                type="button"
                                onClick={() => handleSendWhatsAppDelivery(order)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                  isDelivered
                                    ? 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                                    : 'text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs'
                                }`}
                                title="Hantar Pautan Akses ke WhatsApp Pembeli"
                              >
                                <Send className="w-3 h-3" />
                                <span>{isDelivered ? 'Hantar Semula' : 'Hantar Link'}</span>
                              </button>

                              {/* Official Doc Generator */}
                              {onGenerateDocForOrder && (
                                <button
                                  type="button"
                                  onClick={() => onGenerateDocForOrder(order, 'resit')}
                                  className="p-1.5 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors"
                                  title="Jana Resit / Invois Rasmi"
                                >
                                  <Receipt className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Simple Receipt Preview */}
                              <button
                                type="button"
                                onClick={() => setViewingReceiptOrder(order)}
                                className="p-1.5 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                title="Lihat Resit"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Order */}
                              <button
                                type="button"
                                onClick={() => setOrderToDelete(order)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Padam Rekod"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: SASARAN JUALAN (PER PRODUK) ==================== */}
      {activeTab === 'sasaran' && (
        <DigitalSalesTargetView
          products={products}
          orders={orders}
          digitalLeads={digitalLeads}
          salesTarget={
            salesTarget || {
              bulanTahun: '2026-03',
              sasaranBulananRM: 15000,
              sasaranBulananUnit: 220,
              sasaranSubscribers: 160,
              sasaranMRR: 11168,
              sasaranLeadsMasuk: 350,
              sasaranKadarConversion: 15,
              sasaranUserBaru: 52,
              sasaranNilaiConversionRM: 3848,
              tarikhDikemaskini: new Date().toISOString(),
              targetPerProduk: {},
            }
          }
          onSaveSalesTarget={(target, silent) => onSaveSalesTarget && onSaveSalesTarget(target, silent)}
          onSaveProduct={(prod, silent) => onSaveProduct && onSaveProduct(prod, silent)}
          onOpenPosForProduct={(prod) => handleOpenSaleForProduct(prod)}
          showToast={showToast}
        />
      )}

      {/* ==================== TAB 4: PROSPEK & LEADS DIGITAL ==================== */}
      {activeTab === 'leads' && (
        <DigitalLeadsView
          leads={digitalLeads}
          products={products}
          onSaveLead={onSaveDigitalLead || (() => {})}
          onBulkSaveLeads={onBulkSaveDigitalLeads || (() => {})}
          onDeleteLead={onDeleteDigitalLead || (() => {})}
          onConvertLeadToOrder={(lead) => {
            const matched = products.find((p) => p.id === lead.produkDiminatiId) || products[0];
            if (matched) setSelectedProductForSale(matched);
            setSaleBuyerName(lead.nama);
            setSaleBuyerPhone(lead.telefon);
            setIsQuickSaleOpen(true);
          }}
          onConvertLeadToAgencyLead={onConvertDigitalLeadToAgencyLead}
          showToast={showToast}
        />
      )}

      {/* ==================== PRODUCT MODAL (ADD / EDIT) ==================== */}
      {isProductModalOpen && (
        <DigitalProductModal
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={(prod) => {
            onSaveProduct(prod as any);
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          initialProduct={editingProduct}
          onDelete={onDeleteProduct}
        />
      )}

      {/* ==================== STREAMLINED QUICK SALE MODAL ==================== */}
      {isQuickSaleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rekod Jualan Pantas</h3>
                  <p className="text-[11px] text-slate-500">Daftar jualan &amp; hantar pautan akses terus ke WhatsApp.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickSaleOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessSale} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
              {/* Product Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Produk Digital</label>
                <select
                  value={selectedProductForSale?.id || ''}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setSelectedProductForSale(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-semibold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} — RM {p.hargaRuncit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Buyer Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Pembeli <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Ahmad Zaki"
                  value={saleBuyerName}
                  onChange={(e) => setSaleBuyerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Buyer WhatsApp */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nombor WhatsApp Pembeli <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="cth: 0123456789"
                  value={saleBuyerPhone}
                  onChange={(e) => setSaleBuyerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kaedah Bayaran</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'duitnow_qr', label: 'DuitNow QR', icon: QrCode },
                    { key: 'fpx', label: 'FPX Bank', icon: Wallet },
                    { key: 'tunai', label: 'Tunai/Kad', icon: CreditCard },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setSalePaymentMethod(m.key as RetailPaymentMethod)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 transition-all ${
                        salePaymentMethod === m.key
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <m.icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-slate-600 font-medium">Potongan Diskaun (RM):</span>
                <input
                  type="number"
                  min={0}
                  max={selectedProductForSale?.hargaRuncit || 999}
                  value={saleDiscount}
                  onChange={(e) => setSaleDiscount(Number(e.target.value) || 0)}
                  className="w-24 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold"
                />
              </div>

              {/* Auto WhatsApp Checkbox */}
              <label className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={saleAutoWhatsApp}
                  onChange={(e) => setSaleAutoWhatsApp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-[11px] font-medium text-emerald-900">
                  Buka WhatsApp untuk hantar link fail akses secara automatik
                </span>
              </label>

              </div>

              {/* Total & Submit - Pinned footer */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/80">
                <div>
                  <div className="text-[10px] text-slate-500">Jumlah Bayaran:</div>
                  <div className="text-base font-extrabold text-blue-700">
                    RM {Math.max(0, (selectedProductForSale?.hargaRuncit || 0) - saleDiscount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsQuickSaleOpen(false)}
                    className="px-3 py-2 text-slate-500 hover:bg-slate-200/60 rounded-xl font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan Jualan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== SIMPLE RECEIPT MODAL ==================== */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Resit Jualan Rasmi</span>
                <h3 className="text-base font-bold text-slate-900">{viewingReceiptOrder.noResit}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span>Tarikh:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(viewingReceiptOrder.tarikhPesanan).toLocaleDateString('ms-MY', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span>Nama Pembeli:</span>
                <span className="font-semibold text-slate-900">{viewingReceiptOrder.namaPembeli}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span>WhatsApp:</span>
                <span className="font-mono text-slate-900">{viewingReceiptOrder.telefonPembeli}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span>Produk Digital:</span>
                <span className="font-semibold text-slate-900">{viewingReceiptOrder.namaProduk}</span>
              </div>

              <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                <span>Kaedah Bayaran:</span>
                <span className="font-semibold uppercase">{viewingReceiptOrder.kaedahBayaran.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1">
                <span>Jumlah Lunas:</span>
                <span className="text-blue-700">RM {viewingReceiptOrder.jumlahBayaran}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-3 space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Pautan Akses:</div>
                <div className="text-[11px] font-mono text-blue-700 break-all">
                  {viewingReceiptOrder.pautanAksesDiberi}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => handleSendWhatsAppDelivery(viewingReceiptOrder)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Hantar ke WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== QUICK TARGET MODAL FOR INDIVIDUAL PRODUCT ==================== */}
      {quickTargetProduct && (
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
                    {quickTargetProduct.nama}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setQuickTargetProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sasaran {quickTargetProduct.modelJualan === 'langganan' ? 'Pengguna / Subscribers' : 'Unit Jualan'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={quickTargetInput}
                    onChange={(e) => setQuickTargetInput(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-base focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-400 font-semibold">
                    {quickTargetProduct.modelJualan === 'langganan' ? 'users' : 'unit'}
                  </span>
                </div>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Pilihan:</span>
                {[20, 50, 100, 150].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setQuickTargetInput(val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      quickTargetInput === val
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              {/* Estimated Expected Target Revenue */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Anggaran Hasil:</span>
                <span className="font-extrabold text-blue-900 text-sm">
                  RM {(quickTargetInput * quickTargetProduct.hargaRuncit).toLocaleString('ms-MY')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickTargetProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveQuickTarget(quickTargetProduct.id, quickTargetInput)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Sasaran
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== IN-APP CONFIRMATION MODAL: DELETE PRODUCT ==================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Padam Produk Digital?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adakah anda pasti ingin memadam <span className="font-bold text-slate-800">"{productToDelete.nama}"</span>?
              </p>
              <p className="text-[11px] text-rose-600 bg-rose-50/70 p-2 rounded-lg font-medium">
                Tindakan ini akan memadam produk secara kekal daripada katalog dan statistik.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Padam</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== IN-APP CONFIRMATION MODAL: DELETE ORDER ==================== */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h4 className="text-base font-bold text-slate-900">Padam Rekod Pesanan?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adakah anda pasti ingin memadam rekod pesanan <span className="font-bold text-slate-800 font-mono">{orderToDelete.noResit}</span> ({orderToDelete.namaPembeli})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Padam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
