// ── AI-DTL editor 0.4.1
// Texts and rules come from js/spec.js, logic from js/label-core.js.

const V = '0.4';
const SPEC_V = SPEC[V];

// ── State (editor input shape, see label-core.js)
const S = {
  stamm: [],
  host:  [],
  review: null,
  acc: null,
  tools: [{ name: '', month: '', year: '' }]
};
let lang = 'de';

function tr() { return SPEC_V.i18n[lang]; }

// Resolves "key" (ui text) or "opt.N.lbl" (path in the language block)
function text(key) {
  const t = tr();
  if (!key.includes('.')) return t.ui[key];
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), t);
}

// Shared links point to the public site, except when the editor runs locally.
function siteBase() {
  const { protocol, hostname, href } = window.location;
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return href.replace(/[?#].*$/, '').replace(/index\.html$/, '');
  }
  return SITE_BASE;
}

// ── Language switch
function setLang(l) {
  lang = l;
  document.getElementById('btn-de').classList.toggle('active', l === 'de');
  document.getElementById('btn-en').classList.toggle('active', l === 'en');
  document.documentElement.lang = l;
  applyT();
  closeAllDD();
  renderToolRows();
  render();
}

function applyT() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const s = text(el.dataset.i18n);
    if (s != null) el.textContent = s;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const s = text(el.dataset.i18nPh);
    if (s) el.placeholder = s;
  });
  // "When does the generator warn?" is generated from the same rules as the hints
  const whenBody = document.querySelector('.warn-details-body');
  if (whenBody) {
    const ul = document.createElement('ul');
    LabelCore.warningRules(V).forEach(rule => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = rule.trigger;
      li.append(strong, ' – ' + tr().warn[rule.id]);
      ul.appendChild(li);
    });
    whenBody.replaceChildren(ul);
  }
}

// ── Inject icons into option cards
function injectIcons() {
  document.querySelectorAll('.opt-icon[data-icon]').forEach(el => {
    el.innerHTML = iconSVG(el.dataset.icon, 32);
  });
}

// ── Option selection (multi for stamm/host, single for review/acc)
function pick(el) {
  const dim = el.dataset.dim, val = el.dataset.val;

  if (dim === 'stamm' || dim === 'host') {
    if (el.classList.contains('selected')) {
      el.classList.remove('selected');
      S[dim] = S[dim].filter(v => v !== val);
    } else {
      // N and A/S/G are mutually exclusive within stamm
      if (dim === 'stamm') {
        const toDeselect = val === 'N' ? ['A', 'S', 'G'] : ['N'];
        toDeselect.forEach(v => {
          document.querySelector(`.opt[data-dim="stamm"][data-val="${v}"]`)?.classList.remove('selected');
          S.stamm = S.stamm.filter(x => x !== v);
        });
      }
      el.classList.add('selected');
      if (!S[dim].includes(val)) S[dim].push(val);
    }
  } else {
    document.querySelectorAll(`.opt[data-dim="${dim}"]`).forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    S[dim] = val;
  }

  const stamm = LabelCore.effectiveStamm(S.stamm, V);
  const onlyN = stamm === 'N';
  const hideExtras = !stamm || onlyN;

  document.getElementById('card-host').classList.toggle('hide', hideExtras);
  document.getElementById('card-review').classList.toggle('hide', hideExtras);
  document.getElementById('card-tool').classList.toggle('hide', hideExtras);
  document.getElementById('no-ai-hint').classList.toggle('show', S.stamm.length > 0 && onlyN);

  if (hideExtras) {
    S.host = [];
    S.review = null;
    document.querySelectorAll('.opt[data-dim="host"]').forEach(o => o.classList.remove('selected'));
    document.querySelectorAll('.opt[data-dim="review"]').forEach(o => o.classList.remove('selected'));
  }

  // Acc:N is only valid when AI was used; hide it (and clear it) when stamm is N
  const accNEl = document.querySelector('.opt[data-dim="acc"][data-val="Acc:N"]');
  if (accNEl) {
    accNEl.classList.toggle('hide', onlyN);
    if (onlyN && S.acc === 'Acc:N') {
      S.acc = null;
      accNEl.classList.remove('selected');
    }
  }

  updateStepStates();
  render();
}

function updateStepStates() {
  const isN = LabelCore.effectiveStamm(S.stamm, V) === 'N';
  [
    { id: 'card-stamm',  done: S.stamm.length > 0 },
    { id: 'card-host',   done: isN || S.host.length > 0 },
    { id: 'card-review', done: isN || !!S.review },
    { id: 'card-acc',    done: !!S.acc },
  ].forEach(s => {
    const el = document.getElementById(s.id);
    if (!el) return;
    el.classList.toggle('completed', s.done);
    const num = el.querySelector('.step-num');
    if (num) num.classList.toggle('done', s.done);
  });
}

