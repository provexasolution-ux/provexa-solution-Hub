export type DefaultProvexaService =
  | 'website'
  | 'saas'
  | 'training'
  | 'consultation'
  | 'social_media'
  | 'paid_ads'
  | 'promptgalerix'
  | 'brandup4u';

export type ProvexaService = DefaultProvexaService | (string & {});

export interface ServiceMeta {
  key: string;
  title: string;
  shortTitle: string;
  tagline: string;
  category: 'Development' | 'Consulting & AI' | 'Marketing & Branding' | string;
  startingPrice: number;
  priceModel: string; // cth: "Bermula RM 1,800", "Bulanan", "Per Sesi"
  deliverables: string[];
  iconName?: string;
  badgeColor?: string;
  badgeBg?: string;
  description: string;
  isCustom?: boolean;
}

export const DEFAULT_PROVEXA_SERVICES: Record<string, ServiceMeta> = {
  website: {
    key: 'website',
    title: 'Service Develope Website',
    shortTitle: 'Web Development',
    tagline: 'Laman Web Korporat, Landing Page Pantas & E-Commerce Responsif',
    category: 'Development',
    startingPrice: 1800,
    priceModel: 'Bermula RM 1,800 (One-Off)',
    deliverables: [
      'Rekabentuk Moden & Mobile-Responsive',
      'Integrasi Borang WhatsApp & Database Leads',
      'Optimasi SEO On-Page & Kelajuan Tinggi',
      'Panel Pengurusan Kandungan (CMS/Admin)',
      'Domain & Hosting Setup percuma tahun pertama',
      '30 Hari Jaminan Sokongan Teknikal & Bug Fix',
    ],
    iconName: 'Globe',
    badgeColor: 'text-blue-700 border-blue-200',
    badgeBg: 'bg-blue-50',
    description: 'Pembangunan laman web profesional yang direka khusus untuk menukar pelawat menjadi prospek dan pelanggan berbayar.',
  },
  saas: {
    key: 'saas',
    title: 'Servis Saas Sistem',
    shortTitle: 'SaaS & Web App',
    tagline: 'Pembangunan Sistem Web Khas, Automasi Operasi & Portal Pelanggan',
    category: 'Development',
    startingPrice: 4500,
    priceModel: 'Bermula RM 4,500 (Milestone Based)',
    deliverables: [
      'Pangkalan Data Real-Time & Skalabiliti Tinggi',
      'Pengurusan Pengguna & Hak Akses Berbilang Tahap (RBAC)',
      'Dashboard Analitik Interaktif & Laporan PDF/Excel',
      'Integrasi Payment Gateway (FPX/Stripe/Billplz)',
      'Integrasi API Luaran & Webhook Automasi',
      'Penyediaan Server Cloud & Dokumentasi Kod Lengkap',
    ],
    iconName: 'Cpu',
    badgeColor: 'text-indigo-700 border-indigo-200',
    badgeBg: 'bg-indigo-50',
    description: 'Sistem aplikasi berasaskan web (SaaS) untuk mendigitalkan operasi syarikat, pengurusan jualan, atau melancarkan produk perisian anda sendiri.',
  },
  training: {
    key: 'training',
    title: 'Servis Training & Class',
    shortTitle: 'Training & Class',
    tagline: 'Bengkel Praktikal AI Prompting, Automasi Bisnes & Digital Skills',
    category: 'Consulting & AI',
    startingPrice: 1200,
    priceModel: 'Bermula RM 1,200 / Sesi',
    deliverables: [
      'Modul Latihan Praktikal Hands-On Terkini',
      'Nota Slaid Eksklusif & E-Sijil Penyertaan',
      'Bank Contoh Prompt AI Untuk Kerja Sebenar',
      'Rakaman Sesi & Soal Jawab Interaktif',
      'Akses Sokongan Soalan 14 Hari Selepas Kelas',
    ],
    iconName: 'GraduationCap',
    badgeColor: 'text-amber-700 border-amber-200',
    badgeBg: 'bg-amber-50',
    description: 'Kelas dan sesi bengkel korporat / persendirian untuk menguasai teknologi AI, automasi tugasan, serta kemahiran digital moden.',
  },
  consultation: {
    key: 'consultation',
    title: 'Consultation',
    shortTitle: 'Tech Consultation',
    tagline: 'Sesi Strategi Digital, Audit Sistem & Pelan Tindakan Transformasi IT',
    category: 'Consulting & AI',
    startingPrice: 500,
    priceModel: 'Bermula RM 500 / Jam',
    deliverables: [
      'Audit Mendalam Aliran Kerja & Sistem Sedia Ada',
      'Cadangan Arsitektur Teknologi & Pemilihan Tool Jimat Kos',
      'Blueprint Tindakan Digital 90 Hari (Action Plan)',
      'Sesi 1-to-1 Bersama Lead Tech Strategist',
      'Ringkasan Laporan Bertulis & Roadmap Sistem',
    ],
    iconName: 'MessageSquareCheck',
    badgeColor: 'text-emerald-700 border-emerald-200',
    badgeBg: 'bg-emerald-50',
    description: 'Bimbingan strategik untuk usahawan dan organisasi menentukan hala tuju teknologi, mengelakkan pembaziran bajet perisian, dan mempercepat pertumbuhan.',
  },
  social_media: {
    key: 'social_media',
    title: 'Sosial media management',
    shortTitle: 'Social Media Management',
    tagline: 'Pengurusan Saluran Media Sosial, Kalendar Konten & Visual Memikat',
    category: 'Marketing & Branding',
    startingPrice: 1500,
    priceModel: 'Bermula RM 1,500 / Bulan (Retainer)',
    deliverables: [
      'Kalendar Kandungan Bulanan (Content Calendar)',
      '12 - 20 Poster Grafik Beresolusi Tinggi & Copywriting Menjual',
      'Penyuntingan Video Pendek (Reels / TikTok / Shorts)',
      'Penjadualan & Penerbitan Pos Sistematik',
      'Laporan Prestasi & Engagement Bulanan',
    ],
    iconName: 'Share2',
    badgeColor: 'text-pink-700 border-pink-200',
    badgeBg: 'bg-pink-50',
    description: 'Pengendalian saluran sosial media syarikat secara konsisten dengan kandungan berkualiti untuk meningkatkan kesedaran jenama dan interaksi audiens.',
  },
  paid_ads: {
    key: 'paid_ads',
    title: 'Paid Advertising Service',
    shortTitle: 'Paid Advertising',
    tagline: 'Kempen Iklan Berbayar Berprestasi Tinggi: Meta Ads, TikTok & Google Ads',
    category: 'Marketing & Branding',
    startingPrice: 1800,
    priceModel: 'Bermula RM 1,800 / Kempen + Yuran Pengurusan',
    deliverables: [
      'Kajian Pasaran & Sasaran Audiens (Targeting)',
      'Penyediaan Struktur Kempen & Pemasangan Tracking Pixel/CAPI',
      'Penyediaan Variasi Copywriting & Imej/Video Iklan (A/B Testing)',
      'Pemantauan Harian & Optimasi Kos Per Prospek (CPL / CAC)',
      'Dashboard Laporan ROI & Kos Iklan Mingguan',
    ],
    iconName: 'TrendingUp',
    badgeColor: 'text-purple-700 border-purple-200',
    badgeBg: 'bg-purple-50',
    description: 'Kempen iklan berbayar data-driven untuk menjana prospek bersedia beli (ready-to-buy leads) dan jualan langsung dengan pulangan pelaburan iklan yang optimum.',
  },
  promptgalerix: {
    key: 'promptgalerix',
    title: 'Promptgalerix',
    shortTitle: 'Promptgalerix (AI Hub)',
    tagline: 'Koleksi & Platform Prompt AI Teruji Untuk Bisnes, Kreatif & Automasi',
    category: 'Consulting & AI',
    startingPrice: 299,
    priceModel: 'Bermula RM 299 (Akses Penuh / Lesen Bisnes)',
    deliverables: [
      'Akses Perpustakaan 500+ Prompt Teruji (ChatGPT, Midjourney, Claude, Gemini)',
      'Template Aliran Kerja Automasi Segera (Ready-to-Use Workflow)',
      'Panduan Prompt Formula: Copywriting, Coding, Marketing & Visual',
      'Kemas Kini Koleksi Prompt Bulanan Tanpa Yuran Tambahan',
      'Lesen Penggunaan Komersial Untuk Agensi & Bisnes',
    ],
    iconName: 'Sparkles',
    badgeColor: 'text-cyan-700 border-cyan-200',
    badgeBg: 'bg-cyan-50',
    description: 'Produk digital unggul Provexa yang menyediakan direktori prompt dan arahan AI gred industri untuk meningkatkan produktiviti kerja sehingga 10x ganda.',
  },
  brandup4u: {
    key: 'brandup4u',
    title: 'BrandUP4U',
    shortTitle: 'BrandUP4U (Branding Kit)',
    tagline: 'Pakej Penjenamaan Holistik, Logo Korporat & Kit Identiti Visual Jenama',
    category: 'Marketing & Branding',
    startingPrice: 1600,
    priceModel: 'Bermula RM 1,600 (Pakej Identiti Lengkap)',
    deliverables: [
      'Rekaan Logo Rasmi (Primer, Sekunder & Favicon) Format Vektor',
      'Brand Guideline: Palet Warna Rasmi, Kod Tipografi & Tip Penggunaan',
      'Kit Media Sosial: Profil Avatar, Header Banner & Templat Post',
      'Alat Tulis Korporat: Rekabentuk Kad Nama, Kepala Surat (Letterhead) & Mockup',
      'Fail Asal Penuh (AI, SVG, PNG Transparan, PDF Cetakan)',
      'Hak Milik Penuh 100% Kepada Pelanggan',
    ],
    iconName: 'Palette',
    badgeColor: 'text-rose-700 border-rose-200',
    badgeBg: 'bg-rose-50',
    description: 'Penyelesaian penjenamaan menyeluruh untuk membina imej syarikat yang berwibawa, profesional, dan mudah diingati oleh pelanggan sasaran.',
  },
};

