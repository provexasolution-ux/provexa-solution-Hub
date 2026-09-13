import React, { useState } from 'react';
import {
  MessageCircle,
  Send,
  Calendar,
  Clock,
  Copy,
  Tag,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  FileText,
  Scale,
  Building2,
  User,
} from 'lucide-react';
import { Lead, MessageTemplate, ReminderType, TemplateCategory } from '../types';
import {
  interpolateTemplate,
  createWhatsAppUrl,
  getShortName,
  displayFormattedPhone,
  stripEmojis,
} from '../utils/whatsapp';

interface FollowUpModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  templates: MessageTemplate[];
  onRecordFollowUp: (leadId: string, customNote?: string) => void;
  onScheduleReminder: (
    lead: Lead,
    type: ReminderType,
    date: string,
    time: string,
    title: string
  ) => void;
}

const CATEGORY_LABELS: { key: string; label: string }[] = [
  { key: 'semua', label: 'Semua Mesej' },
  { key: 'pengenalan', label: 'Pengenalan & Servis' },
  { key: 'sebutharga', label: 'Sebutharga (Quo)' },
  { key: 'perjanjian', label: 'Perjanjian & T&C' },
  { key: 'invois', label: 'Invois & Resit' },
  { key: 'kemajuan_projek', label: 'Kemajuan & UAT' },
  { key: 'penyerahan', label: 'Penyerahan (Handover)' },
  { key: 'peringatan', label: 'Peringatan Susulan' },
];

export const FollowUpModal: React.FC<FollowUpModalProps> = ({
  lead,
  isOpen,
  onClose,
  templates,
  onRecordFollowUp,
  onScheduleReminder,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('semua');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id || ''
  );
  const [customMessage, setCustomMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // Schedule fields
  const [schedDate, setSchedDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0]
  );
  const [schedTime, setSchedTime] = useState('11:00');
  const [schedTitle, setSchedTitle] = useState(
    `Sesi Rundingan / Follow-up - ${lead?.nama || ''}`
  );
  const [schedType, setSchedType] = useState<ReminderType>('susulan_sebutharga');

  const shortName = lead ? getShortName(lead.nama) : '';

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (activeCategory === 'semua') return true;
    return t.kategori === activeCategory;
  });

  // Calculate message content (ensure clean text without emojis)
  const activeMessageText = stripEmojis(
    customMessage ||
      (selectedTemplate && lead
        ? interpolateTemplate(selectedTemplate.teks || selectedTemplate.isiKandungan || '', { lead })
        : '')
  );

  const handleSelectTemplate = (tId: string) => {
    setSelectedTemplateId(tId);
    setCustomMessage('');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(stripEmojis(activeMessageText));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSendWhatsApp = () => {
    const url = createWhatsAppUrl(lead.telefon, activeMessageText);
    window.open(url, '_blank');
    onRecordFollowUp(lead.id, `Hantar mesej: ${selectedTemplate?.tajuk || 'Kustom'}`);
    onClose();
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    onScheduleReminder(lead, schedType, schedDate, schedTime, schedTitle);
    setIsScheduleOpen(false);
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Hantar Mesej WhatsApp Rasmi
              </h3>
              <p className="text-xs text-slate-500">
                Hubungi {shortName} ({displayFormattedPhone(lead.telefon)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {CATEGORY_LABELS.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                  activeCategory === cat.key
                    ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Templates Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Pilih Templat Mesej Provexa:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selectedTemplateId === tpl.id
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-xs">{tpl.tajuk}</span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
                    {tpl.kategori}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Message Preview and Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Pratonton &amp; Sunting Teks Mesej:
              </label>
              <div className="flex items-center space-x-1">
                {customMessage && (
                  <button
                    type="button"
                    onClick={() => setCustomMessage('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center space-x-1 mr-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold flex items-center space-x-1"
                >
                  {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={activeMessageText}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl font-sans text-xs leading-relaxed focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Schedule Reminder Toggle Section */}
          <div className="pt-2 border-t border-slate-100">
            {!isScheduleOpen ? (
              <button
                type="button"
                onClick={() => setIsScheduleOpen(true)}
                className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center space-x-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>+ Jadualkan Janji Temu / Peringatan Susulan Klien</span>
              </button>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Jadualkan Janji Temu Baru</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Tarikh
                    </label>
                    <input
                      type="date"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Masa
                    </label>
                    <input
                      type="time"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      Jenis
                    </label>
                    <select
                      value={schedType}
                      onChange={(e) => setSchedType(e.target.value as ReminderType)}
                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs"
                    >
                      <option value="sesi_rundingan">Sesi Rundingan</option>
                      <option value="susulan_sebutharga">Susulan Sebutharga</option>
                      <option value="kutipan_bayaran">Kutipan Bayaran</option>
                      <option value="semakan_uat">Semakan UAT</option>
                      <option value="pelancaran_projek">Pelancaran Projek</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="Tajuk Peringatan"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-semibold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSchedule}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-bold shadow-xs"
                >
                  Simpan Janji Temu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-md transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>Buka WhatsApp Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
