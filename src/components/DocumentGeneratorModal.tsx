import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Share2,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  Building2,
  User,
  Calendar,
  DollarSign,
  Receipt,
  FileCheck,
  Percent,
  ExternalLink,
  RefreshCw,
  ShoppingBag,
  Tag,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import {
  FinancialDoc,
  DocType,
  FinancialDocItem,
  ProvexaService,
  PROVEXA_SERVICES,
  Project,
  Lead,
  DigitalProduct,
  DigitalRetailOrder,
  ServiceMeta,
} from '../types';
import {
  createWhatsAppUrl,
  formatFinancialDocForWhatsApp,
  formatWhatsAppNumber,
} from '../utils/whatsapp';
import { ProvexaLogo } from './ProvexaLogo';

interface DocumentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (doc: FinancialDoc) => void;
  onSaveDoc?: (doc: FinancialDoc) => void;
  initialDoc?: FinancialDoc | null;
  linkedProject?: Project | null;
  prefillProject?: Project | null;
  linkedLead?: Lead | null;
  prefillLead?: Lead | null;
  defaultType?: DocType;
  prefillService?: ProvexaService;
  prefillDigitalProduct?: DigitalProduct | null;
  prefillRetailOrder?: DigitalRetailOrder | null;
  digitalProducts?: DigitalProduct[];
  services?: Record<string, ServiceMeta>;
  existingDocs?: FinancialDoc[];
  onDeleteDoc?: (docId: string) => void;
}

