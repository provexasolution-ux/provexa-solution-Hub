import {
  Lead,
  Project,
  FinancialDoc,
  AgreementDoc,
  MessageTemplate,
  PROVEXA_SERVICES,
  ProvexaService,
} from '../types';

export type WhatsAppPlatform = 'auto' | 'web' | 'app';

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const formatWhatsAppNumber = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '6' + cleaned;
  } else if (!cleaned.startsWith('60') && cleaned.length >= 9 && cleaned.length <= 11) {
    cleaned = '60' + cleaned;
  }

  return cleaned;
};

export const displayFormattedPhone = (phone: string): string => {
  const clean = formatWhatsAppNumber(phone);
  if (clean.startsWith('60')) {
    const prefix = clean.slice(0, 4);
    const mid = clean.slice(4, 7);
    const end = clean.slice(7);
    return `+${clean.slice(0, 2)} ${clean.slice(2, 4)}-${mid} ${end}`.trim();
  }
  return phone;
};

export const stripEmojis = (str: string): string => {
  if (!str) return '';
  return str
    // Remove Unicode emojis including composite emojis, flags, symbols
    .replace(/\p{Extended_Pictographic}/gu, '')
    // Also remove variation selectors, zero-width joiners, and keycap combining marks
    .replace(/[\uFE0E\uFE0F\u200D\u20E3]/g, '')
    // Remove dingbats, misc technical & misc symbols
    .replace(/[\u2600-\u26FF\u2700-\u27BF\u2300-\u23FF\u2B50\u2B55\u{1F1E6}-\u{1F1FF}]/gu, '')
    // Remove leading space in lines that had an emoji removed at start
    .replace(/^[ \t]+(?=[*\-A-Za-z0-9])/gm, '')
    // Replace multiple spaces with single space
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
};

export const createWhatsAppUrl = (
  phone: string,
  text: string,
  platform: WhatsAppPlatform = 'auto'
): string => {
  const cleanText = stripEmojis(text);
  const formattedPhone = formatWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(cleanText);

  if (platform === 'web') {
    return `https://web.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  }

  if (platform === 'app') {
    return `whatsapp://send?phone=${formattedPhone}&text=${encodedText}`;
  }

  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
};

