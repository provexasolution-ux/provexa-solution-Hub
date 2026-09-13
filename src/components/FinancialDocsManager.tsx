import React, { useState, useMemo } from 'react';
import {
  FileText,
  Receipt,
  FileCheck,
  Plus,
  Search,
  Printer,
  Trash2,
  Edit2,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  MessageCircle,
  X,
  LayoutGrid,
  List,
  ArrowUpDown,
  Calendar,
  Building,
} from 'lucide-react';
import { FinancialDoc, DocType, Project, Lead } from '../types';
import {
  createWhatsAppUrl,
  formatFinancialDocForWhatsApp,
} from '../utils/whatsapp';

interface FinancialDocsManagerProps {
  docs: FinancialDoc[];
  projects: Project[];
  leads: Lead[];
  onOpenGenerator: (type: DocType) => void;
  onEditDoc: (doc: FinancialDoc) => void;
  onDeleteDoc: (docId: string) => void;
}

export const FinancialDocsManager: React.FC<FinancialDocsManagerProps> = ({
  docs,
  projects,
  leads,
  onOpenGenerator,
  onEditDoc,
  onDeleteDoc,
}) => {
  const [activeTab, setActiveTab] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [docToDelete, setDocToDelete] = useState<FinancialDoc | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('provexa_findocs_view_mode');
    return saved === 'grid' ? 'grid' : 'list';
  });
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'title_asc'>('date_desc');

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('provexa_findocs_view_mode', mode);
  };

  // Financial Metrics
  const totalInvoiced = docs
    .filter((d) => d.jenis === 'invois')
    .reduce((acc, d) => acc + d.jumlahKeseluruhan, 0);

  const totalCollected = docs
    .filter((d) => d.jenis === 'invois' || d.jenis === 'resit')
    .reduce((acc, d) => acc + (d.jumlahDibayar || 0), 0);

  const totalQuotations = docs
    .filter((d) => d.jenis === 'sebutharga')
    .reduce((acc, d) => acc + d.jumlahKeseluruhan, 0);

  const totalPending = docs
    .filter((d) => d.jenis === 'invois')
    .reduce((acc, d) => acc + (d.bakiPerluDibayar || 0), 0);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      semua: docs.length,
      invois: docs.filter((d) => d.jenis === 'invois').length,
      sebutharga: docs.filter((d) => d.jenis === 'sebutharga').length,
      resit: docs.filter((d) => d.jenis === 'resit').length,
    };
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const filtered = docs.filter((d) => {
      const matchType = activeTab === 'semua' || d.jenis === activeTab;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        d.noDokumen.toLowerCase().includes(q) ||
        d.tajukProjek.toLowerCase().includes(q) ||
        d.klien.nama.toLowerCase().includes(q) ||
        (d.klien.syarikat && d.klien.syarikat.toLowerCase().includes(q));

      return matchType && matchSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.tarikh).getTime() - new Date(b.tarikh).getTime();
      }
      if (sortBy === 'amount_desc') {
        return b.jumlahKeseluruhan - a.jumlahKeseluruhan;
      }
      if (sortBy === 'amount_asc') {
        return a.jumlahKeseluruhan - b.jumlahKeseluruhan;
      }
      if (sortBy === 'title_asc') {
        return a.tajukProjek.localeCompare(b.tajukProjek);
      }
      return 0;
    });
  }, [docs, activeTab, searchQuery, sortBy]);

  const handleWhatsAppSend = (doc: FinancialDoc) => {
    const formatted = formatFinancialDocForWhatsApp(doc);
    const url = createWhatsAppUrl(doc.klien.telefon, formatted);
    window.open(url, '_blank');
  };

  const getTypeBadge = (jenis: DocType) => {
    switch (jenis) {
      case 'invois':
        return { label: 'Invois', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/70' };
      case 'resit':
        return { label: 'Resit Rasmi', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' };
      case 'sebutharga':
        return { label: 'Sebutharga', bg: 'bg-slate-100 text-slate-700 border-slate-200/70' };
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Glass Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 shadow-2xs">Provexa Solution</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Kewangan &amp; Dokumen</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Invois, Resit &amp; Sebutharga
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Penjana sebutharga projek, invois milestone, dan resit pembayaran rasmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenGenerator('sebutharga')}
            className="px-3.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Sebutharga</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenGenerator('invois')}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-bold shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Invois</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenGenerator('resit')}
            className="px-3.5 py-2.5 bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 rounded-2xl text-xs font-bold shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Resit</span>
          </button>
        </div>
      </div>

      {/* Floating 4-Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nilai Sebutharga</span>
          <p className="text-2xl font-extrabold font-mono text-slate-900 mt-1">
            RM {totalQuotations.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-slate-400">Fasa rundingan</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Jumlah Diinvois</span>
          <p className="text-2xl font-extrabold font-mono text-indigo-900 mt-1">
            RM {totalInvoiced.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-slate-400">Semua invois keluar</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Bayaran Diterima</span>
          <p className="text-2xl font-extrabold font-mono text-emerald-700 mt-1">
            RM {totalCollected.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-slate-400">Resit &amp; deposit lunas</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Baki Tertunggak</span>
          <p className="text-2xl font-extrabold font-mono text-rose-700 mt-1">
            RM {totalPending.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-slate-400">Perlu dituntut</span>
        </div>
      </div>

      {/* Floating Toolbar with Search, Filter Pills, Sorting, and View Switcher */}
      <div className="glass-card p-3 sm:p-4 rounded-2xl border border-white/85 shadow-xs flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari no rujukan, tajuk projek, klien..."
              className="w-full pl-9 pr-8 py-2 bg-white/80 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Pills */}
          <div className="flex items-center overflow-x-auto bg-slate-100/90 p-1 rounded-xl text-xs shrink-0 scrollbar-none">
            {[
              { id: 'semua', label: 'Semua', count: tabCounts.semua },
              { id: 'invois', label: 'Invois', count: tabCounts.invois },
              { id: 'sebutharga', label: 'Sebutharga', count: tabCounts.sebutharga },
              { id: 'resit', label: 'Resit', count: tabCounts.resit },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Second Row: Sort and View Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100/80 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>
              Dijumpai <strong className="text-slate-800">{filteredDocs.length}</strong> dokumen
            </span>
            {searchQuery && (
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] font-medium">
                Carian: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1 text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="date_desc">Tarikh: Terbaharu</option>
                <option value="date_asc">Tarikh: Terlama</option>
                <option value="amount_desc">Jumlah: Tertinggi</option>
                <option value="amount_asc">Jumlah: Terendah</option>
                <option value="title_asc">Tajuk: A - Z</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Paparan Senarai / Jadual (Lebih senang cari)"
              >
                <List className="w-3.5 h-3.5" />
                <span>Senarai</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Paparan Kad / Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Kad</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Docs Content: Empty State, Table List View, or Grid Cards View */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/85 text-slate-400 space-y-3">
          <FileText className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
          <p className="text-sm font-bold text-slate-600">Tiada dokumen kewangan ditemui.</p>
          <p className="text-xs text-slate-400">
            {searchQuery
              ? 'Cuba ubah kata kunci carian atau tetapkan semula penapis tab di atas.'
              : 'Klik butang di atas untuk menjana Sebutharga, Invois atau Resit baharu.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ==================== LIST / TABLE VIEW ==================== */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-2.5 px-3 sm:px-4 w-[160px]">No. Dokumen &amp; Jenis</th>
                  <th className="py-2.5 px-2.5 sm:px-3 w-[85px]">Tarikh</th>
                  <th className="py-2.5 px-3 sm:px-4">Tajuk Projek &amp; Klien</th>
                  <th className="py-2.5 px-3 text-right w-[105px]">Jumlah Bersih</th>
                  <th className="py-2.5 px-3 w-[120px]">Status Bayaran</th>
                  <th className="py-2.5 px-3 text-right w-[95px] sticky right-0 bg-slate-50/95 shadow-[-4px_0_8px_-2px_rgba(15,23,42,0.05)] z-10">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDocs.map((doc) => {
                  const badge = getTypeBadge(doc.jenis);
                  const hasBalance = doc.bakiPerluDibayar > 0;
                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-indigo-50/40 transition-colors group"
                    >
                      {/* No. Dokumen & Badge */}
                      <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shadow-2xs shrink-0 ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                          <span
                            onClick={() => onEditDoc(doc)}
                            className="font-mono text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                            title="Klik untuk buka & edit"
                          >
                            {doc.noDokumen}
                          </span>
                        </div>
                      </td>

                      {/* Tarikh */}
                      <td className="py-2.5 px-2.5 sm:px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.tarikh}
                      </td>

                      {/* Tajuk Projek & Klien */}
                      <td className="py-2.5 px-3 sm:px-4">
                        <div className="max-w-[200px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[340px]">
                          <h4
                            onClick={() => onEditDoc(doc)}
                            className="font-bold text-slate-900 text-xs sm:text-sm hover:text-indigo-600 cursor-pointer truncate transition-colors"
                            title={doc.tajukProjek}
                          >
                            {doc.tajukProjek}
                          </h4>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {doc.klien.syarikat ? (
                              <>
                                <span className="font-semibold text-slate-700">{doc.klien.syarikat}</span>
                                <span className="text-slate-300 mx-1">•</span>
                                <span>{doc.klien.nama}</span>
                              </>
                            ) : (
                              <span>{doc.klien.nama}</span>
                            )}
                            {doc.klien.telefon && (
                              <span className="text-slate-400 font-mono text-[10px] ml-1.5">
                                ({doc.klien.telefon})
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Jumlah Bersih */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <span className="font-mono font-extrabold text-xs sm:text-sm text-slate-900">
                          RM {doc.jumlahKeseluruhan.toLocaleString('ms-MY')}
                        </span>
                      </td>

                      {/* Status Bayaran */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {doc.jenis === 'sebutharga' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Sebutharga
                          </span>
                        ) : hasBalance ? (
                          <div className="inline-flex flex-col">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80">
                              Baki: RM {doc.bakiPerluDibayar.toLocaleString('ms-MY')}
                            </span>
                            {doc.jumlahDibayar > 0 && (
                              <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                                Lunas: RM {doc.jumlahDibayar.toLocaleString('ms-MY')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Lunas
                          </span>
                        )}
                      </td>

                      {/* Tindakan (Sticky Right Column so never cut off) */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap sticky right-0 bg-white group-hover:bg-[#f6f7fd] shadow-[-4px_0_8px_-2px_rgba(15,23,42,0.05)] transition-colors z-10">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppSend(doc)}
                            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 text-emerald-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                            title="Hantar WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="hidden xl:inline text-[10px]">WA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditDoc(doc)}
                            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 text-indigo-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors shadow-2xs"
                            title="Buka / Kemaskini Dokumen"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="hidden xl:inline text-[10px]">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Padam Dokumen"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
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
      ) : (
        /* ==================== GRID / CARD VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredDocs.map((doc) => {
            const badge = getTypeBadge(doc.jenis);
            return (
              <div
                key={doc.id}
                className="glass-card glass-card-hover p-5 sm:p-6 rounded-3xl border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] space-y-3.5 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border shadow-2xs ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500">
                      {doc.tarikh}
                    </span>
                  </div>

                  <h3
                    onClick={() => onEditDoc(doc)}
                    className="font-extrabold text-slate-900 text-sm sm:text-base truncate hover:text-indigo-600 cursor-pointer transition-colors"
                    title="Klik untuk lihat & edit dokumen"
                  >
                    {doc.tajukProjek}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                    {doc.klien.syarikat ? `${doc.klien.syarikat} (${doc.klien.nama})` : doc.klien.nama}
                  </p>
                  <p className="font-mono text-[10px] text-slate-400 mt-1">
                    No: {doc.noDokumen}
                  </p>
                </div>

                {/* Amount Box */}
                <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/90 shadow-2xs flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Jumlah Bersih</span>
                    <span className="font-mono font-extrabold text-base sm:text-lg text-slate-900">
                      RM {doc.jumlahKeseluruhan.toLocaleString('ms-MY')}
                    </span>
                  </div>
                  {doc.bakiPerluDibayar > 0 && (
                    <div className="text-right">
                      <span className="text-[10px] text-rose-500 block font-medium">Baki Tertunggak</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-rose-600">
                        RM {doc.bakiPerluDibayar.toLocaleString('ms-MY')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppSend(doc)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-700 font-bold text-[11px] flex items-center space-x-1.5 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => onEditDoc(doc)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/50 text-indigo-700 font-bold text-[11px] flex items-center space-x-1.5 transition-colors shadow-2xs"
                      title="Lihat / Edit Dokumen"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocToDelete(doc)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Padam Dokumen"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Padam Dokumen?</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{docToDelete.noDokumen}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-600 space-y-1 mb-4">
              <p className="font-semibold text-slate-900 line-clamp-2">
                {docToDelete.tajukProjek}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate max-w-[190px]">
                  {docToDelete.klien.syarikat || docToDelete.klien.nama}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  RM {docToDelete.jumlahKeseluruhan.toLocaleString('ms-MY')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Rekod dokumen ini akan dialih keluar secara kekal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteDoc(docToDelete.id);
                  setDocToDelete(null);
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
