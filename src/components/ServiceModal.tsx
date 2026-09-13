import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Globe,
  Layers,
  Cpu,
  Smartphone,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Share2,
  Megaphone,
  Palette,
  Rocket,
  Search,
  Database,
  Bot,
  Video,
  ShoppingBag,
  Server,
  Check,
  Tag,
  DollarSign,
  AlignLeft,
  CheckCircle2,
} from 'lucide-react';
import { ServiceMeta } from '../types';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: ServiceMeta) => void;
  initialService?: ServiceMeta | null;
  existingKeys?: string[];
}

export const ICON_OPTIONS: { name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Globe', icon: Globe },
  { name: 'Layers', icon: Layers },
  { name: 'Cpu', icon: Cpu },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'ShieldCheck', icon: ShieldCheck },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Share2', icon: Share2 },
  { name: 'Megaphone', icon: Megaphone },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Palette', icon: Palette },
  { name: 'Rocket', icon: Rocket },
  { name: 'Search', icon: Search },
  { name: 'Database', icon: Database },
  { name: 'Bot', icon: Bot },
  { name: 'Video', icon: Video },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Server', icon: Server },
];

export const COLOR_THEMES: {
  id: string;
  name: string;
  badgeBg: string;
  badgeColor: string;
  dotColor: string;
}[] = [
  {
    id: 'indigo',
    name: 'Indigo',
    badgeBg: 'bg-indigo-50',
    badgeColor: 'text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
  {
    id: 'blue',
    name: 'Biru',
    badgeBg: 'bg-blue-50',
    badgeColor: 'text-blue-700 border-blue-200',
    dotColor: 'bg-blue-500',
  },
  {
    id: 'emerald',
    name: 'Hijau Zamrud',
    badgeBg: 'bg-emerald-50',
    badgeColor: 'text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  {
    id: 'amber',
    name: 'Jingga Amber',
    badgeBg: 'bg-amber-50',
    badgeColor: 'text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  {
    id: 'purple',
    name: 'Ungu',
    badgeBg: 'bg-purple-50',
    badgeColor: 'text-purple-700 border-purple-200',
    dotColor: 'bg-purple-500',
  },
  {
    id: 'pink',
    name: 'Merah Jambu',
    badgeBg: 'bg-pink-50',
    badgeColor: 'text-pink-700 border-pink-200',
    dotColor: 'bg-pink-500',
  },
  {
    id: 'cyan',
    name: 'Sian / Teal',
    badgeBg: 'bg-cyan-50',
    badgeColor: 'text-cyan-700 border-cyan-200',
    dotColor: 'bg-cyan-500',
  },
  {
    id: 'rose',
    name: 'Mawar',
    badgeBg: 'bg-rose-50',
    badgeColor: 'text-rose-700 border-rose-200',
    dotColor: 'bg-rose-500',
  },
];

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialService,
  existingKeys = [],
}) => {
  const isEditMode = Boolean(initialService);

  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState<'Development' | 'Consulting & AI' | 'Marketing & Branding' | string>('Development');
  const [customCategory, setCustomCategory] = useState('');
  const [startingPrice, setStartingPrice] = useState<number>(1500);
  const [priceModel, setPriceModel] = useState('Bermula RM 1,500 (One-Off)');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [iconName, setIconName] = useState('Globe');
  const [selectedThemeId, setSelectedThemeId] = useState('indigo');
  const [error, setError] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (initialService) {
      setTitle(initialService.title || '');
      setShortTitle(initialService.shortTitle || '');
      setKey(initialService.key || '');
      const standardCats = ['Development', 'Consulting & AI', 'Marketing & Branding'];
      if (standardCats.includes(initialService.category)) {
        setCategory(initialService.category);
        setCustomCategory('');
      } else {
        setCategory('Kustom');
        setCustomCategory(initialService.category || '');
      }
      setStartingPrice(initialService.startingPrice || 0);
      setPriceModel(initialService.priceModel || 'Bermula RM 0');
      setTagline(initialService.tagline || '');
      setDescription(initialService.description || '');
      setDeliverables(initialService.deliverables ? [...initialService.deliverables] : []);
      setIconName(initialService.iconName || 'Globe');

      // Match theme
      const matchedTheme = COLOR_THEMES.find(
        (t) => t.badgeBg === initialService.badgeBg && t.badgeColor === initialService.badgeColor
      );
      setSelectedThemeId(matchedTheme ? matchedTheme.id : 'indigo');
    } else {
      // Defaults for new service
      setTitle('');
      setShortTitle('');
      setKey('');
      setCategory('Development');
      setCustomCategory('');
      setStartingPrice(2000);
      setPriceModel('Bermula RM 2,000 (One-Off)');
      setTagline('');
      setDescription('');
      setDeliverables([
        'Reka bentuk profesional & responsif',
        'Integrasi sistem pangkalan data & borang',
        'Dokumentasi kod & sokongan teknikal 30 hari',
      ]);
      setIconName('Globe');
      setSelectedThemeId('indigo');
    }
    setError(null);
    setNewDeliverable('');
  }, [initialService, isOpen]);

  // Automatically suggest slug/key when title changes in Add mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditMode && !key) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 30);
      setKey(generated);
    }
    if (!shortTitle) {
      setShortTitle(val.slice(0, 25));
    }
  };

  const handleAddDeliverable = () => {
    const trimmed = newDeliverable.trim();
    if (!trimmed) return;
    setDeliverables([...deliverables, trimmed]);
    setNewDeliverable('');
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handlePriceChange = (num: number) => {
    setStartingPrice(num);
    // Suggest price model if it contains "Bermula RM"
    if (priceModel.includes('Bermula RM') || priceModel === '') {
      setPriceModel(`Bermula RM ${num.toLocaleString('ms-MY')} (One-Off)`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Sila masukkan nama / tajuk servis.');
      return;
    }

    const cleanKey = (key || cleanTitle)
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');

    if (!cleanKey) {
      setError('Sila masukkan kod / kunci unik untuk servis ini.');
      return;
    }

    if (!isEditMode && existingKeys.includes(cleanKey)) {
      setError(`Kod servis "${cleanKey}" sudah wujud. Sila gunakan kod yang lain.`);
      return;
    }

    const finalCategory = category === 'Kustom' ? (customCategory.trim() || 'Lain-lain') : category;
    const theme = COLOR_THEMES.find((t) => t.id === selectedThemeId) || COLOR_THEMES[0];

    const updatedService: ServiceMeta = {
      key: isEditMode ? initialService!.key : cleanKey,
      title: cleanTitle,
      shortTitle: shortTitle.trim() || cleanTitle.slice(0, 25),
      tagline: tagline.trim() || cleanTitle,
      category: finalCategory,
      startingPrice: Number(startingPrice) || 0,
      priceModel: priceModel.trim() || `Bermula RM ${startingPrice.toLocaleString('ms-MY')}`,
      deliverables: deliverables.length > 0 ? deliverables : ['Perkhidmatan kualiti tinggi', 'Sokongan teknikal Provexa'],
      iconName,
      badgeBg: theme.badgeBg,
      badgeColor: theme.badgeColor,
      description: description.trim() || tagline.trim() || cleanTitle,
      isCustom: isEditMode ? initialService?.isCustom : true,
    };

    onSave(updatedService);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                {isEditMode ? 'Kemaskini Katalog' : 'Servis & Produk Baru'}
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditMode ? `Edit: ${initialService?.title}` : 'Tambah Servis / Pakej Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
              <Tag className="w-3.5 h-3.5" />
              <span>1. Maklumat Servis & Pakej</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Servis / Tajuk Penuh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="cth: Pembangunan Aplikasi Mobile (Flutter/iOS)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Ringkas (Short Title)
                </label>
                <input
                  type="text"
                  value={shortTitle}
                  onChange={(e) => setShortTitle(e.target.value)}
                  placeholder="cth: Mobile App"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kod / Slug Kunci Sistem {!isEditMode && <span className="text-slate-400 text-[10px]">(Unik)</span>}
                </label>
                <input
                  type="text"
                  disabled={isEditMode}
                  value={key}
                  onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="cth: mobile_app"
                  className={`w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 ${
                    isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Kategori Servis
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Development">Development (Pembangunan & Sistem)</option>
                  <option value="Consulting & AI">Consulting & AI (Latihan & Konsultasi)</option>
                  <option value="Marketing & Branding">Marketing & Branding (Pemasaran & Penjenamaan)</option>
                  <option value="Kustom">Kategori Kustom (Taip Sendiri)...</option>
                </select>
              </div>

              {category === 'Kustom' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Nama Kategori Kustom
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="cth: Keselamatan Siber / Media Kreatif"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tagline / Slogan Ringkas
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="cth: Aplikasi pintar iOS & Android lengkap dengan API dan dashboard analitik."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Section 2: Pricing */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
              <DollarSign className="w-3.5 h-3.5" />
              <span>2. Struktur Harga & Model</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Harga Bermula (RM)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 font-mono">RM</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={startingPrice}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Label Model Harga
                </label>
                <input
                  type="text"
                  value={priceModel}
                  onChange={(e) => setPriceModel(e.target.value)}
                  placeholder="cth: Bermula RM 2,500 (One-Off) / Bulanan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Deliverables */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Senarai Ciri & Serahan (Deliverables)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {deliverables.length} serahan disenaraikan
              </span>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDeliverable();
                  }
                }}
                placeholder="Tambah ciri / serahan (cth: Integrasi Gateway Pembayaran FPX)..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddDeliverable}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold flex items-center space-x-1 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            {/* List of deliverables */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-100">
              {deliverables.length === 0 ? (
                <p className="text-slate-400 text-center py-2 text-[11px]">
                  Belum ada serahan ditambah. Taip di atas dan klik Tambah.
                </p>
              ) : (
                deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200/70 text-slate-700 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors shrink-0 ml-2"
                      title="Padam serahan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Full Description */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
              <AlignLeft className="w-3.5 h-3.5" />
              <span>4. Penerangan Terperinci Servis</span>
            </h3>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Huraikan skop, kelebihan dan cara perkhidmatan ini membantu perniagaan pelanggan..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Section 5: Visual Styling (Icon & Theme) */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 text-slate-400">
              <Palette className="w-3.5 h-3.5" />
              <span>5. Ikon & Tema Warna Kad</span>
            </h3>

            {/* Icon picker */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Pilih Ikon Servis
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5">
                {ICON_OPTIONS.map((item) => {
                  const Comp = item.icon;
                  const isSelected = iconName === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setIconName(item.name)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                      title={item.name}
                    >
                      <Comp className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color theme picker */}
            <div className="pt-2">
              <label className="block text-slate-700 font-semibold mb-1.5">
                Pilih Warna Lencana
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`py-1.5 px-2 rounded-xl border text-center flex items-center justify-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.dotColor}`} />
                      <span className="text-[11px] font-medium text-slate-700 truncate">
                        {theme.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>{isEditMode ? 'Simpan Perubahan' : 'Tambah ke Katalog'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