function buildLabel() { return LabelCore.buildCode(S, V); }
function buildLabelURL() { return LabelCore.buildURL(S, V, siteBase()); }

// ── Render output
function render() {
  const label = buildLabel();
  const n = LabelCore.normalize(S, V);
  const badgeC   = document.getElementById('badge-container');
  const labelOut = document.getElementById('label-out');
  const exp      = document.getElementById('explain-out');

  if (label) {
    badgeC.innerHTML = buildBadgeSVG(n, V);
    const a = document.createElement('a');
    a.href = buildLabelURL();
    a.target = '_blank';
    a.rel = 'noopener';
    a.className = 'label-link';
    a.textContent = label;
    labelOut.style.display = 'flex';
    labelOut.replaceChildren(a);
    exp.textContent = LabelCore.buildSentence(n, lang, 'text', V);
  } else {
    const ph = document.createElement('span');
    ph.className = 'ph';
    ph.textContent = tr().ui.result_ph;
    badgeC.replaceChildren(ph);
    labelOut.style.display = 'none';
    labelOut.textContent = '';
    exp.textContent = '';
  }

  // Hints name their trigger; only for the person creating the label
  const banner = document.getElementById('warn-banner');
  const active = label ? LabelCore.warnings(n, V) : [];
  const rules = LabelCore.warningRules(V);
  if (active.length) {
    const ul = document.createElement('ul');
    active.forEach(id => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = rules.find(r => r.id === id).trigger + ': ';
      li.append(strong, tr().warn[id]);
      ul.appendChild(li);
    });
    banner.replaceChildren(ul);
  } else {
    banner.replaceChildren();
  }
  banner.classList.toggle('show', active.length > 0);
}

// ── Copy to clipboard
function copyAs(type) {
  if (!buildLabel()) {
    alert(tr().ui.alert_incomplete);
    return;
  }
  const text = LabelCore.buildExport(type, S, { v: V, lang, url: buildLabelURL() });
  const flash = () => {
    document.querySelectorAll('.copy-btn').forEach(b => {
      if (b.dataset.fmt === type) {
        b.classList.add('ok');
        setTimeout(() => b.classList.remove('ok'), 1500);
      }
    });
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(flash).catch(() => fallbackCopy(text, flash));
  } else {
    fallbackCopy(text, flash);
  }
}

function fallbackCopy(text, cb) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.focus(); ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) { alert(text); }
  document.body.removeChild(ta);
}

// ── Date dropdown helpers
function ddItems(kind) {
  if (kind === 'month') return tr().months.map((m, i) => ({ v: String(i + 1).padStart(2, '0'), l: m }));
  const y = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => String(y - i)).map(v => ({ v, l: v }));
}

function closeAllDD() {
  document.querySelectorAll('.dd-list.open').forEach(l => l.classList.remove('open'));
}

function initDD(btnEl, listEl, kind, toolIdx) {
  const ph = () => tr().ui[kind === 'month' ? 'month_ph' : 'year_ph'];
  function refreshBtn() {
    const val = S.tools[toolIdx][kind];
    const found = ddItems(kind).find(it => it.v === val);
    btnEl.textContent = found ? found.l : ph();
    btnEl.classList.toggle('placeholder', !found);
  }
  btnEl.addEventListener('click', () => {
    const wasOpen = listEl.classList.contains('open');
    closeAllDD();
    if (wasOpen) return;
    const items = [{ v: '', l: ph() + ' –', clear: true }, ...ddItems(kind)];
    listEl.replaceChildren(...items.map(it => {
      const d = document.createElement('div');
      d.className = 'dd-item' + (it.clear ? ' dd-clear' : '') + (!it.clear && it.v === S.tools[toolIdx][kind] ? ' selected' : '');
      d.dataset.v = it.v;
      d.textContent = it.l;
      return d;
    }));
    listEl.classList.add('open');
    const sel = listEl.querySelector('.dd-item.selected');
    if (sel) sel.scrollIntoView({ block: 'nearest' });
  });
  listEl.addEventListener('mousedown', e => {
    const item = e.target.closest('.dd-item');
    if (!item) return;
    e.preventDefault();
    S.tools[toolIdx][kind] = item.dataset.v;
    closeAllDD();
    refreshBtn();
    render();
  });
  refreshBtn();
}

