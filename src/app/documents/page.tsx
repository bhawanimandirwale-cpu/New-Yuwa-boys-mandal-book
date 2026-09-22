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
  ExternalLink 
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

      {/* In-App Document Previewer (Mobile Fullscreen View) */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="min-w-0">
                <h4 className="font-bold text-sm sm:text-base truncate font-heading">
                  {previewDoc.title}
                </h4>
                <p className="text-[11px] text-gray-400">
                  अधिकृत सरकारी ना हरकत दाखला (NOC)
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-full hover:bg-white/20"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewDoc.fileUrl}
                alt={previewDoc.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>

            {previewDoc.officerNotes && (
              <div className="p-3 bg-amber-50 border-t border-amber-200 text-xs text-amber-900">
                <b>अधिकारी शेरा व अटी:</b> {previewDoc.officerNotes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h4 className="font-bold text-base text-gray-900 font-heading">
                नवीन सरकारी परवानगी / NOC जोडा
              </h4>
              <button onClick={() => setIsAddOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  विभाग / प्रवर्ग *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  कागदपत्र / परवाना फोटो (Cloudinary Direct Upload)
                </label>
                <div className="space-y-2">
                  <label className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs font-bold text-blue-700">
                    <span>{uploadingDoc ? 'अपलोड होत आहे...' : fileUrl ? '✅ कागदपत्र अपलोड झाले (बदला)' : '📷 कॅमेरा किंवा गॅलरीतून निवडा'}</span>
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
                    <div className="text-[10px] text-emerald-700 font-medium truncate bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                      Cloudinary URL: {fileUrl}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-md"
                >
                  कागदपत्र सुरक्षित जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
