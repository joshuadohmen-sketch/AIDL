// Rules: cumulation, multi-host, validation, hints, Art. 50, decision helper, free text
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/label-core.js');
const { buildSpec05 } = require('../js/spec.js');

const G = (over = {}) => ({ stamm: ['G'], host: ['H:C'], review: 'R:H', acc: 'Acc:I',
  tools: [{ name: 'GPT-5', month: '05', year: '2026' }], ...over });

test('cumulation: strongest stamm counts', () => {
  assert.equal(core.effectiveStamm(['A', 'S'], '0.5'), 'S');
  assert.equal(core.effectiveStamm(['A', 'M', 'S'], '0.5'), 'M');
  assert.equal(core.effectiveStamm(['M', 'G'], '0.5'), 'G');
  assert.equal(core.effectiveStamm(['A', 'G'], '0.4'), 'G');
  assert.equal(core.effectiveStamm(['M'], '0.4'), null);
  assert.equal(core.effectiveStamm([], '0.5'), null);
});

test('multi-host: least protected counts', () => {
  assert.equal(core.effectiveHost(['H:L', 'H:I'], '0.5'), 'H:I');
  assert.equal(core.effectiveHost(['H:I', 'H:C'], '0.5'), 'H:C');
  assert.equal(core.effectiveHost(['H:C', 'H:C!', 'H:L'], '0.5'), 'H:C!');
});

test('validation lists what is missing, in step order', () => {
  assert.deepEqual(core.validate({ stamm: [], host: [], tools: [] }, '0.5'),
    ['stamm', 'tool', 'date', 'host', 'review', 'acc']);
  assert.deepEqual(core.validate(G({ tools: [] }), '0.5'), ['tool', 'date']);
  assert.deepEqual(core.validate(G({ stamm: [] }), '0.5'), ['stamm']);
  assert.deepEqual(core.validate(G({ tools: [{ name: 'GPT-5', month: '05', year: '' }] }), '0.5'), ['date']);
  assert.deepEqual(core.validate(G({ tools: [{ name: 'GPT (5)', month: '05', year: '2026' }] }), '0.5'), ['tool']);
  assert.deepEqual(core.validate({ stamm: ['N'], acc: 'Acc:N' }, '0.5'), ['acc']);
  assert.deepEqual(core.validate({ stamm: ['N'], acc: 'Acc:O' }, '0.5'), []);
  assert.deepEqual(core.validate(G(), '0.5'), []);
  // 0.4: tool and date optional
  assert.deepEqual(core.validate(G({ tools: [] }), '0.4'), []);
  assert.equal(core.buildCode(G({ tools: [] }), '0.5'), null);
});

test('N drops host, review, tools and purpose', () => {
  const n = core.normalize({ stamm: ['N'], host: ['H:C'], review: 'R:H', acc: 'Acc:I',
    tools: [{ name: 'GPT-5', month: '05', year: '2026' }], p: 'x', rp: 'Dr. A' }, '0.5');
  assert.deepEqual(n, { v: '0.5', stamm: 'N', host: null, review: null, acc: 'Acc:I', tools: [], p: '', rp: 'Dr. A' });
});

test('hints (A.7)', () => {
  assert.deepEqual(core.warnings(G({ host: ['H:L', 'H:C!'] }), '0.5'), ['hcx']);
  assert.deepEqual(core.warnings(G({ review: 'R:N' }), '0.5'), ['mg_rn']);
  assert.deepEqual(core.warnings(G({ stamm: ['M'], review: 'R:M' }), '0.5'), ['mg_rm']);
  assert.deepEqual(core.warnings(G({ stamm: ['S'], review: 'R:N' }), '0.5'), []);
  assert.deepEqual(core.warnings(G({ stamm: ['A'], acc: 'Acc:N' }), '0.5'), ['accn']);
  // 0.4.1 rules
  assert.deepEqual(core.warnings(G({ stamm: ['S'], review: 'R:N', acc: 'Acc:N' }), '0.4'), []);
  assert.deepEqual(core.warnings(G({ review: 'R:N', acc: 'Acc:N' }), '0.4'), ['g_rn', 'g_accn']);
  assert.deepEqual(core.warningRules('0.5').map(r => r.id), ['hcx', 'mg_rn', 'mg_rm', 'accn']);
});

