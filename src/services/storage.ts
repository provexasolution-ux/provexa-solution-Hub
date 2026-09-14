import {
  Project,
  Lead,
  FinancialDoc,
  AgreementDoc,
  Reminder,
  MessageTemplate,
  GoogleSheetsConfig,
  ServiceMeta,
  DEFAULT_PROVEXA_SERVICES,
  PROVEXA_SERVICES,
  DigitalProduct,
  DigitalRetailOrder,
  DigitalSalesTarget,
  DigitalRetailLead,
} from '../types';
import { DEFAULT_TEMPLATES, stripEmojis } from '../utils/whatsapp';
import { cloudSave, cloudLoad } from './supabaseClient';

const STORAGE_KEYS = {
  PROJECTS: 'provexa_projects_v1',
  LEADS: 'provexa_leads_v1',
  FINANCIAL_DOCS: 'provexa_financial_docs_v1',
  AGREEMENTS: 'provexa_agreements_v1',
  REMINDERS: 'provexa_reminders_v1',
  TEMPLATES: 'provexa_templates_v1',
  SHEET_CONFIG: 'provexa_sheet_config_v1',
  SERVICES: 'provexa_services_catalog_v2',
  DIGITAL_PRODUCTS: 'provexa_digital_products_v3',
  DIGITAL_ORDERS: 'provexa_digital_orders_v3',
  DIGITAL_TARGET: 'provexa_digital_sales_target_v3',
  DIGITAL_LEADS: 'provexa_digital_leads_v1',
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRX-PRJ-01',
    kodProjek: 'PRX-WEB-2026-001',
    tajuk: 'Portal E-Commerce & Tempahan Mega Niaga',
    namaKlien: 'Dato’ Azhar bin Kamaruddin',
    syarikatKlien: 'Mega Niaga Retail Sdn Bhd',
    telefonKlien: '0123456789',
    emelKlien: 'azhar@meganiaga.com.my',
    servisUtama: 'website',
    servisTambahan: ['brandup4u'],
    skopKerja:
      'Membangunkan laman web e-commerce korporat responsif lengkap dengan katalog produk, shopping cart, FPX payment gateway (Billplz), dan panel admin inventori.',
    status: 'pembangunan',
    keutamaan: 'tinggi',
    kemajuanPeratus: 65,
    nilaiKontrak: 4800,
    jumlahDibayar: 2400,
    tarikhMula: '2026-02-15',
    tarikhSasaran: '2026-03-25',
    milestones: [
      {
        id: 'M1',
        tajuk: 'UI/UX Wireframe & Kelulusan Rekabentuk',
        tarikhSasaran: '2026-02-22',
        status: 'selesai',
        jumlahBayaran: 2400,
      },
      {
        id: 'M2',
        tajuk: 'Penyepaduan Frontend & Gerbang Pembayaran FPX',
        tarikhSasaran: '2026-03-10',
        status: 'selesai',
        jumlahBayaran: 1200,
      },
      {
        id: 'M3',
        tajuk: 'Ujian UAT, Latihan Admin & Pelancaran Domain Rasmi',
        tarikhSasaran: '2026-03-25',
        status: 'dalam_proses',
        jumlahBayaran: 1200,
      },
    ],
    pautanHasil: 'https://staging.meganiaga.provexasolution.com',
    dokumenRujukan: {
      sebuthargaNo: 'PRX-QUO-2026-001',
      invoisNo: 'PRX-INV-2026-001',
      perjanjianNo: 'PRX-AGR-2026-001',
    },
    nota: 'Klien perlukan sistem dilancarkan sebelum pelancaran kempen Hari Raya. Integrasi WhatsApp auto-reply disertakan.',
    tarikhDicipta: '2026-02-15T08:30:00.000Z',
    tarikhDikemaskini: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'PRX-PRJ-02',
    kodProjek: 'PRX-SAAS-2026-002',
    tajuk: 'Sistem Pengurusan Pelajar & Invois Automatik EduPrime',
    namaKlien: 'Puan Siti Hajar',
    syarikatKlien: 'EduPrime Academy',
    telefonKlien: '0198877665',
    emelKlien: 'hajar@eduprime.edu.my',
    servisUtama: 'saas',
    skopKerja:
      'Sistem SaaS portal berasaskan peranan (RBAC) untuk pendaftaran pelajar, penjadualan kelas, dan penjanaan invois serta resit automatik melalui emel dan WhatsApp.',
    status: 'semakan_uat',
    keutamaan: 'kritikal',
    kemajuanPeratus: 90,
    nilaiKontrak: 8500,
    jumlahDibayar: 5950,
    tarikhMula: '2026-01-20',
    tarikhSasaran: '2026-03-15',
    milestones: [
      {
        id: 'M1',
        tajuk: 'Reka Bentuk Skema Pangkalan Data & Enjin Pengesahan Auth',
        tarikhSasaran: '2026-02-05',
        status: 'selesai',
        jumlahBayaran: 2550,
      },
      {
        id: 'M2',
        tajuk: 'Modul Invois Automatik & WhatsApp Notifikasi',
        tarikhSasaran: '2026-02-25',
        status: 'selesai',
        jumlahBayaran: 3400,
      },
      {
        id: 'M3',
        tajuk: 'Sesi Ujian UAT & Penyerahan Dokumentasi API',
        tarikhSasaran: '2026-03-15',
        status: 'dalam_proses',
        jumlahBayaran: 2550,
      },
    ],
    pautanHasil: 'https://app.eduprime.io',
    dokumenRujukan: {
      sebuthargaNo: 'PRX-QUO-2026-002',
      invoisNo: 'PRX-INV-2026-002',
      perjanjianNo: 'PRX-AGR-2026-002',
    },
    nota: 'Klien sedang menyemak modul laporan kewangan bulanan. Dijangka sign-off dalam 3 hari.',
    tarikhDicipta: '2026-01-20T09:00:00.000Z',
    tarikhDikemaskini: '2026-03-05T14:20:00.000Z',
  },
  {
    id: 'PRX-PRJ-03',
    kodProjek: 'PRX-ADS-2026-003',
    tajuk: 'Kempen Meta & TikTok Ads Pelancaran Produk Kesihatan',
    namaKlien: 'Encik Firdaus Razak',
    syarikatKlien: 'NutriLife Global',
    telefonKlien: '0176655443',
    emelKlien: 'firdaus@nutrilifeglobal.com',
    servisUtama: 'paid_ads',
    servisTambahan: ['social_media'],
    skopKerja:
      'Pengurusan kempen iklan berbayar Facebook, Instagram, dan TikTok Ads selama 30 hari, sasaran minimum 300 leads berkualiti dengan CPL bawah RM15.',
    status: 'pembangunan',
    keutamaan: 'sederhana',
    kemajuanPeratus: 40,
    nilaiKontrak: 2500,
    jumlahDibayar: 2500,
    tarikhMula: '2026-03-01',
    tarikhSasaran: '2026-03-31',
    milestones: [
      {
        id: 'M1',
        tajuk: 'Penyediaan Struktur Iklan, Pixel Setup & 6 Video Kreatif',
        tarikhSasaran: '2026-03-05',
        status: 'selesai',
        jumlahBayaran: 1500,
      },
      {
        id: 'M2',
        tajuk: 'Fasa Pelancaran Kempen & A/B Testing Format Video',
        tarikhSasaran: '2026-03-18',
        status: 'dalam_proses',
        jumlahBayaran: 1000,
      },
    ],
    nota: 'Bajet iklan klien RM10,000 diuruskan terus melalui Business Manager klien.',
    tarikhDicipta: '2026-03-01T11:00:00.000Z',
    tarikhDikemaskini: '2026-03-08T16:45:00.000Z',
  },
  {
    id: 'PRX-PRJ-04',
    kodProjek: 'PRX-BRD-2026-004',
    tajuk: 'Pakej Identiti Korporat & Brand Kit BrandUP4U',
    namaKlien: 'Cik Farah Nabilah',
    syarikatKlien: 'Kopi Kenangan Desa',
    telefonKlien: '01123445566',
    emelKlien: 'farah@kopikenangan.my',
    servisUtama: 'brandup4u',
    skopKerja:
      'Penyediaan identiti jenama penuh merangkumi rekabentuk logo utama & sekunder, palet warna, panduan tipografi, packaging mockup, dan template media sosial.',
    status: 'selesai',
    keutamaan: 'rendah',
    kemajuanPeratus: 100,
    nilaiKontrak: 1600,
    jumlahDibayar: 1600,
    tarikhMula: '2026-02-01',
    tarikhSasaran: '2026-02-20',
    tarikhSelesai: '2026-02-18',
    milestones: [
      {
        id: 'M1',
        tajuk: 'Moodboard & 3 Konsep Awal Logo',
        tarikhSasaran: '2026-02-07',
        status: 'selesai',
      },
      {
        id: 'M2',
        tajuk: 'Brand Guidelines & Mockup Cup Packaging',
        tarikhSasaran: '2026-02-18',
        status: 'selesai',
      },
    ],
    pautanHasil: 'https://drive.google.com/drive/folders/brandup4u-kopi-kenangan',
    nota: 'Projek siap 2 hari lebih awal. Klien sangat berpuas hati dan berminat untuk servis website kelak.',
    tarikhDicipta: '2026-02-01T08:00:00.000Z',
    tarikhDikemaskini: '2026-02-18T17:00:00.000Z',
  },
  {
    id: 'PRX-PRJ-05',
    kodProjek: 'PRX-TRN-2026-005',
    tajuk: 'Bengkel AI Prompting & Automasi Perniagaan (2 Hari)',
    namaKlien: 'Tuan Haji Ridzuan',
    syarikatKlien: 'Dewan Perniagaan Usahawan Digital',
    telefonKlien: '0139988112',
    emelKlien: 'ridzuan@dpud.org.my',
    servisUtama: 'training',
    servisTambahan: ['promptgalerix'],
    skopKerja:
      'Mengendalikan sesi bengkel 2 hari untuk 35 peserta mengenai penggunaan AI Prompting (Promptgalerix), automasi aliran kerja, dan penjanaan konten pantas.',
    status: 'perancangan',
    keutamaan: 'tinggi',
    kemajuanPeratus: 30,
    nilaiKontrak: 3500,
    jumlahDibayar: 1750,
    tarikhMula: '2026-03-10',
    tarikhSasaran: '2026-03-28',
    milestones: [
      {
        id: 'M1',
        tajuk: 'Penyediaan Modul Slaid & Lesen Promptgalerix Peserta',
        tarikhSasaran: '2026-03-18',
        status: 'dalam_proses',
      },
      {
        id: 'M2',
        tajuk: 'Pelaksanaan Bengkel Fizikal di Hotel Bangi-Putrajaya',
        tarikhSasaran: '2026-03-28',
        status: 'belum',
      },
    ],
    nota: 'Deposit 50% telah dijelaskan. Baki 50% akan dibayar selepas tamat sesi bengkel.',
    tarikhDicipta: '2026-03-02T10:00:00.000Z',
    tarikhDikemaskini: '2026-03-06T11:00:00.000Z',
  },
  {
    id: 'PRX-PRJ-06',
    kodProjek: 'PRX-RET-2026-006',
    tajuk: 'Sistem Jualan Retail: Sasaran Target & Unjuran Anggaran',
    namaKlien: 'Encik Khairul Anuar bin Salleh',
    syarikatKlien: 'Anuar Retail Mart & Rangkaian Runcit',
    telefonKlien: '0124567890',
    emelKlien: 'khairul@anuarretail.com.my',
    servisUtama: 'saas',
    servisTambahan: ['website', 'consultation'],
    skopKerja:
      'Pembangunan modul pengurusan jualan retail dengan ciri penetapan sasaran target jualan bulanan (KPI RM85,000/cawangan), kalkulator anggaran kos operasi & margin untung, penjejakan prestasi jurujual harian, serta laporan visual varians sasaran vs jualan sebenar.',
    status: 'pembangunan',
    keutamaan: 'tinggi',
    kemajuanPeratus: 55,
    nilaiKontrak: 7500,
    jumlahDibayar: 3750,
    tarikhMula: '2026-03-01',
    tarikhSasaran: '2026-04-15',
    milestones: [
      {
        id: 'M1',
        tajuk: 'Penetapan Metrik Sasaran (Target) & Formulasi Model Anggaran Jualan Retail',
        tarikhSasaran: '2026-03-10',
        status: 'selesai',
        jumlahBayaran: 3750,
      },
      {
        id: 'M2',
        tajuk: 'Papan Pemuka Pemantauan Sasaran Target Harian & Jualan Retail Sebenar',
        tarikhSasaran: '2026-03-25',
        status: 'dalam_proses',
        jumlahBayaran: 2250,
      },
      {
        id: 'M3',
        tajuk: 'Modul Laporan Analisis Varians Anggaran vs Hasil & Sesi UAT',
        tarikhSasaran: '2026-04-15',
        status: 'belum',
        jumlahBayaran: 1500,
      },
    ],
    pautanHasil: 'https://retail.provexasolution.com',
    dokumenRujukan: {
      sebuthargaNo: 'PRX-QUO-2026-006',
      invoisNo: 'PRX-INV-2026-006',
      perjanjianNo: 'PRX-AGR-2026-006',
    },
    nota: 'Sasaran jualan retail bulanan klien disasarkan sebanyak RM85,000 dengan margin sasaran 22%. Anggaran peruntukan bajet promosi 10%. Sistem menyokong pelbagai cawangan runcit.',
    tarikhDicipta: '2026-03-01T08:30:00.000Z',
    tarikhDikemaskini: '2026-03-09T15:00:00.000Z',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'PRX-LEAD-01',
    nama: 'Syed Al-Attas',
    syarikat: 'Al-Attas Logistics Sdn Bhd',
    telefon: '0124433221',
    emel: 'syed@alattaslogistics.com',
    servisMinat: 'saas',
    servisTambahan: ['website'],
    anggaranBajet: 12000,
    status: 'sebutharga_dihantar',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    tarikhTemujanji: '2026-03-12',
    masaTemujanji: '10:30',
    notaTemujanji: 'Google Meet pembentangan proposal teknikal',
    nota: 'Perlukan sistem dispatch tracking lori dan kalkulator invois automatik untuk 40 pemandu.',
    kiraanFollowup: 2,
    tarikhFollowupTerakhir: '2026-03-08T09:00:00.000Z',
    tarikhDicipta: '2026-03-04T08:00:00.000Z',
    tarikhDikemaskini: '2026-03-08T09:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-02',
    nama: 'Dr. Melissa Wong',
    syarikat: 'Wong Aesthetic & Dental Clinic',
    telefon: '0189912345',
    emel: 'drwong@wongaesthetic.com',
    servisMinat: 'paid_ads',
    servisTambahan: ['social_media', 'website'],
    anggaranBajet: 3500,
    status: 'sesi_discovery',
    sumber: 'borang_web',
    keutamaan: 'tinggi',
    nota: 'Mahu tingkatkan tempahan rawatan pemutihan gigi dan Invisalign di cawangan Mont Kiara & Subang.',
    kiraanFollowup: 1,
    tarikhDicipta: '2026-03-07T14:30:00.000Z',
    tarikhDikemaskini: '2026-03-07T14:30:00.000Z',
  },
  {
    id: 'PRX-LEAD-03',
    nama: 'Amirul Hakim',
    syarikat: 'Bina Teguh Contractors',
    telefon: '0137788990',
    emel: 'amirul@binateguh.my',
    servisMinat: 'website',
    servisTambahan: ['brandup4u'],
    anggaranBajet: 2800,
    status: 'baru',
    sumber: 'facebook',
    keutamaan: 'sederhana',
    nota: 'Mahu reka bentuk semula website syarikat kontraktor lama supaya nampak moden dan korporat.',
    kiraanFollowup: 0,
    tarikhDicipta: '2026-03-09T16:00:00.000Z',
    tarikhDikemaskini: '2026-03-09T16:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-04',
    nama: 'Karen Tan',
    syarikat: 'Apex Retail Ventures',
    telefon: '0165544332',
    emel: 'karen@apexretail.com',
    servisMinat: 'consultation',
    servisTambahan: ['saas'],
    anggaranBajet: 5000,
    status: 'tunggu_deposit',
    sumber: 'rujukan',
    keutamaan: 'tinggi',
    nota: 'Sesi konsultasi 1-to-1 untuk merangka sistem POS omnichannel. Menunggu deposit RM2,500.',
    kiraanFollowup: 3,
    tarikhFollowupTerakhir: '2026-03-09T11:00:00.000Z',
    tarikhDicipta: '2026-02-28T10:00:00.000Z',
    tarikhDikemaskini: '2026-03-09T11:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-05',
    nama: 'Zulhelmi Rosli',
    syarikat: 'Agensi Digital Z',
    telefon: '0111223344',
    emel: 'zul@agensidigitalz.com',
    servisMinat: 'promptgalerix',
    anggaranBajet: 598,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'rendah',
    nota: 'Membeli 2 lesen Promptgalerix Business Edition untuk pasukan agensi beliau. Bayaran selesai.',
    kiraanFollowup: 1,
    tarikhDicipta: '2026-03-01T09:00:00.000Z',
    tarikhDikemaskini: '2026-03-02T15:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-06',
    nama: 'Khairul Anuar',
    syarikat: 'Anuar Retail Mart & Rangkaian Runcit',
    telefon: '0124567890',
    emel: 'khairul@anuarretail.com.my',
    servisMinat: 'saas',
    servisTambahan: ['website', 'consultation'],
    anggaranBajet: 7500,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    nota: 'Sistem pengurusan jualan retail: penetapan sasaran target bulanan RM85,000 dan unjuran anggaran kos vs hasil.',
    kiraanFollowup: 2,
    tarikhDicipta: '2026-03-01T08:00:00.000Z',
    tarikhDikemaskini: '2026-03-08T10:00:00.000Z',
  },
  // Historical Records (Oct 2025 - Feb 2026) for Rich Sales Analytics
  {
    id: 'PRX-LEAD-HIST-01',
    nama: 'Hj. Kamaruzaman',
    syarikat: 'Warisan D’Rasa Food Industries',
    telefon: '0129988771',
    emel: 'kamaruzaman@warisandrasa.my',
    servisMinat: 'website',
    anggaranBajet: 4500,
    status: 'berjaya',
    sumber: 'borang_web',
    keutamaan: 'tinggi',
    nota: 'Website korporat + katalog produk makanan halal.',
    tarikhDicipta: '2025-10-08T10:00:00.000Z',
    tarikhDikemaskini: '2025-10-08T10:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-02',
    nama: 'Puan Sheila Rahman',
    syarikat: 'Klinik Pakar Mediview',
    telefon: '0176655443',
    emel: 'sheila@mediview.com.my',
    servisMinat: 'paid_ads',
    anggaranBajet: 2800,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    nota: 'Kempen Meta Ads untuk cawangan baharu Shah Alam.',
    tarikhDicipta: '2025-10-15T11:00:00.000Z',
    tarikhDikemaskini: '2025-10-15T11:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-03',
    nama: 'Faizal Othman',
    syarikat: 'Faizal Hardware Trading',
    telefon: '0193322110',
    servisMinat: 'social_media',
    anggaranBajet: 1500,
    status: 'gagal',
    sumber: 'facebook',
    keutamaan: 'rendah',
    nota: 'Bajet belum mencukupi untuk retainer bulanan.',
    tarikhDicipta: '2025-10-23T14:00:00.000Z',
    tarikhDikemaskini: '2025-10-23T14:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-04',
    nama: 'Faridah Hashim',
    syarikat: 'EduTech Academy Sdn Bhd',
    telefon: '0138877665',
    emel: 'faridah@edutech.edu.my',
    servisMinat: 'saas',
    servisTambahan: ['website'],
    anggaranBajet: 10500,
    status: 'berjaya',
    sumber: 'rujukan',
    keutamaan: 'tinggi',
    nota: 'Sistem portal pembelajaran e-learning & ujian dalam talian.',
    tarikhDicipta: '2025-11-04T09:30:00.000Z',
    tarikhDikemaskini: '2025-11-04T09:30:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-05',
    nama: 'Azlan Shah',
    syarikat: 'Automart Garage & Tinting',
    telefon: '0112233998',
    servisMinat: 'brandup4u',
    anggaranBajet: 3000,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'sederhana',
    nota: 'Pakej penjenamaan logo, papan tanda, dan identiti visual.',
    tarikhDicipta: '2025-11-12T15:00:00.000Z',
    tarikhDikemaskini: '2025-11-12T15:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-06',
    nama: 'Noraida Zainal',
    syarikat: 'Noraida Cakes & Pastry',
    telefon: '0167788112',
    servisMinat: 'promptgalerix',
    anggaranBajet: 598,
    status: 'berjaya',
    sumber: 'borang_web',
    keutamaan: 'rendah',
    nota: 'Langganan Promptgalerix untuk reka konten Instagram.',
    tarikhDicipta: '2025-11-20T10:00:00.000Z',
    tarikhDikemaskini: '2025-11-20T10:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-07',
    nama: 'Cikgu Rahman',
    syarikat: 'Koperasi Guru Selangor',
    telefon: '0125544119',
    servisMinat: 'training',
    anggaranBajet: 3500,
    status: 'berjaya',
    sumber: 'rujukan',
    keutamaan: 'tinggi',
    nota: 'Bengkel AI Tools & Canva Pro untuk warga pendidik.',
    tarikhDicipta: '2025-11-26T14:00:00.000Z',
    tarikhDikemaskini: '2025-11-26T14:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-08',
    nama: 'David Tan',
    syarikat: 'Nexus Logistics Global',
    telefon: '0182233441',
    servisMinat: 'saas',
    anggaranBajet: 14000,
    status: 'berjaya',
    sumber: 'borang_web',
    keutamaan: 'tinggi',
    nota: 'Platform pengurusan kontena pelabuhan dan invois.',
    tarikhDicipta: '2025-12-05T10:00:00.000Z',
    tarikhDikemaskini: '2025-12-05T10:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-09',
    nama: 'Dr. Zulaikha',
    syarikat: 'Zulaikha Dental & Orthodontic',
    telefon: '0139988223',
    servisMinat: 'paid_ads',
    anggaranBajet: 3500,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    nota: 'Lead gen iklan rawatan gigi.',
    tarikhDicipta: '2025-12-14T11:00:00.000Z',
    tarikhDikemaskini: '2025-12-14T11:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-10',
    nama: 'Khairul Anwar',
    syarikat: 'KA Renovations & Deco',
    telefon: '0173344556',
    servisMinat: 'website',
    anggaranBajet: 3800,
    status: 'berjaya',
    sumber: 'facebook',
    keutamaan: 'sederhana',
    nota: 'Portfolio laman web hiasan dalaman.',
    tarikhDicipta: '2025-12-20T16:00:00.000Z',
    tarikhDikemaskini: '2025-12-20T16:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-11',
    nama: 'Pn. Rohani Ahmad',
    syarikat: 'Rohani Batik & Craft',
    telefon: '0198877112',
    servisMinat: 'social_media',
    anggaranBajet: 1800,
    status: 'gagal',
    sumber: 'whatsapp',
    keutamaan: 'rendah',
    nota: 'Ditangguhkan ke suku kedua 2026.',
    tarikhDicipta: '2025-12-27T13:00:00.000Z',
    tarikhDikemaskini: '2025-12-27T13:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-12',
    nama: 'Engku Haris',
    syarikat: 'Bintang Timur Realty',
    telefon: '0123388991',
    servisMinat: 'website',
    anggaranBajet: 5500,
    status: 'berjaya',
    sumber: 'rujukan',
    keutamaan: 'tinggi',
    nota: 'Portal carian hartanah premium.',
    tarikhDicipta: '2026-01-09T09:00:00.000Z',
    tarikhDikemaskini: '2026-01-09T09:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-13',
    nama: 'Hafizuddin Danial',
    syarikat: 'Genius Capital Trading',
    telefon: '0112299884',
    servisMinat: 'training',
    anggaranBajet: 4500,
    status: 'berjaya',
    sumber: 'borang_web',
    keutamaan: 'tinggi',
    nota: 'Latihan automasi aliran kerja korporat.',
    tarikhDicipta: '2026-01-16T14:00:00.000Z',
    tarikhDikemaskini: '2026-01-16T14:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-14',
    nama: 'Suzana Bakar',
    syarikat: 'D’Bunga Florist & Event',
    telefon: '0165544118',
    servisMinat: 'promptgalerix',
    anggaranBajet: 598,
    status: 'berjaya',
    sumber: 'whatsapp',
    keutamaan: 'rendah',
    nota: 'Aplikasi Promptgalerix lesen agensi.',
    tarikhDicipta: '2026-01-24T11:00:00.000Z',
    tarikhDikemaskini: '2026-01-24T11:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-15',
    nama: 'Tuan Haji Ridzuan',
    syarikat: 'Dewan Perniagaan Usahawan Digital',
    telefon: '0139988112',
    servisMinat: 'training',
    anggaranBajet: 3500,
    status: 'berjaya',
    sumber: 'rujukan',
    keutamaan: 'tinggi',
    nota: 'Bengkel AI Prompting & Automasi 2 Hari.',
    tarikhDicipta: '2026-02-12T10:00:00.000Z',
    tarikhDikemaskini: '2026-02-12T10:00:00.000Z',
  },
  {
    id: 'PRX-LEAD-HIST-16',
    nama: 'Zainab Ibrahim',
    syarikat: 'Zainab Fashion Studio',
    telefon: '0142233119',
    servisMinat: 'brandup4u',
    anggaranBajet: 2200,
    status: 'berjaya',
    sumber: 'facebook',
    keutamaan: 'sederhana',
    nota: 'Rebranding visual & lookbook digital.',
    tarikhDicipta: '2026-02-18T15:00:00.000Z',
    tarikhDikemaskini: '2026-02-18T15:00:00.000Z',
  },
];

