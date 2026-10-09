// ── AI-DTL core logic: pure functions, no DOM.
// Shared by the editor, the explanation page and the Node tests (tests/*.test.js).
// State shapes:
//   input       – what the editor holds: { stamm: [codes], host: [codes], review, acc,
//                 tools: [{ name, month, year }], p, rp }
//   normalized  – one value per dimension: { v, stamm, host, review, acc,
//                 tools: [{ name, date: 'MM/YYYY' | '' }], p, rp }

const LabelCore = (function () {
'use strict';

const LC = (typeof module !== 'undefined') ? require('./spec.js') : { SPEC, SITE_BASE };

function getSpec(v) {
  if (v && typeof v === 'object') return v;
  const spec = LC.SPEC[v];
  if (!spec) throw new Error('Unknown AI-DTL version: ' + v);
  return spec;
}

function isCode(spec, dim, code) {
  return typeof code === 'string' && Object.prototype.hasOwnProperty.call(spec.codes[dim], code);
}

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

// ── Cumulation (strongest stamm) and multi-host rule (least protected host)
function effectiveStamm(list, v) {
  const spec = getSpec(v);
  const codes = (Array.isArray(list) ? list : [list]).filter(c => isCode(spec, 'stamm', c));
  if (!codes.length) return null;
  return codes.reduce((b, c) => (spec.codes.stamm[c] > spec.codes.stamm[b] ? c : b));
}

function effectiveHost(list, v) {
  const spec = getSpec(v);
  const codes = (Array.isArray(list) ? list : [list]).filter(c => isCode(spec, 'host', c));
  if (!codes.length) return null;
  return codes.reduce((b, c) => (spec.codes.host[c] < spec.codes.host[b] ? c : b));
}

// ── Free text and tool names
// Purpose / responsible: no < >, no control characters, no trailing full stop, length limit.
function cleanFreeText(s, max = 120) {
  const t = String(s == null ? '' : s)
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
  return t.replace(/[\s.]+$/, '');
}

const TOOL_FORBIDDEN = /[;(),|]/;
const TOOL_INVISIBLE = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;
// Grammar (Annex F): visible characters except ( ) , ; | – inner single spaces allowed, 1–80 chars.
const TOOL_CHAR = String.raw`[^\u0000-\u0020(),;|\u007f-\u00a0]`;
const TOOL_NAME_RE = new RegExp(`^${TOOL_CHAR}(?:[^\\u0000-\\u001f(),;|\\u007f-\\u00a0]{0,78}${TOOL_CHAR})?$`, 'u');

function isValidToolName(name) {
  return typeof name === 'string' && TOOL_NAME_RE.test(name) && !TOOL_INVISIBLE.test(name);
}

// Removes characters a tool name may not contain (used while typing).
function stripToolChars(s) {
  return String(s).replace(/[;(),|]/g, '').replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, '');
}

const DATE_RE = /^(0[1-9]|1[0-2])\/(20\d{2})$/;

function toolDate(t) {
  if (t.date != null && t.date !== '') return String(t.date);
  return t.month && t.year ? `${t.month}/${t.year}` : '';
}

// ── Normalize editor input to one value per dimension
function normalize(input, v) {
  const spec = getSpec(v);
  const stamm = effectiveStamm(input.stamm, spec);
  const max = spec.rules.freeTextMax;
  const out = {
    v: spec.version, stamm, host: null, review: null,
    acc: isCode(spec, 'acc', input.acc) ? input.acc : null,
    tools: [], p: '', rp: '',
  };
  if (stamm && stamm !== 'N') {
    out.host = effectiveHost(input.host, spec);
    out.review = isCode(spec, 'review', input.review) ? input.review : null;
    // A generic service inserted as "Name/" without a model ends up as "Name"
    out.tools = (input.tools || [])
      .map(t => ({ name: String(t.name || '').trim().replace(/\s*\/+$/, ''), date: toolDate(t) }))
      .filter(t => t.name);
    if (max) out.p = cleanFreeText(input.p, max);
  }
  if (max && out.acc !== 'Acc:N') out.rp = cleanFreeText(input.rp, max);
  return out;
}

// ── Validation: list of missing or invalid fields, in step order
const MISSING_ORDER = ['stamm', 'tool', 'date', 'host', 'review', 'acc'];

function validate(input, v) {
  const spec = getSpec(v);
  const n = normalize(input, spec);
  const missing = new Set();
  if (!n.stamm) missing.add('stamm');
  if (n.stamm !== 'N') {
    const named = (input.tools || []).filter(t => String(t.name || '').trim());
    if (spec.rules.toolRequired) {
      if (!named.length || named.some(t => !isValidToolName(String(t.name).trim()))) missing.add('tool');
    }
    if (spec.rules.dateRequired) {
      if (!named.length || named.some(t => !DATE_RE.test(toolDate(t)))) missing.add('date');
    }
    if (!n.host) missing.add('host');
    if (!n.review) missing.add('review');
  }
  if (!n.acc || (n.stamm === 'N' && !spec.rules.noAiAcc.includes(n.acc))) missing.add('acc');
  return MISSING_ORDER.filter(k => missing.has(k));
}

// ── Code string
function buildCode(input, v) {
  const spec = getSpec(v);
  if (validate(input, spec).length) return null;
  const n = normalize(input, spec);
  const head = `AI-DTL ${spec.version}: `;
  if (n.stamm === 'N') return `${head}N/${n.acc}`;
  const tools = n.tools.map(t => t.name + (t.date ? `, ${t.date}` : ''));
  const toolPart = tools.length ? ` (${tools.join('; ')})` : '';
  return `${head}${n.stamm}/${n.host};${n.review};${n.acc}${toolPart}`;
}

// Parses "AI-DTL 0.5: …" or the commit-trailer form "AI-DTL: 0.5 …".
// opts.specs: version → spec (tests pass a spec without M); opts.displayable: accept old 0.4 links.
function parseCode(str, opts = {}) {
  const specs = opts.specs || LC.SPEC;
  if (typeof str !== 'string') return null;
  const m = /^AI-DTL (\d+\.\d+): (.+)$/.exec(str) || /^AI-DTL: (\d+\.\d+) (.+)$/.exec(str);
  if (!m || !specs[m[1]]) return null;
  const spec = specs[m[1]];
  const body = m[2];
  const base = { v: spec.version, stamm: null, host: null, review: null, acc: null, tools: [], p: '', rp: '' };

  const noai = /^N\/(Acc:[A-Z])$/.exec(body);
  if (noai) {
    const allowed = opts.displayable ? spec.rules.noAiAccLegacy : spec.rules.noAiAcc;
    return allowed.includes(noai[1]) ? { ...base, stamm: 'N', acc: noai[1] } : null;
  }

  const full = /^([A-Z])\/(H:(?:C!|[A-Z]))(;R:[A-Z]{1,2});(Acc:[A-Z])(?: \((.+)\))?$/.exec(body);
  if (!full) return null;
  const [, stamm, host, reviewRaw, acc, toolStr] = full;
  const review = reviewRaw.slice(1);
  if (stamm === 'N' || !isCode(spec, 'stamm', stamm) || !isCode(spec, 'host', host) ||
      !isCode(spec, 'review', review) || !isCode(spec, 'acc', acc)) return null;

  const tools = [];
  if (toolStr != null) {
    for (const part of toolStr.split('; ')) {
      const tm = /^(.+?)(?:, (\d{2}\/\d{4}))?$/.exec(part);
      if (!tm) return null;
      const [, name, date = ''] = tm;
      if (spec.rules.toolNameMax ? !isValidToolName(name) : TOOL_FORBIDDEN.test(name) || name !== name.trim()) return null;
      if (date && !DATE_RE.test(date)) return null;
      if (spec.rules.dateRequired && !date) return null;
      tools.push({ name, date });
    }
  }
  if (spec.rules.toolRequired && !tools.length) return null;
  return { ...base, stamm, host, review, acc, tools };
}

// ── URL parameters
function toParams(input, v) {
  const spec = getSpec(v);
  const n = normalize(input, spec);
  const p = new URLSearchParams();
  if (spec.version !== '0.4') p.set('v', spec.version);
  p.set('s', n.stamm);
  if (n.stamm !== 'N') { p.set('h', n.host); p.set('r', n.review); }
  p.set('a', n.acc);
  if (spec.version === '0.4') {
    if (n.tools.length === 1) {
      p.set('t', n.tools[0].name);
      if (n.tools[0].date) p.set('d', n.tools[0].date);
    } else if (n.tools.length > 1) {
      p.set('t', n.tools.map(t => t.name).join('|'));
      p.set('d', n.tools.map(t => t.date).join('|'));
    }
  } else {
    n.tools.forEach(t => { p.append('t', t.name); p.append('d', t.date); });
    if (n.p) p.set('p', n.p);
    if (n.rp) p.set('rp', n.rp);
  }
  return p;
}

function buildURL(input, v, base = LC.SITE_BASE) {
  return `${base}label/?${toParams(input, v).toString()}`;
}

// Reads link parameters. Without "v" a link is 0.4 (old links). Returns
// { v, state (normalized), legacyNAccN } or null – never echoes invalid codes.
function fromParams(params, opts = {}) {
  const specs = opts.specs || LC.SPEC;
  const v = params.get('v') == null ? '0.4' : params.get('v');
  const spec = specs[v];
  if (!spec) return null;
  const s = params.get('s'), a = params.get('a');
  if (!isCode(spec, 'stamm', s) || !isCode(spec, 'acc', a)) return null;
  const max = spec.rules.freeTextMax;
  const state = { v, stamm: s, host: null, review: null, acc: a, tools: [], p: '', rp: '' };

  if (s === 'N') {
    if (!spec.rules.noAiAccLegacy.includes(a)) return null;
  } else {
    const h = params.get('h'), r = params.get('r');
    if (!isCode(spec, 'host', h) || !isCode(spec, 'review', r)) return null;
    state.host = h; state.review = r;
    if (v === '0.4') {
      // Legacy: tools joined by "|"; names never rejected, only shortened for display
      const names = (params.get('t') || '').split('|');
      const dates = (params.get('d') || '').split('|');
      const maxLen = spec.rules.toolDisplayMax;
      state.tools = names
        .map((name, i) => {
          let nm = name.trim();
          if (nm.length > maxLen) nm = nm.slice(0, maxLen) + '…';
          const d = (dates[i] || '').trim();
          return { name: nm, date: /^(0[1-9]|1[0-2])\/\d{4}$/.test(d) ? d : '' };
        })
        .filter(t => t.name);
    } else {
      const names = params.getAll('t'), dates = params.getAll('d');
      if (!names.length || names.length !== dates.length) return null;
      for (let i = 0; i < names.length; i++) {
        if (!isValidToolName(names[i]) || !DATE_RE.test(dates[i])) return null;
        state.tools.push({ name: names[i], date: dates[i] });
      }
      if (max) state.p = cleanFreeText(params.get('p'), max);
    }
  }
  if (max && a !== 'Acc:N') state.rp = cleanFreeText(params.get('rp'), max);
  return { v, state, legacyNAccN: s === 'N' && a === 'Acc:N' };
}

// ── ORCID / ROR in the "responsible" text
const ID_RE = /(?:https?:\/\/orcid\.org\/)?\b(\d{4}-\d{4}-\d{4}-\d{3}[\dX])\b|(?:https?:\/\/ror\.org\/)?\b(0[a-z0-9]{6}\d{2})\b/gi;

// Splits text into plain parts and identifier links.
function idSegments(text) {
  const out = [];
  let last = 0;
  String(text).replace(ID_RE, (match, orcid, ror, offset) => {
    if (offset > last) out.push({ type: 'text', text: text.slice(last, offset) });
    out.push(orcid
      ? { type: 'orcid', text: match, url: `https://orcid.org/${orcid.toUpperCase()}` }
      : { type: 'ror', text: match, url: `https://ror.org/${ror.toLowerCase()}` });
    last = offset + match.length;
    return match;
  });
  if (last < String(text).length) out.push({ type: 'text', text: String(text).slice(last) });
  return out;
}

function stripIds(text) {
  return String(text).replace(ID_RE, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s*,\s*(,\s*)+/g, ', ')
    .replace(/[\s,;:]+$/, '')
    .replace(/^[\s,;:]+/, '')
    .replace(/\s{2,}/g, ' ');
}

// ── Plain-language sentence (E1). variant: 'text' | 'speech'
function buildSentence(state, lang, variant = 'text', v) {
  const spec = getSpec(v || state.v);
  const n = Array.isArray(state.stamm) ? normalize(state, spec) : state;
  const t = spec.i18n[lang];
  if (spec.version === '0.4') {
    const codes = n.stamm === 'N' ? [n.stamm, n.acc] : [n.stamm, n.host, n.review, n.acc];
    return codes.filter(Boolean).map(c => t.exp[c]).join(' · ');
  }
  const isN = n.stamm === 'N';
  const reviewSet = (n.stamm === 'A' || n.stamm === 'S') ? t.sentence.reviewAS : t.sentence.reviewMG;

  if (variant === 'speech') {
    const parts = [t.speech.prefix, t.speech.stamm[n.stamm]];
    if (!isN && n.review) parts.push(t.speech.review[n.review]);
    const rp = n.rp ? stripIds(n.rp) : '';
    parts.push(rp ? fill(t.sentence.resp, { rp }) : t.sentence.acc[n.acc]);
    return parts.join(' ');
  }

  const parts = [t.sentence.stamm[n.stamm]];
  if (!isN && n.p) parts.push(fill(t.sentence.purpose, { p: n.p }));
  if (!isN && n.review) parts.push(reviewSet[n.review]);
  parts.push(n.rp ? fill(t.sentence.resp, { rp: n.rp }) : t.sentence.acc[n.acc]);
  if (!isN && n.tools.length) {
    const list = n.tools.map(x => `${x.name} (${x.date})`).join('; ');
    parts.push(fill(n.tools.length > 1 ? t.sentence.tools : t.sentence.tool, { list }));
  }
  return parts.join(' ');
}

// ── Hints for the person creating the label
function warnings(state, v) {
  const spec = getSpec(v || state.v);
  const n = Array.isArray(state.stamm) ? normalize(state, spec) : state;
  return spec.warnings.filter(rule => rule.when(n)).map(rule => rule.id);
}

function warningRules(v) {
  return getSpec(v).warnings.map(({ id, trigger }) => ({ id, trigger }));
}

// ── Art. 50 box (E8): never certifies "no obligation"
function euIconSuggestion(state) {
  if (state.stamm === 'M') return 'partial';
  if (state.stamm === 'G' && (state.review === 'R:M' || state.review === 'R:N')) return 'full';
  return 'basic';
}

function art50Hint(state) {
  const visible = state.stamm === 'M' || state.stamm === 'G';
  const open = visible && (
    state.stamm === 'M' ||
    (state.stamm === 'G' && (state.review === 'R:M' || state.review === 'R:N')) ||
    state.acc === 'Acc:N');
  return { visible, open, icon: euIconSuggestion(state) };
}

// ── Decision helper "Not sure? A few questions" (A.1.4)
// answers: { q1, q1b, q2, q2b, q3 } with true/false; q3 ∈ 'M' | 'G' | 'both'
// Returns the suggested code, or null while a question is still open.
function helperResult(answers, enableM) {
  const a = answers || {};
  if (a.q1 == null) return null;
  if (a.q1 === false) return a.q1b == null ? null : (a.q1b ? 'S' : 'N');
  if (a.q2 == null) return null;
  if (a.q2 === true) return a.q2b == null ? null : (a.q2b ? 'S' : 'A');
  if (!enableM) return 'G';
  if (a.q3 == null) return null;
  return a.q3 === 'M' ? 'M' : 'G';
}

// Next open question id for the helper, or null when a result is available.
function helperNext(answers, enableM) {
  const a = answers || {};
  if (a.q1 == null) return 'q1';
  if (a.q1 === false) return a.q1b == null ? 'q1b' : null;
  if (a.q2 == null) return 'q2';
  if (a.q2 === true) return a.q2b == null ? 'q2b' : null;
  if (!enableM) return null;
  return a.q3 == null ? 'q3' : null;
}

// ── Host suggestion from chosen services (E4): union of the services' hosts
function suggestedHosts(serviceEntries) {
  const hosts = [];
  (serviceEntries || []).forEach(e => { if (e && e.host && !hosts.includes(e.host)) hosts.push(e.host); });
  return hosts;
}

// ── Escaping
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const escAttr = escHtml;

function escMd(s) {
  return String(s).replace(/[\\[\]()*_`]/g, '\\$&');
}

const LATEX_TEXT = {
  '\\': '\\textbackslash{}', '{': '\\{', '}': '\\}', '$': '\\$', '&': '\\&', '#': '\\#',
  '^': '\\textasciicircum{}', '_': '\\_', '%': '\\%', '~': '\\textasciitilde{}',
  '"': '\\textquotedbl{}',
};
// opts.quotes: also escape " (needed with babel-ngerman, where " is a shorthand)
function escLatexText(s, opts = {}) {
  const re = opts.quotes ? /[\\{}$&#^_%~"]/g : /[\\{}$&#^_%~]/g;
  return String(s).replace(re, c => LATEX_TEXT[c]);
}

function escLatexUrl(s) {
  // A raw backslash never belongs in a URL, and _ breaks inside \footnote{}: percent-encode
  // both (same URL after decoding), then escape what hyperref expects escaped.
  return String(s).replace(/\\/g, '%5C').replace(/_/g, '%5F').replace(/[%#&~]/g, c => '\\' + c);
}

// Backtick fence one longer than the longest backtick run in the text (CommonMark code span).
function mdCodeSpan(s) {
  const runs = String(s).match(/`+/g) || [];
  const fence = '`'.repeat(Math.max(0, ...runs.map(r => r.length)) + 1);
  const pad = /^`|`$/.test(s) ? ' ' : '';
  return `${fence}${pad}${s}${pad}${fence}`;
}

// ── Exports
const EXPORT_COMMENTS = {
  de: { html: 'AI-DTL {v} – sichtbarer Baustein', head: 'in den <head> der Seite:', latex: 'benötigt' },
  en: { html: 'AI-DTL {v} – visible snippet', head: 'in the <head> of the page:', latex: 'requires' },
};

// Sentence with ORCID/ROR linked inside the "Accountable: {rp}." part only,
// rendered by a per-format escape and link function.
function linkedSentence(sentence, rp, respTemplate, escText, link) {
  if (!rp) return escText(sentence);
  const phrase = fill(respTemplate, { rp });
  const at = sentence.indexOf(phrase);
  if (at < 0) return escText(sentence);
  const rpAt = at + respTemplate.indexOf('{rp}');
  const rpOut = idSegments(rp).map(seg => (seg.type === 'text' ? escText(seg.text) : link(seg))).join('');
  return escText(sentence.slice(0, rpAt)) + rpOut + escText(sentence.slice(rpAt + rp.length));
}

// fmt: 0.5 – text | html | md | latex | link | speech; 0.4 – plain | meta | md | latex | link
function buildExport(fmt, input, opts = {}) {
  const spec = getSpec(opts.v || input.v);
  const lang = opts.lang || 'de';
  const code = buildCode(input, spec);
  if (!code) return null;
  const url = opts.url || buildURL(input, spec, opts.base);
  // "--" may not appear inside an HTML comment; %2D decodes to the same URL.
  const commentUrl = url.replace(/--/g, '-%2D');
  const c = EXPORT_COMMENTS[lang];

  if (spec.version === '0.4') {
    switch (fmt) {
      case 'plain': return `${code}\n${url}`;
      case 'meta':  return `<meta name="ai-dtl" content="${escAttr(code)}">\n<!-- ${commentUrl} -->`;
      case 'md':    return `> [${escMd(code)}](${url})`;
      case 'latex': return `% benötigt \\usepackage{hyperref}\n\\href{${escLatexUrl(url)}}{\\texttt{${escLatexText(code)}}}`;
      case 'link':  return url;
      default: return null;
    }
  }

  const n = normalize(input, spec);
  const sentence = buildSentence(n, lang, 'text', spec);
  const resp = spec.i18n[lang].sentence.resp;
  switch (fmt) {
    case 'text':
      return `${sentence}\n${code}\n${url}`;
    case 'html': {
      const s = linkedSentence(sentence, n.rp, resp, escHtml, seg => `<a href="${escAttr(seg.url)}">${escHtml(seg.text)}</a>`);
      return `<!-- ${fill(c.html, { v: spec.version })} -->\n` +
        `<p class="ai-dtl" lang="${lang}">${s}<br>\n` +
        `  <a href="${escAttr(url)}"><code>${escHtml(code)}</code></a></p>\n` +
        `<!-- ${c.head} -->\n` +
        `<meta name="ai-dtl" content="${escAttr(code)}">`;
    }
    case 'md': {
      const s = linkedSentence(sentence, n.rp, resp, escMd, seg => `[${escMd(seg.text)}](${seg.url})`);
      return `> ${s}\n> [${mdCodeSpan(code)}](${url})`;
    }
    case 'latex': {
      const esc = x => escLatexText(x, { quotes: true });
      const s = linkedSentence(sentence, n.rp, resp, esc, seg => `\\href{${escLatexUrl(seg.url)}}{${esc(seg.text)}}`);
      return `% ${c.latex} \\usepackage{hyperref}\n${s} \\href{${escLatexUrl(url)}}{\\texttt{${esc(code)}}}`;
    }
    case 'link':
      return url;
    case 'speech':
      return buildSentence(n, lang, 'speech', spec);
    default:
      return null;
  }
}

return {
  getSpec, isCode, fill, effectiveStamm, effectiveHost, cleanFreeText, isValidToolName, stripToolChars,
  TOOL_FORBIDDEN, DATE_RE, normalize, validate, buildCode, parseCode, toParams, buildURL, fromParams,
  idSegments, stripIds, buildSentence, warnings, warningRules, euIconSuggestion, art50Hint,
  helperResult, helperNext, suggestedHosts, escHtml, escAttr, escMd, escLatexText, escLatexUrl,
  mdCodeSpan, buildExport,
};
})();

if (typeof module !== 'undefined') module.exports = LabelCore;
