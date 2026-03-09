import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const HTML_FILES = [
  { file: 'index.html', name: 'Home' },
  { file: 'system.html', name: 'System' },
  { file: 'coaching.html', name: 'Coaching' },
  { file: 'about.html', name: 'About' },
  { file: 'contact.html', name: 'Contact' },
];

const EDITABLE_TAGS = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'a', 'button', 'li', 'label'];

const SKIP_CLASSES = [
  'nav-menu', 'nav-container', 'hero-background', 'hero-cta-group',
  'trusted-divider-line', 'mobile-menu-toggle', 'footer-bottom-links',
];

// ── Interfaces ────────────────────────────────────────────────────────────────

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

type ScannedContent =
  | ScannedField
  | ScannedImage
  | ScannedTestimonial
  | ScannedSection
  | ScannedMeta
  | ScannedNavLink
  | ScannedListItem
  | ScannedLink;

// ── GitHub helpers ────────────────────────────────────────────────────────────

async function githubGet(filePath: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`GitHub GET ${filePath} failed: ${res.status}`);
  const data = await res.json();
  return {
    content: Buffer.from(data.content, 'base64').toString('utf-8'),
    sha: data.sha,
  };
}

async function githubPut(filePath: string, content: string, sha: string, message: string) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${filePath} failed: ${res.status} – ${err}`);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function detectSections(html: string) {
  const sections: { name: string; pos: number }[] = [];
  const re = /<!--\s*(.+?)\s*-->/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const name = m[1].trim();
    if (name.length < 50 && !name.startsWith('/') && !name.includes('Google') && !name.includes('script')) {
      sections.push({ name, pos: m.index });
    }
  }
  return sections;
}

function getSection(pos: number, sections: { name: string; pos: number }[]) {
  let current = 'Top';
  for (const s of sections) {
    if (s.pos <= pos) current = s.name; else break;
  }
  return current;
}

// ── Scanners ──────────────────────────────────────────────────────────────────

function scanTextFields(html: string, fileName: string, sections: ReturnType<typeof detectSections>): ScannedField[] {
  const fields: ScannedField[] = [];
  const classCount: Record<string, number> = {};
  const tagPattern = EDITABLE_TAGS.join('|');
  const re = new RegExp(`<(${tagPattern})([^>]*class="([^"]+)"[^>]*)>([\\s\\S]*?)<\\/\\1>`, 'gi');
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const classes = m[3].split(/\s+/).filter(Boolean);
    const primaryClass = classes[0];
    if (!primaryClass || SKIP_CLASSES.some(sc => classes.includes(sc))) continue;
    const text = m[4].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (text.length < 2 || text.length > 500) continue;
    const key = `${fileName}:${primaryClass}`;
    classCount[key] = (classCount[key] || 0) + 1;
    const occurrence = classCount[key];
    fields.push({
      id: occurrence > 1 ? `${fileName}::${primaryClass}::${occurrence}` : `${fileName}::${primaryClass}`,
      file: fileName, className: primaryClass, tag, text,
      section: getSection(m.index, sections), occurrence, type: 'text',
    });
  }
  return fields;
}

function scanImages(html: string, fileName: string, sections: ReturnType<typeof detectSections>): ScannedImage[] {
  const images: ScannedImage[] = [];
  const srcCount: Record<string, number> = {};
  const re = /<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const src = m[1], alt = m[2];
    if (src.includes('logo')) continue;
    const key = `${fileName}:${src}`;
    srcCount[key] = (srcCount[key] || 0) + 1;
    const occurrence = srcCount[key];
    images.push({
      id: occurrence > 1 ? `${fileName}::img::${src}::${occurrence}` : `${fileName}::img::${src}`,
      file: fileName, src, alt,
      section: getSection(m.index, sections), occurrence, type: 'image',
    });
  }
  return images;
}

