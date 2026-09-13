import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  LayoutDashboard,
  TrendingUp,
  FolderKanban,
  Users,
  FileText,
  Scale,
  Sparkles,
  Calendar,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  RefreshCw,
  LogOut,
  ExternalLink,
  GitBranch,
  ShoppingBag,
} from 'lucide-react';
import { GoogleSheetsConfig } from '../types';
import { ProvexaLogo } from './ProvexaLogo';

export type ActiveTabType =
  | 'dashboard'
  | 'crm'
  | 'analytics'
  | 'projects'
  | 'leads'
  | 'digitalRetail'
  | 'financialDocs'
  | 'agreements'
  | 'promotions'
  | 'reminders'
  | 'publicForm';

interface SidebarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  currentUser: User | null;
  sheetConfig: GoogleSheetsConfig;
  onOpenGoogleModal: () => void;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  pendingRemindersCount: number;
  totalLeadsCount: number;
  activePipelineCount?: number;
  activeProjectsCount?: number;
  financialDocsCount?: number;
  agreementsCount?: number;
  digitalOrdersCount?: number;
}

interface NavItem {
  id: ActiveTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
  activePipelineCount = 0,
  activeProjectsCount = 0,
  financialDocsCount = 0,
  agreementsCount = 0,
  digitalOrdersCount = 0,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('provexa_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  const handleSelectTab = (tab: ActiveTabType) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('provexa_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Clean, organized navigation groups without noisy colors
  const mainNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'crm',
      label: 'CRM & Pipeline',
      icon: GitBranch,
      count: activePipelineCount > 0 ? activePipelineCount : null,
    },
    {
      id: 'projects',
      label: 'Pengurusan Projek',
      icon: FolderKanban,
      count: activeProjectsCount > 0 ? activeProjectsCount : null,
    },
    {
      id: 'leads',
      label: 'Leads & Klien',
      icon: Users,
      count: totalLeadsCount > 0 ? totalLeadsCount : null,
    },
    {
      id: 'analytics',
      label: 'Analitik Jualan',
      icon: TrendingUp,
    },
  ];

  const retailNavItems: NavItem[] = [
    {
      id: 'digitalRetail',
      label: 'Produk Digital (Retail)',
      icon: ShoppingBag,
      count: digitalOrdersCount > 0 ? digitalOrdersCount : null,
    },
  ];

  const docNavItems: NavItem[] = [
    {
      id: 'financialDocs',
      label: 'Invois, Resit & Quo',
      icon: FileText,
      count: financialDocsCount > 0 ? financialDocsCount : null,
    },
    {
      id: 'agreements',
      label: 'Perjanjian & T&C',
      icon: Scale,
      count: agreementsCount > 0 ? agreementsCount : null,
    },
  ];

  const servicesNavItems: NavItem[] = [
    {
      id: 'promotions',
      label: 'Katalog & Servis',
      icon: Sparkles,
    },
    {
      id: 'reminders',
      label: 'Janji Temu & Sasaran',
      icon: Calendar,
      count: pendingRemindersCount > 0 ? pendingRemindersCount : null,
    },
    {
      id: 'publicForm',
      label: 'Borang Minat Awam',
      icon: Share2,
    },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="space-y-1">
      {!isCollapsed && (
        <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          {title}
        </p>
      )}
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelectTab(item.id)}
            title={isCollapsed ? item.label : undefined}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
            } py-2.5 rounded-2xl text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/95 text-indigo-700 font-bold shadow-[0_4px_16px_rgba(79,70,229,0.08)] border border-indigo-100/90 -translate-y-0.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-xs'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </div>

            {!isCollapsed && item.count !== undefined && item.count !== null && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 transition-all ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-800 shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600'
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white/60 border border-slate-200/60 shadow-2xs"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <ProvexaLogo variant="full" theme="light" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {sheetConfig.spreadsheetId && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className="p-2 rounded-xl text-slate-600 bg-white/70 border border-slate-200/60 hover:bg-white shadow-2xs transition-all"
              title="Segerak Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
          {currentUser ? (
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold overflow-hidden border border-white shadow-xs">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser.displayName?.charAt(0) || 'P'
              )}
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-medium shadow-xs transition-all"
            >
              Log Masuk
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-white/80 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center">
            <ProvexaLogo variant="full" theme="light" />
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-3 space-y-5 overflow-y-auto">
          {renderNavGroup('Utama', mainNavItems)}
          {renderNavGroup('Produk Digital & Retail', retailNavItems)}
          {renderNavGroup('Kewangan & Dokumen', docNavItems)}
          {renderNavGroup('Servis & Alat', servicesNavItems)}
        </div>

        {/* Mobile Footer */}
        <div className="p-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          {currentUser ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/70 border border-slate-100 shadow-2xs">
              <span className="truncate font-medium text-slate-700">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={onSignOutGoogle}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Log Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className="w-full py-2.5 bg-indigo-600 text-white rounded-2xl font-medium text-xs text-center shadow-xs"
            >
              Sambung Google Account
            </button>
          )}
        </div>
      </aside>

      {/* Spacer for desktop fixed sidebar to maintain content layout flow */}
      <div
        className={`hidden md:block shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-hidden="true"
      />

      {/* Desktop Sidebar (md+) - Permanently fixed & static on screen */}
      <aside
        className={`hidden md:flex flex-col bg-white/75 backdrop-blur-2xl border-r border-slate-200/60 shadow-[4px_0_30px_rgba(15,23,42,0.03)] fixed top-0 left-0 bottom-0 h-screen z-30 transition-all duration-300 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
          } border-b border-slate-100/80`}
        >
          <div className="flex items-center min-w-0">
            {isCollapsed ? (
              <ProvexaLogo className="w-9 h-9 shrink-0" variant="icon" theme="light" />
            ) : (
              <ProvexaLogo variant="full" theme="light" />
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-white/80 hover:shadow-2xs border border-transparent hover:border-slate-200/50 transition-all"
            title={isCollapsed ? 'Kembangkan Sidebar' : 'Kecilkan Sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          {renderNavGroup('Utama', mainNavItems)}
          {renderNavGroup('Produk Digital & Retail', retailNavItems)}
          {renderNavGroup('Kewangan & Dokumen', docNavItems)}
          {renderNavGroup('Servis & Operasi', servicesNavItems)}
        </div>

        {/* Desktop Footer (Clean Google Sheets & Auth info) */}
        <div className="p-3 border-t border-slate-100/80 space-y-2">
          {sheetConfig.spreadsheetId && !isCollapsed && (
            <div className="p-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-2xs flex items-center justify-between text-xs">
              <div className="truncate pr-2">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-700 truncate">
                    Google Sheets
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block truncate font-medium">
                  {sheetConfig.lastSyncedAt
                    ? `Segerak: ${new Date(sheetConfig.lastSyncedAt).toLocaleTimeString('ms-MY', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Tersambung'}
                </span>
              </div>
              <button
                type="button"
                onClick={onManualSync}
                disabled={isSyncing}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-xs transition-all shrink-0"
                title="Segerak Sekarang"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}

          {currentUser ? (
            <div
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'justify-between'
              } p-2 rounded-2xl bg-white/60 border border-white/80 shadow-2xs text-xs text-slate-600`}
            >
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs border border-white">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    currentUser.displayName?.charAt(0) || 'P'
                  )}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">
                      {currentUser.displayName || 'Admin Provexa'}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  type="button"
                  onClick={onSignOutGoogle}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
                  title="Log Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            !isCollapsed && (
              <button
                type="button"
                onClick={onOpenGoogleModal}
                className="w-full py-2.5 px-3 bg-white/80 hover:bg-white text-slate-700 font-semibold text-xs rounded-2xl border border-slate-200/60 shadow-2xs hover:shadow-xs flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>Sambung Google</span>
              </button>
            )
          )}
        </div>
      </aside>
    </>
  );
};
