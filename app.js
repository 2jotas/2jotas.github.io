/* ==========================================================================
   ~/john · landing personal
   --------------------------------------------------------------------------
   CÓMO AGREGAR UN PROYECTO
   1. Copia uno de los objetos de PROJECTS y pégalo donde quieras que aparezca
      (el orden del arreglo es el orden del menú).
   2. Cambia `id` (solo minúsculas y guiones, se usa en la URL: #/p/<id>).
   3. `menu` es el texto que se ve en la lista, estilo terminal.
   4. `status`: 'live' (en línea) | 'wip' (en desarrollo) | 'soon' (pronto).
   5. Textos en { es, en }. Si no tienes la versión EN, repite el texto ES.
   6. `links`: arreglo de { label: {es,en}, href }. Deja [] si no hay nada
      público todavía. Un repo privado se indica con `repo: 'private'`.
   Nada más: el menú, la ficha y la navegación con teclado se generan solos.
   ========================================================================== */
const PROJECTS = [
  {
    id: 'preciodolarhoy',
    menu: 'preciodolarhoy.cl',
    title: 'preciodolarhoy.cl',
    status: 'live',
    problem: {
      es: 'Tener el dólar, la UF y la UTM del día en Chile, actualizados y en un solo lugar.',
      en: 'Having the Chilean dollar, UF and UTM for today, up to date and in one place.'
    },
    built: {
      es: 'Sitio con dólar, UF, UTM, calculadoras, monitor de mercados (cobre, oro, plata, BTC, ETH) y un Radar diario de noticias automatizado. Un pipeline en Python + bash toma los datos de mindicador.cl con escrituras atómicas, corre con cron cada 20 min en un VPS Linux y publica automáticamente en X (API\u00a0v2).',
      en: 'Site with the dollar, UF, UTM, calculators, a market monitor (copper, gold, silver, BTC, ETH) and an automated daily news Radar. A Python + bash pipeline pulls data from mindicador.cl with atomic writes, runs on cron every 20 min on a Linux VPS and auto-posts to X (API\u00a0v2).'
    },
    stack: ['Python', 'Bash', 'cron', 'X API v2', 'Docker', 'Nginx', 'SEO'],
    links: [{ label: { es: 'sitio', en: 'site' }, href: 'https://preciodolarhoy.cl' }],
    repo: 'private'
  },
  {
    id: 'espejos',
    menu: 'espejos agenda pro',
    title: 'Espejos Agenda Pro',
    status: 'live',
    problem: {
      es: 'En mi propia barbería: ordenar las reservas y el seguimiento de clientes.',
      en: 'In my own barbershop: keeping bookings and client follow-up organized.'
    },
    built: {
      es: 'Agenda + CRM para barberos y estilistas: link de reservas personal, fichas de clientes, recordatorios por WhatsApp, sincronización con Google Calendar, visagismo con IA y planes Free/Pro.',
      en: 'Booking + CRM for barbers and stylists: personal booking link, client records, WhatsApp reminders, Google Calendar sync, AI visagism and Free/Pro plans.'
    },
    stack: ['TypeScript', 'Fastify', 'Prisma', 'React', 'Vite', 'Tailwind', 'Redis', 'WebAuthn', 'Docker Compose', 'Nginx'],
    links: [
      { label: { es: 'sitio', en: 'site' }, href: 'https://espejosstudio.cl' }
    ]
  },
  {
    id: 'precioestado',
    menu: 'precioestado',
    title: 'PrecioEstado',
    status: 'soon',
    problem: {
      es: 'Entender los precios de las compras públicas en Chile a partir de datos abiertos.',
      en: 'Understanding Chilean public procurement prices from open data.'
    },
    built: {
      es: 'Análisis de precios de Mercado Público (API de ChileCompra): percentiles, IC bootstrap de la mediana, intervalos de Wilson, lead scoring y reportes PDF automáticos.',
      en: 'Price analysis over Mercado Público (ChileCompra API): percentiles, bootstrap CI of the median, Wilson intervals, lead scoring and automated PDF reports.'
    },
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Celery', 'pytest'],
    links: []
  }
];

