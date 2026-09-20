import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Send,
  Sparkles,
  ShoppingBag,
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
  Trash2,
  X,
  CreditCard,
  AlertCircle,
  BookOpen,
  Upload,
  Download,
} from 'lucide-react';
import {
  DigitalRetailLead,
  DigitalProduct,
  DigitalLeadStatus,
  DigitalLeadSource,
} from '../types';

interface DigitalLeadsViewProps {
  leads: DigitalRetailLead[];
  products: DigitalProduct[];
  onSaveLead: (lead: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'> & { id?: string }) => void;
  onBulkSaveLeads: (leads: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'>[]) => void;
  onDeleteLead: (id: string) => void;
  onConvertLeadToOrder: (lead: DigitalRetailLead) => void;
  onConvertLeadToAgencyLead?: (lead: DigitalRetailLead) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const STATUS_CONFIG: Record<
  DigitalLeadStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  baru: {
    label: 'Inkuiri Baharu',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  dihubungi: {
    label: 'Telah Dihubungi',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
  },
  tanya_harga: {
    label: 'Minta Kombo / Diskaun',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  tunggu_bayaran: {
    label: 'Tunggu Bayaran (QR/FPX)',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  berjaya: {
    label: 'Berjaya (Jadi Pesanan)',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  batal: {
    label: 'Batal / KIV',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
};

const SOURCE_LABELS: Record<DigitalLeadSource, string> = {
  whatsapp: 'WhatsApp Direct',
  borang_web: 'Borang Web / Etalase',
  iklan_tiktok: 'Iklan TikTok',
  iklan_meta: 'Iklan Meta (FB/IG)',
  lead_magnet: 'Muat Turun Bab Percuma',
  kaunter_pos: 'Pertanyaan Kaunter POS',
  rujukan: 'Rujukan Rakan',
  lain_lain: 'Lain-lain',
};

export const DigitalLeadsView: React.FC<DigitalLeadsViewProps> = ({
  leads,
  products,
  onSaveLead,
  onBulkSaveLeads,
  onDeleteLead,
  onConvertLeadToOrder,
  onConvertLeadToAgencyLead,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [productFilter, setProductFilter] = useState<string>('semua');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<DigitalRetailLead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<DigitalRetailLead | null>(null);

  // WhatsApp Dialog
  const [selectedLeadForWhatsApp, setSelectedLeadForWhatsApp] = useState<DigitalRetailLead | null>(null);
  const [scriptType, setScriptType] = useState<
    'salam_produk' | 'tawaran_diskaun' | 'peringatan_qr' | 'bab_percuma'
  >('salam_produk');
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formTelefon, setFormTelefon] = useState('');
  const [formEmel, setFormEmel] = useState('');
  const [formProdukId, setFormProdukId] = useState('');
  const [formNamaProduk, setFormNamaProduk] = useState('');
  const [formAnggaranNilai, setFormAnggaranNilai] = useState(69);
  const [formStatus, setFormStatus] = useState<DigitalLeadStatus>('baru');
  const [formSumber, setFormSumber] = useState<DigitalLeadSource>('whatsapp');
  const [formKeutamaan, setFormKeutamaan] = useState<'rendah' | 'sederhana' | 'tinggi'>('tinggi');
  const [formNota, setFormNota] = useState('');

  // CSV Import State
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvError, setCsvError] = useState('');
  const [csvPreview, setCsvPreview] = useState<Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'>[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseUserCsv = (text: string): Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'>[] => {
    const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) throw new Error('CSV mesti ada baris header dan sekurang-kurangnya 1 baris data.');
    const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
    const fullNameIdx = header.indexOf('full_name');
    const emailIdx = header.indexOf('email');
    const phoneIdx = header.indexOf('phone');
    const usernameIdx = header.indexOf('username');
    const statusIdx = header.indexOf('status');
    const loginCountIdx = header.indexOf('login_count');

    if (fullNameIdx === -1 || phoneIdx === -1) {
      throw new Error('CSV mesti mempunyai lajur "Full Name" dan "Phone".');
    }

    const defaultProduct = products[0];
    const parsed: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      const namaVal = cols[fullNameIdx]?.trim();
      const phoneVal = cols[phoneIdx]?.trim();
      if (!namaVal || !phoneVal || phoneVal.toLowerCase() === 'test') continue;

      const loginCount = loginCountIdx >= 0 ? parseInt(cols[loginCountIdx] || '0', 10) : 0;
      const statusVal = statusIdx >= 0 ? cols[statusIdx]?.trim().toLowerCase() : '';

      parsed.push({
        nama: namaVal,
        telefon: phoneVal,
        emel: emailIdx >= 0 ? cols[emailIdx]?.trim() || undefined : undefined,
        produkDiminatiId: defaultProduct?.id,
        namaProdukDiminati: defaultProduct?.nama || 'E-Book Provexa',
        anggaranNilai: defaultProduct?.hargaRuncit || 69,
        status: 'baru',
        sumber: 'lead_magnet',
        keutamaan: loginCount > 5 ? 'tinggi' : loginCount > 1 ? 'sederhana' : 'rendah',
        nota: usernameIdx >= 0 && cols[usernameIdx]?.trim()
          ? `Diimport dari senarai pengguna. Username: ${cols[usernameIdx].trim()}. Login: ${loginCount}x. Status asal: ${statusVal || 'approved'}.`
          : `Diimport dari senarai pengguna. Login: ${loginCount}x.`,
        kiraanFollowup: 0,
      });
    }
    if (parsed.length === 0) throw new Error('Tiada baris data yang sah ditemui dalam CSV.');
    return parsed;
  };

  const handleCsvTextChange = (text: string) => {
    setCsvText(text);
    setCsvError('');
    setCsvPreview([]);
  };

  const handleParseCsv = () => {
    if (!csvText.trim()) {
      setCsvError('Sila tampal atau muat naik data CSV dahulu.');
      return;
    }
    try {
      const parsed = parseUserCsv(csvText);
      setCsvPreview(parsed);
      setCsvError('');
    } catch (err: any) {
      setCsvError(err.message);
      setCsvPreview([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      setCsvError('');
      try {
        const parsed = parseUserCsv(text);
        setCsvPreview(parsed);
      } catch (err: any) {
        setCsvError(err.message);
        setCsvPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImport = () => {
    if (csvPreview.length === 0) {
      setCsvError('Tiada data untuk diimport. Sila muat naik atau tampal CSV dahulu.');
      return;
    }
    onBulkSaveLeads(csvPreview);
    showToast(`${csvPreview.length} prospek berjaya diimport dari CSV!`);
    setIsCsvModalOpen(false);
    setCsvText('');
    setCsvPreview([]);
    setCsvError('');
  };

  // Calculations
  const metrics = useMemo(() => {
    const totalLeads = leads.length;
    const activeLeads = leads.filter((l) => l.status !== 'berjaya' && l.status !== 'batal').length;
    const awaitingPayment = leads.filter((l) => l.status === 'tunggu_bayaran').length;
    const wonCount = leads.filter((l) => l.status === 'berjaya').length;
    const potentialPipelineRM = leads
      .filter((l) => l.status !== 'batal')
      .reduce((sum, l) => sum + (l.anggaranNilai || 0), 0);
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;

    return {
      totalLeads,
      activeLeads,
      awaitingPayment,
      wonCount,
      potentialPipelineRM,
      conversionRate,
    };
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefon.includes(searchTerm) ||
        (lead.emel && lead.emel.toLowerCase().includes(searchTerm.toLowerCase())) ||
        lead.namaProdukDiminati.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'semua' || lead.status === statusFilter;
      const matchProduct =
        productFilter === 'semua' ||
        lead.produkDiminatiId === productFilter ||
        lead.namaProdukDiminati.toLowerCase().includes(productFilter.toLowerCase());

      return matchSearch && matchStatus && matchProduct;
    });
  }, [leads, searchTerm, statusFilter, productFilter]);

  // Handlers
  const handleOpenNewModal = () => {
    setEditingLead(null);
    setFormNama('');
    setFormTelefon('');
    setFormEmel('');
    if (products.length > 0) {
      setFormProdukId(products[0].id);
      setFormNamaProduk(products[0].nama);
      setFormAnggaranNilai(products[0].hargaRuncit || 69);
    } else {
      setFormProdukId('');
      setFormNamaProduk('E-Book Provexa');
      setFormAnggaranNilai(69);
    }
    setFormStatus('baru');
    setFormSumber('whatsapp');
    setFormKeutamaan('tinggi');
    setFormNota('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead: DigitalRetailLead) => {
    setEditingLead(lead);
    setFormNama(lead.nama);
    setFormTelefon(lead.telefon);
    setFormEmel(lead.emel || '');
    setFormProdukId(lead.produkDiminatiId || '');
    setFormNamaProduk(lead.namaProdukDiminati);
    setFormAnggaranNilai(lead.anggaranNilai);
    setFormStatus(lead.status);
    setFormSumber(lead.sumber);
    setFormKeutamaan(lead.keutamaan);
    setFormNota(lead.nota);
    setIsModalOpen(true);
  };

  const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setFormProdukId(selectedId);
    const prod = products.find((p) => p.id === selectedId);
    if (prod) {
      setFormNamaProduk(prod.nama);
      setFormAnggaranNilai(prod.hargaRuncit);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formTelefon.trim()) {
      showToast('Sila masukkan nama dan nombor telefon prospek.', 'error');
      return;
    }

    const payload = {
      nama: formNama.trim(),
      telefon: formTelefon.trim(),
      emel: formEmel.trim() || undefined,
      produkDiminatiId: formProdukId || undefined,
      namaProdukDiminati: formNamaProduk.trim() || 'Produk Digital',
      anggaranNilai: Number(formAnggaranNilai) || 0,
      status: formStatus,
      sumber: formSumber,
      keutamaan: formKeutamaan,
      nota: formNota.trim(),
      kiraanFollowup: editingLead ? editingLead.kiraanFollowup : 0,
      tarikhFollowupTerakhir: editingLead ? editingLead.tarikhFollowupTerakhir : undefined,
      tarikhDikemaskini: new Date().toISOString(),
    };

    onSaveLead(editingLead ? { ...payload, id: editingLead.id } : payload);
    setIsModalOpen(false);
  };

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    showToast(`Nombor telefon ${phone} telah disalin!`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // WhatsApp Scripts
  const generateScript = (lead: DigitalRetailLead, type: typeof scriptType) => {
    const firstName = lead.nama.split(' ')[0] || lead.nama;
    const prodName = lead.namaProdukDiminati || 'E-Book Panduan Usahawan Provexa';

    switch (type) {
      case 'salam_produk':
        return `Salam ${firstName}! 👋\n\nTerima kasih kerana menghubungi Provexa Solution berkaitan *${prodName}*.\n\nAdakah anda sedang mencari strategi praktikal untuk perniagaan anda sekarang? Boleh saya bantu terangkan bab dan topik penting yang ada di dalamnya?`;

      case 'tawaran_diskaun':
        return `Salam ${firstName}! 🎁\n\nKhas untuk anda hari ini, kami tawarkan diskaun istimewa untuk pembelian *${prodName}* pada harga promosi *RM ${lead.anggaranNilai}* sahaja (Harga Asal RM 149)!\n\nTawaran ini termasuk akses muat turun segera format PDF + template percuma. Berminat untuk saya kongsikan pautan tempahan pantas?`;

      case 'peringatan_qr':
        return `Salam ${firstName}! ⏳\n\nSekadar peringatan mesra untuk tempahan *${prodName}* bernilai *RM ${lead.anggaranNilai}*.\n\nAnda boleh buat bayaran mudah melalui DuitNow QR (Semua Bank / TNG eWallet) di sini:\nhttps://provexasolution.com/retail-digital\n\nSelepas bayaran, pautan akses dan kod lesen akan dihantar secara automatik ke WhatsApp ini. Terima kasih!`;

      case 'bab_percuma':
        return `Salam ${firstName}! 📚\n\nSeperti yang diminta, berikut pautan muat turun bab pengenalan percuma untuk *${prodName}*:\n🔗 https://provexasolution.com/downloads/sample\n\nJemput baca formula ringkas di muka surat 5 ya. Sekiranya berminat memiliki versi penuh 120 muka surat, maklumkan di sini!`;
    }
  };

  const handleSendWhatsApp = (lead: DigitalRetailLead) => {
    let cleanPhone = lead.telefon.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '60' + cleanPhone.slice(1);
    }

    const text = generateScript(lead, scriptType);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');

    // Automatically update followup counter and date
    onSaveLead({
      ...lead,
      kiraanFollowup: (lead.kiraanFollowup || 0) + 1,
      tarikhFollowupTerakhir: new Date().toISOString(),
      status: lead.status === 'baru' ? 'dihubungi' : lead.status,
    });
    setSelectedLeadForWhatsApp(null);
    showToast('Tetingkap WhatsApp dibuka dan kiraan follow-up dikemaskini.');
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm border border-blue-800/40">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Saluran Pipeline Prospek Digital</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Leads &amp; Prospek Produk Digital
          </h2>
          <p className="text-xs text-blue-200/90 leading-relaxed">
            Kumpul dan urus inkuiri bakal pembeli E-Book, Prompt Vault, dan kit digital. Follow-up pantas
            menggunakan skrip WhatsApp untuk menukar prospek menjadi jualan runcit atau pelanggan agensi utama.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-md hover:shadow-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Prospek</span>
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Jumlah Prospek</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metrics.totalLeads} Orang
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-0.5">
            {metrics.activeLeads} prospek masih aktif follow-up
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Tunggu Bayaran</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>{metrics.awaitingPayment}</span>
            {metrics.awaitingPayment > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Perlu Follow-up
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Sudah diberi QR / nombor akaun
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Nilai Pipeline Potensi</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            RM {metrics.potentialPipelineRM.toLocaleString('ms-MY')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Daripada kesemua inkuiri belum batal
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Kadar Pertukaran</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metrics.conversionRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            {metrics.wonCount} prospek berjaya jadi pesanan
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari prospek mengikut nama, nombor telefon WhatsApp, atau tajuk produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Status Prospek</option>
            <option value="baru">Inkuiri Baharu</option>
            <option value="dihubungi">Telah Dihubungi</option>
            <option value="tanya_harga">Minta Diskaun / Kombo</option>
            <option value="tunggu_bayaran">Tunggu Bayaran (QR/FPX)</option>
            <option value="berjaya">Berjaya (Jadi Pesanan)</option>
            <option value="batal">Batal / KIV</option>
          </select>

          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Produk Digital</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table of Digital Leads */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Tiada Prospek Digital Ditemui</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'semua' || productFilter !== 'semua'
              ? 'Tiada prospek yang sepadan dengan kriteria carian atau penapis anda.'
              : 'Belum ada prospek digital direkodkan. Klik butang di atas untuk menambah inkuiri WhatsApp atau borang web baru.'}
          </p>
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Prospek Baharu</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 sm:px-4 w-[190px]">Nama Prospek &amp; Telefon</th>
                  <th className="py-2.5 px-3 sm:px-4">Produk Diminati &amp; Anggaran</th>
                  <th className="py-2.5 px-3 w-[150px]">Status Pipeline</th>
                  <th className="py-2.5 px-3 w-[130px]">Sumber &amp; Keutamaan</th>
                  <th className="py-2.5 px-3">Nota &amp; Follow-up</th>
                  <th className="py-2.5 px-3 text-right w-[140px] sticky right-0 bg-slate-50/95 shadow-[-4px_0_8px_-2px_rgba(15,23,42,0.05)] z-10">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLeads.map((lead) => {
                  const statusConf = STATUS_CONFIG[lead.status] || STATUS_CONFIG.baru;
                  const sourceLabel = SOURCE_LABELS[lead.sumber] || lead.sumber;

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      {/* Column 1: Prospect info */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {lead.nama}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-mono text-slate-600">{lead.telefon}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(lead.telefon, lead.id)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Salin nombor"
                          >
                            {copiedPhoneId === lead.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        {lead.emel && (
                          <div className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">
                            {lead.emel}
                          </div>
                        )}
                      </td>

                      {/* Column 2: Product & Value */}
                      <td className="py-3 px-3 sm:px-4">
                        <div className="max-w-[220px]">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-full">
                            <BookOpen className="w-3 h-3 shrink-0 text-indigo-500" />
                            <span className="truncate">{lead.namaProdukDiminati}</span>
                          </span>
                          <div className="font-mono font-extrabold text-xs text-slate-900 mt-1">
                            RM {lead.anggaranNilai.toLocaleString('ms-MY')}
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${statusConf.bg} ${statusConf.color} ${statusConf.border}`}
                        >
                          {statusConf.label}
                        </span>
                        {lead.kiraanFollowup > 0 && (
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">
                            Follow-up: {lead.kiraanFollowup} kali
                          </div>
                        )}
                      </td>

                      {/* Column 4: Source & Priority */}
                      <td className="py-3 px-3">
                        <div className="text-[11px] font-medium text-slate-700">
                          {sourceLabel}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                              lead.keutamaan === 'tinggi'
                                ? 'bg-rose-100 text-rose-700'
                                : lead.keutamaan === 'sederhana'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Prioriti: {lead.keutamaan}
                          </span>
                        </div>
                      </td>

                      {/* Column 5: Notes & Last Follow-up */}
                      <td className="py-3 px-3">
                        <div className="max-w-[180px]">
                          <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                            {lead.nota || 'Tiada nota susulan.'}
                          </p>
                          {lead.tarikhFollowupTerakhir && (
                            <span className="text-[9px] text-slate-400 mt-0.5 block">
                              Terakhir: {new Date(lead.tarikhFollowupTerakhir).toLocaleDateString('ms-MY')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 6: Actions (Sticky right column) */}
                      <td className="py-3 px-3 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-[#f6f7fd] shadow-[-4px_0_8px_-2px_rgba(15,23,42,0.05)] transition-colors z-10">
                        <div className="flex items-center justify-end gap-1">
                          {/* WhatsApp Smart Follow-up */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLeadForWhatsApp(lead);
                              setScriptType('salam_produk');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70 transition-colors shadow-2xs"
                            title="Hantar Skrip WhatsApp Follow-up"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-600" />
                          </button>

                          {/* Convert to Retail Order (POS) */}
                          <button
                            type="button"
                            onClick={() => onConvertLeadToOrder(lead)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/70 transition-colors shadow-2xs"
                            title="Tukar Ke Pesanan Retail (Jual Sekarang / POS)"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          {/* Convert to Agency Lead */}
                          {onConvertLeadToAgencyLead && (
                            <button
                              type="button"
                              onClick={() => onConvertLeadToAgencyLead(lead)}
                              className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/70 transition-colors shadow-2xs"
                              title="Tukar Ke Lead Agensi Utama (Website / BrandUP4U)"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                            </button>
                          )}

                          {/* Edit Lead */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(lead)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Kemaskini Prospek"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Lead */}
                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Padam Prospek"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== MODAL: TAMBAH / KEMASKINI PROSPEK ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                {editingLead ? 'Kemaskini Prospek Digital' : 'Daftar Prospek Digital Baharu'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Penuh Prospek <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Kamarul Ariffin"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nombor Telefon WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cth: 0198877665"
                    value={formTelefon}
                    onChange={(e) => setFormTelefon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Emel (Pilihan)
                  </label>
                  <input
                    type="email"
                    placeholder="cth: kamarul@gmail.com"
                    value={formEmel}
                    onChange={(e) => setFormEmel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Produk Digital Yang Diminati
                </label>
                <select
                  value={formProdukId}
                  onChange={handleProductSelectChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
                >
                  <option value="">-- Pilihan Khas / Pakej Kombo --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama} (RM {p.hargaRuncit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tajuk Produk Khusus / Kombo
                  </label>
                  <input
                    type="text"
                    value={formNamaProduk}
                    onChange={(e) => setFormNamaProduk(e.target.value)}
                    placeholder="cth: Pakej Kombo 3 E-Book"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anggaran Nilai Sasaran (RM)
                  </label>
                  <input
                    type="number"
                    value={formAnggaranNilai}
                    onChange={(e) => setFormAnggaranNilai(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status Pipeline
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DigitalLeadStatus)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="baru">Inkuiri Baharu</option>
                    <option value="dihubungi">Telah Dihubungi</option>
                    <option value="tanya_harga">Minta Diskaun / Kombo</option>
                    <option value="tunggu_bayaran">Tunggu Bayaran (QR/FPX)</option>
                    <option value="berjaya">Berjaya (Jadi Pesanan)</option>
                    <option value="batal">Batal / KIV</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sumber Prospek
                  </label>
                  <select
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value as DigitalLeadSource)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="whatsapp">WhatsApp Direct</option>
                    <option value="borang_web">Borang Web / Etalase</option>
                    <option value="iklan_tiktok">Iklan TikTok</option>
                    <option value="iklan_meta">Iklan Meta (FB/IG)</option>
                    <option value="lead_magnet">Muat Turun Percuma</option>
                    <option value="kaunter_pos">Kaunter POS</option>
                    <option value="rujukan">Rujukan Rakan</option>
                    <option value="lain_lain">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Keutamaan
                  </label>
                  <select
                    value={formKeutamaan}
                    onChange={(e) => setFormKeutamaan(e.target.value as any)}
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  >
                    <option value="tinggi">Tinggi (Panas)</option>
                    <option value="sederhana">Sederhana</option>
                    <option value="rendah">Rendah (Sejuk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nota / Maklumat Tambahan Prospek
                </label>
                <textarea
                  rows={3}
                  value={formNota}
                  onChange={(e) => setFormNota(e.target.value)}
                  placeholder="cth: Minta diskaun untuk pembelian staf atau berminat khidmat bimbingan susulan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  {editingLead ? 'Simpan Perubahan' : 'Daftar Prospek'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: WHATSAPP SMART SCRIPTS ==================== */}
      {selectedLeadForWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Hantar WhatsApp Pintar ke {selectedLeadForWhatsApp.nama}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLeadForWhatsApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Pilih Skrip Mesej Follow-up
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScriptType('salam_produk')}
                    className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                      scriptType === 'salam_produk'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    1. Inkuiri Produk &amp; Salam
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptType('tawaran_diskaun')}
                    className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                      scriptType === 'tawaran_diskaun'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    2. Tawaran Diskaun Khas
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptType('peringatan_qr')}
                    className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                      scriptType === 'peringatan_qr'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    3. Peringatan Bayaran QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setScriptType('bab_percuma')}
                    className={`p-2 rounded-lg border text-left font-semibold transition-all ${
                      scriptType === 'bab_percuma'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    4. Pautan Bab Percuma
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Pratonton Kandungan Mesej
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const text = generateScript(selectedLeadForWhatsApp, scriptType);
                      navigator.clipboard.writeText(text);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                      showToast('Skrip mesej telah disalin!');
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Skrip</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl whitespace-pre-wrap font-sans text-slate-800 leading-relaxed max-h-48 overflow-y-auto">
                  {generateScript(selectedLeadForWhatsApp, scriptType)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForWhatsApp(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(selectedLeadForWhatsApp)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka WhatsApp Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== CONFIRM DELETE DIALOG ==================== */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Padam Prospek Digital?</h3>
            <p className="text-xs text-slate-500">
              Adakah anda pasti mahu memadam rekod prospek <span className="font-bold text-slate-800">{leadToDelete.nama}</span>? Tindakan ini tidak boleh diundur.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLead(leadToDelete.id);
                  setLeadToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                Ya, Padam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Import Prospek dari CSV Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsCsvModalOpen(false); setCsvText(''); setCsvPreview([]); setCsvError(''); }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
                <p className="font-bold text-blue-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Format CSV Disokong
                </p>
                <p className="text-blue-700 leading-relaxed">
                  Format dari export pengguna: <span className="font-mono font-bold">Full Name, Email, Username, Phone, Status, Created At, Last Login, Login Count</span>.
                  Hanya lajur <span className="font-bold">Full Name</span> dan <span className="font-bold">Phone</span> yang diperlukan.
                </p>
                <p className="text-blue-600 text-[11px]">
                  Setiap pengguna akan diimport sebagai prospek digital baharu dengan sumber "Lead Magnet" dan status "Inkuiri Baharu".
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Muat Naik Fail CSV</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all text-center"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Klik untuk pilih fail CSV</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">atau tampal data CSV di ruangan di bawah</p>
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Atau Tampal Data CSV</label>
                <textarea
                  rows={5}
                  value={csvText}
                  onChange={(e) => handleCsvTextChange(e.target.value)}
                  placeholder="Full Name,Email,Username,Phone,Status,Created At,Last Login,Login Count&#10;Ahmad Zaki,zaki@email.com,zaki88,0123456789,approved,9/15/2026,9/15/2026,1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
                />
                {csvText.trim() && csvPreview.length === 0 && !csvError && (
                  <button
                    type="button"
                    onClick={handleParseCsv}
                    className="mt-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg"
                  >
                    Semak Data CSV
                  </button>
                )}
              </div>

              {csvError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{csvError}</span>
                </div>
              )}

              {csvPreview.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <p className="font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {csvPreview.length} prospek sedia untuk diimport
                  </p>
                  <div className="max-h-40 overflow-y-auto bg-white rounded-lg border border-emerald-100">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-emerald-50/50 text-slate-600 font-bold sticky top-0">
                        <tr>
                          <th className="py-1.5 px-2">Nama</th>
                          <th className="py-1.5 px-2">Telefon</th>
                          <th className="py-1.5 px-2">Emel</th>
                          <th className="py-1.5 px-2">Keutamaan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreview.slice(0, 10).map((l, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-2 font-semibold text-slate-800">{l.nama}</td>
                            <td className="py-1.5 px-2 font-mono text-slate-600">{l.telefon}</td>
                            <td className="py-1.5 px-2 text-slate-600 truncate max-w-[120px]">{l.emel || '-'}</td>
                            <td className="py-1.5 px-2 text-slate-600">{l.keutamaan}</td>
                          </tr>
                        ))}
                        {csvPreview.length > 10 && (
                          <tr>
                            <td colSpan={4} className="py-1.5 px-2 text-center text-slate-400 font-medium">
                              ...dan {csvPreview.length - 10} lagi
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end space-x-2 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { setIsCsvModalOpen(false); setCsvText(''); setCsvPreview([]); setCsvError(''); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCsvImport}
                disabled={csvPreview.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import {csvPreview.length > 0 ? `(${csvPreview.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