export const INITIAL_FINANCIAL_DOCS: FinancialDoc[] = [
  {
    id: 'DOC-001',
    jenis: 'sebutharga',
    noDokumen: 'PRX-QUO-2026-001',
    tajukProjek: 'Pembangunan Portal E-Commerce Mega Niaga',
    tarikh: '2026-02-10',
    tarikhLuput: '2026-03-10',
    projekId: 'PRX-PRJ-01',
    klien: {
      nama: 'Dato’ Azhar bin Kamaruddin',
      syarikat: 'Mega Niaga Retail Sdn Bhd',
      alamat: 'Tingkat 12, Menara Mega, Persiaran Barat, 46050 Petaling Jaya, Selangor',
      telefon: '0123456789',
      emel: 'azhar@meganiaga.com.my',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Suite 8-02, Level 8, Vertical Corporate Tower B, Bangsar South, 59200 Kuala Lumpur',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-01',
        penerangan: 'Service Develope Website - Pembangunan Portal E-Commerce Responsif & Mobile-First',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 3800,
        jumlah: 3800,
      },
      {
        id: 'ITM-02',
        penerangan: 'BrandUP4U - Penjenamaan Logo & Kit Identiti Visual Digital',
        servisKategori: 'brandup4u',
        kuantiti: 1,
        hargaUnit: 1000,
        jumlah: 1000,
      },
    ],
    subtotal: 4800,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 4800,
    jumlahDibayar: 2400,
    bakiPerluDibayar: 2400,
    statusBayaran: 'sebahagian',
    termaDanSyarat:
      '1. Bayaran 50% deposit diperlukan sebelum projek dimulakan.\n2. Baki 50% dibayar selepas sesi UAT dan sebelum serahan domain & kod sumber.\n3. Sebutharga sah selama 30 hari dari tarikh dikeluarkan.',
    notaTambahan: 'Harga termasuk domain .com.my & hosting pelayan awan untuk 1 tahun percuma.',
    namaPenandatangan: 'Pengarah Projek',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'DOC-002',
    jenis: 'invois',
    noDokumen: 'PRX-INV-2026-001',
    tajukProjek: 'Invois Deposit 50% Portal E-Commerce Mega Niaga',
    tarikh: '2026-02-15',
    tarikhLuput: '2026-02-22',
    projekId: 'PRX-PRJ-01',
    klien: {
      nama: 'Dato’ Azhar bin Kamaruddin',
      syarikat: 'Mega Niaga Retail Sdn Bhd',
      alamat: 'Tingkat 12, Menara Mega, Persiaran Barat, 46050 Petaling Jaya, Selangor',
      telefon: '0123456789',
      emel: 'azhar@meganiaga.com.my',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Suite 8-02, Level 8, Vertical Corporate Tower B, Bangsar South, 59200 Kuala Lumpur',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-01',
        penerangan: 'Deposit 50% Pembangunan Portal E-Commerce Mega Niaga (Berdasarkan PRX-QUO-2026-001)',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 2400,
        jumlah: 2400,
      },
    ],
    subtotal: 2400,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 2400,
    jumlahDibayar: 2400,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank (Maybank2u)',
    termaDanSyarat: 'Bayaran penuh telah dijelaskan. Fasa pelaksanaan telah diaktifkan.',
    namaPenandatangan: 'Pengurus Kewangan',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-02-15T11:00:00.000Z',
  },
  {
    id: 'DOC-003',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-001',
    tajukProjek: 'Resit Rasmi Bayaran Deposit Portal E-Commerce Mega Niaga',
    tarikh: '2026-02-16',
    projekId: 'PRX-PRJ-01',
    klien: {
      nama: 'Dato’ Azhar bin Kamaruddin',
      syarikat: 'Mega Niaga Retail Sdn Bhd',
      telefon: '0123456789',
      emel: 'azhar@meganiaga.com.my',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Suite 8-02, Level 8, Vertical Corporate Tower B, Bangsar South, 59200 Kuala Lumpur',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-01',
        penerangan: 'Pembayaran Deposit 50% bagi Kontrak No. PRX-WEB-2026-001',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 2400,
        jumlah: 2400,
      },
    ],
    subtotal: 2400,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 2400,
    jumlahDibayar: 2400,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Online Banking (FPX)',
    termaDanSyarat: 'Resit ini sah sebagai pengesahan penerimaan dana rasmi Provexa Solution.',
    namaPenandatangan: 'Bahagian Akaun & Kewangan',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-02-16T12:00:00.000Z',
  },
  {
    id: 'DOC-007',
    jenis: 'invois',
    noDokumen: 'PRX-INV-2026-006',
    tajukProjek: 'Invois Deposit 50% Sistem Jualan Retail, Sasaran Target & Anggaran',
    tarikh: '2026-03-02',
    tarikhLuput: '2026-03-12',
    projekId: 'PRX-PRJ-06',
    klien: {
      nama: 'Encik Khairul Anuar bin Salleh',
      syarikat: 'Anuar Retail Mart & Rangkaian Runcit',
      alamat: 'No 45, Jalan Niaga Utama, Pusat Perdagangan Nilai, 71800 Nilai, Negeri Sembilan',
      telefon: '0124567890',
      emel: 'khairul@anuarretail.com.my',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Suite 8-02, Level 8, Vertical Corporate Tower B, Bangsar South, 59200 Kuala Lumpur',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-RET-01',
        penerangan: 'Modul Sistem Jualan Retail: Penetapan Sasaran Jualan & Model Anggaran Hasil',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 5500,
        jumlah: 5500,
      },
      {
        id: 'ITM-RET-02',
        penerangan: 'Papan Pemuka Analitis Target vs Sebenar & Integrasi Cawangan Runcit',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 2000,
        jumlah: 2000,
      },
    ],
    subtotal: 7500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 7500,
    jumlahDibayar: 3750,
    bakiPerluDibayar: 3750,
    statusBayaran: 'sebahagian',
    termaDanSyarat: '1. Deposit 50% bagi permulaan fasa penetapan target & konfigurasi modul runcit.\n2. Baki 50% dibayar selepas selesai sesi UAT.',
    notaTambahan: 'Termasuk konfigurasi KPI jualan bulanan RM85,000 dan laporan varians kos operasi.',
    namaPenandatangan: 'Pengarah Projek',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-03-02T09:00:00.000Z',
  },
  {
    id: 'DOC-008',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-006',
    tajukProjek: 'Resit Rasmi Deposit 50% Sistem Jualan Retail & Sasaran Anggaran',
    tarikh: '2026-03-02',
    projekId: 'PRX-PRJ-06',
    klien: {
      nama: 'Encik Khairul Anuar bin Salleh',
      syarikat: 'Anuar Retail Mart & Rangkaian Runcit',
      alamat: 'No 45, Jalan Niaga Utama, Pusat Perdagangan Nilai, 71800 Nilai, Negeri Sembilan',
      telefon: '0124567890',
      emel: 'khairul@anuarretail.com.my',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Suite 8-02, Level 8, Vertical Corporate Tower B, Bangsar South, 59200 Kuala Lumpur',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-RET-R1',
        penerangan: 'Bayaran Deposit 50% Modul Jualan Retail, Sasaran Target & Anggaran',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 3750,
        jumlah: 3750,
      },
    ],
    subtotal: 3750,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 3750,
    jumlahDibayar: 3750,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pemindahan Bank Atas Talian (FPX Maybank)',
    notaTambahan: 'No. Rujukan Transaksi FPX Maybank: MBB-FPX-20260302-88219',
    termaDanSyarat: 'Resit rasmi ini mengesahkan penerimaan bayaran deposit permulaan projek.',
    namaPenandatangan: 'Bahagian Akaun & Kewangan',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-03-02T10:00:00.000Z',
  },
  // Historical Financial Documents (Oct 2025 - Mar 2026) for Sales Analytics
  {
    id: 'DOC-HIST-01',
    jenis: 'invois',
    noDokumen: 'PRX-INV-2025-001',
    tajukProjek: 'Pembangunan Laman Web Warisan D’Rasa Food Industries',
    tarikh: '2025-10-12',
    tarikhLuput: '2025-10-19',
    klien: {
      nama: 'Hj. Kamaruzaman',
      syarikat: 'Warisan D’Rasa Food Industries',
      telefon: '0129988771',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H1',
        penerangan: 'Service Develope Website - Portal Korporat & Katalog Produk Halal',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 4500,
        jumlah: 4500,
      },
    ],
    subtotal: 4500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 4500,
    jumlahDibayar: 4500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Bayaran penuh telah dijelaskan.',
    namaPenandatangan: 'Pengurus Kewangan',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-10-12T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-02',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-001',
    tajukProjek: 'Resit Bayaran Penuh Warisan D’Rasa Food Industries',
    tarikh: '2025-10-15',
    klien: {
      nama: 'Hj. Kamaruzaman',
      syarikat: 'Warisan D’Rasa Food Industries',
      telefon: '0129988771',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H2',
        penerangan: 'Bayaran Penuh Portal Korporat',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 4500,
        jumlah: 4500,
      },
    ],
    subtotal: 4500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 4500,
    jumlahDibayar: 4500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-10-15T12:00:00.000Z',
  },
  {
    id: 'DOC-HIST-03',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-002',
    tajukProjek: 'Resit Kempen Meta Ads Klinik Mediview',
    tarikh: '2025-10-22',
    klien: {
      nama: 'Puan Sheila Rahman',
      syarikat: 'Klinik Pakar Mediview',
      telefon: '0176655443',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H3',
        penerangan: 'Service Paid Ads - Pakej Meta Ads Lead Gen',
        servisKategori: 'paid_ads',
        kuantiti: 1,
        hargaUnit: 2800,
        jumlah: 2800,
      },
    ],
    subtotal: 2800,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 2800,
    jumlahDibayar: 2800,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-10-22T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-04',
    jenis: 'invois',
    noDokumen: 'PRX-INV-2025-002',
    tajukProjek: 'Invois Sistem E-Learning EduTech Academy',
    tarikh: '2025-11-08',
    tarikhLuput: '2025-11-15',
    klien: {
      nama: 'Faridah Hashim',
      syarikat: 'EduTech Academy Sdn Bhd',
      telefon: '0138877665',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H4',
        penerangan: 'Service Develop SaaS - Sistem Portal E-Learning & Peperiksaan',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 10500,
        jumlah: 10500,
      },
    ],
    subtotal: 10500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 10500,
    jumlahDibayar: 10500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Bayaran penuh telah dijelaskan.',
    namaPenandatangan: 'Pengurus Kewangan',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-11-08T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-05',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-003',
    tajukProjek: 'Resit Bayaran Sistem EduTech Academy',
    tarikh: '2025-11-10',
    klien: {
      nama: 'Faridah Hashim',
      syarikat: 'EduTech Academy Sdn Bhd',
      telefon: '0138877665',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H5',
        penerangan: 'Pelunasan Penuh Kontrak SaaS EduTech',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 10500,
        jumlah: 10500,
      },
    ],
    subtotal: 10500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 10500,
    jumlahDibayar: 10500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-11-10T11:00:00.000Z',
  },
  {
    id: 'DOC-HIST-06',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-004',
    tajukProjek: 'Resit BrandUP4U Automart Garage',
    tarikh: '2025-11-18',
    klien: {
      nama: 'Azlan Shah',
      syarikat: 'Automart Garage & Tinting',
      telefon: '0112233998',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H6',
        penerangan: 'BrandUP4U - Pakej Korporat Identiti & Logo',
        servisKategori: 'brandup4u',
        kuantiti: 1,
        hargaUnit: 3000,
        jumlah: 3000,
      },
    ],
    subtotal: 3000,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 3000,
    jumlahDibayar: 3000,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-11-18T14:00:00.000Z',
  },
  {
    id: 'DOC-HIST-07',
    jenis: 'invois',
    noDokumen: 'PRX-INV-2025-003',
    tajukProjek: 'Platform Logistik Nexus Logistics Global',
    tarikh: '2025-12-08',
    tarikhLuput: '2025-12-15',
    klien: {
      nama: 'David Tan',
      syarikat: 'Nexus Logistics Global',
      telefon: '0182233441',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H7',
        penerangan: 'Service Develop SaaS - Sistem Pengurusan Kontena Pelabuhan',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 14000,
        jumlah: 14000,
      },
    ],
    subtotal: 14000,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 14000,
    jumlahDibayar: 14000,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Bayaran penuh telah dijelaskan.',
    namaPenandatangan: 'Pengarah Projek',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-12-08T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-08',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-005',
    tajukProjek: 'Resit Bayaran Nexus Logistics Global',
    tarikh: '2025-12-10',
    klien: {
      nama: 'David Tan',
      syarikat: 'Nexus Logistics Global',
      telefon: '0182233441',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H8',
        penerangan: 'Pelunasan Kontrak SaaS Nexus Logistics',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 14000,
        jumlah: 14000,
      },
    ],
    subtotal: 14000,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 14000,
    jumlahDibayar: 14000,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-12-10T12:00:00.000Z',
  },
  {
    id: 'DOC-HIST-09',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-006',
    tajukProjek: 'Resit Portal KA Renovations & Deco',
    tarikh: '2025-12-22',
    klien: {
      nama: 'Khairul Anwar',
      syarikat: 'KA Renovations & Deco',
      telefon: '0173344556',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H9',
        penerangan: 'Website Portfolio Reka Bentuk Dalaman',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 3800,
        jumlah: 3800,
      },
    ],
    subtotal: 3800,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 3800,
    jumlahDibayar: 3800,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-12-22T14:00:00.000Z',
  },
  {
    id: 'DOC-HIST-10',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2025-007',
    tajukProjek: 'Resit Iklan Zulaikha Dental',
    tarikh: '2025-12-28',
    klien: {
      nama: 'Dr. Zulaikha',
      syarikat: 'Zulaikha Dental & Orthodontic',
      telefon: '0139988223',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H10',
        penerangan: 'Kempen Iklan Lead Gen Rawatan Gigi',
        servisKategori: 'paid_ads',
        kuantiti: 1,
        hargaUnit: 3500,
        jumlah: 3500,
      },
    ],
    subtotal: 3500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 3500,
    jumlahDibayar: 3500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2025-12-28T15:00:00.000Z',
  },
  {
    id: 'DOC-HIST-11',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-002',
    tajukProjek: 'Resit Portal Hartanah Bintang Timur Realty',
    tarikh: '2026-01-14',
    klien: {
      nama: 'Engku Haris',
      syarikat: 'Bintang Timur Realty',
      telefon: '0123388991',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H11',
        penerangan: 'Service Develope Website - Portal Carian Hartanah',
        servisKategori: 'website',
        kuantiti: 1,
        hargaUnit: 5500,
        jumlah: 5500,
      },
    ],
    subtotal: 5500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 5500,
    jumlahDibayar: 5500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-01-14T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-12',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-003',
    tajukProjek: 'Resit Latihan Genius Capital Trading',
    tarikh: '2026-01-20',
    klien: {
      nama: 'Hafizuddin Danial',
      syarikat: 'Genius Capital Trading',
      telefon: '0112299884',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H12',
        penerangan: 'Training Bengkel AI Automasi Aliran Kerja',
        servisKategori: 'training',
        kuantiti: 1,
        hargaUnit: 4500,
        jumlah: 4500,
      },
    ],
    subtotal: 4500,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 4500,
    jumlahDibayar: 4500,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-01-20T11:00:00.000Z',
  },
  {
    id: 'DOC-HIST-13',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-004',
    tajukProjek: 'Resit Deposit Latihan Bengkel DPUD',
    tarikh: '2026-02-20',
    klien: {
      nama: 'Tuan Haji Ridzuan',
      syarikat: 'Dewan Perniagaan Usahawan Digital',
      telefon: '0139988112',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H13',
        penerangan: 'Deposit 50% Bengkel AI Prompting & Automasi (2 Hari)',
        servisKategori: 'training',
        kuantiti: 1,
        hargaUnit: 1750,
        jumlah: 1750,
      },
    ],
    subtotal: 1750,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 1750,
    jumlahDibayar: 1750,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank',
    termaDanSyarat: 'Resit rasmi penerimaan deposit.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'DOC-HIST-14',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-005',
    tajukProjek: 'Resit BrandUP4U Zainab Fashion Studio',
    tarikh: '2026-02-24',
    klien: {
      nama: 'Zainab Ibrahim',
      syarikat: 'Zainab Fashion Studio',
      telefon: '0142233119',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H14',
        penerangan: 'BrandUP4U - Penjenamaan Logo & Lookbook Digital',
        servisKategori: 'brandup4u',
        kuantiti: 1,
        hargaUnit: 2200,
        jumlah: 2200,
      },
    ],
    subtotal: 2200,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 2200,
    jumlahDibayar: 2200,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-02-24T14:00:00.000Z',
  },
  {
    id: 'DOC-HIST-15',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-006',
    tajukProjek: 'Resit Deposit SaaS Al-Attas Logistics',
    tarikh: '2026-03-05',
    klien: {
      nama: 'Syed Al-Attas',
      syarikat: 'Al-Attas Logistics Sdn Bhd',
      telefon: '0124433221',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H15',
        penerangan: 'Deposit 50% Sistem Dispatch Tracking Lori & Kalkulator Invois',
        servisKategori: 'saas',
        kuantiti: 1,
        hargaUnit: 6000,
        jumlah: 6000,
      },
    ],
    subtotal: 6000,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 6000,
    jumlahDibayar: 6000,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'Pindahan Bank (Maybank2u)',
    termaDanSyarat: 'Resit rasmi penerimaan deposit.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-03-05T11:00:00.000Z',
  },
  {
    id: 'DOC-HIST-16',
    jenis: 'resit',
    noDokumen: 'PRX-REC-2026-007',
    tajukProjek: 'Resit Lesen Promptgalerix Agensi Digital Z',
    tarikh: '2026-03-02',
    klien: {
      nama: 'Zulhelmi Rosli',
      syarikat: 'Agensi Digital Z',
      telefon: '0111223344',
    },
    syarikatPengeluar: {
      nama: 'Provexa Solution',
      ssm: '202403198822 (TR0289110-M)',
      alamat: 'Bangsar South, KL',
      telefon: '+60 12-984 5521',
      emel: 'hello@provexasolution.com',
      bankNama: 'Maybank Berhad',
      bankAkaun: '5148 2210 9945',
      bankPenerima: 'Provexa Solution',
    },
    items: [
      {
        id: 'ITM-H16',
        penerangan: '2x Lesen Promptgalerix Business Edition',
        servisKategori: 'promptgalerix',
        kuantiti: 2,
        hargaUnit: 299,
        jumlah: 598,
      },
    ],
    subtotal: 598,
    diskaun: 0,
    kadarSstPeratus: 0,
    cukaiSstJumlah: 0,
    jumlahKeseluruhan: 598,
    jumlahDibayar: 598,
    bakiPerluDibayar: 0,
    statusBayaran: 'lunas',
    kaedahBayaran: 'FPX',
    termaDanSyarat: 'Resit rasmi penerimaan dana.',
    namaPenandatangan: 'Bahagian Akaun',
    jawatanPenandatangan: 'Provexa Solution',
    tarikhDicipta: '2026-03-02T16:00:00.000Z',
  },
];