function scanTestimonials(html: string, fileName: string, sections: ReturnType<typeof detectSections>): ScannedTestimonial[] {
  const testimonials: ScannedTestimonial[] = [];
  let occurrence = 0;
  const re = /<div\s+class="testimonial-box"[^>]*>([\s\S]*?)<\/div>\s*(?=<div\s+class="testimonial-box"|<\/div>)/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const content = m[1];
    const badge = (content.match(/<span\s+class="testimonial-badge"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]?.trim() || '';
    const text = ((content.match(/<p\s+class="testimonial-text"[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '').replace(/<[^>]+>/g, '').trim();
    const author = (content.match(/<p\s+class="testimonial-author"[^>]*>([\s\S]*?)<\/p>/i) || [])[1]?.trim() || '';
    const position = (content.match(/<p\s+class="testimonial-position"[^>]*>([\s\S]*?)<\/p>/i) || [])[1]?.trim() || '';
    occurrence++;
    testimonials.push({
      id: `${fileName}::testimonial::${occurrence}`,
      file: fileName, badge, text, author, position,
      section: getSection(m.index, sections), occurrence, type: 'testimonial',
    });
  }
  return testimonials;
}

function scanSections(html: string, fileName: string): ScannedSection[] {
  const result: ScannedSection[] = [];
  const re = /<!--\s*([^-]+?)\s*-->\s*\n\s*<(section|nav|footer)([^>]*)>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const label = m[1].trim();
    const tag = m[2].toLowerCase();
    const attrs = m[3];

    const idMatch = attrs.match(/id="([^"]+)"/);
    const classMatch = attrs.match(/class="([^"]+)"/);

    const htmlId = idMatch ? idMatch[1] : '';
    const htmlClass = classMatch ? classMatch[1].split(/\s+/)[0] : '';
    const selectorKey = htmlId || htmlClass;

    if (!selectorKey) continue;

    const visible = !/style="[^"]*display\s*:\s*none[^"]*"/.test(attrs);

    result.push({
      id: `${fileName}::section::${selectorKey}`,
      file: fileName, tag, htmlId, htmlClass, label, visible, selectorKey, type: 'section',
    });
  }
  return result;
}

function scanMeta(html: string, fileName: string): ScannedMeta[] {
  const result: ScannedMeta[] = [];

  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    result.push({
      id: `${fileName}::meta::title`,
      file: fileName, metaKey: 'title', value: titleMatch[1].trim(), type: 'meta',
    });
  }

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
    || html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
  if (descMatch) {
    result.push({
      id: `${fileName}::meta::description`,
      file: fileName, metaKey: 'description', value: descMatch[1].trim(), type: 'meta',
    });
  }

  return result;
}

function scanNavLinks(html: string, fileName: string): ScannedNavLink[] {
  const result: ScannedNavLink[] = [];

  // Extract the nav-menu ul block
  const navMenuMatch = html.match(/<ul\s+class="nav-menu"[^>]*>([\s\S]*?)<\/ul>/i);
  if (!navMenuMatch) return result;

  const navContent = navMenuMatch[1];
  const re = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let m;
  let occurrence = 0;
  while ((m = re.exec(navContent)) !== null) {
    const href = m[1].trim();
    const text = m[2].trim();
    if (!text) continue;
    occurrence++;
    result.push({
      id: `${fileName}::nav-link::${occurrence}`,
      file: fileName, href, text, occurrence, type: 'nav-link',
    });
  }
  return result;
}

