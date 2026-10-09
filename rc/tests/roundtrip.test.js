// Round trips on the normalized state (Annex E.1): code ↔ state and link ↔ state
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/label-core.js');
const { SPEC, buildSpec05 } = require('../js/spec.js');
const { EXAMPLES } = require('../js/examples.js');

for (const enableM of [true, false]) {
  const spec = buildSpec05(enableM);
  const specs = { '0.4': SPEC['0.4'], '0.5': spec };
  const stateOf = ex => ({ ...ex.state, stamm: (!enableM && ex.noM) ? ex.noM : ex.state.stamm });

  test(`examples produce the catalogue codes (ENABLE_M=${enableM})`, () => {
    for (const ex of EXAMPLES) {
      const expected = (!enableM && ex.codeNoM) ? ex.codeNoM : ex.code;
      assert.equal(core.buildCode(stateOf(ex), spec), expected, ex.id);
    }
  });

  test(`parseCode(buildCode(s)) equals normalized s (ENABLE_M=${enableM})`, () => {
    for (const ex of EXAMPLES) {
      const s = stateOf(ex);
      const parsed = core.parseCode(core.buildCode(s, spec), { specs });
      assert.deepEqual(parsed, core.normalize(s, spec), ex.id);
    }
  });

  test(`fromParams(toParams(s)) equals normalized s (ENABLE_M=${enableM})`, () => {
    for (const ex of EXAMPLES) {
      const s = { ...stateOf(ex), p: 'Rohfassung.', rp: 'Referat Hochschulkommunikation' };
      const back = core.fromParams(new URLSearchParams(core.toParams(s, spec).toString()), { specs });
      assert.ok(back, ex.id);
      assert.deepEqual(back.state, core.normalize(s, spec), ex.id);
    }
  });
}

test('0.4 round trip keeps the old link format', () => {
  const s = { stamm: ['G'], host: ['H:L', 'H:C'], review: 'R:H', acc: 'Acc:I',
    tools: [{ name: 'Ollama/Llama 4', month: '03', year: '2026' }, { name: 'Claude Opus 4.6', month: '04', year: '2026' }] };
  const params = core.toParams(s, '0.4');
  assert.equal(params.get('v'), null);
  assert.equal(params.get('t'), 'Ollama/Llama 4|Claude Opus 4.6');
  assert.equal(params.get('d'), '03/2026|04/2026');
  const back = core.fromParams(params);
  assert.equal(back.v, '0.4');
  assert.deepEqual(back.state, core.normalize(s, '0.4'));
  assert.equal(core.buildCode(s, '0.4'), 'AI-DTL 0.4: G/H:C;R:H;Acc:I (Ollama/Llama 4, 03/2026; Claude Opus 4.6, 04/2026)');
});

test('example URL from section 3 of the plan', () => {
  const s = { stamm: ['G'], host: ['H:C'], review: 'R:H', acc: 'Acc:O',
    tools: [{ name: 'Microsoft 365 Copilot', month: '10', year: '2026' }], p: 'Rohfassung', rp: 'Referat Hochschulkommunikation' };
  assert.equal(core.buildURL(s, '0.5', 'https://joshuadohmen-sketch.github.io/AIDL/'),
    'https://joshuadohmen-sketch.github.io/AIDL/label/?v=0.5&s=G&h=H%3AC&r=R%3AH&a=Acc%3AO&t=Microsoft+365+Copilot&d=10%2F2026&p=Rohfassung&rp=Referat+Hochschulkommunikation');
});