test('Art. 50 box (A.8)', () => {
  const n = s => core.normalize(s, '0.5');
  assert.deepEqual(core.art50Hint(n(G({ stamm: ['S'] }))), { visible: false, open: false, icon: 'basic' });
  assert.deepEqual(core.art50Hint(n(G())), { visible: true, open: false, icon: 'basic' });
  assert.deepEqual(core.art50Hint(n(G({ review: 'R:M' }))), { visible: true, open: true, icon: 'full' });
  assert.deepEqual(core.art50Hint(n(G({ stamm: ['M'] }))), { visible: true, open: true, icon: 'partial' });
  assert.deepEqual(core.art50Hint(n(G({ acc: 'Acc:N' }))), { visible: true, open: true, icon: 'basic' });
  assert.equal(core.art50Hint(n({ stamm: ['N'], acc: 'Acc:I' })).visible, false);
});

test('decision helper: q1 separates the groups, then one question per group', () => {
  // AI content in the work
  assert.equal(core.helperResult({ q1: true, q2: true }, true), 'G');
  assert.equal(core.helperResult({ q1: true, q2: false }, true), 'M');
  // without M: q1 yes is G at once
  assert.equal(core.helperResult({ q1: true }, false), 'G');
  assert.equal(core.helperNext({ q1: true }, false), null);
  // no AI content in the work
  assert.equal(core.helperResult({ q1: false, q3: true }, true), 'S');
  assert.equal(core.helperResult({ q1: false, q3: false, q4: true }, true), 'A');
  assert.equal(core.helperResult({ q1: false, q3: false, q4: false }, true), 'N');
  // open questions
  assert.equal(core.helperResult({}, true), null);
  assert.equal(core.helperResult({ q1: true }, true), null);
  assert.equal(core.helperResult({ q1: false, q3: false }, true), null);
});

test('decision helper asks q1 → q2 or q1 → q3 → q4', () => {
  assert.equal(core.helperNext({}, true), 'q1');
  assert.equal(core.helperNext({ q1: true }, true), 'q2');
  assert.equal(core.helperNext({ q1: true, q2: false }, true), null);
  assert.equal(core.helperNext({ q1: false }, true), 'q3');
  assert.equal(core.helperNext({ q1: false, q3: true }, true), null);
  assert.equal(core.helperNext({ q1: false, q3: false }, true), 'q4');
  assert.equal(core.helperNext({ q1: false, q3: false, q4: true }, true), null);
});

test('study cases V13 and V19 (acceptance)', () => {
  // V13: own paragraphs translated with DeepL, outline discussed with ChatGPT → S
  assert.equal(core.helperResult({ q1: false, q3: true }, true), 'S');
  // V19: group photo, person removed, sky replaced → M, and the Art. 50 box opens
  assert.equal(core.helperResult({ q1: true, q2: false }, true), 'M');
  const n = core.normalize({ stamm: ['M'], host: ['H:C'], review: 'R:H', acc: 'Acc:I',
    tools: [{ name: 'Adobe Photoshop/Firefly', month: '10', year: '2026' }] }, '0.5');
  assert.deepEqual(core.art50Hint(n), { visible: true, open: true, icon: 'partial' });
});

test('free text: no <>, no trailing full stop, 120 characters', () => {
  assert.equal(core.cleanFreeText('  Bild auf <b>Folie</b> 12. '), 'Bild auf bFolie/b 12');
  assert.equal(core.cleanFreeText('Rohfassung...'), 'Rohfassung');
  assert.equal(core.cleanFreeText('x'.repeat(200)).length, 120);
  assert.equal(core.cleanFreeText(null), '');
});

test('tool names: forbidden characters are stripped while typing', () => {
  assert.equal(core.stripToolChars('GPT (5); test|x, y'), 'GPT 5 testx y');
  assert.ok(core.isValidToolName('Academic Cloud/Llama 3.3 70B'));
  assert.ok(!core.isValidToolName(' GPT'));
  assert.ok(!core.isValidToolName('GPT;5'));
});

test('ORCID and ROR are recognised', () => {
  const segs = core.idSegments('Dr. Ann O’Neil, 0000-0002-1825-0097, https://ror.org/05qpz1x62');
  assert.deepEqual(segs.filter(s => s.type !== 'text').map(s => [s.type, s.url]), [
    ['orcid', 'https://orcid.org/0000-0002-1825-0097'],
    ['ror', 'https://ror.org/05qpz1x62'],
  ]);
  assert.equal(core.stripIds('Dr. Ann O’Neil, 0000-0002-1825-0097'), 'Dr. Ann O’Neil');
  assert.equal(core.stripIds('Universität Koblenz (05qpz1x62)'), 'Universität Koblenz');
});