/* ---------- textos de la interfaz ---------- */
const I18N = {
  es: {
    tagline: 'Estudiante de 1.º año de Ingeniería en Ciencia de Datos · Chile',
    projectsSr: 'Proyectos',
    projectsCmd: 'ls ~/proyectos',
    projectsComment: '# lo que construyo',
    hint: '↑↓ navegar · enter abrir · esc cerrar',
    open: 'abierto a conversar',
    close: 'cerrar',
    fProblem: '# problema', fBuilt: '# qué construí', fStack: '# stack', fStatus: '# estado', fLinks: '# links',
    status: { live: 'en línea', wip: 'en desarrollo', soon: 'en desarrollo · pronto' },
    statusShort: { live: 'live', wip: 'wip', soon: 'pronto' },
    repoPrivate: 'repo privado',
    notPublic: 'aún no es público'
  },
  en: {
    tagline: '1st-year Data Science Engineering student · Chile',
    projectsSr: 'Projects',
    projectsCmd: 'ls ~/projects',
    projectsComment: '# things I build',
    hint: '↑↓ navigate · enter open · esc close',
    open: 'open to conversations',
    close: 'close',
    fProblem: '# problem', fBuilt: '# what I built', fStack: '# stack', fStatus: '# status', fLinks: '# links',
    status: { live: 'live', wip: 'in progress', soon: 'in progress · soon' },
    statusShort: { live: 'live', wip: 'wip', soon: 'soon' },
    repoPrivate: 'private repo',
    notPublic: 'not public yet'
  }
};