function scanListItems(html: string, fileName: string, sections: ReturnType<typeof detectSections>): ScannedListItem[] {
  const result: ScannedListItem[] = [];

  // span-based: trusted-name, trusted-name-sm, tag
  for (const itemClass of ['trusted-name', 'trusted-name-sm', 'tag']) {
    const re = new RegExp(`<span\\s+class="${itemClass}"([^>]*)>([^<]*)<\\/span>`, 'gi');
    let m;
    let index = 0;
    while ((m = re.exec(html)) !== null) {
      const attrs = m[1];
      const text = m[2].trim();
      index++;
      const visible = !/style="[^"]*display\s*:\s*none[^"]*"/.test(attrs);
      result.push({
        id: `${fileName}::list-item::${itemClass}::${index}`,
        file: fileName, itemClass, index, text, visible,
        section: getSection(m.index, sections), type: 'list-item',
      });
    }
  }

  // problem-item
  {
    const re = /<div\s+class="problem-item"([^>]*)>([\s\S]*?)<\/div>/gi;
    let m;
    let index = 0;
    while ((m = re.exec(html)) !== null) {
      const attrs = m[1];
      const inner = m[2];
      const pMatch = inner.match(/<p[^>]*>([^<]*)<\/p>/i);
      const text = pMatch ? pMatch[1].trim() : '';
      if (!text) continue;
      index++;
      const visible = !/style="[^"]*display\s*:\s*none[^"]*"/.test(attrs);
      result.push({
        id: `${fileName}::list-item::problem-item::${index}`,
        file: fileName, itemClass: 'problem-item', index, text, visible,
        section: getSection(m.index, sections), type: 'list-item',
      });
    }
  }

  // result-item
  {
    const re = /<div\s+class="result-item"([^>]*)>([\s\S]*?)<\/div>/gi;
    let m;
    let index = 0;
    while ((m = re.exec(html)) !== null) {
      const attrs = m[1];
      const inner = m[2];
      // skip svg, get span text
      const spanMatch = inner.match(/<span[^>]*>([^<]+)<\/span>/i);
      const text = spanMatch ? spanMatch[1].trim() : '';
      if (!text) continue;
      index++;
      const visible = !/style="[^"]*display\s*:\s*none[^"]*"/.test(attrs);
      result.push({
        id: `${fileName}::list-item::result-item::${index}`,
        file: fileName, itemClass: 'result-item', index, text, visible,
        section: getSection(m.index, sections), type: 'list-item',
      });
    }
  }

  // process-card-new: title and desc as separate items
  {
    const re = /<div\s+class="process-card-new"[^>]*>([\s\S]*?)<\/div>/gi;
    let m;
    let cardIndex = 0;
    while ((m = re.exec(html)) !== null) {
      const inner = m[1];
      cardIndex++;
      const titleMatch = inner.match(/<h3\s+class="process-title"[^>]*>([^<]+)<\/h3>/i);
      const descMatch = inner.match(/<p\s+class="process-desc"[^>]*>([\s\S]*?)<\/p>/i);

      if (titleMatch) {
        result.push({
          id: `${fileName}::process::${cardIndex}::title`,
          file: fileName, itemClass: 'process-card-new', index: cardIndex,
          text: titleMatch[1].trim(), visible: true,
          section: getSection(m.index, sections), type: 'list-item',
        });
      }
      if (descMatch) {
        result.push({
          id: `${fileName}::process::${cardIndex}::desc`,
          file: fileName, itemClass: 'process-card-new-desc', index: cardIndex,
          text: descMatch[1].replace(/<[^>]+>/g, '').trim(), visible: true,
          section: getSection(m.index, sections), type: 'list-item',
        });
      }
    }
  }

  return result;
}

function scanLinks(html: string, fileName: string, sections: ReturnType<typeof detectSections>): ScannedLink[] {
  const result: ScannedLink[] = [];
  const classCount: Record<string, number> = {};

  // Match <a> tags with btn or nav-cta class
  const patterns = [
    /<a\s+([^>]*class="([^"]*(?:btn|nav-cta|cta)[^"]*)"[^>]*href="([^"]+)"[^>]*)>([^<]+)</gi,
    /<a\s+([^>]*href="([^"]+)"[^>]*class="([^"]*(?:btn|nav-cta|cta)[^"]*)"[^>]*)>([^<]+)</gi,
  ];

  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      // Determine which capture group has what based on pattern
      let className: string;
      let href: string;
      let text: string;

      // Try to extract from attributes string
      const fullAttrs = m[1];
      const classInAttrs = fullAttrs.match(/class="([^"]+)"/);
      const hrefInAttrs = fullAttrs.match(/href="([^"]+)"/);
      const textRaw = m[4] || m[3] || '';

      className = classInAttrs ? classInAttrs[1].split(/\s+/)[0] : '';
      href = hrefInAttrs ? hrefInAttrs[1] : '';
      text = textRaw.trim();

      if (!className || !href || !text) continue;
      // Deduplicate by position
      const key = `${m.index}`;
      if (classCount[key]) continue;
      classCount[key] = 1;

      const classKey = `${fileName}:${className}`;
      if (!classCount[classKey]) classCount[classKey] = 0;
      classCount[classKey]++;
      const occurrence = classCount[classKey];

      result.push({
        id: `${fileName}::link::${className}::${occurrence}`,
        file: fileName, className, href, text, occurrence,
        section: getSection(m.index, sections), type: 'link',
      });
    }
  }

  return result;
}

// ── Replacers ─────────────────────────────────────────────────────────────────

