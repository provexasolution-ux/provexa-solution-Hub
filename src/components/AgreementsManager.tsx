import React, { useState, useMemo } from 'react';
import {
  Scale,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  Calendar,
  MessageCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { AgreementDoc, AgreementType, Project, Lead } from '../types';
import {
  createWhatsAppUrl,
  formatAgreementForWhatsApp,
} from '../utils/whatsapp';

interface AgreementsManagerProps {
  agreements: AgreementDoc[];
  projects?: Project[];
  leads?: Lead[];
  onOpenGenerator?: (type: AgreementType) => void;
  onAddNewAgreement?: (type?: AgreementType) => void;
  onEditAgreement: (agreement: AgreementDoc) => void;
  onDeleteAgreement: (agreementId: string) => void;
  onUpdateStatus?: (agreementId: string, status: AgreementDoc['status']) => void;
}

export const AgreementsManager: React.FC<AgreementsManagerProps> = ({
  agreements,
  projects,
  leads,
  onOpenGenerator,
  onAddNewAgreement,
  onEditAgreement,
  onDeleteAgreement,
  onUpdateStatus,
}) => {
  const [activeType, setActiveType] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [agreementToDelete, setAgreementToDelete] = useState<AgreementDoc | null>(null);

  const handleOpenNew = (type: AgreementType = 'perjanjian_servis') => {
    if (onOpenGenerator) {
      onOpenGenerator(type);
    } else if (onAddNewAgreement) {
      onAddNewAgreement(type);
    }
  };

  const totalAgreements = agreements.length;
  const signedAgreements = agreements.filter(
    (a) => a.status === 'ditandatangani' || a.status === 'dipersetujui'
  );
  const totalContractedValue = agreements.reduce((acc, a) => acc + (a.nilaiProjek || 0), 0);

  const filtered = useMemo(() => {
    return agreements.filter((a) => {
      const matchType = activeType === 'semua' || a.jenis === activeType;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        a.noPerjanjian.toLowerCase().includes(q) ||
        a.tajuk.toLowerCase().includes(q) ||
        a.namaKlien.toLowerCase().includes(q) ||
        (a.syarikatKlien && a.syarikatKlien.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
  }, [agreements, activeType, searchQuery]);

  const handleWhatsAppSend = (agreement: AgreementDoc) => {
    const formatted = formatAgreementForWhatsApp(agreement);
    const url = createWhatsAppUrl(agreement.telefonKlien, formatted);
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
            <span className="text-slate-500 font-medium">Kontrak &amp; Undang-undang</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Perjanjian &amp; Terma Syarat (T&amp;C)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Lindungi hak cipta kod, milestone penyerahan, dan jadual pembayaran dengan kontrak rasmi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenNew('perjanjian_servis')}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-bold shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Jana Perjanjian Baharu</span>
        </button>
      </div>

      {/* Floating 3-Stat Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Kontrak</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalAgreements}</p>
          <span className="text-[11px] text-slate-400">Semua dokumen undang-undang</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Telah Dipersetujui</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {signedAgreements.length}
          </p>
          <span className="text-[11px] text-slate-400">Ditandatangani oleh klien</span>
        </div>

        <div className="glass-card glass-card-hover p-4 rounded-2xl border border-white/85 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Nilai Kontrak Terkumpul</span>
          <p className="text-2xl font-extrabold font-mono text-indigo-900 mt-1">
            RM {totalContractedValue.toLocaleString('ms-MY')}
          </p>
          <span className="text-[11px] text-slate-400">Merangkumi 8 servis Provexa</span>
        </div>
      </div>

      {/* Floating Toolbar */}
      <div className="glass-card p-3.5 rounded-2xl border border-white/85 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari no perjanjian atau nama klien..."
            className="w-full pl-9 pr-4 py-2 bg-white/70 border border-slate-200/80 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl text-xs">
          {[
            { id: 'semua', label: 'Semua' },
            { id: 'perjanjian_servis', label: 'Kontrak Servis' },
            { id: 'terma_syarat', label: 'T&C' },
            { id: 'nda', label: 'NDA' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveType(tab.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeType === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agreements Cards Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl border border-white/85 text-slate-400 space-y-3">
          <Scale className="w-10 h-10 mx-auto opacity-30 text-indigo-500" />
          <p className="text-sm font-bold text-slate-600">Tiada perjanjian ditemui.</p>
          <p className="text-xs text-slate-400">
            Klik butang di atas untuk menjana kontrak atau T&amp;C baharu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="glass-card glass-card-hover rounded-3xl border border-white/85 shadow-[0_6px_20px_rgba(15,23,42,0.03)] p-5 sm:p-6 flex flex-col justify-between space-y-4 text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-indigo-50/90 border border-indigo-100/60 text-indigo-700 shadow-2xs">
                    {item.noPerjanjian}
                  </span>

                  <select
                    value={item.status}
                    onChange={(e) =>
                      onUpdateStatus &&
                      onUpdateStatus(item.id, e.target.value as AgreementDoc['status'])
                    }
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border cursor-pointer transition-colors shadow-2xs ${
                      item.status === 'ditandatangani'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'dipersetujui'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : item.status === 'dihantar'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : item.status === 'dibatalkan'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                    title="Tukar Status Perjanjian"
                  >
                    <option value="draf">Draf</option>
                    <option value="dihantar">Dihantar</option>
                    <option value="dipersetujui">Dipersetujui</option>
                    <option value="ditandatangani">Ditandatangani</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {item.tajuk}
                </h3>
                <p className="text-slate-500 text-[11px] mt-0.5 font-medium">
                  Klien: {item.syarikatKlien ? `${item.syarikatKlien} (${item.namaKlien})` : item.namaKlien}
                </p>
              </div>

              {/* Terms snippet */}
              <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-xs border border-white/90 shadow-2xs space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Nilai Kontrak:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-xs sm:text-sm">
                    RM {(item.nilaiProjek || 0).toLocaleString('ms-MY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Tempoh / Waranti:</span>
                  <span className="font-bold text-slate-700">
                    {item.tempohHariBekerja ? `${item.tempohHariBekerja} Hari Bekerja` : 'Fasa Projek'} • Waranti {item.tempohWarantiHari || 30} Hari
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deposit &amp; Jadual:</span>
                  <span className="font-medium text-slate-700">
                    Deposit {item.jadualBayaran?.depositPeratus ?? 50}% • {item.jadualBayaran?.kemajuanPeratus ? '3 Fasa Bayaran' : '2 Fasa Bayaran'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleWhatsAppSend(item)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-[11px] flex items-center space-x-1 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Ringkasan</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => onEditAgreement(item)}
                    className="px-2.5 py-1 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors flex items-center space-x-1 font-semibold text-[11px]"
                    title="Edit butiran perjanjian"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgreementToDelete(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Padam Perjanjian"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {agreementToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">Padam Perjanjian?</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{agreementToDelete.noPerjanjian}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAgreementToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2 text-xs text-slate-600 space-y-1 mb-4">
              <p className="font-semibold text-slate-900 line-clamp-2">
                {agreementToDelete.tajuk}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="truncate max-w-[190px]">
                  {agreementToDelete.syarikatKlien
                    ? `${agreementToDelete.syarikatKlien} (${agreementToDelete.namaKlien})`
                    : agreementToDelete.namaKlien}
                </span>
                <span className="font-bold text-slate-900 font-mono">
                  RM {(agreementToDelete.nilaiProjek || 0).toLocaleString('ms-MY')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Rekod perjanjian ini akan dialih keluar secara kekal.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAgreementToDelete(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteAgreement(agreementToDelete.id);
                  setAgreementToDelete(null);
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
