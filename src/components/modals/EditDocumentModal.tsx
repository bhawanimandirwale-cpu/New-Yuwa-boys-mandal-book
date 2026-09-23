'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { DocumentCategory } from '@/lib/types';
import {
  X,
  FileCheck,
  Building,
  Flame,
  Zap,
  ShieldCheck,
  FileText,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export function EditDocumentModal() {
  const { documentToEdit, setDocumentToEdit, updateDocument, deleteDocument, activeYear } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('POLICE');
  const [status, setStatus] = useState<'APPROVED' | 'IN_PROCESS' | 'EXPIRED'>('APPROVED');
  const [officerNotes, setOfficerNotes] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documentToEdit) {
      setTitle(documentToEdit.title || '');
      setCategory(documentToEdit.category || 'POLICE');
      setStatus(documentToEdit.status || 'APPROVED');
      setOfficerNotes(documentToEdit.officerNotes || '');
      setFileUrl(documentToEdit.fileUrl || '');
      setConfirmDelete(false);
      setError(null);
    }
  }, [documentToEdit]);

  if (!documentToEdit) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
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
      alert('कागदपत्र फोटो अपलोड करताना अडचण आली.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('कृपया परवानगी पत्राचे नाव प्रविष्ट करा.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateDocument(documentToEdit.id, {
        title: title.trim(),
        category,
        status,
        officerNotes: officerNotes.trim() || '',
        fileUrl: fileUrl.trim() || documentToEdit.fileUrl,
        year: documentToEdit.year || activeYear,
      });
      setDocumentToEdit(null);
    } catch (err: any) {
      console.error('Failed to update document:', err);
      setError(err.message || 'कागदपत्र अद्यतन करताना त्रुटी आली.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await deleteDocument(documentToEdit.id);
      setDocumentToEdit(null);
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setError(err.message || 'कागदपत्र हटवताना त्रुटी आली.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 notranslate">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-4 sm:p-5 text-white relative">
          <button
            onClick={() => setDocumentToEdit(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-white/20">
              <FileCheck className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs uppercase tracking-wider font-bold text-blue-100 font-heading">
              परवानगी पत्र संपादन
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black font-heading line-clamp-1">
            {documentToEdit.title}
          </h2>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form id="edit-doc-form" onSubmit={handleSave} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                परवानगी पत्राचे / दाखल्याचे नाव *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="उदा. पोलीस ठाणे ध्वनीक्षेपक परवानगी २०२६"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
              />
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-bold mb-1">
                  विभाग / प्रवर्ग (Category) *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
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
                <label className="block text-gray-700 font-bold mb-1">
                  स्थिती (Status) *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-xs"
                >
                  <option value="APPROVED">मंजूर व वैध (Approved)</option>
                  <option value="IN_PROCESS">प्रक्रियेत आहे (In Process)</option>
                  <option value="EXPIRED">मुदत संपली (Expired)</option>
                </select>
              </div>
            </div>

            {/* Officer Notes */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                अधिकारी शेरा व परवाना अटी (Officer Notes)
              </label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="उदा. ध्वनी मर्यादा ५५ डेसिबल व रात्री १० पर्यंत"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Document Image / Upload */}
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                कागदपत्र / परवाना फोटो (Cloudinary Direct Upload)
              </label>

              {fileUrl && (
                <div className="mb-2 p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={fileUrl}
                      alt="Doc preview"
                      className="w-12 h-12 object-cover rounded-lg border border-gray-300 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-gray-800 block truncate">
                        सध्याचे अधिकृत कागदपत्र
                      </span>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>नवीन टॅबमध्ये पहा</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold shrink-0">
                    अपलोड केलेले
                  </span>
                </div>
              )}

              <label className="cursor-pointer flex items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors text-xs font-bold text-blue-700 active:scale-95">
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>कागदपत्र फोटो अपलोड होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>{fileUrl ? '📷 नवीन फोटो निवडा किंवा बदला' : '📷 कॅमेरा किंवा गॅलरीतून फोटो काढा'}</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*,.pdf"
                  capture="environment"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </form>

          {/* Delete Danger Section */}
          <div className="pt-3 border-t border-gray-200">
            {confirmDelete ? (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 animate-in fade-in">
                <div className="text-red-800 font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>तुम्हाला खात्री आहे का? हे कागदपत्र कायमचे हटवले जाईल.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                  >
                    {deleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>होय, कायमचे हटवा</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs active:scale-95 transition-all"
                  >
                    रद्द करा
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>हे कागदपत्र हटवा (Delete Document)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setDocumentToEdit(null)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold transition-colors active:scale-95"
          >
            बंद करा
          </button>
          <button
            form="edit-doc-form"
            type="submit"
            disabled={saving || uploading}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>जतन होत आहे...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>बदल जतन करा</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
