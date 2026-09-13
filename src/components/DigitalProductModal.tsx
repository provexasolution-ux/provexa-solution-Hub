import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  DollarSign,
  Link,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react';
import {
  DigitalProduct,
  DigitalProductCategory,
  DigitalDeliveryFormat,
} from '../types';

interface DigitalProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<DigitalProduct, 'id' | 'tarikhDicipta'> & { id?: string }) => void;
  initialProduct?: DigitalProduct | null;
  onDelete?: (id: string) => void;
}

export const DigitalProductModal: React.FC<DigitalProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  onDelete,
}) => {
  const isEditing = Boolean(initialProduct?.id);

  // Essential Core Fields
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState<DigitalProductCategory>('ai_prompt');
  const [hargaRuncit, setHargaRuncit] = useState<number>(79);
  const [pautanMuatTurun, setPautanMuatTurun] = useState('');
  const [peneranganRingkas, setPeneranganRingkas] = useState('');

  // Per-Product Sales Target Fields
  const [targetUnit, setTargetUnit] = useState<number>(50);
  const [modelJualan, setModelJualan] = useState<'one_off' | 'langganan'>('one_off');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Optional / Advanced Fields (Hidden under toggle)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sku, setSku] = useState('');
  const [hargaAsal, setHargaAsal] = useState<number | undefined>(undefined);
  const [formatPenghantaran, setFormatPenghantaran] = useState<DigitalDeliveryFormat>('PDF');
  const [kunciAksesAtauLesen, setKunciAksesAtauLesen] = useState('');
  const [badgeLabel, setBadgeLabel] = useState('');
  const [mesejPenghantaranWhatsApp, setMesejPenghantaranWhatsApp] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setNama(initialProduct.nama || '');
      setKategori(initialProduct.kategori || 'ai_prompt');
      setHargaRuncit(initialProduct.hargaRuncit ?? 79);
      setPautanMuatTurun(initialProduct.pautanMuatTurun || '');
      setPeneranganRingkas(initialProduct.peneranganRingkas || '');

      setTargetUnit(
        initialProduct.targetUnit ??
        (initialProduct.modelJualan === 'langganan' ? (initialProduct.bilanganSubscribers || 70) : 50)
      );
      setModelJualan(initialProduct.modelJualan || 'one_off');

      setSku(initialProduct.sku || '');
      setHargaAsal(initialProduct.hargaAsal);
      setFormatPenghantaran(initialProduct.formatPenghantaran || 'PDF');
      setKunciAksesAtauLesen(initialProduct.kunciAksesAtauLesen || '');
      setBadgeLabel(initialProduct.badgeLabel || '');
      setMesejPenghantaranWhatsApp(initialProduct.mesejPenghantaranWhatsApp || '');

      // Open advanced if any advanced field has value
      if (
        initialProduct.hargaAsal ||
        initialProduct.kunciAksesAtauLesen ||
        initialProduct.badgeLabel ||
        initialProduct.formatPenghantaran !== 'PDF'
      ) {
        setShowAdvanced(true);
      } else {
        setShowAdvanced(false);
      }
    } else {
      setNama('');
      setKategori('ai_prompt');
      setHargaRuncit(79);
      setPautanMuatTurun('');
      setPeneranganRingkas('');

      setTargetUnit(50);
      setModelJualan('one_off');

      setSku(`PRX-DIG-${Date.now().toString().slice(-4)}`);
      setHargaAsal(undefined);
      setFormatPenghantaran('PDF');
      setKunciAksesAtauLesen('');
      setBadgeLabel('');
      setMesejPenghantaranWhatsApp('');
      setShowAdvanced(false);
    }
  }, [initialProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const finalSku = (sku.trim() || `PRX-DIG-${Date.now().toString().slice(-4)}`).toUpperCase();
    const finalDownloadLink = pautanMuatTurun.trim();
    const safeTargetUnit = Math.max(1, Number(targetUnit) || 1);
    const safePrice = Math.max(0, Number(hargaRuncit) || 0);
    const calculatedTargetRM = safeTargetUnit * safePrice;

    onSave({
      id: initialProduct?.id,
      nama: nama.trim(),
      sku: finalSku,
      kategori,
      modelJualan,
      tempohLangganan: modelJualan === 'langganan' ? 'bulanan' : undefined,
      hargaRuncit: safePrice,
      hargaAsal: hargaAsal ? Number(hargaAsal) : undefined,
      targetUnit: safeTargetUnit,
      targetRM: calculatedTargetRM,
      targetSubscribers: modelJualan === 'langganan' ? safeTargetUnit : undefined,
      targetMRR: modelJualan === 'langganan' ? calculatedTargetRM : undefined,
      bilanganSubscribers:
        modelJualan === 'langganan'
          ? initialProduct?.bilanganSubscribers || Math.round(safeTargetUnit * 0.8)
          : undefined,
      mrrBulanan:
        modelJualan === 'langganan'
          ? initialProduct?.mrrBulanan || Math.round(safeTargetUnit * 0.8 * safePrice)
          : undefined,
      formatPenghantaran,
      peneranganRingkas: peneranganRingkas.trim() || 'Aset digital berkualiti tinggi dari Provexa Solution.',
      pautanMuatTurun: finalDownloadLink,
      kunciAksesAtauLesen: kunciAksesAtauLesen.trim() || undefined,
      badgeLabel: badgeLabel.trim() || undefined,
      mesejPenghantaranWhatsApp:
        mesejPenghantaranWhatsApp.trim() ||
        `Salam {nama}, terima kasih atas pembelian *${nama.trim()}*!\n\nPautan muat turun / akses anda:\n🔗 ${finalDownloadLink}\n\nSebarang pertanyaan, sila balas mesej ini. - Provexa Solution`,
      aktif: true,
      jumlahTerjual: initialProduct?.jumlahTerjual || 0,
      faedahUtama: initialProduct?.faedahUtama || ['Akses seumur hidup', 'Sedia untuk digunakan segera'],
      saizFail: initialProduct?.saizFail || 'Akses Digital',
      hadStok: null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header - Pinned at top */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {isEditing ? 'Kemaskini Produk Digital' : 'Tambah Produk Digital'}
              </h3>
              <p className="text-xs text-slate-500 truncate">
                Isi maklumat produk untuk mula menjual segera.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0 ml-2"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable & Well-Padded */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm">
            {/* 1. Nama Produk */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Produk Digital <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="cth: 500+ Rahsia Prompt AI Bisnes 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 transition-all text-sm"
              />
            </div>

            {/* 2. Kategori & Harga */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value as DigitalProductCategory)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-sm font-medium"
                >
                  <option value="sistem">Sistem / Platform SaaS</option>
                  <option value="ai_prompt">AI Prompt Vault</option>
                  <option value="template">Templat &amp; Kit</option>
                  <option value="ebook">E-Book</option>
                  <option value="source_code">Source Code / Starter</option>
                  <option value="mini_course">Mini Course / Video</option>
                  <option value="lisensi">Lesen Perisian</option>
                  <option value="lain_lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harga Jualan (RM) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">RM</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={hargaRuncit}
                    onChange={(e) => setHargaRuncit(parseFloat(e.target.value) || 0)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2b. Sasaran Jualan Khusus Produk Ini (Target Berasingan) */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sasaran Jualan Bulanan (Target Berasingan)</span>
                </label>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  Per-Product Target
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    {modelJualan === 'langganan' ? 'Sasaran Pengguna' : 'Sasaran Unit Jualan'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      required
                      value={targetUnit}
                      onChange={(e) => setTargetUnit(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg font-bold text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="50"
                    />
                    <span className="absolute right-2.5 top-2 text-[11px] text-slate-400 font-medium">
                      {modelJualan === 'langganan' ? 'user' : 'unit'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Anggaran Hasil Sasaran
                  </label>
                  <div className="px-3 py-2 bg-white/90 border border-blue-200 rounded-lg text-sm font-bold text-blue-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">RM</span>
                    <span>{((targetUnit || 0) * (hargaRuncit || 0)).toLocaleString('ms-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>

              {/* Model Jualan Picker */}
              <div className="flex items-center gap-3 pt-1 border-t border-blue-100/60 text-xs">
                <span className="text-[11px] font-medium text-slate-500">Model:</span>
                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="modelJualan"
                    value="one_off"
                    checked={modelJualan === 'one_off'}
                    onChange={() => setModelJualan('one_off')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Sekali Beli (One-off)
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                  <input
                    type="radio"
                    name="modelJualan"
                    value="langganan"
                    checked={modelJualan === 'langganan'}
                    onChange={() => setModelJualan('langganan')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  Langganan Bulanan (SaaS)
                </label>
              </div>
            </div>

            {/* 3. Pautan Muat Turun / Akses */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pautan Akses / Download (Google Drive, Notion, dll) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3 shrink-0" />
                <input
                  type="url"
                  required
                  value={pautanMuatTurun}
                  onChange={(e) => setPautanMuatTurun(e.target.value)}
                  placeholder="https://drive.google.com/... atau https://notion.so/..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs text-slate-800 break-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Pautan ini akan dihantar secara automatik ke WhatsApp pelanggan apabila jualan direkodkan.
              </p>
            </div>

            {/* 4. Penerangan Ringkas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Penerangan Ringkas
              </label>
              <textarea
                rows={2}
                value={peneranganRingkas}
                onChange={(e) => setPeneranganRingkas(e.target.value)}
                placeholder="cth: Panduan lengkap automasi jualan & template sedia guna."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-800 resize-none leading-relaxed"
              />
            </div>

            {/* Collapsible: Maklumat Lanjutan (Pilihan) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pilihan Tambahan (Format, Diskaun, SKU, Lesen)</span>
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-3 p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        Format Fail
                      </label>
                      <select
                        value={formatPenghantaran}
                        onChange={(e) => setFormatPenghantaran(e.target.value as DigitalDeliveryFormat)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="PDF">PDF (Dokumen / E-Book)</option>
                        <option value="ZIP">ZIP (Kod / Pakej)</option>
                        <option value="Notion">Notion Workspace</option>
                        <option value="Canva">Canva Template</option>
                        <option value="Figma">Figma Kit</option>
                        <option value="Video">Video Streaming</option>
                        <option value="Google Drive">Google Drive Folder</option>
                        <option value="Web Portal">Web Portal / SaaS</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        Harga Asal (Coret) RM
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={hargaAsal ?? ''}
                        onChange={(e) => setHargaAsal(e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="cth: 149"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        Kod SKU (Pilihan)
                      </label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        placeholder="cth: PRX-DIG-AI"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-600 mb-1">
                        Badge Label (Pilihan)
                      </label>
                      <input
                        type="text"
                        value={badgeLabel}
                        onChange={(e) => setBadgeLabel(e.target.value)}
                        placeholder="cth: Terlaris / Edisi Khas"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600 mb-1">
                      Kunci Lesen / Kod Akses (Jika ada)
                    </label>
                    <input
                      type="text"
                      value={kunciAksesAtauLesen}
                      onChange={(e) => setKunciAksesAtauLesen(e.target.value)}
                      placeholder="cth: PRX-VIP-2026"
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons - Pinned at bottom */}
          <div className="px-5 py-3.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between shrink-0">
            {isEditing && onDelete && initialProduct ? (
              isConfirmingDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-rose-600">Pasti padam?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(initialProduct.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    Ya, Padam
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Padam Produk</span>
                </button>
              )
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isEditing ? 'Simpan Perubahan' : 'Daftar Produk'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
