// ── State
const S = {
  stamm: [],
  host:  [],
  review: null,
  acc: null,
  tools: [{ name: '', month: '', year: '' }]
};
let lang = 'de';

// ── Rank helpers (multi-select: highest stamm wins, weakest host wins)
const STAMM_RANK = { N: 0, A: 1, S: 2, G: 3 };
const HOST_RANK  = { 'H:C!': 0, 'H:C': 1, 'H:I': 2, 'H:L': 3 }; // 0 = weakest protection

function effectiveStamm() {
  if (!S.stamm.length) return null;
  return S.stamm.reduce((b, c) => STAMM_RANK[c] > STAMM_RANK[b] ? c : b);
}
function effectiveHost() {
  if (!S.host.length) return null;
  return S.host.reduce((b, c) => HOST_RANK[c] < HOST_RANK[b] ? c : b);
}

// ── Translations
const T = {
  de: {
    hero_title: 'AI Disclosure & Transparency Label Generator',
    hero_desc: 'Generieren Sie ein valides AI-DTL 0.4 für Ihr Artefakt.',
    step: 'Schritt 1', step2: 'Schritt 2', step3: 'Schritt 3', step4: 'Schritt 4', step5: 'Schritt 5',
    s1_title: 'Ausmaß der KI-Nutzung',         s1_sub: 'Wie stark war KI an der Entstehung des Artefakts beteiligt?',
    s1_hint: 'Mehrfachauswahl möglich – bei mehreren Stufen zählt die höchste tatsächliche Wirkung.',
    s2_title: 'Hosting-Kontext',                s2_sub: 'Wo lief das KI-System? Relevant für Datenschutz und DFG-Konformität.',
    s2_hint: 'Mehrfachauswahl möglich – bei mehreren Hosts zählt der am wenigsten geschützte.',
    s3_title: 'Prüfung der KI-Ausgaben',        s3_sub: 'Wurden die KI-Ausgaben geprüft, bevor sie übernommen wurden?',
    s4_title: 'Accountability – Verantwortung', s4_sub: 'Wer steht für das Artefakt ein?',
    s5_title: 'Tool-Angabe',                    s5_sub: 'Welches KI-System wurde verwendet? Name, Version und Monat der Nutzung.',
    n_lbl: 'No AI',           n_dsc: 'Keine KI-Beteiligung am Artefakt',
    a_lbl: 'Assistive',       a_dsc: 'Sprachpolitur, Rechtschreibkorrektur, Übersetzung',
    s_lbl: 'Supportive',      s_dsc: 'Brainstorming, Gliederung, Recherche-Hilfe',
    g_lbl: 'Generative',      g_dsc: 'Substantielle Text-, Code- oder Datengenerierung',
    hl_lbl: 'Local',          hl_dsc: 'Lokal ausgeführt, keine Datenübertragung (z.B. Ollama)',
    hi_lbl: 'Institutional',  hi_dsc: 'Hochschul- oder Behördeninstanz mit interner AVV',
    hc_lbl: 'Cloud w/ DPA',   hc_dsc: 'Kommerzieller Cloud-Dienst mit Auftragsverarbeitungsvertrag',
    hcx_lbl: 'Cloud w/o DPA', hcx_dsc: 'Ohne AVV – in vielen Kontexten unzulässig',
    rh_lbl: 'Human reviewed',  rh_dsc: 'Menschliche Prüfung der KI-Ausgaben',
    rm_lbl: 'Machine reviewed', rm_dsc: 'Automatisierte Prüfung (Linter, Faktenchecker)',
    rhm_lbl: 'Both',           rhm_dsc: 'Mensch und Maschine haben geprüft',
    rn_lbl: 'None',            rn_dsc: 'Keine Prüfung – Ausgabe unverändert übernommen',
    ai_lbl: 'Individual',      ai_dsc: 'Benennbare Einzelperson (z.B. Autor:in mit ORCID)',
    ao_lbl: 'Organizational',  ao_dsc: 'Organisation übernimmt Verantwortung',
    an_lbl: 'None claimed',    an_dsc: 'Rein agentischer Raum – kein Mensch steht ein',
    tool_ph: 'z.B. Claude Opus 4.6', tool_aria: 'KI-Tool Name',
    btn_add_tool: '+ weiteres Tool', remove_tool_aria: 'Tool entfernen',
    warn_txt: '⚠ Die gewählte Kombination enthält kritische Merkmale. In vielen institutionellen Kontexten ist diese Konfiguration problematisch oder unzulässig.',
    warn_when_title: 'Wann warnt der Generator?',
    warn_when_body: '<ul><li><strong>H:C!</strong> – Cloud-Nutzung ohne Auftragsverarbeitungsvertrag (AVV). In vielen institutionellen Kontexten datenschutzrechtlich unzulässig.</li><li><strong>G + R:N</strong> – Generative KI-Ausgabe wurde ungeprüft übernommen. Erhöhtes Fehler- und Halluzinationsrisiko.</li><li><strong>G + Acc:N</strong> – Keine Verantwortlichkeit bei generativer KI-Nutzung deklariert.</li><li><strong>G + R:N + Acc:N</strong> – Maximale Warnstufe: vollautomatisch generiert, ungeprüft, keine Verantwortung.</li></ul>',
    result_label: 'Ihr AI-DTL-Label',
    result_ph: 'Bitte alle Felder ausfüllen …',
    btn_text: 'Text kopieren', btn_meta: 'HTML &lt;meta&gt;', btn_md: 'Markdown',
    btn_latex: 'LaTeX', btn_link: 'Link kopieren', btn_jsonld: 'JSON-LD',
    btn_badge: 'Badge ↓ SVG', btn_png: 'Badge ↓ PNG',
    no_ai_hint: 'Bei N entfallen Host, Review und Tool. Bitte Accountability auswählen.',
    month_ph: 'Monat', year_ph: 'Jahr',
    months: ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'],
    exp: {
      N: 'Keine KI-Beteiligung', A: 'Assistive Nutzung', S: 'Supportive Nutzung', G: 'Generative Nutzung',
      'H:L': 'lokal gehostet', 'H:I': 'institutionell gehostet', 'H:C': 'Cloud mit AVV', 'H:C!': '⚠ Cloud ohne AVV',
      'R:H': 'menschlich geprüft', 'R:M': 'maschinell geprüft', 'R:HM': 'Mensch & Maschine', 'R:N': '⚠ nicht geprüft',
      'Acc:I': 'Einzelperson verantwortlich', 'Acc:O': 'Organisation verantwortlich', 'Acc:N': '⚠ keine Accountability',
    },
  },
  en: {
    hero_title: 'AI Disclosure & Transparency Label Generator',
    hero_desc: 'Generate a valid AI-DTL 0.4 for your artefact.',
    step: 'Step 1', step2: 'Step 2', step3: 'Step 3', step4: 'Step 4', step5: 'Step 5',
    s1_title: 'Extent of AI Use',    s1_sub: 'How deeply was AI involved in creating this artefact?',
    s1_hint: 'Multiple selection possible – when multiple levels apply, the highest effective level is coded.',
    s2_title: 'Hosting Context',     s2_sub: 'Where did the AI run? Relevant for data protection and DFG compliance.',
    s2_hint: 'Multiple selection possible – when multiple hosts apply, the least protected is coded.',
    s3_title: 'Review of AI Output', s3_sub: 'Was the AI output reviewed before being adopted?',
    s4_title: 'Accountability',      s4_sub: 'Who is accountable for this artefact?',
    s5_title: 'Tool Declaration',    s5_sub: 'Which AI system was used? Provide name, version, and month of use.',
    n_lbl: 'No AI',           n_dsc: 'No AI involvement in the artefact',
    a_lbl: 'Assistive',       a_dsc: 'Language polishing, spell-check, translation',
    s_lbl: 'Supportive',      s_dsc: 'Brainstorming, structuring, research support',
    g_lbl: 'Generative',      g_dsc: 'Substantial text, code, or data generation by AI',
    hl_lbl: 'Local',          hl_dsc: 'Locally executed, no data transfer (e.g. Ollama)',
    hi_lbl: 'Institutional',  hi_dsc: 'University or authority instance with internal DPA',
    hc_lbl: 'Cloud w/ DPA',   hc_dsc: 'Commercial cloud service with data processing agreement',
    hcx_lbl: 'Cloud w/o DPA', hcx_dsc: 'No DPA – unlawful in many contexts',
    rh_lbl: 'Human reviewed',  rh_dsc: 'Human review of AI output',
    rm_lbl: 'Machine reviewed', rm_dsc: 'Automated review (linter, fact-checker)',
    rhm_lbl: 'Both',           rhm_dsc: 'Human and machine reviewed',
    rn_lbl: 'None',            rn_dsc: 'No review – AI output adopted unchanged',
    ai_lbl: 'Individual',      ai_dsc: 'Named individual (e.g. author with ORCID)',
    ao_lbl: 'Organizational',  ao_dsc: 'Organization takes responsibility',
    an_lbl: 'None claimed',    an_dsc: 'Purely agentic context – no human stands behind this',
    tool_ph: 'e.g. Claude Opus 4.6', tool_aria: 'AI tool name',
    btn_add_tool: '+ add tool', remove_tool_aria: 'Remove tool',
    warn_txt: '⚠ This combination contains critical markers. In many institutional contexts this configuration may be problematic or unlawful.',
    warn_when_title: 'When does the generator warn?',
    warn_when_body: '<ul><li><strong>H:C!</strong> – Cloud use without data processing agreement (DPA). Unlawful in many institutional contexts under data protection law.</li><li><strong>G + R:N</strong> – Generative AI output adopted without any review. Elevated risk of errors and hallucinations.</li><li><strong>G + Acc:N</strong> – No accountability declared for generative AI content.</li><li><strong>G + R:N + Acc:N</strong> – Maximum warning level: fully AI-generated, unreviewed, no accountability declared.</li></ul>',
    result_label: 'Your AI-DTL Label',
    result_ph: 'Please complete all fields …',
    btn_text: 'Copy text', btn_meta: 'HTML &lt;meta&gt;', btn_md: 'Markdown',
    btn_latex: 'LaTeX', btn_link: 'Copy link', btn_jsonld: 'JSON-LD',
    btn_badge: 'Badge ↓ SVG', btn_png: 'Badge ↓ PNG',
    no_ai_hint: 'For N, Host, Review and Tool are omitted. Please select Accountability.',
    month_ph: 'Month', year_ph: 'Year',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    exp: {
      N: 'No AI involvement', A: 'Assistive use', S: 'Supportive use', G: 'Generative use',
      'H:L': 'locally hosted', 'H:I': 'institutionally hosted', 'H:C': 'cloud with DPA', 'H:C!': '⚠ cloud without DPA',
      'R:H': 'human reviewed', 'R:M': 'machine reviewed', 'R:HM': 'human & machine', 'R:N': '⚠ not reviewed',
      'Acc:I': 'individual accountable', 'Acc:O': 'organization accountable', 'Acc:N': '⚠ no accountability',
    },
  },
};

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
  const t = T[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.dataset.i18n;
    if (t[k] != null) el.innerHTML = t[k];
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const k = el.dataset.i18nPh;
    if (t[k]) el.placeholder = t[k];
  });
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
        const toDeselect = val === 'N' ? ['A','S','G'] : ['N'];
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

  const stamm = effectiveStamm();
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

  updateStepStates();
  render();
}

