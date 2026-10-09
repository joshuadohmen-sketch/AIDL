// ── AI-DTL editor 0.5 (release candidate)
// Texts and rules: js/spec.js · logic: js/label-core.js · pictograms and badge: js/icons.js
// Nothing is stored: no cookies, no localStorage, no requests besides loading this page.

(function () {
'use strict';

const V = '0.5';
const SPEC_V = SPEC[V];
const PARAMS = new URLSearchParams(window.location.search);
const STUDY = PARAMS.get('modus') === 'studie';
const STUDY_CASE = /^V\d{2}$/.test(PARAMS.get('fall') || '') ? PARAMS.get('fall') : '';
const INPUT_TYPE = { stamm: 'checkbox', host: 'checkbox', review: 'radio', acc: 'radio' };
const STEP_OF = { stamm: 'step-stamm', tool: 'step-tools', date: 'step-tools', host: 'step-host', review: 'step-review', acc: 'step-acc' };

const emptyTool = () => ({ name: '', month: '', year: '', service: null });
const freshState = () => ({
  stamm: [], host: [], review: null, acc: null, tools: [emptyTool()], p: '', rp: '',
  hostSource: 'suggested', // 'suggested' → hosts follow the chosen services; 'user' → never changed automatically
  art50: null,
});

const S = freshState();
let lang = 'de';
let helperAnswers = {};
let art50AutoOpened = false;
const rowHint = {}; // tool row index → 'bad_chars'

// ── Small helpers
const $ = sel => document.querySelector(sel);
const tr = () => SPEC_V.i18n[lang];
const txt = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), tr());
const fillT = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
const codeLabel = code => `${tr().opt[code].lbl} (${code})`;

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => {
    if (k === 'attrs') Object.entries(v).forEach(([a, val]) => node.setAttribute(a, val));
    else node[k] = v;
  });
  children.forEach(c => { if (c != null && c !== false) node.append(c); });
  return node;
}

