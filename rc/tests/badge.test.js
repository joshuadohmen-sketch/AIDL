// Badge 0.5 (Annex B): neutral, words under the circles, accessible name and description
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/label-core.js');
const { SPEC } = require('../js/spec.js');
const { ICONS, buildBadgeSVG } = require('../js/icons.js');
const { EXAMPLES } = require('../js/examples.js');

const t = SPEC['0.5'].i18n.de;

test('every code has a pictogram and a badge word', () => {
  for (const dim of ['stamm', 'host', 'review', 'acc']) {
    for (const code of SPEC['0.5'].order[dim]) {
      assert.ok(ICONS[code], `icon ${code}`);
      assert.ok(t.badge[code] && SPEC['0.5'].i18n.en.badge[code], `word ${code}`);
    }
  }
});

test('badge is neutral and carries title, description and metadata', () => {
  for (const ex of EXAMPLES) {
    const n = core.normalize(ex.state, '0.5');
    const code = core.buildCode(ex.state, '0.5');
    const sentence = core.buildSentence(n, 'de', 'text', '0.5');
    const svg = buildBadgeSVG(n, { version: '0.5', words: t.badge, title: code, desc: sentence, url: 'https://example.org/x?a=1&b=2' });
    assert.ok(!/c61a27|#f00|red/i.test(svg), `${ex.id}: warning colour`);
    assert.ok(!/>EU</.test(svg) && !/>AI</.test(svg), `${ex.id}: AI/EU sign`);
    assert.ok(svg.includes('role="img"') && /aria-labelledby="dtl-badge-\d+-t dtl-badge-\d+-d"/.test(svg), ex.id);
    assert.ok(svg.includes(`<desc id=`) && svg.includes(sentence.replace(/&/g, '&amp;').replace(/"/g, '&quot;')), `${ex.id}: desc`);
    assert.ok(svg.includes('<metadata>') && svg.includes('a=1&amp;b=2'), `${ex.id}: metadata escaped`);
    const words = n.stamm === 'N' ? [n.stamm, n.acc] : [n.stamm, n.host, n.review, n.acc];
    for (const c of words) assert.ok(svg.includes(`>${t.badge[c]}<`), `${ex.id}: word for ${c}`);
  }
});

test('N badge has no AI pictogram', () => {
  const svg = buildBadgeSVG({ stamm: 'N', acc: 'Acc:I' }, { version: '0.5', words: t.badge, title: 'AI-DTL 0.5: N/Acc:I' });
  assert.ok(!svg.includes(ICONS.G) && !svg.includes(ICONS.A));
  assert.ok(svg.includes('>keine KI<'));
  assert.ok(svg.includes('>N<'), 'code under the word');
});

test('circles keep at least 84 px distance so words do not overlap', () => {
  const svg = buildBadgeSVG({ stamm: 'G', host: 'H:I', review: 'R:HM', acc: 'Acc:O' }, { version: '0.5', words: t.badge });
  const xs = [...svg.matchAll(/<circle cx="([\d.]+)" cy="[\d.]+" r="22"/g)].map(m => +m[1]);
  for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= 84, `gap ${xs[i] - xs[i - 1]}`);
});

test('unknown codes never reach the SVG', () => {
  const svg = buildBadgeSVG({ stamm: '<img src=x>', host: 'H:C', review: 'R:H', acc: 'Acc:I' }, { version: '0.5' });
  assert.ok(!svg.includes('<img'));
  assert.equal(buildBadgeSVG({ stamm: 'X' }, {}), '');
});
