import {
  Lead,
  Project,
  FinancialDoc,
  AgreementDoc,
  PROVEXA_SERVICES,
  ProvexaService,
  DigitalProduct,
  DigitalRetailOrder,
} from '../types';

export const SHEET_HEADERS_LEADS = [
  'ID Lead',
  'Tarikh Masuk',
  'Nama Klien',
  'Syarikat',
  'No. WhatsApp',
  'Emel',
  'Servis Minat',
  'Anggaran Bajet (RM)',
  'Status Lead',
  'Garis Masa Sasaran',
  'Sumber Lead',
  'Tarikh Janji Temu / Sesi',
  'ID Projek Terkait',
  'Jumlah Follow-up',
  'Tarikh Follow-up Terakhir',
  'Nota & Keperluan Projek',
];

// Alias for backward compatibility
export const SHEET_HEADERS = SHEET_HEADERS_LEADS;

export const SHEET_HEADERS_PROJECTS = [
  'ID Projek',
  'Kod Projek',
  'Tajuk Projek',
  'Nama Klien',
  'Syarikat',
  'No. Telefon',
  'Emel',
  'Servis Utama',
  'Servis Tambahan',
  'Status Projek',
  'Keutamaan',
  'Kemajuan (%)',
  'Nilai Kontrak (RM)',
  'Jumlah Dibayar (RM)',
  'Baki Tertunggak (RM)',
  'Tarikh Mula',
  'Tarikh Sasaran',
  'Bil. Milestone',
  'Pautan Hasil',
  'No. Invois Terkait',
  'No. Perjanjian Terkait',
  'Nota Projek',
];

export const SHEET_HEADERS_FINANCIAL = [
  'ID Dokumen',
  'No. Rujukan',
  'Jenis Dokumen',
  'Tajuk Projek',
  'Nama Klien',
  'Syarikat',
  'No. Telefon',
  'Emel',
  'Tarikh Dokumen',
  'Tarikh Luput',
  'Jumlah Kasar (RM)',
  'Diskaun (RM)',
  'SST/Cukai (RM)',
  'Jumlah Bersih (RM)',
  'Status Bayaran',
  'Baki Belum Bayar (RM)',
  'Syarat Bayaran',
  'ID Projek Terkait',
];

export const SHEET_HEADERS_AGREEMENTS = [
  'ID Perjanjian',
  'No. Perjanjian',
  'Jenis Perjanjian',
  'Tajuk Perjanjian',
  'Pihak Kedua (Klien)',
  'Syarikat Klien',
  'No. Telefon',
  'Emel',
  'Nilai Kontrak (RM)',
  'Status Perjanjian',
  'Tarikh Berkuatkuasa',
  'Tarikh Tamat',
  'ID Projek / Quo Rujukan',
  'Nota & Terma Khas',
];

export const SHEET_HEADERS_DIGITAL_PRODUCTS = [
  'ID Produk',
  'SKU',
  'Nama Produk',
  'Kategori',
  'Harga Runcit (RM)',
  'Harga Asal (RM)',
  'Format Penghantaran',
  'Saiz Fail / Info',
  'Jumlah Terjual',
  'Status Aktif',
  'Pautan Muat Turun',
  'Kunci Lesen / Akses',
  'Badge Label',
  'Tarikh Dicipta',
];

export const SHEET_HEADERS_RETAIL_ORDERS = [
  'ID Pesanan',
  'No. Resit',
  'Nama Produk',
  'SKU',
  'Format',
  'Nama Pembeli',
  'No Telefon',
  'Emel',
  'Kaedah Bayaran',
  'Harga Unit (RM)',
  'Kuantiti',
  'Diskaun (RM)',
  'Jumlah Bayaran (RM)',
  'Status Bayaran',
  'Status Penghantaran',
  'Tarikh Pesanan',
  'Tarikh Dihantar',
  'Kunci Lesen Diberi',
  'Nota Pesanan',
];

export const formatDigitalProductToRow = (p: DigitalProduct): (string | number)[] => [
  p.id,
  p.sku,
  p.nama,
  p.kategori.toUpperCase(),
  p.hargaRuncit,
  p.hargaAsal || 0,
  p.formatPenghantaran,
  p.saizFail || '-',
  p.jumlahTerjual,
  p.aktif ? 'AKTIF' : 'TIDAK AKTIF',
  p.pautanMuatTurun,
  p.kunciAksesAtauLesen || '-',
  p.badgeLabel || '-',
  p.tarikhDicipta || '-',
];

