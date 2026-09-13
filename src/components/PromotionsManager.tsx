import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Globe,
  Layers,
  GraduationCap,
  Briefcase,
  Share2,
  Megaphone,
  Palette,
  CheckCircle2,
  FileText,
  Scale,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  RotateCcw,
  Search,
  Cpu,
  Smartphone,
  ShieldCheck,
  Rocket,
  Database,
  Bot,
  Video,
  ShoppingBag,
  Server,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Link,
  DollarSign,
  Tag,
  ExternalLink,
  Receipt,
} from 'lucide-react';
import {
  ProvexaService,
  PROVEXA_SERVICES,
  ServiceMeta,
  Lead,
  PromotionOffer,
  DigitalProduct,
  DigitalProductCategory,
  DigitalDeliveryFormat,
} from '../types';
import { ServiceModal } from './ServiceModal';
import { DigitalProductModal } from './DigitalProductModal';

interface PromotionsManagerProps {
  services?: Record<string, ServiceMeta>;
  digitalProducts?: DigitalProduct[];
  promotions?: PromotionOffer[];
  leads?: Lead[];
  onSaveService?: (service: ServiceMeta) => void;
  onDeleteService?: (key: string) => void;
  onResetServices?: () => void;
  onSaveDigitalProduct?: (product: Omit<DigitalProduct, 'id' | 'tarikhDicipta'> & { id?: string }) => void;
  onDeleteDigitalProduct?: (id: string) => void;
  onSelectServiceForQuotation: (serviceKey: ProvexaService) => void;
  onSelectServiceForAgreement: (serviceKey: ProvexaService) => void;
  onSelectProductForQuotation?: (product: DigitalProduct) => void;
  onSelectProductForInvoice?: (product: DigitalProduct) => void;
  onOpenPosForProduct?: (product: DigitalProduct) => void;
  onNavigateToDigitalRetail?: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Layers,
  GraduationCap,
  Briefcase,
  Share2,
  Megaphone,
  Palette,
  Sparkles,
  Cpu,
  Smartphone,
  ShieldCheck,
  Rocket,
  Search,
  Database,
  Bot,
  Video,
  ShoppingBag,
  Server,
};