export const INITIAL_AGREEMENTS: AgreementDoc[] = [
  {
    id: 'AGR-001',
    noPerjanjian: 'PRX-AGR-2026-001',
    jenis: 'perjanjian_servis',
    tajuk: 'Perjanjian Perkhidmatan Pembangunan Portal E-Commerce Mega Niaga',
    tarikh: '2026-02-15',
    projekId: 'PRX-PRJ-01',
    namaKlien: 'Dato’ Azhar bin Kamaruddin',
    syarikatKlien: 'Mega Niaga Retail Sdn Bhd',
    noIcSSMKlien: '201901034455 (1340123-X)',
    alamatKlien: 'Tingkat 12, Menara Mega, Persiaran Barat, 46050 Petaling Jaya, Selangor',
    telefonKlien: '0123456789',
    emelKlien: 'azhar@meganiaga.com.my',
    servisTerlibat: ['website', 'brandup4u'],
    skopTerperinci:
      'Provexa Solution bersetuju membekalkan perkhidmatan reka bentuk web e-commerce, integrasi sistem bayaran FPX, konfigurasi pangkalan data, dan penyerahan kit identiti visual jenama mengikut spesifikasi Sebutharga No. PRX-QUO-2026-001.',
    nilaiProjek: 4800,
    jadualBayaran: {
      depositPeratus: 50,
      kemajuanPeratus: 30,
      akhirPeratus: 20,
      termaHari: 7,
    },
    tempohHariBekerja: 30,
    hadSemakanPusingan: 2,
    tempohWarantiHari: 30,
    klausaHartaIntelek:
      'Hak milik penuh kod sumber (source code) dan aset rekaan diserahkan 100% kepada Pihak Klien sejurus bayaran penuh diselesaikan. Provexa Solution berhak menggunakan hasil rekaan sebagai portfolio agensi melainkan tertakluk kepada klausa NDA.',
    klausaKerahsiaan:
      'Kedua-dua pihak bersetuju melindungi segala maklumat rahsia, data pengguna, dan strategi perniagaan daripada didedahkan kepada pihak ketiga tanpa kebenaran bertulis.',
    klausaPenamatan:
      'Sekiranya penamatan kontrak dibuat oleh Pihak Klien selepas kerja fasa pertama dimulakan, deposit 50% tidak akan dikembalikan bagi menampung kos komitmen sumber dan tenaga kerja teknikal yang telah diperuntukkan.',
    namaWakilProvexa: 'Pengarah Teknologi & Projek',
    jawatanWakilProvexa: 'Provexa Solution',
    namaWakilKlien: 'Dato’ Azhar bin Kamaruddin',
    jawatanWakilKlien: 'Pengarah Urusan',
    status: 'ditandatangani',
    tarikhDicipta: '2026-02-15T09:00:00.000Z',
  },
  {
    id: 'AGR-002',
    noPerjanjian: 'PRX-AGR-2026-002',
    jenis: 'perjanjian_servis',
    tajuk: 'Perjanjian Servis Sistem SaaS Pengurusan Pelajar EduPrime Academy',
    tarikh: '2026-01-20',
    projekId: 'PRX-PRJ-02',
    namaKlien: 'Puan Siti Hajar',
    syarikatKlien: 'EduPrime Academy',
    telefonKlien: '0198877665',
    emelKlien: 'hajar@eduprime.edu.my',
    servisTerlibat: ['saas'],
    skopTerperinci:
      'Pembangunan sistem SaaS pengurusan pendaftaran, jadual kelas, dan penjanaan invois serta notifikasi WhatsApp automatik.',
    nilaiProjek: 8500,
    jadualBayaran: {
      depositPeratus: 40,
      kemajuanPeratus: 30,
      akhirPeratus: 30,
      termaHari: 7,
    },
    tempohHariBekerja: 45,
    hadSemakanPusingan: 3,
    tempohWarantiHari: 60,
    klausaHartaIntelek:
      'Kod aplikasi teras diserahkan kepada Klien. Komponen infrastruktur mikro-servis Provexa kekal berlesen eksklusif kepada Klien untuk kegunaan sistem ini.',
    klausaKerahsiaan:
      'Kerahsiaan data pelajar dan rekod yuran akademi adalah dilindungi di bawah Akta Perlindungan Data Peribadi (PDPA 2010).',
    klausaPenamatan:
      'Penamatan notis bertulis 14 hari diperlukan sekiranya berlaku sebarang pelanggaran syarat utama perjanjian.',
    namaWakilProvexa: 'Lead Software Architect',
    jawatanWakilProvexa: 'Provexa Solution',
    namaWakilKlien: 'Puan Siti Hajar',
    jawatanWakilKlien: 'Pengarah Akademik',
    status: 'ditandatangani',
    tarikhDicipta: '2026-01-20T10:00:00.000Z',
  },
];