export const PROVEXA_SERVICES: Record<string, ServiceMeta> = { ...DEFAULT_PROVEXA_SERVICES };

export type ProjectStatus =
  | 'rundingan'        // Rundingan & Sebutharga
  | 'perancangan'      // Fasa Perancangan & Wireframe/SOW
  | 'pembangunan'      // Pembangunan / Pelaksanaan Aktif
  | 'semakan_uat'      // Semakan Pelanggan & UAT
  | 'selesai'          // Selesai & Diserahkan (Completed)
  | 'penyelenggaraan'; // Penyelenggaraan & Retainer Bulanan

export type PriorityLevel = 'rendah' | 'sederhana' | 'tinggi' | 'kritikal';

export interface ProjectMilestone {
  id: string;
  tajuk: string;
  penerangan?: string;
  tarikhSasaran: string; // YYYY-MM-DD
  status: 'belum' | 'dalam_proses' | 'selesai';
  jumlahBayaran?: number; // cth: RM 1,500 untuk fasa ini
  invoisTerkaitId?: string;
}

export interface Project {
  id: string;
  kodProjek: string;           // cth: PRX-WEB-2026-001
  tajuk: string;               // cth: Portal E-Commerce Mega Niaga
  namaKlien: string;
  syarikatKlien?: string;
  telefonKlien: string;
  emelKlien?: string;
  servisUtama: ProvexaService;
  servisTambahan?: ProvexaService[];
  skopKerja: string;
  status: ProjectStatus;
  keutamaan: PriorityLevel;
  kemajuanPeratus: number;     // 0 - 100
  nilaiKontrak: number;        // Nilai keseluruhan dalam RM
  jumlahDibayar: number;       // Jumlah deposit / bayaran diterima dalam RM
  tarikhMula: string;          // YYYY-MM-DD
  tarikhSasaran: string;       // YYYY-MM-DD
  tarikhSelesai?: string;
  milestones: ProjectMilestone[];
  pautanHasil?: string;        // Figma / Staging / Domain Live
  pautanRepository?: string;   // GitHub / Drive
  dokumenRujukan?: {
    sebuthargaNo?: string;
    invoisNo?: string;
    perjanjianNo?: string;
  };
  nota: string;
  tarikhDicipta: string;
  tarikhDikemaskini: string;
}