function siteBase() {
  const { protocol, hostname, href } = window.location;
  if (protocol === 'file:' || hostname === 'localhost' || hostname === '127.0.0.1') {
    return href.replace(/[?#].*$/, '').replace(/index\.html$/, '');
  }
  return SITE_BASE;
}
const currentURL = () => LabelCore.buildURL(S, V, siteBase());

// ── Option cards, generated from the spec
function optId(dim, code) { return `opt-${dim}-${code.replace(':', '-').replace('!', 'x')}`; }
function optInput(dim, code) { return document.getElementById(optId(dim, code)); }

function buildOptions() {
  document.querySelectorAll('.opts[data-dim]').forEach(box => {
    const dim = box.dataset.dim;
    box.replaceChildren(...SPEC_V.order[dim].map(code => {
      const id = optId(dim, code);
      const input = el('input', {
        className: 'opt-input', type: INPUT_TYPE[dim], name: dim, value: code, id,
        attrs: { 'aria-labelledby': `${id}-l ${id}-c`, 'aria-describedby': `${id}-d` },
      });
      const icon = el('span', { className: 'opt-icon', attrs: { 'aria-hidden': 'true' } });
      icon.innerHTML = iconSVG(code, 36); // fixed pictogram table
      return el('label', { className: 'opt', htmlFor: id },
        input,
        el('span', { className: 'opt-body' },
          el('span', { className: `opt-mark ${INPUT_TYPE[dim] === 'checkbox' ? 'square' : 'round'}`, attrs: { 'aria-hidden': 'true' } }),
          icon,
          el('span', { className: 'code', id: `${id}-c` }, code),
          el('span', { className: 'lbl', id: `${id}-l` }),
          el('span', { className: 'dsc', id: `${id}-d` })));
    }));
  });
}

// Writes the state into the form controls (after examples, restart, loading, helper)
function syncForm() {
  ['stamm', 'host'].forEach(dim => SPEC_V.order[dim].forEach(code => {
    optInput(dim, code).checked = S[dim].includes(code);
  }));
  ['review', 'acc'].forEach(dim => SPEC_V.order[dim].forEach(code => {
    optInput(dim, code).checked = S[dim] === code;
  }));
  $('#purpose').value = S.p;
  $('#resp').value = S.rp;
  document.querySelectorAll('input[name="art50"]').forEach(r => { r.checked = r.value === S.art50; });
}

function onOptionChange(input) {
  const dim = input.name, code = input.value;
  if (dim === 'stamm') {
    // "No AI" excludes every other level
    if (input.checked) {
      SPEC_V.order.stamm.forEach(c => {
        if ((code === 'N') !== (c === 'N')) optInput('stamm', c).checked = false;
      });
    }
    S.stamm = SPEC_V.order.stamm.filter(c => optInput('stamm', c).checked);
  } else if (dim === 'host') {
    S.host = SPEC_V.order.host.filter(c => optInput('host', c).checked);
    S.hostSource = 'user';
  } else {
    S[dim] = code;
  }
  update();
}

// ── Texts
function applyTexts() {
  const t = tr();
  document.documentElement.lang = lang;
  document.title = `${t.ui.title} · ${t.ui.header_version}`;
  document.querySelectorAll('[data-t]').forEach(node => {
    const s = txt(node.dataset.t);
    if (typeof s === 'string') node.textContent = s;
  });
  document.querySelectorAll('.step-num').forEach(n => { n.dataset.word = t.ui.step; });
  document.querySelectorAll('.opt-input').forEach(input => {
    const o = t.opt[input.value];
    document.getElementById(`${input.id}-l`).textContent = o.lbl;
    document.getElementById(`${input.id}-d`).textContent = o.dsc;
  });
  $('#purpose').placeholder = t.purpose.ph;
  $('#resp').placeholder = t.resp.ph;
  $('#btn-de').setAttribute('aria-pressed', String(lang === 'de'));
  $('#btn-en').setAttribute('aria-pressed', String(lang === 'en'));

  // Example list
  const sel = $('#example-select');
  const current = sel.value;
  sel.replaceChildren(el('option', { value: '' }, t.ui.example_none),
    ...EXAMPLES.map(ex => el('option', { value: ex.id }, `${ex.id.replace('D.', '')} · ${ex.title[lang]}`)));
  sel.value = current;

  // "When does the editor show hints?" – generated from the same rules as the hints
  $('#when-body').replaceChildren(el('ul', {},
    ...LabelCore.warningRules(V).map(r => el('li', {}, el('strong', {}, r.trigger), ' – ' + t.warn[r.id]))));

  if (STUDY) {
    $('#study-banner').textContent = t.ui.study_banner + (STUDY_CASE ? ` · ${t.ui.study_case} ${STUDY_CASE}` : '');
  }
}

function setLang(l) {
  lang = l;
  applyTexts();
  renderToolRows();
  renderHelper();
  update();
}

// ── Tools step
function renderToolRows() {
  const box = $('#tools-container');
  box.replaceChildren(...S.tools.map((tool, i) => toolRow(tool, i)));
}

function toolRow(tool, i) {
  const t = tr();
  const many = S.tools.length > 1;
  const nameId = `tool-name-${i}`, listId = `tool-list-${i}`, dateLbl = `tool-date-${i}`;
  const input = el('input', {
    type: 'text', id: nameId, className: 'tool-input', value: tool.name, placeholder: t.tools.ph,
    maxLength: 80, autocomplete: 'off', spellcheck: false,
    attrs: { role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId, 'aria-describedby': `tool-hint-${i}` },
  });
  const list = el('ul', { id: listId, className: 'ac-list', hidden: true, attrs: { role: 'listbox', 'aria-label': t.ui.tool_name } });

  const month = el('select', { id: `tool-month-${i}`, attrs: { 'aria-label': t.ui.month } },
    el('option', { value: '' }, t.ui.month),
    ...t.months.map((m, k) => el('option', { value: String(k + 1).padStart(2, '0') }, m)));
  const y = new Date().getFullYear();
  const year = el('select', { id: `tool-year-${i}`, attrs: { 'aria-label': t.ui.year } },
    el('option', { value: '' }, t.ui.year),
    ...Array.from({ length: 8 }, (_, k) => String(y - k)).map(v => el('option', { value: v }, v)));
  month.value = tool.month;
  year.value = tool.year;
  month.addEventListener('change', () => { S.tools[i].month = month.value; update(); });
  year.addEventListener('change', () => { S.tools[i].year = year.value; update(); });

  const remove = many
    ? el('button', { type: 'button', className: 'remove-tool-btn', attrs: { 'aria-label': `${t.ui.remove_tool} ${i + 1}` } }, '×')
    : null;
  if (remove) remove.addEventListener('click', () => removeTool(i));

  const row = el('div', { className: 'tool-row' },
    el('div', { className: 'tool-name' },
      el('label', { className: 'mini-label', htmlFor: nameId }, many ? `${t.ui.tool_name} ${i + 1}` : t.ui.tool_name),
      el('div', { className: 'ac-wrap' }, input, list)),
    el('div', { className: 'tool-date', attrs: { role: 'group', 'aria-labelledby': dateLbl } },
      el('span', { className: 'mini-label', id: dateLbl }, t.tools.date),
      el('div', { className: 'date-selects' }, month, year)),
    remove,
    el('p', { className: 'row-hint', id: `tool-hint-${i}` }));
  initCombo(input, list, i);
  return row;
}

function addTool() {
  S.tools.push(emptyTool());
  renderToolRows();
  update();
  document.getElementById(`tool-name-${S.tools.length - 1}`).focus();
}

function removeTool(i) {
  S.tools.splice(i, 1);
  Object.keys(rowHint).forEach(k => delete rowHint[k]);
  renderToolRows();
  update();
  document.getElementById(`tool-name-${Math.max(0, i - 1)}`).focus();
}

// Autocomplete as an ARIA combobox; blocks ; ( ) , | while typing (A.2.5)
function initCombo(input, list, i) {
  let items = [];
  let active = -1;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const open = q => {
    const qq = q.trim().toLowerCase();
    if (qq.length < 2) return close();
    items = [];
    const nodes = [];
    SERVICES.forEach(g => {
      const hits = g.items.filter(it => it.name.toLowerCase().includes(qq) || (it.hint && it.hint[lang].toLowerCase().includes(qq)));
      if (!hits.length) return;
      nodes.push(el('li', { className: 'ac-group', attrs: { role: 'presentation' } }, g.group[lang]));
      hits.forEach(it => {
        const idx = items.length;
        items.push(it);
        const li = el('li', { className: 'ac-item', id: `tool-opt-${i}-${idx}`, attrs: { role: 'option', 'aria-selected': 'false' } },
          it.name, it.hint ? el('span', { className: 'ac-hint' }, ` – ${it.hint[lang]}`) : null);
        li.addEventListener('mousedown', e => { e.preventDefault(); choose(idx); });
        nodes.push(li);
      });
    });
    list.replaceChildren(...nodes);
    list.hidden = !items.length;
    input.setAttribute('aria-expanded', String(items.length > 0));
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const choose = idx => {
    const it = items[idx];
    input.value = it.generic ? `${it.name}/` : it.name;
    S.tools[i].name = input.value;
    S.tools[i].service = it;
    close();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
    update();
  };
  const move = d => {
    const opts = list.querySelectorAll('.ac-item');
    if (!opts.length) return;
    active = Math.max(0, Math.min(opts.length - 1, active + d));
    opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === active)));
    input.setAttribute('aria-activedescendant', opts[active].id);
    opts[active].scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('beforeinput', e => {
    if (e.data && LabelCore.TOOL_FORBIDDEN.test(e.data)) {
      e.preventDefault();
      rowHint[i] = 'bad_chars';
      renderToolHints();
    }
  });
  input.addEventListener('input', () => {
    const clean = LabelCore.stripToolChars(input.value);
    if (clean !== input.value) {
      input.value = clean;
      rowHint[i] = 'bad_chars';
    } else if (rowHint[i] === 'bad_chars') {
      delete rowHint[i];
    }
    S.tools[i].name = input.value;
    // a chosen service stays attached while the name still starts with it ("Academic Cloud/…")
    const svc = S.tools[i].service;
    if (svc && input.value !== svc.name && !input.value.startsWith(`${svc.name}/`)) S.tools[i].service = null;
    open(input.value);
    update();
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) open(input.value); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!list.hidden && active >= 0) choose(active); }
    else if (e.key === 'Escape' && !list.hidden) { e.preventDefault(); close(); }
  });
  input.addEventListener('blur', close);
}