export const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'REM-001',
    projekId: 'PRX-PRJ-01',
    namaKlien: 'Dato’ Azhar (Mega Niaga)',
    telefonKlien: '0123456789',
    tajuk: 'Sesi UAT Akhir & Kelulusan Pelancaran Domain',
    jenis: 'semakan_klien',
    tarikh: new Date().toISOString().split('T')[0],
    masa: '15:00',
    lokasi: 'Google Meet',
    status: 'belum',
    nota: 'Sediakan checklist fungsi troli bayaran dan semak integrasi Billplz live key.',
  },
  {
    id: 'REM-002',
    projekId: 'PRX-PRJ-02',
    namaKlien: 'Puan Siti Hajar (EduPrime)',
    telefonKlien: '0198877665',
    tajuk: 'Penyerahan Invois Baki Akhir RM 2,550',
    jenis: 'kutip_bayaran',
    tarikh: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    masa: '11:00',
    lokasi: 'WhatsApp / Emel Rasmi',
    status: 'belum',
    nota: 'Keluarkan Invois Baki Akhir selepas sesi UAT pagi nanti selesai.',
  },
  {
    id: 'REM-003',
    leadId: 'PRX-LEAD-01',
    namaKlien: 'Syed Al-Attas (Logistics)',
    telefonKlien: '0124433221',
    tajuk: 'Follow-up Sebutharga Sistem SaaS Tracking Lori',
    jenis: 'followup_proposal',
    tarikh: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().split('T')[0],
    masa: '14:30',
    lokasi: 'Panggilan Telefon / WhatsApp',
    status: 'belum',
    nota: 'Tanya sekiranya ada pindaan pada skop modul integrasi GPS tracker.',
  },
  {
    id: 'REM-004',
    projekId: 'PRX-PRJ-05',
    namaKlien: 'Tuan Haji Ridzuan',
    telefonKlien: '0139988112',
    tajuk: 'Penyediaan Akhir Bahan Bengkel & Modul Promptgalerix',
    jenis: 'tarikh_akhir_projek',
    tarikh: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString().split('T')[0],
    masa: '17:00',
    lokasi: 'Pejabat Provexa Solution',
    status: 'belum',
    nota: 'Cetak 35 salinan buku panduan dan semak akses portal prompt peserta.',
  },
];

