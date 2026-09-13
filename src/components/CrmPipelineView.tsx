import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  GitBranch,
  Users,
  TrendingUp,
  DollarSign,
  MessageCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Building2,
  FileText,
  Scale,
  FolderPlus,
  Tag,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Edit3,
  Trash2,
  ChevronRight,
  Award,
  BarChart3,
  FileSpreadsheet,
  Check,
  Flame,
  ShieldCheck,
  Briefcase,
  Layers,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  LeadSource,
  Project,
  FinancialDoc,
  AgreementDoc,
  Reminder,
  ProvexaService,
  PROVEXA_SERVICES,
  PriorityLevel,
  ServiceMeta,
} from '../types';
import { createWhatsAppUrl, getShortName } from '../utils/whatsapp';

// CRM Pipeline Stage Configuration with probability weights
export interface PipelineStageConfig {
  key: LeadStatus;
  label: string;
  probability: number; // 0 - 100%
  color: string;
  bg: string;
  border: string;
  lightBg: string;
  description: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    key: 'baru',
    label: 'Inkuiri Baharu',
    probability: 10,
    color: 'text-blue-700',
    bg: 'bg-blue-600',
    border: 'border-blue-200',
    lightBg: 'bg-blue-50/70',
    description: 'Borang web atau mesej masuk pertama',
  },
  {
    key: 'dihubungi',
    label: 'Telah Dihubungi',
    probability: 25,
    color: 'text-indigo-700',
    bg: 'bg-indigo-600',
    border: 'border-indigo-200',
    lightBg: 'bg-indigo-50/70',
    description: 'Panggilan awal atau respon WhatsApp dihantar',
  },
  {
    key: 'sesi_discovery',
    label: 'Sesi Discovery',
    probability: 50,
    color: 'text-purple-700',
    bg: 'bg-purple-600',
    border: 'border-purple-200',
    lightBg: 'bg-purple-50/70',
    description: 'Mesyuarat keperluan & skop projek',
  },
  {
    key: 'sebutharga_dihantar',
    label: 'Sebutharga Dihantar',
    probability: 75,
    color: 'text-amber-700',
    bg: 'bg-amber-600',
    border: 'border-amber-200',
    lightBg: 'bg-amber-50/70',
    description: 'Quotation rasmi diserahkan kepada klien',
  },
  {
    key: 'tunggu_deposit',
    label: 'Tunggu Deposit',
    probability: 90,
    color: 'text-teal-700',
    bg: 'bg-teal-600',
    border: 'border-teal-200',
    lightBg: 'bg-teal-50/70',
    description: 'Perjanjian dipersetujui, menunggu 50% deposit',
  },
  {
    key: 'berjaya',
    label: 'Deal Menang (Won)',
    probability: 100,
    color: 'text-emerald-700',
    bg: 'bg-emerald-600',
    border: 'border-emerald-200',
    lightBg: 'bg-emerald-50/70',
    description: 'Deposit diterima & bertukar ke projek aktif',
  },
  {
    key: 'gagal',
    label: 'KIV / Batal',
    probability: 0,
    color: 'text-slate-600',
    bg: 'bg-slate-500',
    border: 'border-slate-200',
    lightBg: 'bg-slate-100/70',
    description: 'Bajet tidak cukup atau ditangguhkan',
  },
];

export const CRM_SOURCE_LABELS: Record<LeadSource, string> = {
  borang_web: 'Borang Awam Web',
  whatsapp: 'WhatsApp Direct',
  iklan: 'Kempen Iklan (Ads)',
  rujukan: 'Rujukan Pelanggan',
  tiktok: 'TikTok Organik',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google Search / SEO',
  networking: 'Networking / Acara',
  lain_lain: 'Lain-lain',
};

// Aggregated CRM 360 Client Profile
export interface CrmClientProfile {
  id: string; // Phone number or clean identifier
  nama: string;
  syarikat?: string;
  telefon: string;
  emel?: string;
  tier: 'vip' | 'aktif' | 'prospek' | 'alumni';
  totalLtv: number; // Nilai kontrak keseluruhan
  totalPaid: number; // Jumlah dibayar
  totalBalance: number; // Baki tertunggak
  activeDealsCount: number;
  completedProjectsCount: number;
  projects: Project[];
  financialDocs: FinancialDoc[];
  leads: Lead[];
  latestNote?: string;
  tarikhInteraksiTerakhir: string;
}

