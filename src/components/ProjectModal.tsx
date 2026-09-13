import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  FolderKanban,
  Building2,
  User,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import {
  Project,
  ProjectStatus,
  PriorityLevel,
  ProvexaService,
  PROVEXA_SERVICES,
  ProjectMilestone,
  Lead,
} from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => void;
  initialProject?: Project | null;
  existingProjectsCount?: number;
  prefillFromLead?: Lead | null;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProject,
  existingProjectsCount = 0,
  prefillFromLead,
  onDeleteProject,
}) => {
  const [tajuk, setTajuk] = useState(
    initialProject?.tajuk ||
      (prefillFromLead
        ? `Projek ${PROVEXA_SERVICES[prefillFromLead.servisMinat]?.title || 'Sistem'} - ${
            prefillFromLead.syarikat || prefillFromLead.nama
          }`
        : '')
  );
  const [namaKlien, setNamaKlien] = useState(
    initialProject?.namaKlien || prefillFromLead?.nama || ''
  );
  const [syarikatKlien, setSyarikatKlien] = useState(
    initialProject?.syarikatKlien || prefillFromLead?.syarikat || ''
  );
  const [telefonKlien, setTelefonKlien] = useState(
    initialProject?.telefonKlien || prefillFromLead?.telefon || ''
  );
  const [emelKlien, setEmelKlien] = useState(
    initialProject?.emelKlien || prefillFromLead?.emel || ''
  );

  const [servisUtama, setServisUtama] = useState<ProvexaService>(
    initialProject?.servisUtama || prefillFromLead?.servisMinat || 'website'
  );
  const [servisTambahan, setServisTambahan] = useState<ProvexaService[]>(
    initialProject?.servisTambahan || []
  );

  const [skopKerja, setSkopKerja] = useState(
    initialProject?.skopKerja ||
      'Pembangunan sistem berasaskan spesifikasi pelanggan lengkap dengan integrasi pangkalan data dan sesi UAT.'
  );

  const [status, setStatus] = useState<ProjectStatus>(
    initialProject?.status || 'pembangunan'
  );
  const [keutamaan, setKeutamaan] = useState<PriorityLevel>(
    initialProject?.keutamaan || 'tinggi'
  );
  const [kemajuanPeratus, setKemajuanPeratus] = useState<number>(
    initialProject?.kemajuanPeratus || 25
  );

  const [nilaiKontrak, setNilaiKontrak] = useState<number>(
    initialProject?.nilaiKontrak ||
      prefillFromLead?.anggaranBajet ||
      PROVEXA_SERVICES.website?.startingPrice ||
      1800
  );
  const [jumlahDibayar, setJumlahDibayar] = useState<number>(
    initialProject?.jumlahDibayar || 0
  );

  const [tarikhMula, setTarikhMula] = useState<string>(
    initialProject?.tarikhMula || new Date().toISOString().split('T')[0]
  );
  const [tarikhSasaran, setTarikhSasaran] = useState<string>(
    initialProject?.tarikhSasaran ||
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
  );

  const [pautanHasil, setPautanHasil] = useState(initialProject?.pautanHasil || '');
  const [nota, setNota] = useState(
    initialProject?.nota || (prefillFromLead?.nota ? `Lead Note: ${prefillFromLead.nota}` : '')
  );

  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Milestones
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(
    initialProject?.milestones || [
      {
        id: 'M1',
        tajuk: 'Perancangan & Reka Bentuk UI/UX',
        tarikhSasaran: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().split('T')[0],
        status: 'selesai',
        jumlahBayaran: 1000,
      },
      {
        id: 'M2',
        tajuk: 'Pembangunan & Integrasi Backend / API',
        tarikhSasaran: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString().split('T')[0],
        status: 'dalam_proses',
        jumlahBayaran: 1500,
      },
      {
        id: 'M3',
        tajuk: 'Ujian UAT & Pelancaran Rasmi',
        tarikhSasaran: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
        status: 'belum',
        jumlahBayaran: 1000,
      },
    ]
  );

  const handleToggleServisTambahan = (srv: ProvexaService) => {
    if (srv === servisUtama) return;
    if (servisTambahan.includes(srv)) {
      setServisTambahan(servisTambahan.filter((s) => s !== srv));
    } else {
      setServisTambahan([...servisTambahan, srv]);
    }
  };

  const handleAddMilestone = () => {
    const newM: ProjectMilestone = {
      id: `M-${Date.now().toString().slice(-4)}`,
      tajuk: 'Fasa Baru / Milestone Tambahan',
      tarikhSasaran: tarikhSasaran,
      status: 'belum',
      jumlahBayaran: 500,
    };
    setMilestones([...milestones, newM]);
  };

  const handleUpdateMilestone = (
    id: string,
    field: keyof ProjectMilestone,
    val: any
  ) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: val } : m))
    );
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tajuk.trim() || !namaKlien.trim()) return;

    const prefix =
      servisUtama === 'website'
        ? 'PRX-WEB'
        : servisUtama === 'saas'
        ? 'PRX-SAAS'
        : servisUtama === 'training'
        ? 'PRX-TRN'
        : servisUtama === 'consultation'
        ? 'PRX-CNS'
        : servisUtama === 'social_media'
        ? 'PRX-SMM'
        : servisUtama === 'paid_ads'
        ? 'PRX-ADS'
        : servisUtama === 'promptgalerix'
        ? 'PRX-PGX'
        : 'PRX-BRD';

    const count = existingProjectsCount + 1;
    const year = new Date().getFullYear();
    const kodProjek = initialProject?.kodProjek || `${prefix}-${year}-${String(count).padStart(3, '0')}`;

    onSave({
      ...(initialProject ? { id: initialProject.id } : {}),
      kodProjek,
      tajuk: tajuk.trim(),
      namaKlien: namaKlien.trim(),
      syarikatKlien: syarikatKlien.trim() || undefined,
      telefonKlien: telefonKlien.trim(),
      emelKlien: emelKlien.trim() || undefined,
      servisUtama,
      servisTambahan: servisTambahan.length > 0 ? servisTambahan : undefined,
      skopKerja,
      status,
      keutamaan,
      kemajuanPeratus,
      nilaiKontrak,
      jumlahDibayar,
      tarikhMula,
      tarikhSasaran,
      milestones,
      pautanHasil: pautanHasil.trim() || undefined,
      nota,
      tarikhDicipta: initialProject?.tarikhDicipta || new Date().toISOString(),
      tarikhDikemaskini: new Date().toISOString(),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {initialProject ? 'Kemaskini Projek Provexa' : 'Daftar Projek Baharu'}
              </h3>
              <p className="text-xs text-slate-500">
                Pengurusan garis masa, kos &amp; serahan 8 produk Provexa Solution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* General Project Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tajuk Projek *
              </label>
              <input
                type="text"
                required
                value={tajuk}
                onChange={(e) => setTajuk(e.target.value)}
                placeholder="cth: Pembangunan Portal E-Commerce Mega Niaga"
                className="w-full text-sm font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Servis Utama Provexa *
              </label>
              <select
                value={servisUtama}
                onChange={(e) => setServisUtama(e.target.value as ProvexaService)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-indigo-900"
              >
                {Object.values(PROVEXA_SERVICES).map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.title} ({s.priceModel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Pelaksanaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="rundingan">Fasa Rundingan &amp; Sebutharga</option>
                <option value="perancangan">Perancangan &amp; UI/UX Wireframe</option>
                <option value="pembangunan">Pembangunan Aktif (In Progress)</option>
                <option value="semakan_uat">Semakan Pelanggan &amp; UAT</option>
                <option value="selesai">Selesai &amp; Diserah (Completed)</option>
                <option value="penyelenggaraan">Penyelenggaraan / Retainer</option>
              </select>
            </div>
          </div>

          {/* Add-on Services from 8 products */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Servis Tambahan / Pakej Pelengkap:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(PROVEXA_SERVICES).map((s) => {
                if (s.key === servisUtama) return null;
                const isChecked = servisTambahan.includes(s.key);
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleToggleServisTambahan(s.key)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                      isChecked
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {s.shortTitle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Client Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Butiran Pelanggan</span>
              </h4>
              {(namaKlien || syarikatKlien || telefonKlien || emelKlien) && (
                <button
                  type="button"
                  onClick={() => {
                    setNamaKlien('');
                    setSyarikatKlien('');
                    setTelefonKlien('');
                    setEmelKlien('');
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-600 font-medium flex items-center space-x-1 transition-colors px-2 py-0.5 rounded hover:bg-rose-50"
                  title="Kosongkan semua maklumat pelanggan bagi projek ini"
                >
                  <Trash2 className="w-3 h-3 text-rose-500" />
                  <span>Kosongkan Maklumat Klien</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pelanggan *
                </label>
                <input
                  type="text"
                  required
                  value={namaKlien}
                  onChange={(e) => setNamaKlien(e.target.value)}
                  placeholder="Dato' Azhar"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Syarikat
                </label>
                <input
                  type="text"
                  value={syarikatKlien}
                  onChange={(e) => setSyarikatKlien(e.target.value)}
                  placeholder="Mega Niaga Sdn Bhd"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Telefon *
                </label>
                <input
                  type="text"
                  required
                  value={telefonKlien}
                  onChange={(e) => setTelefonKlien(e.target.value)}
                  placeholder="0123456789"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emel Klien
                </label>
                <input
                  type="email"
                  value={emelKlien}
                  onChange={(e) => setEmelKlien(e.target.value)}
                  placeholder="klien@gmail.com"
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Financials & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nilai Kontrak (RM) *
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={nilaiKontrak}
                onChange={(e) => setNilaiKontrak(Number(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg font-mono text-indigo-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Telah Dibayar (RM)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={jumlahDibayar}
                onChange={(e) => setJumlahDibayar(Number(e.target.value) || 0)}
                className="w-full text-xs font-bold px-3 py-2 border border-slate-300 rounded-lg font-mono text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarikh Mula
              </label>
              <input
                type="date"
                value={tarikhMula}
                onChange={(e) => setTarikhMula(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tarikh Sasaran Serahan
              </label>
              <input
                type="date"
                value={tarikhSasaran}
                onChange={(e) => setTarikhSasaran(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">
                Kemajuan Projek (Progress): {kemajuanPeratus}%
              </label>
              <span className="text-xs font-semibold text-indigo-600">
                {kemajuanPeratus === 100
                  ? 'Selesai Sepenuhnya'
                  : kemajuanPeratus >= 75
                  ? 'Fasa UAT / Semakan'
                  : kemajuanPeratus >= 30
                  ? 'Pembangunan Aktif'
                  : 'Fasa Mula'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={kemajuanPeratus}
              onChange={(e) => setKemajuanPeratus(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Scope of Work */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ringkasan Skop Kerja &amp; Serahan
            </label>
            <textarea
              rows={3}
              value={skopKerja}
              onChange={(e) => setSkopKerja(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Staging URL & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pautan Staging / Figma / Live Domain
              </label>
              <input
                type="url"
                value={pautanHasil}
                onChange={(e) => setPautanHasil(e.target.value)}
                placeholder="https://staging.klien.provexasolution.com"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Keutamaan (Priority)
              </label>
              <select
                value={keutamaan}
                onChange={(e) => setKeutamaan(e.target.value as PriorityLevel)}
                className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="rendah">Rendah</option>
                <option value="sederhana">Sederhana</option>
                <option value="tinggi">Tinggi</option>
                <option value="kritikal">Kritikal (Urgent Delivery)</option>
              </select>
            </div>
          </div>

          {/* Milestones List */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Pencapaian Fasa (Project Milestones)
              </h4>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-xs px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-md font-bold text-indigo-700 flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Tambah Milestone</span>
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 text-xs"
                >
                  <input
                    type="text"
                    value={m.tajuk}
                    onChange={(e) => handleUpdateMilestone(m.id, 'tajuk', e.target.value)}
                    className="flex-1 min-w-[200px] px-2 py-1 border border-slate-200 rounded font-medium"
                    placeholder="Nama Milestone"
                  />
                  <input
                    type="date"
                    value={m.tarikhSasaran}
                    onChange={(e) =>
                      handleUpdateMilestone(m.id, 'tarikhSasaran', e.target.value)
                    }
                    className="w-32 px-2 py-1 border border-slate-200 rounded"
                  />
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateMilestone(m.id, 'status', e.target.value)}
                    className="w-28 px-2 py-1 border border-slate-200 rounded font-semibold bg-white"
                  >
                    <option value="belum">Belum</option>
                    <option value="dalam_proses">Sedang Jalan</option>
                    <option value="selesai">Selesai</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Dalaman Pasukan Provexa
            </label>
            <textarea
              rows={2}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Catatan tambahan keperluan klien, akses hosting, dsb."
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              {initialProject && onDeleteProject && (
                <div>
                  {!isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingDelete(true)}
                      className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center space-x-1.5 transition-colors"
                      title="Padam projek ini dan rekod klien berkaitan"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Padam Projek &amp; Klien</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200">
                      <span className="text-[11px] font-semibold text-rose-700">
                        Pasti padam rekod ini?
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteProject(initialProject.id);
                          onClose();
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded shadow-2xs transition-colors"
                      >
                        Ya, Padam
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingDelete(false)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 text-[11px] font-medium rounded transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs flex items-center space-x-1.5 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan Projek</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