export const getShortName = (fullName?: string): string => {
  if (!fullName || !fullName.trim()) return 'Tuan/Puan';
  let name = fullName.trim();

  // Strip formal honorifics
  name = name.replace(
    /^(encik|en\.|puan|pn\.|cik|tuan|tn\.|dato'|datuk|datin|dr\.|dr|haji|hj\.|hjh|hajah|bro|sis)\s+/i,
    ''
  );

  // Strip patronymic
  const patronymicRegex = /\s+(bin|binti|b\.|bt\.|a\/l|a\/p|anak|s\/o|d\/o)\b.*$/i;
  name = name.replace(patronymicRegex, '').trim();

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fullName.trim();
  if (parts.length === 1) return parts[0];

  const commonPrefixes = [
    'ahmad',
    'mohd',
    'mohd.',
    'mohammad',
    'mohamad',
    'muhammad',
    'muhamad',
    'siti',
    'nur',
    'nurul',
    'wan',
    'nik',
    'raja',
    'tengku',
    'megat',
    'puteri',
    'syed',
    'sharifah',
    'che',
  ];

  const firstLower = parts[0].toLowerCase();
  if (commonPrefixes.includes(firstLower) && parts.length >= 2) {
    return parts[1];
  }

  if (parts.length === 3 && parts[0].length <= 6) {
    return `${parts[1]} ${parts[2]}`;
  }

  return parts[0];
};

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'TPL-INTRO-01',
    tajuk: 'Pengenalan & Sesi Discovery Provexa',
    kategori: 'intro',
    isiKandungan:
      `Salam {nama}, terima kasih kerana menghubungi *Provexa Solution*!\n\n` +
      `Saya ingin menyusul berkenaan minat Tuan/Puan bagi perkhidmatan *{servis_nama}*.\n\n` +
      `Boleh saya tahu secara ringkas objektif utama projek anda atau adakah anda mempunyai masa lapang sekitar 15 minit untuk panggilan santai / Google Meet bagi kami fahami keperluan sistem anda?`,
    teks:
      `Salam {nama}, terima kasih kerana menghubungi *Provexa Solution*!\n\n` +
      `Saya ingin menyusul berkenaan minat Tuan/Puan bagi perkhidmatan *{servis_nama}*.\n\n` +
      `Boleh saya tahu secara ringkas objektif utama projek anda atau adakah anda mempunyai masa lapang sekitar 15 minit untuk panggilan santai / Google Meet bagi kami fahami keperluan sistem anda?`,
  },
  {
    id: 'TPL-QUO-02',
    tajuk: 'Penyerahan Sebutharga Rasmi (Quotation)',
    kategori: 'quotation',
    isiKandungan:
      `Salam {nama},\n\n` +
      `Pihak kami di *Provexa Solution* telah menyediakan dokumen *Sebutharga Rasmi (Quotation)* bagi projek *{tajuk_projek}*.\n\n` +
      `*No. Rujukan:* {no_dokumen}\n` +
      `*Skop Servis:* {servis_nama}\n` +
      `*Jumlah Pelaburan:* RM {jumlah_keseluruhan}\n` +
      `*Tempoh Pelaksanaan:* {tempoh_anggaran}\n\n` +
      `Sila semak butiran lengkap yang dilampirkan. Sekiranya ada sebarang penyesuaian dari segi skop atau bajet, kami amat berbesar hati untuk membincangkannya semula bersama pihak Tuan/Puan.`,
    teks:
      `Salam {nama},\n\n` +
      `Pihak kami di *Provexa Solution* telah menyediakan dokumen *Sebutharga Rasmi (Quotation)* bagi projek *{tajuk_projek}*.\n\n` +
      `*No. Rujukan:* {no_dokumen}\n` +
      `*Skop Servis:* {servis_nama}\n` +
      `*Jumlah Pelaburan:* RM {jumlah_keseluruhan}\n` +
      `*Tempoh Pelaksanaan:* {tempoh_anggaran}\n\n` +
      `Sila semak butiran lengkap yang dilampirkan. Sekiranya ada sebarang penyesuaian dari segi skop atau bajet, kami amat berbesar hati untuk membincangkannya semula bersama pihak Tuan/Puan.`,
  },
  {
    id: 'TPL-AGR-03',
    tajuk: 'Perjanjian Servis & Terma Syarat (T&C)',
    kategori: 'agreement',
    isiKandungan:
      `Salam {nama},\n\n` +
      `Terima kasih atas persetujuan meneruskan projek *{tajuk_projek}* bersama *Provexa Solution*.\n\n` +
      `Berikut adalah draf *Perjanjian Perkhidmatan & Terma Syarat (T&C)* projek:\n` +
      `*No. Kontrak:* {no_perjanjian}\n` +
      `*Hak Milik Kod:* 100% Hak Milik Klien selepas pembayaran selesai\n` +
      `*Jaminan Waranti:* 30 hari bug fix percuma selepas serahan\n\n` +
      `Mohon semak dokumen perjanjian untuk pengesahan agar kerja-kerja fasa pertama boleh dimulakan dengan lancar.`,
    teks:
      `Salam {nama},\n\n` +
      `Terima kasih atas persetujuan meneruskan projek *{tajuk_projek}* bersama *Provexa Solution*.\n\n` +
      `Berikut adalah draf *Perjanjian Perkhidmatan & Terma Syarat (T&C)* projek:\n` +
      `*No. Kontrak:* {no_perjanjian}\n` +
      `*Hak Milik Kod:* 100% Hak Milik Klien selepas pembayaran selesai\n` +
      `*Jaminan Waranti:* 30 hari bug fix percuma selepas serahan\n\n` +
      `Mohon semak dokumen perjanjian untuk pengesahan agar kerja-kerja fasa pertama boleh dimulakan dengan lancar.`,
  },
  {
    id: 'TPL-INV-04',
    tajuk: 'Invois Bayaran Deposit / Kemajuan',
    kategori: 'invoice',
    isiKandungan:
      `Salam {nama},\n\n` +
      `Berikut adalah *Invois Rasmi* daripada *Provexa Solution* bagi projek *{tajuk_projek}*:\n\n` +
      `*No. Invois:* {no_dokumen}\n` +
      `*Jumlah Perlu Dibayar:* RM {jumlah_perlu_bayar}\n` +
      `*Bank:* Maybank Provexa Solution (5148-XXXX-XXXX)\n\n` +
      `Sila kongsikan resit transaksi pindahan bank di sini setelah pembayaran dibuat untuk kami kemaskini rekod sistem. Terima kasih!`,
    teks:
      `Salam {nama},\n\n` +
      `Berikut adalah *Invois Rasmi* daripada *Provexa Solution* bagi projek *{tajuk_projek}*:\n\n` +
      `*No. Invois:* {no_dokumen}\n` +
      `*Jumlah Perlu Dibayar:* RM {jumlah_perlu_bayar}\n` +
      `*Bank:* Maybank Provexa Solution (5148-XXXX-XXXX)\n\n` +
      `Sila kongsikan resit transaksi pindahan bank di sini setelah pembayaran dibuat untuk kami kemaskini rekod sistem. Terima kasih!`,
  },
  {
    id: 'TPL-REC-05',
    tajuk: 'Resit Rasmi Pembayaran Diterima',
    kategori: 'invoice',
    isiKandungan:
      `Salam {nama},\n\n` +
      `Kami mengesahkan penerimaan bayaran sebanyak *RM {jumlah_dibayar}* untuk projek *{tajuk_projek}*.\n\n` +
      `*No. Resit:* {no_dokumen}\n` +
      `*Status:* Bayaran Diterima & Disahkan\n\n` +
      `Terima kasih atas kerjasama pihak Tuan/Puan. Pasukan teknikal Provexa Solution kini sedang menggerakkan fasa seterusnya seperti yang dijadualkan.`,
    teks:
      `Salam {nama},\n\n` +
      `Kami mengesahkan penerimaan bayaran sebanyak *RM {jumlah_dibayar}* untuk projek *{tajuk_projek}*.\n\n` +
      `*No. Resit:* {no_dokumen}\n` +
      `*Status:* Bayaran Diterima & Disahkan\n\n` +
      `Terima kasih atas kerjasama pihak Tuan/Puan. Pasukan teknikal Provexa Solution kini sedang menggerakkan fasa seterusnya seperti yang dijadualkan.`,
  },
  {
    id: 'TPL-HANDOVER-06',
    tajuk: 'Penyerahan Projek & Sesi UAT',
    kategori: 'handover',
    isiKandungan:
      `Salam {nama},\n\n` +
      `Berita baik! Projek *{tajuk_projek}* telah siap untuk fasa semakan (*User Acceptance Testing - UAT*).\n\n` +
      `*Pautan Ujian / Demo:* {pautan_projek}\n\n` +
      `Sila luangkan masa untuk mencuba semua fungsi. Pihak kami menyediakan 30 hari waranti pembaikan sebarang isu teknikal bermula dari tarikh serahan rasmi ini.`,
    teks:
      `Salam {nama},\n\n` +
      `Berita baik! Projek *{tajuk_projek}* telah siap untuk fasa semakan (*User Acceptance Testing - UAT*).\n\n` +
      `*Pautan Ujian / Demo:* {pautan_projek}\n\n` +
      `Sila luangkan masa untuk mencuba semua fungsi. Pihak kami menyediakan 30 hari waranti pembaikan sebarang isu teknikal bermula dari tarikh serahan rasmi ini.`,
  },
  {
    id: 'TPL-FOLLOWUP-07',
    tajuk: 'Follow-up Santai Status Proposal',
    kategori: 'followup',
    isiKandungan:
      `Salam {nama}, apa khabar? Harap Tuan/Puan sihat sejahtera.\n\n` +
      `Saya ingin follow-up serba ringkas berkenaan perbincangan servis *{servis_nama}* sebelum ini. Adakah pihak Tuan/Puan berkesempatan menyemak cadangan yang kami hantarkan?\n\n` +
      `Sekiranya ada soalan atau inginkan penjelasan lanjut tentang teknologi yang digunakan, kami sedia membantu!`,
    teks:
      `Salam {nama}, apa khabar? Harap Tuan/Puan sihat sejahtera.\n\n` +
      `Saya ingin follow-up serba ringkas berkenaan perbincangan servis *{servis_nama}* sebelum ini. Adakah pihak Tuan/Puan berkesempatan menyemak cadangan yang kami hantarkan?\n\n` +
      `Sekiranya ada soalan atau inginkan penjelasan lanjut tentang teknologi yang digunakan, kami sedia membantu!`,
  },
];