test('hosting helper follows the DFG variants: who operates the system?', () => {
  assert.equal(core.hostHelperResult({ device: true }), 'H:L');
  assert.equal(core.hostHelperResult({ device: false, operator: 'institution' }), 'H:I');
  assert.equal(core.hostHelperResult({ device: false, operator: 'company', contract: 'yes' }), 'H:C');
  assert.equal(core.hostHelperResult({ device: false, operator: 'company', contract: 'no' }), 'H:C!');
  assert.equal(core.hostHelperResult({ device: false, operator: 'company', contract: 'unknown' }), 'H:C!');
  assert.equal(core.hostHelperResult({ device: false, operator: 'company' }), null);
  assert.equal(core.hostHelperResult({}), null);
  assert.equal(core.hostHelperNext({}), 'device');
  assert.equal(core.hostHelperNext({ device: true }), null);
  assert.equal(core.hostHelperNext({ device: false }), 'operator');
  assert.equal(core.hostHelperNext({ device: false, operator: 'institution' }), null);
  assert.equal(core.hostHelperNext({ device: false, operator: 'company' }), 'contract');
});

test('no option description says "rephrased"', () => {
  const { SPEC, buildSpec05 } = require('../js/spec.js');
  for (const spec of [SPEC['0.5'], buildSpec05(false)]) {
    for (const lang of ['de', 'en']) {
      for (const [code, o] of Object.entries(spec.i18n[lang].opt)) {
        assert.ok(!/umformul|rephras/i.test(o.dsc), `${lang} ${code}: ${o.dsc}`);
      }
    }
  }
});

test('groups.stamm covers A, S, M and G exactly once', () => {
  const { SPEC, buildSpec05 } = require('../js/spec.js');
  const members = spec => Object.values(spec.groups.stamm).flat().sort().join('');
  assert.equal(members(SPEC['0.5']), 'AGMS');
  assert.equal(members(buildSpec05(false)), 'AGS');
  assert.equal(SPEC['0.5'].groups.host, undefined);
});

test('no service with a server hint suggests Local', () => {
  const { SERVICES } = require('../js/services.js');
  for (const g of SERVICES) {
    for (const s of g.items) {
      if (s.host === 'H:L') assert.ok(!/server/i.test(`${s.hint?.de} ${s.hint?.en}`), `${s.name}: ${s.hint?.de}`);
    }
  }
});

test('sentence names no tools; the tools are in the code', () => {
  const s = G({ tools: [{ name: 'GPT-5', month: '05', year: '2026' }] });
  const n = core.normalize(s, '0.5');
  for (const lang of ['de', 'en']) assert.ok(!core.buildSentence(n, lang, 'text', '0.5').includes('GPT-5'));
  assert.ok(core.buildCode(s, '0.5').includes('(GPT-5, 05/2026)'));
});

test('a generic name without model ("Name/") is coded without the slash', () => {
  const s = G({ tools: [{ name: 'Ollama/', month: '05', year: '2026' }] });
  assert.ok(core.buildCode(s, '0.5').endsWith('(Ollama, 05/2026)'));
});

test('host suggestion is the union of the services’ hosts', () => {
  assert.deepEqual(core.suggestedHosts([{ host: 'H:I' }, { host: 'H:C' }, { host: 'H:I' }, {}]), ['H:I', 'H:C']);
});

test('spec without M has no M texts', () => {
  const spec = buildSpec05(false);
  assert.equal(spec.order.stamm.join(''), 'NASG');
  assert.equal(spec.i18n.de.opt.M, undefined);
  assert.equal(spec.i18n.de.opt.G.lbl, 'Generative');
  assert.equal(spec.i18n.de.opt.G.dsc, 'Inhalt neu erzeugt oder Ihr Werk verändert');
  assert.equal(spec.i18n.en.opt.G.dsc, 'New content generated or your work changed');
  assert.ok(spec.i18n.de.page.cases.every(([, code]) => code !== 'M'));
  assert.deepEqual(spec.groups.stamm, { none: ['A', 'S'], ai: ['G'] });
  assert.equal(spec.i18n.de.helper.q2, undefined);
  assert.equal(spec.warnings[1].trigger, 'G + R:N');
});