function replaceByClassOccurrence(html: string, className: string, occurrence: number, newText: string) {
  const tagPattern = EDITABLE_TAGS.join('|');
  const re = new RegExp(
    `(<(?:${tagPattern})[^>]*class="[^"]*\\b${className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b[^"]*"[^>]*>)([\\s\\S]*?)(<\\/(?:${tagPattern})>)`,
    'gi'
  );
  let count = 0;
  return html.replace(re, (full, open, content, close) => {
    count++;
    if (count !== occurrence) return full;
    const hasInner = /<[^>]+>/.test(content);
    if (hasInner) {
      let replaced = false;
      const nc = content.replace(/^(\s*)([^<]+)/, (_: string, ws: string) => { replaced = true; return `${ws}${newText}`; });
      return `${open}${replaced ? nc : newText}${close}`;
    }
    return `${open}${newText}${close}`;
  });
}

function replaceImage(html: string, oldSrc: string, occurrence: number, newSrc: string, newAlt: string) {
  const escaped = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(<img\\s+[^>]*src="${escaped}"[^>]*alt=")([^"]*)("[^>]*>)`, 'gi');
  let count = 0;
  return html.replace(re, (full, before, _oldAlt, after) => {
    count++;
    if (count !== occurrence) return full;
    return `${before}${newAlt}${after}`.replace(new RegExp(`(src=")${escaped}(")`, 'i'), `$1${newSrc}$2`);
  });
}

function replaceTestimonial(html: string, occurrence: number, newBadge: string, newText: string, newAuthor: string, newPosition: string) {
  const re = /<div\s+class="testimonial-box"[^>]*>([\s\S]*?)<\/div>\s*(?=<div\s+class="testimonial-box"|<\/div>)/gi;
  let count = 0;
  return html.replace(re, (full, content) => {
    count++;
    if (count !== occurrence) return full;
    let u = content;
    u = u.replace(/(<span\s+class="testimonial-badge"[^>]*>)([\s\S]*?)(<\/span>)/i, `$1${newBadge}$3`);
    u = u.replace(/(<p\s+class="testimonial-text"[^>]*>)([\s\S]*?)(<\/p>)/i, `$1${newText}$3`);
    u = u.replace(/(<p\s+class="testimonial-author"[^>]*>)([\s\S]*?)(<\/p>)/i, `$1${newAuthor}$3`);
    u = u.replace(/(<p\s+class="testimonial-position"[^>]*>)([\s\S]*?)(<\/p>)/i, `$1${newPosition}$3`);
    return `<div class="testimonial-box">${u}</div>`;
  });
}

function toggleSectionVisibility(html: string, selectorKey: string, visible: boolean): string {
  const escaped = selectorKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match sections by id or class starting with selectorKey
  const re = new RegExp(
    `(<(?:section|nav|footer)([^>]*(?:id="${escaped}"|class="${escaped}(?:\\s[^"]*)?"))[^>]*)(>)`,
    'gi'
  );
  return html.replace(re, (full, openWithAttrs, attrs, closingBracket) => {
    if (visible) {
      // Remove display:none style
      const cleaned = openWithAttrs.replace(/\s*style="[^"]*display\s*:\s*none[^"]*"/, '');
      return `${cleaned}${closingBracket}`;
    } else {
      // Add display:none if not already present
      if (/style="[^"]*display\s*:\s*none/.test(openWithAttrs)) return full;
      if (/style="/.test(openWithAttrs)) {
        return openWithAttrs.replace(/style="/, 'style="display:none;') + closingBracket;
      }
      return `${openWithAttrs} style="display:none"${closingBracket}`;
    }
  });
}

function updateMeta(html: string, metaKey: 'title' | 'description', newValue: string): string {
  if (metaKey === 'title') {
    return html.replace(/<title>[^<]*<\/title>/i, `<title>${newValue}</title>`);
  } else {
    // Try both attribute orders
    let updated = html.replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/i,
      `$1${newValue}$2`
    );
    if (updated === html) {
      updated = html.replace(
        /(<meta\s+content=")[^"]*("\s+name="description")/i,
        `$1${newValue}$2`
      );
    }
    return updated;
  }
}