// ── Multi-tool rows
function renderToolRows() {
  const container = document.getElementById('tools-container');
  if (!container) return;
  const ui = tr().ui;
  container.innerHTML = '';
  S.tools.forEach((tool, idx) => {
    const row = document.createElement('div');
    row.className = 'tool-row';
    row.innerHTML = `
      <div class="ac-wrap">
        <input type="text" class="tool-input" autocomplete="off"/>
        <div class="ac-list"></div>
      </div>
      <div class="dd-wrap" data-dd="month">
        <button type="button" class="dd-btn placeholder"></button>
        <div class="dd-list"></div>
      </div>
      <div class="dd-wrap" data-dd="year">
        <button type="button" class="dd-btn placeholder"></button>
        <div class="dd-list"></div>
      </div>
      <button type="button" class="remove-tool-btn">×</button>
    `;
    const input = row.querySelector('.tool-input');
    input.placeholder = ui.tool_ph;
    input.value = tool.name;
    input.setAttribute('aria-label', ui.tool_aria);
    row.querySelector('[data-dd="month"] .dd-btn').setAttribute('aria-label', ui.month_ph);
    row.querySelector('[data-dd="year"] .dd-btn').setAttribute('aria-label', ui.year_ph);
    const rm = row.querySelector('.remove-tool-btn');
    rm.style.visibility = S.tools.length > 1 ? 'visible' : 'hidden';
    rm.setAttribute('aria-label', ui.remove_tool_aria);
    container.appendChild(row);
    initAC(input, row.querySelector('.ac-list'), idx);
    initDD(row.querySelector('[data-dd="month"] .dd-btn'), row.querySelector('[data-dd="month"] .dd-list'), 'month', idx);
    initDD(row.querySelector('[data-dd="year"] .dd-btn'),  row.querySelector('[data-dd="year"] .dd-list'),  'year',  idx);
    rm.addEventListener('click', () => removeTool(idx));
  });
}

function addTool() {
  S.tools.push({ name: '', month: '', year: '' });
  renderToolRows();
  const rows = document.querySelectorAll('#tools-container .tool-row');
  if (rows.length) rows[rows.length - 1].querySelector('.tool-input').focus();
}

function removeTool(idx) {
  S.tools.splice(idx, 1);
  renderToolRows();
  render();
}

// ── Autocomplete (per tool input)
function initAC(inputEl, listEl, toolIdx) {
  let flat = [], active = -1;
  function close() { listEl.classList.remove('open'); active = -1; }
  function renderACList(q) {
    const qq = q.trim().toLowerCase();
    if (qq.length < 2) { close(); return; }
    const nodes = [];
    flat = [];
    AI_TOOLS.forEach(g => {
      const hits = g.items.filter(item => item.toLowerCase().includes(qq));
      if (!hits.length) return;
      const head = document.createElement('div');
      head.className = 'ac-group';
      head.textContent = g.group;
      nodes.push(head);
      hits.forEach(item => {
        const d = document.createElement('div');
        d.className = 'ac-item';
        d.dataset.i = flat.length;
        flat.push(item);
        const i = item.toLowerCase().indexOf(qq);
        const b = document.createElement('b');
        b.textContent = item.slice(i, i + qq.length);
        d.append(item.slice(0, i), b, item.slice(i + qq.length));
        nodes.push(d);
      });
    });
    listEl.replaceChildren(...nodes);
    listEl.classList.toggle('open', flat.length > 0);
    active = -1;
  }
  function selectVal(v) {
    inputEl.value = v; S.tools[toolIdx].name = v; close(); render();
  }
  inputEl.addEventListener('input', () => { S.tools[toolIdx].name = inputEl.value; renderACList(inputEl.value); render(); });
  inputEl.addEventListener('focus', () => renderACList(inputEl.value));
  inputEl.addEventListener('keydown', e => {
    if (!listEl.classList.contains('open')) return;
    const items = listEl.querySelectorAll('.ac-item');
    if      (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); active = Math.max(active - 1, 0); }
    else if (e.key === 'Enter')     { e.preventDefault(); if (active >= 0) selectVal(flat[active]); return; }
    else if (e.key === 'Escape')    { close(); return; }
    else return;
    items.forEach((el, i) => el.classList.toggle('active', i === active));
    if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
  });
  listEl.addEventListener('mousedown', e => {
    const item = e.target.closest('.ac-item');
    if (item) { e.preventDefault(); selectVal(flat[+item.dataset.i]); }
  });
  document.addEventListener('click', e => { if (!e.target.closest('.ac-wrap')) close(); });
}

// ── Global close handlers
document.addEventListener('click', e => { if (!e.target.closest('.dd-wrap')) closeAllDD(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAllDD(); });

// ── Init
applyT();
injectIcons();
renderToolRows();
