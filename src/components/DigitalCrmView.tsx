import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  Send,
  Sparkles,
  Award,
  BookOpen,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  ArrowUpRight,
  UserPlus,
  MessageSquare,
  FileText,
  Clock,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { DigitalRetailOrder, DigitalProduct, Lead } from '../types';

interface DigitalCrmViewProps {
  orders: DigitalRetailOrder[];
  products: DigitalProduct[];
  onUpdateOrder: (order: Omit<DigitalRetailOrder, 'id' | 'noResit' | 'tarikhPesanan'> & { id?: string }) => void;
  onConvertToLead?: (order: DigitalRetailOrder) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const DigitalCrmView: React.FC<DigitalCrmViewProps> = ({
  orders,
  products,
  onUpdateOrder,
  onConvertToLead,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [productFilter, setProductFilter] = useState<string>('semua');

  // Modal states
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<DigitalRetailOrder | null>(null);
  const [selectedOrderForWhatsApp, setSelectedOrderForWhatsApp] = useState<DigitalRetailOrder | null>(null);
  const [whatsAppScriptType, setWhatsAppScriptType] = useState<'review' | 'cross_sell' | 'upsell_agency' | 'resend_link'>('review');

  // Copied state
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  // Aggregated Customer Profiles from orders
  const customerProfiles = useMemo(() => {
    // Group orders by buyer phone or buyer name
    const map = new Map<string, {
      key: string;
      nama: string;
      telefon: string;
      emel?: string;
      totalSpend: number;
      ordersCount: number;
      productsBought: string[];
      latestOrder: DigitalRetailOrder;
      crmStatus: 'baru' | 'repeat' | 'upsell_prospect' | 'vip';
      upsellInterest?: string;
      lastFollowUpDate?: string;
      followUpNotes?: string;
    }>();

    orders.forEach((o) => {
      const cleanPhone = o.telefonPembeli.replace(/\D/g, '') || o.namaPembeli.toLowerCase();
      const existing = map.get(cleanPhone);

      if (!existing) {
        map.set(cleanPhone, {
          key: cleanPhone,
          nama: o.namaPembeli,
          telefon: o.telefonPembeli,
          emel: o.emelPembeli,
          totalSpend: o.jumlahBayaran || 0,
          ordersCount: 1,
          productsBought: [o.namaProduk],
          latestOrder: o,
          crmStatus: o.crmStatus || 'baru',
          upsellInterest: o.upsellInterest || 'BrandUP4U (Kit Identiti & Branding RM1,600)',
          lastFollowUpDate: o.lastFollowUpDate,
          followUpNotes: o.followUpNotes,
        });
      } else {
        existing.totalSpend += o.jumlahBayaran || 0;
        existing.ordersCount += 1;
        if (!existing.productsBought.includes(o.namaProduk)) {
          existing.productsBought.push(o.namaProduk);
        }
        // If they bought more than once, automatically flag as repeat if not vip or upsell
        if (existing.ordersCount > 1 && existing.crmStatus === 'baru') {
          existing.crmStatus = 'repeat';
        }
        // Update latest order if newer
        if (new Date(o.tarikhPesanan) > new Date(existing.latestOrder.tarikhPesanan)) {
          existing.latestOrder = o;
          if (o.crmStatus) existing.crmStatus = o.crmStatus;
          if (o.upsellInterest) existing.upsellInterest = o.upsellInterest;
          if (o.lastFollowUpDate) existing.lastFollowUpDate = o.lastFollowUpDate;
          if (o.followUpNotes) existing.followUpNotes = o.followUpNotes;
        }
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // CRM Metric Stats
  const metrics = useMemo(() => {
    const totalCustomers = customerProfiles.length;
    const upsellProspects = customerProfiles.filter((c) => c.crmStatus === 'upsell_prospect').length;
    const repeatBuyers = customerProfiles.filter((c) => c.ordersCount > 1 || c.crmStatus === 'repeat').length;
    const vipCount = customerProfiles.filter((c) => c.crmStatus === 'vip').length;
    const totalRevenue = customerProfiles.reduce((sum, c) => sum + c.totalSpend, 0);
    const averageLtv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    return {
      totalCustomers,
      upsellProspects,
      repeatBuyers,
      vipCount,
      averageLtv,
    };
  }, [customerProfiles]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customerProfiles.filter((c) => {
      const matchesSearch =
        c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefon.includes(searchTerm) ||
        (c.emel && c.emel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.productsBought.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'semua' || c.crmStatus === statusFilter;
      const matchesProduct =
        productFilter === 'semua' ||
        c.productsBought.some((p) => p.toLowerCase().includes(productFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [customerProfiles, searchTerm, statusFilter, productFilter]);

  // WhatsApp Scripts Generator
  const generateWhatsAppScript = (
    customer: typeof customerProfiles[0],
    type: 'review' | 'cross_sell' | 'upsell_agency' | 'resend_link'
  ) => {
    const firstName = customer.nama.split(' ')[0] || customer.nama;
    const boughtProduct = customer.productsBought[0] || 'E-Book Provexa';

    switch (type) {
      case 'review':
        return `Salam ${firstName}! 👋\n\nSaya dari tim Provexa Solution. Harap anda sihat! Sekadar ingin bertanya khabar tentang bacaan anda untuk *${boughtProduct}*.\n\nAdakah anda sudah mencuba salah satu formula atau skrip di dalamnya? Jika ada sebarang persoalan atau maklum balas, kongsikan saja di sini. Kami sedia membantu! ✨`;

      case 'cross_sell':
        return `Salam ${firstName}! 🎁\n\nTerima kasih kerana terus menyokong siri panduan digital Provexa. Sebagai pembeli setia *${boughtProduct}*, kami ingin berikan diskaun istimewa *30%* untuk melengkapkan kemahiran anda dengan *E-Book Closing Mastery WhatsApp* atau *AI Ads Blueprint*.\n\nGunakan kupon khas: *VIP30* di https://provexasolution.com/retail-digital\n\nTawaran sah minggu ini sahaja ya!`;

      case 'upsell_agency':
        return `Salam ${firstName}! 🚀\n\nSaya perhatikan anda komited mengembangkan bisnes melalui pembacaan *${boughtProduct}*. Jika pihak anda atau syarikat tidak mempunyai masa untuk membina strategi konten, iklan berbayar (Meta & TikTok), atau sistem laman web sendiri, tim pakar Provexa Solution sedia menguruskannya untuk anda secara menyeluruh.\n\nBoleh kami aturkan sesi santai 15 minit bersama konsultan strategi kami untuk berkongsi pelan pertumbuhan syarikat anda?`;

      case 'resend_link':
        return `Salam ${firstName}! 🔑\n\nBerikut kami hantarkan semula pautan rasmi muat turun untuk *${boughtProduct}*:\n🔗 ${customer.latestOrder.pautanAksesDiberi || 'https://provexasolution.com/downloads'}\n\nKod Akses Lesen anda: *${customer.latestOrder.kunciLesenDiberi || 'PRX-VIP-2026'}*.\n\nSila simpan mesej ini untuk rujukan anda. Terima kasih!`;
    }
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    showToast(`Nombor telefon ${phone} telah disalin!`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const handleExportBroadcastPhones = () => {
    const phoneList = filteredCustomers
      .map((c) => c.telefon.replace(/\D/g, ''))
      .filter((p) => p.length >= 8)
      .join('\n');

    navigator.clipboard.writeText(phoneList);
    showToast(`${filteredCustomers.length} nombor telefon telah disalin untuk kempen WhatsApp Broadcast!`);
  };

  const handleSaveCustomerCrm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForEdit) return;

    onUpdateOrder(selectedOrderForEdit);
    showToast(`Maklumat CRM pelanggan ${selectedOrderForEdit.namaPembeli} berjaya dikemaskini!`);
    setSelectedOrderForEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* ==================== HEADER & TOP METRICS ==================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              CRM Pelanggan Produk Digital & Follow-Up E-Book
            </h2>
            <p className="text-xs text-slate-500">
              Urus perhubungan pembeli, saluran upsell servis korporat Provexa, dan kempen retargeting WhatsApp.
            </p>
          </div>
        </div>

        <button
          onClick={handleExportBroadcastPhones}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
        >
          <Copy className="w-3.5 h-3.5" />
          Salin Nombor Broadcast ({filteredCustomers.length})
        </button>
      </div>

      {/* 4 CRM Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Jumlah Pembeli Unik</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.totalCustomers}</span>
            <span className="text-xs text-slate-400 font-medium">orang</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            Purata LTV: <span className="font-bold text-slate-800">RM {Math.round(metrics.averageLtv)}</span> / pelanggan
          </p>
        </div>

        <div className="bg-white rounded-xl border border-purple-200/80 bg-purple-50/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700">Prospek Upsell Servis</span>
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-900">{metrics.upsellProspects}</span>
            <span className="text-xs text-purple-600 font-medium">berpotensi tinggi</span>
          </div>
          <p className="text-[11px] text-purple-700 mt-2 border-t border-purple-100 pt-2 font-medium">
            Sasaran untuk pakej Branding Kit & Ads Provexa
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pembeli Berulang (Repeat)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.repeatBuyers}</span>
            <span className="text-xs text-slate-400 font-medium">pelanggan</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 border-t border-slate-100 pt-2 font-semibold">
            Tinggi kepercayaan jenama Provexa
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pelanggan VIP</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-md">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{metrics.vipCount}</span>
            <span className="text-xs text-slate-400 font-medium">rakan niaga / VIP</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-2">
            Beri diskaun & akses awal produk baharu
          </p>
        </div>
      </div>

      {/* ==================== SEARCH & FILTERS ==================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama pembeli, telefon, emel, atau tajuk e-book..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Status CRM</option>
            <option value="baru">Pembeli Baru</option>
            <option value="repeat">Pembeli Berulang</option>
            <option value="upsell_prospect">⭐ Prospek Upsell Servis</option>
            <option value="vip">Pelanggan VIP</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Produk Digital</option>
            {products.map((p) => (
              <option key={p.id} value={p.nama}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==================== CUSTOMERS CRM TABLE / LIST ==================== */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Tiada Rekod Pelanggan CRM</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tiada pelanggan yang sepadan dengan carian atau penapis anda pada masa ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Pelanggan & Hubungan</th>
                  <th className="py-3 px-4">Produk Dibeli & Nilai</th>
                  <th className="py-3 px-4">Status CRM Kitaran Hayat</th>
                  <th className="py-3 px-4">Peluang Upsell Servis Provexa</th>
                  <th className="py-3 px-4">Nota / Tindakan Terakhir</th>
                  <th className="py-3 px-4 text-right">Tindakan Pantas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredCustomers.map((c) => {
                  const cleanPhone = c.telefon.replace(/\D/g, '');
                  const waNumber = cleanPhone.startsWith('60')
                    ? cleanPhone
                    : cleanPhone.startsWith('0')
                    ? `6${cleanPhone}`
                    : `60${cleanPhone}`;

                  return (
                    <tr key={c.key} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: Customer info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{c.nama}</div>
                        <div className="flex items-center gap-2 mt-1 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.telefon}
                          </span>
                          <button
                            onClick={() => handleCopyPhone(c.telefon, c.key)}
                            title="Salin nombor"
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {copiedPhoneId === c.key ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {c.emel && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {c.emel}
                          </div>
                        )}
                      </td>

                      {/* Column 2: Products & Spend */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {c.productsBought.map((pName, idx) => (
                            <span
                              key={idx}
                              className="inline-block text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 mr-1 truncate max-w-[200px]"
                            >
                              {pName}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1.5 text-[11px] font-semibold text-slate-900">
                          Jumlah: RM {c.totalSpend.toLocaleString()} ({c.ordersCount} pesanan)
                        </div>
                      </td>

                      {/* Column 3: CRM Status Badge */}
                      <td className="py-3.5 px-4">
                        {c.crmStatus === 'upsell_prospect' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            <Sparkles className="w-3 h-3" />
                            Prospek Upsell Servis
                          </span>
                        ) : c.crmStatus === 'repeat' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <TrendingUp className="w-3 h-3" />
                            Pembeli Berulang
                          </span>
                        ) : c.crmStatus === 'vip' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Award className="w-3 h-3" />
                            Pelanggan VIP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                            Pembeli Baru
                          </span>
                        )}
                      </td>

                      {/* Column 4: Upsell Interest */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-[190px]">
                          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 block truncate">
                            {c.upsellInterest || 'BrandUP4U (Kit Branding RM1,600)'}
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Servis agensi Provexa disyorkan
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Notes & Follow up */}
                      <td className="py-3.5 px-4">
                        <p className="text-[11px] text-slate-600 max-w-[180px] line-clamp-2 italic">
                          {c.followUpNotes || c.latestOrder.notaPesanan || 'Tiada nota susulan khusus.'}
                        </p>
                        {c.lastFollowUpDate && (
                          <span className="text-[10px] text-slate-400 mt-0.5 block">
                            Follow-up: {new Date(c.lastFollowUpDate).toLocaleDateString('ms-MY')}
                          </span>
                        )}
                      </td>

                      {/* Column 6: Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Open WhatsApp Script Hub */}
                          <button
                            onClick={() => {
                              setSelectedOrderForWhatsApp(c.latestOrder);
                              setWhatsAppScriptType('review');
                            }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                            title="Hantar WhatsApp Pintar"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </button>

                          {/* Edit CRM & Follow-up Details */}
                          <button
                            onClick={() => setSelectedOrderForEdit(c.latestOrder)}
                            className="p-1 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded transition-colors"
                            title="Kemaskini Status CRM & Catatan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Convert directly to main Lead */}
                          {onConvertToLead && (
                            <button
                              onClick={() => {
                                onConvertToLead(c.latestOrder);
                                showToast(`Pelanggan "${c.nama}" berjaya dipindahkan ke Saluran Leads Utama Provexa!`);
                              }}
                              className="p-1 text-slate-500 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 rounded transition-colors"
                              title="Tukar menjadi Lead Agensi Utama"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==================== MODAL: WHATSAPP SMART SCRIPTS ==================== */}
      {selectedOrderForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  Templat WhatsApp Follow-Up CRM
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih templat skrip untuk: <span className="font-bold text-slate-800">{selectedOrderForWhatsApp.namaPembeli}</span> ({selectedOrderForWhatsApp.telefonPembeli})
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForWhatsApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Script Types Selector */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setWhatsAppScriptType('review')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  whatsAppScriptType === 'review'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Minta Review / Testimoni</span>
              </button>

              <button
                type="button"
                onClick={() => setWhatsAppScriptType('cross_sell')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  whatsAppScriptType === 'cross_sell'
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-4 h-4 text-blue-600" />
                <span>Tawaran E-Book Ke-2</span>
              </button>

              <button
                type="button"
                onClick={() => setWhatsAppScriptType('upsell_agency')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  whatsAppScriptType === 'upsell_agency'
                    ? 'bg-purple-50 border-purple-300 text-purple-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Pitching Servis Agensi</span>
              </button>

              <button
                type="button"
                onClick={() => setWhatsAppScriptType('resend_link')}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 ${
                  whatsAppScriptType === 'resend_link'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Hantar Semula Link/Lesen</span>
              </button>
            </div>

            {/* Generated Script Box */}
            {(() => {
              const customerMatch = customerProfiles.find(
                (c) => c.key === (selectedOrderForWhatsApp.telefonPembeli.replace(/\D/g, '') || selectedOrderForWhatsApp.namaPembeli.toLowerCase())
              ) || {
                key: 'temp',
                nama: selectedOrderForWhatsApp.namaPembeli,
                telefon: selectedOrderForWhatsApp.telefonPembeli,
                totalSpend: selectedOrderForWhatsApp.jumlahBayaran,
                ordersCount: 1,
                productsBought: [selectedOrderForWhatsApp.namaProduk],
                latestOrder: selectedOrderForWhatsApp,
                crmStatus: 'baru' as const,
              };

              const scriptText = generateWhatsAppScript(customerMatch, whatsAppScriptType);
              const cleanPhone = selectedOrderForWhatsApp.telefonPembeli.replace(/\D/g, '');
              const waNumber = cleanPhone.startsWith('60')
                ? cleanPhone
                : cleanPhone.startsWith('0')
                ? `6${cleanPhone}`
                : `60${cleanPhone}`;
              const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(scriptText)}`;

              return (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {scriptText}
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scriptText);
                        setCopiedScript(true);
                        showToast('Skrip WhatsApp telah disalin ke clipboard!');
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedScript ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Salin Teks</span>
                    </button>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Buka WhatsApp Sekarang
                    </a>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT CUSTOMER CRM DETAILS ==================== */}
      {selectedOrderForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  Kemaskini CRM: {selectedOrderForEdit.namaPembeli}
                </h3>
                <p className="text-xs text-slate-500">
                  Sesuaikan tahap kitaran hayat pembeli dan peluang tawaran servis Provexa.
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomerCrm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Kitaran Hayat CRM
                </label>
                <select
                  value={selectedOrderForEdit.crmStatus || 'baru'}
                  onChange={(e) =>
                    setSelectedOrderForEdit({
                      ...selectedOrderForEdit,
                      crmStatus: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="baru">Pembeli Baru (First-Time Buyer)</option>
                  <option value="repeat">Pembeli Berulang (Repeat Buyer)</option>
                  <option value="upsell_prospect">⭐ Prospek Upsell Servis Provexa</option>
                  <option value="vip">Pelanggan VIP / Rakan Niaga</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peluang Servis Provexa Yang Sesuai Di-Upsell
                </label>
                <select
                  value={selectedOrderForEdit.upsellInterest || 'BrandUP4U (Kit Identiti & Branding RM1,600)'}
                  onChange={(e) =>
                    setSelectedOrderForEdit({
                      ...selectedOrderForEdit,
                      upsellInterest: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="BrandUP4U (Kit Identiti & Branding RM1,600)">
                    BrandUP4U (Kit Identiti & Branding Korporat RM1,600)
                  </option>
                  <option value="Pengurusan Kempen Paid Ads Bulanan (RM1,500/bln)">
                    Pengurusan Kempen Paid Ads Bulanan (RM1,500/bln)
                  </option>
                  <option value="Portal E-Commerce / Website Jualan Automatik (RM4,800)">
                    Portal E-Commerce / Website Jualan Automatik (RM4,800)
                  </option>
                  <option value="Pakej Pengurusan Media Sosial Retainer (RM1,200/bln)">
                    Pakej Pengurusan Media Sosial Retainer (RM1,200/bln)
                  </option>
                  <option value="Konsultasi Strategi Digital 1-on-1 (RM500/sesi)">
                    Konsultasi Strategi Digital 1-on-1 (RM500/sesi)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota Susulan / Interaksi Pelanggan
                </label>
                <textarea
                  value={selectedOrderForEdit.followUpNotes || ''}
                  onChange={(e) =>
                    setSelectedOrderForEdit({
                      ...selectedOrderForEdit,
                      followUpNotes: e.target.value,
                      lastFollowUpDate: new Date().toISOString(),
                    })
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Sangat suka bab hook copywriting. Beliau berminat sebutharga reka logo jenama baharu."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForEdit(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Simpan Kemas Kini
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