function renderToolHints() {
  const t = tr();
  S.tools.forEach((tool, i) => {
    const p = document.getElementById(`tool-hint-${i}`);
    if (!p) return;
    let msg = '';
    if (rowHint[i] === 'bad_chars') msg = t.tools.bad_chars;
    else if (tool.service && tool.service.generic && tool.name.endsWith('/')) msg = t.tools.generic;
    p.textContent = msg;
  });
  // Host suggestion notes (A.2.4), not in study mode
  const notes = [];
  if (!STUDY && S.hostSource === 'suggested') {
    S.tools.forEach(tool => {
      const svc = tool.service;
      if (!svc || !svc.host) return;
      const service = svc.hint ? `${svc.name} (${svc.hint[lang]})` : svc.name;
      notes.push(el('p', { className: 'hint' }, fillT(t.tools.host_suggest, { host: t.opt[svc.host].lbl, service })));
    });
  }
  $('#tool-hints').replaceChildren(...notes);
}

// ── Decision helper (A.1.4)
function renderHelper() {
  const h = tr().helper, ui = tr().ui, enableM = SPEC_V.enableM;
  const answerText = (q, v) => (q === 'q3' ? (v === 'both' ? h.q3_both : codeLabel(v)) : (v ? ui.yes : ui.no));
  const nodes = [];
  ['q1', 'q1b', 'q2', 'q2b', 'q3'].forEach(q => {
    if (helperAnswers[q] != null) nodes.push(el('p', { className: 'helper-done' }, `${h[q]} `, el('strong', {}, answerText(q, helperAnswers[q]))));
  });
  const next = LabelCore.helperNext(helperAnswers, enableM);
  const btn = (label, onClick, cls = 'btn-secondary') => {
    const b = el('button', { type: 'button', className: cls }, label);
    b.addEventListener('click', onClick);
    return b;
  };
  const answer = (q, v) => () => {
    helperAnswers[q] = v;
    renderHelper();
    const first = $('#helper-body button');
    if (first) first.focus();
  };
  if (next) {
    nodes.push(el('p', { className: 'helper-q' }, h[next]));
    const choices = next === 'q3'
      ? [['M', codeLabel('M')], ['G', codeLabel('G')], ['both', h.q3_both]]
      : [[true, ui.yes], [false, ui.no]];
    nodes.push(el('div', { className: 'helper-btns' }, ...choices.map(([v, l]) => btn(l, answer(next, v)))));
    if (next === 'q3') nodes.push(el('p', { className: 'helper-note' }, h.both_note));
  } else {
    const code = LabelCore.helperResult(helperAnswers, enableM);
    nodes.push(el('p', { className: 'helper-result' }, fillT(h.result, { X: codeLabel(code) })));
    nodes.push(el('div', { className: 'helper-btns' },
      btn(h.apply, () => {
        S.stamm = [code];
        syncForm();
        update();
        optInput('stamm', code).focus();
      }, 'btn-primary'),
      btn(h.again, () => { helperAnswers = {}; renderHelper(); $('#helper-body button').focus(); })));
  }
  $('#helper-body').replaceChildren(...nodes);
}

