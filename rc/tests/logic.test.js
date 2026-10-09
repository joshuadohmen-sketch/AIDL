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

test('decision helper (A.1.4)', () => {
  assert.equal(core.helperResult({ q1: false, q1b: true }, true), 'S');
  assert.equal(core.helperResult({ q1: false, q1b: false }, true), 'N');
  assert.equal(core.helperResult({ q1: true, q2: true, q2b: true }, true), 'S');
  assert.equal(core.helperResult({ q1: true, q2: true, q2b: false }, true), 'A');
  assert.equal(core.helperResult({ q1: true, q2: false, q3: 'M' }, true), 'M');
  assert.equal(core.helperResult({ q1: true, q2: false, q3: 'G' }, true), 'G');
  assert.equal(core.helperResult({ q1: true, q2: false, q3: 'both' }, true), 'G');
  assert.equal(core.helperResult({ q1: true, q2: false }, false), 'G');
  assert.equal(core.helperResult({ q1: true, q2: false }, true), null);
  assert.equal(core.helperNext({ q1: true, q2: false }, true), 'q3');
  assert.equal(core.helperNext({ q1: true, q2: false }, false), null);
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

test('host suggestion is the union of the services’ hosts', () => {
  assert.deepEqual(core.suggestedHosts([{ host: 'H:I' }, { host: 'H:C' }, { host: 'H:I' }, {}]), ['H:I', 'H:C']);
});

test('spec without M has no M texts', () => {
  const spec = buildSpec05(false);
  assert.equal(spec.order.stamm.join(''), 'NASG');
  assert.equal(spec.i18n.de.opt.M, undefined);
  assert.equal(spec.i18n.de.opt.G.lbl, 'KI-Inhalte im Werk');
  assert.equal(spec.warnings[1].trigger, 'G + R:N');
});
