import React, { useState } from 'react';
import {
  FolderKanban,
  Users,
  DollarSign,
  FileText,
  Scale,
  Plus,
  ArrowRight,
  MessageCircle,
  Clock,
  Calendar,
  Sparkles,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Briefcase,
  Layers,
  Send,
  Building2,
  Phone,
  Search,
  Check,
  ChevronRight,
  Globe,
  Tag,
  Code2,
  Cpu,
  GraduationCap,
  Share2,
  Target,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  Project,
  Lead,
  FinancialDoc,
  AgreementDoc,
  Reminder,
  ProvexaService,
  PROVEXA_SERVICES,
  ServiceMeta,
} from '../types';
import { createWhatsAppUrl, getShortName, displayFormattedPhone } from '../utils/whatsapp';

interface DashboardViewProps {
  projects: Project[];
  leads: Lead[];
  financialDocs: FinancialDoc[];
  agreements: AgreementDoc[];
  reminders: Reminder[];
  services?: Record<string, ServiceMeta>;
  onNavigateToProjects: (statusFilter?: string) => void;
  onNavigateToLeads: (statusFilter?: string) => void;
  onNavigateToFinancialDocs: () => void;
  onNavigateToAgreements: () => void;
  onNavigateToReminders: () => void;
  onNavigateToPublicForm: () => void;
  onNavigateToServicesCatalog: () => void;
  onNavigateToDigitalRetail?: () => void;
  onNavigateToAnalytics?: () => void;
  onNavigateToCrm?: () => void;
  onOpenNewProjectModal: () => void;
  onOpenNewLeadModal: () => void;
  onOpenDocGenerator: () => void;
  onOpenAgreementGenerator: () => void;
  onEditDoc?: (doc: FinancialDoc) => void;
  onEditProject?: (project: Project) => void;
  onOpenFollowupModal?: (lead: Lead) => void;
  onGenerateQuotationForLead?: (lead: Lead) => void;
  onUpdateReminderStatus?: (id: string, status: 'belum' | 'selesai' | 'dibatalkan') => void;
  onSyncGoogleSheets?: () => void;
  isSyncing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  leads,
  financialDocs,
  agreements,
  reminders,
  services,
  onNavigateToProjects,
  onNavigateToLeads,
  onNavigateToFinancialDocs,
  onNavigateToAgreements,
  onNavigateToReminders,
  onNavigateToPublicForm,
  onNavigateToServicesCatalog,
  onNavigateToDigitalRetail,
  onNavigateToAnalytics,
  onNavigateToCrm,
  onOpenNewProjectModal,
  onOpenNewLeadModal,
  onOpenDocGenerator,
  onOpenAgreementGenerator,
  onEditDoc,
  onEditProject,
  onOpenFollowupModal,
  onGenerateQuotationForLead,
  onUpdateReminderStatus,
  onSyncGoogleSheets,
  isSyncing = false,
}) => {
  const [docFilter, setDocFilter] = useState<'semua' | 'invois' | 'sebutharga' | 'resit'>('semua');
  const [leadFilter, setLeadFilter] = useState<string>('semua');

  // Financial metrics
  const totalContractValue = projects.reduce((acc, p) => acc + (p.nilaiKontrak || 0), 0);
  const totalCollected = projects.reduce((acc, p) => acc + (p.jumlahDibayar || 0), 0);
  const totalOutstanding = Math.max(0, totalContractValue - totalCollected);
  const collectionRate = totalContractValue > 0 ? Math.round((totalCollected / totalContractValue) * 100) : 0;

  // Pipeline CRM metrics from leads
  const activePipelineDeals = leads.filter((l) => l.status !== 'berjaya' && l.status !== 'gagal');
  const totalPipelineValue = activePipelineDeals.reduce((acc, l) => acc + (l.anggaranBajet || 0), 0);
  const wonLeadsCount = leads.filter((l) => l.status === 'berjaya').length;
  const winRate = leads.length > 0 ? Math.round((wonLeadsCount / leads.length) * 100) : 0;

  // Project status counts
  const inProgressProjects = projects.filter((p) => p.status === 'pembangunan');
  const uatProjects = projects.filter((p) => p.status === 'semakan_uat');
  const planningProjects = projects.filter((p) => p.status === 'perancangan');
  const activeDevProjects = inProgressProjects.length + uatProjects.length;
  const completedProjects = projects.filter((p) => p.status === 'selesai');

  // Chart data: Projects pipeline
  const pipelineData = [
    { name: 'Rundingan', count: projects.filter((p) => p.status === 'rundingan').length, fill: '#64748b' },
    { name: 'Perancangan', count: planningProjects.length, fill: '#6366f1' },
    { name: 'Pembangunan', count: inProgressProjects.length, fill: '#3b82f6' },
    { name: 'Semakan UAT', count: uatProjects.length, fill: '#0ea5e9' },
    { name: 'Selesai', count: completedProjects.length, fill: '#10b981' },
  ];

  // Pipeline stages mini summary
  const pipelineStages = [
    { id: 'baru', label: 'Inkuiri', count: leads.filter((l) => l.status === 'baru').length, color: 'bg-blue-500' },
    { id: 'dihubungi', label: 'Dihubungi', count: leads.filter((l) => l.status === 'dihubungi').length, color: 'bg-indigo-500' },
    { id: 'sesi_discovery', label: 'Discovery', count: leads.filter((l) => l.status === 'sesi_discovery').length, color: 'bg-purple-500' },
    { id: 'sebutharga_dihantar', label: 'Sebutharga', count: leads.filter((l) => l.status === 'sebutharga_dihantar').length, color: 'bg-amber-500' },
    { id: 'tunggu_deposit', label: 'Tunggu Deposit', count: leads.filter((l) => l.status === 'tunggu_deposit').length, color: 'bg-emerald-500' },
    { id: 'berjaya', label: 'Deal Menang', count: wonLeadsCount, color: 'bg-teal-500' },
  ];

  // Service distribution across projects & leads
  const activeCatalogList: ServiceMeta[] = services ? Object.values(services) : Object.values(PROVEXA_SERVICES);
  const serviceStats = activeCatalogList.map((srv) => {
    const projectCount = projects.filter(
      (p) => p.servisUtama === srv.key || p.servisTambahan?.includes(srv.key)
    ).length;
    const leadCount = leads.filter((l) => l.servisMinat === srv.key).length;
    return {
      service: srv,
      projectCount,
      leadCount,
      totalInterest: projectCount + leadCount,
    };
  });

  // Upcoming reminders
  const pendingReminders = reminders
    .filter((r) => !r.selesai)
    .sort((a, b) => a.tarikh.localeCompare(b.tarikh));

  // Financial docs filtered
  const filteredDocs = financialDocs
    .filter((d) => (docFilter === 'semua' ? true : d.jenis === docFilter))
    .slice(0, 5);

  // Recent leads filtered
  const filteredLeads = leads
    .filter((l) => (leadFilter === 'semua' ? true : l.status === leadFilter))
    .slice(0, 5);

  // Quick WhatsApp handlers
  const handleQuickWhatsAppProject = (p: Project) => {
    const short = getShortName(p.namaKlien);
    const msg =
      `Salam ${short}, saya dari Provexa Solution berhubung projek *${p.tajuk}* (${p.kodProjek}).\n\n` +
      `Status kemajuan semasa: *${p.kemajuanPeratus}% siap*.\n` +
      (p.pautanHasil ? `Pautan semakan/staging: ${p.pautanHasil}\n` : '') +
      `Baki kontrak: RM ${(p.nilaiKontrak - p.jumlahDibayar).toLocaleString('ms-MY')}.\n\n` +
      `Adakah terdapat sebarang maklum balas atau semakan yang perlu kami bantu? Terima kasih.`;
    window.open(createWhatsAppUrl(p.telefonKlien, msg), '_blank');
  };

  const handleQuickWhatsAppLead = (l: Lead) => {
    const short = getShortName(l.nama);
    const srvMeta = PROVEXA_SERVICES[l.servisMinat];
    const srvTitle = srvMeta ? srvMeta.title : l.servisMinat;
    const msg =
      `Salam ${short}, terima kasih kerana berminat dengan servis *${srvTitle}* dari Provexa Solution.\n\n` +
      `Saya perhatikan bajet anggaran anda sekitar *RM ${l.anggaranBajet.toLocaleString('ms-MY')}*.\n` +
      `Boleh kami kongsikan cadangan skop kerja & sebutharga rasmi untuk perbincangan lanjut?`;
    window.open(createWhatsAppUrl(l.telefon, msg), '_blank');
  };

  const handleQuickWhatsAppInvoice = (doc: FinancialDoc) => {
    const short = getShortName(doc.klien.nama);
    const msg =
      `Salam ${short}, ini adalah peringatan mesra berhubung *Invois ${doc.noDokumen}* untuk projek *${doc.tajukProjek}*.\n\n` +
      `Jumlah keseluruhan: RM ${doc.jumlahKeseluruhan.toLocaleString('ms-MY')}\n` +
      `Baki perlu dibayar: *RM ${doc.bakiPerluDibayar.toLocaleString('ms-MY')}*\n` +
      `Akaun Bank: ${doc.syarikatPengeluar.bankNama} (${doc.syarikatPengeluar.bankAkaun})\n\n` +
      `Sila maklumkan kepada kami sekiranya bayaran telah dibuat. Terima kasih atas kerjasama anda.`;
    window.open(createWhatsAppUrl(doc.klien.telefon, msg), '_blank');
  };

  const getServiceIcon = (key: string) => {
    switch (key) {
      case 'website':
        return <Globe className="w-4 h-4 text-blue-600" />;
      case 'saas':
        return <Code2 className="w-4 h-4 text-indigo-600" />;
      case 'training':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case 'consultation':
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      case 'social_media':
        return <Share2 className="w-4 h-4 text-pink-600" />;
      case 'paid_ads':
        return <Target className="w-4 h-4 text-purple-600" />;
      case 'promptgalerix':
        return <Cpu className="w-4 h-4 text-violet-600" />;
      case 'brandup4u':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      default:
        return <Layers className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-7 pb-12 animate-in fade-in duration-300">
      {/* 1. Header Bar with Integrated Fast Actions */}
      <div
        id="dashboard-header-bar"
        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_30px_rgba(15,23,42,0.03)] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 shadow-2xs">
              Provexa Solution HQ
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Pusat Kawalan Operasi &amp; Jualan 360°</span>
            {isSyncing && (
              <span className="inline-flex items-center space-x-1 text-emerald-600 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Menyegerak Google Sheets...</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Ringkasan Operasi &amp; Prestasi Jualan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal max-w-2xl">
            Pantau 8 servis utama, aliran tunai kutipan invois, kitaran pembangunan projek, dan penukaran prospek CRM dalam satu paparan padat.
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2 pt-2 lg:pt-0">
          {onNavigateToCrm && (
            <button
              id="btn-dash-crm"
              type="button"
              onClick={onNavigateToCrm}
              className="px-3.5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-indigo-700 font-bold text-xs border border-indigo-100/90 shadow-[0_2px_10px_rgba(79,70,229,0.06)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
            >
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span>Pipeline CRM ({activePipelineDeals.length})</span>
            </button>
          )}

          {onNavigateToAnalytics && (
            <button
              id="btn-dash-analytics"
              type="button"
              onClick={onNavigateToAnalytics}
              className="px-3.5 py-2.5 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100/90 text-indigo-700 font-semibold text-xs border border-indigo-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>Analitik Jualan</span>
            </button>
          )}

          {onNavigateToDigitalRetail && (
            <button
              id="btn-dash-digital-retail"
              type="button"
              onClick={onNavigateToDigitalRetail}
              className="px-3.5 py-2.5 rounded-2xl bg-sky-50/80 hover:bg-sky-100/90 text-sky-800 font-semibold text-xs border border-sky-200/70 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4 text-sky-600" />
              <span>Produk Digital (Retail)</span>
            </button>
          )}

          {onSyncGoogleSheets && (
            <button
              id="btn-dash-sync-all"
              type="button"
              onClick={onSyncGoogleSheets}
              disabled={isSyncing}
              title="Segerak Semua Data (Leads, Projek, Invois, Perjanjian) ke Google Sheets"
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-800 font-bold text-xs border border-emerald-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyegerak...' : 'Segerak Semua (Sheets)'}</span>
            </button>
          )}

          <button
            id="btn-dash-new-doc"
            type="button"
            onClick={onOpenDocGenerator}
            className="px-3.5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>Jana Invois / Quo</span>
          </button>

          <button
            id="btn-dash-new-agreement"
            type="button"
            onClick={onOpenAgreementGenerator}
            className="px-3.5 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-semibold text-xs border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
          >
            <Scale className="w-4 h-4 text-purple-500" />
            <span>Jana Perjanjian</span>
          </button>

          <button
            id="btn-dash-new-project"
            type="button"
            onClick={onOpenNewProjectModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Projek Baharu</span>
          </button>
        </div>
      </div>

      {/* 2. Top 5 High-Impact Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Active Projects */}
        <div
          id="card-kpi-projects"
          onClick={() => onNavigateToProjects('pembangunan')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-indigo-400/15 blur-2xl group-hover:bg-indigo-400/25 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projek Aktif</span>
              <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-200/50 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeDevProjects}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {projects.length} projek
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-200/60">
            <span className="font-semibold text-slate-600">{inProgressProjects.length} Dev • {uatProjects.length} UAT</span>
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 2: Total Contract Value */}
        <div
          id="card-kpi-contract-value"
          onClick={onNavigateToFinancialDocs}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-emerald-400/15 blur-2xl group-hover:bg-emerald-400/25 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Kontrak</span>
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-200/50 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-slate-900 tracking-tight">
                RM {totalContractValue.toLocaleString('ms-MY')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-200/60">
            <span className="text-emerald-700 font-semibold">
              Kutipan: {collectionRate}%
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 3: Outstanding AR Receivables */}
        <div
          id="card-kpi-outstanding"
          onClick={onNavigateToFinancialDocs}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-rose-400/15 blur-2xl group-hover:bg-rose-400/25 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Baki Dituntut</span>
              <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200/50 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-rose-600 tracking-tight">
                RM {totalOutstanding.toLocaleString('ms-MY')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-200/60">
            <span className="text-slate-600 font-medium">Berdasarkan fasa</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 4: CRM Pipeline Value */}
        <div
          id="card-kpi-pipeline"
          onClick={onNavigateToCrm ? onNavigateToCrm : () => onNavigateToLeads('semua')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-violet-400/15 blur-2xl group-hover:bg-violet-400/25 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saluran Pipeline</span>
              <div className="w-9 h-9 rounded-2xl bg-violet-500/10 text-violet-600 border border-violet-200/50 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitBranch className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-extrabold font-mono text-violet-700 tracking-tight">
                RM {totalPipelineValue.toLocaleString('ms-MY')}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-200/60">
            <span className="text-violet-700 font-semibold">{activePipelineDeals.length} Deal Aktif</span>
            <ArrowRight className="w-3.5 h-3.5 text-violet-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* KPI 5: Total Leads */}
        <div
          id="card-kpi-leads"
          onClick={() => onNavigateToLeads('semua')}
          className="glass-card glass-card-hover rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-blue-400/15 blur-2xl group-hover:bg-blue-400/25 transition-all pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</span>
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-200/50 shadow-2xs flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {leads.length}
              </span>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                {leads.filter((l) => l.status === 'baru').length} baru
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-4 pt-2.5 border-t border-slate-200/60">
            <span className="text-slate-600 font-semibold">Win Rate: {winRate}%</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Saluran Jualan & Pipeline Funnel Bar (Mini Kanban Bar) */}
      <div
        id="dashboard-pipeline-strip"
        className="glass-card rounded-3xl p-5 border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
              <GitBranch className="w-4 h-4 text-indigo-600" />
              <span>Saluran Jualan &amp; Status Prospek CRM</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pecahan deals mengikut fasa penukaran jualan terkini
            </p>
          </div>
          {onNavigateToCrm && (
            <button
              type="button"
              onClick={onNavigateToCrm}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 self-start sm:self-auto bg-indigo-50/70 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all"
            >
              <span>Buka Papan Kanban CRM Penuh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          {pipelineStages.map((st) => (
            <div
              key={st.id}
              onClick={() => (onNavigateToCrm ? onNavigateToCrm() : onNavigateToLeads(st.id))}
              className="p-3 rounded-2xl border border-white/80 bg-white/70 hover:bg-white shadow-2xs hover:shadow-sm cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <span className={`w-2 h-2 rounded-full ${st.color}`} />
                <span className="text-xs font-bold text-slate-700 truncate">{st.label}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{st.count}</span>
                <span className="text-[10px] text-slate-400 font-medium">deals</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Section: Project Pipeline Chart & Active Development Projects Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Project Pipeline Chart & Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <FolderKanban className="w-4 h-4 text-indigo-600" />
                  <span>Peringkat Kitaran Projek Provexa</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Agihan projek mengikut fasa pengurusan semasa
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToProjects('semua')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1 bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all"
              >
                <span>Lihat Semua ({projects.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`${value} Projek`, 'Jumlah']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.92)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: '1px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Projects List */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  <span>Projek Dalam Pembangunan &amp; Semakan UAT</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pemantauan milestone, baki kontrak dan penyerahan kerja
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToProjects('semua')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all"
              >
                Urus Projek →
              </button>
            </div>

            <div className="space-y-3">
              {projects.filter((p) => p.status !== 'selesai' && p.status !== 'batal').length === 0 ? (
                <div className="text-center py-8 rounded-2xl bg-white/40 border border-dashed border-slate-200 text-slate-400 text-xs">
                  <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <span>Tiada projek aktif pada masa ini. Tekan butang "Projek Baharu" untuk mula.</span>
                </div>
              ) : (
                projects
                  .filter((p) => p.status !== 'selesai' && p.status !== 'batal')
                  .slice(0, 4)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-white/90 bg-white/70 hover:bg-white shadow-[0_4px_15px_rgba(15,23,42,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-2xs">
                            {p.kodProjek}
                          </span>
                          <span className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                            {p.tajuk}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                            {p.kemajuanPeratus}% Siap
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-200/60 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all shadow-xs"
                          style={{ width: `${p.kemajuanPeratus}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 flex-wrap gap-2">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="text-slate-800 font-semibold truncate flex items-center space-x-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.syarikatKlien || p.namaKlien}</span>
                          </span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-900">
                            RM {p.nilaiKontrak.toLocaleString('ms-MY')}
                          </span>
                          <span className="text-slate-400 hidden sm:inline">• Sasaran: {p.tarikhSasaran}</span>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {onEditProject && (
                            <button
                              type="button"
                              onClick={() => onEditProject(p)}
                              className="text-slate-600 hover:text-indigo-600 font-medium px-2.5 py-1 rounded-xl bg-slate-100/70 hover:bg-slate-100 transition-all text-[11px]"
                            >
                              Perincian
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleQuickWhatsAppProject(p)}
                            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center space-x-1 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-200/60 shadow-2xs transition-all"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right (1 col): Ringkasan Aliran Tunai & Janji Temu */}
        <div className="space-y-6">
          {/* Cashflow & Collection Mini Widget */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Kutipan &amp; Aliran Tunai</span>
                </h3>
                <p className="text-xs text-slate-400">Prestasi penerimaan bayaran klien</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToFinancialDocs}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all"
              >
                Invois →
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-800 font-medium">Jumlah Diterima (Kutipan)</span>
                <span className="font-mono font-bold text-emerald-900">
                  RM {totalCollected.toLocaleString('ms-MY')}
                </span>
              </div>
              <div className="w-full h-2.5 bg-emerald-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-emerald-700 pt-0.5">
                <span>{collectionRate}% daripada nilai kontrak</span>
                <span>Baki: RM {totalOutstanding.toLocaleString('ms-MY')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/70 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">INVOIS LUNAS</span>
                <span className="text-base font-extrabold text-emerald-600">
                  {financialDocs.filter((d) => d.jenis === 'invois' && d.statusBayaran === 'lunas').length}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Invois selesai bayar</span>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">TERTUNGGAK</span>
                <span className="text-base font-extrabold text-rose-600">
                  {financialDocs.filter((d) => d.jenis === 'invois' && d.statusBayaran !== 'lunas').length}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Menunggu bayaran</span>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders Card */}
          <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Janji Temu &amp; Sasaran</span>
                </h3>
                <p className="text-xs text-slate-400">Mesyuarat &amp; tarikh akhir terdekat</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToReminders}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all"
              >
                Semua ({reminders.length}) →
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {pendingReminders.length === 0 ? (
                <div className="text-center py-7 rounded-2xl bg-white/40 border border-dashed border-slate-200 text-slate-400 text-xs">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
                  <span>Tiada aktiviti tertunggak. Semua selesai!</span>
                </div>
              ) : (
                pendingReminders.slice(0, 4).map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl border border-white/80 bg-white/70 hover:bg-white shadow-[0_2px_8px_rgba(15,23,42,0.02)] text-xs space-y-1.5 transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 truncate">
                        {onUpdateReminderStatus && (
                          <button
                            type="button"
                            onClick={() => onUpdateReminderStatus(rem.id, 'selesai')}
                            title="Tandakan sebagai selesai"
                            className="w-4 h-4 rounded-full border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 flex items-center justify-center shrink-0 transition-all text-transparent hover:text-emerald-600"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                        <span className="font-bold text-slate-800 truncate">
                          {rem.tajuk}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 shrink-0">
                        {rem.tarikh} {rem.masa ? `• ${rem.masa}` : ''}
                      </span>
                    </div>
                    {rem.nota && (
                      <p className="text-[11px] text-slate-500 line-clamp-1 pl-6">
                        {rem.nota}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Section: Kewangan, Invois & Sebutharga Terkini (Full Polish Section) */}
      <div
        id="dashboard-financial-docs-section"
        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              <span>Dokumen Kewangan &amp; Kutipan Terkini</span>
            </h3>
            <p className="text-xs text-slate-400">
              Invois rasmi, sebutharga projek, dan resit bayaran Provexa Solution
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Filter Pills */}
            <div className="inline-flex rounded-xl bg-slate-100/90 p-1 text-xs">
              {(['semua', 'invois', 'sebutharga', 'resit'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocFilter(t)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                    docFilter === t
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onNavigateToFinancialDocs}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all flex items-center space-x-1"
            >
              <span>Semua Dokumen ({financialDocs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="text-center py-9 rounded-2xl bg-white/40 border border-dashed border-slate-200 text-slate-400 text-xs">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
            <span>Tiada dokumen kewangan dijumpai untuk kategori ini. Tekan butang "Jana Invois / Quo" di atas.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase">
                  <th className="py-3 px-3">No. Dokumen</th>
                  <th className="py-3 px-3">Projek &amp; Klien</th>
                  <th className="py-3 px-3">Tarikh</th>
                  <th className="py-3 px-3">Jumlah (RM)</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Tindakan Pantas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => {
                  const isPaid = doc.statusBayaran === 'lunas';
                  const isPartial = doc.statusBayaran === 'sebahagian';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-white/80 transition-colors group"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase ${
                              doc.jenis === 'invois'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : doc.jenis === 'sebutharga'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}
                          >
                            {doc.jenis === 'invois' ? 'INV' : doc.jenis === 'sebutharga' ? 'QUO' : 'REC'}
                          </span>
                          <span>{doc.noDokumen}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-[220px] truncate">
                        <p className="font-bold text-slate-900 truncate">{doc.tajukProjek}</p>
                        <p className="text-[11px] text-slate-500 truncate">{doc.klien.syarikat || doc.klien.nama}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono">
                        {doc.tarikh}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                        RM {doc.jumlahKeseluruhan.toLocaleString('ms-MY')}
                        {doc.bakiPerluDibayar > 0 && (
                          <span className="block text-[10px] text-rose-500 font-normal">
                            Baki: RM {doc.bakiPerluDibayar.toLocaleString('ms-MY')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isPartial
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isPaid ? 'Lunas' : isPartial ? 'Sebahagian' : 'Belum Bayar'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {onEditDoc && (
                            <button
                              type="button"
                              onClick={() => onEditDoc(doc)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 font-semibold transition-all text-[11px]"
                            >
                              Papar
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleQuickWhatsAppInvoice(doc)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200/60 shadow-2xs transition-all flex items-center space-x-1 text-[11px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
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
      </div>

      {/* 6. Section: Leads Masuk & Tindakan Follow-up Segera */}
      <div
        id="dashboard-leads-inquiries-section"
        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Inkuiri &amp; Prospek Masuk Terkini</span>
            </h3>
            <p className="text-xs text-slate-400">
              Leads daripada Borang Web, WhatsApp &amp; Iklan yang memerlukan follow-up segera
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="inline-flex rounded-xl bg-slate-100/90 p-1 text-xs">
              <button
                type="button"
                onClick={() => setLeadFilter('semua')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  leadFilter === 'semua'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setLeadFilter('baru')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  leadFilter === 'baru'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Baru ({leads.filter((l) => l.status === 'baru').length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigateToLeads('semua')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all flex items-center space-x-1"
            >
              <span>Urus Semua Leads ({leads.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLeads.length === 0 ? (
            <div className="col-span-full text-center py-8 rounded-2xl bg-white/40 border border-dashed border-slate-200 text-slate-400 text-xs">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-blue-500" />
              <span>Tiada leads dalam kategori ini.</span>
            </div>
          ) : (
            filteredLeads.map((l) => {
              const srv = PROVEXA_SERVICES[l.servisMinat];

              return (
                <div
                  key={l.id}
                  className="p-4 rounded-2xl border border-white/90 bg-white/70 hover:bg-white shadow-[0_3px_12px_rgba(15,23,42,0.02)] hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-3 text-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <p className="font-bold text-slate-900 text-sm truncate">{l.nama}</p>
                        <p className="text-[11px] text-slate-500 truncate flex items-center space-x-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{l.syarikat || 'Individu / Persendirian'}</span>
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${
                          l.status === 'baru'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : l.status === 'berjaya'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5 truncate">
                        {getServiceIcon(l.servisMinat)}
                        <span className="font-semibold text-slate-800 truncate">
                          {srv ? srv.shortTitle : l.servisMinat}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-indigo-700 shrink-0">
                        RM {l.anggaranBajet.toLocaleString('ms-MY')}
                      </span>
                    </div>

                    {l.keperluanProjek && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                        "{l.keperluanProjek}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {displayFormattedPhone(l.telefon)}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {onOpenFollowupModal && (
                        <button
                          type="button"
                          onClick={() => onOpenFollowupModal(l)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all text-[11px]"
                        >
                          Log
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleQuickWhatsAppLead(l)}
                        className="px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200/60 shadow-2xs transition-all flex items-center space-x-1 text-[11px]"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Sapa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 7. Section: Portfolio 8 Servis Utama Provexa Solution */}
      <div
        id="dashboard-services-portfolio-section"
        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Portfolio 8 Servis Utama Provexa Solution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Statistik permintaan pasaran, projek aktif, dan harga asas setiap perkhidmatan
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToServicesCatalog}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-white/70 hover:bg-white px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs transition-all flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Buka Katalog Servis Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {serviceStats.map(({ service, projectCount, leadCount }) => (
            <div
              key={service.key}
              onClick={onNavigateToServicesCatalog}
              className="p-4 rounded-2xl border border-white/85 bg-white/70 hover:bg-white shadow-[0_3px_12px_rgba(15,23,42,0.02)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col justify-between space-y-3 text-xs group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    {getServiceIcon(service.key)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {service.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                  {service.shortTitle}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-normal">
                  {service.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block">Bermula dari</span>
                  <span className="font-mono font-bold text-indigo-700">
                    RM {service.startingPrice.toLocaleString('ms-MY')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                    {projectCount} Projek
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                    {leadCount} Leads
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Hab Tindakan Pantas & Sistem Status Footer (Bottom Comprehensive Finish) */}
      <div
        id="dashboard-quick-actions-hub"
        className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] space-y-5"
      >
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Hab Pintasan Pantas Operasi Provexa</span>
          </h3>
          <p className="text-xs text-slate-400">
            Akses pantas ke borang awam, penyegerakan Google Sheets, dan templat perniagaan
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Quick Hub 1: Borang Minat Awam */}
          <div
            onClick={onNavigateToPublicForm}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-violet-50/70 border border-indigo-100/80 hover:bg-white hover:border-indigo-200 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Borang Klien</span>
              <Globe className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 text-sm">Borang Minat Awam</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Borang pendaftaran intake untuk prospek dan iklan.</p>
            </div>
            <div className="flex items-center text-xs font-bold text-indigo-600 space-x-1 pt-1">
              <span>Buka Borang Awam</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Quick Hub 2: Google Sheets Sync */}
          <div
            onClick={onSyncGoogleSheets}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border border-emerald-100/80 hover:bg-white hover:border-emerald-200 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Cloud Data</span>
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 text-sm">Segerak Google Sheets</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Hantar dan kemaskini semua data ke spreadsheet.</p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-600 space-x-1 pt-1">
              <span>{isSyncing ? 'Sedang Menyegerak...' : 'Segerak Sekarang'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Quick Hub 3: Saluran Pipeline CRM */}
          <div
            onClick={onNavigateToCrm ? onNavigateToCrm : () => onNavigateToLeads('semua')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-pink-50/70 border border-purple-100/80 hover:bg-white hover:border-purple-200 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">CRM Pipeline</span>
              <GitBranch className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 text-sm">Saluran Pipeline Deals</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Pantau {activePipelineDeals.length} deals dalam fasa perbincangan.</p>
            </div>
            <div className="flex items-center text-xs font-bold text-purple-600 space-x-1 pt-1">
              <span>Buka Saluran CRM</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Quick Hub 4: Jana Sebutharga & Dokumen */}
          <div
            onClick={onOpenDocGenerator}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-100/80 hover:bg-white hover:border-amber-200 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col justify-between space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Dokumen Rasmi</span>
              <FileText className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h5 className="font-bold text-slate-900 text-sm">Penjana Dokumen Pantas</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">Cipta Sebutharga, Invois rasmi atau Resit dalam 1 minit.</p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-600 space-x-1 pt-1">
              <span>Cipta Dokumen</span>
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Operational Footer Note */}
        <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="font-medium text-slate-600">Sistem Operasi Provexa Berfungsi Sepenuhnya</span>
            <span>•</span>
            <span>8 Servis Digital</span>
            <span>•</span>
            <span>Integrasi WhatsApp Pintar</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Remix CRM Project • Provexa Solution
          </div>
        </div>
      </div>
    </div>
  );
};