export const INITIAL_SHEET_CONFIG: GoogleSheetsConfig = {
  spreadsheetId: null,
  spreadsheetTitle: 'Provexa Solution - Data Projek & Klien',
  spreadsheetUrl: null,
  lastSyncedAt: null,
  autoSync: false,
};

// Storage Getters & Setters
export const getStoredProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return INITIAL_PROJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const existingIds = new Set(parsed.map((p: any) => p.id));
      const missing = INITIAL_PROJECTS.filter((p) => !existingIds.has(p.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return merged;
      }
      return parsed;
    }
    return INITIAL_PROJECTS;
  } catch {
    return INITIAL_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    cloudSave(STORAGE_KEYS.PROJECTS, projects);
  } catch (err) {
    console.error('Error saving projects to localStorage:', err);
  }
};

export const getStoredLeads = (): Lead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) return INITIAL_LEADS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const existingIds = new Set(parsed.map((p: any) => p.id));
      const missing = INITIAL_LEADS.filter((l) => !existingIds.has(l.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try {
          localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return merged;
      }
      return parsed;
    }
    return INITIAL_LEADS;
  } catch {
    return INITIAL_LEADS;
  }
};

export const saveStoredLeads = (leads: Lead[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
    cloudSave(STORAGE_KEYS.LEADS, leads);
  } catch (err) {
    console.error('Error saving leads to localStorage:', err);
  }
};

export const getStoredFinancialDocs = (): FinancialDoc[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FINANCIAL_DOCS);
    if (!raw) return INITIAL_FINANCIAL_DOCS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const existingIds = new Set(parsed.map((p: any) => p.id));
      const missing = INITIAL_FINANCIAL_DOCS.filter((d) => !existingIds.has(d.id));
      if (missing.length > 0) {
        const merged = [...parsed, ...missing];
        try {
          localStorage.setItem(STORAGE_KEYS.FINANCIAL_DOCS, JSON.stringify(merged));
        } catch {
          // ignore
        }
        return merged;
      }
      return parsed;
    }
    return INITIAL_FINANCIAL_DOCS;
  } catch {
    return INITIAL_FINANCIAL_DOCS;
  }
};

export const saveStoredFinancialDocs = (docs: FinancialDoc[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.FINANCIAL_DOCS, JSON.stringify(docs));
    cloudSave(STORAGE_KEYS.FINANCIAL_DOCS, docs);
  } catch (err) {
    console.error('Error saving financial docs to localStorage:', err);
  }
};

export const getStoredAgreements = (): AgreementDoc[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGREEMENTS);
    return raw ? JSON.parse(raw) : INITIAL_AGREEMENTS;
  } catch {
    return INITIAL_AGREEMENTS;
  }
};

export const saveStoredAgreements = (agreements: AgreementDoc[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.AGREEMENTS, JSON.stringify(agreements));
    cloudSave(STORAGE_KEYS.AGREEMENTS, agreements);
  } catch (err) {
    console.error('Error saving agreements to localStorage:', err);
  }
};

export const getStoredReminders = (): Reminder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return raw ? JSON.parse(raw) : INITIAL_REMINDERS;
  } catch {
    return INITIAL_REMINDERS;
  }
};

export const saveStoredReminders = (reminders: Reminder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    cloudSave(STORAGE_KEYS.REMINDERS, reminders);
  } catch (err) {
    console.error('Error saving reminders to localStorage:', err);
  }
};

export const getStoredTemplates = (): MessageTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    const list: MessageTemplate[] = raw ? JSON.parse(raw) : DEFAULT_TEMPLATES;
    return list.map((t) => ({
      ...t,
      isiKandungan: stripEmojis(t.isiKandungan || t.teks || ''),
      teks: stripEmojis(t.teks || t.isiKandungan || ''),
    }));
  } catch {
    return DEFAULT_TEMPLATES;
  }
};

export const saveStoredTemplates = (templates: MessageTemplate[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    cloudSave(STORAGE_KEYS.TEMPLATES, templates);
  } catch (err) {
    console.error('Error saving templates to localStorage:', err);
  }
};

export const getStoredSheetConfig = (): GoogleSheetsConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    return raw ? JSON.parse(raw) : INITIAL_SHEET_CONFIG;
  } catch {
    return INITIAL_SHEET_CONFIG;
  }
};

export const saveStoredSheetConfig = (config: GoogleSheetsConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
    cloudSave(STORAGE_KEYS.SHEET_CONFIG, config);
  } catch (err) {
    console.error('Error saving sheet config to localStorage:', err);
  }
};