interface CrmPipelineViewProps {
  leads: Lead[];
  projects: Project[];
  financialDocs: FinancialDoc[];
  agreements: AgreementDoc[];
  reminders: Reminder[];
  services?: Record<string, ServiceMeta>;
  onAddLead: (lead: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'>) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onOpenFollowupModal: (lead: Lead) => void;
  onGenerateQuotationForLead: (lead: Lead) => void;
  onGenerateAgreementForLead: (lead: Lead) => void;
  onConvertLeadToProject: (lead: Lead) => void;
  onSyncGoogleSheets?: () => void;
  isSyncing?: boolean;
  onNavigateToProjects?: () => void;
  onNavigateToFinancialDocs?: () => void;
}

export const CrmPipelineView: React.FC<CrmPipelineViewProps> = ({
  leads,
  projects,
  financialDocs,
  agreements,
  reminders,
  services,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onOpenFollowupModal,
  onGenerateQuotationForLead,
  onGenerateAgreementForLead,
  onConvertLeadToProject,
  onSyncGoogleSheets,
  isSyncing = false,
  onNavigateToProjects,
  onNavigateToFinancialDocs,
}) => {
  // Main CRM Sub-tabs: Pipeline Kanban vs CRM Client Directory vs Forecast Analytics
  const [activeSubTab, setActiveSubTab] = useState<'pipeline' | 'contacts' | 'analytics'>('pipeline');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<string>('semua');
  const [priorityFilter, setPriorityFilter] = useState<string>('semua');
  const [crmTierFilter, setCrmTierFilter] = useState<string>('semua');

  // Modal State for adding/editing a deal
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form Fields
  const [formNama, setFormNama] = useState('');
  const [formSyarikat, setFormSyarikat] = useState('');
  const [formTelefon, setFormTelefon] = useState('');
  const [formEmel, setFormEmel] = useState('');
  const [formServis, setFormServis] = useState<ProvexaService>('website');
  const [formSumber, setFormSumber] = useState<LeadSource>('whatsapp');
  const [formStatus, setFormStatus] = useState<LeadStatus>('baru');
  const [formAnggaran, setFormAnggaran] = useState<number>(3000);
  const [formKeutamaan, setFormKeutamaan] = useState<PriorityLevel>('tinggi');
  const [formGarisMasa, setFormGarisMasa] = useState('1 Bulan');
  const [formKeperluan, setFormKeperluan] = useState('');
  const [formNota, setFormNota] = useState('');

  // Client 360 Detail Modal
  const [selectedClient, setSelectedClient] = useState<CrmClientProfile | null>(null);

  // Quick Interaction Log Modal
  const [logModalLead, setLogModalLead] = useState<Lead | null>(null);
  const [logType, setLogType] = useState<'whatsapp' | 'panggilan' | 'meeting' | 'nota'>('whatsapp');
  const [logText, setLogText] = useState('');

  // Delete confirmation
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Active services catalog helper
  const activeCatalog: Record<string, ServiceMeta> = services || PROVEXA_SERVICES;

  // 1. Pipeline Metrics Calculation
  const pipelineMetrics = useMemo(() => {
    const activeDeals = leads.filter((l) => l.status !== 'berjaya' && l.status !== 'gagal');
    const wonDeals = leads.filter((l) => l.status === 'berjaya');
    const lostDeals = leads.filter((l) => l.status === 'gagal');

    // Total Pipeline Value (Active deals sum)
    const totalPipelineValue = activeDeals.reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);

    // Weighted Pipeline Forecast: Sum of (deal value * stage probability)
    const weightedForecast = activeDeals.reduce((sum, l) => {
      const stage = PIPELINE_STAGES.find((s) => s.key === l.status);
      const prob = stage ? stage.probability / 100 : 0.2;
      return sum + (l.anggaranBajet || 0) * prob;
    }, 0);

    // Closed deals total
    const totalClosed = wonDeals.length + lostDeals.length;
    const winRate = totalClosed > 0 ? (wonDeals.length / totalClosed) * 100 : 50;

    // Average Deal Size
    const allValidDeals = leads.filter((l) => (l.anggaranBajet || 0) > 0);
    const avgDealSize =
      allValidDeals.length > 0
        ? allValidDeals.reduce((sum, l) => sum + (l.anggaranBajet || 0), 0) / allValidDeals.length
        : 0;

    return {
      activeDealsCount: activeDeals.length,
      totalPipelineValue,
      weightedForecast,
      winRate: Math.round(winRate * 10) / 10,
      wonDealsCount: wonDeals.length,
      lostDealsCount: lostDeals.length,
      avgDealSize: Math.round(avgDealSize),
    };
  }, [leads]);