export type LeadStatus =
  | 'baru'                  // Pertanyaan Baharu
  | 'dihubungi'             // Telah Dihubungi Konsultan
  | 'sesi_discovery'        // Sesi Discovery / Demo
  | 'sebutharga_dihantar'   // Sebutharga (Quotation) Dihantar
  | 'tunggu_deposit'        // Tunggu Bayaran Deposit / Sign Agreement
  | 'berjaya'               // Ditutup / Menjadi Projek Aktif
  | 'gagal';                // Tidak Berminat / Batal

export type LeadSource =
  | 'whatsapp'
  | 'borang_web'
  | 'rujukan'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'google'
  | 'iklan'
  | 'networking'
  | 'lain_lain';

export interface Lead {
  id: string;
  nama: string;
  syarikat?: string;
  telefon: string;
  emel?: string;
  servisMinat: ProvexaService;
  servisTambahan?: ProvexaService[];
  anggaranBajet: number;
  status: LeadStatus;
  sumber: LeadSource;
  keutamaan?: PriorityLevel;
  jangkaanGarisMasa?: string;
  keperluanProjek?: string;
  tarikhTemujanji?: string;   // YYYY-MM-DD
  masaTemujanji?: string;     // HH:mm
  notaTemujanji?: string;     // cth: Google Meet / Pejabat Klien
  projekIdTerkait?: string;   // ID projek jika ditukar ke projek aktif
  nota: string;
  kiraanFollowup?: number;
  tarikhFollowupTerakhir?: string;
  tarikhDicipta: string;
  tarikhDikemaskini: string;
  // Backward compatibility optional fields
  modelKereta?: string;
  produk?: string;
}

