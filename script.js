(() => {
  'use strict';

  /* ---------- helpers ---------- */
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const safeUrl = v => { if (!String(v || '').trim()) return '#'; try { const u = new URL(String(v || ''), location.href); return ['http:', 'https:'].includes(u.protocol) ? u.href : '#'; } catch { return '#'; } };
  const image = v => { const u = safeUrl(v); return u === '#' ? '' : u; };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  // Same key the old site used, so learners who already saved a name are not asked again.
  const NAME_KEY = 'venom_study_learner_name';
  const getName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch { return ''; } };
  const setName = v => { try { localStorage.setItem(NAME_KEY, v); } catch {} };

  const DEFAULTS = {
    appTitle: 'Venom Study',
    ownerName: 'Priyanshu Raj',
    posterTag: 'New update',
    posterTitle: 'Small steps make big dreams.',
    posterText: 'Fresh courses and notes are added here every week.',
    aboutText: 'Venom Study is a learning platform created to help you grow your skills through courses, resources and updates.',
    backgroundImage: ''
  };
  const PALETTE = ['#2f6bff', '#8a4dff', '#1fbf75', '#ff2d6f', '#ff8a1f', '#3b9cff'];
  const DEFAULT_GROUP = 'General';
  const colorFor = name => { let h = 0; for (const ch of String(name)) h = (h * 31 + ch.charCodeAt(0)) | 0; return PALETTE[Math.abs(h) % PALETTE.length]; };
  const groupOf = c => String(c.group || '').trim() || DEFAULT_GROUP;

  /* ---------- icons + art ---------- */
  const P = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    back: '<path d="M19 12H5M12 5l-7 7 7 7"/>',
    chev: '<path d="M9 5l7 7-7 7"/>',
    ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    dots: '<g fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></g>'
  };
  const ic = (n, s = 22) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
  const ART = '<svg class="art" viewBox="0 0 300 180" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M14 180L26 96L52 44L68 88L96 22L122 78L152 4L182 78L208 22L236 88L252 44L276 96L288 180Z" fill="#0b0307" stroke="#ff1f4a" stroke-width="1.4" stroke-linejoin="round"/><path d="M76 180L80 104Q150 84 220 104L224 180Z" fill="#1c0b11"/><path d="M78 104L100 134L122 96L150 138L178 96L200 134L222 104Q150 72 78 104Z" fill="#0b0307" stroke="#ff1f4a55" stroke-width="1"/><g class="eye"><path d="M94 138L136 128L133 148L101 150Z" fill="#ff1f4a"/><circle cx="121" cy="137" r="3" fill="#fff"/></g><g class="eye"><path d="M206 138L164 128L167 148L199 150Z" fill="#ff1f4a"/><circle cx="179" cy="137" r="3" fill="#fff"/></g></svg>';
  const logoImg = n => `<img class="lg" src="venom-logo.webp" width="${n}" alt="">`;

  /* ---------- state ---------- */
  let courses = [];          // the entries saved in Cloudflare KV (what the old site called "categories")
  let updates = [];
  let settings = { ...DEFAULTS };
  let status = 'loading';    // loading | ok | cached | error
  let q = '';

  /* ---------- data ---------- */
  async function getJSON(path) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(path, { cache: 'no-store', signal: ctl.signal });
      if (!r.ok) throw new Error(String(r.status));
      return await r.json();
    } finally { clearTimeout(t); }
  }
  async function loadAll() {
    status = 'loading';
    const [c, u, s] = await Promise.allSettled([getJSON('/api/categories'), getJSON('/api/updates'), getJSON('/api/settings')]);
    if (c.status === 'fulfilled') {
      const d = c.value;
      courses = Array.isArray(d) ? d : Array.isArray(d && d.categories) ? d.categories : [];
      store.set('venom_cache_courses', courses);
      status = 'ok';
    } else {
      // Never overwrite anything on the server; just show the last copy this device saw.
      const cached = store.get('venom_cache_courses', []);
      courses = Array.isArray(cached) ? cached : [];
      status = courses.length ? 'cached' : 'error';
    }
    updates = u.status === 'fulfilled' && Array.isArray(u.value) ? u.value : store.get('venom_cache_updates', []);
    if (u.status === 'fulfilled') store.set('venom_cache_updates', updates);
    if (s.status === 'fulfilled' && s.value && typeof s.value === 'object') {
      settings = { ...DEFAULTS };
      Object.keys(s.value).forEach(k => { if (s.value[k] !== '' && s.value[k] != null) settings[k] = s.value[k]; });
    }
    $('so').textContent = settings.ownerName;
    render(true);
    if (status === 'cached') toast('Offline — showing your last saved copy');
  }

  /* ---------- small UI bits ---------- */
  function toast(m) { const t = $('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }
  const opened = () => { const v = store.get('venom_opened', []); return Array.isArray(v) ? v.map(String) : []; };
  const searchBox = ph => `<label class="search">${ic('search', 18)}<input id="sq" placeholder="${ph}" aria-label="${ph}" value="${esc(q)}"></label>`;
  const msg = (t, s, btn) => `<div class="state-card"><b>${t}</b>${s}${btn ? '<button class="btn" data-a="refresh">Try again</button>' : ''}</div>`;
  const menuBtn = `<button class="ib" data-a="menu" aria-label="More options" aria-haspopup="menu">${ic('dots')}</button>`;
  const tp = (t, j) => ({ head: `<div class="hd"><h1>${t}<i class="jp">${j}</i></h1>${menuBtn}</div>` });
  const sub = (t, back) => ({ head: `<div class="hd"><a class="ib" href="${back}" aria-label="Back">${ic('back')}</a><h1>${esc(t)}</h1></div>`, nonav: true });

  function courseRow(c, i) {
    const id = String(c.id ?? i), g = groupOf(c), col = colorFor(g);
    const url = safeUrl(c.url), logo = image(c.logo), icon = c.icon || '📚';
    const art = `<span class="ci" style="--c:${col}" data-icon="${esc(icon)}">${logo ? `<img src="${esc(logo)}" alt="" loading="lazy">` : esc(icon)}</span>`;
    const was = opened().includes(id) ? ' · Opened' : '';
    const info = `<div><b>${esc(c.name || 'Untitled')}</b><small>${esc(c.description || 'Course resources')}${was}</small></div>`;
    const search = esc(`${c.name || ''} ${c.description || ''} ${g}`.toLowerCase());
    if (url === '#') return `<button class="crs" style="--c:${col}" data-s="${search}" data-a="toast" data-m="Link not added yet">${art}${info}${ic('chev', 18)}</button>`;
    return `<a class="crs" style="--c:${col}" data-s="${search}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-open="${esc(id)}">${art}${info}${ic('ext', 18)}</a>`;
  }
  const courseList = list => status === 'loading' ? msg('<span class="loader"></span>Loading courses…', '')
    : !list.length ? (status === 'error' ? msg('Courses could not be loaded', 'Check your connection. Your saved data on the server has not been changed.', true) : msg('No courses yet', 'Courses added in the admin panel appear here.'))
    : list.map(([c, i]) => courseRow(c, i)).join('');
  const groups = () => { const m = new Map(); courses.forEach((c, i) => { const g = groupOf(c); if (!m.has(g)) m.set(g, []); m.get(g).push([c, i]); }); return m; };

  /* ---------- views ---------- */
  const V = {
    home() {
      const bg = image(settings.backgroundImage);
      return {
        head: `<div class="hd"><div class="brand">${logoImg(46)}<div><small class="own">Owner</small><b class="on">${esc(settings.ownerName)}</b></div></div>${menuBtn}</div>`,
        body: `${searchBox('Search courses…')}
          <a class="poster ${bg ? 'has-img' : ''}" href="#/updates"><i class="kj" aria-hidden="true">毒</i>${ART}<i class="sp" style="top:16px;right:96px">✦</i><i class="sp s2" style="top:84px;right:24px">✦</i><span class="pill">${esc(settings.posterTag)}</span><b>${esc(settings.posterTitle)}</b><small>${esc(settings.posterText)}</small></a>
          <div class="between"><h2>All courses<i class="jp">コース</i></h2><small style="color:var(--mute)">${courses.length} courses</small></div>
          <div id="cl">${courseList(courses.map((c, i) => [c, i]))}</div>`
      };
    },
    categories() {
      const g = [...groups()];
      return {
        ...tp('Categories', 'カテゴリ'),
        body: `${searchBox('Search categories…')}<div id="cl">${status === 'loading' ? msg('<span class="loader"></span>Loading…', '') : !g.length ? msg('No categories yet', 'Add courses in the admin panel.', status === 'error') :
          g.map(([name, list]) => `<a class="cat" style="--c:${colorFor(name)}" data-s="${esc(name.toLowerCase())}" href="#/group/${encodeURIComponent(name)}"><span class="ci" style="--c:${colorFor(name)}">${ic('grid')}</span><div><b>${esc(name)}</b><small>${list.length} ${list.length === 1 ? 'course' : 'courses'}</small></div>${ic('chev', 16)}</a>`).join('')}</div>`
      };
    },
    group(name) {
      const list = groups().get(name) || [];
      return { ...sub(name, '#/categories'), body: `${searchBox('Search courses…')}<div id="cl">${courseList(list)}</div>` };
    },
    updates() {
      const date = u => { const d = new Date(u.createdAt); return isNaN(d) ? '' : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); };
      return {
        ...tp('Updates', 'お知らせ'),
        body: updates.length ? updates.slice().reverse().map(u => { const img = image(u.image), link = safeUrl(u.link); return `<article class="up"><span class="pill">${esc(u.type || 'UPDATE')}</span> <small>${esc(date(u))}</small><b>${esc(u.title || 'New update')}</b>${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : ''}<p style="white-space:pre-line;color:#cfd4e6">${esc(u.text || '')}</p>${link !== '#' ? `<a class="open" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Open link</a>` : ''}</article>`; }).join('')
          : msg('No updates yet', 'Announcements and notices will appear here.')
      };
    },
    profile() {
      const n = getName(), seen = opened(), k = courses.filter((c, i) => seen.includes(String(c.id ?? i))).length;
      return {
        ...tp('Profile', 'プロフィール'),
        body: `<div class="pc"><span class="av">${esc((n || 'V')[0].toUpperCase())}</span><div><b>${esc(n || 'Learner')}</b><small>Learner</small></div><button class="btn ghost" style="padding:8px 14px" data-a="rename">Change</button></div>
          <div class="stat"><b>${k} / ${courses.length}</b><span>Courses opened</span></div>`
      };
    },
    about() {
      return { ...sub('About', '#/home'), body: `<div style="display:grid;place-items:center;padding:20px 0">${logoImg(110)}<h2 style="font-size:30px;margin:8px 0 0">${esc(settings.appTitle)}</h2></div><p style="white-space:pre-line">${esc(settings.aboutText)}</p><p style="margin-top:14px;color:var(--mute)">Created by ${esc(settings.ownerName)} · v2.0</p>` };
    }
  };
  const TABS = [['home', 'Home', 'home'], ['categories', 'Categories', 'grid'], ['updates', 'Updates', 'bell'], ['profile', 'Profile', 'user']];

  function current() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    const p = parts[0] || 'home';
    if (p === 'group') { let n = parts.slice(1).join('/'); try { n = decodeURIComponent(n); } catch {} return { v: 'group', arg: n, tab: 'categories' }; }
    if (['home', 'categories', 'updates', 'profile', 'about'].includes(p)) return { v: p, tab: p };
    return { v: 'home', tab: 'home' };
  }
  function render(keepScroll) {
    const cur = current(), v = V[cur.v](cur.arg), m = $('main'), y = m.scrollTop;
    $('hd').innerHTML = v.head;
    m.innerHTML = v.body;
    m.scrollTop = keepScroll ? y : 0;
    const poster = m.querySelector('.poster.has-img');
    if (poster) poster.style.background = `linear-gradient(90deg,#000000e6 35%,#00000066),url("${image(settings.backgroundImage)}") center/cover`;
    const n = $('nav'); n.style.display = v.nonav ? 'none' : 'flex';
    n.innerHTML = TABS.map(t => `<a href="#/${t[0]}" ${t[0] === cur.tab ? 'aria-current="page"' : ''}>${ic(t[2])}${t[1]}</a>`).join('');
    $('menu').style.display = 'none';
  }

  /* ---------- name (asked once) ---------- */
  function askName(first) {
    if ($('wel')) return;
    const w = document.createElement('div');
    w.id = 'wel'; w.className = 'scr wel';
    w.innerHTML = `${ART}${logoImg(96)}<h2 style="font-size:28px;margin:6px 0 0">${first ? 'Welcome to Venom Study' : 'Change your name'}</h2><p style="color:var(--mute)">What should we call you?</p><input id="wn" placeholder="Your name" aria-label="Your name" maxlength="40" autocomplete="given-name" value="${esc(first ? '' : getName())}"><button class="btn" data-a="savename" style="width:100%;max-width:300px">${first ? 'Start learning' : 'Save'}</button>${first ? '' : '<button class="btn ghost" data-a="cancelname" style="width:100%;max-width:300px">Cancel</button>'}`;
    $('app').appendChild(w);
    $('wn').focus();
  }
  function closeName() { const w = $('wel'); if (w) { w.classList.add('out'); setTimeout(() => w.remove(), 500); } }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-a]');
    const menu = $('menu');
    if (!b) {
      const o = e.target.closest('[data-open]');
      if (o) { const s = opened(); if (!s.includes(o.dataset.open)) { s.push(o.dataset.open); store.set('venom_opened', s); } }
      if (!e.target.closest('#menu')) menu.style.display = 'none';
      return;
    }
    const a = b.dataset.a;
    if (a !== 'menu') menu.style.display = 'none';
    if (a === 'menu') {
      menu.innerHTML = `<a role="menuitem" href="#/about">About app</a><button role="menuitem" data-a="refresh">Refresh</button>`;
      menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    } else if (a === 'refresh') { render(true); loadAll(); }
    else if (a === 'toast') toast(b.dataset.m);
    else if (a === 'rename') askName(false);
    else if (a === 'cancelname') closeName();
    else if (a === 'savename') {
      const v = $('wn').value.trim().slice(0, 40);
      if (!v) return toast('Type your name first');
      setName(v); closeName(); render(true);
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id !== 'sq') return;
    q = e.target.value;
    const s = q.toLowerCase().trim();
    [...$('cl').children].forEach(el => { if (el.dataset.s !== undefined) el.style.display = el.dataset.s.includes(s) ? '' : 'none'; });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { $('menu').style.display = 'none'; if ($('wel') && $('cancelname')) closeName(); }
    if (e.key === 'Enter' && e.target.id === 'wn') document.querySelector('[data-a=savename]').click();
  });
  // If a course logo URL is broken, fall back to the emoji icon.
  document.addEventListener('error', e => {
    const t = e.target;
    if (t && t.tagName === 'IMG' && t.parentElement && t.parentElement.classList.contains('ci')) t.parentElement.textContent = t.parentElement.dataset.icon || '📚';
  }, true);
  window.addEventListener('hashchange', () => { q = ''; render(); });

  /* ---------- start ---------- */
  $('splash').insertAdjacentHTML('afterbegin', ART);
  render();
  const started = Date.now();
  loadAll().finally(() => {
    setTimeout(() => {
      const s = $('splash');
      s.classList.add('out');
      setTimeout(() => s.remove(), 600);
      if (!getName()) askName(true);
    }, Math.max(0, 2800 - (Date.now() - started)));
  });
})();