// ── Art. 50 box (A.8)
function renderArt50(n) {
  const box = $('#art50');
  const a = LabelCore.art50Hint(n);
  box.hidden = !a.visible;
  if (a.open && !art50AutoOpened) { box.open = true; art50AutoOpened = true; }
  if (!a.open) art50AutoOpened = false;

  const t = tr().art50;
  const out = [];
  if (S.art50 === 'yes') {
    out.push(el('p', {}, fillT(t.yes, { icon: `„${t.icons[a.icon]}“` })));
    out.push(el('p', {}, el('a', { href: SPEC_V.euLabelsUrl, target: '_blank', rel: 'noopener' }, t.link)));
  } else if (S.art50 === 'no') {
    out.push(el('p', {}, t.no));
  } else if (S.art50 === 'unknown') {
    out.push(el('p', {}, t.unknown));
  }
  $('#art50-answer').replaceChildren(...out);
}

// ── Sentence with ORCID / ROR as links (DOM, never innerHTML)
function sentenceNodes(sentence, rp) {
  if (!rp) return [sentence];
  const phrase = fillT(tr().sentence.resp, { rp });
  const at = sentence.indexOf(phrase);
  if (at < 0) return [sentence];
  const rpAt = at + tr().sentence.resp.indexOf('{rp}');
  const parts = LabelCore.idSegments(rp).map(seg => (seg.type === 'text'
    ? seg.text
    : el('a', { href: seg.url, target: '_blank', rel: 'noopener' }, seg.text)));
  return [sentence.slice(0, rpAt), ...parts, sentence.slice(rpAt + rp.length)];
}

