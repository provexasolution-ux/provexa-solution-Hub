import React, { useState } from 'react';
import {
  Share2,
  Copy,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
  DollarSign,
  Building2,
  Send,
  Calendar,
  FileCheck,
} from 'lucide-react';
import { Lead, ProvexaService, PROVEXA_SERVICES } from '../types';
import { createWhatsAppUrl, getShortName } from '../utils/whatsapp';
import { ProvexaLogo } from './ProvexaLogo';

interface PublicLeadFormProps {
  onLeadSubmitted: (leadData: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'>) => void;
  sellerWhatsAppNumber?: string;
  sellerName?: string;
}

export const PublicLeadForm: React.FC<PublicLeadFormProps> = ({
  onLeadSubmitted,
  sellerWhatsAppNumber = '0129845521',
  sellerName = 'Provexa Solution Consultant',
}) => {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Form Fields
  const [nama, setNama] = useState('');
  const [syarikat, setSyarikat] = useState('');
  const [telefon, setTelefon] = useState('');
  const [emel, setEmel] = useState('');
  const [servisMinat, setServisMinat] = useState<ProvexaService>(() => {
    return Object.values(PROVEXA_SERVICES)[0]?.key || 'website';
  });
  const [anggaranBajet, setAnggaranBajet] = useState<number>(() => {
    return Object.values(PROVEXA_SERVICES)[0]?.startingPrice || 1800;
  });
  const [jangkaanGarisMasa, setJangkaanGarisMasa] = useState('1 - 2 Bulan');
  const [keperluanProjek, setKeperluanProjek] = useState('');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareableUrl = `${currentUrl.split('?')[0]}?mode=form`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleServiceChange = (serviceKey: ProvexaService) => {
    setServisMinat(serviceKey);
    const srv = PROVEXA_SERVICES[serviceKey];
    if (srv) {
      setAnggaranBajet(srv.startingPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !telefon.trim()) return;

    const newLead = {
      nama: nama.trim(),
      syarikat: syarikat.trim() || undefined,
      telefon: telefon.trim(),
      emel: emel.trim() || undefined,
      servisMinat,
      status: 'baru' as const,
      sumber: 'borang_web' as const,
      anggaranBajet,
      jangkaanGarisMasa,
      keperluanProjek,
      nota: `Dihantar melalui Borang Minat Web Provexa Solution.`,
    };

    onLeadSubmitted(newLead);
    setSubmittedData(newLead);
    setSubmitted(true);
  };

  const selectedServiceMeta = PROVEXA_SERVICES[servisMinat];

  const handleSendWhatsAppToConsultant = () => {
    if (!submittedData) return;
    const msg =
      `Salam Sejahtera Provexa Solution,\n\n` +
      `Saya telah mengisi borang minat konsultasi rasmi:\n` +
      `*Nama:* ${submittedData.nama}\n` +
      (submittedData.syarikat ? `*Syarikat:* ${submittedData.syarikat}\n` : '') +
      `*No. WhatsApp:* ${submittedData.telefon}\n` +
      `*Servis Minat:* ${PROVEXA_SERVICES[submittedData.servisMinat as ProvexaService]?.title || submittedData.servisMinat}\n` +
      `*Anggaran Bajet:* RM ${submittedData.anggaranBajet?.toLocaleString('ms-MY')}\n` +
      `*Garis Masa:* ${submittedData.jangkaanGarisMasa}\n` +
      (submittedData.keperluanProjek ? `*Keperluan:* ${submittedData.keperluanProjek}\n` : '') +
      `\nBoleh kita jadualkan sesi perbincangan / sebutharga rasmi? Terima kasih.`;

    window.open(createWhatsAppUrl(sellerWhatsAppNumber, msg), '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Admin Share Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-800">
              Pautan Awam Borang Konsultasi Provexa
            </span>
            <p className="text-slate-500 text-[11px]">
              Kongsikan pautan ini di media sosial, bio Instagram, iklan FB/TikTok atau mesej WhatsApp.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shrink-0"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Pautan Disalin!' : 'Salin Pautan Awam'}</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-10 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <ProvexaLogo className="h-10 sm:h-12 w-auto" variant="full" theme="dark" />
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-3 border border-indigo-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital &amp; Tech Partner</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Borang Minat &amp; Konsultasi Projek
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
            Pilih servis digital yang anda perlukan. Pasukan konsultan Provexa Solution akan menyediakan sebutharga rasmi dan cadangan teknikal khusus untuk perniagaan anda.
          </p>
        </div>

        {submitted ? (
          /* SUCCESS STATE */
          <div className="p-8 sm:p-12 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Terima Kasih, {submittedData?.nama}!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                Permohonan konsultasi bagi pakej <span className="font-bold text-indigo-600">{selectedServiceMeta?.title}</span> telah berjaya direkodkan.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Servis Dipilih:</span>
                <span className="font-bold text-slate-900">{selectedServiceMeta?.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Anggaran Bajet:</span>
                <span className="font-mono font-bold text-indigo-900">
                  RM {submittedData?.anggaranBajet?.toLocaleString('ms-MY')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Garis Masa Sasaran:</span>
                <span className="font-semibold text-slate-900">{submittedData?.jangkaanGarisMasa}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleSendWhatsAppToConsultant}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Teruskan ke WhatsApp Provexa Sekarang</span>
              </button>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Hantar Permohonan Lain
              </button>
            </div>
          </div>
        ) : (
          /* FORM BODY */
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            {/* Step 1: Select 1 of 8 Services */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  1
                </span>
                <span>Pilih Servis Utama Yang Anda Perlukan *</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.values(PROVEXA_SERVICES).map((srv) => {
                  const isSelected = servisMinat === srv.key;
                  return (
                    <button
                      key={srv.key}
                      type="button"
                      onClick={() => handleServiceChange(srv.key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${srv.badgeBg} ${srv.badgeColor}`}
                          >
                            {srv.category}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs leading-snug">
                          {srv.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {srv.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Bermula dari</span>
                        <span className="font-mono font-bold text-indigo-900">
                          RM {srv.startingPrice.toLocaleString('ms-MY')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Client & Company Information */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Maklumat Perhubungan Anda *</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Penuh Anda *
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Farhan bin Ahmad"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Syarikat / Perniagaan (Jika ada)
                  </label>
                  <input
                    type="text"
                    value={syarikat}
                    onChange={(e) => setSyarikat(e.target.value)}
                    placeholder="Contoh: Mega Niaga Retail Sdn Bhd"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nombor WhatsApp Aktif *
                  </label>
                  <input
                    type="text"
                    required
                    value={telefon}
                    onChange={(e) => setTelefon(e.target.value)}
                    placeholder="Contoh: 0123456789"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Untuk penerimaan sebutharga dan pengesahan ringkas melalui WhatsApp.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Alamat Emel Rasmi
                  </label>
                  <input
                    type="email"
                    value={emel}
                    onChange={(e) => setEmel(e.target.value)}
                    placeholder="Contoh: farhan@meganiaga.com"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Project Requirements & Budget */}
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-900 uppercase tracking-wider mb-3">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                  3
                </span>
                <span>Skop &amp; Bajet Projek</span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Anggaran Bajet (RM)
                    </label>
                    <input
                      type="number"
                      min="500"
                      step="100"
                      value={anggaranBajet}
                      onChange={(e) => setAnggaranBajet(Number(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm font-semibold text-indigo-950"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Sasaran Siap / Garis Masa
                    </label>
                    <select
                      value={jangkaanGarisMasa}
                      onChange={(e) => setJangkaanGarisMasa(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white font-medium"
                    >
                      <option value="Segera (1 - 2 Minggu)">Segera (1 - 2 Minggu)</option>
                      <option value="1 Bulan">1 Bulan</option>
                      <option value="1 - 2 Bulan">1 - 2 Bulan</option>
                      <option value="3 Bulan ke atas">3 Bulan ke atas</option>
                      <option value="Fleksibel mengikut skop">Fleksibel mengikut skop</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ceritakan Sedikit Mengenai Keperluan Projek Anda
                  </label>
                  <textarea
                    rows={3}
                    value={keperluanProjek}
                    onChange={(e) => setKeperluanProjek(e.target.value)}
                    placeholder="Contoh: Kami perlukan laman web dengan shopping cart FPX, integrasi WhatsApp auto-reply dan sistem pendaftaran membership..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Privacy note and Submit button */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Maklumat anda dilindungi dan hanya digunakan oleh Provexa Solution.</span>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md flex items-center justify-center space-x-2 transition-all hover:scale-[1.02]"
              >
                <span>Hantar Permohonan Konsultasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
