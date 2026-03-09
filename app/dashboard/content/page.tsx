'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, ChevronDown, ChevronRight, Image as ImageIcon, MessageSquare, FileText, X } from 'lucide-react';

interface ScannedField {
  id: string;
  file: string;
  className: string;
  tag: string;
  text: string;
  section: string;
  occurrence: number;
  type: 'text';
}

interface ScannedImage {
  id: string;
  file: string;
  src: string;
  alt: string;
  section: string;
  occurrence: number;
  type: 'image';
}

interface ScannedTestimonial {
  id: string;
  file: string;
  badge: string;
  text: string;
  author: string;
  position: string;
  section: string;
  occurrence: number;
  type: 'testimonial';
}

type ScannedContent = ScannedField | ScannedImage | ScannedTestimonial;

type Change =
  | { type: 'text'; id: string; className: string; file: string; occurrence: number; newText: string }
  | { type: 'image'; id: string; file: string; oldSrc: string; occurrence: number; newSrc: string; newAlt: string }
  | { type: 'testimonial'; id: string; file: string; occurrence: number; newBadge: string; newText: string; newAuthor: string; newPosition: string };

export default function ContentPage() {
  const [activeTab, setActiveTab] = useState('Home');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [grouped, setGrouped] = useState<Record<string, Record<string, ScannedContent[]>>>({});
  const [changes, setChanges] = useState<Change[]>([]);
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-content');
      const data = await res.json();
      if (data.success) {
        setGrouped(data.grouped);
        setChanges([]);
        setEditValues({});
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    }
    setLoading(false);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const hasChangesForItem = (id: string) => {
    return changes.some(c => c.id === id);
  };

  const getChangeForItem = (id: string) => {
    return changes.find(c => c.id === id);
  };

  const updateEditValue = (id: string, field: string, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [field]: value }
    }));
  };

  const saveTextChange = (item: ScannedField) => {
    const newText = editValues[item.id]?.text ?? item.text;
    if (newText === item.text) return;
    const existingIdx = changes.findIndex(c => c.id === item.id);
    const newChange: Change = {
      type: 'text',
      id: item.id,
      className: item.className,
      file: item.file,
      occurrence: item.occurrence,
      newText,
    };
    if (existingIdx >= 0) {
      setChanges(prev => { const u = [...prev]; u[existingIdx] = newChange; return u; });
    } else {
      setChanges(prev => [...prev, newChange]);
    }
  };

  const saveImageChange = (item: ScannedImage, src?: string, alt?: string) => {
    const newSrc = src ?? editValues[item.id]?.src ?? item.src;
    const newAlt = alt ?? editValues[item.id]?.alt ?? item.alt;
    const existingIdx = changes.findIndex(c => c.id === item.id);
    const newChange: Change = {
      type: 'image',
      id: item.id,
      file: item.file,
      oldSrc: item.src,
      occurrence: item.occurrence,
      newSrc,
      newAlt,
    };
    if (existingIdx >= 0) {
      setChanges(prev => { const u = [...prev]; u[existingIdx] = newChange; return u; });
    } else {
      setChanges(prev => [...prev, newChange]);
    }
  };

  const saveTestimonialChange = (item: ScannedTestimonial) => {
    const newBadge = editValues[item.id]?.badge ?? item.badge;
    const newText = editValues[item.id]?.text ?? item.text;
    const newAuthor = editValues[item.id]?.author ?? item.author;
    const newPosition = editValues[item.id]?.position ?? item.position;
    const existingIdx = changes.findIndex(c => c.id === item.id);
    const newChange: Change = {
      type: 'testimonial',
      id: item.id,
      file: item.file,
      occurrence: item.occurrence,
      newBadge,
      newText,
      newAuthor,
      newPosition,
    };
    if (existingIdx >= 0) {
      setChanges(prev => { const u = [...prev]; u[existingIdx] = newChange; return u; });
    } else {
      setChanges(prev => [...prev, newChange]);
    }
  };

  const handleImageUpload = async (item: ScannedImage, file: File) => {
    setUploading(item.id);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        updateEditValue(item.id, 'src', data.path);
        saveImageChange(item, data.path);
        setStatus({ type: 'success', message: 'Image uploaded! Click "Publish" to apply.' });
        setTimeout(() => setStatus(null), 3000);
      } else {
        setStatus({ type: 'error', message: 'Failed to upload image' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Upload failed' });
    }
    setUploading(null);
  };

  const handlePublish = async () => {
    if (changes.length === 0) return;
    setPublishing(true);
    setStatus(null);
    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', message: `Published ${changes.length} change${changes.length > 1 ? 's' : ''} to your website!` });
        setTimeout(() => { setStatus(null); loadContent(); }, 3000);
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to publish' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please try again.' });
    }
    setPublishing(false);
  };

  /* ────── RENDERERS ────── */

  const renderTextItem = (item: ScannedField) => {
    const isChanged = hasChangesForItem(item.id);
    const change = getChangeForItem(item.id);
    const displayValue = (change && change.type === 'text') ? change.newText : item.text;
    const currentValue = editValues[item.id]?.text ?? displayValue;

    return (
      <div key={item.id} className={`bg-zinc-950 border rounded-lg p-4 transition-all ${isChanged ? 'border-sky-500/40 shadow-md shadow-sky-500/5' : 'border-zinc-800'}`}>
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-sky-500 mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {isChanged && (
              <span className="inline-block text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded mb-2 font-medium">Changed</span>
            )}
            <textarea
              value={currentValue}
              onChange={(e) => updateEditValue(item.id, 'text', e.target.value)}
              onBlur={() => saveTextChange(item)}
              rows={Math.max(1, Math.min(Math.ceil(currentValue.length / 70), 4))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2.5 text-white text-sm leading-relaxed focus:outline-none focus:border-sky-500 transition-colors resize-none placeholder:text-zinc-600"
              placeholder="Enter text..."
            />
          </div>
        </div>
      </div>
    );
  };

  const renderImageItem = (item: ScannedImage) => {
    const isChanged = hasChangesForItem(item.id);
    const change = getChangeForItem(item.id);
    const displaySrc = (change && change.type === 'image') ? change.newSrc : item.src;
    const displayAlt = (change && change.type === 'image') ? change.newAlt : item.alt;
    const currentSrc = editValues[item.id]?.src ?? displaySrc;
    const currentAlt = editValues[item.id]?.alt ?? displayAlt;
    const isUploading = uploading === item.id;

    return (
      <div key={item.id} className={`bg-zinc-950 border rounded-lg p-4 transition-all ${isChanged ? 'border-sky-500/40 shadow-md shadow-sky-500/5' : 'border-zinc-800'}`}>
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-28 h-28 bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden flex items-center justify-center">
            {currentSrc ? (
              <img
                src={`/${currentSrc}`}
                alt={currentAlt}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="color:#52525b;font-size:11px;text-align:center;padding:16px">Preview unavailable</div>';
                }}
              />
            ) : (
              <ImageIcon className="w-10 h-10 text-zinc-700" />
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 min-w-0 space-y-3">
            {isChanged && (
              <span className="inline-block text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-medium">Changed</span>
            )}

            <div>
              <label className="flex items-center gap-2 text-white text-sm font-medium mb-2">
                <Upload className="w-4 h-4 text-sky-500" />
                Replace Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(item, file);
                }}
                disabled={isUploading}
                className="w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-500 file:text-white hover:file:bg-sky-400 file:cursor-pointer cursor-pointer disabled:opacity-50"
              />
              {isUploading && (
                <div className="flex items-center gap-2 mt-2 text-sky-400 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>

            <div>
              <label className="text-zinc-500 text-xs mb-1 block">Description</label>
              <input
                type="text"
                value={currentAlt}
                onChange={(e) => updateEditValue(item.id, 'alt', e.target.value)}
                onBlur={() => saveImageChange(item)}
                placeholder="Describe the image..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTestimonialItem = (item: ScannedTestimonial) => {
    const isChanged = hasChangesForItem(item.id);
    const change = getChangeForItem(item.id);
    const displayBadge = (change && change.type === 'testimonial') ? change.newBadge : item.badge;
    const displayText = (change && change.type === 'testimonial') ? change.newText : item.text;
    const displayAuthor = (change && change.type === 'testimonial') ? change.newAuthor : item.author;
    const displayPosition = (change && change.type === 'testimonial') ? change.newPosition : item.position;

    const currentBadge = editValues[item.id]?.badge ?? displayBadge;
    const currentText = editValues[item.id]?.text ?? displayText;
    const currentAuthor = editValues[item.id]?.author ?? displayAuthor;
    const currentPosition = editValues[item.id]?.position ?? displayPosition;

    return (
      <div key={item.id} className={`bg-zinc-950 border rounded-lg p-4 transition-all ${isChanged ? 'border-sky-500/40 shadow-md shadow-sky-500/5' : 'border-zinc-800'}`}>
        <div className="flex items-start gap-3">
          <MessageSquare className="w-4 h-4 text-teal-500 mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-3">
            {isChanged && (
              <span className="inline-block text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-medium">Changed</span>
            )}

            <div>
              <label className="text-zinc-500 text-xs mb-1 block">Label</label>
              <input
                type="text"
                value={currentBadge}
                onChange={(e) => updateEditValue(item.id, 'badge', e.target.value)}
                onBlur={() => saveTestimonialChange(item)}
                placeholder="e.g., NFL Athlete"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-zinc-500 text-xs mb-1 block">Quote</label>
              <textarea
                value={currentText}
                onChange={(e) => updateEditValue(item.id, 'text', e.target.value)}
                onBlur={() => saveTestimonialChange(item)}
                placeholder="The testimonial quote..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm leading-relaxed focus:outline-none focus:border-sky-500 transition-colors resize-none placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Name</label>
                <input
                  type="text"
                  value={currentAuthor}
                  onChange={(e) => updateEditValue(item.id, 'author', e.target.value)}
                  onBlur={() => saveTestimonialChange(item)}
                  placeholder="John Doe"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-xs mb-1 block">Title</label>
                <input
                  type="text"
                  value={currentPosition}
                  onChange={(e) => updateEditValue(item.id, 'position', e.target.value)}
                  onBlur={() => saveTestimonialChange(item)}
                  placeholder="CEO, Company"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder:text-zinc-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContentItem = (item: ScannedContent) => {
    if (item.type === 'text') return renderTextItem(item);
    if (item.type === 'image') return renderImageItem(item);
    if (item.type === 'testimonial') return renderTestimonialItem(item);
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <span className="text-zinc-400 text-lg">Loading your website content...</span>
      </div>
    );
  }

  const tabs = Object.keys(grouped);
  const sections = grouped[activeTab] || {};
  const sectionNames = Object.keys(sections);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Edit Website Content</h1>
        <p className="text-zinc-500 text-base">
          Make changes below, then click Publish to update your live website.
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className={`flex items-center gap-3 mb-6 p-4 rounded-lg border ${
          status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          )}
          <span className={`text-sm font-medium ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {status.message}
          </span>
        </div>
      )}

      {/* Sticky Publish Bar */}
      {changes.length > 0 && (
        <div className="sticky top-0 z-10 mb-6 p-4 bg-sky-600 rounded-lg shadow-xl shadow-sky-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full">
                <span className="text-white font-bold text-sm">{changes.length}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Unsaved changes</p>
                <p className="text-sky-100/70 text-xs">Publish to update your live website</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setChanges([]); setEditValues({}); }}
                className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-md hover:bg-white/20 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-6 py-2 bg-white text-sky-700 text-sm font-bold rounded-md hover:bg-sky-50 transition-colors disabled:opacity-50 shadow-lg"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {publishing ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sections */}
      {sectionNames.length === 0 ? (
        <div className="text-center py-24 md:py-32 text-zinc-600">
          <p className="text-lg">No content found for this page</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sectionNames.map(sectionName => {
            const isExpanded = expandedSections[`${activeTab}-${sectionName}`] !== false;
            const items = sections[sectionName];
            const textCount = items.filter(i => i.type === 'text').length;
            const imageCount = items.filter(i => i.type === 'image').length;
            const testimonialCount = items.filter(i => i.type === 'testimonial').length;

            return (
              <div key={sectionName} className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(`${activeTab}-${sectionName}`)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-sky-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-600" />
                    )}
                    <h3 className="text-white font-semibold">{sectionName}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {textCount > 0 && (
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">{textCount} text</span>
                    )}
                    {imageCount > 0 && (
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">{imageCount} images</span>
                    )}
                    {testimonialCount > 0 && (
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">{testimonialCount} reviews</span>
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 space-y-3">
                    {items.map(item => renderContentItem(item))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