export type DocType = 'sebutharga' | 'invois' | 'resit';

export interface FinancialDocItem {
  id: string;
  penerangan: string;
  servisKategori?: ProvexaService;
  kuantiti: number;
  hargaUnit: number;
  jumlah: number;
}

export interface FinancialDoc {
  id: string;
  jenis: DocType;
  noDokumen: string;            // cth: PRX-QUO-2026-001, PRX-INV-2026-001, PRX-REC-2026-001
  nomborRujukan?: string;       // Alias for noDokumen
  tajukProjek: string;
  tarikh: string;               // YYYY-MM-DD
  tarikhLuput?: string;         // YYYY-MM-DD
  projekId?: string;
  klien: {
    nama: string;
    syarikat?: string;
    alamat?: string;
    telefon: string;
    emel?: string;
    noRujukanPO?: string;
  };
  syarikatPengeluar: {
    nama: string;
    ssm: string;
    alamat: string;
    telefon: string;
    emel: string;
    bankNama: string;
    bankAkaun: string;
    bankPenerima: string;
  };
  items: FinancialDocItem[];
  subtotal: number;
  diskaun: number;              // Dalam RM
  kadarSstPeratus: number;      // 0 atau 8
  cukaiSstJumlah: number;
  jumlahKeseluruhan: number;
  jumlahDibayar: number;        // Deposit atau bayaran diterima
  bakiPerluDibayar: number;
  statusBayaran: 'belum_bayar' | 'sebahagian' | 'lunas';
  kaedahBayaran?: string;       // FPX / Pindahan Bank / DuitNow
  termaDanSyarat: string;
  notaTambahan?: string;
  namaPenandatangan: string;
  jawatanPenandatangan: string;
  tarikhDicipta: string;
}

