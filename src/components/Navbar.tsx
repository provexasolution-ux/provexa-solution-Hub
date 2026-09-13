import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Share2,
  LayoutDashboard,
  Users,
  Calendar,
  Sparkles,
  LogOut,
  RefreshCw,
  Car,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'leads' | 'reconStocks' | 'reminders' | 'promotions' | 'publicForm';
  setActiveTab: (tab: 'dashboard' | 'leads' | 'reconStocks' | 'reminders' | 'promotions' | 'publicForm') => void;
  currentUser: User | null;
  sheetConfig: GoogleSheetsConfig;
  onOpenGoogleModal: () => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  pendingRemindersCount: number;
  totalLeadsCount: number;
  reconStocksCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  sheetConfig,
  onOpenGoogleModal,
  onSignInGoogle,
  onSignOutGoogle,
  isSyncing,
  onManualSync,
  pendingRemindersCount,
  totalLeadsCount,
  reconStocksCount = 0,
}) => {
  const [isLeftHidden, setIsLeftHidden] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autocrm_navbar_left_hidden') === 'true';
    } catch {
      return false;
    }
  });

  const toggleLeftHidden = () => {
    setIsLeftHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('autocrm_navbar_left_hidden', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand (Boleh Hide / Collapse untuk ruang lebih luas) */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <div
              className="flex items-center space-x-2.5 cursor-pointer group select-none"
              onClick={() => setActiveTab('dashboard')}
              title="AutoCRM - Klik untuk ke Dashboard"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-xs transition-transform group-hover:scale-105">
                <span>🚗</span>
              </div>
              {!isLeftHidden && (
                <div className="transition-all duration-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900 tracking-tight">AutoCRM</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700 border border-slate-200">
                      SA KERETA
                    </span>
                    {sheetConfig.spreadsheetId && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Sheets Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 hidden 2xl:block truncate max-w-[280px]">
                    CRM Leads WhatsApp, Kiraan Loan &amp; Google Sheets
                  </p>
                </div>
              )}
            </div>

            {/* Butang Hide / Tunjuk Bahagian Kiri */}
            <button
              type="button"
              id="btn-toggle-left-navbar"
              onClick={toggleLeftHidden}
              title={
                isLeftHidden
                  ? 'Papar nama AutoCRM (Buka panel kiri)'
                  : 'Sembunyikan bahagian kiri supaya menu tidak terlalu pack'
              }
              aria-label={
                isLeftHidden
                  ? 'Papar panel kiri'
                  : 'Sembunyikan panel kiri'
              }
              className={`p-1.5 rounded-lg transition-all ${
                isLeftHidden
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {isLeftHidden ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Clean Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 shrink-0">
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              id="nav-leads-btn"
              onClick={() => setActiveTab('leads')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'leads'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Leads</span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  activeTab === 'leads' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {totalLeadsCount}
              </span>
            </button>

            <button
              id="nav-recon-stocks-btn"
              onClick={() => setActiveTab('reconStocks')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reconStocks'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Stok Rekond</span>
              {reconStocksCount > 0 && (
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    activeTab === 'reconStocks'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {reconStocksCount}
                </span>
              )}
            </button>

            <button
              id="nav-reminders-btn"
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'reminders'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Janji Temu</span>
              {pendingRemindersCount > 0 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                  {pendingRemindersCount}
                </span>
              )}
            </button>

            <button
              id="nav-promotions-btn"
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'promotions'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Promosi</span>
            </button>

            <button
              id="nav-public-form-btn"
              onClick={() => setActiveTab('publicForm')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'publicForm'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Borang Awam</span>
            </button>
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center space-x-2">
            {/* Google Sheets Pill Button */}
            <button
              id="btn-google-sheets-modal"
              onClick={onOpenGoogleModal}
              title={
                sheetConfig.spreadsheetId
                  ? `Disambung ke: ${sheetConfig.spreadsheetTitle}`
                  : 'Sambung Google Sheets untuk auto-simpan'
              }
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sheetConfig.spreadsheetId
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">
                {sheetConfig.spreadsheetId ? 'Google Sheets' : 'Sambung Sheets'}
              </span>
              {sheetConfig.spreadsheetId ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </button>

            {/* Quick Sync Button if connected */}
            {sheetConfig.spreadsheetId && (
              <button
                id="btn-quick-sync-sheets"
                onClick={onManualSync}
                disabled={isSyncing}
                title="Segerak data ke Google Sheets"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              </button>
            )}

            {/* Google Auth Status */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-200">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Pengguna'}
                    className="w-7 h-7 rounded-full border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <button
                  id="btn-google-signout"
                  onClick={onSignOutGoogle}
                  title="Log Keluar"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-google-signin"
                onClick={onSignInGoogle}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors shadow-2xs"
              >
                <span className="hidden sm:inline">Log Masuk</span>
                <span className="sm:hidden">Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-start space-x-1.5 py-2 border-t border-slate-100 overflow-x-auto text-xs no-scrollbar">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'leads' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Leads ({totalLeadsCount})
          </button>
          <button
            onClick={() => setActiveTab('reconStocks')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'reconStocks' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Stok Rekond {reconStocksCount > 0 ? `(${reconStocksCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'reminders' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Janji Temu {pendingRemindersCount > 0 ? `(${pendingRemindersCount})` : ''}
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'promotions' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Promosi
          </button>
          <button
            onClick={() => setActiveTab('publicForm')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'publicForm' ? 'bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Borang Awam
          </button>
        </div>
      </div>
    </header>
  );
};
