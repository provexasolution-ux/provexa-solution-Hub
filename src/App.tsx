/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { Sidebar, ActiveTabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProjectsManager } from './components/ProjectsManager';
import { ProjectModal } from './components/ProjectModal';
import { FinancialDocsManager } from './components/FinancialDocsManager';
import { DocumentGeneratorModal } from './components/DocumentGeneratorModal';
import { AgreementsManager } from './components/AgreementsManager';
import { AgreementGeneratorModal } from './components/AgreementGeneratorModal';
import { LeadsManager } from './components/LeadsManager';
import { FollowUpModal } from './components/FollowUpModal';
import { RemindersView } from './components/RemindersView';
import { PromotionsManager } from './components/PromotionsManager';
import { PublicLeadForm } from './components/PublicLeadForm';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { SalesAnalyticsDashboard } from './components/SalesAnalyticsDashboard';
import { CrmPipelineView } from './components/CrmPipelineView';
import { DigitalRetailManager } from './components/DigitalRetailManager';

import {
  Project,
  Lead,
  FinancialDoc,
  AgreementDoc,
  Reminder,
  PromotionOffer,
  MessageTemplate,
  GoogleSheetsConfig,
  ProvexaService,
  DocType,
  AgreementType,
  ServiceMeta,
  DigitalProduct,
  DigitalRetailOrder,
  DigitalSalesTarget,
  DigitalRetailLead,
} from './types';

import {
  getStoredProjects,
  saveStoredProjects,
  getStoredLeads,
  saveStoredLeads,
  getStoredFinancialDocs,
  saveStoredFinancialDocs,
  getStoredAgreements,
  saveStoredAgreements,
  getStoredReminders,
  saveStoredReminders,
  getStoredTemplates,
  saveStoredTemplates,
  getStoredSheetConfig,
  saveStoredSheetConfig,
  getStoredServices,
  saveStoredServices,
  resetStoredServices,
  getStoredDigitalProducts,
  saveStoredDigitalProducts,
  resetStoredDigitalProducts,
  getStoredDigitalOrders,
  saveStoredDigitalOrders,
  getStoredDigitalSalesTarget,
  saveStoredDigitalSalesTarget,
  getStoredDigitalLeads,
  saveStoredDigitalLeads,
  loadAllFromCloud,
} from './services/storage';

import {
  initAuth,
  signInWithGoogle,
  signOutUser,
  getAccessToken,
  setAccessToken,
} from './services/firebaseAuth';

import {
  appendLeadToSheet,
  syncAllLeadsToSheet,
  syncAllDataToSheet,
} from './services/googleSheets';

