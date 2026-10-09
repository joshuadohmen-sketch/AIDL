// Link parameters: old 0.4 links (E.4) and hostile input (E.2) at the logic level.
// The DOM side (nothing rendered as HTML) is checked in the browser, see README.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/label-core.js');

const from = q => core.fromParams(new URLSearchParams(q));

const PAYLOADS = [
  '<img src=x onerror=alert(1)>',
  '"><svg onload=alert(1)>',
  'javascript:alert(1)',
  '</script><script>alert(1)</script>',
  '%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E',
  '&#60;img src=x onerror=alert(1)&#62;',
];

test('old 0.4 links (E.4) still parse', () => {
  assert.deepEqual(from('s=N&a=Acc%3AI').state.acc, 'Acc:I');
  const one = from('s=G&h=H%3AC&r=R%3AH&a=Acc%3AI&t=Claude+Opus+4.6&d=04%2F2026');
  assert.equal(one.v, '0.4');
  assert.deepEqual(one.state.tools, [{ name: 'Claude Opus 4.6', date: '04/2026' }]);
  const two = from('s=G&h=H%3AC&r=R%3AH&a=Acc%3AI&t=Ollama%2FLlama+4%7CClaude+Opus+4.6&d=03%2F2026%7C04%2F2026');
  assert.deepEqual(two.state.tools, [{ name: 'Ollama/Llama 4', date: '03/2026' }, { name: 'Claude Opus 4.6', date: '04/2026' }]);
});

test('0.4: N/Acc:N links are shown, flagged as legacy', () => {
  const r = from('s=N&a=Acc%3AN');
  assert.ok(r);
  assert.equal(r.legacyNAccN, true);
  assert.equal(from('v=0.5&s=N&a=Acc%3AN'), null);
});

test('0.4: tools without date and empty date segments are allowed', () => {
  const r = from('s=G&h=H%3AC&r=R%3AH&a=Acc%3AI&t=Ollama%7CClaude&d=%7C04%2F2026');
  assert.deepEqual(r.state.tools, [{ name: 'Ollama', date: '' }, { name: 'Claude', date: '04/2026' }]);
  assert.deepEqual(from('s=G&h=H%3AC&r=R%3AH&a=Acc%3AI&t=Ollama').state.tools, [{ name: 'Ollama', date: '' }]);
});

test('0.4: long tool names are shortened to 200 characters for display', () => {
  const r = from('s=G&h=H%3AC&r=R%3AH&a=Acc%3AI&t=' + 'x'.repeat(300));
  assert.equal(r.state.tools[0].name, 'x'.repeat(200) + '…');
});

test('invalid codes are rejected', () => {
  assert.equal(from('s=X&h=foo&r=bar&a=baz'), null);
  assert.equal(from('v=9.9&s=G&h=H%3AC&r=R%3AH&a=Acc%3AI'), null);
  assert.equal(from('s=G&a=Acc%3AI'), null);
  assert.equal(from('s=M&h=H%3AC&r=R%3AH&a=Acc%3AI'), null); // M does not exist in 0.4
});

test('payloads in code parameters are rejected', () => {
  for (const key of ['s', 'h', 'r', 'a']) {
    for (const p of PAYLOADS) {
      const params = new URLSearchParams({ v: '0.5', s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: 'GPT-5', d: '05/2026' });
      params.set(key, p);
      assert.equal(core.fromParams(params), null, `${key}=${p}`);
      params.delete('v');
      assert.equal(core.fromParams(params), null, `0.4 ${key}=${p}`);
    }
  }
});

test('payloads in t and d: 0.5 rejects, 0.4 keeps them as plain data', () => {
  for (const p of PAYLOADS) {
    const p05 = new URLSearchParams({ v: '0.5', s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: p, d: '05/2026' });
    assert.equal(core.fromParams(p05), null, `0.5 t=${p}`);
    const d05 = new URLSearchParams({ v: '0.5', s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: 'GPT-5', d: p });
    assert.equal(core.fromParams(d05), null, `0.5 d=${p}`);
    const d04 = core.fromParams(new URLSearchParams({ s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: 'GPT-5', d: p }));
    assert.equal(d04.state.tools[0].date, '', `0.4 d=${p}`);
    const t04 = core.fromParams(new URLSearchParams({ s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: p }));
    assert.equal(typeof t04.state.tools[0].name, 'string');
  }
});

test('payloads in p and rp lose < and > and stay text', () => {
  for (const p of PAYLOADS) {
    const r = core.fromParams(new URLSearchParams({ v: '0.5', s: 'G', h: 'H:C', r: 'R:H', a: 'Acc:I', t: 'GPT-5', d: '05/2026', p, rp: p }));
    assert.ok(r);
    assert.ok(!/[<>]/.test(r.state.p) && !/[<>]/.test(r.state.rp), p);
  }
  const long = core.fromParams(new URLSearchParams({ v: '0.5', s: 'N', a: 'Acc:I', rp: 'y'.repeat(300) }));
  assert.equal(long.state.rp.length, 120);
});
