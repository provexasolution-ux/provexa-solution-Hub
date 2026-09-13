import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  MessageCircle,
  Plus,
  Trash2,
  CalendarClock,
  FileText,
  DollarSign,
  Rocket,
  ShieldAlert,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Reminder, Lead, ReminderType } from '../types';
import { createWhatsAppUrl, getShortName } from '../utils/whatsapp';

interface RemindersViewProps {
  reminders: Reminder[];
  leads: Lead[];
  onAddReminder: (reminder: Omit<Reminder, 'id'>) => void;
  onUpdateReminderStatus: (id: string, status: 'belum' | 'selesai' | 'dibatalkan') => void;
  onDeleteReminder: (id: string) => void;
  onQuickFollowup: (lead: Lead) => void;
}

const PROVEXA_REMINDER_TYPES: Record<
  ReminderType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  sesi_rundingan: {
    label: 'Sesi Rundingan & Discovery',
    icon: CalendarClock,
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200/80',
  },
  susulan_sebutharga: {
    label: 'Susulan Sebutharga & Tawaran',
    icon: FileText,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200/80',
  },
  kutipan_bayaran: {
    label: 'Kutipan Bayaran Milestone',
    icon: DollarSign,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200/80',
  },
  semakan_uat: {
    label: 'Semakan UAT & Feedback Klien',
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200/80',
  },
  pelancaran_projek: {
    label: 'Pelancaran & Serahan Rasmi',
    icon: Rocket,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200/80',
  },
  temujanji: {
    label: 'Mesyuarat / Sesi Kelas',
    icon: Calendar,
    color: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200/80',
  },
  semakan_klien: {
    label: 'Semakan & Maklum Balas Klien',
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200/80',
  },
  kutip_bayaran: {
    label: 'Kutipan Invois & Bayaran',
    icon: DollarSign,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200/80',
  },
  followup_proposal: {
    label: 'Susulan Tawaran & Proposal',
    icon: FileText,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200/80',
  },
  tarikh_akhir_projek: {
    label: 'Tarikh Akhir (Deadline) Projek',
    icon: Rocket,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200/80',
  },
  custom: {
    label: 'Peringatan Operasi Lain',
    icon: CalendarClock,
    color: 'text-slate-700',
    bg: 'bg-slate-50 border-slate-200/80',
  },
};

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  leads,
  onAddReminder,
  onUpdateReminderStatus,
  onDeleteReminder,
  onQuickFollowup,
}) => {
  const [filter, setFilter] = useState<'hari_ini' | 'akan_datang' | 'semua' | 'selesai'>('hari_ini');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formLeadId, setFormLeadId] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formTelefon, setFormTelefon] = useState('');
  const [formJenis, setFormJenis] = useState<ReminderType>('susulan_sebutharga');
  const [formTajuk, setFormTajuk] = useState('');
  const [formTarikh, setFormTarikh] = useState(new Date().toISOString().split('T')[0]);
  const [formMasa, setFormMasa] = useState('11:00');
  const [formLokasi, setFormLokasi] = useState('Google Meet / WhatsApp Call');
  const [formNota, setFormNota] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelectLead = (leadId: string) => {
    setFormLeadId(leadId);
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      setFormNama(lead.nama);
      setFormTelefon(lead.telefon);
      setFormTajuk(`Susulan Servis ${lead.servisMinat.toUpperCase()} - ${lead.nama}`);
      if (lead.tarikhTemujanji) setFormTarikh(lead.tarikhTemujanji);
      if (lead.masaTemujanji) setFormMasa(lead.masaTemujanji);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formTelefon.trim() || !formTajuk.trim()) return;

    onAddReminder({
      leadId: formLeadId || undefined,
      namaPelanggan: formNama,
      telefonPelanggan: formTelefon,
      jenis: formJenis,
      tajuk: formTajuk,
      tarikh: formTarikh,
      masa: formMasa,
      lokasi: formLokasi,
      status: 'belum',
      nota: formNota,
      selesai: false,
    });

    setIsAddModalOpen(false);
    setFormLeadId('');
    setFormNama('');
    setFormTelefon('');
    setFormTajuk('');
    setFormNota('');
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'selesai') return r.status === 'selesai' || r.selesai;
    if (r.status === 'selesai' || r.selesai) return false;

    if (filter === 'hari_ini') return r.tarikh === todayStr;
    if (filter === 'akan_datang') return r.tarikh > todayStr;
    return true; // semua belum selesai
  });

  const handleWhatsAppReminder = (r: Reminder) => {
    const short = getShortName(r.namaPelanggan);
    const msg =
      `Salam sejahtera ${short}, peringatan mesra dari *Provexa Solution*:\n\n` +
      `*Acara / Janji Temu:* ${r.tajuk}\n` +
      `*Tarikh:* ${r.tarikh}\n` +
      `*Masa:* ${r.masa || 'Ditetapkan'}\n` +
      (r.lokasi ? `*Platform / Lokasi:* ${r.lokasi}\n` : '') +
      `\nSila maklumkan sekiranya ada sebarang perubahan masa. Terima kasih!`;

    window.open(createWhatsAppUrl(r.telefonPelanggan, msg), '_blank');
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Glass Header */}
      <div className="glass-card rounded-3xl p-5 sm:p-6 border border-white/85 shadow-[0_8px_25px_rgba(15,23,42,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 shadow-2xs">Provexa Solution</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">Jadual &amp; Sasaran Projek</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Janji Temu, Mesyuarat &amp; Sasaran
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
            Pantau tarikh semakan UAT, sesi perundingan klien, dan sasaran tarikh akhir.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-bold shadow-[0_4px_16px_rgba(79,70,229,0.35)] hover:shadow-[0_8px_24px_rgba(79,70,229,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Janji Temu Baharu</span>
        </button>
      </div>

      {/* Floating Filter Tabs */}
      <div className="glass-card p-1 rounded-2xl border border-white/85 shadow-xs flex items-center space-x-1 w-fit text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilter('hari_ini')}
          className={`px-3.5 py-1.5 rounded-xl transition-all font-bold ${
            filter === 'hari_ini'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Hari Ini ({reminders.filter((r) => !r.selesai && r.tarikh === todayStr).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('akan_datang')}
          className={`px-3.5 py-1.5 rounded-xl transition-all font-bold ${
            filter === 'akan_datang'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Akan Datang ({reminders.filter((r) => !r.selesai && r.tarikh > todayStr).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('semua')}
          className={`px-3.5 py-1.5 rounded-xl transition-all font-bold ${
            filter === 'semua'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Semua Belum Selesai ({reminders.filter((r) => !r.selesai).length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('selesai')}
          className={`px-3.5 py-1.5 rounded-xl transition-all font-bold ${
            filter === 'selesai'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Selesai ({reminders.filter((r) => r.selesai || r.status === 'selesai').length})
        </button>
      </div>

      {/* Reminders List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="glass-card rounded-3xl border border-white/85 p-12 text-center shadow-[0_8px_25px_rgba(15,23,42,0.03)]">
            <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-sm">Tiada Janji Temu Ditemui</h3>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'hari_ini'
                ? 'Tiada janji temu atau milestone dijadualkan untuk hari ini.'
                : 'Tiada rekod peringatan dalam kategori ini.'}
            </p>
          </div>
        ) : (
          filteredReminders.map((r) => {
            const typeConfig =
              PROVEXA_REMINDER_TYPES[r.jenis] || PROVEXA_REMINDER_TYPES.temujanji;
            const IconComp = typeConfig.icon;
            const isToday = r.tarikh === todayStr;

            return (
              <div
                key={r.id}
                className={`glass-card glass-card-hover rounded-3xl border p-4 sm:p-5 shadow-[0_6px_20px_rgba(15,23,42,0.03)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isToday ? 'border-indigo-300 ring-2 ring-indigo-500/20' : 'border-white/85'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${typeConfig.bg} ${typeConfig.color}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {r.tajuk}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100/90 text-rose-700 border border-rose-200/80 shadow-2xs animate-pulse">
                          HARI INI
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="font-bold text-slate-700">{r.namaPelanggan}</span>
                      <span>•</span>
                      <span className="font-mono text-slate-600">{r.telefonPelanggan}</span>
                      <span>•</span>
                      <span className="flex items-center space-x-1 font-bold text-indigo-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{r.tarikh} {r.masa ? `(${r.masa})` : ''}</span>
                      </span>
                      {r.lokasi && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400">{r.lokasi}</span>
                        </>
                      )}
                    </div>

                    {r.nota && (
                      <p className="text-xs text-slate-600 mt-2 bg-white/70 backdrop-blur-xs p-2.5 rounded-xl border border-white/90 shadow-2xs">
                        {r.nota}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleWhatsAppReminder(r)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Peringatan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateReminderStatus(
                        r.id,
                        r.status === 'selesai' || r.selesai ? 'belum' : 'selesai'
                      )
                    }
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition-all shadow-2xs ${
                      r.status === 'selesai' || r.selesai
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-white/80 text-slate-600 border-slate-200 hover:bg-white'
                    }`}
                    title={
                      r.status === 'selesai' || r.selesai
                        ? 'Tandakan belum selesai'
                        : 'Tandakan selesai'
                    }
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteReminder(r.id)}
                    className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Padam Peringatan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg glass-card rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/90 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200/60 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Tambah Janji Temu &amp; Milestone Baharu
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              {leads.length > 0 && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Pautkan Klien Sedia Ada (Pilihan)
                  </label>
                  <select
                    value={formLeadId}
                    onChange={(e) => handleSelectLead(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="">-- Pilih Klien / Lead --</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama} ({l.syarikat || l.servisMinat})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Klien *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder="Nama Klien"
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
                    value={formTelefon}
                    onChange={(e) => setFormTelefon(e.target.value)}
                    placeholder="0123456789"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jenis Acara / Janji Temu
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value as ReminderType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="sesi_rundingan">Sesi Rundingan &amp; Discovery</option>
                  <option value="susulan_sebutharga">Susulan Sebutharga &amp; Tawaran</option>
                  <option value="kutipan_bayaran">Kutipan Bayaran Milestone</option>
                  <option value="semakan_uat">Semakan UAT &amp; Feedback Klien</option>
                  <option value="pelancaran_projek">Pelancaran &amp; Serahan Rasmi</option>
                  <option value="temujanji">Mesyuarat / Sesi Kelas</option>
                  <option value="custom">Peringatan Operasi Lain</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tajuk Peringatan *
                </label>
                <input
                  type="text"
                  required
                  value={formTajuk}
                  onChange={(e) => setFormTajuk(e.target.value)}
                  placeholder="Contoh: Sesi Demo UAT Portal E-Commerce"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tarikh *
                  </label>
                  <input
                    type="date"
                    required
                    value={formTarikh}
                    onChange={(e) => setFormTarikh(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Masa
                  </label>
                  <input
                    type="time"
                    value={formMasa}
                    onChange={(e) => setFormMasa(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi / Pautan Meeting
                </label>
                <input
                  type="text"
                  value={formLokasi}
                  onChange={(e) => setFormLokasi(e.target.value)}
                  placeholder="Google Meet / Zoom / Pejabat Klien"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  value={formNota}
                  onChange={(e) => setFormNota(e.target.value)}
                  placeholder="Sediakan slaid pembentangan dan draf kontrak..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Simpan Janji Temu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