// ── Result
function renderResult(n) {
  const t = tr();
  const missing = LabelCore.validate(S, V);
  const ok = missing.length === 0;

  if (ok) {
    $('#missing').replaceChildren();
  } else {
    const [before, after = ''] = t.missing.title.split('{list}');
    const nodes = [
      el('p', {}, before.trim()),
      el('ul', {}, ...missing.map(key => {
        const b = el('button', { type: 'button', className: 'link-btn' }, t.missing[key]);
        b.addEventListener('click', () => focusField(key));
        return el('li', {}, b);
      })),
    ];
    if (after.trim()) nodes.push(el('p', {}, after.trim()));
    $('#missing').replaceChildren(...nodes);
  }

  $('#result-body').hidden = !ok;
  if (ok) {
    const code = LabelCore.buildCode(S, V);
    const url = currentURL();
    const sentence = LabelCore.buildSentence(n, lang, 'text', V);
    $('#sentence').replaceChildren(...sentenceNodes(sentence, n.rp));
    const link = $('#code-link');
    link.textContent = code;
    link.href = url;
    $('#badge-container').innerHTML = buildBadgeSVG(n, { version: V, words: t.badge, title: code, desc: sentence, url });
  }

  document.querySelectorAll('#copy-row .copy-btn').forEach(b => b.setAttribute('aria-disabled', String(!ok)));
  $('#study-copy').setAttribute('aria-disabled', String(!ok));

  // Hints (A.7): concrete, for the person creating the label only
  const active = LabelCore.warnings(n, V);
  $('#hints').replaceChildren(...(active.length
    ? [el('ul', {}, ...active.map(id => el('li', {}, t.warn[id])))]
    : []));
  $('#hints').hidden = !active.length;
}

function focusField(key) {
  const step = document.getElementById(STEP_OF[key]);
  let target = step.querySelector('input:not([disabled]), select');
  if (key === 'date') {
    const i = S.tools.findIndex(tl => !LabelCore.DATE_RE.test(tl.month && tl.year ? `${tl.month}/${tl.year}` : ''));
    target = document.getElementById(`tool-month-${Math.max(0, i)}`);
  } else if (key === 'tool') {
    const i = S.tools.findIndex(tl => !LabelCore.isValidToolName(tl.name.trim()));
    target = document.getElementById(`tool-name-${Math.max(0, i)}`);
  }
  step.scrollIntoView({ block: 'start', behavior: 'smooth' });
  if (target) target.focus({ preventScroll: true });
}