export const formatRetailOrderToRow = (o: DigitalRetailOrder): (string | number)[] => [
  o.id,
  o.noResit,
  o.namaProduk,
  o.skuProduk,
  o.formatPenghantaran,
  o.namaPembeli,
  o.telefonPembeli,
  o.emelPembeli || '-',
  o.kaedahBayaran.toUpperCase(),
  o.hargaUnit,
  o.kuantiti,
  o.diskaun || 0,
  o.jumlahBayaran,
  o.statusBayaran.toUpperCase(),
  o.statusPenghantaran.toUpperCase(),
  new Date(o.tarikhPesanan).toLocaleString('ms-MY'),
  o.tarikhPenghantaran ? new Date(o.tarikhPenghantaran).toLocaleString('ms-MY') : '-',
  o.kunciLesenDiberi || '-',
  o.notaPesanan || '-',
];

export const formatLeadToRow = (lead: Lead): (string | number)[] => {
  const serviceName =
    PROVEXA_SERVICES[lead.servisMinat as ProvexaService]?.title || lead.servisMinat || '-';

  return [
    lead.id,
    new Date(lead.tarikhDicipta).toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    lead.nama,
    lead.syarikat || '-',
    lead.telefon,
    lead.emel || '-',
    serviceName,
    lead.anggaranBajet || 0,
    lead.status.toUpperCase(),
    lead.jangkaanGarisMasa || '-',
    lead.sumber.toUpperCase(),
    lead.tarikhTemujanji
      ? `${lead.tarikhTemujanji} ${lead.masaTemujanji || ''}`.trim()
      : '-',
    lead.projekIdTerkait || '-',
    lead.kiraanFollowup || 0,
    lead.tarikhFollowupTerakhir
      ? new Date(lead.tarikhFollowupTerakhir).toLocaleDateString('ms-MY')
      : '-',
    lead.keperluanProjek || lead.nota || '-',
  ];
};

export const formatProjectToRow = (proj: Project): (string | number)[] => {
  const serviceName =
    PROVEXA_SERVICES[proj.servisUtama as ProvexaService]?.title || proj.servisUtama || '-';
  const additional = (proj.servisTambahan || [])
    .map((s) => PROVEXA_SERVICES[s]?.shortTitle || s)
    .join(', ');
  const baki = Math.max(0, proj.nilaiKontrak - (proj.jumlahDibayar || 0));

  return [
    proj.id,
    proj.kodProjek,
    proj.tajuk,
    proj.namaKlien,
    proj.syarikatKlien || '-',
    proj.telefonKlien,
    proj.emelKlien || '-',
    serviceName,
    additional || '-',
    proj.status.toUpperCase(),
    proj.keutamaan.toUpperCase(),
    proj.kemajuanPeratus,
    proj.nilaiKontrak,
    proj.jumlahDibayar || 0,
    baki,
    proj.tarikhMula,
    proj.tarikhSasaran,
    proj.milestones?.length || 0,
    proj.pautanHasil || '-',
    proj.dokumenRujukan?.invoisNo || '-',
    proj.dokumenRujukan?.perjanjianNo || '-',
    proj.nota || '-',
  ];
};

export const formatFinancialDocToRow = (doc: FinancialDoc): (string | number)[] => {
  const subtotal = doc.subtotal || doc.items?.reduce((sum, it) => sum + (it.jumlah || 0), 0) || 0;
  const discount = doc.diskaun || 0;
  const tax = doc.cukaiSstJumlah || 0;
  const total = doc.jumlahKeseluruhan || (subtotal - discount + tax);
  const baki =
    doc.bakiPerluDibayar !== undefined
      ? doc.bakiPerluDibayar
      : doc.statusBayaran === 'lunas'
      ? 0
      : total;

  return [
    doc.id,
    doc.nomborRujukan || doc.noDokumen,
    doc.jenis.toUpperCase(),
    doc.tajukProjek || '-',
    doc.klien?.nama || '-',
    doc.klien?.syarikat || '-',
    doc.klien?.telefon || '-',
    doc.klien?.emel || '-',
    doc.tarikh,
    doc.tarikhLuput || '-',
    subtotal,
    discount,
    tax,
    total,
    (doc.statusBayaran || 'belum_bayar').toUpperCase(),
    baki,
    doc.termaDanSyarat || '-',
    doc.projekId || '-',
  ];
};