export const getStoredServices = (): Record<string, ServiceMeta> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged: Record<string, ServiceMeta> = { ...DEFAULT_PROVEXA_SERVICES };
        for (const [k, v] of Object.entries(parsed)) {
          if (v && typeof v === 'object') {
            const val = v as Partial<ServiceMeta>;
            const defaultItem = DEFAULT_PROVEXA_SERVICES[k];
            merged[k] = {
              ...defaultItem,
              ...val,
              key: val.key || k,
              title: val.title || defaultItem?.title || k,
              shortTitle: val.shortTitle || defaultItem?.shortTitle || k,
              tagline: val.tagline || defaultItem?.tagline || '',
              description: val.description || defaultItem?.description || '',
              startingPrice:
                typeof val.startingPrice === 'number'
                  ? val.startingPrice
                  : defaultItem?.startingPrice || 1000,
              priceModel: val.priceModel || defaultItem?.priceModel || 'One-off',
              category: val.category || defaultItem?.category || 'Development',
              deliverables:
                Array.isArray(val.deliverables) && val.deliverables.length > 0
                  ? val.deliverables
                  : defaultItem?.deliverables || [
                      'Perkhidmatan berkualiti tinggi',
                      'Sokongan teknikal Provexa',
                    ],
              badgeColor: val.badgeColor || defaultItem?.badgeColor || 'indigo',
              iconName: val.iconName || defaultItem?.iconName || 'Code2',
            } as ServiceMeta;
          }
        }
        Object.assign(PROVEXA_SERVICES, merged);
        return merged;
      }
    }
  } catch (err) {
    console.error('Error reading stored services:', err);
  }
  Object.assign(PROVEXA_SERVICES, DEFAULT_PROVEXA_SERVICES);
  return { ...DEFAULT_PROVEXA_SERVICES };
};

export const saveStoredServices = (services: Record<string, ServiceMeta>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    cloudSave(STORAGE_KEYS.SERVICES, services);
    // Keep PROVEXA_SERVICES synced
    Object.keys(PROVEXA_SERVICES).forEach((k) => {
      if (!services[k]) delete PROVEXA_SERVICES[k];
    });
    Object.assign(PROVEXA_SERVICES, services);
  } catch (err) {
    console.error('Error saving services to localStorage:', err);
  }
};

export const resetStoredServices = (): Record<string, ServiceMeta> => {
  try {
    localStorage.removeItem(STORAGE_KEYS.SERVICES);
    Object.keys(PROVEXA_SERVICES).forEach((k) => {
      if (!DEFAULT_PROVEXA_SERVICES[k]) delete PROVEXA_SERVICES[k];
    });
    Object.assign(PROVEXA_SERVICES, DEFAULT_PROVEXA_SERVICES);
  } catch (err) {
    console.error('Error resetting services:', err);
  }
  return { ...DEFAULT_PROVEXA_SERVICES };
};

// ==================== INITIAL DIGITAL PRODUCTS (PROVEXA DIGITAL ASSETS & SUBSCRIPTIONS) ====================
export const INITIAL_DIGITAL_PRODUCTS: DigitalProduct[] = [
  {
    id: 'PRX-EBK-01',
    sku: 'PRX-SUB-BRANDUP4U',
    nama: 'BrandUp4u (Sistem Tulis Content, Hook & Copywriting)',
    kategori: 'sistem',
    modelJualan: 'langganan',
    tempohLangganan: 'bulanan',
    hargaRuncit: 69,
    hargaAsal: 149,
    bilanganSubscribers: 84,
    mrrBulanan: 5796,
    badgeLabel: 'Flagship',
    formatPenghantaran: 'Web Portal',
    saizFail: 'Portal Web + Kemas Kini Mingguan Notion & PDF',
    peneranganRingkas: 'Platform & sistem langganan bulanan menulis konten berimpak tinggi, 100+ formula hook pembuka selera, dan rangka kerja copywriting penukar jualan.',
    peneranganLengkap:
      'Sistem praktikal berasaskan langganan bulanan ciptaan Provexa Solution untuk usahawan, agensi, dan pencipta konten yang ingin menghasilkan konten media sosial yang konsisten mendatangkan leads dan jualan dengan sokongan kemas kini templat berterusan.',
    faedahUtama: [
      '100+ Formula Hook 3-Saat Pembuka Selera Video & Posting (TikTok, Reels & FB)',
      'Rangka Kerja Copywriting Terbukti Menjual (AIDA, PAS & Story-Offer Framework)',
      'Jadual & Kalendar Konten 30 Hari Automatik Siap Prompt',
      'Cheatsheet Skrip Call-To-Action (CTA) Berkuasa Tinggi untuk Tingkatkan Conversion',
      'Kemas Kini Templat & Bank Hook Baharu Setiap Bulan',
    ],
    pautanMuatTurun: 'https://provexasolution.com/downloads/ebook-brandup4u-content-hook-copywriting.pdf',
    kunciAksesAtauLesen: 'BUP4U-SUB-2026',
    mesejPenghantaranWhatsApp:
      'Salam sejahtera! Terima kasih melanggan *BrandUp4u (Sistem Tulis Content, Hook & Copywriting)* dari Provexa Solution.\n\nPautan Muat Turun Fail PDF & Portal Notion:\n🔗 https://provexasolution.com/downloads/ebook-brandup4u-content-hook-copywriting.pdf\n\n🔑 Kod Lesen Langganan Aktif: *BUP4U-SUB-2026*\n\nSelamat memanfaatkan formula copywriting & content ini!',
    aktif: true,
    jumlahTerjual: 84,
    targetUnit: 90,
    targetRM: 6210,
    targetSubscribers: 90,
    targetMRR: 6210,
    hadStok: null,
    ikonAtauImej: 'Sparkles',
    tarikhDicipta: '2026-01-10T08:00:00.000Z',
    tarikhDikemaskini: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'PRX-SUB-PROMPTGX',
    sku: 'PRX-SUB-PROMPTGX',
    nama: 'Prompt Galerix (Direktori Prompt AI & Direktori Automasi Agensi)',
    kategori: 'ai_prompt',
    modelJualan: 'langganan',
    tempohLangganan: 'bulanan',
    hargaRuncit: 79,
    hargaAsal: 149,
    bilanganSubscribers: 68,
    mrrBulanan: 5372,
    badgeLabel: 'Langganan AI',
    formatPenghantaran: 'Web Portal',
    saizFail: 'Akses Portal Penuh & Kemaskini Bulanan',
    peneranganRingkas: 'Akses langganan bulanan kepada 1,000+ direktori prompt AI teruji, formula arahan ChatGPT, Claude & Midjourney gred industri untuk automasi kerja.',
    peneranganLengkap:
      'Direktori komprehensif prompt AI berasaskan langganan bulanan dari Provexa Solution. Menyediakan akses portal pantas ke beribu prompt AI teruji merangkumi pembangunan software, pemasaran digital, skrip video iklan, dan automasi operasi bisnes yang dikemaskini setiap minggu.',
    faedahUtama: [
      '1,000+ Prompt Teruji & Dikemaskini Mingguan untuk ChatGPT & Claude',
      'Prompt Copywriting, Coding, Visual Midjourney & Iklan Berbayar',
      'Akses Pustaka Web Portal Pantas & Komuniti Pengguna AI',
      'Kemas Kini Formula Arahan AI Terkini Mengikut Model AI Baru',
    ],
    pautanMuatTurun: 'https://promptgalerix.provexasolution.com/portal',
    kunciAksesAtauLesen: 'PGX-PRO-SUB-2026',
    mesejPenghantaranWhatsApp:
      'Tahniah! Akaun langganan *Prompt Galerix* anda telah aktif.\n\nPautan Akses Portal Rasmi:\n🔗 https://promptgalerix.provexasolution.com/portal\n\n🔑 Kunci Lesen Langganan: *PGX-PRO-SUB-2026*\n\nSelamat meneroka pustaka prompt AI gred agensi Provexa!',
    aktif: true,
    jumlahTerjual: 68,
    targetUnit: 70,
    targetRM: 5530,
    targetSubscribers: 70,
    targetMRR: 5530,
    hadStok: null,
    ikonAtauImej: 'Cpu',
    tarikhDicipta: '2026-01-05T08:00:00.000Z',
    tarikhDikemaskini: '2026-03-01T10:00:00.000Z',
  },
  {
    id: 'PRX-EBK-02',
    sku: 'PRX-EBK-CLOSING-WA',
    nama: 'Closing Mastery WhatsApp: Formula Skrip Menukar Leads Kepada Sales',
    kategori: 'ebook',
    modelJualan: 'one_off',
    hargaRuncit: 49,
    hargaAsal: 99,
    badgeLabel: 'Best Seller',
    formatPenghantaran: 'PDF',
    saizFail: '18 MB (85 Muka Surat PDF)',
    peneranganRingkas: 'Panduan skrip perbualan WhatsApp langkah demi langkah melayan prospek, mengatasi bantahan harga, dan teknik follow-up berkesan.',
    peneranganLengkap:
      'Hilangkan rasa kekok atau takut ketika melayan WhatsApp prospek. Membongkar psikologi pembeli Malaysia, skrip responsif bila prospek bertanya "PM harga", dan cara membina keterujaan supaya prospek membuat bayaran serta-merta.',
    faedahUtama: [
      '45+ Skrip Menjawab Pertanyaan "Berapa Harga?" & "Boleh Diskaun?"',
      'Teknik Atasi Bantahan Kerap: "Tanya Pasangan", "Nanti Dulu", "Terlalu Mahal"',
      'Formula Follow-Up Lembut 3 Peringkat tanpa menjejaskan reputasi perniagaan',
      'Strategi Bina Kepercayaan Pantas dalam 3 Minit Pertama Sesi Perbualan',
    ],
    pautanMuatTurun: 'https://provexasolution.com/downloads/ebook-closing-mastery-whatsapp-provexa.pdf',
    kunciAksesAtauLesen: 'PRX-WA-CLOSE-88',
    mesejPenghantaranWhatsApp:
      'Salam! Terima kasih atas pembelian *E-Book Closing Mastery WhatsApp*. Akses fail PDF anda melalui pautan ini: https://provexasolution.com/downloads/ebook-closing-mastery-whatsapp-provexa.pdf . Kod Akses Lesen: *PRX-WA-CLOSE-88*. Semoga kemahiran closing anda melonjak!',
    aktif: true,
    jumlahTerjual: 58,
    targetUnit: 60,
    targetRM: 2940,
    hadStok: null,
    ikonAtauImej: 'BookOpen',
    tarikhDicipta: '2026-01-15T09:30:00.000Z',
    tarikhDikemaskini: '2026-02-28T14:20:00.000Z',
  },
  {
    id: 'PRX-EBK-03',
    sku: 'PRX-EBK-AI-ADS',
    nama: 'AI Ads & Growth Blueprint: Strategi Iklan Meta & TikTok Kos Rendah Hasil Tinggi',
    kategori: 'ebook',
    modelJualan: 'one_off',
    hargaRuncit: 59,
    hargaAsal: 119,
    badgeLabel: 'Edisi 2026',
    formatPenghantaran: 'PDF',
    saizFail: '28 MB (110 Muka Surat + Kalkulator Excel)',
    peneranganRingkas: 'Panduan praktikal bina kempen iklan Meta & TikTok menggunakan AI untuk analisis audiens, video winning angle & optimum ROAS.',
    peneranganLengkap:
      'Ketahui cara agensi menjalankan kempen iklan berbayar dengan bajet efisien. Merangkumi struktur kempen CBO/ABO terkini, teknik split test kreatif, prompt AI untuk menjana skrip video UGC, dan formula pengiraan margin keuntungan sebenar.',
    faedahUtama: [
      'Struktur Kempen Iklan CBO/ABO Terkini Meta & TikTok Ads 2026',
      'Formula Menentukan Angle Konten Menang (Winning Angle) Sebelum Launch Iklan',
      'Koleksi Prompt AI Menghasilkan Skrip Iklan Video UGC & Headline Memukau',
      'Spreadsheet Templat Kiraan ROAS, Kos Per Lead (CPL) & Kos Per Akuisisi (CPA)',
    ],
    pautanMuatTurun: 'https://provexasolution.com/downloads/ebook-ai-ads-growth-blueprint-2026.pdf',
    kunciAksesAtauLesen: 'PRX-ADS-AI-77',
    mesejPenghantaranWhatsApp:
      'Terima kasih atas pembelian *E-Book AI Ads & Growth Blueprint*! Muat turun panduan PDF & templat kalkulator anda di sini: https://provexasolution.com/downloads/ebook-ai-ads-growth-blueprint-2026.pdf . Lesen: *PRX-ADS-AI-77*. Selamat bersaing di fasa digital terkini!',
    aktif: true,
    jumlahTerjual: 46,
    targetUnit: 50,
    targetRM: 2950,
    hadStok: null,
    ikonAtauImej: 'Cpu',
    tarikhDicipta: '2026-02-01T11:00:00.000Z',
    tarikhDikemaskini: '2026-03-02T16:00:00.000Z',
  },
];