  // 2. Aggregate CRM 360 Client Profiles across Leads, Projects, and Financial Docs
  const crmClients: CrmClientProfile[] = useMemo(() => {
    const clientMap = new Map<string, CrmClientProfile>();

    // Clean phone helper to group identical customers
    const getCleanKey = (phone: string, name: string) => {
      const p = phone.replace(/[^0-9]/g, '');
      if (p.length >= 8) return p;
      return name.trim().toLowerCase();
    };

    // Process from Leads
    leads.forEach((l) => {
      const key = getCleanKey(l.telefon, l.nama);
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: key,
          nama: l.nama,
          syarikat: l.syarikat,
          telefon: l.telefon,
          emel: l.emel,
          tier: 'prospek',
          totalLtv: 0,
          totalPaid: 0,
          totalBalance: 0,
          activeDealsCount: 0,
          completedProjectsCount: 0,
          projects: [],
          financialDocs: [],
          leads: [],
          latestNote: l.nota,
          tarikhInteraksiTerakhir: l.tarikhDikemaskini || l.tarikhDicipta,
        });
      }
      const profile = clientMap.get(key)!;
      profile.leads.push(l);
      if (l.status !== 'berjaya' && l.status !== 'gagal') {
        profile.activeDealsCount += 1;
      }
      if (l.syarikat && !profile.syarikat) profile.syarikat = l.syarikat;
      if (l.emel && !profile.emel) profile.emel = l.emel;
    });

    // Process from Projects
    projects.forEach((p) => {
      const key = getCleanKey(p.telefonKlien, p.namaKlien);
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: key,
          nama: p.namaKlien,
          syarikat: p.syarikatKlien,
          telefon: p.telefonKlien,
          emel: p.emelKlien,
          tier: 'aktif',
          totalLtv: 0,
          totalPaid: 0,
          totalBalance: 0,
          activeDealsCount: 0,
          completedProjectsCount: 0,
          projects: [],
          financialDocs: [],
          leads: [],
          latestNote: p.nota,
          tarikhInteraksiTerakhir: p.tarikhDikemaskini || p.tarikhDicipta,
        });
      }
      const profile = clientMap.get(key)!;
      profile.projects.push(p);
      profile.totalLtv += p.nilaiKontrak || 0;
      profile.totalPaid += p.jumlahDibayar || 0;
      profile.totalBalance += Math.max(0, (p.nilaiKontrak || 0) - (p.jumlahDibayar || 0));

      if (p.status === 'selesai') {
        profile.completedProjectsCount += 1;
      }
      if (p.syarikatKlien && !profile.syarikat) profile.syarikat = p.syarikatKlien;
      if (p.emelKlien && !profile.emel) profile.emel = p.emelKlien;
    });

    // Process from Financial Docs
    financialDocs.forEach((d) => {
      const key = getCleanKey(d.klien.telefon, d.klien.nama);
      if (clientMap.has(key)) {
        const profile = clientMap.get(key)!;
        profile.financialDocs.push(d);
      }
    });

    // Determine Tier for each client
    const profiles = Array.from(clientMap.values()).map((c) => {
      const hasActiveProject = c.projects.some(
        (p) => p.status === 'pembangunan' || p.status === 'semakan_uat'
      );
      const isHighValue = c.totalPaid >= 5000 || c.projects.length >= 2;

      let tier: 'vip' | 'aktif' | 'prospek' | 'alumni' = 'prospek';
      if (isHighValue) {
        tier = 'vip';
      } else if (hasActiveProject) {
        tier = 'aktif';
      } else if (c.completedProjectsCount > 0) {
        tier = 'alumni';
      } else {
        tier = 'prospek';
      }

      return {
        ...c,
        tier,
      };
    });

    // Sort by Total Paid / LTV descending
    return profiles.sort((a, b) => b.totalPaid - a.totalPaid || b.totalLtv - a.totalLtv);
  }, [leads, projects, financialDocs]);

  // 3. Filtered Leads for the Pipeline Board
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lead.nama.toLowerCase().includes(q) ||
        lead.telefon.includes(q) ||
        (lead.syarikat && lead.syarikat.toLowerCase().includes(q)) ||
        (lead.emel && lead.emel.toLowerCase().includes(q));

      const matchesService = serviceFilter === 'semua' || lead.servisMinat === serviceFilter;
      const matchesPriority = priorityFilter === 'semua' || lead.keutamaan === priorityFilter;

      return matchesSearch && matchesService && matchesPriority;
    });
  }, [leads, searchQuery, serviceFilter, priorityFilter]);

  // 4. Filtered Clients for the CRM Contacts Directory
  const filteredClients = useMemo(() => {
    return crmClients.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.nama.toLowerCase().includes(q) ||
        c.telefon.includes(q) ||
        (c.syarikat && c.syarikat.toLowerCase().includes(q)) ||
        (c.emel && c.emel.toLowerCase().includes(q));

      const matchesTier = crmTierFilter === 'semua' || c.tier === crmTierFilter;
      return matchesSearch && matchesTier;
    });
  }, [crmClients, searchQuery, crmTierFilter]);

  // Stage Shifter Handler
  const handleShiftStage = (lead: Lead, direction: 'next' | 'prev') => {
    const stageOrder: LeadStatus[] = [
      'baru',
      'dihubungi',
      'sesi_discovery',
      'sebutharga_dihantar',
      'tunggu_deposit',
      'berjaya',
    ];
    const currentIndex = stageOrder.indexOf(lead.status);

    if (direction === 'next' && currentIndex < stageOrder.length - 1) {
      const nextStatus = stageOrder[currentIndex + 1];
      onUpdateLead({
        ...lead,
        status: nextStatus,
        tarikhDikemaskini: new Date().toISOString(),
      });
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevStatus = stageOrder[currentIndex - 1];
      onUpdateLead({
        ...lead,
        status: prevStatus,
        tarikhDikemaskini: new Date().toISOString(),
      });
    }
  };

  const handleChangeStageDirect = (lead: Lead, newStatus: LeadStatus) => {
    onUpdateLead({
      ...lead,
      status: newStatus,
      tarikhDikemaskini: new Date().toISOString(),
    });
  };

  // Open Add Deal Modal
  const handleOpenAddModal = (defaultStatus: LeadStatus = 'baru') => {
    setEditingLead(null);
    setFormNama('');
    setFormSyarikat('');
    setFormTelefon('');
    setFormEmel('');
    setFormServis('website');
    setFormSumber('whatsapp');
    setFormStatus(defaultStatus);
    setFormAnggaran(activeCatalog.website?.startingPrice || 1800);
    setFormKeutamaan('tinggi');
    setFormGarisMasa('1 Bulan');
    setFormKeperluan('');
    setFormNota('');
    setIsDealModalOpen(true);
  };

  // Open Edit Deal Modal
  const handleOpenEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setFormNama(lead.nama);
    setFormSyarikat(lead.syarikat || '');
    setFormTelefon(lead.telefon);
    setFormEmel(lead.emel || '');
    setFormServis(lead.servisMinat);
    setFormSumber(lead.sumber);
    setFormStatus(lead.status);
    setFormAnggaran(lead.anggaranBajet || 0);
    setFormKeutamaan(lead.keutamaan || 'sederhana');
    setFormGarisMasa(lead.jangkaanGarisMasa || '');
    setFormKeperluan(lead.keperluanProjek || '');
    setFormNota(lead.nota || '');
    setIsDealModalOpen(true);
  };

  // Submit Deal Form
  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formTelefon.trim()) return;

    if (editingLead) {
      onUpdateLead({
        ...editingLead,
        nama: formNama.trim(),
        syarikat: formSyarikat.trim() || undefined,
        telefon: formTelefon.trim(),
        emel: formEmel.trim() || undefined,
        servisMinat: formServis,
        sumber: formSumber,
        status: formStatus,
        anggaranBajet: Number(formAnggaran) || 0,
        keutamaan: formKeutamaan,
        jangkaanGarisMasa: formGarisMasa,
        keperluanProjek: formKeperluan,
        nota: formNota,
        tarikhDikemaskini: new Date().toISOString(),
      });
    } else {
      onAddLead({
        nama: formNama.trim(),
        syarikat: formSyarikat.trim() || undefined,
        telefon: formTelefon.trim(),
        emel: formEmel.trim() || undefined,
        servisMinat: formServis,
        sumber: formSumber,
        status: formStatus,
        anggaranBajet: Number(formAnggaran) || 0,
        keutamaan: formKeutamaan,
        jangkaanGarisMasa: formGarisMasa,
        keperluanProjek: formKeperluan,
        nota: formNota,
      });
    }

    setIsDealModalOpen(false);
  };

  // Open Log Modal
  const handleOpenLogModal = (lead: Lead) => {
    setLogModalLead(lead);
    setLogType('whatsapp');
    setLogText('');
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logModalLead || !logText.trim()) return;

    const dateStr = new Date().toLocaleDateString('ms-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const typeIcons: Record<string, string> = {
      whatsapp: '💬 [WhatsApp]',
      panggilan: '📞 [Panggilan]',
      meeting: '🤝 [Mesyuarat]',
      nota: '📝 [Nota]',
    };

    const newLogLine = `\n• ${typeIcons[logType]} (${dateStr}): ${logText.trim()}`;
    const updatedNota = logModalLead.nota ? `${logModalLead.nota}${newLogLine}` : newLogLine.trim();

    onUpdateLead({
      ...logModalLead,
      nota: updatedNota,
      kiraanFollowup: (logModalLead.kiraanFollowup || 0) + 1,
      tarikhFollowupTerakhir: new Date().toISOString(),
      tarikhDikemaskini: new Date().toISOString(),
    });

    setLogModalLead(null);
  };

  // WhatsApp Follow-up with smart stage template
  const handleWhatsAppStageMessage = (lead: Lead) => {
    const shortName = getShortName(lead.nama);
    const serviceMeta = activeCatalog[lead.servisMinat] || PROVEXA_SERVICES[lead.servisMinat];
    const serviceTitle = serviceMeta?.title || 'Servis Digital Provexa';

    let message = `Salam ${shortName}, saya daripada Provexa Solution.`;

    switch (lead.status) {
      case 'baru':
        message += ` Terima kasih atas minat anda terhadap *${serviceTitle}*.\nBoleh kami bantu kongsikan maklumat lanjut dan semak keperluan spesifik syarikat anda?`;
        break;
      case 'dihubungi':
        message += ` Berhubung perbualan kita tempoh hari mengenai *${serviceTitle}*, adakah anda mempunyai masa kelapangan untuk sesi perbincangan ringkas (Discovery Call)?`;
        break;
      case 'sesi_discovery':
        message += ` Terima kasih atas masa dalam sesi discovery semalam. Kami sedang menyelaraskan cadangan penyelesaian dan anggaran skop projek *${serviceTitle}* untuk semakan anda.`;
        break;
      case 'sebutharga_dihantar':
        message += ` Adakah pihak ${lead.syarikat || shortName} telah berkesempatan meneliti Sebutharga (Quotation) rasmi bagi *${serviceTitle}* yang kami hantarkan? Boleh kami jelaskan mana-mana bahagian sekiranya perlu?`;
        break;
      case 'tunggu_deposit':
        message += ` Segala dokumen perjanjian bagi projek *${serviceTitle}* telah sedia. Kami bersedia memulakan fasa pembangunan sebaik sahaja bayaran deposit disahkan.`;
        break;
      case 'berjaya':
        message += ` Terima kasih kerana memilih Provexa Solution sebagai rakan teknologi anda! Pasukan teknikal kami bersedia memulakan gerak kerja mengikut garis masa yang dipersetujui.`;
        break;
      default:
        message += ` Ada apa-apa perkembangan terkini bagi perancangan digital perniagaan anda yang boleh kami sokong?`;
    }

    window.open(createWhatsAppUrl(lead.telefon, message), '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* 1. Header Bar with Tabs Switcher */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 shadow-2xs">
              Provexa Solution
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">CRM 360° &amp; Pipeline Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <span>CRM &amp; Saluran Pipeline Jualan</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal max-w-2xl">
            Papan kawalan perhubungan pelanggan menyeluruh, penjejakan kemajuan deal mengikut fasa, dan unjuran hasil jualan Provexa Solution.
          </p>
        </div>

        {/* Action Controls & Sub-Tab Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          {/* Sub-tabs buttons */}
          <div className="p-1 bg-slate-100/90 rounded-xl flex items-center border border-slate-200/70 shrink-0 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('pipeline')}
              className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'pipeline'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Saluran Pipeline</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                activeSubTab === 'pipeline' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {pipelineMetrics.activeDealsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('contacts')}
              className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'contacts'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Klien CRM</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                activeSubTab === 'contacts' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/80 text-slate-600'
              }`}>
                {crmClients.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('analytics')}
              className={`whitespace-nowrap shrink-0 px-3.5 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'analytics'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-medium'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Ramalan Jualan</span>
            </button>
          </div>

          {/* New Deal button */}
          <button
            type="button"
            onClick={() => handleOpenAddModal('baru')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Deal Baharu</span>
          </button>
        </div>
      </div>

      {/* 2. Top Pipeline Ribbon (5 KPI Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: Total Pipeline Value */}
        <div className="glass-card rounded-2xl p-4 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nilai Saluran Pipeline
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            RM {pipelineMetrics.totalPipelineValue.toLocaleString('ms-MY')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pipelineMetrics.activeDealsCount} deal sedang aktif dirunding
          </p>
        </div>

        {/* KPI 2: Weighted Forecast */}
        <div className="glass-card rounded-2xl p-4 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unjuran Hasil Berbobot
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-700 tracking-tight">
            RM {Math.round(pipelineMetrics.weightedForecast).toLocaleString('ms-MY')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Berasaskan % kebarangkalian fasa
          </p>
        </div>

        {/* KPI 3: Win Rate */}
        <div className="glass-card rounded-2xl p-4 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Kadar Menang (Win Rate)
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 tracking-tight">
            {pipelineMetrics.winRate}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pipelineMetrics.wonDealsCount} menang • {pipelineMetrics.lostDealsCount} batal
          </p>
        </div>

        {/* KPI 4: Average Deal Size */}
        <div className="glass-card rounded-2xl p-4 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Purata Saiz Deal
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
            RM {pipelineMetrics.avgDealSize.toLocaleString('ms-MY')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Nilai purata bagi 8 servis
          </p>
        </div>

        {/* KPI 5: CRM Accounts */}
        <div className="glass-card rounded-2xl p-4 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pangkalan Klien CRM
            </span>
            <div className="w-7 h-7 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {crmClients.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {crmClients.filter((c) => c.tier === 'vip').length} VIP •{' '}
            {crmClients.filter((c) => c.tier === 'aktif').length} Projek Aktif
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-3.5 sm:p-4 border border-white/85 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama klien, syarikat, tel, emel..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          {activeSubTab === 'pipeline' && (
            <>
              {/* Service Filter */}
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="semua">Semua Servis</option>
                {Object.values(activeCatalog).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title}
                  </option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="semua">Semua Keutamaan</option>
                <option value="kritikal">Kritikal</option>
                <option value="tinggi">Tinggi</option>
                <option value="sederhana">Sederhana</option>
                <option value="rendah">Rendah</option>
              </select>
            </>
          )}

          {activeSubTab === 'contacts' && (
            <select
              value={crmTierFilter}
              onChange={(e) => setCrmTierFilter(e.target.value)}
              className="text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="semua">Semua Kategori Klien</option>
              <option value="vip">👑 Klien VIP (Perbelanjaan Tinggi)</option>
              <option value="aktif">🟢 Pelanggan Aktif (Dalam Projek)</option>
              <option value="prospek">🔵 Prospek / Dalam Saluran</option>
              <option value="alumni">⚪ Projek Selesai (Alumni)</option>
            </select>
          )}

          {/* Reset Filters if modified */}
          {(searchQuery ||
            serviceFilter !== 'semua' ||
            priorityFilter !== 'semua' ||
            crmTierFilter !== 'semua') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setServiceFilter('semua');
                setPriorityFilter('semua');
                setCrmTierFilter('semua');
              }}
              className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Reset
            </button>
          )}

          {onSyncGoogleSheets && (
            <button
              type="button"
              onClick={onSyncGoogleSheets}
              disabled={isSyncing}
              className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 shadow-2xs"
              title="Segerak Google Sheets"
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyegerak...' : 'Segerak Sheets'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUB-VIEW 1: SALES PIPELINE KANBAN BOARD                   */}
      {/* ========================================================= */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Visual Instruction Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100/80 text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="font-medium">
                Peringkat saluran jualan berstruktur Provexa. Gerakkan prospek ke fasa seterusnya mengikut kemajuan perbincangan.
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-700 hidden sm:inline">
              7 Peringkat Saluran
            </span>
          </div>

          {/* Horizontal Kanban Columns Container */}
          <div className="overflow-x-auto pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-start gap-4 min-w-[1300px]">
              {PIPELINE_STAGES.map((stage) => {
                const stageLeads = filteredLeads.filter((l) => l.status === stage.key);
                const stageTotalValue = stageLeads.reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);

                return (
                  <div
                    key={stage.key}
                    className="w-[280px] shrink-0 bg-slate-100/70 rounded-2xl border border-slate-200/80 flex flex-col max-h-[800px] shadow-2xs"
                  >
                    {/* Stage Header */}
                    <div className="p-3.5 border-b border-slate-200/80 bg-white rounded-t-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${stage.bg}`} />
                          <h3 className="font-bold text-xs text-slate-900 tracking-tight">
                            {stage.label}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                          {stageLeads.length}
                        </span>
                      </div>

                      {/* Probability bar & Stage Total */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-400 font-medium">Kebarangkalian:</span>
                        <span className="font-mono font-bold text-slate-700">{stage.probability}%</span>
                      </div>

                      <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${stage.bg}`}
                          style={{ width: `${stage.probability}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-100">
                        <span className="text-slate-400">Nilai Fasa:</span>
                        <span className="font-mono font-bold text-slate-900">
                          RM {stageTotalValue.toLocaleString('ms-MY')}
                        </span>
                      </div>
                    </div>

                    {/* Stage Deal Cards List */}
                    <div className="p-2.5 space-y-2.5 overflow-y-auto flex-1 min-h-[160px]">
                      {stageLeads.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-xs">
                          <p className="font-medium">Tiada deal di fasa ini</p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddModal(stage.key)}
                            className="mt-2 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            + Tambah Deal
                          </button>
                        </div>
                      ) : (
                        stageLeads.map((lead) => {
                          const service = activeCatalog[lead.servisMinat] || PROVEXA_SERVICES[lead.servisMinat];
                          const weightedVal = Math.round(
                            (lead.anggaranBajet || 0) * (stage.probability / 100)
                          );

                          return (
                            <div
                              key={lead.id}
                              className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all group space-y-2.5 relative"
                            >
                              {/* Card Header: Client Name & Quick Priority */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h4 className="font-bold text-xs text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                                    {lead.nama}
                                  </h4>
                                  {lead.syarikat && (
                                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                      <Building2 className="w-3 h-3 shrink-0 text-slate-400" />
                                      <span>{lead.syarikat}</span>
                                    </p>
                                  )}
                                </div>

                                {/* Priority Badge */}
                                {lead.keutamaan && (
                                  <span
                                    className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0 ${
                                      lead.keutamaan === 'kritikal'
                                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                        : lead.keutamaan === 'tinggi'
                                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200'
                                    }`}
                                  >
                                    {lead.keutamaan}
                                  </span>
                                )}
                              </div>

                              {/* Service Badge & Source */}
                              <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                                <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 truncate max-w-[170px]">
                                  {service?.shortTitle || service?.title || lead.servisMinat}
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                                  {CRM_SOURCE_LABELS[lead.sumber] || lead.sumber}
                                </span>
                              </div>

                              {/* Deal Amount */}
                              <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                                <div>
                                  <span className="text-[10px] text-slate-400 block leading-none">
                                    Nilai Deal
                                  </span>
                                  <span className="text-sm font-extrabold font-mono text-slate-900">
                                    RM {(lead.anggaranBajet || 0).toLocaleString('ms-MY')}
                                  </span>
                                </div>
                                {stage.probability > 0 && stage.probability < 100 && (
                                  <div className="text-right">
                                    <span className="text-[9px] text-slate-400 block leading-none">
                                      Berbobot
                                    </span>
                                    <span className="text-[11px] font-mono font-semibold text-purple-700">
                                      RM {weightedVal.toLocaleString('ms-MY')}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Last Note / Interaction preview */}
                              {lead.nota && (
                                <p className="text-[11px] text-slate-500 bg-slate-50/80 p-2 rounded-lg border border-slate-100 line-clamp-2 italic leading-relaxed">
                                  "{lead.nota}"
                                </p>
                              )}

                              {/* Quick Stage Mover Controls */}
                              <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100/90 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => handleShiftStage(lead, 'prev')}
                                  disabled={lead.status === 'baru' || lead.status === 'gagal'}
                                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Undur ke fasa sebelum"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>

                                {/* Direct Stage Selector */}
                                <select
                                  value={lead.status}
                                  onChange={(e) =>
                                    handleChangeStageDirect(lead, e.target.value as LeadStatus)
                                  }
                                  className="text-[10px] font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 max-w-[140px] focus:outline-hidden"
                                >
                                  {PIPELINE_STAGES.map((st) => (
                                    <option key={st.key} value={st.key}>
                                      {st.label}
                                    </option>
                                  ))}
                                </select>

                                <button
                                  type="button"
                                  onClick={() => handleShiftStage(lead, 'next')}
                                  disabled={lead.status === 'berjaya' || lead.status === 'gagal'}
                                  className="p-1 rounded-lg hover:bg-indigo-50 text-indigo-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                  title="Mara ke fasa seterusnya"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Action Bar (WhatsApp, Quo, Convert, Log, Edit, Trash) */}
                              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  {/* WhatsApp Action */}
                                  <button
                                    type="button"
                                    onClick={() => handleWhatsAppStageMessage(lead)}
                                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    title="WhatsApp Susulan Pantas Fasa Ini"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Quotation Action */}
                                  <button
                                    type="button"
                                    onClick={() => onGenerateQuotationForLead(lead)}
                                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                    title="Jana Sebutharga (Quotation)"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Agreement Action */}
                                  <button
                                    type="button"
                                    onClick={() => onGenerateAgreementForLead(lead)}
                                    className="p-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                                    title="Jana Perjanjian / T&C"
                                  >
                                    <Scale className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Convert to Project */}
                                  <button
                                    type="button"
                                    onClick={() => onConvertLeadToProject(lead)}
                                    className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                                    title="Tukar Terus Menjadi Projek Aktif"
                                  >
                                    <FolderPlus className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Add Note / Activity Log */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenLogModal(lead)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                                    title="Catat Nota / Log Interaksi"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditModal(lead)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title="Edit Deal"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setLeadToDelete(lead)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Padam Deal"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 2: CRM 360° CLIENT DIRECTORY & ACCOUNTS          */}
      {/* ========================================================= */}
      {activeSubTab === 'contacts' && (
        <div className="space-y-4">
          {/* Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <p className="text-xs text-slate-500">
              Direktori berpusat profil pelanggan Provexa Solution yang menggabungkan maklumat prospek, projek aktif, invois, dan nilai perbelanjaan seumur hidup (LTV).
            </p>
            <span className="text-xs font-semibold text-slate-700 shrink-0">
              Menunjukkan {filteredClients.length} profil klien
            </span>
          </div>

          {/* CRM Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              return (
                <div
                  key={client.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4 relative"
                >
                  <div>
                    {/* Top Tier Badge & Actions */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200/60 shadow-2xs">
                          {client.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 leading-tight">
                            {client.nama}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[180px]">
                            {client.syarikat || 'Persendirian / Usahawan'}
                          </p>
                        </div>
                      </div>

                      {/* Tier Tag */}
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                          client.tier === 'vip'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : client.tier === 'aktif'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : client.tier === 'alumni'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {client.tier === 'vip' && <Flame className="w-3 h-3 text-amber-600" />}
                        {client.tier === 'aktif' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                        <span>
                          {client.tier === 'vip'
                            ? 'VIP / Setia'
                            : client.tier === 'aktif'
                            ? 'Projek Aktif'
                            : client.tier === 'alumni'
                            ? 'Alumni'
                            : 'Prospek'}
                        </span>
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>WhatsApp / Tel:</span>
                        </span>
                        <span className="font-mono font-medium text-slate-800">{client.telefon}</span>
                      </div>
                      {client.emel && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Emel:</span>
                          </span>
                          <span className="text-slate-700 truncate max-w-[160px]">{client.emel}</span>
                        </div>
                      )}
                    </div>

                    {/* Financial Summary Box */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Nilai Kontrak (LTV):</span>
                        <span className="font-bold font-mono text-slate-900">
                          RM {client.totalLtv.toLocaleString('ms-MY')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Jumlah Dibayar:</span>
                        <span className="font-bold font-mono text-emerald-700">
                          RM {client.totalPaid.toLocaleString('ms-MY')}
                        </span>
                      </div>
                      {client.totalBalance > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                          <span className="text-rose-600 font-medium">Baki Tertunggak:</span>
                          <span className="font-bold font-mono text-rose-600">
                            RM {client.totalBalance.toLocaleString('ms-MY')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Associated Projects & Invoices pill summary */}
                    <div className="mt-3 flex items-center flex-wrap gap-1.5 text-[11px]">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                        {client.projects.length} Projek
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {client.financialDocs.length} Dokumen Kewangan
                      </span>
                      {client.activeDealsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                          {client.activeDealsCount} Deal Saluran
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const short = getShortName(client.nama);
                        const msg = `Salam ${short}, saya daripada Provexa Solution. Ada sebarang perkembangan yang boleh kami bantu?`;
                        window.open(createWhatsAppUrl(client.telefon, msg), '_blank');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedClient(client)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span>Profil 360°</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUB-VIEW 3: PIPELINE ANALYTICS & REVENUE FORECASTING     */}
      {/* ========================================================= */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Funnel Conversion Breakdown Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Corong Penukaran Saluran Jualan (Sales Funnel)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualisasi bilangan deal merentasi 6 fasa penukaran hingga ke Deal Menang.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                Kadar Kemenangan: {pipelineMetrics.winRate}%
              </span>
            </div>

            {/* Funnel Bars */}
            <div className="space-y-3 pt-2">
              {PIPELINE_STAGES.filter((s) => s.key !== 'gagal').map((stage, idx, arr) => {
                const count = leads.filter((l) => l.status === stage.key).length;
                const totalActiveOrWon = leads.length || 1;
                const pct = Math.round((count / totalActiveOrWon) * 100);
                const stageTotalVal = leads
                  .filter((l) => l.status === stage.key)
                  .reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);

                return (
                  <div key={stage.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-800">{stage.label}</span>
                        <span className="text-[11px] text-slate-400">({stage.probability}% kebarangkalian)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{count} deal</span>
                        <span className="font-mono font-bold text-slate-900">
                          RM {stageTotalVal.toLocaleString('ms-MY')}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${stage.bg} transition-all duration-500 rounded-full`}
                        style={{ width: `${Math.max(4, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Forecast Summary Table */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Jadual Unjuran Hasil Mengikut Fasa (Weighted Pipeline Forecast)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengiraan jangkaan aliran tunai berasaskan kebarangkalian kejayaan setiap fasa deal.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5 px-3">Fasa Saluran</th>
                    <th className="py-2.5 px-3 text-center">Bil. Deal</th>
                    <th className="py-2.5 px-3 text-right">Nilai Penuh (RM)</th>
                    <th className="py-2.5 px-3 text-center">Kebarangkalian (%)</th>
                    <th className="py-2.5 px-3 text-right">Hasil Berbobot (RM)</th>
                    <th className="py-2.5 px-3">Cadangan Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PIPELINE_STAGES.map((stage) => {
                    const stageLeads = leads.filter((l) => l.status === stage.key);
                    const totalVal = stageLeads.reduce((sum, l) => sum + (l.anggaranBajet || 0), 0);
                    const weighted = Math.round(totalVal * (stage.probability / 100));

                    return (
                      <tr key={stage.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${stage.bg}`} />
                          <span>{stage.label}</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                          {stageLeads.length}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-900">
                          RM {totalVal.toLocaleString('ms-MY')}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-600">
                          {stage.probability}%
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-purple-700">
                          RM {weighted.toLocaleString('ms-MY')}
                        </td>
                        <td className="py-3 px-3 text-slate-500 text-[11px]">
                          {stage.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 font-bold bg-slate-50/90 text-slate-900">
                    <td className="py-3 px-3">JUMLAH KESELURUHAN</td>
                    <td className="py-3 px-3 text-center font-mono">{leads.length}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      RM{' '}
                      {leads
                        .reduce((sum, l) => sum + (l.anggaranBajet || 0), 0)
                        .toLocaleString('ms-MY')}
                    </td>
                    <td className="py-3 px-3 text-center">-</td>
                    <td className="py-3 px-3 text-right font-mono text-purple-700 font-extrabold text-sm">
                      RM {Math.round(pipelineMetrics.weightedForecast).toLocaleString('ms-MY')}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      Unjuran jualan realistik
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT DEAL MODAL                            */}
      {/* ========================================================= */}
      {isDealModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {editingLead ? 'Kemaskini Deal Pipeline' : 'Tambah Deal & Prospek Baharu'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Masukkan maklumat klien dan fasa rundingan dalam saluran jualan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDealModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDeal} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Klien <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="cth: Encik Kamaruzzaman"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Syarikat / Bisnes
                  </label>
                  <input
                    type="text"
                    value={formSyarikat}
                    onChange={(e) => setFormSyarikat(e.target.value)}
                    placeholder="cth: Mega Niaga Holdings"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nombor Telefon (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTelefon}
                    onChange={(e) => setFormTelefon(e.target.value)}
                    placeholder="cth: 0123456789"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Emel Klien
                  </label>
                  <input
                    type="email"
                    value={formEmel}
                    onChange={(e) => setFormEmel(e.target.value)}
                    placeholder="cth: kamarul@meganiaga.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Servis Provexa Diminati
                  </label>
                  <select
                    value={formServis}
                    onChange={(e) => {
                      const sKey = e.target.value as ProvexaService;
                      setFormServis(sKey);
                      if (!editingLead && activeCatalog[sKey]?.startingPrice) {
                        setFormAnggaran(activeCatalog[sKey].startingPrice);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {Object.values(activeCatalog).map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.title} (Bermula RM {s.startingPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Fasa Saluran (Pipeline Stage)
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {PIPELINE_STAGES.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label} ({st.probability}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nilai Anggaran (RM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formAnggaran}
                    onChange={(e) => setFormAnggaran(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Keutamaan
                  </label>
                  <select
                    value={formKeutamaan}
                    onChange={(e) => setFormKeutamaan(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="kritikal">Kritikal (Hot)</option>
                    <option value="tinggi">Tinggi</option>
                    <option value="sederhana">Sederhana</option>
                    <option value="rendah">Rendah</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Sumber Lead
                  </label>
                  <select
                    value={formSumber}
                    onChange={(e) => setFormSumber(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    {Object.entries(CRM_SOURCE_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Nota / Catatan Perkembangan Rundingan
                </label>
                <textarea
                  rows={3}
                  value={formNota}
                  onChange={(e) => setFormNota(e.target.value)}
                  placeholder="cth: Klien perlukan integrasi FPX dan modul WhatsApp notifikasi. Perbincangan seterusnya dijadualkan hari Jumaat."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
                >
                  {editingLead ? 'Simpan Kemaskini' : 'Tambah Deal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: QUICK CRM INTERACTION LOG MODAL                 */}
      {/* ========================================================= */}
      {logModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Catat Interaksi CRM</h3>
                  <p className="text-[11px] text-slate-500 font-mono">{logModalLead.nama}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLogModalLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-3 pt-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Jenis Interaksi
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                      { id: 'panggilan', label: 'Panggilan', icon: Phone },
                      { id: 'meeting', label: 'Meeting', icon: Users },
                      { id: 'nota', label: 'Nota', icon: Edit3 },
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLogType(item.id)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-semibold flex flex-col items-center gap-1 border transition-all ${
                          logType === item.id
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Kandungan Nota / Ringkasan Perbualan
                </label>
                <textarea
                  required
                  rows={4}
                  value={logText}
                  onChange={(e) => setLogText(e.target.value)}
                  placeholder="cth: Menghubungi klien melalui WhatsApp. Klien bersetuju dengan harga RM3,500 dan memohon draf sebutharga dihantar hari ini."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLogModalLead(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Simpan Nota Interaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: CRM 360° CLIENT PROFILE DETAIL VIEW              */}
      {/* ========================================================= */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedClient.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                      {selectedClient.nama}
                    </h3>
                    <span
                      className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedClient.tier === 'vip'
                          ? 'bg-amber-100 text-amber-800'
                          : selectedClient.tier === 'aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {selectedClient.tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedClient.syarikat || 'Persendirian'} • {selectedClient.telefon}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Financial Overview Tiles */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  Nilai Kontrak (LTV)
                </span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  RM {selectedClient.totalLtv.toLocaleString('ms-MY')}
                </span>
              </div>
              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">
                  Telah Dijelaskan
                </span>
                <span className="text-sm font-extrabold font-mono text-emerald-800">
                  RM {selectedClient.totalPaid.toLocaleString('ms-MY')}
                </span>
              </div>
              <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                <span className="text-[10px] text-rose-700 block uppercase font-bold">
                  Baki Perlu Dituntut
                </span>
                <span className="text-sm font-extrabold font-mono text-rose-800">
                  RM {selectedClient.totalBalance.toLocaleString('ms-MY')}
                </span>
              </div>
            </div>

            {/* Projects Timeline / History */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Projek Berkaitan ({selectedClient.projects.length})
              </h4>
              {selectedClient.projects.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                  Belum ada projek aktif yang disahkan.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedClient.projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-700">
                            {p.kodProjek}
                          </span>
                          <span className="font-semibold text-slate-900">{p.tajuk}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Status: {p.status} • Kemajuan: {p.kemajuanPeratus}%
                        </p>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        RM {p.nilaiKontrak.toLocaleString('ms-MY')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Docs List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Dokumen Invois, Resit &amp; Sebutharga ({selectedClient.financialDocs.length})
              </h4>
              {selectedClient.financialDocs.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl">
                  Tiada rekod invois atau resit untuk klien ini.
                </p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5">
                  {selectedClient.financialDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                            doc.jenis === 'invois'
                              ? 'bg-blue-100 text-blue-800'
                              : doc.jenis === 'resit'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {doc.noDokumen}
                        </span>
                        <span className="truncate max-w-[200px] text-slate-700">{doc.tajukProjek}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        RM {doc.jumlahKeseluruhan.toLocaleString('ms-MY')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interaction Logs / Notes */}
            {selectedClient.latestNote && (
              <div className="space-y-1 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-xs">
                <span className="text-[10px] font-bold text-indigo-700 uppercase">
                  Catatan Interaksi Terkini
                </span>
                <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                  {selectedClient.latestNote}
                </p>
              </div>
            )}

            {/* Footer buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const short = getShortName(selectedClient.nama);
                  window.open(
                    createWhatsAppUrl(
                      selectedClient.telefon,
                      `Salam ${short}, saya dari Provexa Solution.`
                    ),
                    '_blank'
                  );
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Buka WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DELETE DEAL CONFIRMATION MODAL                   */}
      {/* ========================================================= */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Padam Deal Ini?</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{leadToDelete.telefon}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-600 space-y-1 mb-4">
              <p className="font-semibold text-slate-900 line-clamp-2">
                {leadToDelete.nama} {leadToDelete.syarikat && `(${leadToDelete.syarikat})`}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate max-w-[190px]">
                  {activeCatalog[leadToDelete.servisMinat]?.title || leadToDelete.servisMinat}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  RM {(leadToDelete.anggaranBajet || 0).toLocaleString('ms-MY')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Rekod deal ini akan dialih keluar daripada saluran pipeline secara kekal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLead(leadToDelete.id);
                  setLeadToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Padam</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
