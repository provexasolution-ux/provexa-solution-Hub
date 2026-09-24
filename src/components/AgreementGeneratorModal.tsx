import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Printer,
  Share2,
  Copy,
  CheckCircle2,
  X,
  Building2,
  User,
  ShieldCheck,
  Scale,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  AgreementDoc,
  AgreementType,
  ProvexaService,
  PROVEXA_SERVICES,
  Project,
  Lead,
  ServiceMeta,
} from '../types';
import {
  createWhatsAppUrl,
  formatAgreementForWhatsApp,
} from '../utils/whatsapp';
import { ProvexaLogo } from './ProvexaLogo';

interface AgreementGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (agreement: AgreementDoc) => void;
  onSaveAgreement?: (agreement: AgreementDoc) => void;
  initialAgreement?: AgreementDoc | null;
  linkedProject?: Project | null;
  prefillProject?: Project | null;
  linkedLead?: Lead | null;
  prefillLead?: Lead | null;
  defaultType?: AgreementType;
  prefillService?: ProvexaService;
  services?: Record<string, ServiceMeta>;
  existingAgreements?: AgreementDoc[];
  onDeleteAgreement?: (agreementId: string) => void;
}

export const AgreementGeneratorModal: React.FC<AgreementGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveAgreement,
  initialAgreement,
  linkedProject: propLinkedProject,
  prefillProject,
  linkedLead: propLinkedLead,
  prefillLead,
  defaultType,
  prefillService,
  services,
  existingAgreements = [],
  onDeleteAgreement,
}) => {
  const linkedProject = prefillProject || propLinkedProject;
  const linkedLead = prefillLead || propLinkedLead;
  const catalogServices = services || PROVEXA_SERVICES;
  const handleSaveCallback = onSave || onSaveAgreement;

  const [agreementType, setAgreementType] = useState<AgreementType>(
    initialAgreement?.jenis || defaultType || 'perjanjian_servis'
  );

  const [agreementNumber, setAgreementNumber] = useState<string>(() => {
    if (initialAgreement?.noPerjanjian) return initialAgreement.noPerjanjian;
    const year = new Date().getFullYear();
    const count = existingAgreements.length + 1;
    return `PRX-AGR-${year}-${String(count).padStart(3, '0')}`;
  });

  const [tajuk, setTajuk] = useState<string>(
    initialAgreement?.tajuk ||
      (linkedProject
        ? `Perjanjian Perkhidmatan ${PROVEXA_SERVICES[linkedProject.servisUtama]?.shortTitle} - ${linkedProject.tajuk}`
        : linkedLead
        ? `Perjanjian Servis ${PROVEXA_SERVICES[linkedLead.servisMinat]?.shortTitle} - ${linkedLead.nama}`
        : prefillService
        ? `Perjanjian Perkhidmatan ${PROVEXA_SERVICES[prefillService]?.title}`
        : 'Perjanjian Perkhidmatan Pembangunan Sistem & Solusi Digital')
  );

  const [tarikh, setTarikh] = useState<string>(
    initialAgreement?.tarikh || new Date().toISOString().split('T')[0]
  );

  // Client info
  const [namaKlien, setNamaKlien] = useState<string>(
    initialAgreement?.namaKlien || linkedProject?.namaKlien || linkedLead?.nama || ''
  );
  const [syarikatKlien, setSyarikatKlien] = useState<string>(
    initialAgreement?.syarikatKlien || linkedProject?.syarikatKlien || linkedLead?.syarikat || ''
  );
  const [noIcSSMKlien, setNoIcSSMKlien] = useState<string>(
    initialAgreement?.noIcSSMKlien || ''
  );
  const [alamatKlien, setAlamatKlien] = useState<string>(
    initialAgreement?.alamatKlien || ''
  );
  const [telefonKlien, setTelefonKlien] = useState<string>(
    initialAgreement?.telefonKlien || linkedProject?.telefonKlien || linkedLead?.telefon || ''
  );
  const [emelKlien, setEmelKlien] = useState<string>(
    initialAgreement?.emelKlien || linkedProject?.emelKlien || linkedLead?.emel || ''
  );

  // Services involved (multi-select from the 8 official services)
  const [selectedServices, setSelectedServices] = useState<ProvexaService[]>(() => {
    if (initialAgreement?.servisTerlibat && initialAgreement.servisTerlibat.length > 0) {
      return initialAgreement.servisTerlibat;
    }
    if (linkedProject) {
      const list: ProvexaService[] = [linkedProject.servisUtama];
      if (linkedProject.servisTambahan) list.push(...linkedProject.servisTambahan);
      return list;
    }
    if (linkedLead) {
      return [linkedLead.servisMinat];
    }
    if (prefillService) {
      return [prefillService];
    }
    return ['website'];
  });

  const [nilaiProjek, setNilaiProjek] = useState<number>(
    initialAgreement?.nilaiProjek ||
      linkedProject?.nilaiKontrak ||
      linkedLead?.anggaranBajet ||
      (prefillService ? PROVEXA_SERVICES[prefillService]?.startingPrice : 3500) ||
      3500
  );

  // Milestones breakdown
  const [depositPeratus, setDepositPeratus] = useState<number>(
    initialAgreement?.jadualBayaran?.depositPeratus ?? 50
  );
  const [kemajuanPeratus, setKemajuanPeratus] = useState<number>(
    initialAgreement?.jadualBayaran?.kemajuanPeratus ?? 30
  );
  const [akhirPeratus, setAkhirPeratus] = useState<number>(
    initialAgreement?.jadualBayaran?.akhirPeratus ?? 20
  );
  const [termaHari, setTermaHari] = useState<number>(
    initialAgreement?.jadualBayaran?.termaHari ?? 7
  );

  const [tempohHariBekerja, setTempohHariBekerja] = useState<number>(
    initialAgreement?.tempohHariBekerja ?? 30
  );
  const [hadSemakanPusingan, setHadSemakanPusingan] = useState<number>(
    initialAgreement?.hadSemakanPusingan ?? 2
  );
  const [tempohWarantiHari, setTempohWarantiHari] = useState<number>(
    initialAgreement?.tempohWarantiHari ?? 30
  );

  const [skopTerperinci, setSkopTerperinci] = useState<string>(
    initialAgreement?.skopTerperinci ||
      `Pihak Provexa Solution bertanggungjawab mereka bentuk, membina, menguji, dan menyerahkan sistem berasaskan spesifikasi yang dipersetujui.\n` +
        `• Pembangunan fungsi teras & panel pentadbir (Admin Panel)\n` +
        `• Konfigurasi domain, sijil keselamatan SSL & pangkalan data awan\n` +
        `• Sesi penerangan penggunaan dan penyerahan kredensial pentadbir`
  );

  const [klausaHartaIntelek, setKlausaHartaIntelek] = useState<string>(
    initialAgreement?.klausaHartaIntelek ||
      'Hak milik penuh kod sumber (source code), pangkalan data, dan aset grafik yang dibangunkan adalah 100% milik Pihak Pelanggan setelah pembayaran keseluruhan dijelaskan sepenuhnya. Provexa Solution tidak akan menahan akses domain atau kod sumber pelanggan.'
  );

  const [klausaKerahsiaan, setKlausaKerahsiaan] = useState<string>(
    initialAgreement?.klausaKerahsiaan ||
      'Kedua-dua pihak bersetuju menjaga segala maklumat sulit, rahsia perniagaan, data pelanggan, dan maklumat teknikal yang dikongsi sepanjang projek daripada dibocorkan kepada mana-mana pihak ketiga di bawah Akta Perlindungan Data Peribadi 2010 (PDPA).'
  );

  const [klausaPenamatan, setKlausaPenamatan] = useState<string>(
    initialAgreement?.klausaPenamatan ||
      'Sekiranya Pihak Pelanggan membatalkan projek secara unilateral setelah kerja-kerja fasa pertama dimulakan, deposit 50% tidak akan dikembalikan bagi menampung kos masa dan sumber teknikal yang telah diperuntukkan. Sebarang pertikaian hendaklah diselesaikan secara rundingan muhibah terlebih dahulu.'
  );

  const [namaWakilProvexa, setNamaWakilProvexa] = useState<string>(
    initialAgreement?.namaWakilProvexa || 'Pengarah Projek & Teknologi'
  );
  const [jawatanWakilProvexa, setJawatanWakilProvexa] = useState<string>(
    initialAgreement?.jawatanWakilProvexa || 'Provexa Solution'
  );
  const [namaWakilKlien, setNamaWakilKlien] = useState<string>(
    initialAgreement?.namaWakilKlien || (initialAgreement?.namaKlien || 'Pihak Pelanggan')
  );
  const [jawatanWakilKlien, setJawatanWakilKlien] = useState<string>(
    initialAgreement?.jawatanWakilKlien || 'Pengarah Urusan / Pemilik'
  );

  const [status, setStatus] = useState<AgreementDoc['status']>(
    initialAgreement?.status || 'draf'
  );
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [copied, setCopied] = useState(false);

  // Sync state whenever initialAgreement changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialAgreement) {
        setAgreementType(initialAgreement.jenis || defaultType || 'perjanjian_servis');
        setAgreementNumber(initialAgreement.noPerjanjian || initialAgreement.nomborRujukan || '');
        setTajuk(initialAgreement.tajuk || '');
        setTarikh(initialAgreement.tarikh || new Date().toISOString().split('T')[0]);
        setNamaKlien(initialAgreement.namaKlien || '');
        setSyarikatKlien(initialAgreement.syarikatKlien || '');
        setNoIcSSMKlien(initialAgreement.noIcSSMKlien || '');
        setAlamatKlien(initialAgreement.alamatKlien || '');
        setTelefonKlien(initialAgreement.telefonKlien || '');
        setEmelKlien(initialAgreement.emelKlien || '');
        setSelectedServices(
          initialAgreement.servisTerlibat && initialAgreement.servisTerlibat.length > 0
            ? initialAgreement.servisTerlibat
            : ['website']
        );
        setNilaiProjek(initialAgreement.nilaiProjek || 0);
        setDepositPeratus(initialAgreement.jadualBayaran?.depositPeratus ?? 50);
        setKemajuanPeratus(initialAgreement.jadualBayaran?.kemajuanPeratus ?? 30);
        setAkhirPeratus(initialAgreement.jadualBayaran?.akhirPeratus ?? 20);
        setTermaHari(initialAgreement.jadualBayaran?.termaHari ?? 7);
        setTempohHariBekerja(initialAgreement.tempohHariBekerja ?? 30);
        setHadSemakanPusingan(initialAgreement.hadSemakanPusingan ?? 2);
        setTempohWarantiHari(initialAgreement.tempohWarantiHari ?? 30);
        setSkopTerperinci(initialAgreement.skopTerperinci || '');
        setKlausaHartaIntelek(initialAgreement.klausaHartaIntelek || '');
        setKlausaKerahsiaan(initialAgreement.klausaKerahsiaan || '');
        setKlausaPenamatan(initialAgreement.klausaPenamatan || '');
        setNamaWakilProvexa(initialAgreement.namaWakilProvexa || 'Pengarah Projek & Teknologi');
        setJawatanWakilProvexa(initialAgreement.jawatanWakilProvexa || 'Provexa Solution');
        setNamaWakilKlien(initialAgreement.namaWakilKlien || initialAgreement.namaKlien || '');
        setJawatanWakilKlien(initialAgreement.jawatanWakilKlien || 'Pengarah Urusan / Pemilik');
        setStatus(initialAgreement.status || 'draf');
      } else {
        const year = new Date().getFullYear();
        const count = existingAgreements.length + 1;
        setAgreementType(defaultType || 'perjanjian_servis');
        setAgreementNumber(`PRX-AGR-${year}-${String(count).padStart(3, '0')}`);
        setTajuk(
          linkedProject
            ? `Perjanjian Perkhidmatan ${PROVEXA_SERVICES[linkedProject.servisUtama]?.shortTitle} - ${linkedProject.tajuk}`
            : linkedLead
            ? `Perjanjian Servis ${PROVEXA_SERVICES[linkedLead.servisMinat]?.shortTitle} - ${linkedLead.nama}`
            : prefillService
            ? `Perjanjian Perkhidmatan ${PROVEXA_SERVICES[prefillService]?.title}`
            : 'Perjanjian Perkhidmatan Pembangunan Sistem & Solusi Digital'
        );
        setTarikh(new Date().toISOString().split('T')[0]);
        setNamaKlien(linkedProject?.namaKlien || linkedLead?.nama || '');
        setSyarikatKlien(linkedProject?.syarikatKlien || linkedLead?.syarikat || '');
        setNoIcSSMKlien('');
        setAlamatKlien('');
        setTelefonKlien(linkedProject?.telefonKlien || linkedLead?.telefon || '');
        setEmelKlien(linkedProject?.emelKlien || linkedLead?.emel || '');
        if (linkedProject) {
          const list: ProvexaService[] = [linkedProject.servisUtama];
          if (linkedProject.servisTambahan) list.push(...linkedProject.servisTambahan);
          setSelectedServices(list);
        } else if (linkedLead) {
          setSelectedServices([linkedLead.servisMinat]);
        } else if (prefillService) {
          setSelectedServices([prefillService]);
        } else {
          setSelectedServices(['website']);
        }
        setNilaiProjek(
          linkedProject?.nilaiKontrak ||
            linkedLead?.anggaranBajet ||
            (prefillService ? PROVEXA_SERVICES[prefillService]?.startingPrice : 3500) ||
            3500
        );
        setDepositPeratus(50);
        setKemajuanPeratus(30);
        setAkhirPeratus(20);
        setTermaHari(7);
        setTempohHariBekerja(30);
        setHadSemakanPusingan(2);
        setTempohWarantiHari(30);
        setSkopTerperinci(
          `Pihak Provexa Solution bertanggungjawab mereka bentuk, membina, menguji, dan menyerahkan sistem berasaskan spesifikasi yang dipersetujui.\n` +
            `• Pembangunan fungsi teras & panel pentadbir (Admin Panel)\n` +
            `• Konfigurasi domain, sijil keselamatan SSL & pangkalan data awan\n` +
            `• Sesi penerangan penggunaan dan penyerahan kredensial pentadbir`
        );
        setKlausaHartaIntelek(
          'Hak milik penuh kod sumber (source code), pangkalan data, dan aset grafik yang dibangunkan adalah 100% milik Pihak Pelanggan setelah pembayaran keseluruhan dijelaskan sepenuhnya. Provexa Solution tidak akan menahan akses domain atau kod sumber pelanggan.'
        );
        setKlausaKerahsiaan(
          'Kedua-dua pihak bersetuju menjaga segala maklumat sulit, rahsia perniagaan, data pelanggan, dan maklumat teknikal yang dikongsi sepanjang projek daripada dibocorkan kepada mana-mana pihak ketiga di bawah Akta Perlindungan Data Peribadi 2010 (PDPA).'
        );
        setKlausaPenamatan(
          'Sekiranya Pihak Pelanggan membatalkan projek secara unilateral setelah kerja-kerja fasa pertama dimulakan, deposit 50% tidak akan dikembalikan bagi menampung kos masa dan sumber teknikal yang telah diperuntukkan. Sebarang pertikaian hendaklah diselesaikan secara rundingan muhibah terlebih dahulu.'
        );
        setNamaWakilProvexa('Pengarah Projek & Teknologi');
        setJawatanWakilProvexa('Provexa Solution');
        setNamaWakilKlien(linkedProject?.namaKlien || linkedLead?.nama || 'Pihak Pelanggan');
        setJawatanWakilKlien('Pengarah Urusan / Pemilik');
        setStatus('draf');
      }
      setIsConfirmingDelete(false);
      setViewMode('editor');
    }
  }, [isOpen, initialAgreement]);

  // Toggle service selection
  const toggleService = (key: ProvexaService) => {
    if (selectedServices.includes(key)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== key));
      }
    } else {
      setSelectedServices([...selectedServices, key]);
    }
  };

  const buildCurrentAgreement = (): AgreementDoc => {
    return {
      id: initialAgreement?.id || `AGR-${Date.now()}`,
      noPerjanjian: agreementNumber,
      nomborRujukan: agreementNumber,
      jenis: agreementType,
      tajuk,
      tarikh,
      projekId: linkedProject?.id,
      namaKlien: namaKlien || 'Pihak Pelanggan',
      syarikatKlien: syarikatKlien || undefined,
      noIcSSMKlien: noIcSSMKlien || undefined,
      alamatKlien: alamatKlien || undefined,
      telefonKlien,
      emelKlien: emelKlien || undefined,
      servisTerlibat: selectedServices,
      skopTerperinci,
      nilaiProjek,
      jadualBayaran: {
        depositPeratus,
        kemajuanPeratus,
        akhirPeratus,
        termaHari,
      },
      tempohHariBekerja,
      hadSemakanPusingan,
      tempohWarantiHari,
      klausaHartaIntelek,
      klausaKerahsiaan,
      klausaPenamatan,
      namaWakilProvexa,
      jawatanWakilProvexa,
      namaWakilKlien: namaWakilKlien || namaKlien || 'Pihak Pelanggan',
      jawatanWakilKlien,
      status: status,
      tarikhDicipta: initialAgreement?.tarikhDicipta || new Date().toISOString(),
      tarikhDikemaskini: new Date().toISOString(),
    };
  };

  const handleSave = () => {
    const agr = buildCurrentAgreement();
    if (handleSaveCallback) {
      handleSaveCallback(agr);
    }
    onClose();
  };

  const handlePrint = () => {
    setViewMode('preview');
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleSendWhatsApp = () => {
    const agr = buildCurrentAgreement();
    const formatted = formatAgreementForWhatsApp(agr);
    const url = createWhatsAppUrl(telefonKlien || '0123456789', formatted);
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    const agr = buildCurrentAgreement();
    const formatted = formatAgreementForWhatsApp(agr);
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>{initialAgreement ? 'Kemaskini Perjanjian' : 'Penjana Perjanjian & Terma Syarat (T&C)'}</span>
                {initialAgreement && (
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                    {agreementNumber}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {initialAgreement
                  ? 'Kemaskini butiran kontrak, skop servis, jadual bayaran, status dan klausa perjanjian.'
                  : 'Kontrak Servis, Perlindungan Harta Intelek & Terma Projek Provexa Solution'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex bg-slate-200 p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('editor')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Borang Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pratonton Kontrak
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-4 sm:px-6 py-2.5 bg-purple-50/60 border-b border-purple-100 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
          {/* Agreement Type */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">Dokumen:</span>
            <button
              type="button"
              onClick={() => setAgreementType('perjanjian_servis')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                agreementType === 'perjanjian_servis'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📜 Perjanjian Servis Lengkap
            </button>
            <button
              type="button"
              onClick={() => setAgreementType('terma_syarat')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                agreementType === 'terma_syarat'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📋 Terma &amp; Syarat (T&amp;C)
            </button>
            <button
              type="button"
              onClick={() => setAgreementType('nda')}
              className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                agreementType === 'nda'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🔒 NDA (Kerahsiaan)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium flex items-center space-x-1.5 shadow-2xs"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Disalin!' : 'Salin Teks'}</span>
            </button>

            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold flex items-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {viewMode === 'editor' ? (
            /* EDITOR */
            <div className="space-y-6">
              {/* Meta & Contract ID */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Perjanjian / Kontrak
                  </label>
                  <input
                    type="text"
                    value={agreementNumber}
                    onChange={(e) => setAgreementNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Dimeterai
                  </label>
                  <input
                    type="date"
                    value={tarikh}
                    onChange={(e) => setTarikh(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nilai Projek (RM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={nilaiProjek}
                    onChange={(e) => setNilaiProjek(Number(e.target.value) || 0)}
                    className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-purple-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status Dokumen
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as AgreementDoc['status'])}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="draf">Draf (Draf Kerja)</option>
                    <option value="dihantar">Dihantar (Semakan Klien)</option>
                    <option value="dipersetujui">Dipersetujui</option>
                    <option value="ditandatangani">Ditandatangani</option>
                    <option value="dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk Perjanjian / Nama Projek
                  </label>
                  <input
                    type="text"
                    value={tajuk}
                    onChange={(e) => setTajuk(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Service Selection from 8 Provexa Services */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Servis &amp; Produk Provexa Yang Terlibat Dalam Perjanjian Ini:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(Object.values(catalogServices) as ServiceMeta[]).map((service) => {
                    const isSelected = selectedServices.includes(service.key as ProvexaService);
                    return (
                      <button
                        key={service.key}
                        type="button"
                        onClick={() => toggleService(service.key)}
                        className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{service.shortTitle}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1">
                          {service.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Maklumat Pihak Kedua (Pelanggan / Klien)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Individu / Wakil Sah *
                    </label>
                    <input
                      type="text"
                      value={namaKlien}
                      onChange={(e) => setNamaKlien(e.target.value)}
                      placeholder="cth: Dato' Azhar Kamaruddin"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Syarikat / Organisasi
                    </label>
                    <input
                      type="text"
                      value={syarikatKlien}
                      onChange={(e) => setSyarikatKlien(e.target.value)}
                      placeholder="cth: Mega Niaga Retail Sdn Bhd"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. Kad Pengenalan / No. SSM
                    </label>
                    <input
                      type="text"
                      value={noIcSSMKlien}
                      onChange={(e) => setNoIcSSMKlien(e.target.value)}
                      placeholder="cth: 201901034455 (1340123-X)"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. Telefon / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={telefonKlien}
                      onChange={(e) => setTelefonKlien(e.target.value)}
                      placeholder="0123456789"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Berdaftar / Pejabat Klien
                    </label>
                    <input
                      type="text"
                      value={alamatKlien}
                      onChange={(e) => setAlamatKlien(e.target.value)}
                      placeholder="Alamat pejabat klien"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-3 border-t border-slate-200">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Penandatangan Dokumen (Wakil Syarikat &amp; Klien)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Nama Wakil Provexa
                        </label>
                        <input
                          type="text"
                          value={namaWakilProvexa}
                          onChange={(e) => setNamaWakilProvexa(e.target.value)}
                          placeholder="cth: Pengarah Projek"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Jawatan Wakil Provexa
                        </label>
                        <input
                          type="text"
                          value={jawatanWakilProvexa}
                          onChange={(e) => setJawatanWakilProvexa(e.target.value)}
                          placeholder="cth: Provexa Solution"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Nama Wakil Penandatangan Klien
                        </label>
                        <input
                          type="text"
                          value={namaWakilKlien}
                          onChange={(e) => setNamaWakilKlien(e.target.value)}
                          placeholder="Nama penuh penandatangan"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">
                          Jawatan Wakil Penandatangan Klien
                        </label>
                        <input
                          type="text"
                          value={jawatanWakilKlien}
                          onChange={(e) => setJawatanWakilKlien(e.target.value)}
                          placeholder="cth: Pengarah Urusan / Pemilik"
                          className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestones & Timeline Clauses */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  Parameter Garis Masa &amp; Struktur Pembayaran
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Deposit Mula (%)
                    </label>
                    <input
                      type="number"
                      value={depositPeratus}
                      onChange={(e) => setDepositPeratus(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Fasa Kemajuan (%)
                    </label>
                    <input
                      type="number"
                      value={kemajuanPeratus}
                      onChange={(e) => setKemajuanPeratus(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Penyerahan Akhir (%)
                    </label>
                    <input
                      type="number"
                      value={akhirPeratus}
                      onChange={(e) => setAkhirPeratus(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Garis Masa (Hari Bekerja)
                    </label>
                    <input
                      type="number"
                      value={tempohHariBekerja}
                      onChange={(e) => setTempohHariBekerja(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Waranti Bug (Hari)
                    </label>
                    <input
                      type="number"
                      value={tempohWarantiHari}
                      onChange={(e) => setTempohWarantiHari(Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-md font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Clauses Text Areas */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    1. Skop Kerja &amp; Serahan Projek
                  </label>
                  <textarea
                    rows={4}
                    value={skopTerperinci}
                    onChange={(e) => setSkopTerperinci(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    2. Klausa Hak Harta Intelek (IP &amp; Kod Sumber)
                  </label>
                  <textarea
                    rows={3}
                    value={klausaHartaIntelek}
                    onChange={(e) => setKlausaHartaIntelek(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    3. Klausa Kerahsiaan &amp; Perlindungan Data (PDPA / NDA)
                  </label>
                  <textarea
                    rows={3}
                    value={klausaKerahsiaan}
                    onChange={(e) => setKlausaKerahsiaan(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    4. Klausa Pembatalan, Penamatan &amp; Polisi Deposit
                  </label>
                  <textarea
                    rows={3}
                    value={klausaPenamatan}
                    onChange={(e) => setKlausaPenamatan(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW / PRINT CONTRACT */
            <div className="bg-white p-6 sm:p-10 max-w-4xl mx-auto border border-slate-200 shadow-xs rounded-xl print:border-none print:shadow-none print:p-2 text-slate-900 leading-relaxed text-xs sm:text-sm">
              {/* Header */}
              <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
                <div className="flex justify-center mb-2">
                  <ProvexaLogo className="h-10 w-auto" variant="full" theme="light" />
                </div>
                <p className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                  No. Pendaftaran SSM: 202403198822 (TR0289110-M)
                </p>
                <div className="mt-3 inline-block px-4 py-1.5 bg-slate-100 rounded-md font-black text-sm uppercase tracking-wider text-slate-900 border border-slate-300">
                  {agreementType === 'perjanjian_servis'
                    ? 'PERJANJIAN PERKHIDMATAN PEMBANGUNAN PROJEK & SOLUSI DIGITAL'
                    : agreementType === 'terma_syarat'
                    ? 'TERMA & SYARAT PERKHIDMATAN PROJEK'
                    : 'PERJANJIAN KERAHSIAAN (NON-DISCLOSURE AGREEMENT)'}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  No. Rujukan Kontrak: {agreementNumber} | Tarikh: {tarikh}
                </p>
              </div>

              {/* Preamble */}
              <div className="mb-6 space-y-2 text-xs">
                <p>
                  Perjanjian ini dimeterai pada <span className="font-bold">{tarikh}</span> antara:
                </p>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <p>
                    <strong>1. PROVEXA SOLUTION</strong> (No. SSM: 202603062093 (CA0417861-M), beralamat di Suite
                    39 TINGKAT 1, JALAN TASIK INDAH, 1/4
TAMAN TASIK INDAH , 86000 KLUANG, JOHOR
                    (selepas ini dirujuk sebagai <em>"Penyedia Perkhidmatan"</em>).
                  </p>
                  <p>
                    <strong>2. {namaKlien || 'Pihak Pelanggan'}</strong>
                    {syarikatKlien ? ` bagi pihak ${syarikatKlien}` : ''}
                    {noIcSSMKlien ? ` (No. IC/SSM: ${noIcSSMKlien})` : ''}
                    {alamatKlien ? `, beralamat di ${alamatKlien}` : ''} (selepas ini dirujuk sebagai{' '}
                    <em>"Pihak Pelanggan"</em>).
                  </p>
                </div>
              </div>

              {/* Terms Body */}
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 1: SKOP PERKHIDMATAN &amp; SERAHAN (SCOPE OF WORK)
                  </h4>
                  <p className="text-slate-700 whitespace-pre-line pl-3 border-l-2 border-slate-300">
                    {skopTerperinci}
                  </p>
                  <p className="mt-1.5 text-slate-600 pl-3">
                    Servis terpilih merangkumi:{' '}
                    <span className="font-semibold text-slate-800">
                      {selectedServices.map((s) => PROVEXA_SERVICES[s]?.title).join(', ')}
                    </span>
                    .
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 2: NILAI KONTRAK &amp; JADUAL PEMBAYARAN
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300">
                    Jumlah nilai keseluruhan kontrak ini adalah sebanyak{' '}
                    <strong className="text-slate-900">
                      RM {nilaiProjek.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                    </strong>
                    , tertakluk kepada jadual pecahan bayaran berperingkat seperti berikut:
                  </p>
                  <ul className="list-disc list-inside pl-6 mt-1 space-y-0.5 text-slate-700">
                    <li>
                      <strong>Deposit Permulaan ({depositPeratus}%):</strong> RM{' '}
                      {((nilaiProjek * depositPeratus) / 100).toLocaleString('ms-MY', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      sebelum kerja fasa pertama dimulakan.
                    </li>
                    <li>
                      <strong>Bayaran Kemajuan ({kemajuanPeratus}%):</strong> RM{' '}
                      {((nilaiProjek * kemajuanPeratus) / 100).toLocaleString('ms-MY', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      selepas penyerahan prototaip / UAT.
                    </li>
                    <li>
                      <strong>Bayaran Akhir ({akhirPeratus}%):</strong> RM{' '}
                      {((nilaiProjek * akhirPeratus) / 100).toLocaleString('ms-MY', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      sebelum penyerahan domain langsung &amp; kod sumber.
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 3: TEMPOH PELAKSANAAN &amp; HAD SEMAKAN
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300">
                    Tempoh jangkaan penyiapan projek adalah{' '}
                    <strong>{tempohHariBekerja} hari bekerja</strong> bermula dari tarikh penerimaan
                    deposit dan bahan lengkap daripada Pelanggan. Pelanggan berhak menerima sehingga{' '}
                    <strong>{hadSemakanPusingan} pusingan semakan minor percuma</strong>. Sebarang
                    penambahan fungsi baharu di luar skop asal (scope creep) akan dikenakan bayaran
                    berdasarkan Sebutharga Berasingan.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 4: HAK HARTA INTELEK &amp; KOD SUMBER
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300 whitespace-pre-line">
                    {klausaHartaIntelek}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 5: JAMINAN &amp; SOKONGAN TEKNIKAL (WARRANTY)
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300">
                    Provexa Solution memberikan jaminan pembaikan isu teknikal dan pepijat (bug fixing)
                    selama <strong>{tempohWarantiHari} hari kalendar</strong> secara percuma bermula dari
                    tarikh projek dilancarkan secara rasmi.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 6: KERAHSIAAN &amp; DATA PRIVASI (PDPA)
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300 whitespace-pre-line">
                    {klausaKerahsiaan}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-1">
                    KLAUSA 7: PEMBATALAN &amp; PENAMATAN KONTRAK
                  </h4>
                  <p className="text-slate-700 pl-3 border-l-2 border-slate-300 whitespace-pre-line">
                    {klausaPenamatan}
                  </p>
                </div>
              </div>

              {/* Signature Blocks */}
              <div className="grid grid-cols-2 gap-10 pt-10 mt-8 border-t-2 border-slate-900 text-xs">
                <div>
                  <p className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                    Bagi Pihak Penyedia Perkhidmatan:
                  </p>
                  <p className="text-slate-500 mb-10">Provexa Solution</p>
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="font-bold text-slate-900">{namaWakilProvexa}</p>
                    <p className="text-slate-600">{jawatanWakilProvexa}</p>
                    <p className="text-slate-400 text-[10px]">Tarikh: {tarikh}</p>
                  </div>
                </div>

                <div>
                  <p className="font-bold text-slate-900 uppercase text-[11px] mb-1">
                    Bagi Pihak Pelanggan:
                  </p>
                  <p className="text-slate-500 mb-10">{syarikatKlien || 'Pihak Pelanggan'}</p>
                  <div className="border-t border-slate-400 pt-1.5">
                    <p className="font-bold text-slate-900">
                      {namaWakilKlien || namaKlien || 'Tandatangan Pelanggan'}
                    </p>
                    <p className="text-slate-600">{jawatanWakilKlien}</p>
                    <p className="text-slate-400 text-[10px]">Tarikh: ____________________</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 rounded-b-2xl shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            {initialAgreement && onDeleteAgreement && (
              isConfirmingDelete ? (
                <div className="flex items-center space-x-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <span className="text-xs font-semibold text-rose-700">Pasti padam perjanjian ini?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteAgreement(initialAgreement.id);
                      onClose();
                    }}
                    className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Ya, Padam
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="text-xs font-medium text-slate-600 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="text-xs px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold flex items-center space-x-1 transition-colors cursor-pointer"
                  title="Padam Perjanjian"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam Perjanjian</span>
                </button>
              )
            )}

            <div className="text-xs text-slate-500">
              Nilai Perjanjian:{' '}
              <span className="font-mono font-bold text-purple-800">
                RM {nilaiProjek.toLocaleString('ms-MY')}
              </span>{' '}
              ({selectedServices.length} servis terpilih)
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialAgreement ? 'Simpan Perubahan' : 'Simpan Perjanjian'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