export const PromotionsManager: React.FC<PromotionsManagerProps> = ({
  services = PROVEXA_SERVICES,
  digitalProducts = [],
  onSaveService,
  onDeleteService,
  onResetServices,
  onSaveDigitalProduct,
  onDeleteDigitalProduct,
  onSelectServiceForQuotation,
  onSelectServiceForAgreement,
  onSelectProductForQuotation,
  onSelectProductForInvoice,
  onOpenPosForProduct,
  onNavigateToDigitalRetail,
}) => {
  // Main view tab: 'semua' | 'services' | 'digital'
  const [mainTab, setMainTab] = useState<'semua' | 'services' | 'digital'>('semua');

  // Service filter states
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedDigitalKey, setCopiedDigitalKey] = useState<string | null>(null);
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('semua');
  const [selectedDigitalCategory, setSelectedDigitalCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedDeliverables, setExpandedDeliverables] = useState<Record<string, boolean>>({});

  // Service Modal state
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceMeta | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceMeta | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Digital Product Modal state
  const [isDigitalModalOpen, setIsDigitalModalOpen] = useState(false);
  const [editingDigitalProduct, setEditingDigitalProduct] = useState<DigitalProduct | null>(null);
  const [digitalToDelete, setDigitalToDelete] = useState<DigitalProduct | null>(null);

  const servicesList = useMemo(() => {
    return Object.values(services);
  }, [services]);

  // Extract unique categories for service filter pills
  const serviceCategories = useMemo(() => {
    const set = new Set<string>();
    servicesList.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [servicesList]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return servicesList.filter((s) => {
      const matchCat = selectedServiceCategory === 'semua' || s.category === selectedServiceCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inTitle = s.title.toLowerCase().includes(q);
      const inTagline = s.tagline.toLowerCase().includes(q);
      const inShort = s.shortTitle.toLowerCase().includes(q);
      const deliverables = s.deliverables || [];
      const inDeliv = deliverables.some((d) => d.toLowerCase().includes(q));
      return inTitle || inTagline || inShort || inDeliv;
    });
  }, [servicesList, selectedServiceCategory, searchQuery]);

  // Filtered digital products
  const filteredDigitalProducts = useMemo(() => {
    return digitalProducts.filter((p) => {
      const matchCat = selectedDigitalCategory === 'semua' || p.kategori === selectedDigitalCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const inName = p.nama.toLowerCase().includes(q);
      const inSku = p.sku.toLowerCase().includes(q);
      const inDesc = (p.peneranganRingkas || '').toLowerCase().includes(q);
      const inFormat = (p.formatPenghantaran || '').toLowerCase().includes(q);
      return inName || inSku || inDesc || inFormat;
    });
  }, [digitalProducts, selectedDigitalCategory, searchQuery]);

  // Overall analytics metrics
  const totalDigitalSold = useMemo(() => {
    return digitalProducts.reduce((sum, p) => sum + (p.jumlahTerjual || 0), 0);
  }, [digitalProducts]);

  const totalDigitalEstRevenue = useMemo(() => {
    return digitalProducts.reduce((sum, p) => sum + ((p.jumlahTerjual || 0) * (p.hargaRuncit || 0)), 0);
  }, [digitalProducts]);

  const handleCopyServicePitch = async (srv: ServiceMeta) => {
    const deliverables = srv.deliverables || [];
    const text =
      `*Pakej Provexa Solution: ${srv.title}*\n\n` +
      `*Tagline:* ${srv.tagline}\n` +
      `*Harga:* Bermula RM ${srv.startingPrice.toLocaleString('ms-MY')} (${srv.priceModel})\n\n` +
      `*Serahan Utama:*\n` +
      deliverables.map((d) => `• ${d}`).join('\n') +
      `\n\nHubungi kami di Provexa Solution untuk rundingan atau sebutharga percuma!`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(srv.key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleCopyDigitalPitch = async (prod: DigitalProduct) => {
    const text =
      `*Produk Digital Provexa: ${prod.nama}* (${prod.sku})\n\n` +
      `*Kategori:* ${prod.kategori.toUpperCase()} | *Format:* ${prod.formatPenghantaran}\n` +
      `*Harga Tawaran:* RM ${prod.hargaRuncit}${prod.hargaAsal ? ` (Harga Asal: RM ${prod.hargaAsal})` : ''}\n\n` +
      `*Penerangan:*\n${prod.peneranganRingkas}\n\n` +
      `*Kelebihan & Ciri:* \n` +
      (prod.faedahUtama || []).map((f) => `• ${f}`).join('\n') +
      `\n\nDapatkan segera di Provexa Solution! Hubungi kami untuk sebutharga rasmi atau pembelian pantas.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedDigitalKey(prod.id);
      setTimeout(() => setCopiedDigitalKey(null), 2000);
    } catch {
      // ignore
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedDeliverables((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleOpenAddService = () => {
    setEditingService(null);
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceMeta) => {
    setEditingService(srv);
    setIsServiceModalOpen(true);
  };

  const handleOpenAddDigital = () => {
    setEditingDigitalProduct(null);
    setIsDigitalModalOpen(true);
  };

  const handleOpenEditDigital = (prod: DigitalProduct) => {
    setEditingDigitalProduct(prod);
    setIsDigitalModalOpen(true);
  };

  const handleConfirmDeleteService = () => {
    if (serviceToDelete && onDeleteService) {
      onDeleteService(serviceToDelete.key);
      setServiceToDelete(null);
    }
  };

  const handleConfirmDeleteDigital = () => {
    if (digitalToDelete && onDeleteDigitalProduct) {
      onDeleteDigitalProduct(digitalToDelete.id);
      setDigitalToDelete(null);
    }
  };

  const handleConfirmReset = () => {
    if (onResetServices) {
      onResetServices();
      setIsResetConfirmOpen(false);
    }
  };

  const getCategoryBadge = (cat: DigitalProductCategory) => {
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
        return { label: 'Produk Digital', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getFormatBadgeColor = (fmt: DigitalDeliveryFormat) => {
    switch (fmt) {
      case 'PDF':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'ZIP':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Notion':
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      case 'Canva':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Video':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-0.5">
            <span>Provexa Solution</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">Pengurusan Produk &amp; Servis Lengkap</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Katalog Produk &amp; Servis
            </h1>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {servicesList.length + digitalProducts.length} Tawaran Aktif
            </span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              <span>{digitalProducts.length} Digital</span>
            </span>
            <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{servicesList.length} Servis Agensi</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Sistem pengurusan berpusat yang diselaraskan secara langsung dengan Kaunter Jualan Retail (POS), Sebutharga &amp; Invois Rasmi, Perjanjian Projek, serta Eksport Google Sheets.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          {onNavigateToDigitalRetail && (
            <button
              type="button"
              onClick={onNavigateToDigitalRetail}
              className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Buka Kaunter Jualan Retail POS"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
              <span>Kaunter Retail POS</span>
            </button>
          )}

          {onResetServices && (
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center space-x-1.5 transition-colors shadow-2xs"
              title="Kembalikan kepada tetapan asal 8 servis"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Set Semula Asal</span>
            </button>
          )}

          {onSaveDigitalProduct && (
            <button
              type="button"
              onClick={handleOpenAddDigital}
              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Produk Digital</span>
            </button>
          )}

          {onSaveService && (
            <button
              type="button"
              onClick={handleOpenAddService}
              className="px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Servis Agensi</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setMainTab('semua')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
              mainTab === 'semua'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Semua Tawaran</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {servicesList.length + digitalProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('services')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
              mainTab === 'services'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Servis Agensi Provexa</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono">
              {servicesList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('digital')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
              mainTab === 'digital'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
            <span>Produk Digital (Retail &amp; Vault)</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">
              {digitalProducts.length}
            </span>
          </button>
        </div>

        {/* Mini KPI info */}
        <div className="hidden lg:flex items-center space-x-4 pr-3 text-xs text-slate-500">
          <div>
            Terjual Retail:{' '}
            <span className="font-bold text-slate-800">{totalDigitalSold} unit</span>
          </div>
          <div className="text-slate-300">|</div>
          <div>
            Anggaran Hasil:{' '}
            <span className="font-bold text-emerald-600">
              RM {totalDigitalEstRevenue.toLocaleString('ms-MY')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari mengikut nama produk, SKU, ciri atau servis..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Category Filter Pills depending on active tab */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {mainTab === 'digital' ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedDigitalCategory('semua')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedDigitalCategory === 'semua'
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                Semua Digital ({digitalProducts.length})
              </button>
              {[
                { id: 'ai_prompt', label: 'AI Prompts' },
                { id: 'template', label: 'Templates' },
                { id: 'ebook', label: 'E-Books' },
                { id: 'source_code', label: 'Source Codes' },
                { id: 'mini_course', label: 'Mini Courses' },
                { id: 'lisensi', label: 'Lesen' },
              ].map((c) => {
                const count = digitalProducts.filter((p) => p.kategori === c.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedDigitalCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedDigitalCategory === c.id
                        ? 'bg-blue-600 text-white shadow-2xs font-bold'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                    }`}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setSelectedServiceCategory('semua')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  selectedServiceCategory === 'semua'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                }`}
              >
                Semua Kategori Servis ({servicesList.length})
              </button>
              {serviceCategories.map((cat) => {
                const count = servicesList.filter((s) => s.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedServiceCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedServiceCategory === cat
                        ? 'bg-slate-900 text-white shadow-2xs font-bold'
                        : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: PRODUK DIGITAL (RETAIL & ASSET VAULT) */}
      {/* ========================================================= */}
      {(mainTab === 'semua' || mainTab === 'digital') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Produk Digital Provexa ({filteredDigitalProducts.length})
              </h2>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                • E-Books, Prompt Vault, Template &amp; Kod Sumber Siap Beli
              </span>
            </div>

            {onSaveDigitalProduct && (
              <button
                type="button"
                onClick={handleOpenAddDigital}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Daftar Produk Baru</span>
              </button>
            )}
          </div>

          {filteredDigitalProducts.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Tiada produk digital ditemui</h4>
              <p className="text-xs text-slate-400">
                Cuba sesuaikan carian anda atau daftar produk digital baharu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDigitalProducts.map((prod) => {
                const catBadge = getCategoryBadge(prod.kategori);
                const formatColor = getFormatBadgeColor(prod.formatPenghantaran);
                const isCopied = copiedDigitalKey === prod.id;

                return (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all p-5 flex flex-col justify-between space-y-4 text-xs group"
                  >
                    <div className="space-y-3">
                      {/* Top Bar: SKU, Category Badge & Action icons */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${catBadge.color}`}>
                            {catBadge.label}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${formatColor}`}>
                            {prod.formatPenghantaran}
                          </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center space-x-1">
                          {onSaveDigitalProduct && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditDigital(prod)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Kemaskini produk digital"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteDigitalProduct && (
                            <button
                              type="button"
                              onClick={() => setDigitalToDelete(prod)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Padam produk digital"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & SKU */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-700 transition-colors">
                            {prod.nama}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {prod.sku}
                          </span>
                          {prod.badgeLabel && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {prod.badgeLabel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {prod.peneranganRingkas}
                        </p>
                      </div>

                      {/* Price Strip */}
                      <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-blue-600 block font-medium">Harga Tawaran</span>
                          <div className="flex items-baseline space-x-1.5">
                            <span className="text-base font-extrabold text-blue-950">
                              RM {prod.hargaRuncit}
                            </span>
                            {prod.hargaAsal && (
                              <span className="text-[11px] text-slate-400 line-through">
                                RM {prod.hargaAsal}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Prestasi Jualan</span>
                          <span className="font-bold text-slate-800 text-xs">
                            {prod.jumlahTerjual || 0} Terjual
                          </span>
                        </div>
                      </div>

                      {/* Benefits checklist */}
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Ciri &amp; Kandungan:
                        </span>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {prod.faedahUtama.map((item, idx) => (
                            <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-700">
                              <Check className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" />
                              <span className="leading-tight">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons for Digital Product */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        {onSelectProductForQuotation && (
                          <button
                            type="button"
                            onClick={() => onSelectProductForQuotation(prod)}
                            className="py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 text-[11px] border border-indigo-200"
                            title="Jana Sebutharga untuk produk digital ini"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Sebutharga</span>
                          </button>
                        )}

                        {onSelectProductForInvoice && (
                          <button
                            type="button"
                            onClick={() => onSelectProductForInvoice(prod)}
                            className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg transition-colors flex items-center justify-center space-x-1 text-[11px] border border-blue-200"
                            title="Jana Invois rasmi untuk produk digital ini"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Invois</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onOpenPosForProduct && (
                          <button
                            type="button"
                            onClick={() => onOpenPosForProduct(prod)}
                            className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center space-x-1.5 text-[11px]"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Jual di POS</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleCopyDigitalPitch(prod)}
                          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center space-x-1 text-[11px]"
                          title="Salin maklumat produk untuk WhatsApp"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Disalin</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin</span>
                            </>
                          )}
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

      {/* ========================================================= */}
      {/* SECTION 2: SERVIS AGENSI PROVEXA (KONTRAK & SISTEM) */}
      {/* ========================================================= */}
      {(mainTab === 'semua' || mainTab === 'services') && (
        <div className="space-y-4 pt-6 border-t border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Pakej Servis Agensi Provexa ({filteredServices.length})
              </h2>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                • Pembangunan Laman Web, SaaS, Integrasi AI &amp; Khidmat Rundingan
              </span>
            </div>

            {onSaveService && (
              <button
                type="button"
                onClick={handleOpenAddService}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Servis Baru</span>
              </button>
            )}
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
              <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Tiada servis dijumpai</h4>
              <p className="text-xs text-slate-400">
                Cuba sesuaikan pilihan carian atau kategori di atas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredServices.map((srv) => {
                const Icon = (srv.iconName && ICON_MAP[srv.iconName]) || Globe;
                const isCopied = copiedKey === srv.key;
                const isExpanded = Boolean(expandedDeliverables[srv.key]);
                const badgeBg = srv.badgeBg || 'bg-indigo-50';
                const badgeColor = srv.badgeColor || 'text-indigo-700 border-indigo-200';

                return (
                  <div
                    key={srv.key}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4 text-xs group"
                  >
                    <div className="space-y-3">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center border border-slate-200/60 shadow-2xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeBg} ${badgeColor}`}
                            >
                              {srv.category}
                            </span>
                            {srv.isCustom && (
                              <span className="block text-[9px] font-medium text-emerald-600 mt-0.5">
                                Kustom
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Edit & Delete Controls */}
                        <div className="flex items-center space-x-1">
                          {onSaveService && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(srv)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Kemaskini maklumat & harga servis"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteService && (
                            <button
                              type="button"
                              onClick={() => setServiceToDelete(srv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Padam servis dari katalog"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Tagline */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-900 transition-colors">
                          {srv.title}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {srv.tagline}
                        </p>
                      </div>

                      {/* Price Model Card */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                          Kadar Permulaan
                        </span>
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-base font-extrabold text-slate-900">
                            RM {srv.startingPrice.toLocaleString('ms-MY')}
                          </span>
                          <span className="text-[11px] text-slate-500 font-normal">
                            ({srv.priceModel})
                          </span>
                        </div>
                      </div>

                      {/* Key Deliverables */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Serahan Utama:
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {(srv.deliverables || [])
                            .slice(0, isExpanded ? undefined : 3)
                            .map((item, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="leading-tight">{item}</span>
                              </li>
                            ))}
                        </ul>

                        {(srv.deliverables || []).length > 3 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(srv.key)}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 pt-0.5"
                          >
                            <span>
                              {isExpanded
                                ? 'Tunjuk Kurang'
                                : `+${(srv.deliverables || []).length - 3} lagi serahan`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectServiceForQuotation(srv.key as ProvexaService)}
                          className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1 text-[11px]"
                          title="Jana Sebutharga untuk servis ini"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Sebutharga</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onSelectServiceForAgreement(srv.key as ProvexaService)}
                          className="w-full py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-lg transition-colors flex items-center justify-center space-x-1 text-[11px]"
                          title="Jana Perjanjian untuk servis ini"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Perjanjian</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyServicePitch(srv)}
                        className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center space-x-1.5 text-[11px]"
                        title="Salin teks promosi ringkas ke papan keratan (clipboard)"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Disalin ke WhatsApp!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Teks WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Service Modal (Add/Edit) */}
      {isServiceModalOpen && onSaveService && (
        <ServiceModal
          isOpen={isServiceModalOpen}
          onClose={() => {
            setIsServiceModalOpen(false);
            setEditingService(null);
          }}
          onSave={(savedService) => {
            onSaveService(savedService);
            setIsServiceModalOpen(false);
            setEditingService(null);
          }}
          initialService={editingService}
          existingKeys={servicesList.map((s) => s.key)}
        />
      )}

      {/* Digital Product Modal (Add/Edit) */}
      {isDigitalModalOpen && onSaveDigitalProduct && (
        <DigitalProductModal
          isOpen={isDigitalModalOpen}
          onClose={() => {
            setIsDigitalModalOpen(false);
            setEditingDigitalProduct(null);
          }}
          onSave={(prodPayload) => {
            onSaveDigitalProduct(prodPayload);
            setIsDigitalModalOpen(false);
            setEditingDigitalProduct(null);
          }}
          initialProduct={editingDigitalProduct}
          onDelete={onDeleteDigitalProduct}
        />
      )}

      {/* Delete Service Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Padam Servis Dari Katalog
                  </h3>
                  <p className="text-xs text-slate-500">
                    {serviceToDelete.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Adakah anda pasti ingin memadam pakej servis{' '}
              <strong className="text-slate-900">{serviceToDelete.title}</strong>? Projek sedia ada tidak akan terjejas, tetapi servis ini tidak akan lagi muncul dalam katalog sebutharga dan cadangan.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteService}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam Servis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Digital Product Confirmation Modal */}
      {digitalToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Padam Produk Digital
                  </h3>
                  <p className="text-xs text-slate-500">
                    {digitalToDelete.nama} ({digitalToDelete.sku})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDigitalToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Adakah anda pasti ingin memadam produk digital{' '}
              <strong className="text-slate-900">{digitalToDelete.nama}</strong>? Produk ini akan dialih keluar daripada Katalog, Kaunter POS, dan borang Sebutharga/Invois.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDigitalToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteDigital}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam Produk Digital</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Set Semula Katalog Asal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kembalikan 8 Servis Utama Provexa
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tindakan ini akan menetapkan semula semua servis agensi, harga, dan ciri kepada konfigurasi asal (8 Servis Utama Provexa Solution). Sebarang servis kustom yang ditambah akan dipadam. Produk digital anda tidak akan terjejas.
            </p>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sahkan Set Semula</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
