import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Plus,
  Link2,
  Lock,
  Layers,
  FolderKanban,
  FileText,
  Scale,
  Users,
  ShoppingBag,
  Package,
} from 'lucide-react';
import {
  GoogleSheetsConfig,
  Lead,
  Project,
  FinancialDoc,
  AgreementDoc,
  DigitalProduct,
  DigitalRetailOrder,
} from '../types';
import {
  createCRMSpreadsheet,
  syncAllDataToSheet,
  listUserSpreadsheets,
} from '../services/googleSheets';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  accessToken: string | null;
  sheetConfig: GoogleSheetsConfig;
  onUpdateSheetConfig: (config: GoogleSheetsConfig) => void;
  leads: Lead[];
  projects?: Project[];
  financialDocs?: FinancialDoc[];
  agreements?: AgreementDoc[];
  digitalProducts?: DigitalProduct[];
  retailOrders?: DigitalRetailOrder[];
  onSignInGoogle: () => void;
  isSyncing: boolean;
  setIsSyncing: (syncing: boolean) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  sheetConfig,
  onUpdateSheetConfig,
  leads,
  projects = [],
  financialDocs = [],
  agreements = [],
  digitalProducts = [],
  retailOrders = [],
  onSignInGoogle,
  isSyncing,
  setIsSyncing,
}) => {
  const [customTitle, setCustomTitle] = useState(
    sheetConfig.spreadsheetTitle ||
      `Provexa Solution - Operasi, CRM & Projek ${new Date().getFullYear()}`
  );
  const [existingSheetInput, setExistingSheetInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [driveSheets, setDriveSheets] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);

  // Fetch user's existing spreadsheets when signed in
  useEffect(() => {
    if (accessToken && currentUser) {
      setIsLoadingDrive(true);
      listUserSpreadsheets(accessToken)
        .then((files) => setDriveSheets(files))
        .catch(() => setDriveSheets([]))
        .finally(() => setIsLoadingDrive(false));
    }
  }, [accessToken, currentUser]);

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      setErrorMessage('Sila log masuk dengan akaun Google terlebih dahulu.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await createCRMSpreadsheet(accessToken, customTitle);

      // Populate with existing data immediately across all 6 sheets
      const syncRes = await syncAllDataToSheet(accessToken, res.spreadsheetId, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts,
        retailOrders,
      });

      const updatedConfig: GoogleSheetsConfig = {
        spreadsheetId: res.spreadsheetId,
        spreadsheetTitle: res.title,
        spreadsheetUrl: res.spreadsheetUrl,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      };

      onUpdateSheetConfig(updatedConfig);
      setSuccessMessage(
        `Google Sheet "${res.title}" berjaya disambungkan! Keseluruhan ${syncRes.totalSynced} rekod (6 Tab Lengkap) telah disegerakkan.`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal mencipta Google Sheet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectExisting = async (sheetIdToUse?: string) => {
    let id = (sheetIdToUse || existingSheetInput).trim();
    if (!id) return;

    if (id.includes('/d/')) {
      const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        id = match[1];
      }
    }

    if (!accessToken) {
      setErrorMessage('Sila log masuk dengan akaun Google terlebih dahulu.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const syncRes = await syncAllDataToSheet(accessToken, id, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts,
        retailOrders,
      });

      const updatedConfig: GoogleSheetsConfig = {
        spreadsheetId: id,
        spreadsheetTitle: 'Google Sheet Operasi Provexa',
        spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`,
        lastSyncedAt: new Date().toISOString(),
        autoSync: true,
      };

      onUpdateSheetConfig(updatedConfig);
      setSuccessMessage(
        `Berjaya menyambung! ${syncRes.totalSynced} rekod merangkumi Leads, Projek, Invois, Perjanjian & Produk Digital/Retail berjaya disegerakkan!`
      );
      setExistingSheetInput('');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal menyambung ke ID spreadsheet tersebut.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSyncNow = async () => {
    if (!sheetConfig.spreadsheetId || !accessToken) {
      setErrorMessage('Tiada Google Sheet disambungkan atau sesi log masuk tamat.');
      return;
    }

    try {
      setIsSyncing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const res = await syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts,
        retailOrders,
      });

      const updatedConfig: GoogleSheetsConfig = {
        ...sheetConfig,
        lastSyncedAt: new Date().toISOString(),
      };

      onUpdateSheetConfig(updatedConfig);
      setSuccessMessage(
        `Berjaya menyegerakkan kesemua ${res.totalSynced} rekod: ${res.updatedLeads} Leads, ${res.updatedProjects} Projek, ${res.updatedDocs} Invois, ${res.updatedAgreements} Perjanjian, ${res.updatedDigitalProducts || 0} Produk Digital & ${res.updatedRetailOrders || 0} Jualan Retail!`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Segerak gagal. Sila periksa capaian.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Penyelarasan Google Sheets 360°
              </h3>
              <p className="text-xs text-slate-500">
                Segerakkan keseluruhan modul operasi (Leads, Projek, Invois, Perjanjian) ke Google Spreadsheet anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold"
          >
            &times;
          </button>
        </div>

        {/* Sync Coverage Indicator (6 Tabs) */}
        <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cakupan Segerak (6 Helaian Berasingan)</span>
            </span>
            <span className="text-emerald-700 font-bold">100% Selaras</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <Users className="w-3 h-3 text-indigo-500" />
                <span>Leads & CRM</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{leads.length}</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <FolderKanban className="w-3 h-3 text-emerald-500" />
                <span>Projek Provexa</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{projects.length}</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <FileText className="w-3 h-3 text-blue-500" />
                <span>Kewangan</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{financialDocs.length}</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <Scale className="w-3 h-3 text-purple-500" />
                <span>Perjanjian</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{agreements.length}</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <Package className="w-3 h-3 text-pink-500" />
                <span>Produk Digital</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{digitalProducts.length}</div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center space-x-1 text-slate-500 text-[10px]">
                <ShoppingBag className="w-3 h-3 text-amber-500" />
                <span>Jualan Retail</span>
              </div>
              <div className="font-extrabold text-slate-800 text-sm mt-0.5">{retailOrders.length}</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Step Check */}
        {!currentUser ? (
          <div className="mt-4 p-6 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-3.5">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xs border border-slate-200">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">
                Log Masuk Akaun Google Diperlukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                Untuk membolehkan aplikasi mencipta dan mengemaskini fail Google Sheet dalam Google Drive anda, sila log masuk dengan akaun Google Workspace.
              </p>
            </div>

            <button
              id="btn-modal-google-auth"
              onClick={onSignInGoogle}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sambung Akaun Google</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Connected Sheet Status Card */}
            {sheetConfig.spreadsheetId ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      Google Sheet Aktif
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded-md">
                    Auto-Sync (4 Tab)
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <div className="font-semibold text-slate-800">
                    {sheetConfig.spreadsheetTitle}
                  </div>
                  {sheetConfig.lastSyncedAt && (
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Segerak terakhir:{' '}
                      {new Date(sheetConfig.lastSyncedAt).toLocaleTimeString('ms-MY')}{' '}
                      ({new Date(sheetConfig.lastSyncedAt).toLocaleDateString('ms-MY')})
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {sheetConfig.spreadsheetUrl && (
                    <a
                      id="btn-open-google-sheets-tab"
                      href={sheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Google Sheet</span>
                    </a>
                  )}

                  <button
                    id="btn-manual-sync-now"
                    onClick={handleManualSyncNow}
                    disabled={isSyncing}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                    <span>{isSyncing ? 'Menyegerak...' : 'Segerak Semua Sekarang'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Belum disambungkan ke Google Sheet. Pilih salah satu pilihan di bawah untuk memulakan simpanan data secara automatik.
                </span>
              </div>
            )}

            {/* Option A: Create New Spreadsheet */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <Plus className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Cipta Fail Google Sheet Lengkap Baharu
              </span>
              <p className="text-[11px] text-slate-500">
                Sistem akan membina hamparan lengkap dengan 4 helaian berasingan: <strong>Leads & CRM</strong>, <strong>Projek Provexa</strong>, <strong>Dokumen Kewangan</strong>, dan <strong>Perjanjian Kontrak</strong>.
              </p>

              <div>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Tajuk fail Google Sheet..."
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                id="btn-create-new-sheet"
                onClick={handleCreateNewSheet}
                disabled={isSyncing}
                className="w-full flex items-center justify-center space-x-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isSyncing ? 'Sedang Memproses...' : 'Cipta & Segerak Semua Tab'}</span>
              </button>
            </div>

            {/* Option B: Link Existing or Select from Drive */}
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <Link2 className="w-3.5 h-3.5 mr-1 text-slate-600" />
                Sambung ke Spreadsheet Sedia Ada
              </span>

              {driveSheets.length > 0 && (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Pilih Dari Google Drive:
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleConnectExisting(e.target.value);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 mb-2 focus:outline-hidden"
                  >
                    <option value="">-- Pilih Fail Spreadsheet --</option>
                    {driveSheets.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={existingSheetInput}
                  onChange={(e) => setExistingSheetInput(e.target.value)}
                  placeholder="Pautan URL atau Spreadsheet ID..."
                  className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500"
                />
                <button
                  onClick={() => handleConnectExisting()}
                  disabled={isSyncing || !existingSheetInput.trim()}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-medium disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Sambung
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