export type AgreementType =
  | 'perjanjian_servis'     // Kontrak Servis Projek Lengkap
  | 'terma_syarat'          // Terma & Syarat Projek Spesifik
  | 'nda'                   // Perjanjian Kerahsiaan (NDA)
  | 'sow';                  // Statement of Work (SOW)

export interface AgreementDoc {
  id: string;
  noPerjanjian: string;         // cth: PRX-AGR-2026-001
  nomborRujukan?: string;       // Alias for noPerjanjian
  jenis: AgreementType;
  tajuk: string;
  tarikh: string;               // YYYY-MM-DD
  projekId?: string;
  namaKlien: string;
  syarikatKlien?: string;
  noIcSSMKlien?: string;
  alamatKlien?: string;
  telefonKlien: string;
  emelKlien?: string;
  servisTerlibat: ProvexaService[];
  skopTerperinci: string;
  nilaiProjek: number;
  jadualBayaran: {
    depositPeratus: number;     // cth: 50%
    kemajuanPeratus: number;    // cth: 30%
    akhirPeratus: number;       // cth: 20%
    termaHari: number;          // cth: 7 hari bekerja
  };
  tempohHariBekerja: number;    // cth: 30 hari
  hadSemakanPusingan: number;   // cth: 2 pusingan semakan minor
  tempohWarantiHari: number;    // cth: 30 hari jaminan bug
  klausaHartaIntelek: string;
  klausaKerahsiaan: string;
  klausaPenamatan: string;
  namaWakilProvexa: string;
  jawatanWakilProvexa: string;
  namaWakilKlien: string;
  jawatanWakilKlien?: string;
  status: 'draf' | 'dihantar' | 'dipersetujui' | 'ditandatangani';
  tarikhDicipta: string;
  tarikhDikemaskini?: string;
}

export type ReminderType =
  | 'temujanji'             // Sesi Mesyuarat / Demo / Discovery
  | 'tarikh_akhir_projek'   // Deadline Projek / Sprint
  | 'semakan_klien'         // Sesi UAT & Semakan Klien
  | 'kutip_bayaran'         // Follow-up Invois & Bayaran Baki
  | 'followup_proposal'     // Follow-up Sebutharga / Quotation
  | 'sesi_rundingan'
  | 'susulan_sebutharga'
  | 'kutipan_bayaran'
  | 'semakan_uat'
  | 'pelancaran_projek'
  | 'custom';

export interface Reminder {
  id: string;
  projekId?: string;
  leadId?: string;
  namaKlien?: string;
  telefonKlien?: string;
  namaPelanggan?: string;
  telefonPelanggan?: string;
  tajuk: string;
  jenis: ReminderType;
  tarikh: string;           // YYYY-MM-DD
  masa: string;             // HH:mm
  lokasi?: string;          // Google Meet / Pejabat / WhatsApp Call
  status: 'belum' | 'selesai' | 'dibatalkan';
  selesai?: boolean;
  nota?: string;
}

export type TemplateCategory =
  | 'intro'
  | 'quotation'
  | 'agreement'
  | 'invoice'
  | 'followup'
  | 'handover'
  | 'services'
  | 'semua'
  | 'pengenalan'
  | 'sebutharga'
  | 'perjanjian'
  | 'invois'
  | 'kemajuan_projek'
  | 'penyerahan'
  | 'peringatan';

export interface MessageTemplate {
  id: string;
  tajuk: string;
  kategori: TemplateCategory | string;
  isiKandungan?: string;
  teks?: string;
}