/* ========================================================================== */
(() => {
  const $ = (s) => document.querySelector(s);
  const list = $('#project-list');
  const card = $('#card');
  let lang = 'es';
  let current = null;      // proyecto abierto
  let pushed = false;      // si abrimos nosotros la ruta (para volver con history.back)

  try {
    const q = new URLSearchParams(location.search).get('lang');
    const saved = localStorage.getItem('lang');
    lang = (q || saved || 'es').toLowerCase().startsWith('en') ? 'en' : 'es';   // ES por defecto
  } catch (_) { /* file:// o modo privado: se queda en ES */ }

  const t = (obj) => (obj && (obj[lang] || obj.es)) || '';

  /* ---------- menú ---------- */
  function renderMenu() {
    list.innerHTML = '';
    PROJECTS.forEach((p) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'item';
      a.href = `#/p/${p.id}`;
      a.dataset.id = p.id;
      a.innerHTML =
        `<span class="caret" aria-hidden="true">&gt;</span>` +
        `<span class="label"></span>` +
        `<span class="leader" aria-hidden="true"></span>` +
        `<span class="badge s-${p.status}"></span>`;
      a.querySelector('.label').textContent = p.menu;
      a.querySelector('.badge').textContent = I18N[lang].statusShort[p.status];
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  // Flechas / j k para moverse en el menú
  list.addEventListener('keydown', (e) => {
    const items = [...list.querySelectorAll('.item')];
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    let n = null;
    if (e.key === 'ArrowDown' || e.key === 'j') n = (i + 1) % items.length;
    if (e.key === 'ArrowUp' || e.key === 'k') n = (i - 1 + items.length) % items.length;
    if (e.key === 'Home') n = 0;
    if (e.key === 'End') n = items.length - 1;
    if (n !== null) { e.preventDefault(); items[n].focus(); }
  });
  // Desde cualquier parte: flecha abajo entra al menú
  document.addEventListener('keydown', (e) => {
    if (card.open) return;
    if ((e.key === 'ArrowDown' || e.key === 'j') && !list.contains(document.activeElement)) {
      const first = list.querySelector('.item');
      if (first) { e.preventDefault(); first.focus(); }
    }
  });
  list.addEventListener('click', (e) => {
    const a = e.target.closest('.item');
    if (!a) return;
    e.preventDefault();
    pushed = true;
    location.hash = `/p/${a.dataset.id}`;
  });

  /* ---------- ficha de proyecto ---------- */
  function fillCard(p) {
    const L = I18N[lang];
    $('#card-path').textContent = `~/${lang === 'en' ? 'projects' : 'proyectos'}/${p.menu.replace(/\s+/g, '-')}`;
    $('#card-title').textContent = p.title;
    $('#card-problem').textContent = t(p.problem);
    $('#card-built').textContent = t(p.built);
    const stack = $('#card-stack');
    stack.innerHTML = '';
    p.stack.forEach((s) => { const li = document.createElement('li'); li.textContent = s; stack.appendChild(li); });
    const st = $('#card-status');
    st.innerHTML = `<span class="dot s-${p.status}" aria-hidden="true"></span>`;
    st.append(L.status[p.status]);
    const links = $('#card-links');
    links.innerHTML = '';
    p.links.forEach((l) => {
      const a = document.createElement('a');
      a.href = l.href; a.target = '_blank'; a.rel = 'noopener';
      a.innerHTML = `<span></span> <span aria-hidden="true">↗</span>`;
      a.firstChild.textContent = `${t(l.label)}: ${l.href.replace(/^https?:\/\//, '')}`;
      links.appendChild(a);
    });
    if (p.repo === 'private') links.insertAdjacentHTML('beforeend', `<span class="muted">${L.repoPrivate}</span>`);
    if (!p.links.length && p.repo !== 'private') links.insertAdjacentHTML('beforeend', `<span class="muted">${L.notPublic}</span>`);
  }

  function route() {
    const m = location.hash.match(/^#\/p\/([\w-]+)/);
    const p = m && PROJECTS.find((x) => x.id === m[1]);
    if (p) {
      current = p;
      fillCard(p);
      if (!card.open) card.showModal();
      $('#card-title').focus({ preventScroll: true });
    } else if (card.open) {
      const prev = current;
      current = null;
      card.close();
      const a = prev && list.querySelector(`[data-id="${prev.id}"]`);
      if (a) a.focus({ preventScroll: true });   // devolver el foco al ítem del menú
    }
  }

  function closeCard() {
    if (!location.hash) { if (card.open) card.close(); return; }
    if (pushed) { pushed = false; history.back(); }
    else { history.replaceState(null, '', location.pathname + location.search); route(); }
  }

  $('#card-close').addEventListener('click', closeCard);
  card.addEventListener('cancel', (e) => { e.preventDefault(); closeCard(); });       // Esc
  card.addEventListener('click', (e) => { if (e.target === card) closeCard(); });     // clic en el fondo
  window.addEventListener('hashchange', route);

  /* ---------- idioma ---------- */
  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    try { localStorage.setItem('lang', l); } catch (_) {}
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = I18N[l][el.dataset.i18n]; });
    document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
    const focusedId = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.id;
    renderMenu();
    if (focusedId) list.querySelector(`[data-id="${focusedId}"]`)?.focus();
    if (current) fillCard(current);
  }
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

  setLang(lang);
  route();

  /* ---------- fondo: grilla de puntos con "aurora" lenta ----------
     ~1.5k puntos, ~24 fps, se pausa si la pestaña no está visible,
     y con prefers-reduced-motion se dibuja un solo cuadro estático. */
  const cv = $('#bg');
  const ctx = cv.getContext('2d', { alpha: false });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const GAP = 26;
  let W = 0, H = 0, DPR = 1, raf = 0, last = 0;
  const T0 = 38;                        // fase inicial (cuadro bonito desde el primer frame)
  const start = performance.now();
  const mouse = { x: -1e4, y: -1e4 };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    cv.style.width = W + 'px'; cv.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw(now());
  }
  const now = () => T0 + (reduce.matches ? 0 : (performance.now() - start) / 1000);

  function draw(time) {
    ctx.fillStyle = '#07080c';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;
    const maxR = Math.hypot(cx, cy);
    const ox = ((W % GAP) + GAP) / 2, oy = ((H % GAP) + GAP) / 2;
    for (let y = oy; y < H; y += GAP) {
      for (let x = ox; x < W; x += GAP) {
        // dos "cintas" de aurora: crestas finas que ondulan lentamente
        const w1 = y * 0.0042 + 0.95 * Math.sin(x * 0.0026 + time * 0.11) + 0.45 * Math.sin(x * 0.0061 - time * 0.07);
        const w2 = y * 0.0031 - 0.80 * Math.sin(x * 0.0021 - time * 0.09 + 1.7) + 0.35 * Math.sin(x * 0.0053 + time * 0.05);
        const r1 = Math.pow(1 - Math.abs(Math.sin(w1)), 7);
        const r2 = Math.pow(1 - Math.abs(Math.sin(w2 + 0.9)), 7);
        let v = Math.max(r1, r2 * 0.9);
        const d = Math.hypot(x - mouse.x, y - mouse.y);
        if (d < 160) v = Math.min(1, v + (1 - d / 160) * 0.45);   // brillo sutil bajo el cursor
        const r = Math.hypot(x - cx, y - cy) / maxR;                // más tenue al centro (legibilidad)
        const a = (0.09 + v * 0.62) * (0.42 + 0.58 * Math.min(1, r * 1.5));
        const mix = r2 > r1 ? 1 : 0.15 + 0.25 * (0.5 + 0.5 * Math.sin(x * 0.002 + time * 0.05));
        const R = Math.round(126 + (167 - 126) * mix);
        const G = Math.round(224 + (139 - 224) * mix);
        const B = Math.round(195 + (250 - 195) * mix);
        ctx.fillStyle = `rgba(${R},${G},${B},${a.toFixed(3)})`;
        const s = 1.2 + v * 1.3;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      }
    }
  }

  function loop(ts) {
    raf = requestAnimationFrame(loop);
    if (ts - last < 1000 / 24) return;
    last = ts;
    draw(now());
  }
  function play() {
    cancelAnimationFrame(raf);
    if (!reduce.matches && !document.hidden) raf = requestAnimationFrame(loop);
    else draw(now());
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', play);
  reduce.addEventListener?.('change', play);
  window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
  resize();
  play();
})();
