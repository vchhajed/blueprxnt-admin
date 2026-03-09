'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Eye, EyeOff, X, Check, Upload, Loader2, Send,
  Monitor, RefreshCw, Type, ImageIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ── Types ──────────────────────────────────────────────────────────────────────

type ClickedElement =
  | { itemType: 'text'; text: string; className: string; occurrence: number; file: string }
  | { itemType: 'image'; src: string; alt: string; occurrence: number; file: string }
  | { itemType: 'section'; selectorKey: string; label: string; visible: boolean; file: string };

type Change =
  | { type: 'text'; className: string; occurrence: number; newText: string; file: string }
  | { type: 'section-visibility'; selectorKey: string; visible: boolean; file: string }
  | { type: 'image'; oldSrc: string; occurrence: number; newSrc: string; newAlt: string; file: string };

// ── Constants ──────────────────────────────────────────────────────────────────

const PAGES = [
  { label: 'Home', file: 'index.html' },
  { label: 'Coaching', file: 'coaching.html' },
  { label: 'About', file: 'about.html' },
  { label: 'System', file: 'system.html' },
  { label: 'Contact', file: 'contact.html' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const { toast } = useToast();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [activePage, setActivePage] = useState('index.html');
  const [iframeKey, setIframeKey] = useState(0); // force reload
  const [iframeLoading, setIframeLoading] = useState(true);

  const [clicked, setClicked] = useState<ClickedElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Edit form state
  const [editText, setEditText] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editSrc, setEditSrc] = useState('');
  const [editVisible, setEditVisible] = useState(true);

  // Pending changes (keyed by unique id)
  const [changes, setChanges] = useState<Record<string, Change>>({});
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const changeCount = Object.keys(changes).length;

  // ── iframe messaging ────────────────────────────────────────────────────────

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const msg = e.data;
      if (!msg?.type) return;

      if (msg.type === 'navigate') {
        const page = PAGES.find(p => p.file === msg.file);
        if (page) switchPage(msg.file);
        return;
      }

      if (msg.type === 'deselect') {
        setPanelOpen(false);
        setClicked(null);
        return;
      }

      if (msg.type === 'element-click') {
        setClicked(msg as ClickedElement);
        setPanelOpen(true);

        if (msg.itemType === 'text') {
          setEditText(msg.text);
        } else if (msg.itemType === 'image') {
          setEditSrc(msg.src);
          setEditAlt(msg.alt);
        } else if (msg.itemType === 'section') {
          setEditVisible(msg.visible);
        }
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchPage(file: string) {
    setActivePage(file);
    setIframeKey(k => k + 1);
    setIframeLoading(true);
    setClicked(null);
    setPanelOpen(false);
  }

  function reloadIframe() {
    setIframeKey(k => k + 1);
    setIframeLoading(true);
    setClicked(null);
    setPanelOpen(false);
  }

  function postToIframe(msg: object) {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }

  // ── Apply text edit ─────────────────────────────────────────────────────────

  function applyText() {
    if (clicked?.itemType !== 'text') return;
    const key = `text::${clicked.file}::${clicked.className}::${clicked.occurrence}`;
    setChanges(prev => ({
      ...prev,
      [key]: { type: 'text', className: clicked.className, occurrence: clicked.occurrence, newText: editText, file: clicked.file },
    }));
    postToIframe({ type: 'update-text', className: clicked.className, occurrence: clicked.occurrence, newText: editText });
    toast({ title: 'Queued', description: 'Change queued — click Publish to save.' });
    setPanelOpen(false);
  }

  // ── Apply section visibility ────────────────────────────────────────────────

  function applySection(visible: boolean) {
    if (clicked?.itemType !== 'section') return;
    const key = `section::${clicked.file}::${clicked.selectorKey}`;
    setChanges(prev => ({
      ...prev,
      [key]: { type: 'section-visibility', selectorKey: clicked.selectorKey, visible, file: clicked.file },
    }));
    postToIframe({ type: 'update-section', selectorKey: clicked.selectorKey, visible });
    setEditVisible(visible);
    setClicked(prev => prev?.itemType === 'section' ? { ...prev, visible } : prev);
  }

  // ── Apply image edit ────────────────────────────────────────────────────────

  async function handleImageUpload(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload-image', { method: 'POST', body: form });
      const data = await res.json();
      if (data.url) {
        setEditSrc(data.url);
        toast({ title: 'Uploaded', description: 'Image uploaded — click Apply to use it.' });
      }
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload image.' });
    } finally {
      setUploading(false);
    }
  }

  function applyImage() {
    if (clicked?.itemType !== 'image') return;
    const key = `image::${clicked.file}::${clicked.occurrence}`;
    setChanges(prev => ({
      ...prev,
      [key]: { type: 'image', oldSrc: clicked.src, occurrence: clicked.occurrence, newSrc: editSrc, newAlt: editAlt, file: clicked.file },
    }));
    postToIframe({ type: 'update-image', occurrence: clicked.occurrence, newSrc: editSrc, newAlt: editAlt });
    toast({ title: 'Queued', description: 'Image change queued — click Publish to save.' });
    setPanelOpen(false);
  }

  // ── Publish all changes ─────────────────────────────────────────────────────

  async function publish() {
    if (changeCount === 0) return;
    setPublishing(true);
    try {
      const changesArr = Object.values(changes).map(c => {
        if (c.type === 'text') return { type: 'text', id: '', className: c.className, file: c.file, occurrence: c.occurrence, newText: c.newText };
        if (c.type === 'section-visibility') return { type: 'section-visibility', file: c.file, selectorKey: c.selectorKey, visible: c.visible };
        if (c.type === 'image') return { type: 'image', id: '', file: c.file, oldSrc: c.oldSrc, occurrence: c.occurrence, newSrc: c.newSrc, newAlt: c.newAlt };
        return c;
      });

      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changesArr }),
      });
      const data = await res.json();
      if (data.success) {
        setChanges({});
        toast({ title: 'Published!', description: 'Changes committed to blueprxnt-site.' });
        reloadIframe();
      } else {
        toast({ title: 'Publish failed', description: data.error });
      }
    } catch (e: any) {
      toast({ title: 'Publish failed', description: e.message });
    } finally {
      setPublishing(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-6 -my-8 md:-mx-8 md:-my-10">

      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-zinc-950 border-b border-zinc-800 shrink-0">
        <Monitor className="w-4 h-4 text-sky-500" />
        <span className="text-sm font-semibold text-white">Visual Editor</span>
        <span className="text-zinc-700">|</span>

        {/* Page Tabs */}
        <div className="flex gap-1">
          {PAGES.map(p => (
            <button
              key={p.file}
              onClick={() => switchPage(p.file)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activePage === p.file
                  ? 'bg-sky-500 text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={reloadIframe}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-all"
            title="Reload preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {changeCount > 0 && (
            <span className="text-xs text-amber-400 font-medium">
              {changeCount} unsaved change{changeCount !== 1 ? 's' : ''}
            </span>
          )}

          <button
            onClick={publish}
            disabled={changeCount === 0 || publishing}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-500 text-black text-xs font-bold rounded-md hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {publishing ? 'Publishing...' : `Publish${changeCount > 0 ? ` (${changeCount})` : ''}`}
          </button>
        </div>
      </div>

      {/* Hint bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/80 border-b border-zinc-800 shrink-0">
        <span className="text-xs text-zinc-500">
          <span className="text-sky-500 font-medium">Click any text or image</span> to edit it inline.
          <span className="text-sky-500 font-medium ml-2">Click a section border</span> to show/hide it.
          Nav links switch pages.
        </span>
      </div>

      {/* Main: iframe + panel */}
      <div className="flex flex-1 overflow-hidden">

        {/* iframe */}
        <div className="relative flex-1 overflow-hidden bg-zinc-950">
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                <p className="text-sm text-zinc-500">Loading preview...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={`/api/preview?file=${activePage}`}
            className="w-full h-full border-0"
            onLoad={() => setIframeLoading(false)}
            title="Site Preview"
          />
        </div>

        {/* Edit Panel */}
        <div className={`shrink-0 flex flex-col bg-zinc-950 border-l border-zinc-800 transition-all duration-300 overflow-hidden ${
          panelOpen ? 'w-80' : 'w-0'
        }`}>
          {panelOpen && clicked && (
            <div className="flex flex-col h-full w-80">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  {clicked.itemType === 'text' && <Type className="w-4 h-4 text-sky-500" />}
                  {clicked.itemType === 'image' && <ImageIcon className="w-4 h-4 text-sky-500" />}
                  {clicked.itemType === 'section' && <Eye className="w-4 h-4 text-sky-500" />}
                  <span className="text-sm font-semibold text-white capitalize">
                    Edit {clicked.itemType}
                  </span>
                </div>
                <button onClick={() => { setPanelOpen(false); setClicked(null); }} className="p-1 text-zinc-500 hover:text-white rounded-md">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Text editor */}
                {clicked.itemType === 'text' && (
                  <>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">CSS class: <code className="text-sky-400">.{clicked.className}</code></p>
                      <p className="text-xs text-zinc-500 mb-3">Occurrence #{clicked.occurrence} in <span className="text-zinc-300">{clicked.file}</span></p>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={6}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 resize-none"
                        placeholder="Enter text..."
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={applyText}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-sky-500 text-black text-sm font-bold rounded-lg hover:bg-sky-400 transition-all"
                    >
                      <Check className="w-4 h-4" /> Apply Change
                    </button>
                  </>
                )}

                {/* Image editor */}
                {clicked.itemType === 'image' && (
                  <>
                    <div>
                      <p className="text-xs text-zinc-500 mb-3">Image #{clicked.occurrence} in <span className="text-zinc-300">{clicked.file}</span></p>

                      {/* Current image preview */}
                      {editSrc && (
                        <div className="mb-3 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={editSrc} alt={editAlt} className="w-full h-32 object-cover" />
                        </div>
                      )}

                      {/* Upload */}
                      <label className="flex items-center justify-center gap-2 w-full py-2 mb-3 border border-dashed border-zinc-700 rounded-lg text-xs text-zinc-400 hover:border-sky-500 hover:text-sky-400 cursor-pointer transition-all">
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Upload new image'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleImageUpload(f);
                        }} />
                      </label>

                      <p className="text-xs text-zinc-500 mb-1">Or paste image URL:</p>
                      <input
                        value={editSrc}
                        onChange={e => setEditSrc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 mb-3"
                        placeholder="https://..."
                      />

                      <p className="text-xs text-zinc-500 mb-1">Alt text:</p>
                      <input
                        value={editAlt}
                        onChange={e => setEditAlt(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
                        placeholder="Describe the image..."
                      />
                    </div>
                    <button
                      onClick={applyImage}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-sky-500 text-black text-sm font-bold rounded-lg hover:bg-sky-400 transition-all"
                    >
                      <Check className="w-4 h-4" /> Apply Image
                    </button>
                  </>
                )}

                {/* Section visibility */}
                {clicked.itemType === 'section' && (
                  <>
                    <div className="space-y-3">
                      <p className="text-xs text-zinc-500">
                        Section: <code className="text-sky-400">{clicked.selectorKey}</code>
                        <br />in <span className="text-zinc-300">{clicked.file}</span>
                      </p>

                      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                        <p className="text-sm font-medium text-white mb-3">Section Visibility</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => applySection(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              editVisible
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                          >
                            <Eye className="w-4 h-4" /> Show
                          </button>
                          <button
                            onClick={() => applySection(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                              !editVisible
                                ? 'bg-red-500 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                            }`}
                          >
                            <EyeOff className="w-4 h-4" /> Hide
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-600">
                        Hiding a section removes it from your live site. You can re-enable it anytime.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Pending changes list */}
              {changeCount > 0 && (
                <div className="border-t border-zinc-800 px-4 py-3 shrink-0">
                  <p className="text-xs text-zinc-500 mb-2 font-medium">PENDING CHANGES ({changeCount})</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Object.entries(changes).map(([key, c]) => (
                      <div key={key} className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 truncate flex-1">
                          {c.type === 'text' && `Text: .${c.className}`}
                          {c.type === 'section-visibility' && `Section: ${c.selectorKey} → ${c.visible ? 'shown' : 'hidden'}`}
                          {c.type === 'image' && `Image #${c.occurrence}`}
                        </span>
                        <button
                          onClick={() => setChanges(prev => { const n = { ...prev }; delete n[key]; return n; })}
                          className="ml-2 text-zinc-600 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
