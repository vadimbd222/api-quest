'use strict';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch (e) { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch (e) {} }
};
const PAGE = document.body.dataset.page || 'index';
const STAGES = ['api-basics','rest-http','data-formats','auth-keys','frontend','catalog','demo','glossary','about'];
const NAV_OF = { index:'home','api-basics':'docs','rest-http':'docs','data-formats':'docs','auth-keys':'docs',frontend:'docs',catalog:'catalog',demo:'demo',glossary:'glossary',about:'about' };

// boot-экран: только на главной
(() => {
  const b = $('#boot'); if (!b) return;
  if (PAGE !== 'index') { b.remove(); return; }
  const end = () => b.classList.add('done');
  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(100, p + 10);
    $('#bootBar').value = p;
    $('#bootPct').textContent = p + '%';
    if (p >= 100) end();
  }, 80);
  b.addEventListener('click', end, { once: true });
  setTimeout(end, 3500);
})();

// CRT-тумблер
(() => {
  const btn = $('#crtToggle'); if (!btn) return;
  const apply = on => { document.body.classList.toggle('crt-off', !on); btn.setAttribute('aria-pressed', on); store.set('crt', on) };
  btn.addEventListener('click', () => apply(document.body.classList.contains('crt-off')));
  apply(store.get('crt', true));
})();

// бургер-меню
(() => {
  const t = $('#navToggle'); if (!t) return;
  t.addEventListener('click', () => {
    const o = $('#siteHeader').classList.toggle('menu-open');
    t.setAttribute('aria-expanded', o);
  });
})();

// прогресс, активный пункт меню
(() => {
  const done = new Set(store.get('done', []));
  if (STAGES.includes(PAGE) && !done.has(PAGE)) { done.add(PAGE); store.set('done', [...done]) }
  $$('.stage-track li').forEach(li => li.classList.toggle('cleared', done.has(li.dataset.stage)));
  $$('.side-stages a').forEach(a => a.classList.toggle('done', done.has(a.dataset.side)));
  const c = $('#monCount');
  if (c) { c.textContent = done.size + '/' + STAGES.length; $('#monBar').value = done.size }
  $$('#siteNav a').forEach(a => {
    const on = a.dataset.nav === NAV_OF[PAGE];
    a.classList.toggle('is-active', on);
    if (on) a.setAttribute('aria-current', 'page');
  });
})();

// фильтр каталога
(() => {
  const btns = $$('.filter-btn'); if (!btns.length) return;
  const rows = $$('#apiTable tbody tr'), count = $('#filterCount');
  const apply = cat => {
    btns.forEach(b => b.classList.toggle('is-warning', b.dataset.cat === cat));
    let n = 0;
    rows.forEach(tr => { const s = cat === 'all' || tr.dataset.cat === cat; tr.hidden = !s; if (s) n++ });
    count.textContent = n;
  };
  btns.forEach(b => b.addEventListener('click', () => apply(b.dataset.cat)));
  apply('all');
})();

// живой запрос к API
(() => {
  const log = $('#termLog'); if (!log) return;
  const meta = $('#termMeta');
  const line = (cls, text) => {
    const d = document.createElement('div');
    d.className = cls;
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  };
  const call = async url => {
    $('#btnFact').disabled = $('#btn404').disabled = true;
    line('t-cmd', '$ fetch(' + url + ')');
    meta.textContent = 'LOADING…';
    try {
      const t0 = performance.now();
      const res = await fetch(url);
      const ms = Math.round(performance.now() - t0);
      line(res.ok ? 't-ok' : 't-err', '← HTTP ' + res.status + ' · ' + ms + ' ms');
      line('t-json', JSON.stringify(await res.json(), null, 2));
      meta.textContent = 'HTTP ' + res.status;
    } catch (e) {
      line('t-err', '✖ NETWORK ERROR: ' + e.message);
      meta.textContent = 'ERROR';
    }
    $('#btnFact').disabled = $('#btn404').disabled = false;
  };
  $('#btnFact').addEventListener('click', () => call('https://catfact.ninja/fact'));
  $('#btn404').addEventListener('click', () => call('https://catfact.ninja/fact404'));
  $('#btnClear').addEventListener('click', () => { log.innerHTML = ''; meta.textContent = 'IDLE' });
})();

// подписка
(() => {
  const f = $('#subForm'); if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const msg = $('#subMsg'), em = $('#subEmail').value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em) && $('#subAgree').checked;
    $('#subEmail').classList.toggle('is-invalid', !ok);
    msg.hidden = false;
    msg.textContent = ok ? 'Готово! ' + em : 'Проверьте email и согласие.';
    msg.style.color = ok ? 'var(--green)' : '';
    if (ok) f.reset();
  });
})();

// год в подвале
(() => { const y = $('#year'); if (y) y.textContent = new Date().getFullYear() })();