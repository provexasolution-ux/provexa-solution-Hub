import React, { useState, useMemo } from 'react';
import {
  FolderKanban,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  FileText,
  Scale,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Building2,
  Receipt,
  LayoutGrid,
  List,
  X,
  User,
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  ProvexaService,
  PROVEXA_SERVICES,
  PriorityLevel,
  DocType,
  AgreementType,
} from '../types';
import { createWhatsAppUrl, getShortName } from '../utils/whatsapp';

interface ProjectsManagerProps {
  projects: Project[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onGenerateInvoice: (project: Project) => void;
  onGenerateQuotation: (project: Project) => void;
  onGenerateReceipt: (project: Project) => void;
  onGenerateAgreement: (project: Project) => void;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  rundingan: {
    label: 'Rundingan',
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
  },
  perancangan: {
    label: 'Perancangan',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200/70',
  },
  pembangunan: {
    label: 'Pembangunan',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200/70',
  },
  semakan_uat: {
    label: 'Semakan UAT',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200/70',
  },
  selesai: {
    label: 'Selesai',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/70',
  },
  penyelenggaraan: {
    label: 'Penyelenggaraan',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200/70',
  },
};

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onGenerateInvoice,
  onGenerateQuotation,
  onGenerateReceipt,
  onGenerateAgreement,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [serviceFilter, setServiceFilter] = useState<string>('semua');
  const [clientFilter, setClientFilter] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'pembangunan');
  const uatProjects = projects.filter((p) => p.status === 'semakan_uat');
  const completedProjects = projects.filter((p) => p.status === 'selesai');
  const totalContractValue = projects.reduce((acc, p) => acc + (p.nilaiKontrak || 0), 0);
  const totalPaid = projects.reduce((acc, p) => acc + (p.jumlahDibayar || 0), 0);
  const totalUnpaid = Math.max(0, totalContractValue - totalPaid);

  // Unique Clients for filtering
  const uniqueClients = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>();
    projects.forEach((p) => {
      const key = p.syarikatKlien?.trim() || p.namaKlien?.trim();
      if (key) {
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, { label: key, count: 1 });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [projects]);

  // Filtered
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        p.tajuk.toLowerCase().includes(q) ||
        p.kodProjek.toLowerCase().includes(q) ||
        p.namaKlien.toLowerCase().includes(q) ||
        (p.syarikatKlien && p.syarikatKlien.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'semua' || p.status === statusFilter;
      const matchService =
        serviceFilter === 'semua' ||
        p.servisUtama === serviceFilter ||
        (p.servisTambahan && p.servisTambahan.includes(serviceFilter as ProvexaService));

      const matchClient =
        clientFilter === 'semua' ||
        p.namaKlien === clientFilter ||
        p.syarikatKlien === clientFilter;

      return matchSearch && matchStatus && matchService && matchClient;
    });
  }, [projects, searchQuery, statusFilter, serviceFilter, clientFilter]);

  const handleWhatsAppClient = (project: Project) => {
    const short = getShortName(project.namaKlien);
    const text =
      `Salam ${short}, saya dari Provexa Solution berkenaan status projek *${project.tajuk}*.\n\n` +
      `*Kemajuan Semasa:* ${project.kemajuanPeratus}%\n` +
      `*Status:* ${STATUS_CONFIG[project.status]?.label || project.status}\n` +
      (project.pautanHasil ? `*Pautan Ujian:* ${project.pautanHasil}\n\n` : '\n') +
      `Ada sebarang maklum balas untuk pihak kami? Terima kasih.`;

    const url = createWhatsAppUrl(project.telefonKlien, text);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Glass Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 shadow-2xs">Provexa Solution</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Operasi &amp; Pembangunan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Pengurusan Projek
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Pantau status fasa 8 servis Provexa, milestone kerja, dan serahan klien.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddProject}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Projek Baharu</span>
          </button>
        </div>
      </div>

      {/* Floating 5-Stat Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Projek</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalProjects}</p>
          <span className="text-[11px] text-slate-400">Semua rekod</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Pembangunan</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{activeProjects.length}</p>
          <span className="text-[11px] text-slate-400">Sedang dibina</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Semakan UAT</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{uatProjects.length}</p>
          <span className="text-[11px] text-slate-400">Testing klien</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Selesai &amp; Serah</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{completedProjects.length}</p>
          <span className="text-[11px] text-slate-400">Diserahkan</span>
        </div>

        <div className="col-span-2 sm:col-span-1 glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nilai Kontrak</span>
          <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            RM {totalContractValue.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold">
            Diterima: RM {totalPaid.toLocaleString('ms-MY')}
          </span>
        </div>
      </div>

      {/* Floating Toolbar: Search & Filter Tabs */}
      <div className="glass-card p-3.5 rounded-2xl border border-white/85 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tajuk, kod projek, nama klien..."
            className="w-full pl-9 pr-4 py-2 bg-white/70 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filters and View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Service Dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 bg-white/70 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="semua">Semua 8 Servis</option>
            {Object.values(PROVEXA_SERVICES).map((srv) => (
              <option key={srv.key} value={srv.key}>
                {srv.shortTitle}
              </option>
            ))}
          </select>

          {/* Client Filter Dropdown */}
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-3 py-2 bg-white/70 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700 max-w-[170px] truncate"
            title="Tapis mengikut nama atau syarikat klien"
          >
            <option value="semua">Semua Klien ({uniqueClients.length})</option>
            {uniqueClients.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label} ({c.count})
              </option>
            ))}
          </select>

          {/* Status Segmented Buttons */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs">
            {['semua', 'pembangunan', 'semakan_uat', 'selesai'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'semua'
                  ? 'Semua'
                  : st === 'pembangunan'
                  ? 'Dev'
                  : st === 'semakan_uat'
                  ? 'UAT'
                  : 'Selesai'}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Paparan Kad"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Paparan Jadual"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects List / Grid */}
      {filteredProjects.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/85 text-slate-400 space-y-3">
          <FolderKanban className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
          <p className="text-sm font-bold text-slate-600">Tiada projek ditemui.</p>
          <p className="text-xs text-slate-400">
            Cuba ubah kata carian atau penapis status projek di atas.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filteredProjects.map((p) => {
            const serviceMeta = PROVEXA_SERVICES[p.servisUtama];
            const statusMeta = STATUS_CONFIG[p.status];
            const baki = Math.max(0, p.nilaiKontrak - p.jumlahDibayar);

            return (
              <div
                key={p.id}
                className="glass-card glass-card-hover p-5 sm:p-6 rounded-3xl border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] space-y-4 text-xs"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {p.kodProjek}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {serviceMeta?.shortTitle || p.servisUtama}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {p.tajuk}
                    </h3>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {p.syarikatKlien ? `${p.syarikatKlien} (${p.namaKlien})` : p.namaKlien}
                    </p>
                  </div>

                  <span
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-full border shrink-0 ${statusMeta?.bg} ${statusMeta?.color} ${statusMeta?.border}`}
                  >
                    {statusMeta?.label || p.status}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Kemajuan Projek</span>
                    <span className="font-bold text-slate-800">{p.kemajuanPeratus}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${p.kemajuanPeratus}%` }}
                    />
                  </div>
                </div>

                {/* Financial details & delivery timeline */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/70 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Nilai Kontrak</span>
                    <span className="font-mono font-bold text-slate-900">
                      RM {p.nilaiKontrak.toLocaleString('ms-MY')}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">
                      Dibayar: RM {p.jumlahDibayar.toLocaleString('ms-MY')}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Sasaran Siap</span>
                    <span className="font-medium text-slate-800 block">{p.tarikhSasaran}</span>
                    {baki > 0 && (
                      <span className="text-[10px] text-rose-600 font-medium block">
                        Baki: RM {baki.toLocaleString('ms-MY')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Milestones count and deliverables preview */}
                {p.pautanHasil && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-600">
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">Pautan Demo:</span>
                    <a
                      href={p.pautanHasil}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline truncate"
                    >
                      {p.pautanHasil}
                    </a>
                  </div>
                )}

                {/* Clean Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleWhatsAppClient(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                      title="Hantar kemas kini WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onGenerateInvoice(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                      title="Jana Invois"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invois</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onGenerateAgreement(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                      title="Jana Kontrak Perjanjian"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Perjanjian</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => onEditProject(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Kemaskini Projek"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setProjectToDelete(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Padam Projek & Rekod Klien (Akses Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-card rounded-3xl border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/70 backdrop-blur-xs border-b border-slate-200/60 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Kod &amp; Tajuk Projek</th>
                  <th className="px-4 py-3.5">Klien</th>
                  <th className="px-4 py-3.5">Servis</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Kemajuan</th>
                  <th className="px-4 py-3.5">Nilai Kontrak</th>
                  <th className="px-4 py-3.5">Sasaran</th>
                  <th className="px-4 py-3.5 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70">
                {filteredProjects.map((p) => {
                  const statusMeta = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{p.tajuk}</div>
                        <span className="font-mono text-[10px] text-slate-400">{p.kodProjek}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <div className="font-medium">{p.syarikatKlien || p.namaKlien}</div>
                        <span className="text-[10px] text-slate-400">{p.telefonKlien}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {PROVEXA_SERVICES[p.servisUtama]?.shortTitle || p.servisUtama}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusMeta?.bg} ${statusMeta?.color} ${statusMeta?.border}`}
                        >
                          {statusMeta?.label || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {p.kemajuanPeratus}%
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-slate-900">
                        RM {p.nilaiKontrak.toLocaleString('ms-MY')}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.tarikhSasaran}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppClient(p)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProject(p)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProjectToDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Padam Projek & Rekod Klien (Akses Admin)"
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

      {/* Delete Project & Client Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Padam Projek?</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{projectToDelete.kodProjek}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-600 space-y-1 mb-4">
              <p className="font-semibold text-slate-900 line-clamp-2">
                {projectToDelete.tajuk}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate max-w-[190px]">
                  {projectToDelete.syarikatKlien
                    ? `${projectToDelete.syarikatKlien} (${projectToDelete.namaKlien})`
                    : projectToDelete.namaKlien}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  RM {projectToDelete.nilaiKontrak.toLocaleString('ms-MY')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Rekod projek ini akan dialih keluar secara kekal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
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