function updateStepStates() {
  const stamm = effectiveStamm();
  const isN = stamm === 'N';
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

// ── Label construction
function buildLabel() {
  const stamm = effectiveStamm();
  const { review, acc } = S;
  if (!stamm || !acc) return null;
  if (stamm === 'N') return `AI-DTL 0.4: N/${acc}`;
  const host = effectiveHost();
  if (!host || !review) return null;
  const toolParts = S.tools
    .filter(t => t.name.trim())
    .map(t => t.name.trim() + (t.month && t.year ? `, ${t.month}/${t.year}` : ''));
  const tool = toolParts.length ? ` (${toolParts.join('; ')})` : '';
  return `AI-DTL 0.4: ${stamm}/${host};${review};${acc}${tool}`;
}

function buildLabelURL() {
  const stamm = effectiveStamm();
  const { review, acc } = S;
  if (!stamm || !acc) return null;
  const base = window.location.origin + window.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');
  const params = new URLSearchParams();
  params.set('s', stamm);
  if (stamm !== 'N') {
    const host = effectiveHost();
    if (host) params.set('h', host);
    if (review) params.set('r', review);
  }
  params.set('a', acc);
  const valid = S.tools.filter(t => t.name.trim());
  if (valid.length === 1) {
    params.set('t', valid[0].name.trim());
    if (valid[0].month && valid[0].year) params.set('d', `${valid[0].month}/${valid[0].year}`);
  } else if (valid.length > 1) {
    params.set('t', valid.map(t => t.name.trim()).join('|'));
    params.set('d', valid.map(t => t.month && t.year ? `${t.month}/${t.year}` : '').join('|'));
  }
  return `${base}/label/?${params.toString()}`;
}

// ── Render output
function render() {
  const label  = buildLabel();
  const stamm  = effectiveStamm();
  const host   = effectiveHost();
  const badgeC   = document.getElementById('badge-container');
  const labelOut = document.getElementById('label-out');
  const exp      = document.getElementById('explain-out');

  if (label) {
    badgeC.innerHTML = buildBadgeSVG({ stamm, host, review: S.review, acc: S.acc }, label);
    const url = buildLabelURL();
    labelOut.style.display = 'flex';
    labelOut.innerHTML = url
      ? `<a href="${url}" style="color:inherit;text-decoration:none;border-bottom:1px dashed var(--g400);" target="_blank">${label}</a>`
      : label;
    const e = T[lang].exp;
    const parts = [e[stamm]];
    if (stamm !== 'N') {
      if (host) parts.push(e[host]);
      if (S.review) parts.push(e[S.review]);
    }
    if (S.acc) parts.push(e[S.acc]);
    exp.textContent = parts.join(' · ');
  } else {
    badgeC.innerHTML = `<span class="ph">${T[lang].result_ph}</span>`;
    labelOut.style.display = 'none';
    labelOut.textContent = '';
    exp.textContent = '';
  }

  const warn = host === 'H:C!' || S.review === 'R:N' || S.acc === 'Acc:N';
  document.getElementById('warn-banner').classList.toggle('show', !!warn && !!label);
}

// ── Copy to clipboard
function copyAs(type) {
  const label = buildLabel();
  if (!label) {
    alert(lang === 'de' ? 'Bitte zuerst alle Felder ausfüllen.' : 'Please complete all fields first.');
    return;
  }
  const url = buildLabelURL();
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'AI-DTL',
      value: label,
    }
  }, null, 2);

  const map = {
    plain:  url ? `${label}\n${url}` : label,
    meta:   `<meta name="ai-dtl" content="${label}">\n<!-- ${url || ''} -->`,
    md:     url ? `> [${label}](${url})` : `> ${label}`,
    latex:  url ? `\\href{${url}}{\\texttt{${label}}}` : `\\texttt{${label}}`,
    link:   url || label,
    jsonld,
  };
  const text = map[type];
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
  if (kind === 'month') return T[lang].months.map((m, i) => ({ v: String(i + 1).padStart(2, '0'), l: m }));
  const y = new Date().getFullYear();
  return Array.from({ length: 8 }, (_, i) => String(y + 1 - i)).map(v => ({ v, l: v }));
}