export const formatAgreementToRow = (agr: AgreementDoc): (string | number)[] => {
  return [
    agr.id,
    agr.noPerjanjian || agr.nomborRujukan || '-',
    (agr.jenis || 'perjanjian_servis').toUpperCase(),
    agr.tajuk || '-',
    agr.namaKlien || '-',
    agr.syarikatKlien || '-',
    agr.telefonKlien || '-',
    agr.emelKlien || '-',
    agr.nilaiProjek || 0,
    (agr.status || 'draf').toUpperCase(),
    agr.tarikh || agr.tarikhDicipta?.split('T')[0] || '-',
    agr.tempohHariBekerja ? `${agr.tempohHariBekerja} Hari Bekerja` : '-',
    agr.projekId || '-',
    agr.skopTerperinci || '-',
  ];
};

/**
 * Cipta Google Sheet baru khas untuk keseluruhan operasi Provexa Solution (4 Tab Lengkap)
 */
export const createCRMSpreadsheet = async (
  accessToken: string,
  customTitle?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string; title: string }> => {
  const title =
    customTitle ||
    `Provexa Solution - Pengurusan Operasi, CRM & Projek ${new Date().getFullYear()}`;

  const payload = {
    properties: {
      title,
      locale: 'ms_MY',
      autoRecalc: 'ON_CHANGE',
    },
    sheets: [
      {
        properties: {
          title: 'Leads & CRM',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 18,
          },
        },
      },
      {
        properties: {
          title: 'Projek Provexa',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 24,
          },
        },
      },
      {
        properties: {
          title: 'Dokumen Kewangan',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 20,
          },
        },
      },
      {
        properties: {
          title: 'Perjanjian Kontrak',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 16,
          },
        },
      },
      {
        properties: {
          title: 'Produk Digital',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 16,
          },
        },
      },
      {
        properties: {
          title: 'Jualan Retail',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 20,
          },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Gagal mencipta Google Sheet baru');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl =
    data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Masukkan baris header ke dalam kesemua 6 helaian (batchUpdate values)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: [
          { range: "'Leads & CRM'!A1:P1", values: [SHEET_HEADERS_LEADS] },
          { range: "'Projek Provexa'!A1:V1", values: [SHEET_HEADERS_PROJECTS] },
          { range: "'Dokumen Kewangan'!A1:R1", values: [SHEET_HEADERS_FINANCIAL] },
          { range: "'Perjanjian Kontrak'!A1:N1", values: [SHEET_HEADERS_AGREEMENTS] },
          { range: "'Produk Digital'!A1:N1", values: [SHEET_HEADERS_DIGITAL_PRODUCTS] },
          { range: "'Jualan Retail'!A1:S1", values: [SHEET_HEADERS_RETAIL_ORDERS] },
        ],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
};

export interface SyncAllDataPayload {
  leads: Lead[];
  projects?: Project[];
  financialDocs?: FinancialDoc[];
  agreements?: AgreementDoc[];
  digitalProducts?: DigitalProduct[];
  retailOrders?: DigitalRetailOrder[];
}

export interface SyncResult {
  updatedLeads: number;
  updatedProjects: number;
  updatedDocs: number;
  updatedAgreements: number;
  updatedDigitalProducts?: number;
  updatedRetailOrders?: number;
  totalSynced: number;
  timestamp: string;
}

/**
 * Pastikan helaian-helaian (Sheets/Tabs) wujud di dalam Spreadsheet.
 * Jika tiada, cipta helaian baharu secara dinamik.
 */
async function ensureSheetsExist(
  accessToken: string,
  spreadsheetId: string,
  requiredSheets: string[]
): Promise<void> {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json();
    throw new Error(err.error?.message || 'Gagal membaca metadata Google Sheet.');
  }

  const metaData = await metaRes.json();
  const existingTitles = new Set(
    (metaData.sheets || []).map((s: any) => s.properties?.title)
  );

  const missing = requiredSheets.filter((title) => !existingTitles.has(title));
  if (missing.length === 0) return;

  const requests = missing.map((title) => ({
    addSheet: {
      properties: {
        title,
        gridProperties: {
          frozenRowCount: 1,
        },
      },
    },
  }));

  const addRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!addRes.ok) {
    const err = await addRes.json();
    console.warn('Gagal menambah helaian automatik:', err);
  }
}

/**
 * SEGERAK SEMUA DATA (Leads, Projek, Dokumen Kewangan, Perjanjian, Produk Digital & Jualan Retail)
 * Memastikan keseluruhan sistem terselaras 100% ke Google Sheets.
 */