// ==================== INITIAL DIGITAL RETAIL ORDERS (E-BOOKS) ====================
export const INITIAL_DIGITAL_ORDERS: DigitalRetailOrder[] = [
  {
    id: 'ORD-DIG-2026-001',
    noResit: 'REC-RET-2026-001',
    produkId: 'PRX-EBK-01',
    skuProduk: 'PRX-EBK-BRANDUP4U',
    namaProduk: 'BrandUp4u (Sistem Tulis Content, Hook & Copywriting)',
    kategoriProduk: 'ebook',
    formatPenghantaran: 'PDF',
    hargaUnit: 69,
    kuantiti: 1,
    diskaun: 0,
    jumlahBayaran: 69,
    namaPembeli: 'Mohd Farhan bin Zulkifli',
    telefonPembeli: '0173344556',
    emelPembeli: 'farhan.zul@gmail.com',
    kaedahBayaran: 'duitnow_qr',
    statusBayaran: 'lunas',
    statusPenghantaran: 'dihantar',
    tarikhPesanan: '2026-03-08T09:15:00.000Z',
    tarikhPenghantaran: '2026-03-08T09:16:30.000Z',
    pautanAksesDiberi: 'https://provexasolution.com/downloads/ebook-brandup4u-content-hook-copywriting.pdf',
    kunciLesenDiberi: 'BUP4U-VIP-2026',
    notaPesanan: 'Pembeli berminat naikkan personal branding di TikTok & FB.',
    crmStatus: 'upsell_prospect',
    upsellInterest: 'BrandUP4U (Kit Identiti & Branding Korporat RM1,600)',
    lastFollowUpDate: '2026-03-10T14:00:00.000Z',
    followUpNotes: 'Dah baca Bab 2 & 3. Beliau tanya kos Provexa reka identiti logo penuh.',
  },
  {
    id: 'ORD-DIG-2026-002',
    noResit: 'REC-RET-2026-002',
    produkId: 'PRX-EBK-02',
    skuProduk: 'PRX-EBK-CLOSING-WA',
    namaProduk: 'Closing Mastery WhatsApp: Formula Skrip Menukar Leads Kepada Sales',
    kategoriProduk: 'ebook',
    formatPenghantaran: 'PDF',
    hargaUnit: 49,
    kuantiti: 1,
    diskaun: 5,
    kodKupon: 'PROMO5',
    jumlahBayaran: 44,
    namaPembeli: 'Nurul Ain binti Shamsul',
    telefonPembeli: '0198822331',
    emelPembeli: 'ain.shamsul@yahoo.com',
    kaedahBayaran: 'fpx',
    statusBayaran: 'lunas',
    statusPenghantaran: 'dihantar',
    tarikhPesanan: '2026-03-09T14:20:00.000Z',
    tarikhPenghantaran: '2026-03-09T14:22:00.000Z',
    pautanAksesDiberi: 'https://provexasolution.com/downloads/ebook-closing-mastery-whatsapp-provexa.pdf',
    kunciLesenDiberi: 'PRX-WA-CLOSE-88',
    notaPesanan: 'Peniaga telekung online. Menghadapi masalah leads banyak tapi tak bayar.',
    crmStatus: 'repeat',
    upsellInterest: 'Portal E-Commerce / Website Jualan Automatik',
    lastFollowUpDate: '2026-03-11T10:30:00.000Z',
    followUpNotes: 'Skrip closing berjaya bantu close 8 tempahan semalam. Sedia ditawarkan E-Book BrandUp4u.',
  },
  {
    id: 'ORD-DIG-2026-003',
    noResit: 'REC-RET-2026-003',
    produkId: 'PRX-EBK-01',
    skuProduk: 'PRX-EBK-BRANDUP4U',
    namaProduk: 'BrandUp4u (Sistem Tulis Content, Hook & Copywriting)',
    kategoriProduk: 'ebook',
    formatPenghantaran: 'PDF',
    hargaUnit: 69,
    kuantiti: 1,
    diskaun: 0,
    jumlahBayaran: 69,
    namaPembeli: 'Khairul Anwar',
    telefonPembeli: '01123456789',
    emelPembeli: 'khairul.design@outlook.com',
    kaedahBayaran: 'duitnow_qr',
    statusBayaran: 'lunas',
    statusPenghantaran: 'dihantar',
    tarikhPesanan: '2026-03-10T11:45:00.000Z',
    tarikhPenghantaran: '2026-03-10T11:46:10.000Z',
    pautanAksesDiberi: 'https://provexasolution.com/downloads/ebook-brandup4u-content-hook-copywriting.pdf',
    kunciLesenDiberi: 'BUP4U-VIP-2026',
    notaPesanan: 'Freelance copywriter perlukan panduan hook video terkini.',
    crmStatus: 'vip',
    upsellInterest: 'Konsultasi Strategi Digital 1-on-1',
    lastFollowUpDate: '2026-03-11T16:00:00.000Z',
    followUpNotes: 'Sangat berpuas hati dengan senarai 100 Hook. Memberi testimoni bertulis.',
  },
  {
    id: 'ORD-DIG-2026-004',
    noResit: 'REC-RET-2026-004',
    produkId: 'PRX-EBK-03',
    skuProduk: 'PRX-EBK-AI-ADS',
    namaProduk: 'AI Ads & Growth Blueprint: Strategi Iklan Meta & TikTok Kos Rendah Hasil Tinggi',
    kategoriProduk: 'ebook',
    formatPenghantaran: 'PDF',
    hargaUnit: 59,
    kuantiti: 1,
    diskaun: 0,
    jumlahBayaran: 59,
    namaPembeli: 'Hafizuddin bin Ramli',
    telefonPembeli: '0139988776',
    emelPembeli: 'hafiz.r@bizonline.my',
    kaedahBayaran: 'stripe',
    statusBayaran: 'lunas',
    statusPenghantaran: 'dihantar',
    tarikhPesanan: '2026-03-11T16:10:00.000Z',
    tarikhPenghantaran: '2026-03-11T16:12:00.000Z',
    pautanAksesDiberi: 'https://provexasolution.com/downloads/ebook-ai-ads-growth-blueprint-2026.pdf',
    kunciLesenDiberi: 'PRX-ADS-AI-77',
    notaPesanan: 'Mempunyai agensi dropship di Shopee & TikTok Shop.',
    crmStatus: 'upsell_prospect',
    upsellInterest: 'Pengurusan Kempen Paid Ads Bulanan (RM1,500/bln)',
    lastFollowUpDate: '2026-03-12T09:00:00.000Z',
    followUpNotes: 'Berminat Provexa handle kempen Meta Ads beliau untuk elak akaun restricted.',
  },
  {
    id: 'ORD-DIG-2026-005',
    noResit: 'REC-RET-2026-005',
    produkId: 'PRX-EBK-01',
    skuProduk: 'PRX-EBK-BRANDUP4U',
    namaProduk: 'BrandUp4u (Sistem Tulis Content, Hook & Copywriting)',
    kategoriProduk: 'ebook',
    formatPenghantaran: 'PDF',
    hargaUnit: 69,
    kuantiti: 1,
    diskaun: 0,
    jumlahBayaran: 69,
    namaPembeli: 'Sarah Elena',
    telefonPembeli: '0182233445',
    emelPembeli: 'sarah.elena@boutique.com',
    kaedahBayaran: 'duitnow_qr',
    statusBayaran: 'lunas',
    statusPenghantaran: 'belum_dihantar',
    tarikhPesanan: '2026-03-12T08:05:00.000Z',
    pautanAksesDiberi: 'https://provexasolution.com/downloads/ebook-brandup4u-content-hook-copywriting.pdf',
    kunciLesenDiberi: 'BUP4U-VIP-2026',
    notaPesanan: 'Pesanan baru masuk pagi ini melalui borang web. Perlu klik hantar WhatsApp.',
    crmStatus: 'baru',
    upsellInterest: 'Pakej Pengurusan Media Sosial Retainer',
  },
];

// ==================== INITIAL DIGITAL SALES TARGET ====================
export const INITIAL_DIGITAL_SALES_TARGET: DigitalSalesTarget = {
  bulanTahun: '2026-03',
  sasaranBulananRM: 15000,
  sasaranBulananUnit: 220,
  sasaranSubscribers: 160,       // Sasaran aktif pengguna/subscribers
  sasaranMRR: 11168,             // Sasaran Nilai Bulanan Langganan (MRR)
  // Leads to Conversion Target Pipeline
  sasaranLeadsMasuk: 350,        // Sasaran bilangan leads yang masuk sebulan
  sasaranKadarConversion: 15,    // Sasaran 15% leads bertukar ke pengguna berbayar
  sasaranUserBaru: 52,           // 350 × 15% ≈ 52 user baru
  sasaranNilaiConversionRM: 3848,// 52 user × RM74 purata = RM 3,848
  purataNilaiLangganan: 74,      // Purata nilai langganan bulanan / user
  targetPerProduk: {
    'PRX-EBK-01': { targetUnit: 80, targetRM: 5520, targetSubscribers: 90, targetMRR: 6210, modelJualan: 'langganan' },       // BrandUp4u (Subscription Base)
    'PRX-SUB-PROMPTGX': { targetUnit: 60, targetRM: 4740, targetSubscribers: 70, targetMRR: 5530, modelJualan: 'langganan' }, // Prompt Galerix (Subscription Base)
    'PRX-EBK-02': { targetUnit: 50, targetRM: 2450, modelJualan: 'one_off' },       // Closing WhatsApp
    'PRX-EBK-03': { targetUnit: 30, targetRM: 1770, modelJualan: 'one_off' },       // AI Ads Blueprint
  },
  catatanStrategi:
    'Fokus kepada model langganan (subscription base) untuk BrandUp4U & Prompt Galerix. Optimumkan corong leads masuk dari WhatsApp & kempen media sosial dengan sasaran penukaran 15% (52 user baru setiap bulan) untuk memacu pertumbuhan MRR.',
  tarikhDikemaskini: '2026-03-01T08:00:00.000Z',
};