// ── Central update
function update() {
  // Host suggestion from the chosen services (E4); never in study mode
  if (!STUDY && S.hostSource === 'suggested') {
    S.host = LabelCore.suggestedHosts(S.tools.map(tl => tl.service));
    SPEC_V.order.host.forEach(c => { optInput('host', c).checked = S.host.includes(c); });
  }

  const n = LabelCore.normalize(S, V);
  const isN = n.stamm === 'N';

  // Without AI the tool, hosting and review steps are skipped; numbering stays gap-free (CSS counter)
  ['#step-tools', '#step-host', '#step-review'].forEach(sel => { $(sel).hidden = isN; });
  $('#field-purpose').hidden = isN;
  $('#no-ai-hint').hidden = !isN;
  if (isN && S.p) { S.p = ''; $('#purpose').value = ''; }

  // Acc:N only when AI was used
  const accN = optInput('acc', 'Acc:N');
  accN.closest('label').hidden = isN;
  if (isN && S.acc === 'Acc:N') { S.acc = null; accN.checked = false; }

  // "Who is accountable?" is off for Acc:N
  const resp = $('#resp');
  resp.disabled = S.acc === 'Acc:N';
  if (resp.disabled && S.rp) { S.rp = ''; resp.value = ''; }

  // Cumulation feedback (A.1.3, A.3.3)
  const t = tr();
  $('#cumul-stamm').textContent = S.stamm.length ? fillT(t.cumul.stamm, { X: codeLabel(n.stamm) }) : '';
  const host = LabelCore.effectiveHost(S.host, V);
  $('#cumul-host').textContent = host ? fillT(t.cumul.host, { X: codeLabel(host) }) : '';

  $('#review-hint').hidden = !(n.stamm === 'A' || n.stamm === 'S');

  renderToolHints();
  renderArt50(LabelCore.normalize(S, V));
  renderResult(LabelCore.normalize(S, V));
}

// ── Copy and download
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text) {
  const ta = el('textarea', { value: text });
  ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
}

function announce(btn, message) {
  $('#copy-status').textContent = '';
  // re-set on the next frame so screen readers announce repeated messages
  requestAnimationFrame(() => { $('#copy-status').textContent = message; });
  if (!btn) return;
  btn.classList.add('ok');
  btn.dataset.label = btn.dataset.label || btn.textContent;
  btn.textContent = `✓ ${tr().ui.copied}`;
  clearTimeout(btn._timer);
  btn._timer = setTimeout(() => {
    btn.classList.remove('ok');
    btn.textContent = txt(btn.dataset.t);
    delete btn.dataset.label;
  }, 1800);
}

function onExport(btn) {
  if (btn.getAttribute('aria-disabled') === 'true') {
    const first = $('#missing .link-btn');
    if (first) first.focus();
    return;
  }
  const fmt = btn.dataset.fmt;
  const label = txt(btn.dataset.t);
  if (fmt === 'svg' || fmt === 'png') {
    (fmt === 'svg' ? downloadBadge : downloadBadgePNG)('#badge-container');
    $('#copy-status').textContent = `${tr().ui.downloaded}: ${label}`;
    return;
  }
  const text = LabelCore.buildExport(fmt, S, { v: V, lang, url: currentURL() });
  copyText(text).then(() => announce(btn, `${tr().ui.copied}: ${label}`));
}

