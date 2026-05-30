'use strict';

const ACCENT = {
  aykiz: '#6BC5BD', wasilah: '#F1D592', crisp: '#A8B0BC',
  drafy: '#FFB347', misbah: '#EBB732', probashi: '#6BC5BD',
  sabr: '#8FA6E6', mashq: '#6B6573'
};

let DATA = null;
let activeFilter = null;

const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 1400);
}

function statusMeta(key) {
  return (DATA.statuses && DATA.statuses[key]) || { label: key, tone: 'idle' };
}

function buildSummary() {
  const bar = document.getElementById('summary');
  bar.innerHTML = '';
  const counts = {};
  DATA.projects.forEach(p => { counts[p.status] = (counts[p.status] || 0) + 1; });

  const all = el('button', 'chip' + (activeFilter ? '' : ' on'),
    `All <span class="n">${DATA.projects.length}</span>`);
  all.onclick = () => { activeFilter = null; render(); };
  bar.appendChild(all);

  Object.keys(DATA.statuses).forEach(key => {
    if (!counts[key]) return;
    const m = statusMeta(key);
    const c = el('button', 'chip' + (activeFilter === key ? ' on' : ''),
      `<span class="dot" style="background:var(--${m.tone})"></span>${esc(m.label)} <span class="n">${counts[key]}</span>`);
    c.onclick = () => { activeFilter = (activeFilter === key ? null : key); render(); };
    bar.appendChild(c);
  });
}

function card(p) {
  const accent = ACCENT[p.id] || '#6BC5BD';
  const c = el('article', 'card');
  c.style.setProperty('--accent', accent);

  const sm = statusMeta(p.status);
  const top = el('div', 'card-top');
  top.appendChild(el('div', null,
    `<h2 class="card-name">${esc(p.name)}</h2><p class="card-kind">${esc(p.kind)}</p>`));
  top.appendChild(el('span', 'status ' + sm.tone,
    `<span class="sdot"></span>${esc(sm.label)}`));
  c.appendChild(top);

  if (p.tagline) c.appendChild(el('p', 'card-tag', esc(p.tagline)));

  const meta = el('div', 'meta-row',
    `<span>ver <span class="v">${esc(p.version || '—')}</span></span>` +
    `<span>updated <span class="v">${esc(p.updated || '—')}</span></span>`);
  c.appendChild(meta);

  if (p.platforms && p.platforms.length) {
    const pl = el('div', 'plats');
    p.platforms.forEach(x => pl.appendChild(el('span', 'plat', esc(x))));
    c.appendChild(pl);
  }

  if (p.statusNote) c.appendChild(el('p', 'note', esc(p.statusNote)));

  const b = p.brand || {};
  if (b.colors && b.colors.length) {
    const sw = el('div', 'swatches');
    b.colors.forEach(col => {
      const s = el('div', 'sw');
      s.style.background = col.hex;
      s.title = `${col.name} ${col.hex}`;
      s.onclick = () => {
        if (navigator.clipboard) navigator.clipboard.writeText(col.hex);
        toast(`${col.name} ${col.hex} copied`);
      };
      sw.appendChild(s);
    });
    c.appendChild(sw);
  }
  if (b.fonts && b.fonts.length) {
    const f = el('div', 'fonts');
    b.fonts.forEach(x => f.appendChild(el('span', 'font-tag', esc(x))));
    c.appendChild(f);
  }
  if (b.fontRule) c.appendChild(el('p', 'font-rule', esc(b.fontRule)));

  if (p.links && p.links.length) {
    const lk = el('div', 'links');
    p.links.forEach(l => {
      const a = el('a', 'lnk', esc(l.label));
      a.href = l.url;
      if (/^https?:/.test(l.url)) { a.target = '_blank'; a.rel = 'noopener'; }
      lk.appendChild(a);
    });
    c.appendChild(lk);
  }

  if (p.next && p.next.length) {
    c.appendChild(el('div', 'next-h', 'Next'));
    const ul = el('ul', 'next');
    p.next.forEach(n => ul.appendChild(el('li', null, esc(n))));
    c.appendChild(ul);
  }
  return c;
}

function render() {
  buildSummary();
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  const list = activeFilter
    ? DATA.projects.filter(p => p.status === activeFilter)
    : DATA.projects;
  list.forEach(p => grid.appendChild(card(p)));
  document.getElementById('foot-count').textContent =
    `${list.length} of ${DATA.projects.length} shown`;
}

async function boot() {
  try {
    const res = await fetch('data.json?t=' + Date.now());
    DATA = await res.json();
  } catch (e) {
    document.getElementById('grid').innerHTML =
      '<p style="color:var(--warn)">Could not load data.json.</p>';
    return;
  }
  const m = DATA.meta || {};
  if (m.owner) document.getElementById('mast-title').textContent = m.owner;
  document.getElementById('mast-updated').textContent = m.updated || '—';
  if (m.tagline) document.getElementById('mast-note').textContent = m.tagline;
  render();
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('sw.js').catch(() => {}));
}

boot();