export const interpolateTemplate = (
  template: string,
  data: {
    lead?: Partial<Lead>;
    project?: Partial<Project>;
    financialDoc?: Partial<FinancialDoc>;
    agreement?: Partial<AgreementDoc>;
    extra?: Record<string, string>;
  }
): string => {
  let message = template;
  const lead = data.lead;
  const project = data.project;
  const doc = data.financialDoc;
  const agr = data.agreement;

  const rawName = lead?.nama || project?.namaKlien || doc?.klien?.nama || agr?.namaKlien || '';
  const shortName = getShortName(rawName);
  const fullName = rawName || 'Tuan/Puan';

  message = message.replace(/\{nama\}/gi, shortName);
  message = message.replace(/\{nama_penuh\}/gi, fullName);

  const servisKey: ProvexaService | undefined =
    lead?.servisMinat || project?.servisUtama || (doc?.items?.[0]?.servisKategori as ProvexaService);
  const servisNama = servisKey ? PROVEXA_SERVICES[servisKey]?.title || servisKey : 'Penyelesaian Digital';
  message = message.replace(/\{servis_nama\}/gi, servisNama);

  const tajukProjek = project?.tajuk || doc?.tajukProjek || agr?.tajuk || `${servisNama} untuk ${shortName}`;
  message = message.replace(/\{tajuk_projek\}/gi, tajukProjek);

  const noDokumen = doc?.noDokumen || 'PRX-DOC-001';
  message = message.replace(/\{no_dokumen\}/gi, noDokumen);

  const noPerjanjian = agr?.noPerjanjian || 'PRX-AGR-001';
  message = message.replace(/\{no_perjanjian\}/gi, noPerjanjian);

  const jumlahKeseluruhan = (doc?.jumlahKeseluruhan || project?.nilaiKontrak || 0).toLocaleString('ms-MY');
  message = message.replace(/\{jumlah_keseluruhan\}/gi, jumlahKeseluruhan);

  const jumlahPerluBayar = (doc?.bakiPerluDibayar || doc?.jumlahKeseluruhan || 0).toLocaleString('ms-MY');
  message = message.replace(/\{jumlah_perlu_bayar\}/gi, jumlahPerluBayar);

  const jumlahDibayar = (doc?.jumlahDibayar || project?.jumlahDibayar || 0).toLocaleString('ms-MY');
  message = message.replace(/\{jumlah_dibayar\}/gi, jumlahDibayar);

  const tempohAnggaran = project?.tarikhSasaran ? `${project.tarikhSasaran}` : '14 - 30 hari bekerja';
  message = message.replace(/\{tempoh_anggaran\}/gi, tempohAnggaran);

  const pautanProjek = project?.pautanHasil || 'Sila rujuk pautan staging yang dihantar';
  message = message.replace(/\{pautan_projek\}/gi, pautanProjek);

  if (data.extra) {
    Object.entries(data.extra).forEach(([k, v]) => {
      message = message.replace(new RegExp(`\\{${k}\\}`, 'gi'), v);
    });
  }

  return stripEmojis(message);
};

