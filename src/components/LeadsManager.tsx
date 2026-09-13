import React, { useState } from 'react';
import {
  Search,
  Plus,
  MessageCircle,
  Clock,
  Trash2,
  Edit3,
  Columns3,
  ListFilter,
  FileSpreadsheet,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Scale,
  CheckCircle2,
  ArrowRight,
  FolderPlus,
  Tag,
  User,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  Lead,
  LeadStatus,
  LeadSource,
  ProvexaService,
  PROVEXA_SERVICES,
} from '../types';
import { createWhatsAppUrl, getShortName } from '../utils/whatsapp';

interface LeadsManagerProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'>) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onOpenFollowupModal: (lead: Lead) => void;
  onGenerateQuotationForLead: (lead: Lead) => void;
  onGenerateAgreementForLead: (lead: Lead) => void;
  onConvertLeadToProject: (lead: Lead) => void;
  initialStatusFilter?: string;
  onSyncGoogleSheets: () => void;
  isSyncing: boolean;
}

export const PROVEXA_STATUS_COLUMNS: {
  key: LeadStatus;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: 'baru', label: 'Inkuiri Baharu', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'dihubungi', label: 'Telah Dihubungi', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { key: 'sesi_discovery', label: 'Sesi Discovery', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  { key: 'sebutharga_dihantar', label: 'Sebutharga Dihantar', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'tunggu_deposit', label: 'Tunggu Deposit', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  { key: 'berjaya', label: 'Berjaya (Deal Won)', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'gagal', label: 'Batal / KIV', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  borang_web: 'Borang Awam',
  whatsapp: 'WhatsApp Direct',
  iklan: 'Iklan Berbayar',
  rujukan: 'Rujukan Klien',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  facebook: 'Facebook',
  google: 'Google / SEO',
  networking: 'Networking / Event',
  lain_lain: 'Lain-lain',
};

export const LeadsManager: React.FC<LeadsManagerProps> = ({
  leads,
  onAddLead,
  onUpdateLead,
  onDeleteLead,
  onOpenFollowupModal,
  onGenerateQuotationForLead,
  onGenerateAgreementForLead,
  onConvertLeadToProject,
  initialStatusFilter = 'semua',
  onSyncGoogleSheets,
  isSyncing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [serviceFilter, setServiceFilter] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [syarikat, setSyarikat] = useState('');
  const [telefon, setTelefon] = useState('');
  const [emel, setEmel] = useState('');
  const [servisMinat, setServisMinat] = useState<ProvexaService>('website');
  const [sumber, setSumber] = useState<LeadSource>('whatsapp');
  const [status, setStatus] = useState<LeadStatus>('baru');
  const [anggaranBajet, setAnggaranBajet] = useState<number>(3000);
  const [jangkaanGarisMasa, setJangkaanGarisMasa] = useState('1 Bulan');
  const [keperluanProjek, setKeperluanProjek] = useState('');
  const [nota, setNota] = useState('');

  const openAddModal = () => {
    setEditingLead(null);
    setNama('');
    setSyarikat('');
    setTelefon('');
    setEmel('');
    setServisMinat('website');
    setSumber('whatsapp');
    setStatus('baru');
    setAnggaranBajet(PROVEXA_SERVICES.website?.startingPrice || 1800);
    setJangkaanGarisMasa('1 Bulan');
    setKeperluanProjek('');
    setNota('');
    setIsModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setNama(lead.nama);
    setSyarikat(lead.syarikat || '');
    setTelefon(lead.telefon);
    setEmel(lead.emel || '');
    setServisMinat(lead.servisMinat);
    setSumber(lead.sumber);
    setStatus(lead.status);
    setAnggaranBajet(lead.anggaranBajet || 0);
    setJangkaanGarisMasa(lead.jangkaanGarisMasa || '');
    setKeperluanProjek(lead.keperluanProjek || '');
    setNota(lead.nota || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !telefon.trim()) return;

    if (editingLead) {
      onUpdateLead({
        ...editingLead,
        nama: nama.trim(),
        syarikat: syarikat.trim() || undefined,
        telefon: telefon.trim(),
        emel: emel.trim() || undefined,
        servisMinat,
        sumber,
        status,
        anggaranBajet,
        jangkaanGarisMasa,
        keperluanProjek,
        nota,
        tarikhDikemaskini: new Date().toISOString(),
      });
    } else {
      onAddLead({
        nama: nama.trim(),
        syarikat: syarikat.trim() || undefined,
        telefon: telefon.trim(),
        emel: emel.trim() || undefined,
        servisMinat,
        sumber,
        status,
        anggaranBajet,
        jangkaanGarisMasa,
        keperluanProjek,
        nota,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      lead.nama.toLowerCase().includes(q) ||
      lead.telefon.includes(q) ||
      (lead.syarikat && lead.syarikat.toLowerCase().includes(q)) ||
      (lead.emel && lead.emel.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'semua' || lead.status === statusFilter;
    const matchesService = serviceFilter === 'semua' || lead.servisMinat === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Glass Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 shadow-2xs">Provexa Solution</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Corong Jualan &amp; Klien</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Leads &amp; Bakal Klien
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Pantau dan tindak balas inkuiri bagi 8 servis digital Provexa Solution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSyncGoogleSheets}
            disabled={isSyncing}
            className="px-3.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center space-x-2"
            title="Segerak Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{isSyncing ? 'Segerak...' : 'Google Sheets'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-bold shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Lead Baharu</span>
          </button>
        </div>
      </div>

      {/* Floating Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-white/85 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pelanggan, syarikat, atau nombor telefon..."
              className="w-full text-xs pl-9 pr-3 py-2 bg-white/70 border border-slate-200/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200/80 rounded-xl bg-white/70 font-medium text-slate-700"
            >
              <option value="semua">Semua Status ({leads.length})</option>
              {PROVEXA_STATUS_COLUMNS.map((st) => (
                <option key={st.key} value={st.key}>
                  {st.label} ({leads.filter((l) => l.status === st.key).length})
                </option>
              ))}
            </select>

            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200/80 rounded-xl bg-white/70 font-medium text-slate-700"
            >
              <option value="semua">Semua 8 Servis</option>
              {Object.values(PROVEXA_SERVICES).map((srv) => (
                <option key={srv.key} value={srv.key}>
                  {srv.shortTitle}
                </option>
              ))}
            </select>

            <div className="flex bg-slate-100/80 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Jadual
              </button>
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leads Views */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="glass-card rounded-3xl border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] overflow-hidden">
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-extrabold text-slate-800 text-sm">Tiada Leads Dijumpai</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tiada rekod prospek yang menepati kriteria tapisan carian anda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Nama &amp; Syarikat Klien</th>
                    <th className="py-3 px-4">No. Telefon &amp; Emel</th>
                    <th className="py-3 px-4">Servis Minat</th>
                    <th className="py-3 px-4">Anggaran Bajet</th>
                    <th className="py-3 px-4">Status &amp; Sumber</th>
                    <th className="py-3 px-4 text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const statusObj =
                      PROVEXA_STATUS_COLUMNS.find((c) => c.key === lead.status) ||
                      PROVEXA_STATUS_COLUMNS[0];
                    const serviceMeta = PROVEXA_SERVICES[lead.servisMinat];

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 text-xs">{lead.nama}</p>
                          {lead.syarikat && (
                            <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span>{lead.syarikat}</span>
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-mono text-xs font-semibold text-slate-800">
                            {lead.telefon}
                          </p>
                          {lead.emel && (
                            <p className="text-[11px] text-slate-400">{lead.emel}</p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${serviceMeta?.badgeBg} ${serviceMeta?.badgeColor}`}
                          >
                            {serviceMeta?.shortTitle || lead.servisMinat}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900">
                            {lead.anggaranBajet
                              ? `RM ${lead.anggaranBajet.toLocaleString('ms-MY')}`
                              : '-'}
                          </span>
                          {lead.jangkaanGarisMasa && (
                            <p className="text-[10px] text-slate-400">
                              Masa: {lead.jangkaanGarisMasa}
                            </p>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusObj.bg} ${statusObj.color} ${statusObj.border}`}
                          >
                            {statusObj.label}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {SOURCE_LABELS[lead.sumber] || lead.sumber}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            {/* Convert to Project */}
                            <button
                              type="button"
                              onClick={() => onConvertLeadToProject(lead)}
                              title="Tukar Kepada Projek Aktif"
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[10px] font-bold flex items-center space-x-0.5 border border-indigo-200"
                            >
                              <FolderPlus className="w-3.5 h-3.5" />
                              <span>+ Projek</span>
                            </button>

                            {/* Quotation */}
                            <button
                              type="button"
                              onClick={() => onGenerateQuotationForLead(lead)}
                              title="Jana Sebutharga"
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Agreement */}
                            <button
                              type="button"
                              onClick={() => onGenerateAgreementForLead(lead)}
                              title="Jana Perjanjian / T&C"
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                            >
                              <Scale className="w-4 h-4" />
                            </button>

                            {/* WhatsApp */}
                            <button
                              type="button"
                              onClick={() => onOpenFollowupModal(lead)}
                              title="WhatsApp Follow-up"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(lead)}
                              title="Kemaskini"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setLeadToDelete(lead)}
                              title="Padam Lead / Klien (Admin)"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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
      ) : (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start">
          {PROVEXA_STATUS_COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => l.status === col.key);

            return (
              <div
                key={col.key}
                className="glass-card rounded-3xl p-4 border border-white/85 shadow-xs space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <span className={`text-xs font-bold tracking-tight ${col.color}`}>{col.label}</span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/90 text-slate-700 border border-slate-200/70 font-extrabold shadow-2xs">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[620px] pr-0.5">
                  {colLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="glass-card glass-card-hover p-4 rounded-2xl border border-white/90 shadow-2xs hover:border-indigo-200 space-y-2.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-extrabold text-slate-900 truncate">{lead.nama}</p>
                          {lead.syarikat && (
                            <p className="text-[11px] text-slate-500 font-medium truncate">{lead.syarikat}</p>
                          )}
                        </div>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50/90 border border-indigo-100/60 text-indigo-700 shrink-0 shadow-2xs">
                          {PROVEXA_SERVICES[lead.servisMinat]?.shortTitle}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 flex justify-between items-center">
                        <span className="font-mono text-slate-500">Tel: {lead.telefon}</span>
                        {lead.anggaranBajet && (
                          <span className="font-mono font-bold text-slate-900">
                            RM {lead.anggaranBajet.toLocaleString('ms-MY')}
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px]">
                        <button
                          type="button"
                          onClick={() => onConvertLeadToProject(lead)}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                        >
                          <FolderPlus className="w-3.5 h-3.5" />
                          <span>+ Projek</span>
                        </button>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => onGenerateQuotationForLead(lead)}
                            className="p-1 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Sebutharga"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenFollowupModal(lead)}
                            className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(lead)}
                            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Padam Lead / Klien (Admin)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <h3 className="font-bold text-slate-900 text-base">
                {editingLead ? 'Kemaskini Maklumat Lead' : 'Daftar Lead Provexa Baharu'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Pelanggan *
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Dato' Azhar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Syarikat / Organisasi
                  </label>
                  <input
                    type="text"
                    value={syarikat}
                    onChange={(e) => setSyarikat(e.target.value)}
                    placeholder="Mega Niaga Sdn Bhd"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    No. WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="0123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Emel
                  </label>
                  <input
                    type="email"
                    value={emel}
                    onChange={(e) => setEmel(e.target.value)}
                    placeholder="klien@gmail.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Servis Provexa Yang Diminati *
                  </label>
                  <select
                    value={servisMinat}
                    onChange={(e) => setServisMinat(e.target.value as ProvexaService)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold text-indigo-900"
                  >
                    {Object.values(PROVEXA_SERVICES).map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Corong Jualan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    {PROVEXA_STATUS_COLUMNS.map((st) => (
                      <option key={st.key} value={st.key}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Anggaran Bajet (RM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={anggaranBajet}
                    onChange={(e) => setAnggaranBajet(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jangkaan Garis Masa
                  </label>
                  <input
                    type="text"
                    value={jangkaanGarisMasa}
                    onChange={(e) => setJangkaanGarisMasa(e.target.value)}
                    placeholder="1 Bulan / 3 Minggu"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Keperluan / Huraian Projek
                </label>
                <textarea
                  rows={2}
                  value={keperluanProjek}
                  onChange={(e) => setKeperluanProjek(e.target.value)}
                  placeholder="Perlu sistem inventori & login staff..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Klien prefer follow-up hari Jumaat..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead / Client Confirmation Modal */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Padam Prospek?</h3>
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
                  {PROVEXA_SERVICES[leadToDelete.servisMinat]?.title}
                </span>
                <span className="font-medium text-slate-700 font-mono">
                  {leadToDelete.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Rekod prospek ini akan dialih keluar secara kekal.
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
