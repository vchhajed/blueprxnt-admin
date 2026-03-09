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
type ScannedContent = ScannedField | ScannedImage | ScannedTestimonial;

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

// ── Scanners ─────────────────────────────────────────────────────────────────

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

// ── Route handlers ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const allContent: ScannedContent[] = [];

    for (const { file, name } of HTML_FILES) {
      try {
        const { content: html } = await githubGet(file);
        const sections = detectSections(html);
        allContent.push(
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
      if (!grouped[pageName][item.section]) grouped[pageName][item.section] = [];
      grouped[pageName][item.section].push(item);
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
