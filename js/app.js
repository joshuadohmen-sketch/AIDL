// ── State
const S = { stamm: null, host: null, review: null, acc: null };
let lang = 'de';

// ── Translations
const T = {
  de: {
    hero_desc: 'Generieren Sie ein valides AI Disclosure Label für Ihr Artefakt.',
    step: 'Schritt 1', step2: 'Schritt 2', step3: 'Schritt 3', step4: 'Schritt 4', step5: 'Schritt 5',
    s1_title: 'Ausmaß der KI-Nutzung',       s1_sub: 'Wie stark war KI an der Entstehung des Artefakts beteiligt?',
    s2_title: 'Hosting-Kontext',              s2_sub: 'Wo lief das KI-System? Relevant für Datenschutz und DFG-Konformität.',
    s3_title: 'Prüfung der KI-Ausgaben',      s3_sub: 'Wurden die KI-Ausgaben geprüft, bevor sie übernommen wurden?',
    s4_title: 'Accountability — Verantwortung', s4_sub: 'Wer steht für das Artefakt ein?',
    s5_title: 'Tool-Angabe',                  s5_sub: 'Welches KI-System wurde verwendet? Name, Version und Monat der Nutzung.',
    n_lbl: 'No AI',           n_dsc: 'Keine KI-Beteiligung am Artefakt',
    a_lbl: 'Assistive',       a_dsc: 'Sprachpolitur, Rechtschreibkorrektur, Übersetzung',
    s_lbl: 'Supportive',      s_dsc: 'Brainstorming, Gliederung, Recherche-Hilfe',
    g_lbl: 'Generative',      g_dsc: 'Substantielle Text-, Code- oder Datengenerierung',
    hl_lbl: 'Local',          hl_dsc: 'Lokal ausgeführt, keine Datenübertragung (z.B. Ollama)',
    hi_lbl: 'Institutional',  hi_dsc: 'Hochschul- oder Behördeninstanz mit interner AVV',
    hc_lbl: 'Cloud w/ DPA',   hc_dsc: 'Kommerzieller Cloud-Dienst mit Auftragsverarbeitungsvertrag',
    hcx_lbl: 'Cloud w/o DPA', hcx_dsc: 'Ohne AVV — in vielen Kontexten unzulässig',
    rh_lbl: 'Human reviewed',  rh_dsc: 'Menschliche Prüfung der KI-Ausgaben',
    rm_lbl: 'Machine reviewed', rm_dsc: 'Automatisierte Prüfung (Linter, Faktenchecker)',
    rhm_lbl: 'Both',           rhm_dsc: 'Mensch und Maschine haben geprüft',
    rn_lbl: 'None',            rn_dsc: 'Keine Prüfung — Ausgabe unverändert übernommen',
    ai_lbl: 'Individual',      ai_dsc: 'Benennbare Einzelperson (z.B. Autor:in mit ORCID)',
    ao_lbl: 'Organizational',  ao_dsc: 'Organisation übernimmt Verantwortung',
    an_lbl: 'None claimed',    an_dsc: 'Rein agentischer Raum — kein Mensch steht ein',
    tool_ph: 'z.B. Claude Opus 4.6',
    warn_txt: '⚠ Die gewählte Kombination enthält kritische Merkmale (H:C!, R:N und/oder Acc:N). In vielen institutionellen Kontexten ist diese Konfiguration problematisch oder unzulässig. AIDL macht diesen Zustand bewusst sichtbar.',
    result_label: 'Ihr AIDL-Label',
    result_ph: 'Bitte alle Felder ausfüllen …',
    btn_text: 'Text kopieren', btn_meta: 'HTML <meta>', btn_md: 'Markdown', btn_latex: 'LaTeX',
    no_ai_hint: 'Bei N entfallen Host, Review und Tool. Bitte Accountability auswählen.',
    exp: {
      N: 'Keine KI-Beteiligung', A: 'Assistive Nutzung', S: 'Supportive Nutzung', G: 'Generative Nutzung',
      'H:L': 'lokal gehostet', 'H:I': 'institutionell gehostet', 'H:C': 'Cloud mit AVV', 'H:C!': '⚠ Cloud ohne AVV',
      'R:H': 'menschlich geprüft', 'R:M': 'maschinell geprüft', 'R:HM': 'Mensch & Maschine', 'R:N': '⚠ nicht geprüft',
      'Acc:I': 'Einzelperson verantwortlich', 'Acc:O': 'Organisation verantwortlich', 'Acc:N': '⚠ keine Accountability',
    },
  },
  en: {
    hero_desc: 'Generate a valid AI Disclosure Label for your artefact.',
    step: 'Step 1', step2: 'Step 2', step3: 'Step 3', step4: 'Step 4', step5: 'Step 5',
    s1_title: 'Extent of AI Use',    s1_sub: 'How deeply was AI involved in creating this artefact?',
    s2_title: 'Hosting Context',     s2_sub: 'Where did the AI run? Relevant for data protection and DFG compliance.',
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
    hcx_lbl: 'Cloud w/o DPA', hcx_dsc: 'No DPA — unlawful in many contexts',
    rh_lbl: 'Human reviewed',  rh_dsc: 'Human review of AI output',
    rm_lbl: 'Machine reviewed', rm_dsc: 'Automated review (linter, fact-checker)',
    rhm_lbl: 'Both',           rhm_dsc: 'Human and machine reviewed',
    rn_lbl: 'None',            rn_dsc: 'No review — AI output adopted unchanged',
    ai_lbl: 'Individual',      ai_dsc: 'Named individual (e.g. author with ORCID)',
    ao_lbl: 'Organizational',  ao_dsc: 'Organization takes responsibility',
    an_lbl: 'None claimed',    an_dsc: 'Purely agentic context — no human stands behind this',
    tool_ph: 'e.g. Claude Opus 4.6',
    warn_txt: '⚠ This combination contains critical markers (H:C!, R:N and/or Acc:N). In many institutional contexts this configuration may be problematic or unlawful. AIDL makes this state explicitly visible.',
    result_label: 'Your AIDL Label',
    result_ph: 'Please complete all fields …',
    btn_text: 'Copy text', btn_meta: 'HTML <meta>', btn_md: 'Markdown', btn_latex: 'LaTeX',
    no_ai_hint: 'For N, Host, Review and Tool are omitted. Please select Accountability.',
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

// ── Option selection
function pick(el) {
  const dim = el.dataset.dim, val = el.dataset.val;
  document.querySelectorAll(`.opt[data-dim="${dim}"]`).forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  S[dim] = val;
  const isN = S.stamm === 'N';
  document.getElementById('card-host').classList.toggle('hide', isN);
  document.getElementById('card-review').classList.toggle('hide', isN);
  document.getElementById('card-tool').classList.toggle('hide', isN);
  document.getElementById('no-ai-hint').classList.toggle('show', isN);
  if (isN) { S.host = null; S.review = null; }
  render();
}

// ── Label construction
function fmtDate(v) {
  if (!v) return '';
  const [y, m] = v.split('-');
  return `${m}/${y}`;
}

function buildLabel() {
  const { stamm, host, review, acc } = S;
  if (!stamm || !acc) return null;
  if (stamm === 'N') return `AIDL 0.3: N;${acc}`;
  if (!host || !review) return null;
  const name = document.getElementById('tool-name').value.trim();
  const date = document.getElementById('tool-date').value;
  const tool = name ? ` (${name}${date ? ', ' + fmtDate(date) : ''})` : '';
  return `AIDL 0.3: ${stamm}/${host};${review};${acc}${tool}`;
}

// ── Render output
function render() {
  const label = buildLabel();
  const out = document.getElementById('label-out');
  const exp = document.getElementById('explain-out');
  if (label) {
    out.textContent = label;
    const e = T[lang].exp, { stamm, host, review, acc } = S;
    const parts = [e[stamm]];
    if (stamm !== 'N') {
      if (host) parts.push(e[host]);
      if (review) parts.push(e[review]);
    }
    if (acc) parts.push(e[acc]);
    exp.textContent = parts.join(' · ');
  } else {
    out.innerHTML = `<span class="ph">${T[lang].result_ph}</span>`;
    exp.textContent = '';
  }
  const warn = S.host === 'H:C!' || S.review === 'R:N' || S.acc === 'Acc:N';
  document.getElementById('warn-banner').classList.toggle('show', !!warn && !!label);
}

// ── Copy to clipboard
function copyAs(type) {
  const label = buildLabel();
  if (!label) {
    alert(lang === 'de' ? 'Bitte zuerst alle Felder ausfüllen.' : 'Please complete all fields first.');
    return;
  }
  const map = {
    plain: label,
    meta:  `<meta name="aidl" content="${label}">`,
    md:    `> ${label}`,
    latex: `\\texttt{${label}}`,
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
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); cb(); } catch (e) { alert(text); }
  document.body.removeChild(ta);
}

// ── Init
applyT();