// ==================== STORAGE GETTERS & SETTERS ====================
export const getStoredDigitalProducts = (): DigitalProduct[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIGITAL_PRODUCTS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure BrandUp4U and Prompt Galerix subscription metadata are present
        let hasPromptGx = false;
        const updated: DigitalProduct[] = parsed.map((p: DigitalProduct): DigitalProduct => {
          const initMatch = INITIAL_DIGITAL_PRODUCTS.find((init) => init.id === p.id || init.sku === p.sku);
          const targetUnit = p.targetUnit || initMatch?.targetUnit || (p.modelJualan === 'langganan' ? 70 : 40);
          const targetRM = p.targetRM || initMatch?.targetRM || (targetUnit * p.hargaRuncit);

          let cleanedBadge = p.badgeLabel;
          if (cleanedBadge === 'Langganan Bulanan / Flagship') cleanedBadge = 'Flagship';
          if (cleanedBadge === 'Langganan AI / Subscription Base') cleanedBadge = 'Langganan AI';
          if (cleanedBadge === 'Tinggi Permintaan') cleanedBadge = 'Best Seller';
          if (cleanedBadge === 'Edisi AI 2026') cleanedBadge = 'Edisi 2026';

          if (p.id === 'PRX-SUB-PROMPTGX' || p.sku === 'PRX-SUB-PROMPTGX') {
            hasPromptGx = true;
            return {
              ...p,
              kategori: 'ai_prompt' as const,
              badgeLabel: cleanedBadge || 'Langganan AI',
              modelJualan: 'langganan' as const,
              tempohLangganan: 'bulanan' as const,
              bilanganSubscribers: p.bilanganSubscribers || 68,
              mrrBulanan: p.mrrBulanan || 5372,
              targetUnit,
              targetRM,
              targetSubscribers: p.targetSubscribers || targetUnit,
              targetMRR: p.targetMRR || targetRM,
            };
          }
          if (p.id === 'PRX-EBK-01' || p.sku.includes('BRANDUP4U')) {
            return {
              ...p,
              kategori: 'sistem' as const,
              badgeLabel: cleanedBadge || 'Flagship',
              modelJualan: 'langganan' as const,
              tempohLangganan: 'bulanan' as const,
              bilanganSubscribers: p.bilanganSubscribers || 84,
              mrrBulanan: p.mrrBulanan || 5796,
              targetUnit,
              targetRM,
              targetSubscribers: p.targetSubscribers || targetUnit,
              targetMRR: p.targetMRR || targetRM,
            };
          }
          return {
            ...p,
            badgeLabel: cleanedBadge,
            targetUnit,
            targetRM,
          };
        });

        if (!hasPromptGx) {
          const promptGx = INITIAL_DIGITAL_PRODUCTS.find((p) => p.id === 'PRX-SUB-PROMPTGX');
          if (promptGx) updated.splice(1, 0, promptGx);
        }

        saveStoredDigitalProducts(updated);
        return updated;
      }
    }
  } catch (err) {
    console.error('Error loading digital products from localStorage:', err);
  }
  saveStoredDigitalProducts(INITIAL_DIGITAL_PRODUCTS);
  return [...INITIAL_DIGITAL_PRODUCTS];
};

export const saveStoredDigitalProducts = (products: DigitalProduct[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIGITAL_PRODUCTS, JSON.stringify(products));
    cloudSave(STORAGE_KEYS.DIGITAL_PRODUCTS, products);
  } catch (err) {
    console.error('Error saving digital products to localStorage:', err);
  }
};

export const resetStoredDigitalProducts = (): DigitalProduct[] => {
  try {
    localStorage.removeItem(STORAGE_KEYS.DIGITAL_PRODUCTS);
  } catch (err) {
    console.error('Error resetting digital products:', err);
  }
  return [...INITIAL_DIGITAL_PRODUCTS];
};

export const getStoredDigitalOrders = (): DigitalRetailOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIGITAL_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading digital retail orders from localStorage:', err);
  }
  saveStoredDigitalOrders(INITIAL_DIGITAL_ORDERS);
  return [...INITIAL_DIGITAL_ORDERS];
};

export const saveStoredDigitalOrders = (orders: DigitalRetailOrder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIGITAL_ORDERS, JSON.stringify(orders));
    cloudSave(STORAGE_KEYS.DIGITAL_ORDERS, orders);
  } catch (err) {
    console.error('Error saving digital retail orders to localStorage:', err);
  }
};

export const getStoredDigitalSalesTarget = (): DigitalSalesTarget => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIGITAL_TARGET);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.sasaranBulananRM === 'number') {
        // Ensure default fields for subscription & leads conversion exist
        return {
          ...INITIAL_DIGITAL_SALES_TARGET,
          ...parsed,
          targetPerProduk: {
            ...INITIAL_DIGITAL_SALES_TARGET.targetPerProduk,
            ...(parsed.targetPerProduk || {}),
          },
        };
      }
    }
  } catch (err) {
    console.error('Error loading digital sales target from localStorage:', err);
  }
  saveStoredDigitalSalesTarget(INITIAL_DIGITAL_SALES_TARGET);
  return { ...INITIAL_DIGITAL_SALES_TARGET };
};

export const saveStoredDigitalSalesTarget = (target: DigitalSalesTarget): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIGITAL_TARGET, JSON.stringify(target));
    cloudSave(STORAGE_KEYS.DIGITAL_TARGET, target);
  } catch (err) {
    console.error('Error saving digital sales target to localStorage:', err);
  }
};

// ==================== INITIAL DIGITAL LEADS (PROSPEK DIGITAL) ====================
export const INITIAL_DIGITAL_LEADS: DigitalRetailLead[] = [
  {
    id: 'DLD-2026-001',
    nama: 'Irfan Hakim',
    telefon: '0173322119',
    emel: 'irfan.hakim@gmail.com',
    produkDiminatiId: 'PRX-EBK-01',
    namaProdukDiminati: 'E-Book BrandUp4u: Bina Jenama Bernilai Tinggi',
    kategoriProduk: 'ebook',
    anggaranNilai: 69,
    status: 'tunggu_bayaran',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    nota: 'Tanya pautan DuitNow QR untuk bayaran. Mahu baca bab 3 formula USP & brand positioning.',
    kiraanFollowup: 1,
    tarikhFollowupTerakhir: '2026-03-10T14:30:00.000Z',
    tarikhDicipta: '2026-03-09T10:15:00.000Z',
  },
  {
    id: 'DLD-2026-002',
    nama: 'Nurul Ain Shamimi',
    telefon: '0189922441',
    emel: 'ain.shamimi@yahoo.com',
    produkDiminatiId: 'PRX-EBK-02',
    namaProdukDiminati: 'E-Book Skrip Closing WhatsApp Pantas',
    kategoriProduk: 'ebook',
    anggaranNilai: 49,
    status: 'dihubungi',
    sumber: 'iklan_tiktok',
    keutamaan: 'sederhana',
    nota: 'Prospek dari video TikTok. Minat skrip follow-up pelanggan senyap. Mahu diskaun pelajar.',
    kiraanFollowup: 1,
    tarikhFollowupTerakhir: '2026-03-10T18:00:00.000Z',
    tarikhDicipta: '2026-03-10T09:00:00.000Z',
  },
  {
    id: 'DLD-2026-003',
    nama: 'Ahmad Faizudin',
    telefon: '0112233887',
    emel: 'faizudin@bizpoint.my',
    produkDiminatiId: 'PRX-EBK-03',
    namaProdukDiminati: 'AI Ads Blueprint: Meta & TikTok Ads 2026',
    kategoriProduk: 'ebook',
    anggaranNilai: 59,
    status: 'baru',
    sumber: 'borang_web',
    keutamaan: 'tinggi',
    nota: 'Muat turun bab pengenalan percuma dari etalase. Ingin tahu sama ada ada group support perbincangan prompt AI.',
    kiraanFollowup: 0,
    tarikhDicipta: '2026-03-11T16:20:00.000Z',
  },
  {
    id: 'DLD-2026-004',
    nama: 'Syazwani Zulkifli',
    telefon: '0134455667',
    emel: 'wani@glowbeauty.com.my',
    namaProdukDiminati: 'Pakej Kombo E-Book Usahawan Digital',
    kategoriProduk: 'ebook',
    anggaranNilai: 139,
    status: 'tanya_harga',
    sumber: 'whatsapp',
    keutamaan: 'tinggi',
    nota: 'Mahu beli kombo ketiga-tiga e-book untuk staf jualan beliau. Tanya diskaun bundle.',
    kiraanFollowup: 2,
    tarikhFollowupTerakhir: '2026-03-11T11:00:00.000Z',
    tarikhDicipta: '2026-03-08T15:00:00.000Z',
  },
  {
    id: 'DLD-2026-005',
    nama: 'Razif Mansor',
    telefon: '0198877112',
    emel: 'razif@mansortrading.com',
    produkDiminatiId: 'PRX-EBK-01',
    namaProdukDiminati: 'E-Book BrandUp4u: Bina Jenama Bernilai Tinggi',
    kategoriProduk: 'ebook',
    anggaranNilai: 69,
    status: 'berjaya',
    sumber: 'lead_magnet',
    keutamaan: 'sederhana',
    nota: 'Selesai bayar melalui FPX selepas follow-up WhatsApp. Ditukar ke pesanan rasmi.',
    kiraanFollowup: 2,
    tarikhFollowupTerakhir: '2026-03-07T12:00:00.000Z',
    tarikhDicipta: '2026-03-05T08:30:00.000Z',
    pesananIdTerkait: 'PRX-ORD-04',
  },
];

export const getStoredDigitalLeads = (): DigitalRetailLead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DIGITAL_LEADS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading digital retail leads from localStorage:', err);
  }
  saveStoredDigitalLeads(INITIAL_DIGITAL_LEADS);
  return [...INITIAL_DIGITAL_LEADS];
};

export const saveStoredDigitalLeads = (leads: DigitalRetailLead[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DIGITAL_LEADS, JSON.stringify(leads));
    cloudSave(STORAGE_KEYS.DIGITAL_LEADS, leads);
  } catch (err) {
    console.error('Error saving digital retail leads to localStorage:', err);
  }
};

export interface CloudDataSet {
  projects: Project[] | null;
  leads: Lead[] | null;
  financialDocs: FinancialDoc[] | null;
  agreements: AgreementDoc[] | null;
  reminders: Reminder[] | null;
  templates: MessageTemplate[] | null;
  sheetConfig: GoogleSheetsConfig | null;
  services: Record<string, ServiceMeta> | null;
  digitalProducts: DigitalProduct[] | null;
  digitalOrders: DigitalRetailOrder[] | null;
  digitalSalesTarget: DigitalSalesTarget | null;
  digitalLeads: DigitalRetailLead[] | null;
}

export async function loadAllFromCloud(): Promise<CloudDataSet> {
  const [
    projects, leads, financialDocs, agreements, reminders,
    templates, sheetConfig, services, digitalProducts,
    digitalOrders, digitalSalesTarget, digitalLeads,
  ] = await Promise.all([
    cloudLoad<Project[]>(STORAGE_KEYS.PROJECTS),
    cloudLoad<Lead[]>(STORAGE_KEYS.LEADS),
    cloudLoad<FinancialDoc[]>(STORAGE_KEYS.FINANCIAL_DOCS),
    cloudLoad<AgreementDoc[]>(STORAGE_KEYS.AGREEMENTS),
    cloudLoad<Reminder[]>(STORAGE_KEYS.REMINDERS),
    cloudLoad<MessageTemplate[]>(STORAGE_KEYS.TEMPLATES),
    cloudLoad<GoogleSheetsConfig>(STORAGE_KEYS.SHEET_CONFIG),
    cloudLoad<Record<string, ServiceMeta>>(STORAGE_KEYS.SERVICES),
    cloudLoad<DigitalProduct[]>(STORAGE_KEYS.DIGITAL_PRODUCTS),
    cloudLoad<DigitalRetailOrder[]>(STORAGE_KEYS.DIGITAL_ORDERS),
    cloudLoad<DigitalSalesTarget>(STORAGE_KEYS.DIGITAL_TARGET),
    cloudLoad<DigitalRetailLead[]>(STORAGE_KEYS.DIGITAL_LEADS),
  ]);
  return {
    projects, leads, financialDocs, agreements, reminders,
    templates, sheetConfig, services, digitalProducts,
    digitalOrders, digitalSalesTarget, digitalLeads,
  };
}