function closeAllDD() {
  document.querySelectorAll('.dd-list.open').forEach(l => l.classList.remove('open'));
}

function initDD(btnEl, listEl, kind, toolIdx) {
  const ph = () => T[lang][kind === 'month' ? 'month_ph' : 'year_ph'];
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
    let html = `<div class="dd-item dd-clear" data-v="">${ph()} –</div>`;
    html += ddItems(kind).map(it =>
      `<div class="dd-item${it.v === S.tools[toolIdx][kind] ? ' selected' : ''}" data-v="${it.v}">${it.l}</div>`
    ).join('');
    listEl.innerHTML = html;
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
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderToolRows() {
  const container = document.getElementById('tools-container');
  if (!container) return;
  const t = T[lang];
  container.innerHTML = '';
  S.tools.forEach((tool, idx) => {
    const row = document.createElement('div');
    row.className = 'tool-row';
    row.innerHTML = `
      <div class="ac-wrap">
        <input type="text" class="tool-input" autocomplete="off"
               placeholder="${escHtml(t.tool_ph)}" value="${escHtml(tool.name)}"
               aria-label="${escHtml(t.tool_aria)}"/>
        <div class="ac-list"></div>
      </div>
      <div class="dd-wrap" data-dd="month">
        <button type="button" class="dd-btn placeholder" aria-label="${escHtml(t.month_ph)}"></button>
        <div class="dd-list"></div>
      </div>
      <div class="dd-wrap" data-dd="year">
        <button type="button" class="dd-btn placeholder" aria-label="${escHtml(t.year_ph)}"></button>
        <div class="dd-list"></div>
      </div>
      <button type="button" class="remove-tool-btn"
              style="visibility:${S.tools.length > 1 ? 'visible' : 'hidden'}"
              aria-label="${escHtml(t.remove_tool_aria)}">×</button>
    `;
    container.appendChild(row);
    initAC(row.querySelector('.tool-input'), row.querySelector('.ac-list'), idx);
    initDD(row.querySelector('[data-dd="month"] .dd-btn'), row.querySelector('[data-dd="month"] .dd-list'), 'month', idx);
    initDD(row.querySelector('[data-dd="year"] .dd-btn'),  row.querySelector('[data-dd="year"] .dd-list'),  'year',  idx);
    row.querySelector('.remove-tool-btn').addEventListener('click', () => removeTool(idx));
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
    let html = '';
    flat = [];
    AI_TOOLS.forEach(g => {
      const hits = g.items.filter(item => item.toLowerCase().includes(qq));
      if (!hits.length) return;
      html += `<div class="ac-group">${g.group}</div>`;
      hits.forEach(item => {
        const i2 = flat.length; flat.push(item);
        const i = item.toLowerCase().indexOf(qq);
        html += `<div class="ac-item" data-i="${i2}">${item.slice(0, i)}<b>${item.slice(i, i + qq.length)}</b>${item.slice(i + qq.length)}</div>`;
      });
    });
    listEl.innerHTML = html;
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
