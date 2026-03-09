'use client';

import { useState, useEffect } from 'react';
import {
  Eye, EyeOff, ChevronDown, ChevronUp,
  Loader2, Upload, FileText, Image as ImageIcon,
  MessageSquare, Link as LinkIcon, List, Globe,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScannedField {
  id: string; file: string; className: string; tag: string;
  text: string; section: string; occurrence: number; type: 'text';
}
interface ScannedImage {
  id: string; file: string; src: string; alt: string;
  section: string; occurrence: number; type: 'image';
}
interface ScannedTestimonial {
  id: string; file: string; badge: string; text: string;
  author: string; position: string; section: string; occurrence: number; type: 'testimonial';
}
interface ScannedSection {
  id: string; file: string; tag: string; htmlId: string; htmlClass: string;
  label: string; visible: boolean; selectorKey: string; type: 'section';
}
interface ScannedMeta {
  id: string; file: string; metaKey: 'title' | 'description'; value: string; type: 'meta';
}
interface ScannedNavLink {
  id: string; file: string; href: string; text: string; occurrence: number; type: 'nav-link';
}
interface ScannedListItem {
  id: string; file: string; itemClass: string; index: number; text: string;
  visible: boolean; section: string; type: 'list-item';
}
interface ScannedLink {
  id: string; file: string; className: string; href: string; text: string;
  occurrence: number; section: string; type: 'link';
}

type AnyItem = ScannedField | ScannedImage | ScannedTestimonial | ScannedSection | ScannedMeta | ScannedNavLink | ScannedListItem | ScannedLink;

// ── Page tabs ─────────────────────────────────────────────────────────────────

const PAGE_TABS = [
  { label: 'Home', file: 'index.html' },
  { label: 'Coaching', file: 'coaching.html' },
  { label: 'About', file: 'about.html' },
  { label: 'System', file: 'system.html' },
  { label: 'Contact', file: 'contact.html' },
];

const LIST_ITEM_GROUPS = [
  { itemClass: 'trusted-name', label: 'NFL Teams' },
  { itemClass: 'trusted-name-sm', label: 'NCAA Teams' },
  { itemClass: 'tag', label: 'System Tags' },
  { itemClass: 'problem-item', label: 'Problem Points' },
  { itemClass: 'result-item', label: 'Results List' },
  { itemClass: 'process-card-new', label: 'Process Steps (Title)' },
  { itemClass: 'process-card-new-desc', label: 'Process Steps (Description)' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const { toast } = useToast();

  const [activePage, setActivePage] = useState('index.html');
  const [content, setContent] = useState<AnyItem[]>([]);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Local edit state (mirrors change values, initialised from item on first edit)
  const [editValues, setEditValues] = useState<Record<string, any>>({});

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/site-content');
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setChanges({});
        setEditValues({});
      } else {
        toast({ title: 'Error loading content', description: data.error });
      }
    } catch (err) {
      toast({ title: 'Failed to load content' });
    }
    setLoading(false);
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const pageItems = content.filter(item => item.file === activePage);

  const getItems = <T extends AnyItem>(type: T['type']): T[] =>
    pageItems.filter(item => item.type === type) as T[];

  const getListItemsByClass = (itemClass: string): ScannedListItem[] =>
    pageItems.filter(
      item => item.type === 'list-item' && (item as ScannedListItem).itemClass === itemClass
    ) as ScannedListItem[];

  const getEditVal = (id: string, field: string, fallback: any) =>
    editValues[id]?.[field] !== undefined ? editValues[id][field] : fallback;

  const setEdit = (id: string, field: string, value: any) => {
    setEditValues(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  };

  const upsertChange = (id: string, changeData: any) => {
    setChanges(prev => ({ ...prev, [id]: changeData }));
  };

  const toggleExpand = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isExpanded = (key: string, defaultOpen = true) =>
    expandedSections[key] !== undefined ? expandedSections[key] : defaultOpen;

  const changeCount = Object.keys(changes).length;

  // ── Publish ──────────────────────────────────────────────────────────────────

  const handlePublish = async () => {
    if (changeCount === 0) return;
    setPublishing(true);

    // Convert changes record to array for API
    const changesArray = Object.values(changes);

    try {
      const res = await fetch('/api/site-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes: changesArray }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Published successfully!', description: `${changeCount} change${changeCount !== 1 ? 's' : ''} published to your website.` });
        setTimeout(() => loadContent(), 1500);
      } else {
        toast({ title: 'Publish failed', description: data.error });
      }
    } catch {
      toast({ title: 'Network error', description: 'Please try again.' });
    }
    setPublishing(false);
  };

  // ── Sub-renderers ─────────────────────────────────────────────────────────────

  const CollapsibleCard = ({
    cardKey,
    title,
    badge,
    dimmed = false,
    rightSlot,
    defaultOpen = false,
    children,
  }: {
    cardKey: string;
    title: string;
    badge?: React.ReactNode;
    dimmed?: boolean;
    rightSlot?: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
  }) => {
    const open = isExpanded(cardKey, defaultOpen);
    return (
      <div className={`border border-zinc-800 rounded-xl overflow-hidden transition-opacity ${dimmed ? 'opacity-50' : ''}`}>
        <button
          type="button"
          onClick={() => toggleExpand(cardKey)}
          className="w-full flex items-center justify-between px-6 py-4 bg-zinc-900 hover:bg-zinc-800/60 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            {open ? <ChevronUp className="w-4 h-4 text-sky-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            <span className="text-white font-semibold text-sm">{title}</span>
            {badge}
          </div>
          {rightSlot}
        </button>
        {open && (
          <div className="px-6 pb-6 pt-4 bg-zinc-900/40 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  // SEO / Meta card
  const renderSEOCard = () => {
    const metas = getItems<ScannedMeta>('meta');
    const titleItem = metas.find(m => m.metaKey === 'title');
    const descItem = metas.find(m => m.metaKey === 'description');

    return (
      <CollapsibleCard cardKey={`${activePage}-seo`} title="SEO & Meta" defaultOpen={true}>
        <div className="space-y-4">
          {titleItem && (
            <div>
              <label className="text-zinc-400 text-xs mb-1 block font-medium">Page Title</label>
              <input
                type="text"
                value={getEditVal(titleItem.id, 'value', titleItem.value)}
                onChange={e => setEdit(titleItem.id, 'value', e.target.value)}
                onBlur={e => {
                  const val = e.target.value;
                  if (val !== titleItem.value) {
                    upsertChange(titleItem.id, { type: 'meta', file: titleItem.file, metaKey: 'title', newValue: val });
                  }
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                placeholder="Page title..."
              />
            </div>
          )}
          {descItem && (
            <div>
              <label className="text-zinc-400 text-xs mb-1 block font-medium">Meta Description</label>
              <textarea
                value={getEditVal(descItem.id, 'value', descItem.value)}
                onChange={e => setEdit(descItem.id, 'value', e.target.value)}
                onBlur={e => {
                  const val = e.target.value;
                  if (val !== descItem.value) {
                    upsertChange(descItem.id, { type: 'meta', file: descItem.file, metaKey: 'description', newValue: val });
                  }
                }}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors resize-none"
                placeholder="Meta description..."
              />
            </div>
          )}
          {!titleItem && !descItem && (
            <p className="text-zinc-500 text-sm">No meta fields found for this page.</p>
          )}
        </div>
      </CollapsibleCard>
    );
  };

  // Nav links card (index.html only)
  const renderNavCard = () => {
    if (activePage !== 'index.html') return null;
    const navLinks = getItems<ScannedNavLink>('nav-link');
    if (navLinks.length === 0) return null;

    return (
      <CollapsibleCard cardKey={`${activePage}-nav`} title="Navigation Links">
        <div className="space-y-3">
          {navLinks.map(link => {
            const changed = !!changes[link.id];
            return (
              <div key={link.id} className={`bg-zinc-950 border rounded-lg p-3 space-y-2 ${changed ? 'border-sky-500/40' : 'border-zinc-800'}`}>
                {changed && <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-medium">Changed</span>}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">Text</label>
                    <input
                      type="text"
                      value={getEditVal(link.id, 'text', link.text)}
                      onChange={e => setEdit(link.id, 'text', e.target.value)}
                      onBlur={() => {
                        const text = getEditVal(link.id, 'text', link.text);
                        const href = getEditVal(link.id, 'href', link.href);
                        if (text !== link.text || href !== link.href) {
                          upsertChange(link.id, { type: 'nav-link', file: link.file, occurrence: link.occurrence, newText: text, newHref: href });
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-500 text-xs mb-1 block">URL</label>
                    <input
                      type="text"
                      value={getEditVal(link.id, 'href', link.href)}
                      onChange={e => setEdit(link.id, 'href', e.target.value)}
                      onBlur={() => {
                        const text = getEditVal(link.id, 'text', link.text);
                        const href = getEditVal(link.id, 'href', link.href);
                        if (text !== link.text || href !== link.href) {
                          upsertChange(link.id, { type: 'nav-link', file: link.file, occurrence: link.occurrence, newText: text, newHref: href });
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleCard>
    );
  };

  // Section controls
  const renderSectionControls = () => {
    const sections = getItems<ScannedSection>('section');
    if (sections.length === 0) return null;

    return (
      <CollapsibleCard cardKey={`${activePage}-sections`} title="Page Sections" defaultOpen={true}>
        <div className="space-y-2">
          {sections.map(sec => {
            const changeEntry = changes[sec.id];
            const currentVisible = changeEntry !== undefined ? changeEntry.visible : sec.visible;
            return (
              <div
                key={sec.id}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-opacity ${
                  currentVisible ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800 bg-zinc-950 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium">{sec.label}</span>
                  {!currentVisible && (
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded font-medium">Hidden</span>
                  )}
                  {changeEntry && (
                    <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-medium">Changed</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newVisible = !currentVisible;
                    upsertChange(sec.id, {
                      type: 'section-visibility',
                      file: sec.file,
                      selectorKey: sec.selectorKey,
                      visible: newVisible,
                    });
                  }}
                  className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                  title={currentVisible ? 'Hide section' : 'Show section'}
                >
                  {currentVisible
                    ? <Eye className="w-4 h-4 text-sky-400" />
                    : <EyeOff className="w-4 h-4 text-zinc-500" />}
                </button>
              </div>
            );
          })}
        </div>
      </CollapsibleCard>
    );
  };

  // List items (index.html special cards)
  const renderListItemGroup = (itemClass: string, label: string) => {
    const items = getListItemsByClass(itemClass);
    if (items.length === 0) return null;

    const isProcessTitle = itemClass === 'process-card-new';
    const isProcessDesc = itemClass === 'process-card-new-desc';
    const isProcess = isProcessTitle || isProcessDesc;
    const hasVisibility = !isProcess;

    return (
      <CollapsibleCard key={`${activePage}-list-${itemClass}`} cardKey={`${activePage}-list-${itemClass}`} title={label}>
        <div className="space-y-2">
          {items.map(item => {
            const changeEntry = changes[item.id];
            const currentText = getEditVal(item.id, 'text', item.text);
            const currentVisible = changeEntry !== undefined ? changeEntry.visible : item.visible;
            const changed = !!changeEntry;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                  changed ? 'border-sky-500/40 bg-zinc-950' : 'border-zinc-800 bg-zinc-950'
                } ${!currentVisible && hasVisibility ? 'opacity-50' : ''}`}
              >
                <input
                  type="text"
                  value={currentText}
                  onChange={e => setEdit(item.id, 'text', e.target.value)}
                  onBlur={() => {
                    const text = getEditVal(item.id, 'text', item.text);
                    const vis = changeEntry !== undefined ? changeEntry.visible : item.visible;
                    upsertChange(item.id, {
                      type: 'list-item',
                      file: item.file,
                      itemClass: item.itemClass,
                      index: item.index,
                      newText: text,
                      visible: vis,
                    });
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-sky-500 transition-colors"
                />
                {hasVisibility && (
                  <button
                    type="button"
                    onClick={() => {
                      const text = getEditVal(item.id, 'text', item.text);
                      const newVisible = !currentVisible;
                      upsertChange(item.id, {
                        type: 'list-item',
                        file: item.file,
                        itemClass: item.itemClass,
                        index: item.index,
                        newText: text,
                        visible: newVisible,
                      });
                    }}
                    className="p-1.5 rounded hover:bg-zinc-700 transition-colors flex-shrink-0"
                    title={currentVisible ? 'Hide' : 'Show'}
                  >
                    {currentVisible
                      ? <Eye className="w-4 h-4 text-sky-400" />
                      : <EyeOff className="w-4 h-4 text-zinc-500" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleCard>
    );
  };

  const renderListItemsSection = () => {
    if (activePage !== 'index.html') return null;
    return (
      <>
        {LIST_ITEM_GROUPS.map(({ itemClass, label }) =>
          renderListItemGroup(itemClass, label)
        )}
      </>
    );
  };

  // Text fields by section
  const renderTextSections = () => {
    const textItems = getItems<ScannedField>('text');
    const imageItems = getItems<ScannedImage>('image');
    const testimonialItems = getItems<ScannedTestimonial>('testimonial');

    // Group by section
    const sectionMap: Record<string, { texts: ScannedField[]; images: ScannedImage[]; testimonials: ScannedTestimonial[] }> = {};
    for (const item of textItems) {
      if (!sectionMap[item.section]) sectionMap[item.section] = { texts: [], images: [], testimonials: [] };
      sectionMap[item.section].texts.push(item);
    }
    for (const item of imageItems) {
      if (!sectionMap[item.section]) sectionMap[item.section] = { texts: [], images: [], testimonials: [] };
      sectionMap[item.section].images.push(item);
    }
    for (const item of testimonialItems) {
      if (!sectionMap[item.section]) sectionMap[item.section] = { texts: [], images: [], testimonials: [] };
      sectionMap[item.section].testimonials.push(item);
    }

    return Object.entries(sectionMap).map(([sectionName, { texts, images, testimonials }]) => (
      <CollapsibleCard key={`${activePage}-section-${sectionName}`} cardKey={`${activePage}-section-${sectionName}`} title={sectionName}>
        <div className="space-y-3">
          {texts.map(item => {
            const changed = !!changes[item.id];
            const currentVal = getEditVal(item.id, 'text', item.text);
            return (
              <div key={item.id} className={`bg-zinc-950 border rounded-lg p-3 ${changed ? 'border-sky-500/40' : 'border-zinc-800'}`}>
                <div className="flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-500 mt-2.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    {changed && <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded mb-1.5 inline-block font-medium">Changed</span>}
                    <textarea
                      value={currentVal}
                      onChange={e => setEdit(item.id, 'text', e.target.value)}
                      onBlur={() => {
                        const val = getEditVal(item.id, 'text', item.text);
                        if (val !== item.text) {
                          upsertChange(item.id, { type: 'text', id: item.id, className: item.className, file: item.file, occurrence: item.occurrence, newText: val });
                        }
                      }}
                      rows={Math.max(1, Math.min(Math.ceil(currentVal.length / 70), 4))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-2 text-white text-sm leading-relaxed focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {images.map(item => {
            const changed = !!changes[item.id];
            const currentAlt = getEditVal(item.id, 'alt', item.alt);
            return (
              <div key={item.id} className={`bg-zinc-950 border rounded-lg p-3 ${changed ? 'border-sky-500/40' : 'border-zinc-800'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 flex-shrink-0 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex items-center justify-center">
                    {item.src ? (
                      <img src={`/${item.src}`} alt={item.alt} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {changed && <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded mb-1.5 inline-block font-medium">Changed</span>}
                    <label className="text-zinc-500 text-xs mb-1 block">Alt Text</label>
                    <input
                      type="text"
                      value={currentAlt}
                      onChange={e => setEdit(item.id, 'alt', e.target.value)}
                      onBlur={() => {
                        const alt = getEditVal(item.id, 'alt', item.alt);
                        const src = getEditVal(item.id, 'src', item.src);
                        if (alt !== item.alt || src !== item.src) {
                          upsertChange(item.id, { type: 'image', id: item.id, file: item.file, oldSrc: item.src, occurrence: item.occurrence, newSrc: src, newAlt: alt });
                        }
                      }}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-2 text-white text-sm focus:outline-none focus:border-sky-500"
                      placeholder="Image description..."
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {testimonials.map(item => {
            const changed = !!changes[item.id];
            const currentBadge = getEditVal(item.id, 'badge', item.badge);
            const currentText = getEditVal(item.id, 'text', item.text);
            const currentAuthor = getEditVal(item.id, 'author', item.author);
            const currentPosition = getEditVal(item.id, 'position', item.position);

            const saveTestimonial = () => {
              upsertChange(item.id, {
                type: 'testimonial', id: item.id, file: item.file, occurrence: item.occurrence,
                newBadge: getEditVal(item.id, 'badge', item.badge),
                newText: getEditVal(item.id, 'text', item.text),
                newAuthor: getEditVal(item.id, 'author', item.author),
                newPosition: getEditVal(item.id, 'position', item.position),
              });
            };

            return (
              <div key={item.id} className={`bg-zinc-950 border rounded-lg p-3 space-y-2 ${changed ? 'border-sky-500/40' : 'border-zinc-800'}`}>
                {changed && <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded font-medium">Changed</span>}
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                  <input type="text" value={currentBadge} onChange={e => setEdit(item.id, 'badge', e.target.value)} onBlur={saveTestimonial} placeholder="Badge/label" className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-sky-500" />
                </div>
                <textarea value={currentText} onChange={e => setEdit(item.id, 'text', e.target.value)} onBlur={saveTestimonial} rows={3} placeholder="Quote..." className="w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-2 text-white text-sm resize-none focus:outline-none focus:border-sky-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={currentAuthor} onChange={e => setEdit(item.id, 'author', e.target.value)} onBlur={saveTestimonial} placeholder="Author name" className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-sky-500" />
                  <input type="text" value={currentPosition} onChange={e => setEdit(item.id, 'position', e.target.value)} onBlur={saveTestimonial} placeholder="Title / Company" className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-sky-500" />
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleCard>
    ));
  };

  // ── Main render ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        <span className="text-zinc-400 text-lg">Loading site content...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Site Content</h1>
          <p className="text-zinc-500 text-sm mt-1">Edit your website content and publish changes live.</p>
        </div>
        <button
          type="button"
          onClick={handlePublish}
          disabled={changeCount === 0 || publishing}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-lg shadow-sky-500/20"
        >
          {publishing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Publish Changes
          {changeCount > 0 && (
            <span className="ml-1 bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {changeCount}
            </span>
          )}
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {PAGE_TABS.map(({ label, file }) => (
          <button
            key={file}
            type="button"
            onClick={() => setActivePage(file)}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activePage === file
                ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Cards */}
      <div className="space-y-4">
        {renderSEOCard()}
        {renderNavCard()}
        {renderSectionControls()}
        {renderListItemsSection()}
        {renderTextSections()}
      </div>
    </div>
  );
}