function updateNavLink(html: string, occurrence: number, newText: string, newHref: string): string {
  // Find the nav-menu ul, then replace within it
  return html.replace(
    /(<ul\s+class="nav-menu"[^>]*>)([\s\S]*?)(<\/ul>)/i,
    (full, open, inner, close) => {
      let count = 0;
      const updated = inner.replace(
        /(<a\s+href=")[^"]*("[^>]*>)([^<]+)(<\/a>)/gi,
        (m: string, before: string, mid: string, text: string, end: string) => {
          count++;
          if (count !== occurrence) return m;
          // Update href
          const newBefore = before + newHref + '"';
          return `${newBefore}${mid}${newText}${end}`;
        }
      );
      return `${open}${updated}${close}`;
    }
  );
}

function updateListItem(html: string, itemClass: string, index: number, newText: string, visible: boolean): string {
  if (itemClass === 'problem-item') {
    let count = 0;
    return html.replace(
      /<div\s+class="problem-item"([^>]*)>([\s\S]*?)<\/div>/gi,
      (full: string, attrs: string, inner: string) => {
        count++;
        if (count !== index) return full;
        const updatedInner = inner.replace(/<p([^>]*)>[^<]*<\/p>/i, `<p$1>${newText}</p>`);
        const newAttrs = visible
          ? attrs.replace(/\s*style="[^"]*display\s*:\s*none[^"]*"/, '')
          : /style="/.test(attrs)
            ? attrs.replace(/style="/, 'style="display:none;')
            : attrs + ' style="display:none"';
        return `<div class="problem-item"${newAttrs}>${updatedInner}</div>`;
      }
    );
  }

  if (itemClass === 'result-item') {
    let count = 0;
    return html.replace(
      /<div\s+class="result-item"([^>]*)>([\s\S]*?)<\/div>/gi,
      (full: string, attrs: string, inner: string) => {
        count++;
        if (count !== index) return full;
        const updatedInner = inner.replace(/(<span[^>]*>)[^<]*(<\/span>)/i, `$1${newText}$2`);
        const newAttrs = visible
          ? attrs.replace(/\s*style="[^"]*display\s*:\s*none[^"]*"/, '')
          : /style="/.test(attrs)
            ? attrs.replace(/style="/, 'style="display:none;')
            : attrs + ' style="display:none"';
        return `<div class="result-item"${newAttrs}>${updatedInner}</div>`;
      }
    );
  }

  if (itemClass === 'process-card-new') {
    // Update title of process card
    let count = 0;
    return html.replace(
      /(<div\s+class="process-card-new"[^>]*>[\s\S]*?<h3\s+class="process-title"[^>]*>)[^<]*(<\/h3>)/gi,
      (full: string, before: string, after: string) => {
        count++;
        if (count !== index) return full;
        return `${before}${newText}${after}`;
      }
    );
  }

  if (itemClass === 'process-card-new-desc') {
    // Update desc of process card
    let count = 0;
    return html.replace(
      /(<div\s+class="process-card-new"[^>]*>[\s\S]*?<p\s+class="process-desc"[^>]*>)[^<]*([\s\S]*?)(<\/p>)/gi,
      (full: string, before: string, _mid: string, after: string) => {
        count++;
        if (count !== index) return full;
        return `${before}${newText}${after}`;
      }
    );
  }

  // span-based items: trusted-name, trusted-name-sm, tag
  let count = 0;
  const escapedClass = itemClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(
    new RegExp(`<span\\s+class="${escapedClass}"([^>]*)>[^<]*<\\/span>`, 'gi'),
    (full: string, attrs: string) => {
      count++;
      if (count !== index) return full;
      const newAttrs = visible
        ? attrs.replace(/\s*style="[^"]*display\s*:\s*none[^"]*"/, '')
        : /style="/.test(attrs)
          ? attrs.replace(/style="/, 'style="display:none;')
          : attrs + ' style="display:none"';
      return `<span class="${itemClass}"${newAttrs}>${newText}</span>`;
    }
  );
}

function updateLink(html: string, className: string, occurrence: number, newHref: string, newText: string): string {
  const escapedClass = className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(
    `(<a[^>]*class="[^"]*${escapedClass}[^"]*"[^>]*href=")[^"]*("[^>]*>)[^<]*(</a>)`,
    'gi'
  );
  let count = 0;
  let updated = html.replace(re, (full: string, before: string, mid: string, end: string) => {
    count++;
    if (count !== occurrence) return full;
    return `${before}${newHref}${mid}${newText}${end}`;
  });

  if (count < occurrence) {
    // try alternate attr order (href before class)
    const re2 = new RegExp(
      `(<a[^>]*href=")[^"]*("[^>]*class="[^"]*${escapedClass}[^"]*"[^>]*>)[^<]*(</a>)`,
      'gi'
    );
    count = 0;
    updated = html.replace(re2, (full: string, before: string, mid: string, end: string) => {
      count++;
      if (count !== occurrence) return full;
      return `${before}${newHref}${mid}${newText}${end}`;
    });
  }

  return updated;
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const allContent: ScannedContent[] = [];

    for (const { file } of HTML_FILES) {
      try {
        const { content: html } = await githubGet(file);
        const sections = detectSections(html);
        allContent.push(
          ...scanMeta(html, file),
          ...scanSections(html, file),
          ...scanNavLinks(html, file),
          ...scanListItems(html, file, sections),
          ...scanLinks(html, file, sections),
          ...scanTextFields(html, file, sections),
          ...scanImages(html, file, sections),
          ...scanTestimonials(html, file, sections),
        );
      } catch {
        // file not in repo, skip
      }
    }

    const grouped: Record<string, Record<string, ScannedContent[]>> = {};
    for (const item of allContent) {
      const pageName = HTML_FILES.find(f => f.file === item.file)?.name || item.file;
      if (!grouped[pageName]) grouped[pageName] = {};
      const sectionKey = 'section' in item ? (item as any).section : item.type;
      if (!grouped[pageName][sectionKey]) grouped[pageName][sectionKey] = [];
      grouped[pageName][sectionKey].push(item);
    }

    return NextResponse.json({ success: true, content: allContent, grouped });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { changes } = await request.json() as {
      changes: Array<
        | { type: 'text'; id: string; className: string; file: string; occurrence: number; newText: string }
        | { type: 'image'; id: string; file: string; oldSrc: string; occurrence: number; newSrc: string; newAlt: string }
        | { type: 'testimonial'; id: string; file: string; occurrence: number; newBadge: string; newText: string; newAuthor: string; newPosition: string }
        | { type: 'section-visibility'; file: string; selectorKey: string; visible: boolean }
        | { type: 'meta'; file: string; metaKey: 'title' | 'description'; newValue: string }
        | { type: 'nav-link'; file: string; occurrence: number; newText: string; newHref: string }
        | { type: 'list-item'; file: string; itemClass: string; index: number; newText: string; visible: boolean }
        | { type: 'link'; file: string; className: string; occurrence: number; newHref: string; newText: string }
      >;
    };

    if (!changes || !Array.isArray(changes)) {
      return NextResponse.json({ success: false, error: 'Invalid changes format' }, { status: 400 });
    }

    // Group changes by file
    const byFile: Record<string, typeof changes> = {};
    for (const change of changes) {
      if (!byFile[change.file]) byFile[change.file] = [];
      byFile[change.file].push(change);
    }

    const results: Record<string, number> = {};

    for (const [file, fileChanges] of Object.entries(byFile)) {
      let { content: html, sha } = await githubGet(file);

      for (const change of fileChanges) {
        if (change.type === 'text') {
          html = replaceByClassOccurrence(html, change.className, change.occurrence, change.newText);
        } else if (change.type === 'image') {
          html = replaceImage(html, change.oldSrc, change.occurrence, change.newSrc, change.newAlt);
        } else if (change.type === 'testimonial') {
          html = replaceTestimonial(html, change.occurrence, change.newBadge, change.newText, change.newAuthor, change.newPosition);
        } else if (change.type === 'section-visibility') {
          html = toggleSectionVisibility(html, change.selectorKey, change.visible);
        } else if (change.type === 'meta') {
          html = updateMeta(html, change.metaKey, change.newValue);
        } else if (change.type === 'nav-link') {
          html = updateNavLink(html, change.occurrence, change.newText, change.newHref);
        } else if (change.type === 'list-item') {
          html = updateListItem(html, change.itemClass, change.index, change.newText, change.visible);
        } else if (change.type === 'link') {
          html = updateLink(html, change.className, change.occurrence, change.newHref, change.newText);
        }
      }

      await githubPut(file, html, sha, `content: update ${file} via admin dashboard`);
      results[file] = fileChanges.length;
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