import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');

  // App Data States
  const [projects, setProjects] = useState<Project[]>(getStoredProjects);
  const [leads, setLeads] = useState<Lead[]>(getStoredLeads);
  const [financialDocs, setFinancialDocs] = useState<FinancialDoc[]>(getStoredFinancialDocs);
  const [agreements, setAgreements] = useState<AgreementDoc[]>(getStoredAgreements);
  const [reminders, setReminders] = useState<Reminder[]>(getStoredReminders);
  const [promotions, setPromotions] = useState<PromotionOffer[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>(getStoredTemplates);
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetsConfig>(getStoredSheetConfig);
  const [services, setServices] = useState<Record<string, ServiceMeta>>(getStoredServices);
  const [digitalProducts, setDigitalProducts] = useState<DigitalProduct[]>(getStoredDigitalProducts);
  const [retailOrders, setRetailOrders] = useState<DigitalRetailOrder[]>(getStoredDigitalOrders);
  const [digitalSalesTarget, setDigitalSalesTarget] = useState<DigitalSalesTarget>(getStoredDigitalSalesTarget);
  const [digitalLeads, setDigitalLeads] = useState<DigitalRetailLead[]>(getStoredDigitalLeads);

  // Auth & Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(getAccessToken());
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals Management
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowupLead, setSelectedFollowupLead] = useState<Lead | null>(null);

  // Project Modal State
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [prefillProjectFromLead, setPrefillProjectFromLead] = useState<Lead | null>(null);

  // Document Generator Modal State (Invoices, Receipts, Quotations)
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<FinancialDoc | null>(null);
  const [docInitialType, setDocInitialType] = useState<DocType>('invois');
  const [prefillDocProject, setPrefillDocProject] = useState<Project | null>(null);
  const [prefillDocLead, setPrefillDocLead] = useState<Lead | null>(null);
  const [prefillDocService, setPrefillDocService] = useState<ProvexaService | undefined>(undefined);
  const [prefillDocDigitalProduct, setPrefillDocDigitalProduct] = useState<DigitalProduct | null>(null);
  const [prefillDocRetailOrder, setPrefillDocRetailOrder] = useState<DigitalRetailOrder | null>(null);

  // Agreement Generator Modal State (Agreements, T&C, NDAs)
  const [isAgreementModalOpen, setIsAgreementModalOpen] = useState(false);
  const [editingAgreement, setEditingAgreement] = useState<AgreementDoc | null>(null);
  const [agreementInitialType, setAgreementInitialType] = useState<AgreementType>('perjanjian_servis');
  const [prefillAgrProject, setPrefillAgrProject] = useState<Project | null>(null);
  const [prefillAgrLead, setPrefillAgrLead] = useState<Lead | null>(null);
  const [prefillAgrService, setPrefillAgrService] = useState<ProvexaService | undefined>(undefined);

  // Navigation Filter Presets
  const [projectStatusFilterForNav, setProjectStatusFilterForNav] = useState<string>('semua');
  const [leadStatusFilterForNav, setLeadStatusFilterForNav] = useState<string>('semua');

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'error';
  } | null>(null);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'error' = 'success') => {
      setToastMessage({ text, type });
      setTimeout(() => setToastMessage(null), 4000);
    },
    []
  );

  // Check URL parameters for ?mode=form
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode') === 'form') {
        setActiveTab('publicForm');
      }
    }
  }, []);

  // Load all data from cloud on first mount, merging over local defaults
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cloud = await loadAllFromCloud();
      if (cancelled) return;
      if (cloud.projects) { setProjects(cloud.projects); saveStoredProjects(cloud.projects); }
      if (cloud.leads) { setLeads(cloud.leads); saveStoredLeads(cloud.leads); }
      if (cloud.financialDocs) { setFinancialDocs(cloud.financialDocs); saveStoredFinancialDocs(cloud.financialDocs); }
      if (cloud.agreements) { setAgreements(cloud.agreements); saveStoredAgreements(cloud.agreements); }
      if (cloud.reminders) { setReminders(cloud.reminders); saveStoredReminders(cloud.reminders); }
      if (cloud.templates) { setTemplates(cloud.templates); saveStoredTemplates(cloud.templates); }
      if (cloud.sheetConfig) { setSheetConfig(cloud.sheetConfig); saveStoredSheetConfig(cloud.sheetConfig); }
      if (cloud.services) { setServices(cloud.services); saveStoredServices(cloud.services); }
      if (cloud.digitalProducts) { setDigitalProducts(cloud.digitalProducts); saveStoredDigitalProducts(cloud.digitalProducts); }
      if (cloud.digitalOrders) { setRetailOrders(cloud.digitalOrders); saveStoredDigitalOrders(cloud.digitalOrders); }
      if (cloud.digitalSalesTarget) { setDigitalSalesTarget(cloud.digitalSalesTarget); saveStoredDigitalSalesTarget(cloud.digitalSalesTarget); }
      if (cloud.digitalLeads) { setDigitalLeads(cloud.digitalLeads); saveStoredDigitalLeads(cloud.digitalLeads); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        if (token) {
          setTokenState(token);
          setAccessToken(token);
        }
      },
      () => {
        setCurrentUser(null);
        setTokenState(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Cross-tab real-time synchronization listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key === 'provexa_projects_v2') setProjects(getStoredProjects());
      if (e.key === 'provexa_leads_v2') setLeads(getStoredLeads());
      if (e.key === 'provexa_financial_docs_v2') setFinancialDocs(getStoredFinancialDocs());
      if (e.key === 'provexa_agreements_v2') setAgreements(getStoredAgreements());
      if (e.key === 'provexa_reminders_v2') setReminders(getStoredReminders());
      if (e.key === 'provexa_templates_v2') setTemplates(getStoredTemplates());
      if (e.key === 'provexa_services_catalog_v2') setServices(getStoredServices());
      if (e.key === 'provexa_google_sheet_config_v2') setSheetConfig(getStoredSheetConfig());
      if (e.key === 'provexa_digital_products_v2') setDigitalProducts(getStoredDigitalProducts());
      if (e.key === 'provexa_digital_orders_v2') setRetailOrders(getStoredDigitalOrders());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Periodic Auto-Sync to Google Sheets (Runs every 4 minutes if enabled)
  useEffect(() => {
    if (!sheetConfig.autoSync || !sheetConfig.spreadsheetId || !accessToken) return;
    const interval = setInterval(async () => {
      try {
        await syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
          leads,
          projects,
          financialDocs,
          agreements,
          digitalProducts,
          retailOrders,
        });
        const now = new Date().toISOString();
        setSheetConfig((prev) => {
          const next = { ...prev, lastSyncedAt: now };
          saveStoredSheetConfig(next);
          return next;
        });
      } catch (err) {
        console.warn('Periodic Google Sheets background sync error:', err);
      }
    }, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [sheetConfig.autoSync, sheetConfig.spreadsheetId, accessToken, leads, projects, financialDocs, agreements, digitalProducts, retailOrders]);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      const { user, accessToken: token } = await signInWithGoogle();
      setCurrentUser(user);
      setTokenState(token);
      showToast(`Selamat kembali, ${user.displayName || 'Pengguna'}! Akaun Google disambungkan.`);
      setIsGoogleModalOpen(true);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Log masuk Google dibatalkan atau gagal.', 'error');
    }
  };

  // Google Sign-Out Handler
  const handleGoogleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setTokenState(null);
    showToast('Akaun Google telah dilog keluar.', 'info');
  };

  // ==================== PROJECT HANDLERS ====================
  const handleSaveProject = (
    projectData: Omit<Project, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let updatedProjectsList: Project[];

    if (projectData.id) {
      // Update
      updatedProjectsList = projects.map((p) =>
        p.id === projectData.id
          ? ({ ...p, ...projectData, tarikhDikemaskini: now } as Project)
          : p
      );
      setProjects(updatedProjectsList);
      saveStoredProjects(updatedProjectsList);
      showToast(`Projek "${projectData.tajuk}" dikemaskini.`);
    } else {
      // Create
      const newProj: Project = {
        ...projectData,
        id: `PRX-PRJ-${Date.now().toString().slice(-4)}`,
        tarikhDicipta: now,
        tarikhDikemaskini: now,
      };
      updatedProjectsList = [newProj, ...projects];
      setProjects(updatedProjectsList);
      saveStoredProjects(updatedProjectsList);
      showToast(`Projek baharu "${newProj.tajuk}" berjaya dicipta!`);

      // Cross-synchronize with Lead if converted
      if (prefillProjectFromLead) {
        const leadId = prefillProjectFromLead.id;
        const updatedLeads = leads.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: 'berjaya' as const,
                projekIdTerkait: newProj.id,
                nota: `${l.nota || ''}\n[${new Date().toLocaleDateString('ms-MY')}] Ditukar ke Projek: ${newProj.kodProjek} (${newProj.tajuk})`.trim(),
                tarikhDikemaskini: now,
              }
            : l
        );
        setLeads(updatedLeads);
        saveStoredLeads(updatedLeads);
      }
    }

    // Auto-sync all 4 datasets to Google Sheets if configured
    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads,
        projects: updatedProjectsList,
        financialDocs,
        agreements,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }

    setIsProjectModalOpen(false);
    setEditingProject(null);
    setPrefillProjectFromLead(null);
  };

  const handleDeleteProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveStoredProjects(updated);
    showToast(`Projek "${proj?.tajuk || id}" telah dipadam.`, 'info');
  };

  // Convert Lead to Project
  const handleConvertLeadToProject = (lead: Lead) => {
    setPrefillProjectFromLead(lead);
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  // ==================== FINANCIAL DOCS HANDLERS ====================
  const handleSaveFinancialDoc = (
    docData: Omit<FinancialDoc, 'id' | 'tarikhDicipta'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let updatedDocsList: FinancialDoc[];
    let savedDoc: FinancialDoc;

    if (docData.id) {
      savedDoc = { ...docData, tarikhDikemaskini: now } as any;
      updatedDocsList = financialDocs.map((d) =>
        d.id === docData.id ? ({ ...d, ...docData } as FinancialDoc) : d
      );
      showToast(`Dokumen "${docData.nomborRujukan}" dikemaskini.`);
    } else {
      savedDoc = {
        ...docData,
        id: `PRX-DOC-${Date.now().toString().slice(-4)}`,
        tarikhDicipta: now,
      };
      updatedDocsList = [savedDoc, ...financialDocs];
      showToast(
        `${savedDoc.jenis.toUpperCase()} "${savedDoc.nomborRujukan}" berjaya dijana!`
      );
    }
    setFinancialDocs(updatedDocsList);
    saveStoredFinancialDocs(updatedDocsList);

    // Cross-sync: Update associated Project document reference and collected payments
    const targetProjId = savedDoc.projekId || prefillDocProject?.id;
    let currentProjects = projects;
    if (targetProjId) {
      currentProjects = projects.map((p) => {
        if (p.id !== targetProjId) return p;
        const docRef = { ...(p.dokumenRujukan || {}) };
        if (savedDoc.jenis === 'invois') {
          docRef.invoisNo = savedDoc.nomborRujukan || savedDoc.noDokumen;
        } else if (savedDoc.jenis === 'sebutharga') {
          docRef.sebuthargaNo = savedDoc.nomborRujukan || savedDoc.noDokumen;
        }

        // Synchronize paid amount if receipt or paid invoice
        let extraPayment = p.jumlahDibayar || 0;
        if (savedDoc.jenis === 'resit' && !docData.id) {
          extraPayment = Math.min(
            p.nilaiKontrak,
            extraPayment + (savedDoc.jumlahDibayar || savedDoc.jumlahKeseluruhan || 0)
          );
        } else if (savedDoc.jenis === 'invois' && savedDoc.statusBayaran === 'lunas' && !docData.id) {
          extraPayment = Math.min(
            p.nilaiKontrak,
            Math.max(extraPayment, savedDoc.jumlahKeseluruhan || 0)
          );
        }

        return {
          ...p,
          dokumenRujukan: docRef,
          jumlahDibayar: extraPayment,
          tarikhDikemaskini: now,
        };
      });
      setProjects(currentProjects);
      saveStoredProjects(currentProjects);
    }

    // Cross-sync: If Quotation issued for a Lead, advance Lead status
    let currentLeads = leads;
    const targetLeadId = prefillDocLead?.id;
    if (targetLeadId) {
      currentLeads = leads.map((l) => {
        if (l.id !== targetLeadId) return l;
        const shouldAdvance =
          l.status === 'baru' || l.status === 'dihubungi' || l.status === 'sesi_discovery';
        return {
          ...l,
          status: shouldAdvance ? ('sebutharga_dihantar' as const) : l.status,
          tarikhDikemaskini: now,
          nota: `${l.nota || ''}\n[${new Date().toLocaleDateString('ms-MY')}] ${savedDoc.jenis.toUpperCase()} ${savedDoc.nomborRujukan} dijana.`.trim(),
        };
      });
      setLeads(currentLeads);
      saveStoredLeads(currentLeads);
    }

    // Auto-sync all 4 datasets to Google Sheets if configured
    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads: currentLeads,
        projects: currentProjects,
        financialDocs: updatedDocsList,
        agreements,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }

    setIsDocModalOpen(false);
    setEditingDoc(null);
    setPrefillDocProject(null);
    setPrefillDocLead(null);
    setPrefillDocService(undefined);
    setPrefillDocDigitalProduct(null);
    setPrefillDocRetailOrder(null);
  };

  const handleDeleteFinancialDoc = (id: string) => {
    const doc = financialDocs.find((d) => d.id === id);
    const updated = financialDocs.filter((d) => d.id !== id);
    setFinancialDocs(updated);
    saveStoredFinancialDocs(updated);
    showToast(`Dokumen "${doc?.nomborRujukan || id}" dipadam.`, 'info');
  };

  // Open Doc Generator with Project prefill
  const handleOpenDocForProject = (project: Project, type: DocType) => {
    setPrefillDocProject(project);
    setPrefillDocLead(null);
    setPrefillDocService(project.servisUtama);
    setPrefillDocDigitalProduct(null);
    setPrefillDocRetailOrder(null);
    setDocInitialType(type);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  // Open Doc Generator with Lead prefill
  const handleOpenDocForLead = (lead: Lead, type: DocType = 'sebutharga') => {
    setPrefillDocLead(lead);
    setPrefillDocProject(null);
    setPrefillDocService(lead.servisMinat);
    setPrefillDocDigitalProduct(null);
    setPrefillDocRetailOrder(null);
    setDocInitialType(type);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  // Open Doc Generator from 8 Services Catalog
  const handleOpenDocForService = (serviceKey: ProvexaService) => {
    setPrefillDocLead(null);
    setPrefillDocProject(null);
    setPrefillDocService(serviceKey);
    setPrefillDocDigitalProduct(null);
    setPrefillDocRetailOrder(null);
    setDocInitialType('sebutharga');
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  // Open Doc Generator from Digital Product
  const handleOpenDocForDigitalProduct = (product: DigitalProduct, type: DocType = 'sebutharga') => {
    setPrefillDocLead(null);
    setPrefillDocProject(null);
    setPrefillDocService(undefined);
    setPrefillDocDigitalProduct(product);
    setPrefillDocRetailOrder(null);
    setDocInitialType(type);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  // Open Doc Generator from Retail Order
  const handleOpenDocForRetailOrder = (order: DigitalRetailOrder, type: DocType = 'resit') => {
    setPrefillDocLead(null);
    setPrefillDocProject(null);
    setPrefillDocService(undefined);
    setPrefillDocDigitalProduct(null);
    setPrefillDocRetailOrder(order);
    setDocInitialType(type);
    setEditingDoc(null);
    setIsDocModalOpen(true);
  };

  // ==================== AGREEMENT HANDLERS ====================
  const handleSaveAgreement = (
    agrData: Omit<AgreementDoc, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let updatedAgreementsList: AgreementDoc[];
    let savedAgr: AgreementDoc;

    if (agrData.id) {
      savedAgr = { ...agrData, tarikhDikemaskini: now } as AgreementDoc;
      updatedAgreementsList = agreements.map((a) =>
        a.id === agrData.id ? savedAgr : a
      );
      showToast(
        `Perjanjian "${savedAgr.noPerjanjian || savedAgr.nomborRujukan || savedAgr.tajuk}" dikemaskini.`
      );
    } else {
      savedAgr = {
        ...agrData,
        id: `PRX-AGR-${Date.now().toString().slice(-4)}`,
        tarikhDicipta: now,
        tarikhDikemaskini: now,
      };
      updatedAgreementsList = [savedAgr, ...agreements];
      showToast(
        `Perjanjian "${savedAgr.noPerjanjian || savedAgr.nomborRujukan || savedAgr.tajuk}" berjaya dijana!`
      );
    }
    setAgreements(updatedAgreementsList);
    saveStoredAgreements(updatedAgreementsList);

    // Cross-sync: Update associated Project document reference
    const targetProjId = savedAgr.projekId || prefillAgrProject?.id;
    let currentProjects = projects;
    if (targetProjId) {
      currentProjects = projects.map((p) => {
        if (p.id !== targetProjId) return p;
        return {
          ...p,
          dokumenRujukan: {
            ...(p.dokumenRujukan || {}),
            perjanjianNo: savedAgr.noPerjanjian || savedAgr.nomborRujukan,
          },
          tarikhDikemaskini: now,
        };
      });
      setProjects(currentProjects);
      saveStoredProjects(currentProjects);
    }

    // Cross-sync: Update Lead status if agreement is generated
    let currentLeads = leads;
    const targetLeadId = prefillAgrLead?.id;
    if (targetLeadId) {
      currentLeads = leads.map((l) => {
        if (l.id !== targetLeadId) return l;
        return {
          ...l,
          status:
            savedAgr.status === 'ditandatangani' || savedAgr.status === 'dipersetujui'
              ? ('tunggu_deposit' as const)
              : l.status,
          tarikhDikemaskini: now,
          nota: `${l.nota || ''}\n[${new Date().toLocaleDateString('ms-MY')}] Dokumen perjanjian ${savedAgr.noPerjanjian || savedAgr.nomborRujukan} dijana.`.trim(),
        };
      });
      setLeads(currentLeads);
      saveStoredLeads(currentLeads);
    }

    // Auto-sync all 4 datasets to Google Sheets if configured
    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads: currentLeads,
        projects: currentProjects,
        financialDocs,
        agreements: updatedAgreementsList,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }

    setIsAgreementModalOpen(false);
    setEditingAgreement(null);
    setPrefillAgrProject(null);
    setPrefillAgrLead(null);
  };

  const handleDeleteAgreement = (id: string) => {
    const agr = agreements.find((a) => a.id === id);
    const updated = agreements.filter((a) => a.id !== id);
    setAgreements(updated);
    saveStoredAgreements(updated);
    showToast(`Dokumen perjanjian "${agr?.noPerjanjian || agr?.nomborRujukan || id}" berjaya dipadam.`, 'info');
  };

  const handleUpdateAgreementStatus = (
    id: string,
    status: AgreementDoc['status']
  ) => {
    const updated = agreements.map((a) =>
      a.id === id ? ({ ...a, status, tarikhDikemaskini: new Date().toISOString() } as AgreementDoc) : a
    );
    setAgreements(updated);
    saveStoredAgreements(updated);
    const agr = agreements.find((a) => a.id === id);
    showToast(`Status perjanjian "${agr?.noPerjanjian || agr?.nomborRujukan || id}" ditukar kepada "${status}".`);
  };

  // Open Agreement for Project
  const handleOpenAgreementForProject = (project: Project, type: AgreementType = 'perjanjian_servis') => {
    setPrefillAgrProject(project);
    setPrefillAgrLead(null);
    setPrefillAgrService(project.servisUtama);
    setAgreementInitialType(type);
    setEditingAgreement(null);
    setIsAgreementModalOpen(true);
  };

  // Open Agreement for Lead
  const handleOpenAgreementForLead = (lead: Lead, type: AgreementType = 'terma_syarat') => {
    setPrefillAgrLead(lead);
    setPrefillAgrProject(null);
    setPrefillAgrService(lead.servisMinat);
    setAgreementInitialType(type);
    setEditingAgreement(null);
    setIsAgreementModalOpen(true);
  };

  // Open Agreement from 8 Services Catalog
  const handleOpenAgreementForService = (serviceKey: ProvexaService) => {
    setPrefillAgrLead(null);
    setPrefillAgrProject(null);
    setPrefillAgrService(serviceKey);
    setAgreementInitialType('terma_syarat');
    setEditingAgreement(null);
    setIsAgreementModalOpen(true);
  };

  // ==================== LEADS HANDLERS ====================
  const handleAddLead = async (
    newLeadData: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'>
  ) => {
    const timestamp = new Date().toISOString();
    const newLead: Lead = {
      ...newLeadData,
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      tarikhDicipta: timestamp,
      tarikhDikemaskini: timestamp,
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    saveStoredLeads(updatedLeads);

    // Auto-create reminder if appointment date was given
    if (newLead.tarikhTemujanji) {
      const newReminder: Reminder = {
        id: `REM-${Date.now().toString().slice(-4)}`,
        leadId: newLead.id,
        namaPelanggan: newLead.nama,
        telefonPelanggan: newLead.telefon,
        jenis: 'sesi_rundingan',
        tajuk: `Discovery: ${newLead.nama} (${newLead.servisMinat})`,
        tarikh: newLead.tarikhTemujanji,
        masa: newLead.masaTemujanji || '11:00',
        status: 'belum',
        nota: newLead.notaTemujanji || newLead.nota,
        selesai: false,
      };
      const updatedReminders = [newReminder, ...reminders];
      setReminders(updatedReminders);
      saveStoredReminders(updatedReminders);
    }

    showToast(`Lead baharu "${newLead.nama}" berjaya disimpan!`);

    // Auto-sync to Google Sheets if configured
    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      try {
        setIsSyncing(true);
        await syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
          leads: updatedLeads,
          projects,
          financialDocs,
          agreements,
        });
        const updatedConfig = {
          ...sheetConfig,
          lastSyncedAt: new Date().toISOString(),
        };
        setSheetConfig(updatedConfig);
        saveStoredSheetConfig(updatedConfig);
      } catch (err) {
        console.error('Auto-sync append error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleUpdateLead = async (updatedLead: Lead) => {
    const updatedLeads = leads.map((l) => (l.id === updatedLead.id ? updatedLead : l));
    setLeads(updatedLeads);
    saveStoredLeads(updatedLeads);
    showToast(`Maklumat lead "${updatedLead.nama}" dikemaskini.`);

    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      try {
        setIsSyncing(true);
        await syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
          leads: updatedLeads,
          projects,
          financialDocs,
          agreements,
        });
        const updatedConfig = {
          ...sheetConfig,
          lastSyncedAt: new Date().toISOString(),
        };
        setSheetConfig(updatedConfig);
        saveStoredSheetConfig(updatedConfig);
      } catch (err) {
        console.error('Auto-sync error:', err);
      } finally {
        setIsSyncing(false);
      }
    }
  };

  const handleDeleteLead = (id: string) => {
    const updatedLeads = leads.filter((l) => l.id !== id);
    setLeads(updatedLeads);
    saveStoredLeads(updatedLeads);
    showToast('Lead berjaya dipadam.', 'info');
  };

  const handleBulkAddLeads = (
    newLeads: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'>[]
  ) => {
    const now = new Date().toISOString();
    const toAdd: Lead[] = newLeads.map((data, i) => ({
      ...data,
      id: `LEAD-${Date.now().toString().slice(-4)}-${i}`,
      tarikhDicipta: now,
      tarikhDikemaskini: now,
    }));
    const updatedLeads = [...toAdd, ...leads];
    setLeads(updatedLeads);
    saveStoredLeads(updatedLeads);
    showToast(`${toAdd.length} leads berjaya diimport dari CSV!`);

    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads: updatedLeads,
        projects,
        financialDocs,
        agreements,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }
  };

  const handleRecordFollowUp = (leadId: string, customNote?: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead: Lead = {
      ...lead,
      kiraanFollowup: (lead.kiraanFollowup || 0) + 1,
      tarikhFollowupTerakhir: new Date().toISOString(),
      status: lead.status === 'baru' ? 'dihubungi' : lead.status,
      nota: customNote
        ? `${lead.nota || ''}\n[${new Date().toLocaleDateString('ms-MY')}] ${customNote}`
        : lead.nota,
      tarikhDikemaskini: new Date().toISOString(),
    };

    handleUpdateLead(updatedLead);
    setIsFollowupModalOpen(false);
  };

  const handleScheduleReminder = (
    lead: Lead,
    type: any,
    date: string,
    time: string,
    title: string
  ) => {
    const newRem: Reminder = {
      id: `REM-${Date.now().toString().slice(-4)}`,
      leadId: lead.id,
      namaPelanggan: lead.nama,
      telefonPelanggan: lead.telefon,
      jenis: type,
      tajuk: title,
      tarikh: date,
      masa: time,
      status: 'belum',
      selesai: false,
    };

    const updated = [newRem, ...reminders];
    setReminders(updated);
    saveStoredReminders(updated);
    showToast(`Peringatan untuk "${lead.nama}" berjaya dijadualkan.`);
  };

  // Reminders Actions
  const handleUpdateReminderStatus = (id: string, status: 'belum' | 'selesai' | 'dibatalkan') => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, status, selesai: status === 'selesai' } : r
    );
    setReminders(updated);
    saveStoredReminders(updated);
    showToast('Status janji temu dikemaskini.');
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveStoredReminders(updated);
    showToast('Peringatan dipadam.', 'info');
  };

  const handleManualSync = async () => {
    if (!sheetConfig.spreadsheetId) {
      showToast('Penyelarasan setempat berjaya. Sila sambung Google Sheet untuk storan awan.', 'info');
      setIsGoogleModalOpen(true);
      return;
    }

    if (!accessToken) {
      showToast('Sila log masuk Google untuk menyegerakkan data.', 'error');
      setIsGoogleModalOpen(true);
      return;
    }

    try {
      setIsSyncing(true);
      const res = await syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts,
        retailOrders,
      });
      const updatedConfig = {
        ...sheetConfig,
        lastSyncedAt: new Date().toISOString(),
      };
      setSheetConfig(updatedConfig);
      saveStoredSheetConfig(updatedConfig);
      showToast(
        `Semua data berjaya disegerakkan (${res.totalSynced} rekod): ${res.updatedLeads} Leads, ${res.updatedProjects} Projek, ${res.updatedDocs} Invois, ${res.updatedAgreements} Perjanjian, ${res.updatedDigitalProducts || 0} Produk Digital & ${res.updatedRetailOrders || 0} Jualan Retail!`
      );
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Segerak gagal.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // ==================== DIGITAL PRODUCTS & RETAIL HANDLERS ====================
  const handleSaveDigitalProduct = (
    productData: Omit<DigitalProduct, 'id' | 'tarikhDicipta'> & { id?: string },
    silent = false
  ) => {
    const now = new Date().toISOString();
    let updatedList: DigitalProduct[];

    if (productData.id) {
      updatedList = digitalProducts.map((p) =>
        p.id === productData.id ? ({ ...p, ...productData } as DigitalProduct) : p
      );
      if (!silent) {
        showToast(`Produk digital "${productData.nama}" berjaya dikemaskini.`);
      }
    } else {
      const newProd: DigitalProduct = {
        ...productData,
        id: `PRX-DP-${Date.now().toString().slice(-4)}`,
        tarikhDicipta: now,
        jumlahTerjual: productData.jumlahTerjual || 0,
      };
      updatedList = [newProd, ...digitalProducts];
      if (!silent) {
        showToast(`Produk digital baru "${productData.nama}" berjaya didaftarkan!`);
      }
    }

    setDigitalProducts(updatedList);
    saveStoredDigitalProducts(updatedList);

    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts: updatedList,
        retailOrders,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }
  };

  const handleDeleteDigitalProduct = (id: string) => {
    const prod = digitalProducts.find((p) => p.id === id);
    const updated = digitalProducts.filter((p) => p.id !== id);
    setDigitalProducts(updated);
    saveStoredDigitalProducts(updated);
    showToast(`Produk "${prod?.nama || id}" telah dipadam.`, 'info');
  };

  const handleSaveDigitalOrder = (
    orderData: Omit<DigitalRetailOrder, 'id' | 'tarikhPesanan' | 'noResit'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let updatedOrders: DigitalRetailOrder[];

    if (orderData.id) {
      updatedOrders = retailOrders.map((o) =>
        o.id === orderData.id ? ({ ...o, ...orderData } as DigitalRetailOrder) : o
      );
      showToast(`Pesanan retail "${orderData.id}" telah dikemaskini.`);
    } else {
      const countToday = retailOrders.length + 1;
      const receiptNo = `REC-RET-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(countToday).padStart(4, '0')}`;
      const newOrder: DigitalRetailOrder = {
        ...orderData,
        id: `PRX-ORD-${Date.now().toString().slice(-4)}`,
        noResit: receiptNo,
        tarikhPesanan: now,
      };
      updatedOrders = [newOrder, ...retailOrders];

      // Update product jumlahTerjual if matched
      if (orderData.produkId) {
        const updatedProds = digitalProducts.map((p) =>
          p.id === orderData.produkId
            ? { ...p, jumlahTerjual: (p.jumlahTerjual || 0) + (orderData.kuantiti || 1) }
            : p
        );
        setDigitalProducts(updatedProds);
        saveStoredDigitalProducts(updatedProds);
      }

      showToast(`Pesanan ${receiptNo} untuk ${orderData.namaPembeli} berjaya direkodkan!`);
    }

    setRetailOrders(updatedOrders);
    saveStoredDigitalOrders(updatedOrders);

    if (sheetConfig.spreadsheetId && accessToken && sheetConfig.autoSync) {
      syncAllDataToSheet(accessToken, sheetConfig.spreadsheetId, {
        leads,
        projects,
        financialDocs,
        agreements,
        digitalProducts,
        retailOrders: updatedOrders,
      }).catch((err) => console.warn('Auto-sync error:', err));
    }
  };

  const handleUpdateDigitalOrderStatus = (
    orderId: string,
    statusBayaran: DigitalRetailOrder['statusBayaran'],
    statusPenghantaran: DigitalRetailOrder['statusPenghantaran']
  ) => {
    const updated = retailOrders.map((o) => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        statusBayaran,
        statusPenghantaran,
        tarikhPenghantaran:
          statusPenghantaran === 'dihantar' && !o.tarikhPenghantaran
            ? new Date().toISOString()
            : o.tarikhPenghantaran,
      };
    });
    setRetailOrders(updated);
    saveStoredDigitalOrders(updated);
    showToast(`Status pesanan ${orderId} dikemaskini.`);
  };

  const handleDeleteDigitalOrder = (id: string) => {
    const ord = retailOrders.find((o) => o.id === id);
    const updated = retailOrders.filter((o) => o.id !== id);
    setRetailOrders(updated);
    saveStoredDigitalOrders(updated);
    showToast(`Pesanan "${ord?.noResit || id}" berjaya dipadam.`, 'info');
  };

  const handleSaveDigitalSalesTarget = (target: DigitalSalesTarget, silent = false) => {
    setDigitalSalesTarget(target);
    saveStoredDigitalSalesTarget(target);
    if (!silent) {
      showToast('Sasaran jualan digital berjaya dikemaskini!');
    }
  };

  const handleSaveDigitalLead = (
    leadData: Omit<DigitalRetailLead, 'id' | 'tarikhDicipta'> & { id?: string }
  ) => {
    const now = new Date().toISOString();
    let updatedLeads: DigitalRetailLead[];

    if (leadData.id) {
      updatedLeads = digitalLeads.map((l) =>
        l.id === leadData.id
          ? ({ ...l, ...leadData, tarikhDikemaskini: now } as DigitalRetailLead)
          : l
      );
      showToast(`Prospek digital "${leadData.nama}" berjaya dikemaskini.`);
    } else {
      const newLead: DigitalRetailLead = {
        ...leadData,
        id: `DLD-${new Date().getFullYear()}-${String(digitalLeads.length + 1).padStart(3, '0')}`,
        tarikhDicipta: now,
        kiraanFollowup: leadData.kiraanFollowup || 0,
      };
      updatedLeads = [newLead, ...digitalLeads];
      showToast(`Prospek digital baharu "${leadData.nama}" berjaya didaftarkan!`);
    }

    setDigitalLeads(updatedLeads);
    saveStoredDigitalLeads(updatedLeads);
  };

  const handleDeleteDigitalLead = (id: string) => {
    const lead = digitalLeads.find((l) => l.id === id);
    const updated = digitalLeads.filter((l) => l.id !== id);
    setDigitalLeads(updated);
    saveStoredDigitalLeads(updated);
    showToast(`Prospek "${lead?.nama || id}" telah dipadam.`, 'info');
  };

  const handleConvertDigitalLeadToAgencyLead = (digitalLead: DigitalRetailLead) => {
    const newLeadData: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'> = {
      nama: digitalLead.nama,
      syarikat: 'Prospek Produk Digital Provexa',
      telefon: digitalLead.telefon,
      emel: digitalLead.emel || '',
      servisMinat: 'brandup4u',
      status: 'dihubungi',
      sumber: 'whatsapp',
      anggaranBajet: digitalLead.anggaranNilai >= 500 ? digitalLead.anggaranNilai : 1500,
      keutamaan: digitalLead.keutamaan,
      nota: `Dipindahkan daripada Prospek Digital (${digitalLead.id}). Produk Diminati: ${digitalLead.namaProdukDiminati}. Nilai sasaran digital: RM ${digitalLead.anggaranNilai}. Nota: ${digitalLead.nota}`,
    };
    handleAddLead(newLeadData);
    handleSaveDigitalLead({
      ...digitalLead,
      nota: `${digitalLead.nota} [Dipindahkan ke Leads Agensi Utama Provexa]`,
    });
    showToast(`Prospek "${digitalLead.nama}" berjaya dipindahkan ke saluran Leads Agensi Utama!`);
  };

  const handleConvertRetailOrderToLead = (order: DigitalRetailOrder) => {
    const newLeadData: Omit<Lead, 'id' | 'tarikhDicipta' | 'tarikhDikemaskini'> = {
      nama: order.namaPembeli,
      syarikat: 'Pelanggan E-Book Provexa',
      telefon: order.telefonPembeli,
      emel: order.emelPembeli || '',
      servisMinat: 'brandup4u',
      status: 'dihubungi',
      sumber: 'borang_web',
      anggaranBajet: 1600,
      keutamaan: 'tinggi',
      nota: `Prospek daripada pembeli E-Book: ${order.namaProduk} (Resit: ${order.noResit}). Cadangan upsell servis Provexa: ${order.upsellInterest || 'BrandUP4U'}. Nota follow-up: ${order.followUpNotes || 'Berminat servis agensi Provexa.'}`,
    };
    handleAddLead(newLeadData);
  };

  const handleSaveService = (service: ServiceMeta) => {
    const isUpdate = Boolean(services[service.key]);
    const updated = { ...services, [service.key]: service };
    setServices(updated);
    saveStoredServices(updated);
    showToast(
      isUpdate
        ? `Servis "${service.title}" berjaya dikemaskini.`
        : `Servis baru "${service.title}" berjaya ditambah ke katalog!`
    );
  };

  const handleDeleteService = (key: string) => {
    const updated = { ...services };
    const title = updated[key]?.title || key;
    delete updated[key];
    setServices(updated);
    saveStoredServices(updated);
    showToast(`Servis "${title}" telah dipadam daripada katalog.`, 'info');
  };

  const handleResetServices = () => {
    const reset = resetStoredServices();
    setServices(reset);
    showToast('Katalog servis telah diset semula kepada konfigurasi asal.');
  };

  const pendingRemindersCount = reminders.filter((r) => !r.selesai && r.status === 'belum').length;
  const activeProjectsCount = projects.filter(
    (p) => p.status === 'pembangunan' || p.status === 'semakan_uat'
  ).length;
  const activePipelineCount = leads.filter(
    (l) => l.status !== 'berjaya' && l.status !== 'gagal'
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc]/90 text-slate-900 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient Floating Glass Aurora Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-indigo-300/35 via-violet-200/25 to-transparent blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/4 -right-28 w-[36rem] h-[36rem] rounded-full bg-gradient-to-bl from-sky-200/35 via-indigo-100/30 to-transparent blur-3xl animate-subtle-float" />
        <div className="absolute -bottom-40 left-1/3 w-[38rem] h-[38rem] rounded-full bg-gradient-to-tr from-purple-200/30 via-indigo-100/25 to-transparent blur-3xl animate-pulse-soft" />
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-2xl shadow-2xl bg-slate-900/90 backdrop-blur-xl text-white text-xs font-medium border border-white/20 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        sheetConfig={sheetConfig}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
        onSignInGoogle={handleGoogleSignIn}
        onSignOutGoogle={handleGoogleSignOut}
        isSyncing={isSyncing}
        onManualSync={handleManualSync}
        pendingRemindersCount={pendingRemindersCount}
        totalLeadsCount={leads.length}
        activePipelineCount={activePipelineCount}
        activeProjectsCount={activeProjectsCount}
        financialDocsCount={financialDocs.length}
        agreementsCount={agreements.length}
        digitalOrdersCount={retailOrders.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative z-10">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              leads={leads}
              financialDocs={financialDocs}
              agreements={agreements}
              reminders={reminders}
              services={services}
              onNavigateToProjects={(filter) => {
                if (filter) setProjectStatusFilterForNav(filter);
                setActiveTab('projects');
              }}
              onNavigateToLeads={(filter) => {
                if (filter) setLeadStatusFilterForNav(filter);
                setActiveTab('leads');
              }}
              onNavigateToFinancialDocs={() => setActiveTab('financialDocs')}
              onNavigateToAgreements={() => setActiveTab('agreements')}
              onNavigateToReminders={() => setActiveTab('reminders')}
              onNavigateToPublicForm={() => setActiveTab('publicForm')}
              onNavigateToServicesCatalog={() => setActiveTab('promotions')}
              onNavigateToDigitalRetail={() => setActiveTab('digitalRetail')}
              onNavigateToAnalytics={() => setActiveTab('analytics')}
              onNavigateToCrm={() => setActiveTab('crm')}
              onOpenNewProjectModal={() => {
                setEditingProject(null);
                setPrefillProjectFromLead(null);
                setIsProjectModalOpen(true);
              }}
              onOpenNewLeadModal={() => setActiveTab('leads')}
              onOpenDocGenerator={() => {
                setEditingDoc(null);
                setPrefillDocLead(null);
                setPrefillDocProject(null);
                setDocInitialType('invois');
                setIsDocModalOpen(true);
              }}
              onOpenAgreementGenerator={() => {
                setEditingAgreement(null);
                setPrefillAgrLead(null);
                setPrefillAgrProject(null);
                setAgreementInitialType('terma_syarat');
                setIsAgreementModalOpen(true);
              }}
              onEditDoc={(doc) => {
                setEditingDoc(doc);
                setIsDocModalOpen(true);
              }}
              onEditProject={(proj) => {
                setEditingProject(proj);
                setPrefillProjectFromLead(null);
                setIsProjectModalOpen(true);
              }}
              onOpenFollowupModal={(lead) => {
                setSelectedFollowupLead(lead);
                setIsFollowupModalOpen(true);
              }}
              onGenerateQuotationForLead={(lead) => handleOpenDocForLead(lead, 'sebutharga')}
              onUpdateReminderStatus={handleUpdateReminderStatus}
              onSyncGoogleSheets={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'crm' && (
            <CrmPipelineView
              leads={leads}
              projects={projects}
              financialDocs={financialDocs}
              agreements={agreements}
              reminders={reminders}
              services={services}
              onAddLead={handleAddLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onOpenFollowupModal={(lead) => {
                setSelectedFollowupLead(lead);
                setIsFollowupModalOpen(true);
              }}
              onGenerateQuotationForLead={(lead) => handleOpenDocForLead(lead, 'sebutharga')}
              onGenerateAgreementForLead={(lead) => handleOpenAgreementForLead(lead, 'perjanjian_servis')}
              onConvertLeadToProject={handleConvertLeadToProject}
              onSyncGoogleSheets={handleManualSync}
              isSyncing={isSyncing}
              onNavigateToProjects={() => setActiveTab('projects')}
              onNavigateToFinancialDocs={() => setActiveTab('financialDocs')}
            />
          )}

          {activeTab === 'analytics' && (
            <SalesAnalyticsDashboard
              leads={leads}
              financialDocs={financialDocs}
              projects={projects}
              services={services}
              onNavigateToLeads={() => setActiveTab('leads')}
              onNavigateToFinancialDocs={() => setActiveTab('financialDocs')}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsManager
              projects={projects}
              onAddProject={() => {
                setEditingProject(null);
                setPrefillProjectFromLead(null);
                setIsProjectModalOpen(true);
              }}
              onEditProject={(proj) => {
                setEditingProject(proj);
                setPrefillProjectFromLead(null);
                setIsProjectModalOpen(true);
              }}
              onDeleteProject={handleDeleteProject}
              onGenerateInvoice={(proj) => handleOpenDocForProject(proj, 'invois')}
              onGenerateQuotation={(proj) => handleOpenDocForProject(proj, 'sebutharga')}
              onGenerateReceipt={(proj) => handleOpenDocForProject(proj, 'resit')}
              onGenerateAgreement={(proj) => handleOpenAgreementForProject(proj, 'perjanjian_servis')}
            />
          )}

          {activeTab === 'financialDocs' && (
            <FinancialDocsManager
              docs={financialDocs}
              projects={projects}
              leads={leads}
              onOpenGenerator={(type) => {
                setEditingDoc(null);
                setPrefillDocProject(null);
                setPrefillDocLead(null);
                setDocInitialType(type);
                setIsDocModalOpen(true);
              }}
              onEditDoc={(doc) => {
                setEditingDoc(doc);
                setIsDocModalOpen(true);
              }}
              onDeleteDoc={handleDeleteFinancialDoc}
            />
          )}

          {activeTab === 'agreements' && (
            <AgreementsManager
              agreements={agreements}
              projects={projects}
              leads={leads}
              onOpenGenerator={(type) => {
                setEditingAgreement(null);
                setPrefillAgrProject(null);
                setPrefillAgrLead(null);
                setAgreementInitialType(type);
                setIsAgreementModalOpen(true);
              }}
              onEditAgreement={(agr) => {
                setEditingAgreement(agr);
                setIsAgreementModalOpen(true);
              }}
              onDeleteAgreement={handleDeleteAgreement}
              onUpdateStatus={handleUpdateAgreementStatus}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManager
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={handleDeleteLead}
              onBulkAddLeads={handleBulkAddLeads}
              onOpenFollowupModal={(lead) => {
                setSelectedFollowupLead(lead);
                setIsFollowupModalOpen(true);
              }}
              onGenerateQuotationForLead={(lead) => handleOpenDocForLead(lead, 'sebutharga')}
              onGenerateAgreementForLead={(lead) => handleOpenAgreementForLead(lead, 'terma_syarat')}
              onConvertLeadToProject={handleConvertLeadToProject}
              initialStatusFilter={leadStatusFilterForNav}
              onSyncGoogleSheets={handleManualSync}
              isSyncing={isSyncing}
            />
          )}

          {activeTab === 'promotions' && (
            <PromotionsManager
              services={services}
              digitalProducts={digitalProducts}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
              onResetServices={handleResetServices}
              onSaveDigitalProduct={handleSaveDigitalProduct}
              onDeleteDigitalProduct={handleDeleteDigitalProduct}
              promotions={promotions}
              leads={leads}
              onAddPromotion={() => {}}
              onDeletePromotion={() => {}}
              onSelectServiceForQuotation={handleOpenDocForService}
              onSelectServiceForAgreement={handleOpenAgreementForService}
              onSelectProductForQuotation={(product) => handleOpenDocForDigitalProduct(product, 'sebutharga')}
              onSelectProductForInvoice={(product) => handleOpenDocForDigitalProduct(product, 'invois')}
              onOpenPosForProduct={(product) => {
                setActiveTab('digitalRetail');
                showToast(`Membuka kaunter POS untuk ${product.nama}`);
              }}
              onNavigateToDigitalRetail={() => setActiveTab('digitalRetail')}
            />
          )}

          {activeTab === 'reminders' && (
            <RemindersView
              reminders={reminders}
              leads={leads}
              onAddReminder={(rem) => {
                const newRem: Reminder = {
                  ...rem,
                  id: `REM-${Date.now().toString().slice(-4)}`,
                };
                const updated = [newRem, ...reminders];
                setReminders(updated);
                saveStoredReminders(updated);
                showToast('Janji temu / peringatan disimpan.');
              }}
              onUpdateReminderStatus={handleUpdateReminderStatus}
              onDeleteReminder={handleDeleteReminder}
              onQuickFollowup={(lead) => {
                setSelectedFollowupLead(lead);
                setIsFollowupModalOpen(true);
              }}
            />
          )}

          {activeTab === 'publicForm' && (
            <PublicLeadForm
              onLeadSubmitted={(newLead) => {
                handleAddLead(newLead);
              }}
              sellerWhatsAppNumber="0129845521"
              sellerName="Provexa Solution"
            />
          )}

          {activeTab === 'digitalRetail' && (
            <DigitalRetailManager
              products={digitalProducts}
              orders={retailOrders}
              digitalLeads={digitalLeads}
              salesTarget={digitalSalesTarget}
              onSaveSalesTarget={handleSaveDigitalSalesTarget}
              onSaveProduct={handleSaveDigitalProduct}
              onDeleteProduct={handleDeleteDigitalProduct}
              onSaveOrder={handleSaveDigitalOrder}
              onUpdateOrderStatus={handleUpdateDigitalOrderStatus}
              onDeleteOrder={handleDeleteDigitalOrder}
              onConvertToLead={handleConvertRetailOrderToLead}
              onSaveDigitalLead={handleSaveDigitalLead}
              onDeleteDigitalLead={handleDeleteDigitalLead}
              onConvertDigitalLeadToAgencyLead={handleConvertDigitalLeadToAgencyLead}
              onGenerateDocForProduct={(prod, type) => handleOpenDocForDigitalProduct(prod, type || 'invois')}
              onGenerateDocForOrder={(order, type) => handleOpenDocForRetailOrder(order, type || 'resit')}
              onNavigateToPromotions={() => setActiveTab('promotions')}
              showToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Project Modal (Create & Edit) */}
      {isProjectModalOpen && (
        <ProjectModal
          isOpen={isProjectModalOpen}
          onClose={() => {
            setIsProjectModalOpen(false);
            setEditingProject(null);
            setPrefillProjectFromLead(null);
          }}
          onSave={handleSaveProject}
          initialProject={editingProject}
          prefillFromLead={prefillProjectFromLead}
          onDeleteProject={handleDeleteProject}
        />
      )}

      {/* Financial Document Generator Modal (Invoice, Receipt, Quotation) */}
      {isDocModalOpen && (
        <DocumentGeneratorModal
          isOpen={isDocModalOpen}
          onClose={() => {
            setIsDocModalOpen(false);
            setEditingDoc(null);
            setPrefillDocProject(null);
            setPrefillDocLead(null);
            setPrefillDocService(undefined);
            setPrefillDocDigitalProduct(null);
            setPrefillDocRetailOrder(null);
          }}
          onSave={handleSaveFinancialDoc}
          onSaveDoc={handleSaveFinancialDoc}
          initialDoc={editingDoc}
          defaultType={docInitialType}
          prefillProject={prefillDocProject}
          prefillLead={prefillDocLead}
          prefillService={prefillDocService}
          prefillDigitalProduct={prefillDocDigitalProduct}
          prefillRetailOrder={prefillDocRetailOrder}
          digitalProducts={digitalProducts}
          services={services}
          existingDocs={financialDocs}
          onDeleteDoc={handleDeleteFinancialDoc}
        />
      )}

      {/* Agreement & T&C Generator Modal */}
      {isAgreementModalOpen && (
        <AgreementGeneratorModal
          isOpen={isAgreementModalOpen}
          onClose={() => {
            setIsAgreementModalOpen(false);
            setEditingAgreement(null);
            setPrefillAgrProject(null);
            setPrefillAgrLead(null);
            setPrefillAgrService(undefined);
          }}
          onSave={handleSaveAgreement}
          onSaveAgreement={handleSaveAgreement}
          initialAgreement={editingAgreement}
          defaultType={agreementInitialType}
          prefillProject={prefillAgrProject}
          prefillLead={prefillAgrLead}
          prefillService={prefillAgrService}
          services={services}
          existingAgreements={agreements}
          onDeleteAgreement={handleDeleteAgreement}
        />
      )}

      {/* WhatsApp Follow-up Modal */}
      {isFollowupModalOpen && selectedFollowupLead && (
        <FollowUpModal
          lead={selectedFollowupLead}
          isOpen={isFollowupModalOpen}
          onClose={() => setIsFollowupModalOpen(false)}
          templates={templates}
          onRecordFollowUp={handleRecordFollowUp}
          onScheduleReminder={handleScheduleReminder}
        />
      )}

      {/* Google Sheets Modal */}
      {isGoogleModalOpen && (
        <GoogleSheetsModal
          isOpen={isGoogleModalOpen}
          onClose={() => setIsGoogleModalOpen(false)}
          currentUser={currentUser}
          accessToken={accessToken}
          sheetConfig={sheetConfig}
          onUpdateSheetConfig={(cfg) => {
            setSheetConfig(cfg);
            saveStoredSheetConfig(cfg);
          }}
          leads={leads}
          projects={projects}
          financialDocs={financialDocs}
          agreements={agreements}
          digitalProducts={digitalProducts}
          retailOrders={retailOrders}
          onSignInGoogle={handleGoogleSignIn}
          isSyncing={isSyncing}
          setIsSyncing={setIsSyncing}
        />
      )}
    </div>
  );
}