// ── Load: examples, restart, existing labels
function loadState(next, opts = {}) {
  Object.assign(S, freshState(), next);
  if (!S.tools.length) S.tools = [emptyTool()];
  helperAnswers = {};
  art50AutoOpened = false;
  Object.keys(rowHint).forEach(k => delete rowHint[k]);
  $('#legacy-notice').hidden = !opts.legacy;
  if (opts.legacy) $('#legacy-notice').textContent = tr().ui.legacy_loaded;
  syncForm();
  renderToolRows();
  renderHelper();
  update();
}

function loadExample(id) {
  const ex = EXAMPLES.find(e => e.id === id);
  if (!ex) return;
  const stamm = (!SPEC_V.enableM && ex.noM) ? ex.noM : ex.state.stamm;
  loadState({
    stamm: [...stamm], host: [...ex.state.host], review: ex.state.review, acc: ex.state.acc,
    tools: ex.state.tools.map(tl => ({ ...tl, service: null })),
    hostSource: 'user',
  });
}

function restart() {
  $('#example-select').value = '';
  $('#helper').open = false;
  $('#art50').open = false;
  loadState({});
  const first = document.querySelector('#step-stamm .opt-input');
  first.closest('fieldset').scrollIntoView({ block: 'start' });
  first.focus({ preventScroll: true });
}

// Opening the editor with label parameters fills the form (3.17); 0.4 labels are carried over with a notice.
function loadFromParams() {
  if (!PARAMS.has('s')) return;
  const r = LabelCore.fromParams(PARAMS);
  if (!r) return;
  const s = r.state;
  const next = {
    stamm: [s.stamm],
    host: s.host ? [s.host] : [],
    review: s.review,
    acc: (s.stamm === 'N' && s.acc === 'Acc:N') ? null : s.acc,
    tools: s.tools.map(tl => {
      const [month = '', year = ''] = /^\d{2}\/\d{4}$/.test(tl.date) ? tl.date.split('/') : [];
      return { name: LabelCore.stripToolChars(tl.name).slice(0, 80).trim(), month, year, service: null };
    }),
    p: s.p, rp: s.rp, hostSource: 'user',
  };
  loadState(next, { legacy: r.v === '0.4' });
}

// ── Wiring
function init() {
  buildOptions();

  $('#editor').addEventListener('submit', e => e.preventDefault());
  $('#editor').addEventListener('change', e => {
    if (e.target.classList.contains('opt-input')) onOptionChange(e.target);
  });
  $('#purpose').addEventListener('input', e => {
    const v = e.target.value.replace(/[<>]/g, '');
    if (v !== e.target.value) e.target.value = v;
    S.p = v;
    update();
  });
  $('#resp').addEventListener('input', e => {
    const v = e.target.value.replace(/[<>]/g, '');
    if (v !== e.target.value) e.target.value = v;
    S.rp = v;
    update();
  });
  document.querySelectorAll('input[name="art50"]').forEach(r => r.addEventListener('change', () => {
    S.art50 = r.value;
    update();
  }));
  $('#add-tool-btn').addEventListener('click', addTool);
  $('#restart-btn').addEventListener('click', restart);
  $('#example-select').addEventListener('change', e => loadExample(e.target.value));
  $('#btn-de').addEventListener('click', () => setLang('de'));
  $('#btn-en').addEventListener('click', () => setLang('en'));
  document.querySelectorAll('#copy-row .copy-btn').forEach(b => b.addEventListener('click', () => onExport(b)));
  const studyBtn = $('#study-copy');
  studyBtn.addEventListener('click', () => {
    if (studyBtn.getAttribute('aria-disabled') === 'true') return;
    // one line for the questionnaire: code and link, separated by a space
    const line = `${LabelCore.buildCode(S, V)} ${currentURL()}`;
    copyText(line).then(() => announce(studyBtn, tr().ui.copied));
  });

  if (STUDY) {
    $('#study-banner').hidden = false;
    $('#example-wrap').hidden = true;
    $('#restart-btn').classList.add('btn-primary');
    $('#study-copy').hidden = false;
  }

  applyTexts();
  renderToolRows();
  renderHelper();
  update();
  loadFromParams();
}

init();
})();