export const syncAllDataToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  payload: SyncAllDataPayload
): Promise<SyncResult> => {
  const {
    leads = [],
    projects = [],
    financialDocs = [],
    agreements = [],
    digitalProducts = [],
    retailOrders = [],
  } = payload;

  const targetTabs = [
    'Leads & CRM',
    'Projek Provexa',
    'Dokumen Kewangan',
    'Perjanjian Kontrak',
    'Produk Digital',
    'Jualan Retail',
  ];

  // Pastikan tab wujud
  await ensureSheetsExist(accessToken, spreadsheetId, targetTabs);

  const leadsRows = [SHEET_HEADERS_LEADS, ...leads.map(formatLeadToRow)];
  const projectRows = [SHEET_HEADERS_PROJECTS, ...projects.map(formatProjectToRow)];
  const financialRows = [SHEET_HEADERS_FINANCIAL, ...financialDocs.map(formatFinancialDocToRow)];
  const agreementRows = [SHEET_HEADERS_AGREEMENTS, ...agreements.map(formatAgreementToRow)];
  const digitalProductRows = [SHEET_HEADERS_DIGITAL_PRODUCTS, ...digitalProducts.map(formatDigitalProductToRow)];
  const retailOrderRows = [SHEET_HEADERS_RETAIL_ORDERS, ...retailOrders.map(formatRetailOrderToRow)];

  const batchPayload = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: `'Leads & CRM'!A1:P${leadsRows.length}`, values: leadsRows },
      { range: `'Projek Provexa'!A1:V${projectRows.length}`, values: projectRows },
      { range: `'Dokumen Kewangan'!A1:R${financialRows.length}`, values: financialRows },
      { range: `'Perjanjian Kontrak'!A1:N${agreementRows.length}`, values: agreementRows },
      { range: `'Produk Digital'!A1:N${digitalProductRows.length}`, values: digitalProductRows },
      { range: `'Jualan Retail'!A1:S${retailOrderRows.length}`, values: retailOrderRows },
    ],
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batchPayload),
    }
  );

  if (!updateRes.ok) {
    // Fallback: Jika batchUpdate range ada isu nama helaian asal, cuba helaian pertama untuk leads
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Gagal mengemas kini rekod ke Google Sheets.');
  }

  const totalSynced =
    leads.length +
    projects.length +
    financialDocs.length +
    agreements.length +
    digitalProducts.length +
    retailOrders.length;

  return {
    updatedLeads: leads.length,
    updatedProjects: projects.length,
    updatedDocs: financialDocs.length,
    updatedAgreements: agreements.length,
    updatedDigitalProducts: digitalProducts.length,
    updatedRetailOrders: retailOrders.length,
    totalSynced,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Segerak semua leads ke dalam Google Sheet (Fungsi legasi dengan sokongan penuh)
 */
export const syncAllLeadsToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  leads: Lead[]
): Promise<{ updatedRows: number }> => {
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!metaRes.ok) {
    const err = await metaRes.json();
    throw new Error(err.error?.message || 'Gagal menyambung ke Google Sheet.');
  }

  const metaData = await metaRes.json();
  const sheets = metaData.sheets || [];
  const leadsSheet =
    sheets.find((s: any) => s.properties?.title === 'Leads & CRM') ||
    sheets[0];
  const sheetTitle = leadsSheet?.properties?.title || 'Sheet1';

  const rows = [SHEET_HEADERS_LEADS, ...leads.map(formatLeadToRow)];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTitle}'!A1:P${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    throw new Error(err.error?.message || 'Gagal mengemas kini data ke Google Sheet.');
  }

  return { updatedRows: leads.length };
};

/**
 * Tambah satu baris lead baru ke Google Sheet secara automatik
 */
export const appendLeadToSheet = async (
  accessToken: string,
  spreadsheetId: string,
  lead: Lead
): Promise<boolean> => {
  try {
    const metaRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!metaRes.ok) return false;
    const metaData = await metaRes.json();
    const sheets = metaData.sheets || [];
    const leadsSheet =
      sheets.find((s: any) => s.properties?.title === 'Leads & CRM') ||
      sheets[0];
    const sheetTitle = leadsSheet?.properties?.title || 'Sheet1';

    const rowData = [formatLeadToRow(lead)];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${sheetTitle}'!A:P:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rowData,
        }),
      }
    );

    return res.ok;
  } catch (err) {
    console.error('Auto-append ke Google Sheet gagal:', err);
    return false;
  }
};

/**
 * Senaraikan spreadsheet pengguna daripada Google Drive
 */
export const listUserSpreadsheets = async (
  accessToken: string
): Promise<Array<{ id: string; name: string; modifiedTime?: string }>> => {
  const query = encodeURIComponent(
    "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false"
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=modifiedTime desc&pageSize=15&fields=files(id,name,modifiedTime)`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    return [];
  }

  const data = await res.json();
  return data.files || [];
};
