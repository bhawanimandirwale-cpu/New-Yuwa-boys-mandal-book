'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { DocumentCategory } from '@/lib/types';
import { 
  FileCheck, 
  ShieldCheck, 
  Flame, 
  Building, 
  Zap, 
  FileText, 
  Eye, 
  Plus, 
  X, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Camera,
  Loader2
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, { label: string; icon: any; color: string; badgeColor: string }> = {
  POLICE: { label: 'पोलीस ठाणे परवानगी', icon: ShieldCheck, color: 'text-blue-600 bg-blue-50', badgeColor: 'bg-blue-100 text-blue-800' },
  MUNICIPAL: { label: 'महापालिका (PMC/BMC) परवानगी', icon: Building, color: 'text-amber-600 bg-amber-50', badgeColor: 'bg-amber-100 text-amber-800' },
  FIRE_NOC: { label: 'अग्निशामक दल ना हरकत (Fire NOC)', icon: Flame, color: 'text-red-600 bg-red-50', badgeColor: 'bg-red-100 text-red-800' },
  ELECTRICITY: { label: 'महावितरण विद्युत जोडणी', icon: Zap, color: 'text-yellow-600 bg-yellow-50', badgeColor: 'bg-yellow-100 text-yellow-800' },
  INSURANCE: { label: 'मंडळ व भाविक सार्वजनिक विमा', icon: FileCheck, color: 'text-emerald-600 bg-emerald-50', badgeColor: 'bg-emerald-100 text-emerald-800' },
  OTHER: { label: 'इतर ना हरकत दाखले', icon: FileText, color: 'text-gray-600 bg-gray-50', badgeColor: 'bg-gray-100 text-gray-800' },
};

export default function DocumentsVaultPage() {
  const { documents, addDocument, activeYear, currentRole } = useApp();
  const { isMarathi } = useI18n();

  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Doc form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('POLICE');
  const [officerNotes, setOfficerNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'mandalbook/documents');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setFileUrl(data.url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('कागदपत्र अपलोड करताना अडचण आली.');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addDocument({
      title: title.trim(),
      category,
      officerNotes: officerNotes.trim() || null,
      fileUrl: fileUrl.trim() || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      status: 'APPROVED',
      year: activeYear,
    });

    setIsAddOpen(false);
    setTitle('');
    setOfficerNotes('');
    setFileUrl('');
  };

  const isPublicMember = currentRole === 'MEMBER';

  return (
    <div className="space-y-4 notranslate">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 font-heading">
              कागदपत्रे व सरकारी परवानग्या (Document Vault)
            </h2>
            <p className="text-xs text-gray-500">
              पोलीस, महापालिका, फायर ब्रिगेड व विद्युत मंजुरी पत्रे (मोबाईलवर त्वरित दाखवण्यासाठी)
            </p>
          </div>
        </div>

        {!isPublicMember && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>＋ नवीन परवानगी जोडा</span>
          </button>
        )}
      </div>

      {/* Permits Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {documents.map((doc) => {
          const meta = CATEGORY_ICONS[doc.category] || CATEGORY_ICONS.OTHER;
          const CategoryIcon = meta.icon;

          return (
            <div
              key={doc.id}
              className="festive-card p-4 sm:p-5 flex flex-col justify-between hover:border-blue-300 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>मंजूर व वैध</span>
                  </span>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${meta.badgeColor} inline-block mb-1.5`}>
                  {meta.label}
                </span>

                <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                  {doc.title}
                </h3>

                {doc.officerNotes && (
                  <div className="mt-2 p-2 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-600 italic">
                    {doc.officerNotes}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-400">
                  वर्ष: {isMarathi ? toDevanagariDigits(doc.year) : doc.year}
                </span>

                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>परवानगी पत्र उघडा</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 1-Tap Fullscreen Image/PDF Pinch-to-Zoom Viewer (Police & Officer Inspection Street-Ready) */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col notranslate select-none animate-in fade-in">
          {/* Top Bar for Street Inspection */}
          <div className="p-3 sm:p-4 bg-gray-900/90 backdrop-blur-md text-white flex items-center justify-between border-b border-gray-800 z-10">
            <div className="min-w-0 flex-1 mr-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-blue-500 text-white font-black text-[10px]">
                  अधिकृत NOC
                </span>
                <span className="text-xs text-gray-400">
                  वर्ष {isMarathi ? toDevanagariDigits(previewDoc.year) : previewDoc.year}
                </span>
              </div>
              <h3 className="font-extrabold text-sm sm:text-base truncate font-heading text-white mt-0.5">
                {previewDoc.title}
              </h3>
            </div>

            {/* Quick Zoom Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.max(z - 0.5, 1))}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center active:scale-95 transition-all"
                title="झूम कमी करा"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className="px-2 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] font-mono font-bold text-amber-300 active:scale-95 transition-all"
                title="मूळ आकार"
              >
                {Math.round(zoomScale * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((z) => Math.min(z + 0.5, 4))}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center active:scale-95 transition-all"
                title="झूम वाढवा"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  setZoomScale(1);
                }}
                className="w-8 h-8 rounded-full bg-red-600/80 hover:bg-red-600 text-white flex items-center justify-center ml-1 active:scale-95 transition-all"
                title="बंद करा"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Fullscreen Pinch-to-Zoom Viewport */}
          <div 
            className="flex-1 overflow-auto bg-black flex items-center justify-center p-2 relative touch-pan-x touch-pan-y"
            onDoubleClick={() => setZoomScale((z) => (z === 1 ? 2.5 : 1))}
          >
            <div 
              className="transition-transform duration-150 ease-out origin-center max-w-full max-h-full flex items-center justify-center"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-w-full max-h-[82vh] object-contain rounded-lg shadow-2xl border border-gray-800 bg-white"
              />
            </div>

            {/* Tap instruction badge */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-gray-300 text-[10px] font-medium pointer-events-none border border-gray-700 flex items-center gap-1.5 whitespace-nowrap">
              <span>👆 झूम करण्यासाठी डबल टॅप करा किंवा वरील बटणे वापरा</span>
            </div>
          </div>

          {/* Officer Notes Banner if present */}
          {previewDoc.officerNotes && (
            <div className="p-3 bg-amber-500/10 border-t border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <b className="text-amber-300">अधिकारी शेरा व परवाना अटी:</b> {previewDoc.officerNotes}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-Up "नवीन सरकारी परवानगी जोडा" Mobile Drawer */}
      {isAddOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsAddOpen(false)}
          />

          <div 
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-white rounded-t-[2rem] shadow-2xl border-t-2 border-blue-500 max-h-[92vh] flex flex-col notranslate animate-in slide-in-from-bottom-8 duration-200"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Swipe Handle */}
            <div className="pt-2.5 pb-1 flex justify-center cursor-pointer" onClick={() => setIsAddOpen(false)}>
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Drawer Header */}
            <div className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                <h4 className="font-black text-base font-heading">
                  नवीन सरकारी परवानगी / NOC जोडा
                </h4>
              </div>
              <button 
                type="button" 
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    परवानगी पत्राचे नाव *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. पोलीस ठाणे लाऊडस्पीकर परवानगी २०२६"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    विभाग / प्रवर्ग *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 bg-white"
                  >
                    <option value="POLICE">पोलीस ठाणे परवानगी</option>
                    <option value="MUNICIPAL">महापालिका (PMC/BMC)</option>
                    <option value="FIRE_NOC">अग्निशामक दल NOC</option>
                    <option value="ELECTRICITY">महावितरण वीज जोडणी</option>
                    <option value="INSURANCE">मंडळ सार्वजनिक विमा</option>
                    <option value="OTHER">इतर दाखले</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    अधिकारी शेरा व अटी
                  </label>
                  <textarea
                    rows={2}
                    placeholder="उदा. ध्वनी मर्यादा ५५ डेसिबल व रात्री १० पर्यंत"
                    value={officerNotes}
                    onChange={(e) => setOfficerNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    कागदपत्र / परवाना फोटो (Cloudinary Direct Upload)
                  </label>
                  <div className="space-y-2">
                    <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs font-bold text-blue-700 active:scale-95">
                      {uploadingDoc ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>कागदपत्र अपलोड होत आहे...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>{fileUrl ? '✅ कागदपत्र अपलोड झाले (बदला)' : '📷 कॅमेरा किंवा गॅलरीतून फोटो काढा'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        capture="environment"
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                        className="hidden"
                      />
                    </label>
                    {fileUrl && (
                      <div className="text-[10px] text-emerald-700 font-medium truncate bg-emerald-50 p-2 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Cloudinary: {fileUrl}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition-all shadow-md active:scale-95"
                  >
                    कागदपत्र सुरक्षित जतन करा
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
