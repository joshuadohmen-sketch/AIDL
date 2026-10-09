// Export snapshots for the six reference states (Annex E.3) and rules for the spoken text.
// The snapshot file must be approved by Joshua once; regenerate it only on purpose:
//   UPDATE_SNAPSHOTS=1 node --test rc/tests/exports.test.js
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../js/label-core.js');
const { SITE_BASE } = require('../js/spec.js');
const { EXAMPLES } = require('../js/examples.js');

const SNAP = path.join(__dirname, 'snapshots', 'exports.json');
const FORMATS = ['text', 'html', 'md', 'latex', 'link', 'speech'];
const ex = id => EXAMPLES.find(e => e.id === id).state;

const STATES = {
  'D.1': ex('D.1'),
  'D.8': ex('D.8'),
  'D.9': ex('D.9'),
  'D.11-image': ex('D.11'),
  'D.12': ex('D.12'),
  special: {
    stamm: ['G'], host: ['H:C'], review: 'R:H', acc: 'Acc:I',
    tools: [{ name: 'R&D_Bot "v2" 50% #1', month: '05', year: '2026' }],
    p: 'Rohfassung', rp: 'Dr. Ann_O\'Neil, 0000-0002-1825-0097',
  },
};

function generate() {
  const out = {};
  for (const [name, state] of Object.entries(STATES)) {
    for (const lang of ['de', 'en']) {
      for (const fmt of FORMATS) {
        out[`${name} ${lang} ${fmt}`] = core.buildExport(fmt, state, { v: '0.5', lang, base: SITE_BASE });
      }
    }
  }
  return out;
}

test('export snapshots (E.3)', () => {
  const actual = generate();
  if (process.env.UPDATE_SNAPSHOTS || !fs.existsSync(SNAP)) {
    fs.writeFileSync(SNAP, JSON.stringify(actual, null, 2) + '\n');
  }
  const expected = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
  assert.deepEqual(actual, expected);
});

test('spoken text has no code, URL, identifiers or tools', () => {
  for (const [name, state] of Object.entries(STATES)) {
    for (const lang of ['de', 'en']) {
      const s = core.buildExport('speech', state, { v: '0.5', lang, base: SITE_BASE });
      assert.ok(!/AI-DTL|https?:|\/H:|Acc:/.test(s), `${name} ${lang}: ${s}`);
      assert.ok(!/\d{4}-\d{4}-\d{4}-\d{3}[\dX]/.test(s), `${name} ${lang}: ORCID in ${s}`);
      for (const t of state.tools || []) assert.ok(!s.includes(t.name), `${name} ${lang}: tool in ${s}`);
    }
  }
});

test('special characters are masked in every format', () => {
  const s = STATES.special;
  const latex = core.buildExport('latex', s, { v: '0.5', lang: 'de', base: SITE_BASE });
  assert.ok(latex.startsWith('% benötigt \\usepackage{hyperref}\n'));
  assert.ok(latex.includes('R\\&D\\_Bot \\textquotedbl{}v2\\textquotedbl{} 50\\% \\#1'));
  assert.ok(latex.includes('\\href{https://orcid.org/0000-0002-1825-0097}{0000-0002-1825-0097}'));
  assert.ok(latex.includes('Ann\\_O\'Neil'));
  // after removing escaped specials no bare % # & _ may remain in the body line (URL included)
  assert.ok(!/[%#&_]/.test(latex.split('\n')[1].replace(/\\[%#&_]/g, '')), 'unescaped LaTeX special');
  assert.ok(latex.includes('R\\%26D\\%5FBot'));

  const html = core.buildExport('html', s, { v: '0.5', lang: 'de', base: SITE_BASE });
  assert.ok(html.includes('R&amp;D_Bot &quot;v2&quot; 50% #1'));
  assert.ok(html.includes('content="AI-DTL 0.5: G/H:C;R:H;Acc:I (R&amp;D_Bot &quot;v2&quot; 50% #1, 05/2026)"'));
  assert.ok(html.includes('<a href="https://orcid.org/0000-0002-1825-0097">0000-0002-1825-0097</a>'));
  assert.ok(html.includes('lang="de"'));

  const md = core.buildExport('md', s, { v: '0.5', lang: 'de', base: SITE_BASE });
  assert.ok(md.includes('Ann\\_O\'Neil'));
  assert.ok(md.includes('[`AI-DTL 0.5: G/H:C;R:H;Acc:I (R&D_Bot "v2" 50% #1, 05/2026)`]('));
});

test('Markdown code span picks a longer fence when the code contains backticks', () => {
  assert.equal(core.mdCodeSpan('a`b'), '``a`b``');
  assert.equal(core.mdCodeSpan('`a'), '`` `a ``');
});