export interface PromotionOffer {
  id: string;
  tajuk: string;
  keterangan?: string;
  servisKey?: ProvexaService;
  kodKupon?: string;
  diskaun?: number;
  tarikhTamat?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

// ==================== PRODUK DIGITAL & JUALAN RETAIL ====================
export type DigitalProductCategory =
  | 'sistem'          // Sistem & Platform SaaS
  | 'ai_prompt'       // Prompt Vault & AI Assets
  | 'template'        // Notion, Canva, Figma, Sheets
  | 'ebook'           // E-Book & Panduan Digital
  | 'source_code'     // Source Code & Starter Kit
  | 'mini_course'     // Rakaman Video & Masterclass
  | 'lisensi'         // Lesen Perisian / Software Key
  | 'lain_lain';

export type DigitalDeliveryFormat =
  | 'PDF'
  | 'ZIP'
  | 'Notion'
  | 'Canva'
  | 'Figma'
  | 'Video'
  | 'Google Drive'
  | 'Web Portal';

export interface DigitalProduct {
  id: string;
  sku: string;                    // cth: PRX-DIG-AI500
  nama: string;
  kategori: DigitalProductCategory;
  modelJualan?: 'langganan' | 'one_off'; // Langganan (Subscription base) vs Sekali Beli
  tempohLangganan?: 'bulanan' | 'tahunan' | 'seumur_hidup';
  bilanganSubscribers?: number;   // Bilangan pengguna / subscriber aktif
  mrrBulanan?: number;            // Monthly Recurring Revenue dari langganan aktif
  hargaRuncit: number;            // Harga jualan / yuran langganan bulanan dalam RM (cth: 69)
  hargaAsal?: number;             // Harga asal untuk paparan potongan (cth: 149)
  peneranganRingkas: string;
  peneranganLengkap?: string;
  faedahUtama: string[];
  formatPenghantaran: DigitalDeliveryFormat;
  saizFail?: string;              // cth: "48 MB" atau "Akses Seumur Hidup"
  pautanMuatTurun: string;        // URL download atau link portal
  kunciAksesAtauLesen?: string;   // Kunci lesen / kod akses jika ada
  mesejPenghantaranWhatsApp: string; // Template teks auto-hantar ke pembeli
  aktif: boolean;
  jumlahTerjual: number;
  targetUnit?: number;            // Sasaran bilangan unit / subscribers jualan produk ini
  targetRM?: number;              // Sasaran nilai hasil jualan RM produk ini
  targetSubscribers?: number;     // Sasaran subscriber aktif jika model langganan
  targetMRR?: number;             // Sasaran nilai bulanan recurring (MRR) jika model langganan
  hadStok?: number | null;        // null = infiniti / tiada had
  ikonAtauImej?: string;          // Lucide icon name atau URL imej
  badgeLabel?: string;            // cth: "Hot Seller", "Edisi Terhad"
  tarikhDicipta: string;
  tarikhDikemaskini: string;
}

export type RetailPaymentMethod =
  | 'duitnow_qr'      // DuitNow QR (Semua Bank / TNG eWallet)
  | 'fpx'             // Perbankan Dalam Talian (FPX)
  | 'stripe'          // Kad Kredit / Debit
  | 'manual_transfer' // Pindahan Bank Manual
  | 'toyyibpay'       // ToyyibPay / Billplz
  | 'tunai';          // Tunai di kaunter / sesi fizikal

export type RetailOrderStatus =
  | 'lunas'           // Bayaran Diterima Penuh
  | 'menunggu'        // Menunggu Pengesahan Bayaran
  | 'batal';          // Dibatalkan

export type RetailFulfillmentStatus =
  | 'dihantar'        // Link produk telah dihantar ke pembeli
  | 'belum_dihantar'; // Belum dihantar

export interface DigitalRetailOrder {
  id: string;                     // cth: ORD-RET-2026-001
  noResit: string;                // cth: REC-DIG-2026-001
  produkId: string;
  skuProduk: string;
  namaProduk: string;
  kategoriProduk: DigitalProductCategory;
  formatPenghantaran: DigitalDeliveryFormat;
  hargaUnit: number;
  kuantiti: number;
  diskaun: number;                // Dalam RM
  kodKupon?: string;
  jumlahBayaran: number;          // (hargaUnit * kuantiti) - diskaun
  namaPembeli: string;
  telefonPembeli: string;
  emelPembeli?: string;
  kaedahBayaran: RetailPaymentMethod;
  statusBayaran: RetailOrderStatus;
  statusPenghantaran: RetailFulfillmentStatus;
  tarikhPesanan: string;          // ISO Timestamp
  tarikhPenghantaran?: string;    // ISO Timestamp bila link dihantar
  pautanAksesDiberi: string;
  kunciLesenDiberi?: string;
  notaPesanan?: string;
  dokumenKewanganId?: string;     // Jika dipautkan ke FinancialDoc resit rasmi
  crmStatus?: 'baru' | 'repeat' | 'upsell_prospect' | 'vip';
  upsellInterest?: string;        // Servis Provexa yang sesuai di-upsell
  lastFollowUpDate?: string;
  followUpNotes?: string;
}

export interface DigitalSalesTarget {
  bulanTahun: string;             // cth: "2026-03"
  sasaranBulananRM: number;       // cth: 15000 (Jumlah nilai sasaran)
  sasaranBulananUnit: number;     // cth: 220
  sasaranSubscribers?: number;    // Sasaran bilangan user/subscribers aktif
  sasaranMRR?: number;            // Sasaran nilai bulanan recurring (MRR)
  // Leads to Conversion Target Pipeline
  sasaranLeadsMasuk?: number;         // Sasaran bilangan leads yang masuk sebulan (cth: 350)
  sasaranKadarConversion?: number;    // Sasaran % leads bertukar jadi pembeli/subscriber (cth: 15%)
  sasaranUserBaru?: number;           // Sasaran user baru terhasil dari leads (cth: 50)
  sasaranNilaiConversionRM?: number;  // Anggaran nilai jualan/MRR dari leads convert (cth: 3500)
  purataNilaiLangganan?: number;      // Purata nilai langganan bulanan / user (cth: 69, 74, 79, atau kustom)
  targetPerProduk: Record<string, {
    targetUnit: number;
    targetRM: number;
    targetSubscribers?: number;
    targetMRR?: number;
    modelJualan?: 'langganan' | 'one_off';
  }>;
  catatanStrategi?: string;
  tarikhDikemaskini: string;
}

// ==================== PROSPEK & LEADS PRODUK DIGITAL ====================
export type DigitalLeadStatus =
  | 'baru'            // Inkuiri Baharu (WhatsApp / Web)
  | 'dihubungi'       // Telah Dihubungi (Follow-up)
  | 'tanya_harga'     // Minta Tawaran / Kombo / Diskaun
  | 'tunggu_bayaran'  // Tunggu Pengesahan Resit / QR
  | 'berjaya'         // Berjaya Ditukar Ke Pesanan (Deal Won)
  | 'batal';          // Batal / KIV

export type DigitalLeadSource =
  | 'whatsapp'
  | 'borang_web'
  | 'iklan_tiktok'
  | 'iklan_meta'
  | 'lead_magnet'
  | 'kaunter_pos'
  | 'rujukan'
  | 'lain_lain';

export interface DigitalRetailLead {
  id: string;                         // cth: DLD-2026-001
  nama: string;
  telefon: string;
  emel?: string;
  produkDiminatiId?: string;
  namaProdukDiminati: string;
  kategoriProduk?: DigitalProductCategory;
  anggaranNilai: number;              // Nilai jualan yang disasarkan (RM)
  status: DigitalLeadStatus;
  sumber: DigitalLeadSource;
  keutamaan: 'rendah' | 'sederhana' | 'tinggi';
  nota: string;
  kiraanFollowup: number;
  tarikhFollowupTerakhir?: string;
  tarikhDicipta: string;
  tarikhDikemaskini?: string;
  pesananIdTerkait?: string;          // ID Pesanan jika ditukar ke jualan berjaya
  leadAgensiIdTerkait?: string;       // ID Lead jika dipindahkan ke saluran agensi
}

