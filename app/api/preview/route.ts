import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER!;
const GITHUB_REPO = process.env.GITHUB_REPO!;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const ALLOWED_FILES = ['index.html', 'coaching.html', 'about.html', 'system.html', 'contact.html', 'apply.html'];

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get('file') || 'index.html';
  if (!ALLOWED_FILES.includes(file)) return new NextResponse('Not allowed', { status: 403 });

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${file}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
    cache: 'no-store',
  });
  if (!res.ok) return new NextResponse('File not found', { status: 404 });

  const data = await res.json();
  let html = Buffer.from(data.content, 'base64').toString('utf-8');

  // Use jsDelivr CDN so CSS/JS/images load with correct MIME types
  const baseUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}`;

  const editStyles = `
<style id="__admin_styles">
  * { box-sizing: border-box; }
  [data-editable]:hover {
    outline: 2px solid rgba(14,165,233,0.8) !important;
    outline-offset: 2px;
    cursor: pointer !important;
    position: relative;
  }
  [data-editable].--selected {
    outline: 2px solid rgb(14,165,233) !important;
    outline-offset: 2px;
  }
  [data-section-key]:hover > .__section-bar { opacity: 1; }
  .__section-bar {
    position: absolute;
    top: 0; left: 0;
    background: rgba(14,165,233,0.9);
    color: #fff;
    font-size: 11px;
    font-family: monospace;
    padding: 2px 8px;
    border-radius: 0 0 6px 0;
    z-index: 99999;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s;
    white-space: nowrap;
  }
  [data-section-key] {
    outline: 1px dashed rgba(14,165,233,0.2);
    outline-offset: -1px;
    position: relative !important;
    cursor: pointer;
  }
  [data-section-key]:hover {
    outline: 2px dashed rgba(14,165,233,0.6) !important;
    outline-offset: -2px;
  }
  [data-section-key].--selected {
    outline: 2px dashed rgb(14,165,233) !important;
    outline-offset: -2px;
  }
  [data-section-hidden] {
    opacity: 0.25 !important;
    pointer-events: none;
  }
</style>`;

  const editScript = `
<script id="__admin_script">
(function() {
  const FILE = '${file}';
  const SKIP = ['nav-menu','nav-container','hero-background','hero-cta-group',
    'trusted-divider-line','mobile-menu-toggle','footer-bottom-links'];
  const TAGS = ['H1','H2','H3','H4','P','SPAN','A','BUTTON','LI','LABEL'];

  // Prevent default link navigation — intercept and switch pages instead
  document.addEventListener('click', function(e) {
    const a = e.target.closest('a[href]');
    if (a) {
      const href = a.getAttribute('href');
      const pages = ['index.html','coaching.html','about.html','system.html','contact.html','apply.html'];
      if (pages.includes(href)) {
        e.preventDefault();
        e.stopPropagation();
        window.parent.postMessage({ type: 'navigate', file: href }, '*');
        return;
      }
      e.preventDefault();
    }
  }, true);

  function markElements() {
    const classCounts = {};
    // Text elements
    TAGS.forEach(function(tag) {
      document.querySelectorAll(tag + '[class]').forEach(function(el) {
        const classes = el.className ? el.className.split(' ').filter(Boolean) : [];
        const primary = classes[0];
        if (!primary) return;
        if (SKIP.some(function(s) { return classes.includes(s); })) return;
        const text = el.textContent.replace(/<[^>]+>/g,'').trim();
        if (text.length < 2 || text.length > 500) return;
        classCounts[primary] = (classCounts[primary] || 0) + 1;
        el.setAttribute('data-editable', 'text');
        el.setAttribute('data-class', primary);
        el.setAttribute('data-occ', classCounts[primary]);
        el.setAttribute('data-file', FILE);
      });
    });

    // Images
    var imgIdx = 0;
    document.querySelectorAll('img[src]').forEach(function(img) {
      if (img.src && img.src.includes('logo')) return;
      imgIdx++;
      img.setAttribute('data-editable', 'image');
      img.setAttribute('data-occ', imgIdx);
      img.setAttribute('data-file', FILE);
      img.setAttribute('data-src', img.getAttribute('src'));
    });

    // Sections
    document.querySelectorAll('section, nav, footer').forEach(function(el) {
      var htmlId = el.id || '';
      var htmlClass = (el.className || '').split(' ')[0] || '';
      var key = htmlId || htmlClass;
      if (!key) return;
      el.setAttribute('data-section-key', key);
      el.setAttribute('data-section-file', FILE);
      var isHidden = el.style.display === 'none';
      if (isHidden) el.setAttribute('data-section-hidden', '1');
      // label bar
      var bar = document.createElement('div');
      bar.className = '__section-bar';
      bar.textContent = el.tagName.toLowerCase() + '#' + key;
      el.insertBefore(bar, el.firstChild);
    });
  }

  markElements();

  var _selected = null;
  function deselect() {
    if (_selected) { _selected.classList.remove('--selected'); _selected = null; }
  }

  document.addEventListener('click', function(e) {
    var editable = e.target.closest('[data-editable]');
    var section = e.target.closest('[data-section-key]');

    deselect();

    if (editable) {
      e.stopPropagation();
      editable.classList.add('--selected');
      _selected = editable;
      var type = editable.getAttribute('data-editable');
      if (type === 'text') {
        window.parent.postMessage({
          type: 'element-click', itemType: 'text',
          text: editable.textContent.trim(),
          className: editable.getAttribute('data-class'),
          occurrence: parseInt(editable.getAttribute('data-occ')),
          file: FILE,
        }, '*');
      } else if (type === 'image') {
        window.parent.postMessage({
          type: 'element-click', itemType: 'image',
          src: editable.getAttribute('data-src'),
          alt: editable.alt || '',
          occurrence: parseInt(editable.getAttribute('data-occ')),
          file: FILE,
        }, '*');
      }
    } else if (section) {
      section.classList.add('--selected');
      _selected = section;
      var hidden = section.hasAttribute('data-section-hidden');
      window.parent.postMessage({
        type: 'element-click', itemType: 'section',
        selectorKey: section.getAttribute('data-section-key'),
        label: section.querySelector('.__section-bar') ? section.querySelector('.__section-bar').textContent : '',
        visible: !hidden,
        file: FILE,
      }, '*');
    } else {
      window.parent.postMessage({ type: 'deselect' }, '*');
    }
  });

  // Listen for live updates from admin
  window.addEventListener('message', function(e) {
    var msg = e.data;
    if (!msg) return;

    if (msg.type === 'update-text') {
      document.querySelectorAll('[data-class="' + msg.className + '"][data-occ="' + msg.occurrence + '"]').forEach(function(el) {
        el.textContent = msg.newText;
      });
    } else if (msg.type === 'update-section') {
      var el = document.querySelector('[data-section-key="' + msg.selectorKey + '"]');
      if (!el) return;
      if (msg.visible) {
        el.style.display = '';
        el.removeAttribute('data-section-hidden');
      } else {
        el.style.display = 'none';
        el.setAttribute('data-section-hidden', '1');
      }
    } else if (msg.type === 'update-image') {
      var imgs = document.querySelectorAll('[data-editable="image"]');
      var img = imgs[msg.occurrence - 1];
      if (img) { img.src = msg.newSrc; img.alt = msg.newAlt; }
    }
  });
})();
</script>`;

  // Inject base href and styles into <head>
  html = html.replace(/<head>/i, `<head>\n<base href="${baseUrl}/">\n${editStyles}`);
  // Inject editing script before </body>
  html = html.replace(/<\/body>/i, `${editScript}\n</body>`);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