export const DocumentGeneratorModal: React.FC<DocumentGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveDoc,
  initialDoc,
  linkedProject: propLinkedProject,
  prefillProject,
  linkedLead: propLinkedLead,
  prefillLead,
  defaultType,
  prefillService,
  prefillDigitalProduct,
  prefillRetailOrder,
  digitalProducts = [],
  services,
  existingDocs = [],
  onDeleteDoc,
}) => {
  const linkedProject = prefillProject || propLinkedProject;
  const linkedLead = prefillLead || propLinkedLead;
  const handleSaveCallback = onSave || onSaveDoc;

  const catalogServices = services || PROVEXA_SERVICES;

  // Document state
  const [docType, setDocType] = useState<DocType>(
    initialDoc?.jenis ||
      defaultType ||
      (prefillRetailOrder ? 'resit' : prefillDigitalProduct ? 'invois' : 'sebutharga')
  );
  const [docNumber, setDocNumber] = useState<string>(() => {
    if (initialDoc?.noDokumen) return initialDoc.noDokumen;
    const prefix = docType === 'sebutharga' ? 'PRX-QUO' : docType === 'invois' ? 'PRX-INV' : 'PRX-REC';
    const year = new Date().getFullYear();
    const count = existingDocs.length + 1;
    return `${prefix}-${year}-${String(count).padStart(3, '0')}`;
  });

  const [tajukProjek, setTajukProjek] = useState<string>(
    initialDoc?.tajukProjek ||
      linkedProject?.tajuk ||
      (prefillRetailOrder
        ? `Pesanan Digital: ${prefillRetailOrder.namaProduk} (${prefillRetailOrder.noResit})`
        : prefillDigitalProduct
        ? `Pembelian Produk Digital: ${prefillDigitalProduct.nama}`
        : linkedLead
        ? `Perkhidmatan ${catalogServices[linkedLead.servisMinat]?.shortTitle || 'Digital'} - ${linkedLead.nama}`
        : prefillService
        ? `Perkhidmatan ${catalogServices[prefillService]?.title}`
        : 'Penyelesaian Digital & Sistem Provexa')
  );

  const [tarikh, setTarikh] = useState<string>(
    initialDoc?.tarikh || new Date().toISOString().split('T')[0]
  );
  const [tarikhLuput, setTarikhLuput] = useState<string>(
    initialDoc?.tarikhLuput ||
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
  );

  // Client info
  const [klienNama, setKlienNama] = useState<string>(
    initialDoc?.klien?.nama ||
      linkedProject?.namaKlien ||
      linkedLead?.nama ||
      prefillRetailOrder?.namaPembeli ||
      ''
  );
  const [klienSyarikat, setKlienSyarikat] = useState<string>(
    initialDoc?.klien?.syarikat || linkedProject?.syarikatKlien || linkedLead?.syarikat || ''
  );
  const [klienAlamat, setKlienAlamat] = useState<string>(
    initialDoc?.klien?.alamat || ''
  );
  const [klienTelefon, setKlienTelefon] = useState<string>(
    initialDoc?.klien?.telefon ||
      linkedProject?.telefonKlien ||
      linkedLead?.telefon ||
      prefillRetailOrder?.noTelefon ||
      ''
  );
  const [klienEmel, setKlienEmel] = useState<string>(
    initialDoc?.klien?.emel ||
      linkedProject?.emelKlien ||
      linkedLead?.emel ||
      prefillRetailOrder?.emel ||
      ''
  );

  // Issuer info (Provexa Solution)
  const [issuerNama, setIssuerNama] = useState<string>(
    initialDoc?.syarikatPengeluar?.nama || 'Provexa Solution'
  );
  const [issuerSSM, setIssuerSSM] = useState<string>(
    initialDoc?.syarikatPengeluar?.ssm || '202603062093 (CA0417861-M)'
  );
  const [issuerAlamat, setIssuerAlamat] = useState<string>(
    initialDoc?.syarikatPengeluar?.alamat ||
      '39 TINGKAT 1, JALAN TASIK INDAH, 1/4 TAMAN TASIK INDAH , 86000 KLUANG, JOHOR'
  );
  const [issuerTelefon, setIssuerTelefon] = useState<string>(
    initialDoc?.syarikatPengeluar?.telefon || '+014 9175643'
  );
  const [issuerEmel, setIssuerEmel] = useState<string>(
    initialDoc?.syarikatPengeluar?.emel || 'hello@provexasolution.com'
  );
  const [bankNama, setBankNama] = useState<string>(
    initialDoc?.syarikatPengeluar?.bankNama || 'Maybank Berhad'
  );
  const [bankAkaun, setBankAkaun] = useState<string>(
    initialDoc?.syarikatPengeluar?.bankAkaun || '5148 2210 9945'
  );
  const [bankPenerima, setBankPenerima] = useState<string>(
    initialDoc?.syarikatPengeluar?.bankPenerima || 'Provexa Solution'
  );

  // Line items
  const [items, setItems] = useState<FinancialDocItem[]>(() => {
    if (initialDoc?.items && initialDoc.items.length > 0) return initialDoc.items;
    if (prefillRetailOrder) {
      return [
        {
          id: 'ITM-ORD-1',
          penerangan: `[Produk Digital] ${prefillRetailOrder.namaProduk} (${prefillRetailOrder.sku}) - Format: ${prefillRetailOrder.formatPenghantaran}${
            prefillRetailOrder.kunciLesenDiberi ? ` [Kunci Akses: ${prefillRetailOrder.kunciLesenDiberi}]` : ''
          }`,
          servisKategori: 'ai_prompt',
          kuantiti: prefillRetailOrder.kuantiti || 1,
          hargaUnit: prefillRetailOrder.hargaUnit,
          jumlah: (prefillRetailOrder.hargaUnit || 0) * (prefillRetailOrder.kuantiti || 1),
        },
      ];
    }
    if (prefillDigitalProduct) {
      return [
        {
          id: 'ITM-DIG-1',
          penerangan: `[Produk Digital] ${prefillDigitalProduct.nama} (${prefillDigitalProduct.sku}) - Format: ${prefillDigitalProduct.formatPenghantaran}${
            prefillDigitalProduct.saizFail ? ` [${prefillDigitalProduct.saizFail}]` : ''
          }`,
          servisKategori: 'ai_prompt',
          kuantiti: 1,
          hargaUnit: prefillDigitalProduct.hargaRuncit,
          jumlah: prefillDigitalProduct.hargaRuncit,
        },
      ];
    }
    if (linkedProject) {
      return [
        {
          id: 'ITM-1',
          penerangan: `${catalogServices[linkedProject.servisUtama]?.title || 'Pakej Sistem'} - ${linkedProject.tajuk}`,
          servisKategori: linkedProject.servisUtama,
          kuantiti: 1,
          hargaUnit: linkedProject.nilaiKontrak || 2500,
          jumlah: linkedProject.nilaiKontrak || 2500,
        },
      ];
    }
    if (linkedLead) {
      const meta = catalogServices[linkedLead.servisMinat];
      return [
        {
          id: 'ITM-1',
          penerangan: `${meta?.title || 'Servis Digital'} - ${meta?.tagline || ''}`,
          servisKategori: linkedLead.servisMinat,
          kuantiti: 1,
          hargaUnit: linkedLead.anggaranBajet || meta?.startingPrice || 2500,
          jumlah: linkedLead.anggaranBajet || meta?.startingPrice || 2500,
        },
      ];
    }
    if (prefillService) {
      const meta = catalogServices[prefillService];
      return [
        {
          id: 'ITM-1',
          penerangan: `${meta?.title || 'Servis Digital'} - ${meta?.tagline || ''}`,
          servisKategori: prefillService,
          kuantiti: 1,
          hargaUnit: meta?.startingPrice || 2500,
          jumlah: meta?.startingPrice || 2500,
        },
      ];
    }
    return [
      {
        id: 'ITM-1',
        penerangan: 'Service Develope Website - Pembangunan Laman Web Korporat Responsif & CMS',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 2500,
        jumlah: 2500,
      },
    ];
  });

  const [diskaun, setDiskaun] = useState<number>(
    initialDoc?.diskaun ?? prefillRetailOrder?.diskaun ?? 0
  );
  const [kadarSstPeratus, setKadarSstPeratus] = useState<number>(initialDoc?.kadarSstPeratus || 0);
  const [jumlahDibayar, setJumlahDibayar] = useState<number>(
    initialDoc?.jumlahDibayar !== undefined
      ? initialDoc.jumlahDibayar
      : prefillRetailOrder?.jumlahBayaran !== undefined
      ? prefillRetailOrder.jumlahBayaran
      : linkedProject?.jumlahDibayar || 0
  );

  // Quick-add catalog tab inside Document Generator
  const [quickAddTab, setQuickAddTab] = useState<'services' | 'digital'>('services');

  const [termaDanSyarat, setTermaDanSyarat] = useState<string>(
    initialDoc?.termaDanSyarat ||
      '1. Bayaran 50% deposit permulaan diperlukan sebelum kerja-kerja fasa pertama digerakkan.\n' +
        '2. Baki bayaran hendaklah dijelaskan dalam tempoh 7 hari selepas sesi UAT & sebelum pelancaran rasmi.\n' +
        '3. Kod sumber dan hak milik penuh diserahkan kepada pihak pelanggan setelah pembayaran lunas 100%.\n' +
        '4. Sebutharga ini sah untuk tempoh 30 hari dari tarikh dikeluarkan.'
  );

  const [notaTambahan, setNotaTambahan] = useState<string>(
    initialDoc?.notaTambahan ||
      'Pakej termasuk sokongan teknikal & pembetulan pepijat (bug fixing) percuma selama 30 hari.'
  );

  const [namaPenandatangan, setNamaPenandatangan] = useState<string>(
    initialDoc?.namaPenandatangan || 'Pengarah Projek'
  );
  const [jawatanPenandatangan, setJawatanPenandatangan] = useState<string>(
    initialDoc?.jawatanPenandatangan || 'Provexa Solution'
  );

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [showDeleteInModal, setShowDeleteInModal] = useState(false);

  // Sync state if initialDoc changes
  useEffect(() => {
    if (initialDoc) {
      setDocType(initialDoc.jenis);
      setDocNumber(initialDoc.noDokumen || initialDoc.nomborRujukan || '');
      setTajukProjek(initialDoc.tajukProjek || '');
      setTarikh(initialDoc.tarikh || new Date().toISOString().split('T')[0]);
      setTarikhLuput(
        initialDoc.tarikhLuput ||
          new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
      );
      setKlienNama(initialDoc.klien?.nama || '');
      setKlienSyarikat(initialDoc.klien?.syarikat || '');
      setKlienAlamat(initialDoc.klien?.alamat || '');
      setKlienTelefon(initialDoc.klien?.telefon || '');
      setKlienEmel(initialDoc.klien?.emel || '');
      setIssuerNama(initialDoc.syarikatPengeluar?.nama || 'Provexa Solution');
      setIssuerSSM(initialDoc.syarikatPengeluar?.ssm || '202403198822 (TR0289110-M)');
      setIssuerAlamat(
        initialDoc.syarikatPengeluar?.alamat ||
          '39 TINGKAT 1, JALAN TASIK INDAH, 1/4 TAMAN TASIK INDAH , 86000 KLUANG, JOHOR'
      );
      setIssuerTelefon(initialDoc.syarikatPengeluar?.telefon || '+60 12-984 5521');
      setIssuerEmel(initialDoc.syarikatPengeluar?.emel || 'hello@provexasolution.com');
      setBankNama(initialDoc.syarikatPengeluar?.bankNama || 'Maybank Berhad');
      setBankAkaun(initialDoc.syarikatPengeluar?.bankAkaun || '5148 2210 9945');
      setBankPenerima(initialDoc.syarikatPengeluar?.bankPenerima || 'Provexa Solution');
      setItems(initialDoc.items && initialDoc.items.length > 0 ? initialDoc.items : []);
      setDiskaun(initialDoc.diskaun || 0);
      setKadarSstPeratus(initialDoc.kadarSstPeratus || 0);
      setJumlahDibayar(initialDoc.jumlahDibayar !== undefined ? initialDoc.jumlahDibayar : 0);
      setTermaDanSyarat(initialDoc.termaDanSyarat || '');
      setNotaTambahan(initialDoc.notaTambahan || '');
      setNamaPenandatangan(initialDoc.namaPenandatangan || 'Pengarah Projek');
      setJawatanPenandatangan(initialDoc.jawatanPenandatangan || 'Provexa Solution');
    }
  }, [initialDoc]);

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + item.jumlah, 0);
  const taxableAmount = Math.max(0, subtotal - diskaun);
  const cukaiSstJumlah = Math.round((taxableAmount * (kadarSstPeratus / 100)) * 100) / 100;
  const jumlahKeseluruhan = Math.max(0, taxableAmount + cukaiSstJumlah);
  const bakiPerluDibayar = Math.max(0, jumlahKeseluruhan - jumlahDibayar);

  const statusBayaran: 'belum_bayar' | 'sebahagian' | 'lunas' =
    jumlahDibayar >= jumlahKeseluruhan && jumlahKeseluruhan > 0
      ? 'lunas'
      : jumlahDibayar > 0
      ? 'sebahagian'
      : 'belum_bayar';

  // Handle document type change and regenerate doc number prefix
  const handleTypeChange = (newType: DocType) => {
    setDocType(newType);
    const prefix = newType === 'sebutharga' ? 'PRX-QUO' : newType === 'invois' ? 'PRX-INV' : 'PRX-REC';
    const year = new Date().getFullYear();
    const count = existingDocs.length + 1;
    setDocNumber(`${prefix}-${year}-${String(count).padStart(3, '0')}`);

    if (newType === 'resit' && jumlahDibayar === 0) {
      setJumlahDibayar(jumlahKeseluruhan);
    }
  };

  // Add Item
  const handleAddItem = (servisKey?: ProvexaService) => {
    if (servisKey) {
      const meta = catalogServices[servisKey] || PROVEXA_SERVICES[servisKey];
      const newItem: FinancialDocItem = {
        id: `ITM-${Date.now().toString().slice(-4)}`,
        penerangan: `${meta.title} - ${meta.tagline}`,
        servisKategori: servisKey,
        kuantiti: 1,
        hargaUnit: meta.startingPrice,
        jumlah: meta.startingPrice,
      };
      setItems([...items, newItem]);
    } else {
      const newItem: FinancialDocItem = {
        id: `ITM-${Date.now().toString().slice(-4)}`,
        penerangan: 'Servis / Produk Provexa Solution',
        kuantiti: 1,
        hargaUnit: 1000,
        jumlah: 1000,
      };
      setItems([...items, newItem]);
    }
  };

  const handleAddDigitalProductItem = (prod: DigitalProduct) => {
    const newItem: FinancialDocItem = {
      id: `ITM-DIG-${Date.now().toString().slice(-4)}`,
      penerangan: `[Produk Digital] ${prod.nama} (${prod.sku}) - Format: ${prod.formatPenghantaran}${
        prod.saizFail ? ` [${prod.saizFail}]` : ''
      }\n• Akses: ${prod.pautanMuatTurun}`,
      servisKategori: 'ai_prompt',
      kuantiti: 1,
      hargaUnit: prod.hargaRuncit,
      jumlah: prod.hargaRuncit,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (
    id: string,
    field: 'penerangan' | 'kuantiti' | 'hargaUnit',
    value: any
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        if (field === 'kuantiti' || field === 'hargaUnit') {
          const qty = field === 'kuantiti' ? Number(value) || 0 : item.kuantiti;
          const price = field === 'hargaUnit' ? Number(value) || 0 : item.hargaUnit;
          updated.jumlah = Math.round(qty * price * 100) / 100;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  // Construct complete FinancialDoc object
  const buildCurrentDoc = (): FinancialDoc => {
    return {
      id: initialDoc?.id || `DOC-${Date.now()}`,
      jenis: docType,
      noDokumen: docNumber,
      nomborRujukan: docNumber,
      tajukProjek,
      tarikh,
      tarikhLuput: docType !== 'resit' ? tarikhLuput : undefined,
      projekId: linkedProject?.id,
      klien: {
        nama: klienNama || 'Pelanggan Dihormati',
        syarikat: klienSyarikat || undefined,
        alamat: klienAlamat || undefined,
        telefon: klienTelefon,
        emel: klienEmel || undefined,
      },
      syarikatPengeluar: {
        nama: issuerNama,
        ssm: issuerSSM,
        alamat: issuerAlamat,
        telefon: issuerTelefon,
        emel: issuerEmel,
        bankNama,
        bankAkaun,
        bankPenerima,
      },
      items,
      subtotal,
      diskaun,
      kadarSstPeratus,
      cukaiSstJumlah,
      jumlahKeseluruhan,
      jumlahDibayar,
      bakiPerluDibayar,
      statusBayaran,
      termaDanSyarat,
      notaTambahan,
      namaPenandatangan,
      jawatanPenandatangan,
      tarikhDicipta: initialDoc?.tarikhDicipta || new Date().toISOString(),
    };
  };

  const handleSave = () => {
    const doc = buildCurrentDoc();
    if (handleSaveCallback) {
      handleSaveCallback(doc);
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
    const doc = buildCurrentDoc();
    const formatted = formatFinancialDocForWhatsApp(doc);
    const url = createWhatsAppUrl(klienTelefon || '0123456789', formatted);
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    const doc = buildCurrentDoc();
    const formatted = formatFinancialDocForWhatsApp(doc);
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
        {/* Top Modal Header (Hidden on Print) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              {docType === 'sebutharga' ? (
                <FileText className="w-5 h-5" />
              ) : docType === 'invois' ? (
                <Receipt className="w-5 h-5" />
              ) : (
                <FileCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Penjana Invois, Resit &amp; Sebutharga
              </h3>
              <p className="text-xs text-slate-500">
                Dokumen Rasmi Kewangan Provexa Solution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
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
                Pratonton Dokumen
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar (Hidden on Print) */}
        <div className="px-4 sm:px-6 py-2.5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden">
          {/* Document Type Switcher */}
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">Jenis:</span>
            <button
              type="button"
              onClick={() => handleTypeChange('sebutharga')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                docType === 'sebutharga'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              📄 Sebutharga (Quotation)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('invois')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                docType === 'invois'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              🧾 Invois (Invoice)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('resit')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                docType === 'resit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ✅ Resit Pembayaran
            </button>
          </div>

          {/* Action buttons */}
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

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0 print:overflow-visible">
          {viewMode === 'editor' ? (
            /* EDITOR MODE */
            <div className="space-y-6">
              {/* Document Meta Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Dokumen / Rujukan
                  </label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarikh Dikeluarkan
                  </label>
                  <input
                    type="date"
                    value={tarikh}
                    onChange={(e) => setTarikh(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {docType !== 'resit' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tarikh Sah / Tamat Tempoh
                    </label>
                    <input
                      type="date"
                      value={tarikhLuput}
                      onChange={(e) => setTarikhLuput(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tajuk Projek / Perkhidmatan
                  </label>
                  <input
                    type="text"
                    value={tajukProjek}
                    onChange={(e) => setTajukProjek(e.target.value)}
                    placeholder="cth: Pembangunan Portal E-Commerce & Tempahan Mega Niaga"
                    className="w-full text-sm font-semibold px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Client Details Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Maklumat Pelanggan / Klien</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Pelanggan *
                    </label>
                    <input
                      type="text"
                      value={klienNama}
                      onChange={(e) => setKlienNama(e.target.value)}
                      placeholder="cth: Dato' Azhar Kamaruddin"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Syarikat / Organisasi
                    </label>
                    <input
                      type="text"
                      value={klienSyarikat}
                      onChange={(e) => setKlienSyarikat(e.target.value)}
                      placeholder="cth: Mega Niaga Retail Sdn Bhd"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      No. WhatsApp / Telefon *
                    </label>
                    <input
                      type="text"
                      value={klienTelefon}
                      onChange={(e) => setKlienTelefon(e.target.value)}
                      placeholder="0123456789"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Emel Pelanggan
                    </label>
                    <input
                      type="email"
                      value={klienEmel}
                      onChange={(e) => setKlienEmel(e.target.value)}
                      placeholder="klien@syarikat.com"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Premis / Surat-Menyurat
                    </label>
                    <input
                      type="text"
                      value={klienAlamat}
                      onChange={(e) => setKlienAlamat(e.target.value)}
                      placeholder="Alamat pejabat klien"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Senarai Item &amp; Skop Perkhidmatan
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Klik salah satu dari 8 servis Provexa untuk tambah automatik:
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem()}
                    className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold flex items-center space-x-1 border border-indigo-200/80"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Item Custom</span>
                  </button>
                </div>

                {/* Quick Add Catalog Tabs & Buttons */}
                <div className="mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1 p-0.5 bg-slate-200/70 rounded-lg text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setQuickAddTab('services')}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 ${
                          quickAddTab === 'services'
                            ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>Servis Agensi ({Object.keys(catalogServices).length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setQuickAddTab('digital')}
                        className={`px-2.5 py-1 rounded-md transition-all flex items-center space-x-1.5 ${
                          quickAddTab === 'digital'
                            ? 'bg-white text-blue-700 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3 text-blue-600" />
                        <span>Produk Digital ({digitalProducts.length})</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
                      {quickAddTab === 'services'
                        ? 'Pilih servis untuk isi automatik'
                        : 'Pilih produk digital runcit untuk sebutharga/invois'}
                    </span>
                  </div>

                  {quickAddTab === 'services' ? (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {(Object.values(catalogServices) as ServiceMeta[]).map((service) => (
                        <button
                          key={service.key}
                          type="button"
                          onClick={() => handleAddItem(service.key as ProvexaService)}
                          className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 font-medium transition-all flex items-center space-x-1"
                          title={service.tagline}
                        >
                          <span>+ {service.shortTitle}</span>
                          <span className="text-[10px] text-slate-400">
                            (RM {service.startingPrice.toLocaleString('ms-MY')})
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {digitalProducts.length > 0 ? (
                        digitalProducts.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleAddDigitalProductItem(prod)}
                            className="text-[11px] px-2.5 py-1 rounded-md bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 font-medium transition-all flex items-center space-x-1.5"
                            title={prod.peneranganRingkas}
                          >
                            <ShoppingBag className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="font-semibold text-slate-900">+ {prod.nama}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold border border-blue-100">
                              RM {prod.hargaRuncit}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({prod.formatPenghantaran})
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 py-2">
                          Tiada produk digital direkodkan lagi.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2.5 px-3 w-1/2">Penerangan Servis / Item</th>
                        <th className="py-2.5 px-3 w-20 text-center">Kuantiti</th>
                        <th className="py-2.5 px-3 w-32 text-right">Harga Unit (RM)</th>
                        <th className="py-2.5 px-3 w-32 text-right">Jumlah (RM)</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.penerangan}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'penerangan', e.target.value)
                              }
                              className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:ring-1 focus:ring-indigo-500 font-medium"
                              placeholder="cth: Service Develope Website"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.kuantiti}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'kuantiti', e.target.value)
                              }
                              className="w-16 text-xs px-2 py-1.5 border border-slate-200 rounded-md text-center focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="50"
                              value={item.hargaUnit}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'hargaUnit', e.target.value)
                              }
                              className="w-28 text-xs px-2 py-1.5 border border-slate-200 rounded-md text-right focus:ring-1 focus:ring-indigo-500 font-mono"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-800 font-mono">
                            RM {item.jumlah.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={items.length <= 1}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-end">
                  <div className="w-full sm:w-80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-semibold font-mono">
                        RM {subtotal.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Diskaun (RM):</span>
                      <input
                        type="number"
                        min="0"
                        value={diskaun}
                        onChange={(e) => setDiskaun(Number(e.target.value) || 0)}
                        className="w-24 text-right px-2 py-1 text-xs border border-slate-200 rounded font-mono"
                      />
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <div className="flex items-center space-x-1">
                        <span>SST:</span>
                        <select
                          value={kadarSstPeratus}
                          onChange={(e) => setKadarSstPeratus(Number(e.target.value))}
                          className="text-[11px] px-1.5 py-0.5 border border-slate-200 rounded bg-white"
                        >
                          <option value="0">0% (Tiada)</option>
                          <option value="6">6%</option>
                          <option value="8">8%</option>
                        </select>
                      </div>
                      <span className="font-mono">
                        RM {cukaiSstJumlah.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-extrabold text-indigo-900 pt-2 border-t border-slate-200">
                      <span>Jumlah Keseluruhan:</span>
                      <span className="font-mono">
                        RM {jumlahKeseluruhan.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {(docType === 'invois' || docType === 'resit') && (
                      <>
                        <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1">
                          <span>Bayaran Diterima:</span>
                          <input
                            type="number"
                            min="0"
                            value={jumlahDibayar}
                            onChange={(e) => setJumlahDibayar(Number(e.target.value) || 0)}
                            className="w-28 text-right px-2 py-1 text-xs border border-emerald-300 rounded font-mono font-bold bg-emerald-50 text-emerald-800"
                          />
                        </div>

                        <div className="flex justify-between text-xs font-bold text-rose-700 pt-1 border-t border-dashed border-slate-200">
                          <span>Baki Perlu Dibayar:</span>
                          <span className="font-mono">
                            RM {bakiPerluDibayar.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment & Terms Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Maklumat Akaun Bank Provexa
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Nama Bank
                      </label>
                      <input
                        type="text"
                        value={bankNama}
                        onChange={(e) => setBankNama(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Nombor Akaun Bank
                      </label>
                      <input
                        type="text"
                        value={bankAkaun}
                        onChange={(e) => setBankAkaun(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">
                        Nama Pemegang Akaun
                      </label>
                      <input
                        type="text"
                        value={bankPenerima}
                        onChange={(e) => setBankPenerima(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                    Terma &amp; Syarat Dokumen
                  </h4>
                  <textarea
                    rows={6}
                    value={termaDanSyarat}
                    onChange={(e) => setTermaDanSyarat(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* PREVIEW / PRINTABLE VIEW */
            <div className="bg-white p-6 sm:p-8 max-w-4xl mx-auto border border-slate-200 shadow-xs rounded-xl print:border-none print:shadow-none print:p-2 text-slate-800">
              {/* Official Corporate Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-indigo-600 pb-5 mb-6 gap-4">
                <div>
                  <div className="mb-2">
                    <ProvexaLogo className="h-10 w-auto" variant="full" theme="light" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Digital Transformation, SaaS &amp; AI Solutions
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No. Pendaftaran SSM: {issuerSSM}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                    {issuerAlamat}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Tel: {issuerTelefon} | Emel: {issuerEmel}
                  </p>
                </div>

                <div className="sm:text-right">
                  <div className="inline-block px-3 py-1 rounded-md bg-indigo-50 text-indigo-700 font-black text-sm uppercase tracking-wider border border-indigo-200 mb-2">
                    {docType === 'sebutharga'
                      ? 'SEBUTHARGA / QUOTATION'
                      : docType === 'invois'
                      ? 'INVOIS RASMI / INVOICE'
                      : 'RESIT PEMBAYARAN RASMI'}
                  </div>
                  <p className="text-xs font-mono font-bold text-slate-900">
                    No: {docNumber}
                  </p>
                  <p className="text-xs text-slate-600">
                    Tarikh: <span className="font-semibold">{tarikh}</span>
                  </p>
                  {docType !== 'resit' && tarikhLuput && (
                    <p className="text-xs text-slate-600">
                      Sah Hingga: <span className="font-semibold">{tarikhLuput}</span>
                    </p>
                  )}
                  {statusBayaran === 'lunas' && (
                    <div className="inline-block mt-2 px-2.5 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                      PAID / LUNAS
                    </div>
                  )}
                </div>
              </div>

              {/* Client & Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200/80">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    DITUJUKAN KEPADA:
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                    {klienNama || 'Pihak Pelanggan'}
                  </h4>
                  {klienSyarikat && (
                    <p className="text-xs font-semibold text-slate-700">{klienSyarikat}</p>
                  )}
                  {klienAlamat && (
                    <p className="text-xs text-slate-500 mt-0.5">{klienAlamat}</p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    Tel: {klienTelefon} {klienEmel ? `| Emel: ${klienEmel}` : ''}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    PERIHAL PROJEK:
                  </span>
                  <h4 className="font-bold text-sm text-indigo-900 mt-0.5">
                    {tajukProjek}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Dikeluarkan oleh: <span className="font-semibold">{issuerNama}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs mb-6">
                <thead>
                  <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-800 font-bold">
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Penerangan Item / Perkhidmatan</th>
                    <th className="py-2 px-3 w-16 text-center">Kuantiti</th>
                    <th className="py-2 px-3 w-28 text-right">Harga Unit</th>
                    <th className="py-2 px-3 w-28 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 text-center text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.penerangan}
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700">
                        {item.kuantiti}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        RM {item.hargaUnit.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        RM {item.jumlah.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals & Payment Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-200 pt-4 mb-6">
                <div className="text-xs text-slate-600 space-y-1.5">
                  <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                    Maklumat Pembayaran Pindahan Bank:
                  </p>
                  <p className="font-semibold text-indigo-900">
                    Bank: {bankNama}
                  </p>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    No Akaun: {bankAkaun}
                  </p>
                  <p className="font-medium text-slate-700">
                    Penama Akaun: {bankPenerima}
                  </p>
                  {docType === 'resit' && (
                    <p className="text-emerald-700 font-bold mt-2">
                      Kaedah Bayaran: Pindahan FPX / Online Banking
                    </p>
                  )}
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">
                      RM {subtotal.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {diskaun > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Diskaun:</span>
                      <span className="font-mono font-semibold text-rose-600">
                        -RM {diskaun.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {cukaiSstJumlah > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>SST ({kadarSstPeratus}%):</span>
                      <span className="font-mono font-semibold">
                        RM {cukaiSstJumlah.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t-2 border-slate-300 pt-1.5">
                    <span>JUMLAH KESELURUHAN:</span>
                    <span className="font-mono text-indigo-900">
                      RM {jumlahKeseluruhan.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {(docType === 'invois' || docType === 'resit') && (
                    <>
                      <div className="flex justify-between text-xs text-emerald-700 font-bold">
                        <span>Bayaran Diterima:</span>
                        <span className="font-mono">
                          RM {jumlahDibayar.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-rose-700 font-extrabold border-t border-slate-200 pt-1">
                        <span>BAKI PERLU DIBAYAR:</span>
                        <span className="font-mono">
                          RM {bakiPerluDibayar.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Terms and Signatures */}
              <div className="border-t border-slate-200 pt-4 mb-8">
                <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Terma &amp; Syarat:
                </p>
                <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                  {termaDanSyarat}
                </p>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold text-[11px] uppercase mb-10">
                    Disediakan Oleh (Provexa Solution):
                  </p>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="font-bold text-slate-900">{namaPenandatangan}</p>
                    <p className="text-slate-500">{jawatanPenandatangan}</p>
                  </div>
                </div>

                <div>
                  <p className="text-slate-400 font-semibold text-[11px] uppercase mb-10">
                    Diterima &amp; Disahkan Oleh (Klien):
                  </p>
                  <div className="border-t border-slate-300 pt-1">
                    <p className="font-bold text-slate-900">
                      {klienNama || 'Tandatangan Pelanggan'}
                    </p>
                    <p className="text-slate-500">
                      {klienSyarikat || 'Tarikh: ___________________'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl shrink-0 print:hidden">
          <div className="text-xs text-slate-500">
            Status: <span className="font-bold text-slate-700 uppercase">{docType}</span>
            {' • '}
            Jumlah:{' '}
            <span className="font-mono font-bold text-indigo-700">
              RM {jumlahKeseluruhan.toLocaleString('ms-MY')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