/**
 * Generate formatted WhatsApp message for Financial Document (Quotation/Invoice/Receipt)
 */
export const formatFinancialDocForWhatsApp = (doc: FinancialDoc): string => {
  const docTypeName =
    doc.jenis === 'sebutharga' ? 'SEBUTHARGA (QUOTATION)' : doc.jenis === 'invois' ? 'INVOIS RASMI' : 'RESIT RASMI';

  let msg = `*${docTypeName} - PROVEXA SOLUTION*\n`;
  msg += `---------------------\n`;
  msg += `*No. Rujukan:* ${doc.noDokumen}\n`;
  msg += `*Tarikh:* ${doc.tarikh}\n`;
  if (doc.tarikhLuput) {
    msg += `*Sah Hingga / Tempoh:* ${doc.tarikhLuput}\n`;
  }
  msg += `*Projek:* ${doc.tajukProjek}\n`;
  msg += `*Penerima:* ${doc.klien.nama}${doc.klien.syarikat ? ` (${doc.klien.syarikat})` : ''}\n\n`;

  msg += `*RINGKASAN ITEM:*\n`;
  doc.items.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.penerangan}*\n   Qty: ${item.kuantiti} x RM ${item.hargaUnit.toLocaleString('ms-MY')} = *RM ${item.jumlah.toLocaleString('ms-MY')}*\n`;
  });

  msg += `\n---------------------\n`;
  msg += `Subtotal: RM ${doc.subtotal.toLocaleString('ms-MY')}\n`;
  if (doc.diskaun > 0) {
    msg += `Diskaun: -RM ${doc.diskaun.toLocaleString('ms-MY')}\n`;
  }
  if (doc.cukaiSstJumlah > 0) {
    msg += `SST (${doc.kadarSstPeratus}%): RM ${doc.cukaiSstJumlah.toLocaleString('ms-MY')}\n`;
  }
  msg += `*JUMLAH KESELURUHAN: RM ${doc.jumlahKeseluruhan.toLocaleString('ms-MY')}*\n`;

  if (doc.jenis === 'invois' || doc.jenis === 'resit') {
    msg += `Bayaran Telah Diterima: RM ${doc.jumlahDibayar.toLocaleString('ms-MY')}\n`;
    msg += `*BAKI PERLU DIBAYAR: RM ${doc.bakiPerluDibayar.toLocaleString('ms-MY')}*\n`;
  }

  msg += `\n*Maklumat Bank Provexa Solution:*\n`;
  msg += `Bank: ${doc.syarikatPengeluar.bankNama}\n`;
  msg += `No Akaun: ${doc.syarikatPengeluar.bankAkaun}\n`;
  msg += `Nama Akaun: ${doc.syarikatPengeluar.bankPenerima}\n\n`;

  msg += `_Dokumen dijana secara digital melalui Sistem Pengurusan Projek Provexa Solution._`;
  return stripEmojis(msg);
};

/**
 * Generate formatted WhatsApp message for Agreement / T&C
 */
export const formatAgreementForWhatsApp = (agr: AgreementDoc): string => {
  const typeName =
    agr.jenis === 'perjanjian_servis'
      ? 'PERJANJIAN PERKHIDMATAN (SERVICE CONTRACT)'
      : agr.jenis === 'terma_syarat'
      ? 'TERMA & SYARAT PROJEK'
      : agr.jenis === 'nda'
      ? 'PERJANJIAN KERAHSIAAN (NDA)'
      : 'STATEMENT OF WORK (SOW)';

  let msg = `*${typeName} - PROVEXA SOLUTION*\n`;
  msg += `---------------------\n`;
  msg += `*No. Perjanjian:* ${agr.noPerjanjian}\n`;
  msg += `*Tarikh:* ${agr.tarikh}\n`;
  msg += `*Projek:* ${agr.tajuk}\n`;
  msg += `*Pihak Klien:* ${agr.namaKlien}${agr.syarikatKlien ? ` (${agr.syarikatKlien})` : ''}\n`;
  msg += `*Penyedia Servis:* Provexa Solution (${agr.namaWakilProvexa})\n\n`;

  msg += `*SKOP KERJA:*\n${agr.skopTerperinci}\n\n`;
  msg += `*Nilai Pelaburan:* RM ${agr.nilaiProjek.toLocaleString('ms-MY')}\n`;
  msg += `*Jadual Pembayaran:*\n`;
  msg += `- Deposit Mula: ${agr.jadualBayaran.depositPeratus}%\n`;
  msg += `- Fasa Kemajuan: ${agr.jadualBayaran.kemajuanPeratus}%\n`;
  msg += `- Penyerahan Akhir: ${agr.jadualBayaran.akhirPeratus}%\n\n`;

  msg += `*Tempoh Garis Masa:* ${agr.tempohHariBekerja} Hari Bekerja\n`;
  msg += `*Had Pusingan Semakan:* ${agr.hadSemakanPusingan} pusingan semakan percuma\n`;
  msg += `*Jaminan Waranti:* ${agr.tempohWarantiHari} hari sokongan & bug fix\n`;
  msg += `*Hak Harta Intelek:* ${agr.klausaHartaIntelek}\n\n`;

  msg += `_Sila buat pengesahan balas mesej ini atau tandatangani salinan dokumen rasmi._`;
  return stripEmojis(msg);
};
